import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-waiting-for-acceptance',
  templateUrl: './waiting-for-acceptance.component.html',
  styleUrl: './waiting-for-acceptance.component.css'
})
export class WaitingForAcceptanceComponent {

  users: any[] = []; // Declare users as an array
  

  constructor(private http: HttpClient,
    private authService: AuthService,
    private router: Router, // Inject the Router service
  ) {}
 
  ngOnInit(): void {
    this.loadUsers(); // Load users when the component initializes
  }

  loadUsers(): void {
    this.authService.getPendingUsers().subscribe(
      (data) => {
        this.users = data;
      },
      (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
      }
    );
  }

  approveUser(user_id: number): void {
    this.authService.approveUser(user_id).subscribe(
      () => {
        this.users = this.users.map(user =>
          user.id === user_id ? { ...user, is_active: true } : user
        );
      },
      (error) => {
        console.error("Erreur lors de l'approbation de l'utilisateur", error);
      }
    );
  }
  rejectUser(user_id: number): void {
    this.http.delete(`/api/users/delete/${user_id}`).subscribe(
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


