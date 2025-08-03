import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface IndemnizationResult {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  description?: string;
}

interface SeveranceCalculation {
  baseSalary: number;
  yearsWorked: number;
  monthsWorked: number;
  daysWorked: number;
  terminationType: string;
  hasVacationBonus: boolean;
  hasChristmasBonus: boolean;
  hasProfitSharing: boolean;
  otherBenefits: number;
}

@Component({
  selector: 'app-calculadora-indemnizaciones',
  templateUrl: './calculadora-indemnizaciones.component.html',
  styleUrls: ['./calculadora-indemnizaciones.component.css']
})
export class CalculadoraIndemnizacionesComponent implements OnInit {
  userRole: string = '';
  
  // Forms
  indemnizationForm!: FormGroup;
  
  // Results
  indemnizationResults: IndemnizationResult[] = [];
  
  // UI State
  showDetails: boolean = false;
  showBreakdown: boolean = false;
  
  // Constants
  readonly VACATION_DAYS_PER_YEAR = 12;
  readonly CHRISTMAS_BONUS_DAYS = 15;
  readonly SEVERANCE_DAYS_PER_YEAR = 20;
  readonly INTEGRATION_FACTOR = 1.0452; // Factor de integración del salario

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
    this.indemnizationForm = this.fb.group({
      // Employee Information
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      
      // Termination Information
      terminationType: ['voluntary', Validators.required],
      terminationReason: [''],
      
      // Benefits
      hasVacationBonus: [true],
      hasChristmasBonus: [true],
      hasProfitSharing: [false],
      profitSharingPercentage: [0, [Validators.min(0), Validators.max(100)]],
      otherBenefits: [0, [Validators.min(0)]],
      
      // Additional Information
      unusedVacationDays: [0, [Validators.min(0), Validators.max(365)]],
      pendingBonuses: [0, [Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      
      // Legal Considerations
      isUnjustifiedDismissal: [false],
      hasLaborRights: [true],
      seniorityBonus: [true]
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

  calculateIndemnization(): void {
    if (this.indemnizationForm.valid) {
      const formValue = this.indemnizationForm.value;
      
      // Calculate work period
      const startDate = new Date(formValue.startDate);
      const endDate = new Date(formValue.endDate);
      const workPeriod = this.calculateWorkPeriod(startDate, endDate);
      
      // Calculate base amounts
      const integratedSalary = formValue.baseSalary * this.INTEGRATION_FACTOR;
      const dailySalary = integratedSalary / 30.4;
      
      // Calculate severance pay
      const severancePay = this.calculateSeverancePay(workPeriod, dailySalary, formValue.terminationType);
      
      // Calculate seniority bonus
      const seniorityBonus = formValue.seniorityBonus ? 
        this.calculateSeniorityBonus(workPeriod, dailySalary) : 0;
      
      // Calculate vacation benefits
      const vacationBenefits = this.calculateVacationBenefits(
        workPeriod, 
        dailySalary, 
        formValue.hasVacationBonus,
        formValue.unusedVacationDays
      );
      
      // Calculate Christmas bonus
      const christmasBonus = formValue.hasChristmasBonus ? 
        this.calculateChristmasBonus(workPeriod, dailySalary) : 0;
      
      // Calculate profit sharing
      const profitSharing = formValue.hasProfitSharing ? 
        this.calculateProfitSharing(integratedSalary, formValue.profitSharingPercentage) : 0;
      
      // Calculate other benefits
      const otherBenefits = formValue.otherBenefits;
      const pendingBonuses = formValue.pendingBonuses;
      
      // Calculate total
      const subtotal = severancePay + seniorityBonus + vacationBenefits + 
                      christmasBonus + profitSharing + otherBenefits + pendingBonuses;
      
      // Apply deductions
      const deductions = formValue.deductions;
      const total = Math.max(0, subtotal - deductions);
      
      // Generate results
      this.generateIndemnizationResults({
        workPeriod,
        integratedSalary,
        dailySalary,
        severancePay,
        seniorityBonus,
        vacationBenefits,
        christmasBonus,
        profitSharing,
        otherBenefits,
        pendingBonuses,
        subtotal,
        deductions,
        total,
        terminationType: formValue.terminationType
      });
      
      this.showDetails = true;
      this.showBreakdown = true;
    } else {
      this.markFormGroupTouched(this.indemnizationForm);
    }
  }

  calculateWorkPeriod(startDate: Date, endDate: Date): any {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;
    
    return {
      totalDays: diffDays,
      years,
      months,
      days,
      totalYears: diffDays / 365
    };
  }

  calculateSeverancePay(workPeriod: any, dailySalary: number, terminationType: string): number {
    if (terminationType === 'voluntary') {
      return 0; // No severance pay for voluntary resignation
    }
    
    // 20 days per year worked
    const severanceDays = workPeriod.totalYears * this.SEVERANCE_DAYS_PER_YEAR;
    return severanceDays * dailySalary;
  }

  calculateSeniorityBonus(workPeriod: any, dailySalary: number): number {
    // 12 days per year worked, minimum 5 days
    const seniorityDays = Math.max(5, workPeriod.totalYears * 12);
    return seniorityDays * dailySalary;
  }

  calculateVacationBenefits(workPeriod: any, dailySalary: number, hasBonus: boolean, unusedDays: number): number {
    // Calculate earned vacation days
    const earnedVacationDays = workPeriod.totalYears * this.VACATION_DAYS_PER_YEAR;
    const totalVacationDays = earnedVacationDays + unusedDays;
    
    let vacationPay = totalVacationDays * dailySalary;
    
    // Add vacation bonus if applicable
    if (hasBonus) {
      vacationPay += vacationPay * 0.25; // 25% bonus
    }
    
    return vacationPay;
  }

  calculateChristmasBonus(workPeriod: any, dailySalary: number): number {
    // 15 days of salary
    return this.CHRISTMAS_BONUS_DAYS * dailySalary;
  }

  calculateProfitSharing(integratedSalary: number, percentage: number): number {
    return integratedSalary * (percentage / 100);
  }

  generateIndemnizationResults(data: any): void {
    this.indemnizationResults = [
      {
        label: 'Período Laborado',
        value: data.workPeriod.totalYears,
        formattedValue: `${data.workPeriod.years} años, ${data.workPeriod.months} meses, ${data.workPeriod.days} días`,
        color: 'info',
        description: 'Tiempo total de servicio'
      },
      {
        label: 'Salario Integrado',
        value: data.integratedSalary,
        formattedValue: this.formatCurrency(data.integratedSalary),
        color: 'primary',
        description: 'Salario base con factor de integración'
      },
      {
        label: 'Salario Diario',
        value: data.dailySalary,
        formattedValue: this.formatCurrency(data.dailySalary),
        color: 'info',
        description: 'Salario diario integrado'
      },
      {
        label: 'Indemnización',
        value: data.severancePay,
        formattedValue: this.formatCurrency(data.severancePay),
        color: 'warning',
        description: data.terminationType === 'voluntary' ? 'No aplica para renuncia voluntaria' : '20 días por año trabajado'
      },
      {
        label: 'Prima de Antigüedad',
        value: data.seniorityBonus,
        formattedValue: this.formatCurrency(data.seniorityBonus),
        color: 'success',
        description: '12 días por año trabajado (mínimo 5 días)'
      },
      {
        label: 'Prestaciones Vacacionales',
        value: data.vacationBenefits,
        formattedValue: this.formatCurrency(data.vacationBenefits),
        color: 'info',
        description: 'Vacaciones + prima vacacional'
      },
      {
        label: 'Aguinaldo',
        value: data.christmasBonus,
        formattedValue: this.formatCurrency(data.christmasBonus),
        color: 'success',
        description: '15 días de salario'
      },
      {
        label: 'PTU',
        value: data.profitSharing,
        formattedValue: this.formatCurrency(data.profitSharing),
        color: 'warning',
        description: 'Participación en utilidades'
      },
      {
        label: 'Otros Beneficios',
        value: data.otherBenefits,
        formattedValue: this.formatCurrency(data.otherBenefits),
        color: 'secondary',
        description: 'Beneficios adicionales'
      },
      {
        label: 'Bonos Pendientes',
        value: data.pendingBonuses,
        formattedValue: this.formatCurrency(data.pendingBonuses),
        color: 'info',
        description: 'Bonos no pagados'
      },
      {
        label: 'Subtotal',
        value: data.subtotal,
        formattedValue: this.formatCurrency(data.subtotal),
        color: 'primary',
        description: 'Suma de todas las prestaciones'
      },
      {
        label: 'Deducciones',
        value: data.deductions,
        formattedValue: this.formatCurrency(data.deductions),
        color: 'danger',
        description: 'Descuentos aplicables'
      },
      {
        label: 'Total a Recibir',
        value: data.total,
        formattedValue: this.formatCurrency(data.total),
        color: 'success',
        description: 'Monto final de la liquidación'
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
    return `${value.toFixed(1)}%`;
  }

  getBreakdownColor(color: string): string {
    const colors: { [key: string]: string } = {
      'primary': 'var(--accent-color)',
      'success': 'var(--success-color)',
      'warning': 'var(--warning-color)',
      'danger': 'var(--danger-color)',
      'info': 'var(--info-color)',
      'secondary': 'var(--text-muted)'
    };
    return colors[color] || 'var(--accent-color)';
  }

  getBreakdownPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return (value / total) * 100;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetCalculator(): void {
    this.indemnizationForm.reset({
      hasVacationBonus: true,
      hasChristmasBonus: true,
      hasProfitSharing: false,
      profitSharingPercentage: 0,
      otherBenefits: 0,
      unusedVacationDays: 0,
      pendingBonuses: 0,
      deductions: 0,
      isUnjustifiedDismissal: false,
      hasLaborRights: true,
      seniorityBonus: true
    });
    this.indemnizationResults = [];
    this.showDetails = false;
    this.showBreakdown = false;
  }

  exportResults(): void {
    console.log('Exportando resultados de indemnización...');
    alert('Resultados exportados exitosamente');
  }

  goBack(): void {
    this.router.navigate(['/calculadora-sueldo']);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  toggleBreakdown(): void {
    this.showBreakdown = !this.showBreakdown;
  }

  getTerminationTypeName(type: string): string {
    const types = {
      'voluntary': 'Renuncia Voluntaria',
      'involuntary': 'Despido Injustificado',
      'mutual': 'Terminación Mutua',
      'retirement': 'Jubilación',
      'death': 'Fallecimiento'
    };
    return types[type as keyof typeof types] || type;
  }

  getTerminationTypeColor(type: string): string {
    const colors = {
      'voluntary': 'info',
      'involuntary': 'danger',
      'mutual': 'warning',
      'retirement': 'success',
      'death': 'secondary'
    };
    return colors[type as keyof typeof colors] || 'primary';
  }
}
