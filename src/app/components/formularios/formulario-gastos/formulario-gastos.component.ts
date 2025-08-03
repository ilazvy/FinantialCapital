// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FinancialService, Expense } from '../../../services/financial.service';

interface ExpenseRecord {
  id: number;
  description: string;
  amount: number;
  category: string;
  vendor: string;
  date: string;
  paymentMethod: string;
  status: 'pending' | 'paid' | 'cancelled';
  reference?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringPeriod?: string;
}

@Component({
  selector: 'app-formulario-gastos',
  templateUrl: './formulario-gastos.component.html',
  styleUrls: ['./formulario-gastos.component.css']
})
export class FormularioGastosComponent implements OnInit {
  userRole: string = '';
  expenseForm!: FormGroup;
  expenses: ExpenseRecord[] = [];
  filteredExpenses: ExpenseRecord[] = [];
  showExpenseHistory: boolean = false;
  
  // Expense categories and vendors
  expenseCategories = [
    { value: 'utilities', label: 'Servicios Públicos' },
    { value: 'rent', label: 'Renta' },
    { value: 'supplies', label: 'Suministros' },
    { value: 'equipment', label: 'Equipamiento' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'travel', label: 'Viajes' },
    { value: 'maintenance', label: 'Mantenimiento' },
    { value: 'insurance', label: 'Seguros' },
    { value: 'taxes', label: 'Impuestos' },
    { value: 'other', label: 'Otros' }
  ];

  vendors = [
    { value: 'electric_company', label: 'Compañía Eléctrica' },
    { value: 'water_company', label: 'Compañía de Agua' },
    { value: 'internet_provider', label: 'Proveedor de Internet' },
    { value: 'office_supplies', label: 'Papelería Oficina' },
    { value: 'equipment_supplier', label: 'Proveedor de Equipos' },
    { value: 'marketing_agency', label: 'Agencia de Marketing' },
    { value: 'travel_agency', label: 'Agencia de Viajes' },
    { value: 'maintenance_service', label: 'Servicio de Mantenimiento' },
    { value: 'insurance_company', label: 'Compañía de Seguros' },
    { value: 'government', label: 'Gobierno' },
    { value: 'other', label: 'Otros' }
  ];

  paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
    { value: 'mobile_payment', label: 'Pago Móvil' }
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
    this.loadExpenseHistory();
  }

  initializeForm(): void {
    this.expenseForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['utilities', Validators.required],
      vendor: ['electric_company', Validators.required],
      date: ['', Validators.required],
      paymentMethod: ['bank_transfer', Validators.required],
      reference: [''],
      notes: [''],
      isRecurring: [false],
      recurringPeriod: ['monthly'],
      isUrgent: [false]
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

  loadExpenseHistory(): void {
    // Load from API
    this.financialService.getAllExpenses().subscribe({
      next: (apiExpenses) => {
        this.expenses = apiExpenses.map(expense => ({
          id: expense.id || 0,
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          vendor: expense.vendor || 'other',
          date: expense.expenseDate,
          paymentMethod: 'bank_transfer', // Default payment method
          status: expense.status === 'PAID' ? 'paid' : expense.status === 'CANCELLED' ? 'cancelled' : 'pending',
          reference: expense.reference || expense.id?.toString() || 'EXP' + expense.id,
          notes: expense.notes || expense.description
        }));
        this.filteredExpenses = [...this.expenses];
      },
      error: (error) => {
        console.error('Error loading expense history:', error);
        // Fallback to mock data
        this.loadMockExpenseHistory();
      }
    });
  }

  loadMockExpenseHistory(): void {
    // Mock expense history
    this.expenses = [
      {
        id: 1,
        description: 'Pago de factura de electricidad',
        amount: 2500,
        category: 'utilities',
        vendor: 'electric_company',
        date: '2024-01-15',
        paymentMethod: 'bank_transfer',
        status: 'paid',
        reference: 'ELEC001',
        notes: 'Factura mensual de enero 2024'
      },
      {
        id: 2,
        description: 'Compra de suministros de oficina',
        amount: 1500,
        category: 'supplies',
        vendor: 'office_supplies',
        date: '2024-01-10',
        paymentMethod: 'credit_card',
        status: 'paid',
        reference: 'SUP001',
        notes: 'Papel, tinta y otros materiales'
      },
      {
        id: 3,
        description: 'Mantenimiento de equipos de cómputo',
        amount: 3000,
        category: 'maintenance',
        vendor: 'maintenance_service',
        date: '2024-01-12',
        paymentMethod: 'check',
        status: 'pending',
        reference: 'MAINT001',
        notes: 'Servicio técnico preventivo'
      }
    ];
    this.filteredExpenses = [...this.expenses];
  }

  onSubmit(): void {
    if (this.expenseForm.valid) {
      const formValue = this.expenseForm.value;
      
      // Create API expense
      const apiExpense: Expense = {
        description: formValue.description,
        amount: formValue.amount,
        expenseDate: formValue.date,
        category: formValue.category,
        vendor: formValue.vendor,
        reference: formValue.reference || this.generateReference(),
        notes: formValue.notes
      };

      // Send to API
      this.financialService.createExpense(apiExpense).subscribe({
        next: (createdExpense) => {
          // Add to local list
          const newExpense: ExpenseRecord = {
            id: createdExpense.id || this.expenses.length + 1,
            description: formValue.description,
            amount: formValue.amount,
            category: formValue.category,
            vendor: formValue.vendor,
            date: formValue.date,
            paymentMethod: formValue.paymentMethod,
            status: 'pending',
            reference: formValue.reference || this.generateReference(),
            notes: formValue.notes,
            isRecurring: formValue.isRecurring,
            recurringPeriod: formValue.recurringPeriod
          };

          this.expenses.unshift(newExpense);
          this.filteredExpenses = [...this.expenses];
          
          this.showNotification('Gasto registrado exitosamente', 'success');
          this.expenseForm.reset({
            category: 'utilities',
            vendor: 'electric_company',
            paymentMethod: 'bank_transfer',
            isRecurring: false,
            recurringPeriod: 'monthly',
            isUrgent: false
          });
        },
        error: (error) => {
          console.error('Error creating expense:', error);
          this.showNotification('Error al registrar gasto. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    } else {
      this.markFormGroupTouched(this.expenseForm);
      this.showNotification('Por favor, completa todos los campos requeridos', 'error');
    }
  }

  generateReference(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `EXP${timestamp}${random}`;
  }

  updateExpenseStatus(expenseId: number, status: 'pending' | 'paid' | 'cancelled'): void {
    const expense = this.expenses.find(e => e.id === expenseId);
    if (!expense) {
      this.showNotification('Gasto no encontrado.', 'error');
      return;
    }
    const statusToSend = status === 'paid' ? 'PAID' : status === 'cancelled' ? 'CANCELLED' : 'PENDING';
    // Enviar todos los campos requeridos por la API
    const expenseToUpdate: Expense = {
      id: expense.id,
      description: expense.description,
      amount: expense.amount,
      expenseDate: expense.date,
      category: expense.category,
      vendor: expense.vendor,
      reference: expense.reference,
      notes: expense.notes,
      status: statusToSend
    };
    this.financialService.updateExpense(expenseId, expenseToUpdate).subscribe({
      next: (updatedExpense) => {
        expense.status = status;
        this.filteredExpenses = [...this.expenses];
        this.showNotification(`Estado del gasto actualizado a: ${this.getStatusText(status)}`, 'success');
      },
      error: (error) => {
        console.error('Error updating expense status:', error);
        this.showNotification('Error al actualizar el estado del gasto. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  deleteExpense(expenseId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      this.financialService.deleteExpense(expenseId).subscribe({
        next: () => {
          this.expenses = this.expenses.filter(e => e.id !== expenseId);
          this.filteredExpenses = [...this.expenses];
          this.showNotification('Gasto eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          this.showNotification('Error al eliminar gasto. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
  }

  searchExpenses(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredExpenses = this.expenses.filter(expense =>
      expense.description.toLowerCase().includes(searchTerm) ||
      expense.reference?.toLowerCase().includes(searchTerm) ||
      this.getCategoryLabel(expense.category).toLowerCase().includes(searchTerm)
    );
  }

  getCategoryLabel(value: string): string {
    return this.expenseCategories.find(cat => cat.value === value)?.label || value;
  }

  getVendorLabel(value: string): string {
    return this.vendors.find(vendor => vendor.value === value)?.label || value;
  }

  getPaymentMethodLabel(value: string): string {
    return this.paymentMethods.find(method => method.value === value)?.label || value;
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'warning',
      'paid': 'success',
      'cancelled': 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  }

  getStatusText(status: string): string {
    const texts = {
      'pending': 'Pendiente',
      'paid': 'Pagado',
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

  toggleExpenseHistory(): void {
    this.showExpenseHistory = !this.showExpenseHistory;
  }

  exportExpenses(): void {
    // Generar PDF de gastos
    const doc = new jsPDF();
    doc.text('Historial de Gastos', 14, 15);
    const tableData = this.expenses.map(e => [
      e.id?.toString() || '',
      e.description || '',
      this.formatCurrency(e.amount) || '',
      e.category || '',
      e.vendor || '',
      this.formatDate(e.date) || '',
      e.status || '',
      e.reference || ''
    ]);
    autoTable(doc, {
      head: [[
        'ID', 'Descripción', 'Monto', 'Categoría', 'Proveedor', 'Fecha', 'Estatus', 'Referencia'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('gastos.pdf');
    this.showNotification('Historial de gastos exportado en PDF', 'success');
  }

  goBack(): void {
    this.router.navigate(['/admin-panel']);
  }

  calculateTotalExpenses(): number {
    return this.expenses
      .filter(expense => expense.status === 'paid')
      .reduce((total, expense) => total + expense.amount, 0);
  }

  calculatePendingExpenses(): number {
    return this.expenses
      .filter(expense => expense.status === 'pending')
      .reduce((total, expense) => total + expense.amount, 0);
  }

  getExpenseByCategory(): { [key: string]: number } {
    const categoryTotals: { [key: string]: number } = {};
    
    this.expenses.forEach(expense => {
      const category = this.getCategoryLabel(expense.category);
      if (categoryTotals[category]) {
        categoryTotals[category] += expense.amount;
      } else {
        categoryTotals[category] = expense.amount;
      }
    });
    
    return categoryTotals;
  }
}
