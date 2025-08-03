import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FinancialService, Expense, Income } from '../../services/financial.service';
import { PaymentService, Payment, SeverancePayment } from '../../services/payment.service';
import { DashboardService } from '../../services/dashboard.service';

interface Transaction {
  id: number;
  type: 'expense' | 'income' | 'payment' | 'severance';
  description: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  reference?: string;
  notes?: string;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  userRole: string = '';
  // Statistics
  totalExpenses: number = 0;
  totalIncome: number = 0;
  totalPayments: number = 0;
  netProfit: number = 0;
  // UI State
  showFilters: boolean = false;
  // Filters
  selectedType: string = '';
  dateFrom: string = '';
  dateTo: string = '';
  minAmount: number = 0;
  // Data
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];

  loading = false;

  constructor(
    private router: Router,
    private financialService: FinancialService,
    private paymentService: PaymentService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAuthentication();
    this.loadTransactionsFromApi();
    this.loadTotalsFromApi();
  }
  loadTotalsFromApi(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats) => {
        this.totalExpenses = Number(stats.totalExpenses) || 0;
        this.totalIncome = Number(stats.totalIncome) || 0;
        this.totalPayments = Number(stats.monthlyPayroll) || 0;
        this.netProfit = this.totalIncome - this.totalExpenses;
      }
    });
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('userRole') || 'admin';
  }

  checkAuthentication(): void {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'admin' && userRole !== 'employee')) {
      this.router.navigate(['/login']);
    }
  }

  loadTransactionsFromApi(): void {
    this.loading = true;
    Promise.all([
      this.financialService.getAllExpenses().toPromise(),
      this.financialService.getAllIncome().toPromise(),
      this.paymentService.getAllPayments().toPromise(),
      this.paymentService.getAllSeverancePayments().toPromise()
    ]).then(([expenses, incomes, payments, severances]) => {
      const txs: Transaction[] = [];
      (expenses as Expense[]).forEach(e => txs.push({
        id: e.id!,
        type: 'expense',
        description: e.description,
        amount: e.amount,
        category: e.category,
        date: e.expenseDate,
        status: e.status || 'completed',
        reference: e.reference,
        notes: e.notes
      }));
      (incomes as Income[]).forEach(i => txs.push({
        id: i.id!,
        type: 'income',
        description: i.description,
        amount: i.amount,
        category: i.category,
        date: i.incomeDate,
        status: i.status || 'completed',
        reference: i.reference,
        notes: i.notes
      }));
      (payments as Payment[]).forEach(p => txs.push({
        id: p.id!,
        type: 'payment',
        description: p.description,
        amount: p.amount,
        category: 'Nómina',
        date: p.paymentDate,
        status: p.status || 'completed',
        reference: p.reference,
        notes: p.notes
      }));
      (severances as SeverancePayment[]).forEach(f => txs.push({
        id: f.id!,
        type: 'severance',
        description: `Finiquito - ${f.employeeName || ''}`,
        amount: f.amount,
        category: 'Finiquito',
        date: f.paymentDate,
        status: f.status || 'completed',
        reference: f.reference,
        notes: f.notes
      }));
      // Ordenar por fecha descendente
      txs.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      this.transactions = txs;
      // this.calculateStatistics();
      this.applyFilters();
      this.loading = false;
    }).catch(() => { this.loading = false; });
  }

  // Los totales ahora se obtienen directo de la API, igual que en el dashboard

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(transaction => {
      // Type filter
      if (this.selectedType && transaction.type !== this.selectedType) {
        return false;
      }
      
      // Date range filter
      if (this.dateFrom && transaction.date < this.dateFrom) {
        return false;
      }
      if (this.dateTo && transaction.date > this.dateTo) {
        return false;
      }
      
      // Amount filter
      if (this.minAmount && transaction.amount < this.minAmount) {
        return false;
      }
      
      return true;
    });
  }

  // Navigation Methods
  navigateToForm(type: string): void {
    switch (type) {
      case 'expenses':
        this.router.navigate(['/formulario-gastos']);
        break;
      case 'income':
        this.router.navigate(['/formulario-ingresos']);
        break;
      case 'payments':
        this.router.navigate(['/formulario-pago']);
        break;
    }
  }

  navigateToEmployees(): void {
    this.router.navigate(['/employee-registration']);
  }

  // UI Methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  refreshData(): void {
    this.loadTransactionsFromApi();
  }

  // Transaction Actions
  viewTransaction(transaction: Transaction): void {
    console.log('Ver transacción:', transaction);
    // Aquí podrías abrir un modal o navegar a una página de detalles
  }

  editTransaction(transaction: Transaction): void {
    console.log('Editar transacción:', transaction);
    // Aquí podrías navegar al formulario correspondiente con los datos precargados
    this.navigateToForm(transaction.type);
  }

  deleteTransaction(transaction: Transaction): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
      this.transactions = this.transactions.filter(t => t.id !== transaction.id);
      // this.calculateStatistics();
      this.applyFilters();
    }
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }


  getTransactionIcon(type: string): string {
    if (type === 'severance') return 'fas fa-times-circle text-finiquito';
    const icons = {
      'expense': 'fas fa-minus-circle',
      'income': 'fas fa-plus-circle',
      'payment': 'fas fa-money-bill-wave'
    };
    return icons[type as keyof typeof icons] || 'fas fa-question-circle';
  }

  getCategoryLabel(type: string, category: string): string {
    // Mapeo de categorías a español para ingresos y gastos
    const incomeCategories: any = {
      'sales': 'Ventas',
      'services': 'Servicios',
      'investments': 'Inversiones',
      'rental': 'Rentas',
      'commission': 'Comisiones',
      'other': 'Otros'
    };
    const expenseCategories: any = {
      'utilities': 'Servicios Públicos',
      'rent': 'Renta',
      'supplies': 'Suministros',
      'equipment': 'Equipamiento',
      'marketing': 'Marketing',
      'travel': 'Viaje',
      'maintenance': 'Mantenimiento',
      'insurance': 'Seguros',
      'taxes': 'Impuestos',
      'other': 'Otros',
      'Nómina': 'Nómina',
      'Finiquito': 'Finiquito'
    };
    if (type === 'income') return incomeCategories[category] || category;
    if (type === 'expense') return expenseCategories[category] || category;
    if (type === 'severance') return 'Finiquito';
    if (type === 'payment') return 'Nómina';
    return category;
  }

  getStatusText(status: string, type?: string): string {
    // Traducción robusta de estatus para todos los casos y mayúsculas/minúsculas
    const normalized = (status || '').toLowerCase();
    if (["completed", "paid", "recibido", "received", "pagado"].includes(normalized)) {
      if (type === 'income') return 'Recibido';
      if (type === 'payment' || type === 'severance') return 'Pagado';
      return 'Completado';
    }
    if (["pending", "pendiente"].includes(normalized)) return 'Pendiente';
    if (["cancelled", "canceled", "cancelado"].includes(normalized)) return 'Cancelado';
    return status;
  }


  exportData(): void {
    console.log('Exportando datos del panel administrativo...');
    alert('Datos exportados exitosamente');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
