import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private showSidebar = false;

  setSidebarVisibility(visible: boolean): void {
    this.showSidebar = visible;
  }

  getSidebarVisibility(): boolean {
    return this.showSidebar;
  }
}
