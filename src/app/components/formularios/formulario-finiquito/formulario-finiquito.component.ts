// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentService, SeverancePayment } from '../../../services/payment.service';
import { EmployeeService, Employee } from '../../../services/employee.service';

interface Empleado {
  id: string;
  name: string;
  department: string;
  sueldoBase: number;
  fechaIngreso: string; // formato YYYY-MM-DD
}

interface FiniquitoRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  department: string;
  sueldoBase: number;
  fechaIngreso: string;
  fechaBaja: string;
  diasLaborados: number;
  motivo: string;
  montoFiniquito: number;
  status: 'pending' | 'completed' | 'cancelled';
  reference?: string;
  description: string;
  notes?: string;
}

@Component({
  selector: 'app-formulario-finiquito',
  templateUrl: './formulario-finiquito.component.html',
  styleUrls: ['./formulario-finiquito.component.css']
})
export class FormularioFiniquitoComponent implements OnInit {

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }
  finiquitoForm!: FormGroup;
  empleados: Empleado[] = [
    { id: 'EMP001', name: 'Juan Pérez', department: 'Ventas', sueldoBase: 15000, fechaIngreso: '2021-03-15' },
    { id: 'EMP002', name: 'María García', department: 'Administración', sueldoBase: 12000, fechaIngreso: '2020-07-01' },
    { id: 'EMP003', name: 'Carlos López', department: 'IT', sueldoBase: 18000, fechaIngreso: '2019-11-20' },
    { id: 'EMP004', name: 'Ana Martínez', department: 'Recursos Humanos', sueldoBase: 11000, fechaIngreso: '2022-01-10' },
    { id: 'EMP005', name: 'Luis Rodríguez', department: 'Contabilidad', sueldoBase: 14000, fechaIngreso: '2018-05-05' },
    { id: 'EMP006', name: 'Pedro García', department: 'Ventas', sueldoBase: 15000, fechaIngreso: '2022-06-01' },
    { id: 'EMP007', name: 'Ana López', department: 'Administración', sueldoBase: 12000, fechaIngreso: '2021-09-15' },
    { id: 'EMP008', name: 'Carlos Martínez', department: 'IT', sueldoBase: 18000, fechaIngreso: '2020-02-28' },
    { id: 'EMP009', name: 'María Rodríguez', department: 'Recursos Humanos', sueldoBase: 11000, fechaIngreso: '2019-12-12' },
    { id: 'EMP010', name: 'Juan García', department: 'Contabilidad', sueldoBase: 14000, fechaIngreso: '2023-03-01' }
  ];
  departments: string[] = [];
  empleadosFiltrados: Empleado[] = [];
  selectedEmpleado: Empleado | null = null;
  finiquitos: FiniquitoRecord[] = [];
  showFiniquitoHistory: boolean = true;
  filteredFiniquitos: FiniquitoRecord[] = [];

  motivos = [
    { value: 'renuncia', label: 'Renuncia' },
    { value: 'despido_justificado', label: 'Despido justificado' },
    { value: 'despido_injustificado', label: 'Despido injustificado' },
    { value: 'terminacion_contrato', label: 'Terminación de contrato' },
    { value: 'otro', label: 'Otro' }
  ];

  paymentMethods = [
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
    { value: 'check', label: 'Cheque' },
    { value: 'payroll_card', label: 'Tarjeta de Nómina' },
    { value: 'mobile_payment', label: 'Pago Móvil' }
  ];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private employeeService: EmployeeService
  ) {
    this.departments = Array.from(new Set(this.empleados.map(emp => emp.department)));
    this.buildForm();
  }

  ngOnInit(): void {
    this.loadFiniquitoHistory();
    this.loadEmployees();
    this.filteredFiniquitos = [...this.finiquitos];
  }

  loadFiniquitoHistory(): void {
    // Load from API
    this.paymentService.getAllSeverancePayments().subscribe({
      next: (severancePayments) => {
        this.finiquitos = severancePayments.map(sp => ({
          id: sp.id || 0,
          employeeId: sp.employeeId.toString(),
          employeeName: sp.employeeName || 'Empleado ' + sp.employeeId,
          department: 'Departamento',
          sueldoBase: 0,
          fechaIngreso: '2020-01-01',
          fechaBaja: sp.paymentDate,
          diasLaborados: 365,
          motivo: sp.reason,
          montoFiniquito: sp.amount,
          status: sp.status === 'PAID' ? 'completed' : sp.status === 'CANCELLED' ? 'cancelled' : 'pending',
          reference: sp.reference || 'FIN' + sp.id,
          description: sp.notes || `Finiquito por ${sp.reason} - ${sp.employeeName || 'Empleado ' + sp.employeeId}`,
          notes: sp.notes
        }));
        this.filteredFiniquitos = [...this.finiquitos];
      },
      error: (error) => {
        console.error('Error loading severance payments:', error);
        // Fallback to mock data
        this.loadMockFiniquitoHistory();
      }
    });
  }

  loadMockFiniquitoHistory(): void {
    // Mock finiquito history
    this.finiquitos = [
      {
        id: 1,
        employeeId: 'EMP001',
        employeeName: 'Juan Pérez',
        department: 'Ventas',
        sueldoBase: 15000,
        fechaIngreso: '2021-03-15',
        fechaBaja: '2024-01-15',
        diasLaborados: 1035,
        motivo: 'renuncia',
        montoFiniquito: 45000,
        status: 'pending',
        reference: 'FIN001',
        description: 'Finiquito por renuncia voluntaria del empleado'
      },
      {
        id: 2,
        employeeId: 'EMP003',
        employeeName: 'Carlos López',
        department: 'IT',
        sueldoBase: 18000,
        fechaIngreso: '2019-11-20',
        fechaBaja: '2024-01-10',
        diasLaborados: 1512,
        motivo: 'despido_justificado',
        montoFiniquito: 54000,
        status: 'completed',
        reference: 'FIN002',
        description: 'Finiquito por despido justificado por incumplimiento de políticas'
      },
      {
        id: 3,
        employeeId: 'EMP005',
        employeeName: 'Luis Rodríguez',
        department: 'Contabilidad',
        sueldoBase: 14000,
        fechaIngreso: '2018-05-05',
        fechaBaja: '2024-01-20',
        diasLaborados: 2085,
        motivo: 'terminacion_contrato',
        montoFiniquito: 42000,
        status: 'cancelled',
        reference: 'FIN003',
        description: 'Finiquito por terminación de contrato temporal'
      }
    ];
    this.filteredFiniquitos = [...this.finiquitos];
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        // Convert API employees to local format
        this.empleados = employees.map(emp => ({
          id: emp.id?.toString() || '',
          name: `${emp.firstName} ${emp.lastName}`,
          department: emp.department,
          sueldoBase: emp.salary,
          fechaIngreso: emp.hireDate
        }));
        this.departments = Array.from(new Set(this.empleados.map(emp => emp.department)));
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // Keep using mock data if API fails
      }
    });
  }

  goBack(): void {
    window.history.back();
  }

  exportFiniquitos(): void {
    // Generar PDF de finiquitos
    const doc = new jsPDF();
    doc.text('Historial de Finiquitos', 14, 15);
    const tableData = this.finiquitos.map(f => [
      f.employeeId || '',
      f.employeeName || '',
      f.department || '',
      this.formatCurrency(f.sueldoBase) || '',
      f.fechaIngreso || '',
      f.fechaBaja || '',
      f.diasLaborados?.toString() || '',
      this.getMotivoLabel(f.motivo) || '',
      this.formatCurrency(f.montoFiniquito) || '',
      f.status || '',
      f.reference || ''
    ]);
    autoTable(doc, {
      head: [[
        'ID Empleado', 'Nombre', 'Departamento', 'Sueldo Base', 'Ingreso', 'Baja', 'Días', 'Motivo', 'Monto', 'Estatus', 'Referencia'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('finiquitos.pdf');
    this.showNotification('Historial de finiquitos exportado en PDF', 'success');
  }

  toggleFiniquitoHistory(): void {
    this.showFiniquitoHistory = !this.showFiniquitoHistory;
  }

  searchFiniquitos(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredFiniquitos = this.finiquitos.filter(finiquito =>
      finiquito.employeeName.toLowerCase().includes(searchTerm) ||
      finiquito.description.toLowerCase().includes(searchTerm) ||
      finiquito.reference?.toLowerCase().includes(searchTerm)
    );
  }

  getMotivoLabel(value: string): string {
    return this.motivos.find(m => m.value === value)?.label || value;
  }

  getPaymentMethodLabel(value: string): string {
    return this.paymentMethods.find(method => method.value === value)?.label || value;
  }

  buildForm() {
    this.finiquitoForm = this.fb.group({
      department: ['', Validators.required],
      employeeId: ['', Validators.required],
      sueldoBase: [{ value: '', disabled: true }],
      fechaIngreso: [{ value: '', disabled: true }],
      fechaBaja: ['', Validators.required],
      diasLaborados: [{ value: '', disabled: true }],
      motivo: ['', Validators.required],
      montoFiniquito: [{ value: '', disabled: true }],
      paymentMethod: ['bank_transfer', Validators.required],
      reference: [''],
      description: ['', [Validators.required, Validators.minLength(10)]],
      notes: ['']
    });
  }

  onDepartmentChange(event: Event) {
    const dept = (event.target as HTMLSelectElement).value;
    this.empleadosFiltrados = this.empleados.filter(emp => emp.department === dept);
    this.finiquitoForm.get('employeeId')?.setValue('');
    this.selectedEmpleado = null;
    this.finiquitoForm.get('sueldoBase')?.setValue('');
    this.finiquitoForm.get('fechaIngreso')?.setValue('');
    this.finiquitoForm.get('diasLaborados')?.setValue('');
    this.finiquitoForm.get('montoFiniquito')?.setValue('');
  }

  onEmpleadoChange(event: Event) {
    const empId = (event.target as HTMLSelectElement).value;
    const empleado = this.empleadosFiltrados.find(emp => emp.id === empId) || null;
    this.selectedEmpleado = empleado;
    if (empleado) {
      this.finiquitoForm.get('sueldoBase')?.setValue(empleado.sueldoBase);
      this.finiquitoForm.get('fechaIngreso')?.setValue(empleado.fechaIngreso);
      this.calcularFiniquito();
    } else {
      this.finiquitoForm.get('sueldoBase')?.setValue('');
      this.finiquitoForm.get('fechaIngreso')?.setValue('');
      this.finiquitoForm.get('diasLaborados')?.setValue('');
      this.finiquitoForm.get('montoFiniquito')?.setValue('');
    }
  }

  onFechaBajaChange(event: Event) {
    this.calcularFiniquito();
  }

  calcularFiniquito() {
    const empleado = this.selectedEmpleado;
    const fechaIngreso = empleado?.fechaIngreso;
    const fechaBaja = this.finiquitoForm.get('fechaBaja')?.value;
    if (empleado && fechaIngreso && fechaBaja) {
      const diasLaborados = this.calcularDiasLaborados(fechaIngreso, fechaBaja);
      this.finiquitoForm.get('diasLaborados')?.setValue(diasLaborados);
      // Ejemplo de cálculo: 3 meses de sueldo + 20 días por año + parte proporcional de aguinaldo y vacaciones
      const sueldoBase = empleado.sueldoBase;
      const anios = Math.floor(diasLaborados / 365);
      const finiquito = (sueldoBase * 3) + (sueldoBase / 30 * 20 * anios) + (sueldoBase / 365 * diasLaborados * 0.1); // 10% extra por prestaciones
      this.finiquitoForm.get('montoFiniquito')?.setValue(Math.round(finiquito));
    } else {
      this.finiquitoForm.get('diasLaborados')?.setValue('');
      this.finiquitoForm.get('montoFiniquito')?.setValue('');
    }
  }

  calcularDiasLaborados(fechaIngreso: string, fechaBaja: string): number {
    const ingreso = new Date(fechaIngreso);
    const baja = new Date(fechaBaja);
    const diff = baja.getTime() - ingreso.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }

  onSubmit() {
    console.log('Botón de registro clickeado');
    console.log('Formulario válido:', this.finiquitoForm.valid);
    console.log('Empleado seleccionado:', this.selectedEmpleado);
    
    if (this.finiquitoForm.valid && this.selectedEmpleado) {
      const formValue = this.finiquitoForm.getRawValue();
      
      // Create severance payment for API
      const severancePayment: SeverancePayment = {
        employeeId: parseInt(this.selectedEmpleado.id),
        amount: formValue.montoFiniquito,
        reason: formValue.motivo,
        paymentDate: formValue.fechaBaja,
        status: 'PENDING', // Usar un valor válido del enum
        reference: formValue.reference,
        notes: formValue.description
      };

      // Send to API
      this.paymentService.createSeverancePayment(severancePayment).subscribe({
        next: (createdSeverancePayment) => {
          // Add to local list
          const nuevoFiniquito: FiniquitoRecord = {
            id: createdSeverancePayment.id || this.finiquitos.length + 1,
            employeeId: this.selectedEmpleado!.id,
            employeeName: this.selectedEmpleado!.name,
            department: this.selectedEmpleado!.department,
            sueldoBase: this.selectedEmpleado!.sueldoBase,
            fechaIngreso: this.selectedEmpleado!.fechaIngreso,
            fechaBaja: formValue.fechaBaja,
            diasLaborados: formValue.diasLaborados,
            motivo: formValue.motivo,
            montoFiniquito: formValue.montoFiniquito,
            status: 'pending',
            reference: formValue.reference || this.generateReference(),
            description: formValue.description
          };
          this.finiquitos.unshift(nuevoFiniquito);
          this.filteredFiniquitos = [...this.finiquitos];
          alert('Finiquito registrado exitosamente');
          this.finiquitoForm.reset();
          this.selectedEmpleado = null;
          this.empleadosFiltrados = [];
        },
        error: (error) => {
          console.error('Error creating severance payment:', error);
          alert('Error al registrar el finiquito. Por favor, inténtalo de nuevo.');
        }
      });
    } else {
      alert('Por favor, completa todos los campos requeridos');
    }
  }

  generateReference(): string {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `FIN${timestamp}${random}`;
  }

  updateFiniquitoStatus(finiquitoId: number, status: 'pending' | 'completed' | 'cancelled'): void {
    const finiquito = this.finiquitos.find(f => f.id === finiquitoId);
    if (!finiquito) {
      this.showNotification('Finiquito no encontrado.', 'error');
      return;
    }
    const statusToSend = status === 'completed' ? 'PAID' : 
                         status === 'cancelled' ? 'CANCELLED' : 'PENDING';
    // Enviar todos los campos requeridos por la API
    const finiquitoToUpdate = {
      employeeId: parseInt(finiquito.employeeId),
      amount: finiquito.montoFiniquito,
      reason: finiquito.motivo,
      paymentDate: finiquito.fechaBaja,
      status: statusToSend,
      reference: finiquito.reference,
      notes: finiquito.description
    };
    this.paymentService.updateSeverancePayment(finiquitoId, finiquitoToUpdate).subscribe({
      next: (updatedFiniquito) => {
        finiquito.status = status;
        this.filteredFiniquitos = [...this.finiquitos];
        this.showNotification(`Estado del finiquito actualizado a: ${this.getStatusText(status)}`, 'success');
      },
      error: (error) => {
        console.error('Error updating severance payment status:', error);
        this.showNotification('Error al actualizar el estado del finiquito. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  deleteFiniquito(finiquitoId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este finiquito?')) {
      this.paymentService.deleteSeverancePayment(finiquitoId).subscribe({
        next: () => {
          this.finiquitos = this.finiquitos.filter(f => f.id !== finiquitoId);
          this.filteredFiniquitos = [...this.finiquitos];
          this.showNotification('Finiquito eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting severance payment:', error);
          this.showNotification('Error al eliminar finiquito. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
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

  showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
  }
}
