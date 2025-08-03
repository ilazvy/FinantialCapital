import { Component, OnInit } from '@angular/core';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService, Employee } from '../../services/employee.service';
import { PaymentService, Payment } from '../../services/payment.service';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';
import { FinancialService } from '../../services/financial.service';

// Employee interface importada del servicio

interface SalaryRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeNumber?: string;
  month: string;
  year: number;
  baseSalary: number;
  bonuses: number;
  deductions: number;
  overtime: number;
  totalSalary: number;
  paymentDate: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes: string;
}

interface SalaryConfig {
  id: number;
  name: string;
  type: 'bonus' | 'deduction';
  amount: number;
  percentage: boolean;
  description: string;
}

@Component({
  selector: 'app-sueldos',
  templateUrl: './sueldos.component.html',
  styleUrls: ['./sueldos.component.css']
})
export class SueldosComponent implements OnInit {
  // Reporte mensual (PDF de nómina filtrada por mes y año)
  exportMonthlyReport(): void {
    const doc = new jsPDF();
    doc.text('Reporte Mensual de Nómina', 14, 15);
    const filtered = this.salaryRecords.filter(r => r.month === this.selectedMonth && r.year === this.selectedYear);
    const tableData = filtered.length === 0
      ? [['-', '-', '-', '-', '-', '-', '-', '-', '-']]
      : filtered.map(rec => [
          rec.employeeNumber || rec.employeeId,
          rec.employeeName,
          this.formatCurrency(rec.baseSalary),
          this.formatCurrency(rec.bonuses),
          this.formatCurrency(rec.deductions),
          this.formatCurrency(rec.overtime),
          this.formatCurrency(rec.totalSalary),
          this.formatDate(rec.paymentDate),
          rec.status
        ]);
    autoTable(doc, {
      head: [[
        'No. Empleado', 'Nombre', 'Sueldo Base', 'Bonos', 'Deducciones', 'Horas Extra', 'Total', 'Fecha Pago', 'Estatus'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('reporte_mensual_nomina.pdf');
    if (filtered.length === 0) {
      this.showNotification('No hay registros de nómina para el mes y año seleccionados. Se generó PDF vacío.', 'warning');
    } else {
      this.showNotification('Reporte mensual exportado en PDF', 'success');
    }
  }

  // Análisis de costos (PDF por departamento y empleado)
  exportCostAnalysis(): void {
    const doc = new jsPDF();
    doc.text('Análisis de Costos', 14, 15);
    // Cargar gastos e ingresos desde FinancialService
    Promise.all([
      this.financialService.getAllExpenses().toPromise().catch(() => []),
      this.financialService.getAllIncome().toPromise().catch(() => [])
    ]).then(([expenses, incomes]) => {
      let lastY = 20;
      // Pagos (Nómina)
      autoTable(doc, {
        head: [[
          'No. Empleado', 'Nombre', 'Sueldo Base', 'Bonos', 'Deducciones', 'Horas Extra', 'Total', 'Fecha Pago', 'Estatus'
        ]],
        body: this.salaryRecords.map(rec => [
          rec.employeeNumber || rec.employeeId,
          rec.employeeName,
          this.formatCurrency(rec.baseSalary),
          this.formatCurrency(rec.bonuses),
          this.formatCurrency(rec.deductions),
          this.formatCurrency(rec.overtime),
          this.formatCurrency(rec.totalSalary),
          this.formatDate(rec.paymentDate),
          rec.status
        ]),
        startY: lastY,
        styles: { fontSize: 8 }
      });
      lastY = (doc as any).lastAutoTable.finalY + 10;
      // Gastos
      autoTable(doc, {
        head: [[
          'Descripción', 'Monto', 'Categoría', 'Proveedor', 'Fecha', 'Estatus'
        ]],
        body: (expenses || []).map((exp: any) => [
          exp.description,
          this.formatCurrency(exp.amount),
          exp.category,
          exp.vendor || '',
          this.formatDate(exp.expenseDate || exp.date),
          exp.status
        ]),
        startY: lastY,
        styles: { fontSize: 8 }
      });
      lastY = (doc as any).lastAutoTable.finalY + 10;
      // Ingresos
      autoTable(doc, {
        head: [[
          'Descripción', 'Monto', 'Categoría', 'Fuente', 'Fecha', 'Estatus'
        ]],
        body: (incomes || []).map((inc: any) => [
          inc.description,
          this.formatCurrency(inc.amount),
          inc.category,
          inc.source || '',
          this.formatDate(inc.incomeDate || inc.date),
          inc.status
        ]),
        startY: lastY,
        styles: { fontSize: 8 }
      });
      doc.save('analisis_costos.pdf');
      this.showNotification('Análisis de costos exportado en PDF', 'success');
    }).catch(() => {
      doc.save('analisis_costos.pdf');
      this.showNotification('Análisis de costos exportado en PDF (sin datos de gastos/ingresos)', 'warning');
    });
  }

  // Reporte anual (PDF de nómina de todo el año seleccionado)
  exportAnnualReport(): void {
    const doc = new jsPDF();
    doc.text('Reporte Anual de Nómina', 14, 15);
    const filtered = this.salaryRecords.filter(r => r.year === this.selectedYear);
    const tableData = filtered.map(rec => [
      rec.employeeNumber || rec.employeeId,
      rec.employeeName,
      rec.month,
      this.formatCurrency(rec.baseSalary),
      this.formatCurrency(rec.bonuses),
      this.formatCurrency(rec.deductions),
      this.formatCurrency(rec.overtime),
      this.formatCurrency(rec.totalSalary),
      this.formatDate(rec.paymentDate),
      rec.status
    ]);
    autoTable(doc, {
      head: [[
        'No. Empleado', 'Nombre', 'Mes', 'Sueldo Base', 'Bonos', 'Deducciones', 'Horas Extra', 'Total', 'Fecha Pago', 'Estatus'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('reporte_anual_nomina.pdf');
    this.showNotification('Reporte anual exportado en PDF', 'success');
  }

  // Reporte por empleado (PDF de historial de pagos de un empleado)
  exportEmployeeReport(): void {
    const empleadoId = prompt('Ingrese el ID del empleado para el reporte:');
    if (!empleadoId) {
      this.showNotification('No se proporcionó un ID de empleado', 'warning');
      return;
    }
    const filtered = this.salaryRecords.filter(r => String(r.employeeId) === empleadoId);
    const employee = this.employees.find(e => String(e.id) === empleadoId);
    const doc = new jsPDF();
    doc.text(`Historial de Pagos - ${employee ? employee.firstName + ' ' + employee.lastName : 'Empleado ' + empleadoId}`, 14, 15);
    autoTable(doc, {
      head: [[
        'No. Empleado', 'Nombre', 'Periodo', 'Sueldo Base', 'Bonos', 'Deducciones', 'Horas Extra', 'Total', 'Fecha Pago', 'Estatus'
      ]],
      body: filtered.length === 0
        ? [['-', '-', '-', '-', '-', '-', '-', '-', '-', '-']]
        : filtered.map(rec => [
            rec.employeeNumber || rec.employeeId,
            rec.employeeName,
            rec.month + ' ' + rec.year,
            this.formatCurrency(rec.baseSalary),
            this.formatCurrency(rec.bonuses),
            this.formatCurrency(rec.deductions),
            this.formatCurrency(rec.overtime),
            this.formatCurrency(rec.totalSalary),
            this.formatDate(rec.paymentDate),
            rec.status
          ]),
      startY: 20,
      styles: { fontSize: 8 }
    });
    // Tabla de datos del empleado
    if (employee) {
      autoTable(doc, {
        head: [[
          'ID', 'Nombre', 'Departamento', 'Puesto', 'Correo', 'Teléfono', 'Salario', 'Fecha de Ingreso', 'Estatus'
        ]],
        body: [[
          employee.employeeNumber || employee.id || '-',
          employee.firstName + ' ' + (employee.middleName ? employee.middleName + ' ' : '') + employee.lastName,
          employee.department || '-',
          employee.position || '-',
          employee.email || '-',
          employee.phone || '-',
          this.formatCurrency(employee.salary),
          this.formatDate(employee.hireDate),
          employee.status || '-'
        ]],
        startY: (doc as any).lastAutoTable.finalY + 10,
        styles: { fontSize: 8 }
      });
    }
    doc.save(`reporte_empleado_${empleadoId}.pdf`);
    if (filtered.length === 0) {
      this.showNotification('No se encontraron registros para ese empleado, se generó PDF vacío', 'warning');
    } else {
      this.showNotification('Reporte de empleado exportado en PDF', 'success');
    }
  }
  userRole: string = '';
  activeTab: 'overview' | 'payroll' | 'config' | 'reports' = 'overview';
  
  // Forms
  salaryForm!: FormGroup;
  configForm!: FormGroup;
  
  // Data
  employees: Employee[] = [];
  salaryRecords: SalaryRecord[] = [];
  loadingPayroll: boolean = false;
  salaryConfigs: SalaryConfig[] = [];
  
  // Filters
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear();
  selectedDepartment: string = '';
  selectedStatus: string = '';
  
  // Statistics
  totalPayroll: number = 0;
  totalEmployees: number = 0;
  averageSalary: number = 0;
  pendingPayments: number = 0;
  
  // Months and years for filters
  months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];
  
  years: number[] = [];
  departments: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService,
    private paymentService: PaymentService,
    private dashboardService: DashboardService,
    private financialService: FinancialService
        // (Líneas eliminadas: ya están correctamente dentro de exportCostAnalysis)
  ) {
    this.initializeForms();
    this.generateYears();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEmployeesFromApi();
    this.loadPayrollFromApi();
    this.loadDashboardStatsFromApi();
    this.checkAuthentication();
  }
  loadDashboardStatsFromApi(): void {
    this.dashboardService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.totalEmployees = Number(stats.totalEmployees) || 0;
        this.totalPayroll = Number(stats.monthlyPayroll) || 0;
        this.averageSalary = this.totalEmployees > 0 ? this.totalPayroll / this.totalEmployees : 0;
      }
    });
  }
  loadPayrollFromApi(): void {
    this.loadingPayroll = true;
    this.paymentService.getAllPayments().subscribe({
      next: (payments: Payment[]) => {
        this.salaryRecords = payments.map(payment => ({
          id: payment.id || 0,
          employeeId: payment.employeeId,
          employeeName: payment.employeeName || this.getEmployeeName(payment.employeeId),
          employeeNumber: this.getEmployeeNumber(payment.employeeId),
          month: this.extractMonth(payment.paymentDate),
          year: this.extractYear(payment.paymentDate),
          baseSalary: payment.amount, // Assuming amount is base salary
          bonuses: 0, // If available, map accordingly
          deductions: 0, // If available, map accordingly
          overtime: 0, // If available, map accordingly
          totalSalary: payment.amount,
          paymentDate: payment.paymentDate,
          status: payment.status as 'pending' | 'paid' | 'cancelled',
          notes: payment.notes || ''
        }));
        this.calculateStatistics();
        this.loadingPayroll = false;
      },
      error: () => {
        this.salaryRecords = [];
        this.loadingPayroll = false;
      }
    });
  }

  getEmployeeName(employeeId: number): string {
    const emp = this.employees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }

  getEmployeeNumber(employeeId: number): string | undefined {
    const emp = this.employees.find(e => e.id === employeeId);
    return emp?.employeeNumber;
  }

  extractMonth(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return (d.getMonth() + 1).toString().padStart(2, '0');
  }

  extractYear(dateStr: string): number {
    if (!dateStr) return new Date().getFullYear();
    return new Date(dateStr).getFullYear();
  }

  initializeForms(): void {
    this.salaryForm = this.fb.group({
      employeeId: ['', Validators.required],
      month: ['', Validators.required],
      year: [new Date().getFullYear(), Validators.required],
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      bonuses: [0, [Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      overtime: [0, [Validators.min(0)]],
      notes: ['']
    });

    this.configForm = this.fb.group({
      name: ['', Validators.required],
      type: ['bonus', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      percentage: [false],
      description: ['']
    });
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
  }

  loadUserInfo(): void {
    // Simular carga de información del usuario
    this.userRole = localStorage.getItem('userRole') || 'admin';
  }


  loadEmployeesFromApi(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
        this.departments = [...new Set(this.employees.map(emp => emp.department))];
        this.calculateStatistics();
      }
    });
  }

  checkAuthentication(): void {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || (userRole !== 'admin' && userRole !== 'employee')) {
      this.router.navigate(['/login']);
    }
  }

  setActiveTab(tab: 'overview' | 'payroll' | 'config' | 'reports'): void {
    this.activeTab = tab;
  }

  calculateStatistics(): void {
    // Pagos pendientes: registros con estado 'pending' (esto sí es local)
    this.pendingPayments = this.salaryRecords.filter(record => record.status === 'pending').length;
  }

  onSubmitSalary(): void {
    if (this.salaryForm.valid) {
      const formValue = this.salaryForm.value;
      const employee = this.employees.find(emp => emp.id === formValue.employeeId);
      if (employee) {
        const payment: Payment = {
          employeeId: formValue.employeeId,
          employeeName: `${employee.firstName} ${employee.lastName}`,
          amount: formValue.baseSalary, // Map as needed
          type: 'salary',
          paymentDate: new Date().toISOString().split('T')[0],
          description: formValue.notes || '',
          status: 'pending',
          notes: formValue.notes || ''
        };
        this.paymentService.createPayment(payment).subscribe({
          next: () => {
            this.loadPayrollFromApi();
            this.salaryForm.reset({
              year: new Date().getFullYear(),
              baseSalary: 0,
              bonuses: 0,
              deductions: 0,
              overtime: 0
            });
            this.showNotification('Registro de sueldo creado exitosamente', 'success');
          },
          error: () => {
            this.showNotification('Error al crear el registro de sueldo', 'error');
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.salaryForm);
    }
  }

  onSubmitConfig(): void {
    if (this.configForm.valid) {
      const formValue = this.configForm.value;
      
      const newConfig: SalaryConfig = {
        id: this.salaryConfigs.length + 1,
        name: formValue.name,
        type: formValue.type,
        amount: formValue.amount,
        percentage: formValue.percentage,
        description: formValue.description
      };

      this.salaryConfigs.push(newConfig);
      this.configForm.reset({
        type: 'bonus',
        amount: 0,
        percentage: false
      });
      
      this.showNotification('Configuración de sueldo creada exitosamente', 'success');
    } else {
      this.markFormGroupTouched(this.configForm);
    }
  }

  getFilteredSalaryRecords(): SalaryRecord[] {
    return this.salaryRecords.filter(record => {
      const monthMatch = !this.selectedMonth || record.month === this.selectedMonth;
      const yearMatch = !this.selectedYear || record.year === this.selectedYear;
      const statusMatch = !this.selectedStatus || record.status === this.selectedStatus;
      
      const employee = this.employees.find(emp => emp.id === record.employeeId);
      const departmentMatch = !this.selectedDepartment || (employee && employee.department === this.selectedDepartment);
      
      return monthMatch && yearMatch && statusMatch && departmentMatch;
    });
  }

  updateSalaryStatus(recordId: number, status: 'pending' | 'paid' | 'cancelled'): void {
    this.paymentService.updatePaymentStatus(recordId, status).subscribe({
      next: () => {
        this.loadPayrollFromApi();
        this.showNotification(`Estado actualizado a: ${this.getStatusText(status)}`, 'success');
      },
      error: () => {
        this.showNotification('Error al actualizar el estado', 'error');
      }
    });
  }

  deleteSalaryRecord(recordId: number): void {
    this.paymentService.deletePayment(recordId).subscribe({
      next: () => {
        this.loadPayrollFromApi();
        this.showNotification('Registro de sueldo eliminado', 'success');
      },
      error: () => {
        this.showNotification('Error al eliminar el registro', 'error');
      }
    });
  }

  deleteConfig(configId: number): void {
    const index = this.salaryConfigs.findIndex(c => c.id === configId);
    if (index !== -1) {
      this.salaryConfigs.splice(index, 1);
      this.showNotification('Configuración eliminada', 'success');
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  }

  getMonthName(month: string): string {
    const monthObj = this.months.find(m => m.value === month);
    return monthObj ? monthObj.label : month;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-MX');
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    // Simular notificación
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportPayroll(): void {
    // Generar PDF de nómina
    const doc = new jsPDF();
    doc.text('Reporte de Nómina', 14, 15);
    const tableData = this.salaryRecords.map(rec => [
      rec.employeeNumber || rec.employeeId,
      rec.employeeName,
      rec.month + ' ' + rec.year,
      this.formatCurrency(rec.baseSalary),
      this.formatCurrency(rec.bonuses),
      this.formatCurrency(rec.deductions),
      this.formatCurrency(rec.overtime),
      this.formatCurrency(rec.totalSalary),
      this.formatDate(rec.paymentDate),
      rec.status
    ]);
    autoTable(doc, {
      head: [[
        'No. Empleado', 'Nombre', 'Periodo', 'Sueldo Base', 'Bonos', 'Deducciones', 'Horas Extra', 'Total', 'Fecha Pago', 'Estatus'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('reporte_nomina.pdf');
    this.showNotification('Reporte de nómina exportado en PDF', 'success');
  }

  clearFilters(): void {
    this.selectedMonth = '';
    this.selectedYear = new Date().getFullYear();
    this.selectedDepartment = '';
    this.selectedStatus = '';
  }
}
