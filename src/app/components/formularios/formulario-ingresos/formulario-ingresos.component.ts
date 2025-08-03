// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FinancialService, Income } from '../../../services/financial.service';

interface IncomeRecord {
  id: number;
  description: string;
  amount: number;
  category: string;
  source: string;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'received' | 'cancelled';
  reference?: string;
  notes?: string;
}

@Component({
  selector: 'app-formulario-ingresos',
  templateUrl: './formulario-ingresos.component.html',
  styleUrls: ['./formulario-ingresos.component.css']
})
export class FormularioIngresosComponent implements OnInit {
  userRole: string = '';
  incomeForm!: FormGroup;
  incomes: IncomeRecord[] = [];
  filteredIncomes: IncomeRecord[] = [];
  showIncomeHistory: boolean = false;
  
  // Income categories and sources
  incomeCategories = [
    { value: 'sales', label: 'Ventas' },
    { value: 'services', label: 'Servicios' },
    { value: 'investments', label: 'Inversiones' },
    { value: 'rental', label: 'Rentas' },
    { value: 'commission', label: 'Comisiones' },
    { value: 'other', label: 'Otros' }
  ];

  incomeSources = [
    { value: 'clients', label: 'Clientes' },
    { value: 'partners', label: 'Socios' },
    { value: 'investors', label: 'Inversionistas' },
    { value: 'government', label: 'Gobierno' },
    { value: 'bank', label: 'Banco' },
    { value: 'other', label: 'Otros' }
  ];

  paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'mobile_payment', label: 'Pago Móvil' },
    { value: 'crypto', label: 'Criptomonedas' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private financialService: FinancialService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAuthentication();
    this.loadIncomeHistory();
  }

  initializeForm(): void {
    this.incomeForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['sales', Validators.required],
      source: ['clients', Validators.required],
      date: ['', Validators.required],
      paymentMethod: ['bank_transfer', Validators.required],
      reference: [''],
      notes: [''],
      isRecurring: [false],
      recurringPeriod: ['monthly']
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

  loadIncomeHistory(): void {
    // Load from API
    this.financialService.getAllIncome().subscribe({
      next: (apiIncomes) => {
        this.incomes = apiIncomes.map(income => ({
          id: income.id || 0,
          description: income.description,
          amount: income.amount,
          category: income.category,
          source: income.source,
          date: income.incomeDate,
          paymentMethod: income.paymentMethod || 'bank_transfer',
          status: (income.status || 'PENDING').toLowerCase() as 'pending' | 'received' | 'cancelled',
          reference: income.reference || 'INC' + income.id,
          notes: income.notes || income.description
        }));
        this.filteredIncomes = [...this.incomes];
      },
      error: (error) => {
        console.error('Error loading income history:', error);
        // Fallback to mock data
        this.loadMockIncomeHistory();
      }
    });
  }

  loadMockIncomeHistory(): void {
    // Mock income history
    this.incomes = [
      {
        id: 1,
        description: 'Venta de productos tecnológicos',
        amount: 50000,
        category: 'sales',
        source: 'clients',
        date: '2024-01-15',
        paymentMethod: 'bank_transfer',
        status: 'received',
        reference: 'INV001',
        notes: 'Pago por lote de computadoras'
      },
      {
        id: 2,
        description: 'Servicios de consultoría',
        amount: 25000,
        category: 'services',
        source: 'clients',
        date: '2024-01-10',
        paymentMethod: 'check',
        status: 'received',
        reference: 'CONS001',
        notes: 'Asesoría en implementación de sistemas'
      },
      {
        id: 3,
        description: 'Rendimientos de inversión',
        amount: 15000,
        category: 'investments',
        source: 'bank',
        date: '2024-01-12',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        reference: 'INV002',
        notes: 'Dividendos de acciones'
      }
    ];
    this.filteredIncomes = [...this.incomes];
  }

  onSubmit(): void {
    if (this.incomeForm.valid) {
      const formValue = this.incomeForm.value;
      
      // Create API income
      const apiIncome: Income = {
        description: formValue.description,
        amount: formValue.amount,
        category: formValue.category,
        source: formValue.source,
        incomeDate: formValue.date,
        reference: formValue.reference,
        notes: formValue.notes,
        paymentMethod: formValue.paymentMethod,
        status: 'PENDING'
      };

      // Send to API
      this.financialService.createIncome(apiIncome).subscribe({
        next: (createdIncome) => {
          // Add to local list
          const newIncome: IncomeRecord = {
            id: createdIncome.id || this.incomes.length + 1,
            description: formValue.description,
            amount: formValue.amount,
            category: formValue.category,
            source: formValue.source,
            date: formValue.date,
            paymentMethod: formValue.paymentMethod,
            status: 'pending',
            reference: formValue.reference || this.generateReference(),
            notes: formValue.notes
          };

          this.incomes.unshift(newIncome);
          this.filteredIncomes = [...this.incomes];
          
          this.showNotification('Ingreso registrado exitosamente', 'success');
          this.incomeForm.reset({
            category: 'sales',
            source: 'clients',
            paymentMethod: 'bank_transfer',
            isRecurring: false,
            recurringPeriod: 'monthly'
          });
        },
        error: (error) => {
          console.error('Error creating income:', error);
          this.showNotification('Error al registrar ingreso. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    } else {
      this.markFormGroupTouched(this.incomeForm);
      this.showNotification('Por favor, completa todos los campos requeridos', 'error');
    }
  }

  generateReference(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `INC${timestamp}${random}`;
  }

  updateIncomeStatus(incomeId: number, status: 'pending' | 'received' | 'cancelled'): void {
    const statusToSend = status.toUpperCase();
    this.financialService.updateIncomeStatus(incomeId, statusToSend).subscribe({
      next: (updatedIncome) => {
        const income = this.incomes.find(i => i.id === incomeId);
        if (income) {
          income.status = status;
          this.filteredIncomes = [...this.incomes];
          this.showNotification(`Estado del ingreso actualizado a: ${this.getStatusText(status)}`, 'success');
        }
      },
      error: (error) => {
        console.error('Error updating income status:', error);
        this.showNotification('Error al actualizar el estado del ingreso. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  deleteIncome(incomeId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      this.financialService.deleteIncome(incomeId).subscribe({
        next: () => {
          this.incomes = this.incomes.filter(i => i.id !== incomeId);
          this.filteredIncomes = [...this.incomes];
          this.showNotification('Ingreso eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting income:', error);
          this.showNotification('Error al eliminar ingreso. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
  }

  searchIncomes(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredIncomes = this.incomes.filter(income =>
      income.description.toLowerCase().includes(searchTerm) ||
      income.reference?.toLowerCase().includes(searchTerm) ||
      this.getCategoryLabel(income.category).toLowerCase().includes(searchTerm)
    );
  }

  getCategoryLabel(value: string): string {
    return this.incomeCategories.find(cat => cat.value === value)?.label || value;
  }

  getSourceLabel(value: string): string {
    return this.incomeSources.find(source => source.value === value)?.label || value;
  }

  getPaymentMethodLabel(value: string): string {
    return this.paymentMethods.find(method => method.value === value)?.label || value;
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'warning',
      'received': 'success',
      'cancelled': 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  }

  getStatusText(status: string): string {
    const texts = {
      'pending': 'Pendiente',
      'received': 'Recibido',
      'cancelled': 'Cancelado'
    };
    return texts[status as keyof typeof texts] || status;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }

  toggleIncomeHistory(): void {
    this.showIncomeHistory = !this.showIncomeHistory;
  }

  exportIncomes(): void {
// @ts-ignore

    // Generar PDF de ingresos
    const doc = new jsPDF();
    doc.text('Historial de Ingresos', 14, 15);
    const tableData = this.incomes.map(i => [
      i.id?.toString() || '',
      i.source || '',
      this.formatCurrency(i.amount) || '',
      this.formatDate(i.date) || '',
      i.description || ''
    ]);
    autoTable(doc, {
      head: [[
        'ID', 'Fuente', 'Monto', 'Fecha', 'Descripción'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('ingresos.pdf');
    this.showNotification('Historial de ingresos exportado en PDF', 'success');
  }

  goBack(): void {
    this.router.navigate(['/admin-panel']);
  }

  calculateTotalIncome(): number {
    return this.incomes
      .filter(income => income.status === 'received')
      .reduce((total, income) => total + income.amount, 0);
  }

  calculatePendingIncome(): number {
    return this.incomes
      .filter(income => income.status === 'pending')
      .reduce((total, income) => total + income.amount, 0);
  }
}
