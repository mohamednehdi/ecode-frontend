import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-waiting-for-acceptance',
  templateUrl: './waiting-for-acceptance.component.html',
  styleUrl: './waiting-for-acceptance.component.css'
})
export class WaitingForAcceptanceComponent implements OnInit {

  users: any[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getPendingUsers().subscribe({
      next: data => this.users = data,
      error: error => console.error('Erreur lors du chargement des utilisateurs', error)
    });
  }

  approveUser(userId: number): void {
    this.authService.approveUser(userId).subscribe({
      // Approved users leave the waiting list (they appear in "Users")
      next: () => this.users = this.users.filter(user => user.id !== userId),
      error: error => console.error("Erreur lors de l'approbation de l'utilisateur", error)
    });
  }

  rejectUser(userId: number): void {
    if (!confirm('Refuser et supprimer cette demande ?')) return;
    this.authService.deleteUser(userId).subscribe({
      next: () => this.users = this.users.filter(user => user.id !== userId),
      error: error => console.error("Erreur lors de la suppression de l'utilisateur", error)
    });
  }

  logout() {
    this.authService.logout();
  }
}
