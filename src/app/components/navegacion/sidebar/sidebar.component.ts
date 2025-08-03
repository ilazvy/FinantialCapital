import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
  expanded?: boolean;
  visible?: boolean;
  roles?: string[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  userRole: string = '';
  isCollapsed: boolean = false;
  activeRoute: string = '';
  
  menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.initializeMenu();
    this.trackRouteChanges();
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('userRole') || 'admin';
  }

  initializeMenu(): void {
    this.menuItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: 'fas fa-tachometer-alt',
        route: '/dashboard',
        roles: ['admin', 'employee']
      },
      {
        id: 'admin-panel',
        label: 'Panel Admin',
        icon: 'fas fa-chart-bar',
        route: '/admin-panel',
        roles: ['admin']
      },
      {
        id: 'forms',
        label: 'Formularios',
        icon: 'fas fa-file-alt',
        route: '/forms',
        roles: ['admin'],
        children: [
          {
            id: 'expenses-form',
            label: 'Registrar Gastos',
            icon: 'fas fa-minus-circle',
            route: '/formulario-gastos'
          },
          {
            id: 'income-form',
            label: 'Registrar Ingresos',
            icon: 'fas fa-plus-circle',
            route: '/formulario-ingresos'
          },
          {
            id: 'payment-form',
            label: 'Realizar Pagos',
            icon: 'fas fa-money-bill-wave',
            route: '/formulario-pago'
          },
          {
            id: 'finiquito-form',
            label: 'Finiquito / Indemnización',
            icon: 'fas fa-hand-holding-usd',
            route: '/formulario-finiquito'
          }
        ]
      },
      {
        id: 'employees',
        label: 'Empleados',
        icon: 'fas fa-users',
        route: '/employee-registration',
        roles: ['admin']
      },
      {
        id: 'payroll',
        label: 'Nómina',
        icon: 'fas fa-money-bill-wave',
        route: '/sueldos',
        roles: ['admin', 'employee']
      },
      {
        id: 'calculators',
        label: 'Calculadoras',
        icon: 'fas fa-calculator',
        route: '/calculadora-sueldo',
        roles: ['admin', 'employee'],
        children: [
          {
            id: 'salary-calc',
            label: 'Salario',
            icon: 'fas fa-dollar-sign',
            route: '/calculadora-salario'
          },
          {
            id: 'tax-calc',
            label: 'Impuestos',
            icon: 'fas fa-percentage',
            route: '/calculadora-impuestos'
          },
          {
            id: 'severance-calc',
            label: 'Indemnizaciones',
            icon: 'fas fa-hand-holding-usd',
            route: '/calculadora-indemnizaciones'
          },
          {
            id: 'severance-calc',
            label: 'Seguro Social',
            icon: 'fas fa-file-medical',
            route: '/calculadora-nss'
          }
        ]
      },
      // {
      //   id: 'reports',
      //   label: 'Reportes',
      //   icon: 'fas fa-chart-bar',
      //   route: '/reports',
      //   roles: ['admin'],
      //   badge: 'Nuevo',
      //   badgeColor: 'success'
      // },
      // {
      //   id: 'settings',
      //   label: 'Configuración',
      //   icon: 'fas fa-cog',
      //   route: '/settings',
      //   roles: ['admin']
      // }
    ];
  }

  trackRouteChanges(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeRoute = event.url;
        this.updateActiveMenu();
      });
  }

  updateActiveMenu(): void {
    this.menuItems.forEach(item => {
      item.expanded = this.isRouteActive(item.route);
      if (item.children) {
        item.children.forEach(child => {
          if (this.isRouteActive(child.route)) {
            item.expanded = true;
          }
        });
      }
    });
  }

  isRouteActive(route: string): boolean {
    return this.activeRoute === route || this.activeRoute.startsWith(route + '/');
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMenuItem(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    } else {
      this.navigateTo(item.route);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => item.visible !== false);
  }

  getBadgeColor(color: string): string {
    const colors = {
      'success': 'var(--success-color)',
      'warning': 'var(--warning-color)',
      'danger': 'var(--danger-color)',
      'info': 'var(--info-color)'
    };
    return colors[color as keyof typeof colors] || 'var(--accent-color)';
  }

  onMenuItemClick(item: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggleMenuItem(item);
  }

  onChildItemClick(child: MenuItem, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.navigateTo(child.route);
  }
}
