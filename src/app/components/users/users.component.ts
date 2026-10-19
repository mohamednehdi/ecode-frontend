import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getActiveUsers().subscribe({
      next: data => this.users = data,
      error: error => console.error('Erreur lors du chargement des utilisateurs', error)
    });
  }

  approveUser(userId: number): void {
    this.authService.approveUser(userId).subscribe({
      next: () => {
        this.users = this.users.map(user => user.id === userId ? { ...user, is_active: true } : user);
      },
      error: error => console.error("Erreur lors de l'approbation de l'utilisateur", error)
    });
  }

  rejectUser(userId: number): void {
    if (!confirm('Supprimer cet utilisateur et tout son historique ?')) return;
    this.authService.deleteUser(userId).subscribe({
      next: () => this.users = this.users.filter(user => user.id !== userId),
      error: error => console.error("Erreur lors de la suppression de l'utilisateur", error)
    });
  }

  logout() {
    this.authService.logout();
  }
}
