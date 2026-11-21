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

  test('the whole story: log in, create a key, use it, see the request in the statistics, disable it', async ({ page, request }) => {
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

    // 4. the request shows up in the statistics page, with its key and its result
    await page.getByRole('link', { name: 'Statistics' }).click();
    await expect(page).toHaveURL(/\/dashboard\/statistics$/);
    const row = page.getByRole('row', { name: new RegExp(keyName) }).first();
    await expect(row).toBeVisible();
    await expect(row).toContainText('200');

    // 5. the administrator disables the key: the service now refuses it
    await page.getByRole('link', { name: 'API Tokens' }).click();
    const keyRow = page.getByRole('row', { name: new RegExp(keyName) });
    await keyRow.getByRole('button', { name: 'Désactiver' }).click();
    await expect(keyRow.getByRole('button', { name: 'Activer' })).toBeVisible();
    const refused = await request.post(`${API_URL}/api/v1/extract`, {
      headers: { 'X-API-Key': apiKey },
      multipart: { file: { name: 'qr.png', mimeType: 'image/png', buffer: readFileSync(QR_IMAGE) } },
    });
    expect(refused.status()).toBe(403);

    // 6. cleanup: the test key is deleted
    page.once('dialog', dialog => dialog.accept());
    await keyRow.getByRole('button', { name: 'Supprimer' }).click();
    await expect(keyRow).toHaveCount(0);
  });
});
