
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService, Employee as ApiEmployee } from '../../services/employee.service';
// @ts-ignore
import jsPDF from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

interface Employee {
  id: string;
  personalEmail: string;
  firstName: string;
  middleName: string;
  lastName: string;
  curp: string;
  rfc: string;
  nss: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  department: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  employeeNumber: string;
  status: 'active' | 'inactive';
  salary: number;
}

@Component({
  selector: 'app-employee-registration',
  templateUrl: './employee-registration.component.html',
  styleUrls: ['./employee-registration.component.css']
})
export class EmployeeRegistrationComponent implements OnInit {
  
  userRole: string = '';
  employeeForm!: FormGroup;
  isEditing = false;
  editingEmployeeId: string = '';
  
  // Data
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  departments = [
    'Administración', 'Ventas', 'IT', 'Recursos Humanos', 
    'Contabilidad', 'Marketing', 'Operaciones', 'Servicio al Cliente'
  ];
  
  positions = [
    'Director', 'Gerente', 'Supervisor', 'Analista', 'Asistente',
    'Desarrollador', 'Vendedor', 'Contador', 'Recepcionista', 'Operador'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadEmployees();
    this.checkAuthentication();
  }

  initializeForm(): void {
    this.employeeForm = this.fb.group({
      personalEmail: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      middleName: [''], // Opcional
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      curp: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z][0-9]$/)]],
      rfc: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/)]],
      nss: ['', [Validators.required, Validators.pattern(/^[0-9]{11}$/)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]],
      department: ['', Validators.required],
      position: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      employeeNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{4,6}$/)]],
      salary: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  loadUserInfo(): void {
    this.userRole = localStorage.getItem('userRole') || '';
  }

  loadEmployees(): void {
    // Load from API
    this.employeeService.getAllEmployees().subscribe({
      next: (apiEmployees) => {
        this.employees = apiEmployees.map(emp => ({
          id: emp.id?.toString() || '',
          personalEmail: emp.email,
          firstName: emp.firstName,
          middleName: emp.middleName || '',
          lastName: emp.lastName,
          curp: emp.curp || (emp.id ? `CURP${emp.id.toString().padStart(4, '0')}` : ''),
          rfc: emp.rfc || (emp.id ? `RFC${emp.id.toString().padStart(4, '0')}` : ''),
          nss: emp.nss || (emp.id ? `${emp.id.toString().padStart(11, '0')}` : ''),
          phoneNumber: emp.phone || '',
          address: emp.address || `Dirección ${emp.id || 'N/A'}`,
          postalCode: emp.postalCode || '00000',
          department: emp.department,
          position: emp.position,
          startDate: new Date(emp.hireDate),
          employeeNumber: emp.employeeNumber || (emp.id ? emp.id.toString().padStart(4, '0') : ''),
          status: emp.status === 'ACTIVE' ? 'active' : 'inactive',
          salary: emp.salary
        }));
        this.filteredEmployees = [...this.employees];
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        // Fallback to mock data
        this.loadMockEmployees();
      }
    });
  }

  loadMockEmployees(): void {
    // Simular carga de empleados
    this.employees = [
      {
        id: '1',
        personalEmail: 'maria.gonzalez@email.com',
        firstName: 'María',
        middleName: 'Isabel',
        lastName: 'González',
        curp: 'GOIM800101MDFXXX01',
        rfc: 'GOIM800101XXX',
        nss: '12345678901',
        phoneNumber: '5512345678',
        address: 'Av. Reforma 123, Col. Centro',
        postalCode: '06000',
        department: 'Ventas',
        position: 'Vendedora',
        startDate: new Date('2023-01-15'),
        employeeNumber: '1001',
        status: 'active',
        salary: 25000
      },
      {
        id: '2',
        personalEmail: 'juan.perez@email.com',
        firstName: 'Juan',
        middleName: 'Carlos',
        lastName: 'Pérez',
        curp: 'PECJ850315MDFXXX02',
        rfc: 'PECJ850315XXX',
        nss: '23456789012',
        phoneNumber: '5587654321',
        address: 'Calle Juárez 456, Col. Norte',
        postalCode: '06010',
        department: 'IT',
        position: 'Desarrollador',
        startDate: new Date('2023-03-20'),
        employeeNumber: '1002',
        status: 'active',
        salary: 35000
      }
    ];
    this.filteredEmployees = [...this.employees];
  }

  checkAuthentication(): void {
    const userRole = localStorage.getItem('userRole');
    if (!userRole || userRole !== 'admin') {
      this.router.navigate(['/login']);
    }
  }

  onSubmit(): void {
    if (this.employeeForm.valid) {
      if (this.isEditing) {
        this.updateEmployee();
      } else {
        this.createEmployee();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createEmployee(): void {
    // Create API employee
    const apiEmployee: ApiEmployee = {
      firstName: this.employeeForm.value.firstName,
      middleName: this.employeeForm.value.middleName,
      lastName: this.employeeForm.value.lastName,
      email: this.employeeForm.value.personalEmail,
      phone: this.employeeForm.value.phoneNumber,
      position: this.employeeForm.value.position,
      department: this.employeeForm.value.department,
      salary: this.employeeForm.value.salary,
      hireDate: this.employeeForm.value.startDate,
      status: 'ACTIVE',
      address: this.employeeForm.value.address,
      curp: this.employeeForm.value.curp.toUpperCase(),
      rfc: this.employeeForm.value.rfc.toUpperCase(),
      nss: this.employeeForm.value.nss,
      postalCode: this.employeeForm.value.postalCode,
      employeeNumber: this.employeeForm.value.employeeNumber
    };

    // Send to API
    this.employeeService.createEmployee(apiEmployee).subscribe({
      next: (createdEmployee) => {
        // Add to local list
        const newEmployee: Employee = {
          id: createdEmployee.id?.toString() || Date.now().toString(),
          personalEmail: this.employeeForm.value.personalEmail,
          firstName: this.employeeForm.value.firstName,
          middleName: this.employeeForm.value.middleName,
          lastName: this.employeeForm.value.lastName,
          curp: this.employeeForm.value.curp.toUpperCase(),
          rfc: this.employeeForm.value.rfc.toUpperCase(),
          nss: this.employeeForm.value.nss,
          phoneNumber: this.employeeForm.value.phoneNumber,
          address: this.employeeForm.value.address,
          postalCode: this.employeeForm.value.postalCode,
          department: this.employeeForm.value.department,
          position: this.employeeForm.value.position,
          startDate: new Date(this.employeeForm.value.startDate),
          endDate: this.employeeForm.value.endDate ? new Date(this.employeeForm.value.endDate) : undefined,
          employeeNumber: createdEmployee.id ? createdEmployee.id.toString().padStart(4, '0') : '',
          status: 'active',
          salary: this.employeeForm.value.salary
        };

        this.employees.unshift(newEmployee);
        this.filteredEmployees = [...this.employees];
        this.resetForm();
        this.showNotification('Empleado registrado exitosamente', 'success');
      },
      error: (error) => {
        console.error('Error creating employee:', error);
        this.showNotification('Error al registrar empleado. Por favor, inténtalo de nuevo.', 'error');
      }
    });
  }

  updateEmployee(): void {
    const employeeIndex = this.employees.findIndex(emp => emp.id === this.editingEmployeeId);
    if (employeeIndex !== -1) {
      // Create API employee for update
      const apiEmployee: ApiEmployee = {
        firstName: this.employeeForm.value.firstName,
        middleName: this.employeeForm.value.middleName,
        lastName: this.employeeForm.value.lastName,
        email: this.employeeForm.value.personalEmail,
        phone: this.employeeForm.value.phoneNumber,
        position: this.employeeForm.value.position,
        department: this.employeeForm.value.department,
        salary: this.employeeForm.value.salary,
        hireDate: this.employeeForm.value.startDate,
        status: 'ACTIVE',
        address: this.employeeForm.value.address,
        curp: this.employeeForm.value.curp.toUpperCase(),
        rfc: this.employeeForm.value.rfc.toUpperCase(),
        nss: this.employeeForm.value.nss,
        postalCode: this.employeeForm.value.postalCode,
        employeeNumber: this.employeeForm.value.employeeNumber
      };

      // Send to API
      this.employeeService.updateEmployee(parseInt(this.editingEmployeeId), apiEmployee).subscribe({
        next: (updatedEmployee) => {
          // Update local list
          this.employees[employeeIndex] = {
            ...this.employees[employeeIndex],
            personalEmail: this.employeeForm.value.personalEmail,
            firstName: this.employeeForm.value.firstName,
            middleName: this.employeeForm.value.middleName,
            lastName: this.employeeForm.value.lastName,
            curp: this.employeeForm.value.curp.toUpperCase(),
            rfc: this.employeeForm.value.rfc.toUpperCase(),
            nss: this.employeeForm.value.nss,
            phoneNumber: this.employeeForm.value.phoneNumber,
            address: this.employeeForm.value.address,
            postalCode: this.employeeForm.value.postalCode,
            department: this.employeeForm.value.department,
            position: this.employeeForm.value.position,
            startDate: new Date(this.employeeForm.value.startDate),
            endDate: this.employeeForm.value.endDate ? new Date(this.employeeForm.value.endDate) : undefined,
            employeeNumber: this.employeeForm.value.employeeNumber,
            salary: this.employeeForm.value.salary
          };

          this.filteredEmployees = [...this.employees];
          this.resetForm();
          this.isEditing = false;
          this.editingEmployeeId = '';
          this.showNotification('Empleado actualizado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          this.showNotification('Error al actualizar empleado. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
  }

  editEmployee(employee: Employee): void {
    this.isEditing = true;
    this.editingEmployeeId = employee.id;
    
    this.employeeForm.patchValue({
      personalEmail: employee.personalEmail,
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
      curp: employee.curp,
      rfc: employee.rfc,
      nss: employee.nss,
      phoneNumber: employee.phoneNumber,
      address: employee.address,
      postalCode: employee.postalCode,
      department: employee.department,
      position: employee.position,
      startDate: this.formatDateForInput(employee.startDate),
      endDate: employee.endDate ? this.formatDateForInput(employee.endDate) : '',
      employeeNumber: employee.employeeNumber,
      salary: employee.salary
    });
  }

  deleteEmployee(employeeId: string): void {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      this.employeeService.deleteEmployee(parseInt(employeeId)).subscribe({
        next: () => {
          this.employees = this.employees.filter(emp => emp.id !== employeeId);
          this.filteredEmployees = this.filteredEmployees.filter(emp => emp.id !== employeeId);
          this.showNotification('Empleado eliminado exitosamente', 'success');
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.showNotification('Error al eliminar empleado. Por favor, inténtalo de nuevo.', 'error');
        }
      });
    }
  }

  toggleEmployeeStatus(employee: Employee): void {
    const newStatus = employee.status === 'active' ? 'inactive' : 'active';
    // Construir el objeto con los campos requeridos por la API
    const apiEmployee = {
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
      email: employee.personalEmail, // Mapeo correcto
      phone: employee.phoneNumber,   // Mapeo correcto
      position: employee.position,
      department: employee.department,
      salary: employee.salary,
      hireDate: (employee.startDate instanceof Date ? employee.startDate.toISOString().split('T')[0] : employee.startDate), // Mapeo correcto
      status: newStatus === 'active' ? 'ACTIVE' : 'INACTIVE',
      address: employee.address,
      curp: employee.curp,
      rfc: employee.rfc,
      nss: employee.nss,
      postalCode: employee.postalCode,
      employeeNumber: employee.employeeNumber
    };
    this.employeeService.updateEmployee(parseInt(employee.id), apiEmployee).subscribe({
      next: () => {
        employee.status = newStatus;
        this.showNotification(`Empleado ${employee.status === 'active' ? 'activado' : 'desactivado'}`, 'success');
      },
      error: (error) => {
        this.showNotification('Error al cambiar el estatus del empleado', 'error');
        console.error('Error actualizando estatus:', error);
      }
    });
  }

  resetForm(): void {
    this.employeeForm.reset();
    this.isEditing = false;
    this.editingEmployeeId = '';
  }

  cancelEdit(): void {
    this.resetForm();
  }

  markFormGroupTouched(): void {
    Object.keys(this.employeeForm.controls).forEach(key => {
      const control = this.employeeForm.get(key);
      control?.markAsTouched();
    });
  }

  getFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'success' : 'danger';
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  showNotification(message: string, type: 'success' | 'error' | 'warning'): void {
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportEmployees(): void {
    // Generar PDF de empleados
    const doc = new jsPDF();
    doc.text('Lista de Empleados', 14, 15);
    const tableData = this.employees.map(emp => [
      emp.employeeNumber,
      this.getFullName(emp),
      emp.department,
      emp.position,
      emp.status === 'active' ? 'Activo' : 'Inactivo',
      this.formatCurrency(emp.salary)
    ]);
    autoTable(doc, {
      head: [[
        'No. Empleado', 'Nombre', 'Departamento', 'Puesto', 'Estatus', 'Salario'
      ]],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('empleados.pdf');
    this.showNotification('Lista de empleados exportada en PDF', 'success');
  }

  searchEmployees(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredEmployees = [...this.employees];
    } else {
      this.filteredEmployees = this.employees.filter(emp => 
        this.getFullName(emp).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeNumber.includes(searchTerm) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchEmployees(target.value);
  }
} 