import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router, provideRouter } from '@angular/router';

import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { API_URL } from './api.config';

describe('AppComponent (page shell: top bar, menu, logout)', () => {
  let component: AppComponent;
  let router: Router;
  let user: UserService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],            // the shell uses Material icons and router links: not what is tested here
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '**', children: [] }])]
    }).compileComponents();
    component = TestBed.createComponent(AppComponent).componentInstance;
    router = TestBed.inject(Router);
    user = TestBed.inject(UserService);
    component.ngOnInit();
  });
  afterEach(() => localStorage.clear());

  it('links to the interactive documentation of the web service', () => {
    expect(component.apiDocsUrl).toBe(`${API_URL}/api/docs/`);
  });

  it('shows the full layout on normal pages and hides it on the login and password-reset pages', async () => {
    for (const url of ['/login', '/request-reset-password', '/verify-code', '/reset-password']) {
      await router.navigateByUrl(url);
      expect(component.showLayout).withContext(url).toBeFalse();
    }
    await router.navigateByUrl('/dashboard/statistics');
    expect(component.showLayout).toBeTrue();
  });

  it('follows the administrator flag and the name of the user', () => {
    expect(component.isAdmin).toBeFalse();
    user.setUser({ role: 'admin', username: 'Ada' });
    expect(component.isAdmin).toBeTrue();
    expect(component.username).toBe('Ada');
    user.clearUser();
    expect(component.isAdmin).toBeFalse();
  });

  it('opens and closes the menu of the user, and closes it on a click elsewhere', fakeAsync(() => {
    component.toggleDropdown();
    expect(component.dropdownOpen).toBeTrue();
    component.handleClickOutside({ target: document.body } as unknown as MouseEvent);
    expect(component.dropdownOpen).toBeFalse();

    component.dropdownOpen = true;
    const inside = document.createElement('div');
    inside.className = 'user-info';
    component.handleClickOutside({ target: inside } as unknown as MouseEvent);
    expect(component.dropdownOpen).toBeTrue();                       // a click inside the menu keeps it open

    component.closeDropdown();
    tick(200);
    expect(component.dropdownOpen).toBeFalse();
  }));

  it('collapses and expands the sidebar', () => {
    component.toggleSidebar();
    expect(component.isSidebarCollapsed).toBeTrue();
    component.toggleSidebar();
    expect(component.isSidebarCollapsed).toBeFalse();
  });

  it('logs out through the auth service (revokes the token on the server)', () => {
    spyOn(TestBed.inject(AuthService), 'logout');
    component.logout();
    expect(TestBed.inject(AuthService).logout).toHaveBeenCalled();
    TestBed.inject(HttpTestingController).verify();
  });
});
