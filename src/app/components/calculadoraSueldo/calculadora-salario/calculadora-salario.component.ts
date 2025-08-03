import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface SalaryResult {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  description?: string;
}

interface SalaryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-calculadora-salario',
  templateUrl: './calculadora-salario.component.html',
  styleUrls: ['./calculadora-salario.component.css']
})
export class CalculadoraSalarioComponent implements OnInit {
  userRole: string = '';
  
  // Form
  salaryForm!: FormGroup;
  
  // Results
  salaryResults: SalaryResult[] = [];
  salaryBreakdown: SalaryBreakdown[] = [];
  
  // UI State
  showBreakdown: boolean = false;
  showDetails: boolean = false;
  
  // Constants
  readonly IMSS_EMPLOYEE_RATE = 0.025; // 2.5%
  readonly IMSS_EMPLOYER_RATE = 0.205; // 20.5%
  readonly INFONAVIT_RATE = 0.05; // 5%
  readonly ISR_SUBSIDY_RATE = 0.0092; // 0.92%
  readonly SAR_RATE = 0.02; // 2%
  
  // IMSS Base Limits
  readonly IMSS_BASE_MIN = 123.22; // Salario mínimo diario
  readonly IMSS_BASE_MAX = 25000; // Top salary for IMSS

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAuthentication();
  }

  initializeForm(): void {
    this.salaryForm = this.fb.group({
      // Basic Information
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      workDays: [30, [Validators.required, Validators.min(1), Validators.max(31)]],
      workHours: [8, [Validators.required, Validators.min(1), Validators.max(24)]],
      
      // Overtime
      overtimeHours: [0, [Validators.min(0)]],
      overtimeRate: [1.5, [Validators.min(1)]],
      
      // Bonuses and Allowances
      bonuses: [0, [Validators.min(0)]],
      allowances: [0, [Validators.min(0)]],
      commissions: [0, [Validators.min(0)]],
      
      // Deductions
      otherDeductions: [0, [Validators.min(0)]],
      
      // Benefits
      hasIMSS: [true],
      hasINFONAVIT: [true],
      hasSAR: [true],
      hasISRSubsidy: [false],
      
      // Additional Information
      hasVacationBonus: [true],
      hasChristmasBonus: [true],
      hasProfitSharing: [false],
      profitSharingPercentage: [0, [Validators.min(0), Validators.max(100)]]
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

  calculateSalary(): void {
    if (this.salaryForm.valid) {
      const formValue = this.salaryForm.value;
      
      // Basic calculations
      const dailySalary = formValue.baseSalary / formValue.workDays;
      const hourlySalary = dailySalary / formValue.workHours;
      
      // Overtime calculations
      const overtimePay = (hourlySalary * formValue.overtimeHours * formValue.overtimeRate);
      
      // Gross salary
      const grossSalary = formValue.baseSalary + overtimePay + formValue.bonuses + 
                         formValue.allowances + formValue.commissions;
      
      // IMSS calculations
      const imssBase = Math.min(grossSalary, this.IMSS_BASE_MAX);
      const imssEmployee = formValue.hasIMSS ? imssBase * this.IMSS_EMPLOYEE_RATE : 0;
      const imssEmployer = formValue.hasIMSS ? imssBase * this.IMSS_EMPLOYER_RATE : 0;
      
      // INFONAVIT
      const infonavitEmployee = formValue.hasINFONAVIT ? grossSalary * this.INFONAVIT_RATE : 0;
      
      // SAR
      const sarEmployer = formValue.hasSAR ? grossSalary * this.SAR_RATE : 0;
      
      // ISR Subsidy
      const isrSubsidy = formValue.hasISRSubsidy ? grossSalary * this.ISR_SUBSIDY_RATE : 0;
      
      // Total deductions
      const totalDeductions = imssEmployee + infonavitEmployee + formValue.otherDeductions;
      
      // Net salary
      const netSalary = grossSalary - totalDeductions + isrSubsidy;
      
      // Benefits calculations
      const vacationBonus = formValue.hasVacationBonus ? grossSalary * 0.25 : 0;
      const christmasBonus = formValue.hasChristmasBonus ? grossSalary * 0.0833 : 0; // 15 days / 180 days
      const profitSharing = formValue.hasProfitSharing ? 
        (grossSalary * formValue.profitSharingPercentage / 100) : 0;
      
      // Total benefits
      const totalBenefits = vacationBonus + christmasBonus + profitSharing;
      
      // Annual calculations
      const annualGross = grossSalary * 12;
      const annualNet = netSalary * 12;
      const annualBenefits = totalBenefits * 12;
      
      // Generate results
      this.generateSalaryResults({
        dailySalary,
        hourlySalary,
        overtimePay,
        grossSalary,
        imssEmployee,
        imssEmployer,
        infonavitEmployee,
        sarEmployer,
        isrSubsidy,
        totalDeductions,
        netSalary,
        vacationBonus,
        christmasBonus,
        profitSharing,
        totalBenefits,
        annualGross,
        annualNet,
        annualBenefits
      });
      
      // Generate breakdown
      this.generateSalaryBreakdown({
        grossSalary,
        imssEmployee,
        infonavitEmployee,
        otherDeductions: formValue.otherDeductions,
        isrSubsidy,
        netSalary
      });
      
      this.showBreakdown = true;
      this.showDetails = true;
    } else {
      this.markFormGroupTouched(this.salaryForm);
    }
  }

  generateSalaryResults(data: any): void {
    this.salaryResults = [
      {
        label: 'Salario Diario',
        value: data.dailySalary,
        formattedValue: this.formatCurrency(data.dailySalary),
        color: 'primary',
        description: 'Salario base por día trabajado'
      },
      {
        label: 'Salario por Hora',
        value: data.hourlySalary,
        formattedValue: this.formatCurrency(data.hourlySalary),
        color: 'info',
        description: 'Salario base por hora trabajada'
      },
      {
        label: 'Horas Extra',
        value: data.overtimePay,
        formattedValue: this.formatCurrency(data.overtimePay),
        color: 'success',
        description: 'Pago por horas extra trabajadas'
      },
      {
        label: 'Salario Bruto',
        value: data.grossSalary,
        formattedValue: this.formatCurrency(data.grossSalary),
        color: 'primary',
        description: 'Salario antes de deducciones'
      },
      {
        label: 'IMSS Empleado',
        value: data.imssEmployee,
        formattedValue: this.formatCurrency(data.imssEmployee),
        color: 'warning',
        description: 'Contribución del empleado al IMSS'
      },
      {
        label: 'INFONAVIT',
        value: data.infonavitEmployee,
        formattedValue: this.formatCurrency(data.infonavitEmployee),
        color: 'warning',
        description: 'Contribución al INFONAVIT'
      },
      {
        label: 'Otras Deducciones',
        value: data.otherDeductions,
        formattedValue: this.formatCurrency(data.otherDeductions),
        color: 'danger',
        description: 'Deducciones adicionales'
      },
      {
        label: 'Subsidio ISR',
        value: data.isrSubsidy,
        formattedValue: this.formatCurrency(data.isrSubsidy),
        color: 'success',
        description: 'Subsidio al empleo (si aplica)'
      },
      {
        label: 'Total Deducciones',
        value: data.totalDeductions,
        formattedValue: this.formatCurrency(data.totalDeductions),
        color: 'danger',
        description: 'Suma total de deducciones'
      },
      {
        label: 'Salario Neto',
        value: data.netSalary,
        formattedValue: this.formatCurrency(data.netSalary),
        color: 'success',
        description: 'Salario después de deducciones'
      },
      {
        label: 'Aguinaldo',
        value: data.christmasBonus,
        formattedValue: this.formatCurrency(data.christmasBonus),
        color: 'info',
        description: 'Bono de fin de año (15 días)'
      },
      {
        label: 'PTU',
        value: data.profitSharing,
        formattedValue: this.formatCurrency(data.profitSharing),
        color: 'success',
        description: 'Participación en utilidades'
      },
      {
        label: 'Salario Anual Bruto',
        value: data.annualGross,
        formattedValue: this.formatCurrency(data.annualGross),
        color: 'primary',
        description: 'Salario bruto anual'
      },
      {
        label: 'Salario Anual Neto',
        value: data.annualNet,
        formattedValue: this.formatCurrency(data.annualNet),
        color: 'success',
        description: 'Salario neto anual'
      }
    ];
  }

  generateSalaryBreakdown(data: any): void {
    const total = data.grossSalary;
    
    this.salaryBreakdown = [
      {
        category: 'Salario Bruto',
        amount: data.grossSalary,
        percentage: (data.grossSalary / total) * 100,
        color: '#007bff'
      },
      {
        category: 'IMSS',
        amount: data.imssEmployee,
        percentage: (data.imssEmployee / total) * 100,
        color: '#ffc107'
      },
      {
        category: 'INFONAVIT',
        amount: data.infonavitEmployee,
        percentage: (data.infonavitEmployee / total) * 100,
        color: '#fd7e14'
      },
      {
        category: 'Otras Deducciones',
        amount: data.otherDeductions,
        percentage: (data.otherDeductions / total) * 100,
        color: '#dc3545'
      },
      {
        category: 'Subsidio ISR',
        amount: data.isrSubsidy,
        percentage: (data.isrSubsidy / total) * 100,
        color: '#28a745'
      },
      {
        category: 'Salario Neto',
        amount: data.netSalary,
        percentage: (data.netSalary / total) * 100,
        color: '#20c997'
      }
    ];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return value.toFixed(2) + '%';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetCalculator(): void {
    this.salaryForm.reset({
      workDays: 30,
      workHours: 8,
      overtimeRate: 1.5,
      hasIMSS: true,
      hasINFONAVIT: true,
      hasSAR: true,
      hasISRSubsidy: false,
      hasVacationBonus: true,
      hasChristmasBonus: true,
      hasProfitSharing: false,
      profitSharingPercentage: 0
    });
    this.salaryResults = [];
    this.salaryBreakdown = [];
    this.showBreakdown = false;
    this.showDetails = false;
  }

  exportResults(): void {
    // Simular exportación
    console.log('Exportando resultados de salario...');
    alert('Resultados exportados exitosamente');
  }

  goBack(): void {
    this.router.navigate(['/calculadora-sueldo']);
  }

  toggleBreakdown(): void {
    this.showBreakdown = !this.showBreakdown;
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
