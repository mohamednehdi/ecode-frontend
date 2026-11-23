import { expect, test, Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const API_URL = process.env['API_URL'] ?? 'http://localhost:5000';
const ADMIN_EMAIL = process.env['ADMIN_EMAIL'] ?? '';
const ADMIN_PASSWORD = process.env['ADMIN_PASSWORD'] ?? '';
const QR_IMAGE = path.join(__dirname, 'fixtures', 'qr-hello-e2e.png');     // a QR code whose content is "HELLO-E2E"

async function logIn(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('Email').fill(email);
  await page.getByPlaceholder('Password').fill(password);
  await page.locator('#signin').click();
}

test.describe('free public page (no account)', () => {
  test('reads the code of an uploaded image', async ({ page }) => {
    await page.goto('/');
    await page.locator('#file-upload').setInputFiles(QR_IMAGE);
    await expect(page.getByRole('heading', { name: 'Detected Barcodes:' })).toBeVisible();
    await expect(page.getByText('QRCODE: HELLO-E2E')).toBeVisible();
    await expect(page.getByAltText('Uploaded Image')).toBeVisible();
  });

  test('refuses a file type the service does not read', async ({ page }) => {
    await page.goto('/');
    await page.locator('#file-upload').setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(page.getByText('Format non supporté')).toBeVisible();
  });
});

test.describe('back office (administrator)', () => {
  test('a visitor cannot open the back office', async ({ page }) => {
    await page.goto('/dashboard/api-tokens');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('a wrong password is refused', async ({ page }) => {
    await logIn(page, 'nobody@example.test', 'not-the-password');
    await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('too many wrong passwords lock the address, and the lock says for how long', async ({ page }) => {
    const email = `lock-${Date.now()}@example.test`;                       // an address nobody owns: the lock treats it like a real one
    for (let attempt = 1; attempt <= 5; attempt++) {
      await logIn(page, email, `wrong-${attempt}`);
      await expect(page.getByText('Email ou mot de passe incorrect.')).toBeVisible();
    }
    await logIn(page, email, 'wrong-6');
    await expect(page.getByText(/Trop de tentatives de connexion\. Réessayez dans \d+ minute/)).toBeVisible();
  });

  test('the whole story: log in, create a key, rotate it, use it, find everything in the statistics and the audit log, disable it', async ({ page, request }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, 'ADMIN_EMAIL and ADMIN_PASSWORD are not set');
    const keyName = `E2E key ${Date.now()}`;

    // 1. the administrator logs in and lands on the key page
    await logIn(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(page).toHaveURL(/\/dashboard\/api-tokens$/);

    // 2. creates a key: it is shown once, in a banner
    await page.getByRole('button', { name: '+ Nouvelle clé' }).click();
    await page.locator('#tk-name').fill(keyName);
    await page.locator('form button[type=submit]').click();
    const apiKey = await page.locator('.key-box').inputValue();
    expect(apiKey).toMatch(/^ecode_/);
    await page.getByRole('button', { name: "J'ai copié la clé" }).click();

    // 3. an application uses the key against the web service and gets the code
    const answer = await request.post(`${API_URL}/api/v1/extract`, {
      headers: { 'X-API-Key': apiKey },
      multipart: { file: { name: 'qr.png', mimeType: 'image/png', buffer: readFileSync(QR_IMAGE) } },
    });
    expect(answer.status()).toBe(200);
    const body = await answer.json();
    expect(body.barcodes.map((b: { data: string }) => b.data)).toContain('HELLO-E2E');

    // 3b. the administrator rotates the key with no grace period (the old secret leaked): the old key dies, the new one works
    await page.getByRole('link', { name: 'API Tokens' }).click();
    await page.getByRole('row', { name: new RegExp(keyName) }).getByRole('button', { name: 'Renouveler' }).click();
    await page.locator('#rot-grace').fill('0');
    await page.getByRole('button', { name: 'Renouveler la clé' }).click();
    await expect(page.getByText('L\'ancienne clé ne fonctionne plus.')).toBeVisible();
    const newKey = await page.locator('.key-box').inputValue();
    expect(newKey).toMatch(/^ecode_/);
    expect(newKey).not.toBe(apiKey);
    await page.getByRole('button', { name: "J'ai copié la clé" }).click();
    const upload = () => ({ file: { name: 'qr.png', mimeType: 'image/png', buffer: readFileSync(QR_IMAGE) } });
    expect((await request.post(`${API_URL}/api/v1/extract`, { headers: { 'X-API-Key': apiKey }, multipart: upload() })).status()).toBe(401);
    expect((await request.post(`${API_URL}/api/v1/extract`, { headers: { 'X-API-Key': newKey }, multipart: upload() })).status()).toBe(200);

    // 4. the request shows up in the statistics page, with its key and its result
    await page.getByRole('link', { name: 'Statistics' }).click();
    await expect(page).toHaveURL(/\/dashboard\/statistics$/);
    const row = page.getByRole('row', { name: new RegExp(keyName) }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('200');

    // 4b. every sensitive action is in the audit log, with who did it
    await page.getByRole('link', { name: 'Audit log' }).click();
    await expect(page).toHaveURL(/\/dashboard\/audit$/);
    for (const event of ['Clé créée', 'Clé renouvelée', 'Connexion']) {
      await expect(page.getByRole('row', { name: new RegExp(event) }).first()).toBeVisible();
    }
    await expect(page.getByRole('row', { name: new RegExp(`Clé renouvelée.*${ADMIN_EMAIL}.*${keyName}`) })).toBeVisible();

    // 5. the administrator disables the key: the service now refuses it
    await page.getByRole('link', { name: 'API Tokens' }).click();
    const keyRow = page.getByRole('row', { name: new RegExp(keyName) });
    await keyRow.getByRole('button', { name: 'Désactiver' }).click();
    await expect(keyRow.getByRole('button', { name: 'Activer' })).toBeVisible();
    const refused = await request.post(`${API_URL}/api/v1/extract`, {
      headers: { 'X-API-Key': newKey },
      multipart: { file: { name: 'qr.png', mimeType: 'image/png', buffer: readFileSync(QR_IMAGE) } },
    });
    expect(refused.status()).toBe(403);

    // 6. cleanup: the test key is deleted
    page.once('dialog', dialog => dialog.accept());
    await keyRow.getByRole('button', { name: 'Supprimer' }).click();
    await expect(keyRow).toHaveCount(0);
  });
});
