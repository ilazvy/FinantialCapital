// ...existing code...
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PaymentService, Payment } from '../../../services/payment.service';
import { EmployeeService, Employee as ApiEmployee } from '../../../services/employee.service';

interface PaymentRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentType: string;
  paymentMethod: string;
  date: string;
  description: string;
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  notes?: string;
}

@Component({
  selector: 'app-formulario-pago',
  templateUrl: './formulario-pago.component.html',
  styleUrls: ['./formulario-pago.component.css']
})
export class FormularioPagoComponent implements OnInit {
  // ...propiedades...

  public get filteredEmployees() {
    const dept = this.paymentForm?.get('department')?.value;
    if (!dept) return this.employees;
    return this.employees.filter(emp => emp.department === dept);
  }
  userRole: string = '';
  paymentForm!: FormGroup;
  payments: PaymentRecord[] = [];
  filteredPayments: PaymentRecord[] = [];
  showPaymentHistory: boolean = false;
  
  // Payment types and methods
  paymentTypes = [
    { value: 'salary', label: 'Salario' },
    { value: 'bonus', label: 'Bono' },
    { value: 'commission', label: 'Comisión' },
    { value: 'overtime', label: 'Horas Extra' },
    { value: 'advance', label: 'Anticipo' },
    { value: 'other', label: 'Otro' }
  ];

  paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'payroll_card', label: 'Tarjeta de Nómina' },
    { value: 'mobile_payment', label: 'Pago Móvil' }
  ];

  // Mock employees data

  employees: any[] = [];
  departments: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private paymentService: PaymentService,
    private employeeService: EmployeeService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAuthentication();
    this.loadPaymentHistory();
    this.loadEmployees();
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      department: ['', Validators.required],
      employeeId: ['', Validators.required],
      amount: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0.01)]],
      paymentType: ['salary', Validators.required],
      paymentMethod: ['bank_transfer', Validators.required],
      date: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      reference: [''],
      notes: [''],
      isUrgent: [false]
    });
  }
  onEmployeeChange(event: Event): void {
    const empId = (event.target as HTMLSelectElement).value;
    const emp = this.employees.find(e => e.id === empId);
    if (emp) {
      this.paymentForm.get('amount')?.setValue(emp.sueldoBase);
    } else {
      this.paymentForm.get('amount')?.setValue(0);
    }
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

  loadPaymentHistory(): void {
    // Load from API
    this.paymentService.getAllPayments().subscribe({
      next: (apiPayments) => {
        this.payments = apiPayments.map(payment => ({
          id: payment.id || 0,
          employeeId: payment.employeeId?.toString() || '',
          employeeName: payment.employeeName || `Empleado ${payment.employeeId}`,
          amount: payment.amount,
          paymentType: payment.type || 'salary',
          paymentMethod: 'bank_transfer', // Default payment method
          date: payment.paymentDate,
          description: payment.description,
          status: payment.status === 'PAID' ? 'completed' : 
                  payment.status === 'CANCELLED' ? 'cancelled' : 'pending',
          reference: payment.reference || `REF${payment.id}`,
          notes: payment.notes || payment.description
        }));
        this.filteredPayments = [...this.payments];
      },
      error: (error) => {
        console.error('Error loading payment history:', error);
        // Fallback to mock data
        this.loadMockPaymentHistory();
      }
    });
  }

  loadMockPaymentHistory(): void {
    // Mock payment history
    this.payments = [
      {
        id: 1,
        employeeId: 'EMP001',
        employeeName: 'Juan Pérez',
        amount: 15000,
        paymentType: 'salary',
        paymentMethod: 'bank_transfer',
        date: '2024-01-15',
        description: 'Pago de salario mensual enero 2024',
        status: 'completed',
        reference: 'REF001'
      },
      {
        id: 2,
        employeeId: 'EMP002',
        employeeName: 'María García',
        amount: 5000,
        paymentType: 'bonus',
        paymentMethod: 'cash',
        date: '2024-01-10',
        description: 'Bono por desempeño excepcional',
        status: 'completed',
        reference: 'REF002'
      },
      {
        id: 3,
        employeeId: 'EMP003',
        employeeName: 'Carlos López',
        amount: 8000,
        paymentType: 'overtime',
        paymentMethod: 'payroll_card',
        date: '2024-01-12',
        description: 'Pago de horas extra del mes',
        status: 'pending',
        reference: 'REF003'
      }
    ];
    this.filteredPayments = [...this.payments];
  }

  loadEmployees(): void {
    // Load from API
    this.employeeService.getAllEmployees().subscribe({
      next: (apiEmployees) => {
        this.employees = apiEmployees.map(emp => ({
          id: emp.id?.toString() || '',
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          sueldoBase: emp.salary
        }));
        this.departments = Array.from(new Set(this.employees.map(emp => emp.department)));
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // Keep using mock employees data
      }
    });
  }

  onDepartmentChange(event: Event): void {
    const dept = (event.target as HTMLSelectElement).value;
    if (!dept) {
      this.paymentForm.get('amount')?.setValue(0);
      return;
    }
    const empleadosDepto = this.employees.filter(emp => emp.department === dept);
    const total = empleadosDepto.reduce((sum, emp) => sum + emp.sueldoBase, 0);
    this.paymentForm.get('amount')?.setValue(total);
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      const formValue = this.paymentForm.getRawValue();
      const emp = this.employees.find(e => e.id === formValue.employeeId);
      if (!emp) {
        this.showNotification('Selecciona un empleado válido', 'error');
        return;
      }
      const apiPayment: Payment = {
        employeeId: parseInt(emp.id),
        amount: emp.sueldoBase,
        type: formValue.paymentType,
        paymentDate: formValue.date,
        description: formValue.description,
        status: 'PENDING',
        reference: formValue.reference || this.generateReference(),
        notes: formValue.notes
      };
      this.paymentService.createPayment(apiPayment).subscribe({
        next: (createdPayment) => {
          const newPayment: PaymentRecord = {
            id: createdPayment.id || this.payments.length + 1,
            employeeId: emp.id,
            employeeName: emp.name,
            amount: emp.sueldoBase,
            paymentType: formValue.paymentType,
            paymentMethod: formValue.paymentMethod,
            date: formValue.date,
            description: formValue.description,
            status: 'pending',
            reference: formValue.reference || this.generateReference()
          };
          this.payments.unshift(newPayment);
          this.filteredPayments = [...this.payments];
          this.showNotification('Pago registrado exitosamente', 'success');
          this.paymentForm.reset({
            paymentType: 'salary',
            paymentMethod: 'bank_transfer',
            isUrgent: false
          });
        },
        error: (error) => {
          console.error('Error creating payment:', error);
          this.showNotification('Error al registrar pago. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    } else {
      this.markFormGroupTouched(this.paymentForm);
      this.showNotification('Por favor, completa todos los campos requeridos', 'error');
    }
  }

  generateReference(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `REF${timestamp}${random}`;
  }

  updatePaymentStatus(paymentId: number, status: 'pending' | 'completed' | 'cancelled'): void {
    const statusToSend = status === 'completed' ? 'PAID' : 
                         status === 'cancelled' ? 'CANCELLED' : 'PENDING';
    
    this.paymentService.updatePaymentStatus(paymentId, statusToSend).subscribe({
      next: (updatedPayment) => {
        const payment = this.payments.find(p => p.id === paymentId);
        if (payment) {
          payment.status = status;
          this.filteredPayments = [...this.payments];
          this.showNotification(`Estado del pago actualizado a: ${this.getStatusText(status)}`, 'success');
        }
      },
      error: (error) => {
        console.error('Error updating payment status:', error);
        this.showNotification('Error al actualizar el estado del pago. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  deletePayment(paymentId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este pago?')) {
      this.paymentService.deletePayment(paymentId).subscribe({
        next: () => {
          this.payments = this.payments.filter(p => p.id !== paymentId);
          this.filteredPayments = [...this.payments];
          this.showNotification('Pago eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.showNotification('Error al eliminar pago. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
  }

  searchPayments(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredPayments = this.payments.filter(payment =>
      payment.employeeName.toLowerCase().includes(searchTerm) ||
      payment.description.toLowerCase().includes(searchTerm) ||
      payment.reference?.toLowerCase().includes(searchTerm)
    );
  }

  getPaymentTypeLabel(value: string): string {
    return this.paymentTypes.find(type => type.value === value)?.label || value;
  }

  getPaymentMethodLabel(value: string): string {
    return this.paymentMethods.find(method => method.value === value)?.label || value;
  }

  getStatusColor(status: string): string {
    const colors = {
      'pending': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  }

  getStatusText(status: string): string {
    const texts = {
      'pending': 'Pendiente',
      'completed': 'Completado',
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
    // Aquí podrías implementar un sistema de notificaciones más elegante
    alert(message);
  }

  togglePaymentHistory(): void {
    this.showPaymentHistory = !this.showPaymentHistory;
  }

  exportPayments(): void {
    // Generar PDF de pagos
    const doc = new jsPDF();
    doc.text('Historial de Pagos', 14, 15);
    const tableData = this.payments.map(p => [
      p.employeeId || '',
      p.employeeName || '',
      this.formatCurrency(p.amount) || '',
      this.getPaymentTypeLabel(p.paymentType) || '',
      this.getPaymentMethodLabel(p.paymentMethod) || '',
      this.formatDate(p.date) || '',
      p.status || '',
      p.reference || ''
    ]);
    autoTable(doc, {
      head: [[
        'ID Empleado', 'Nombre', 'Monto', 'Tipo de Pago', 'Método', 'Fecha', 'Estatus', 'Referencia'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('pagos.pdf');
    this.showNotification('Historial de pagos exportado en PDF', 'success');
  }

  goBack(): void {
    this.router.navigate(['/admin-panel']);
  }
}
