import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { EmployeeService } from '../../services/employee.service';
import { FinancialService } from '../../services/financial.service';
import { PaymentService } from '../../services/payment.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Métodos para cargar datos reales
  loadRecentActivities(): void {
    this.loadingActivities = true;
    this.dashboardService.getRecentActivity().subscribe({
      next: (data: any) => {
        this.recentActivities = [];
        (data.employees || []).forEach((e: any) => this.recentActivities.push({
          message: `Nuevo empleado registrado: ${e.firstName} ${e.lastName}`,
          time: e.hireDate || '',
          color: 'success',
          icon: 'fas fa-user-plus'
        }));
        (data.payments || []).forEach((p: any) => this.recentActivities.push({
          message: `Pago procesado: $${p.amount} - ${p.employeeName || ''}`,
          time: p.paymentDate || '',
          color: 'primary',
          icon: 'fas fa-money-bill-wave'
        }));
        (data.expenses || []).forEach((g: any) => this.recentActivities.push({
          message: `Gasto registrado: $${g.amount} - ${g.description}`,
          time: g.expenseDate || '',
          color: 'danger',
          icon: 'fas fa-minus-circle'
        }));
        (data.incomes || []).forEach((i: any) => this.recentActivities.push({
          message: `Ingreso recibido: $${i.amount} - ${i.description}`,
          time: i.incomeDate || '',
          color: 'success',
          icon: 'fas fa-plus-circle'
        }));
        (data.severancePayments || []).forEach((f: any) => this.recentActivities.push({
          message: `Finiquito registrado: $${f.amount} - ${f.employeeName || ''}`,
          time: f.paymentDate || '',
          color: 'warning',
          icon: 'fas fa-file-invoice-dollar'
        }));
        this.recentActivities.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
        this.loadingActivities = false;
      },
      error: () => { this.loadingActivities = false; }
    });
  }

  userRole: string = '';
  userName: string = 'Usuario Demo';
  currentDate: Date = new Date();
  
  // Statistics
  stats = {
    totalEmployees: 45,
    totalExpenses: 125000,
    totalIncome: 450000,
    monthlyPayroll: 180000
  };

  // Recent Activities
  recentActivities: any[] = [];
  loadingActivities = false;

  // Chart Data
  monthlyData: any[] = [];
  expenseDistribution: any[] = [];
  employeeGrowth: any[] = [];
  efficiencyData: any[] = [];

  get maxIncome(): number {
    return this.monthlyData.length > 0 ? Math.max(...this.monthlyData.map(d => Number(d.income))) : 0;
  }

  get maxExpenses(): number {
    return this.monthlyData.length > 0 ? Math.max(...this.monthlyData.map(d => Number(d.expenses))) : 0;
  }

  get maxEmployees(): number {
    return this.employeeGrowth.length > 0 ? Math.max(...this.employeeGrowth.map(d => Number(d.count))) : 0;
  }

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private employeeService: EmployeeService,
    private financialService: FinancialService,
    private paymentService: PaymentService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadingService.showLoading();
    this.loadUserInfo();
    this.checkAuthentication();
    this.loadDashboardData();
    this.loadRecentActivities();
    this.loadFinancialSummary();
    setTimeout(() => {
      this.loadingService.hide();
    }, 1000);
  }

  loadFinancialSummary(): void {
    this.dashboardService.getFinancialSummary().subscribe({
      next: (data: any) => {
        this.monthlyData = (data.monthlyIncome as any[]).map((inc: any, idx: number) => ({
          month: inc.month,
          income: inc.income,
          expenses: data.monthlyExpenses[idx]?.expenses || 0
        }));
        this.expenseDistribution = data.expenseDistribution || [];
        this.employeeGrowth = data.employeeGrowth || [];
        this.efficiencyData = data.efficiencyData || [];
      }
    });
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('userRole') || 'admin';
    this.userName = localStorage.getItem('userName') || 'Administrador';
  }

  checkAuthentication(): void {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'admin' && userRole !== 'employee')) {
      this.router.navigate(['/login']);
    }
  }

  getGreeting(): string {
    const hour = this.currentDate.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  getRoleDisplayName(): string {
    return this.userRole === 'admin' ? 'Administrador' : 'Empleado';
  }

  loadDashboardData(): void {
    // Load all stats from dashboard API
    this.dashboardService.getDashboardStats().subscribe({
      next: (dashboardStats) => {
        this.stats.totalEmployees = dashboardStats.totalEmployees;
        this.stats.totalIncome = dashboardStats.totalIncome;
        this.stats.totalExpenses = dashboardStats.totalExpenses;
        this.stats.monthlyPayroll = dashboardStats.monthlyPayroll;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Keep using mock data if API fails
        this.loadFallbackStats();
      }
    });
  }

  loadFallbackStats(): void {
    // Load individual stats as fallback
    this.loadEmployeeStats();
    this.loadFinancialStats();
  }

  loadEmployeeStats(): void {
    this.employeeService.getEmployeeCount().subscribe({
      next: (count) => {
        this.stats.totalEmployees = count;
      },
      error: (error) => {
        console.error('Error loading employee count:', error);
        // Keep using mock data if API fails
      }
    });
  }

  loadFinancialStats(): void {
    // Load total income
    this.financialService.getTotalIncome().subscribe({
      next: (totalIncome) => {
        this.stats.totalIncome = totalIncome;
      },
      error: (error) => {
        console.error('Error loading total income:', error);
      }
    });

    // Load total expenses
    this.financialService.getTotalExpenses().subscribe({
      next: (totalExpenses) => {
        this.stats.totalExpenses = totalExpenses;
      },
      error: (error) => {
        console.error('Error loading total expenses:', error);
      }
    });

    // Calculate monthly payroll (simplified)
    this.stats.monthlyPayroll = this.stats.totalEmployees * 15000; // Average salary
  }

  getQuickActionsForRole(): any[] {
    if (this.userRole === 'admin') {
      return [
        {
          title: 'Registrar Gasto',
          description: 'Agregar nuevo gasto al sistema',
          icon: 'fas fa-minus-circle',
          route: '/formulario-gastos',
          color: 'danger'
        },
        {
          title: 'Registrar Ingreso',
          description: 'Agregar nuevo ingreso al sistema',
          icon: 'fas fa-plus-circle',
          route: '/formulario-ingresos',
          color: 'success'
        },
        {
          title: 'Realizar Pago',
          description: 'Pagar a empleado o proveedor',
          icon: 'fas fa-money-bill-wave',
          route: '/formulario-pago',
          color: 'primary'
        },
        {
          title: 'Gestionar Empleados',
          description: 'Administrar información de empleados',
          icon: 'fas fa-users',
          route: '/employee-registration',
          color: 'warning'
        },
        {
          title: 'Calculadora de Sueldos',
          description: 'Calcular salarios y liquidaciones',
          icon: 'fas fa-calculator',
          route: '/calculadora-sueldo',
          color: 'info'
        },
        {
          title: 'Panel Administrativo',
          description: 'Vista general de transacciones',
          icon: 'fas fa-chart-bar',
          route: '/admin-panel',
          color: 'secondary'
        }
      ];
    } else {
      return [
        {
          title: 'Ver Mi Salario',
          description: 'Consultar información de nómina',
          icon: 'fas fa-user-dollar',
          route: '/sueldos',
          color: 'primary'
        },
        {
          title: 'Calculadora de Sueldos',
          description: 'Calcular salarios y liquidaciones',
          icon: 'fas fa-calculator',
          route: '/calculadora-sueldo',
          color: 'info'
        },
        {
          title: 'Mi Perfil',
          description: 'Actualizar información personal',
          icon: 'fas fa-user-edit',
          route: '/employee-registration',
          color: 'warning'
        }
      ];
    }
  }

  navigateTo(route: string): void {
    this.loadingService.showNavigation();
    this.router.navigate([route]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  // Chart Methods
  getBarHeight(value: number, maxValue: number): number {
    return (value / maxValue) * 100;
  }

  getPieTransform(index: number, total: number): string {
    const angle = (360 / total) * index;
    return `rotate(${angle}deg)`;
  }

  getPieChartBackground(): string {
    let currentAngle = 0;
    const gradientParts = this.expenseDistribution.map(segment => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + (segment.percentage * 3.6); // 3.6 = 360/100
      currentAngle = endAngle;
      return `${segment.color} ${startAngle}deg ${endAngle}deg`;
    });
    
    return `conic-gradient(${gradientParts.join(', ')})`;
  }

  logout(): void {
    this.loadingService.show('Cerrando sesión...');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}
