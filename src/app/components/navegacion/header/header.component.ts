import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
  icon: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  userName: string = 'Usuario Demo';
  userEmail: string = 'demo@example.com';
  userRole: string = 'admin';
  searchQuery: string = '';
  showNotifications: boolean = false;
  notifications: Notification[] = [];
  unreadCount: number = 0;
  showUserMenu: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadNotifications();
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('userRole') || 'admin';
    this.userName = localStorage.getItem('userName') || 'Admin';
    this.userEmail = localStorage.getItem('userEmail') || 'demo@example.com';
  }

  loadNotifications(): void {
    // Mock notifications data
    this.notifications = [
      {
        id: 1,
        message: 'Nuevo empleado registrado: María González',
        time: '2024-01-15T10:30:00',
        read: false,
        icon: 'fas fa-user-plus'
      },
      {
        id: 2,
        message: 'Pago procesado exitosamente: $15,000',
        time: '2024-01-15T09:15:00',
        read: false,
        icon: 'fas fa-money-bill-wave'
      },
      {
        id: 3,
        message: 'Gasto registrado: Factura eléctrica $2,500',
        time: '2024-01-15T08:45:00',
        read: true,
        icon: 'fas fa-minus-circle'
      },
      {
        id: 4,
        message: 'Reporte mensual generado automáticamente',
        time: '2024-01-14T16:20:00',
        read: true,
        icon: 'fas fa-file-alt'
      }
    ];
    this.updateUnreadCount();
  }

  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  formatTime(timeString: string): string {
    const time = new Date(timeString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.updateUnreadCount();
  }

  clearAllNotifications(): void {
    this.notifications = [];
    this.updateUnreadCount();
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.updateUnreadCount();
  }

  onSearchSubmit(): void {
    if (this.searchQuery.trim()) {
      console.log('Búsqueda:', this.searchQuery);
      // Aquí implementarías la lógica de búsqueda
      this.searchQuery = '';
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
