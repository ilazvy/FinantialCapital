import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface CalculationResult {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  fixedAmount: number;
}

@Component({
  selector: 'app-calculadora-sueldo',
  templateUrl: './calculadoraSueldo.component.html',
  styleUrls: ['./calculadoraSueldo.component.css']
})
export class CalculadoraSueldoComponent implements OnInit {
  userRole: string = '';
  activeCalculator: 'salary' | 'tax' | 'loan' | 'investment' | 'depreciation' = 'salary';
  
  // Salary Calculator
  salaryForm!: FormGroup;
  salaryResults: CalculationResult[] = [];
  
  // Tax Calculator
  taxForm!: FormGroup;
  taxResults: CalculationResult[] = [];
  
  // Loan Calculator
  loanForm!: FormGroup;
  loanResults: CalculationResult[] = [];
  loanSchedule: any[] = [];
  
  // Investment Calculator
  investmentForm!: FormGroup;
  investmentResults: CalculationResult[] = [];
  
  // Depreciation Calculator
  depreciationForm!: FormGroup;
  depreciationResults: CalculationResult[] = [];
  depreciationSchedule: any[] = [];
  
  // Tax Brackets (ISR México 2024)
  taxBrackets: TaxBracket[] = [
    { min: 0, max: 416220.00, rate: 0.0152, fixedAmount: 0 },
    { min: 416220.01, max: 624329.00, rate: 0.0636, fixedAmount: 6322.01 },
    { min: 624329.01, max: 867123.00, rate: 0.1088, fixedAmount: 13120.45 },
    { min: 867123.01, max: 1000000.00, rate: 0.16, fixedAmount: 15429.02 },
    { min: 1000000.01, max: 3000000.00, rate: 0.1792, fixedAmount: 51833.26 },
    { min: 3000000.01, max: 10000000.00, rate: 0.2136, fixedAmount: 234993.95 },
    { min: 10000000.01, max: 20000000.00, rate: 0.2388, fixedAmount: 338944.34 },
    { min: 20000000.01, max: 999999999.99, rate: 0.35, fixedAmount: 1238536.07 }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserInfo();
    this.checkAuthentication();
  }

