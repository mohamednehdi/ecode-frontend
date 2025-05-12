// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class SidebarService {

//   private showSidebar = false;

//   setSidebarVisibility(visible: boolean): void {
//     this.showSidebar = visible;
//   }

//   getSidebarVisibility(): boolean {
//     return this.showSidebar;
//   }
// }

// sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private showSidebarSubject = new BehaviorSubject<boolean>(false);
  showSidebar$ = this.showSidebarSubject.asObservable();

  setSidebarVisibility(visible: boolean): void {
    this.showSidebarSubject.next(visible);
  }
}

