import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {

  users: any[] = []; // Declare users as an array
  

  constructor(private http: HttpClient,
    private authService: AuthService,
    private router: Router, // Inject the Router service
  ) {}
 
  ngOnInit(): void {
    this.loadUsers(); // Load users when the component initializes
    console.log('UsersComponent initialized');

  }

  loadUsers(): void {
    this.authService.getActiveUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    );
  }

  approveUser(userId: number): void {
    this.http.post(`/api/users/approve/${userId}`, {}).subscribe(
      () => {
        this.users = this.users.map(user =>
          user.id === userId ? { ...user, is_active: true } : user
        );
      },
      (error) => {
        console.error("Erreur lors de l'approbation de l'utilisateur", error);
      }
    );
  }

  rejectUser(user_id: number): void {
    this.authService.deleteUser(user_id).subscribe(
      () => {
        this.users = this.users.filter(user => user.id !== user_id);
      },
      (error) => {
        console.error("Erreur lors de la suppression de l'utilisateur", error);
      }
    );
  }

  logout() {
    // Clear session or token
    localStorage.clear(); // or sessionStorage.clear(); if you use sessionStorage
    // Redirect to login page
    this.router.navigate(['/login']);}
}