  initializeForms(): void {
    // Salary Calculator Form
    this.salaryForm = this.fb.group({
      baseSalary: [0, [Validators.required, Validators.min(0)]],
      workDays: [30, [Validators.required, Validators.min(1), Validators.max(31)]],
      overtimeHours: [0, [Validators.min(0)]],
      overtimeRate: [1.5, [Validators.min(1)]],
      bonuses: [0, [Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      hasIMSS: [true],
      hasINFONAVIT: [true]
    });

    // Tax Calculator Form
    this.taxForm = this.fb.group({
      annualIncome: [0, [Validators.required, Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      otherIncome: [0, [Validators.min(0)]],
      dependents: [0, [Validators.min(0)]]
    });

    // Loan Calculator Form
    this.loanForm = this.fb.group({
      principal: [0, [Validators.required, Validators.min(0)]],
      interestRate: [0, [Validators.required, Validators.min(0)]],
      termYears: [0, [Validators.required, Validators.min(0)]],
      paymentFrequency: ['monthly', Validators.required]
    });

    // Investment Calculator Form
    this.investmentForm = this.fb.group({
      initialAmount: [0, [Validators.required, Validators.min(0)]],
      monthlyContribution: [0, [Validators.min(0)]],
      annualReturn: [0, [Validators.required, Validators.min(0)]],
      years: [0, [Validators.required, Validators.min(0)]],
      compoundFrequency: ['monthly', Validators.required]
    });

    // Depreciation Calculator Form
    this.depreciationForm = this.fb.group({
      assetValue: [0, [Validators.required, Validators.min(0)]],
      salvageValue: [0, [Validators.min(0)]],
      usefulLife: [0, [Validators.required, Validators.min(0)]],
      depreciationMethod: ['straight-line', Validators.required]
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

  setActiveCalculator(calculator: 'salary' | 'tax' | 'loan' | 'investment' | 'depreciation'): void {
    this.activeCalculator = calculator;
    this.clearResults();
  }

  clearResults(): void {
    this.salaryResults = [];
    this.taxResults = [];
    this.loanResults = [];
    this.loanSchedule = [];
    this.investmentResults = [];
    this.depreciationResults = [];
    this.depreciationSchedule = [];
  }

  // Salary Calculator
  calculateSalary(): void {
    if (this.salaryForm.valid) {
      const formValue = this.salaryForm.value;
      
      const dailySalary = formValue.baseSalary / 30;
      const overtimePay = (dailySalary / 8) * formValue.overtimeHours * formValue.overtimeRate;
      const grossSalary = formValue.baseSalary + overtimePay + formValue.bonuses;
      
      // IMSS calculations (simplified)
      const imssBase = Math.min(grossSalary, 25000); // Top salary for IMSS
      const imssEmployee = formValue.hasIMSS ? imssBase * 0.025 : 0;
      const imssEmployer = formValue.hasIMSS ? imssBase * 0.205 : 0;
      
      // INFONAVIT
      const infonavitEmployee = formValue.hasINFONAVIT ? grossSalary * 0.05 : 0;
      
      const totalDeductions = imssEmployee + infonavitEmployee + formValue.deductions;
      const netSalary = grossSalary - totalDeductions;
      
      this.salaryResults = [
        { label: 'Salario Diario', value: dailySalary, formattedValue: this.formatCurrency(dailySalary), color: 'primary' },
        { label: 'Horas Extra', value: overtimePay, formattedValue: this.formatCurrency(overtimePay), color: 'success' },
        { label: 'Salario Bruto', value: grossSalary, formattedValue: this.formatCurrency(grossSalary), color: 'info' },
        { label: 'IMSS Empleado', value: imssEmployee, formattedValue: this.formatCurrency(imssEmployee), color: 'warning' },
        { label: 'INFONAVIT', value: infonavitEmployee, formattedValue: this.formatCurrency(infonavitEmployee), color: 'warning' },
        { label: 'Otras Deducciones', value: formValue.deductions, formattedValue: this.formatCurrency(formValue.deductions), color: 'danger' },
        { label: 'Total Deducciones', value: totalDeductions, formattedValue: this.formatCurrency(totalDeductions), color: 'danger' },
        { label: 'Salario Neto', value: netSalary, formattedValue: this.formatCurrency(netSalary), color: 'success' }
      ];
    } else {
      this.markFormGroupTouched(this.salaryForm);
    }
  }

  // Tax Calculator
  calculateTax(): void {
    if (this.taxForm.valid) {
      const formValue = this.taxForm.value;
      
      const totalIncome = formValue.annualIncome + formValue.otherIncome;
      const taxableIncome = totalIncome - formValue.deductions - (formValue.dependents * 50000);
      
      let taxAmount = 0;
      let effectiveRate = 0;
      
      // Find applicable tax bracket
      for (const bracket of this.taxBrackets) {
        if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
          const excessIncome = taxableIncome - bracket.min;
          taxAmount = bracket.fixedAmount + (excessIncome * bracket.rate);
          effectiveRate = (taxAmount / taxableIncome) * 100;
          break;
        }
      }
      
      const netIncome = totalIncome - taxAmount;
      
      this.taxResults = [
        { label: 'Ingreso Total', value: totalIncome, formattedValue: this.formatCurrency(totalIncome), color: 'primary' },
        { label: 'Deducciones', value: formValue.deductions, formattedValue: this.formatCurrency(formValue.deductions), color: 'info' },
        { label: 'Ingreso Gravable', value: taxableIncome, formattedValue: this.formatCurrency(taxableIncome), color: 'warning' },
        { label: 'ISR a Pagar', value: taxAmount, formattedValue: this.formatCurrency(taxAmount), color: 'danger' },
        { label: 'Tasa Efectiva', value: effectiveRate, formattedValue: effectiveRate.toFixed(2) + '%', color: 'warning' },
        { label: 'Ingreso Neto', value: netIncome, formattedValue: this.formatCurrency(netIncome), color: 'success' }
      ];
    } else {
      this.markFormGroupTouched(this.taxForm);
    }
  }

  // Loan Calculator
  calculateLoan(): void {
    if (this.loanForm.valid) {
      const formValue = this.loanForm.value;
      
      const principal = formValue.principal;
      const monthlyRate = formValue.interestRate / 100 / 12;
      const totalPayments = formValue.termYears * 12;
      
      // Monthly payment calculation
      const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
                           (Math.pow(1 + monthlyRate, totalPayments) - 1);
      
      const totalPayment = monthlyPayment * totalPayments;
      const totalInterest = totalPayment - principal;
      
      this.loanResults = [
        { label: 'Pago Mensual', value: monthlyPayment, formattedValue: this.formatCurrency(monthlyPayment), color: 'primary' },
        { label: 'Pago Total', value: totalPayment, formattedValue: this.formatCurrency(totalPayment), color: 'info' },
        { label: 'Interés Total', value: totalInterest, formattedValue: this.formatCurrency(totalInterest), color: 'danger' },
        { label: 'Capital', value: principal, formattedValue: this.formatCurrency(principal), color: 'success' }
      ];
      
      // Generate payment schedule
      this.generateLoanSchedule(principal, monthlyRate, totalPayments, monthlyPayment);
    } else {
      this.markFormGroupTouched(this.loanForm);
    }
  }

  generateLoanSchedule(principal: number, monthlyRate: number, totalPayments: number, monthlyPayment: number): void {
    this.loanSchedule = [];
    let remainingBalance = principal;
    
    for (let i = 1; i <= Math.min(totalPayments, 12); i++) { // Show first 12 payments
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;
      
      this.loanSchedule.push({
        payment: i,
        paymentAmount: monthlyPayment,
        principalPayment: principalPayment,
        interestPayment: interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
  }

  // Investment Calculator
  calculateInvestment(): void {
    if (this.investmentForm.valid) {
      const formValue = this.investmentForm.value;
      
      const initialAmount = formValue.initialAmount;
      const monthlyContribution = formValue.monthlyContribution;
      const annualReturn = formValue.annualReturn / 100;
      const years = formValue.years;
      
      let futureValue = initialAmount;
      const totalContributions = initialAmount + (monthlyContribution * 12 * years);
      
      // Compound interest calculation
      for (let year = 1; year <= years; year++) {
        futureValue = futureValue * (1 + annualReturn) + (monthlyContribution * 12);
      }
      
      const totalInterest = futureValue - totalContributions;
      
      this.investmentResults = [
        { label: 'Inversión Inicial', value: initialAmount, formattedValue: this.formatCurrency(initialAmount), color: 'primary' },
        { label: 'Contribuciones Totales', value: monthlyContribution * 12 * years, formattedValue: this.formatCurrency(monthlyContribution * 12 * years), color: 'info' },
        { label: 'Total Invertido', value: totalContributions, formattedValue: this.formatCurrency(totalContributions), color: 'warning' },
        { label: 'Interés Ganado', value: totalInterest, formattedValue: this.formatCurrency(totalInterest), color: 'success' },
        { label: 'Valor Futuro', value: futureValue, formattedValue: this.formatCurrency(futureValue), color: 'success' }
      ];
    } else {
      this.markFormGroupTouched(this.investmentForm);
    }
  }

  // Depreciation Calculator
  calculateDepreciation(): void {
    if (this.depreciationForm.valid) {
      const formValue = this.depreciationForm.value;
      
      const assetValue = formValue.assetValue;
      const salvageValue = formValue.salvageValue;
      const usefulLife = formValue.usefulLife;
      const method = formValue.depreciationMethod;
      
      let annualDepreciation = 0;
      
      if (method === 'straight-line') {
        annualDepreciation = (assetValue - salvageValue) / usefulLife;
      } else if (method === 'declining-balance') {
        const rate = 2 / usefulLife; // Double declining balance
        annualDepreciation = assetValue * rate;
      }
      
      const totalDepreciation = annualDepreciation * usefulLife;
      const bookValue = assetValue - totalDepreciation;
      
      this.depreciationResults = [
        { label: 'Valor del Activo', value: assetValue, formattedValue: this.formatCurrency(assetValue), color: 'primary' },
        { label: 'Valor de Salvamento', value: salvageValue, formattedValue: this.formatCurrency(salvageValue), color: 'info' },
        { label: 'Vida Útil (años)', value: usefulLife, formattedValue: usefulLife.toString(), color: 'warning' },
        { label: 'Depreciación Anual', value: annualDepreciation, formattedValue: this.formatCurrency(annualDepreciation), color: 'danger' },
        { label: 'Depreciación Total', value: totalDepreciation, formattedValue: this.formatCurrency(totalDepreciation), color: 'danger' },
        { label: 'Valor en Libros', value: bookValue, formattedValue: this.formatCurrency(bookValue), color: 'success' }
      ];
      
      // Generate depreciation schedule
      this.generateDepreciationSchedule(assetValue, salvageValue, usefulLife, annualDepreciation, method);
    } else {
      this.markFormGroupTouched(this.depreciationForm);
    }
  }

  generateDepreciationSchedule(assetValue: number, salvageValue: number, usefulLife: number, annualDepreciation: number, method: string): void {
    this.depreciationSchedule = [];
    let bookValue = assetValue;
    
    for (let year = 1; year <= usefulLife; year++) {
      let depreciation = annualDepreciation;
      
      if (method === 'declining-balance') {
        depreciation = bookValue * (2 / usefulLife);
        if (bookValue - depreciation < salvageValue) {
          depreciation = bookValue - salvageValue;
        }
      }
      
      bookValue -= depreciation;
      
      this.depreciationSchedule.push({
        year: year,
        beginningValue: bookValue + depreciation,
        depreciation: depreciation,
        endingValue: Math.max(bookValue, salvageValue)
      });
    }
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

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  exportResults(): void {
    // Simular exportación de resultados
    console.log('Exportando resultados...');
    alert('Resultados exportados exitosamente');
  }

  resetCalculator(): void {
    this.clearResults();
    switch (this.activeCalculator) {
      case 'salary':
        this.salaryForm.reset({
          workDays: 30,
          overtimeRate: 1.5,
          hasIMSS: true,
          hasINFONAVIT: true
        });
        break;
      case 'tax':
        this.taxForm.reset();
        break;
      case 'loan':
        this.loanForm.reset({ paymentFrequency: 'monthly' });
        break;
      case 'investment':
        this.investmentForm.reset({ compoundFrequency: 'monthly' });
        break;
      case 'depreciation':
        this.depreciationForm.reset({ depreciationMethod: 'straight-line' });
        break;
    }
  }
} 