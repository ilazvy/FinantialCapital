import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface TaxResult {
  label: string;
  value: number;
  formattedValue: string;
  color: string;
  description?: string;
}

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
  fixedAmount: number;
}

interface IVAResult {
  subtotal: number;
  iva: number;
  total: number;
  rate: number;
}

@Component({
  selector: 'app-calculadora-impuestos',
  templateUrl: './calculadora-impuestos.component.html',
  styleUrls: ['./calculadora-impuestos.component.css']
})
export class CalculadoraImpuestosComponent implements OnInit {
  userRole: string = '';
  
  // Forms
  isrForm!: FormGroup;
  ivaForm!: FormGroup;
  
  // Results
  isrResults: TaxResult[] = [];
  ivaResults: IVAResult[] = [];
  
  // UI State
  activeCalculator: 'isr' | 'iva' = 'isr';
  showDetails: boolean = false;
  
  // ISR Tax Brackets 2024 (México)
  readonly ISR_BRACKETS: TaxBracket[] = [
    { min: 0.01, max: 416220.00, rate: 0.15, fixedAmount: 0 },
    { min: 416220.01, max: 624329.00, rate: 0.20, fixedAmount: 62432.84 },
    { min: 624329.01, max: 867123.00, rate: 0.25, fixedAmount: 111076.88 },
    { min: 867123.01, max: 1000000.00, rate: 0.30, fixedAmount: 171526.96 },
    { min: 1000000.01, max: 3000000.00, rate: 0.32, fixedAmount: 200000.00 },
    { min: 3000000.01, max: 999999999.99, rate: 0.35, fixedAmount: 940000.00 }
  ];

  // IVA Rates
  readonly IVA_RATES = [
    { rate: 0.16, name: '16% - IVA General' },
    { rate: 0.08, name: '8% - IVA Fronterizo' },
    { rate: 0.00, name: '0% - Exento' }
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
    // ISR Form
    this.isrForm = this.fb.group({
      annualIncome: [0, [Validators.required, Validators.min(0)]],
      deductions: [0, [Validators.min(0)]],
      otherIncome: [0, [Validators.min(0)]],
      hasSubsidy: [false],
      hasOtherDeductions: [false],
      otherDeductionsAmount: [0, [Validators.min(0)]]
    });

    // IVA Form
    this.ivaForm = this.fb.group({
      subtotal: [0, [Validators.required, Validators.min(0)]],
      ivaRate: [0.16, Validators.required],
      includeIVA: [true],
      multipleItems: [false],
      items: this.fb.array([])
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

  setActiveCalculator(calculator: 'isr' | 'iva'): void {
    this.activeCalculator = calculator;
    this.clearResults();
  }

  calculateISR(): void {
    if (this.isrForm.valid) {
      const formValue = this.isrForm.value;
      
      // Calculate taxable income
      const totalIncome = formValue.annualIncome + formValue.otherIncome;
      const totalDeductions = formValue.deductions + 
        (formValue.hasOtherDeductions ? formValue.otherDeductionsAmount : 0);
      const taxableIncome = Math.max(0, totalIncome - totalDeductions);
      
      // Find applicable tax bracket
      const bracket = this.findTaxBracket(taxableIncome);
      
      // Calculate ISR
      const excessIncome = taxableIncome - bracket.min;
      const variableTax = excessIncome * bracket.rate;
      const totalISR = bracket.fixedAmount + variableTax;
      
      // Calculate effective tax rate
      const effectiveRate = totalISR / totalIncome;
      
      // Calculate subsidy (if applicable)
      const subsidy = formValue.hasSubsidy ? this.calculateSubsidy(totalIncome) : 0;
      
      // Final ISR
      const finalISR = Math.max(0, totalISR - subsidy);
      
      // Generate results
      this.generateISRResults({
        totalIncome,
        totalDeductions,
        taxableIncome,
        bracket,
        totalISR,
        effectiveRate,
        subsidy,
        finalISR
      });
      
      this.showDetails = true;
    } else {
      this.markFormGroupTouched(this.isrForm);
    }
  }

  calculateIVA(): void {
    if (this.ivaForm.valid) {
      const formValue = this.ivaForm.value;
      const subtotal = formValue.subtotal;
      const rate = formValue.ivaRate;
      
      let iva: number;
      let total: number;
      
      if (formValue.includeIVA) {
        // IVA included in subtotal
        iva = subtotal * rate / (1 + rate);
        total = subtotal;
      } else {
        // IVA added to subtotal
        iva = subtotal * rate;
        total = subtotal + iva;
      }
      
      this.ivaResults = [{
        subtotal: subtotal,
        iva: iva,
        total: total,
        rate: rate
      }];
      
      this.showDetails = true;
    } else {
      this.markFormGroupTouched(this.ivaForm);
    }
  }

  findTaxBracket(income: number): TaxBracket {
    return this.ISR_BRACKETS.find(bracket => 
      income >= bracket.min && income <= bracket.max
    ) || this.ISR_BRACKETS[0];
  }

  calculateSubsidy(income: number): number {
    // Simplified subsidy calculation
    if (income <= 500000) {
      return income * 0.0092; // 0.92% subsidy
    }
    return 0;
  }

  generateISRResults(data: any): void {
    this.isrResults = [
      {
        label: 'Ingresos Totales',
        value: data.totalIncome,
        formattedValue: this.formatCurrency(data.totalIncome),
        color: 'primary',
        description: 'Suma de todos los ingresos anuales'
      },
      {
        label: 'Deducciones Totales',
        value: data.totalDeductions,
        formattedValue: this.formatCurrency(data.totalDeductions),
        color: 'success',
        description: 'Deducciones autorizadas'
      },
      {
        label: 'Ingreso Gravable',
        value: data.taxableIncome,
        formattedValue: this.formatCurrency(data.taxableIncome),
        color: 'warning',
        description: 'Base para el cálculo del ISR'
      },
      {
        label: 'Tasa Marginal',
        value: data.bracket.rate * 100,
        formattedValue: this.formatPercentage(data.bracket.rate * 100),
        color: 'info',
        description: `Tasa del ${data.bracket.rate * 100}% para este nivel de ingresos`
      },
      {
        label: 'ISR Calculado',
        value: data.totalISR,
        formattedValue: this.formatCurrency(data.totalISR),
        color: 'danger',
        description: 'Impuesto antes de subsidios'
      },
      {
        label: 'Subsidio al Empleo',
        value: data.subsidy,
        formattedValue: this.formatCurrency(data.subsidy),
        color: 'success',
        description: 'Subsidio aplicable (si corresponde)'
      },
      {
        label: 'ISR a Pagar',
        value: data.finalISR,
        formattedValue: this.formatCurrency(data.finalISR),
        color: 'danger',
        description: 'Impuesto final a pagar'
      },
      {
        label: 'Tasa Efectiva',
        value: data.effectiveRate * 100,
        formattedValue: this.formatPercentage(data.effectiveRate * 100),
        color: 'info',
        description: 'Porcentaje real de impuestos sobre ingresos totales'
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

  clearResults(): void {
    this.isrResults = [];
    this.ivaResults = [];
    this.showDetails = false;
  }

  resetISR(): void {
    this.isrForm.reset({
      hasSubsidy: false,
      hasOtherDeductions: false
    });
    this.clearResults();
  }

  resetIVA(): void {
    this.ivaForm.reset({
      ivaRate: 0.16,
      includeIVA: true,
      multipleItems: false
    });
    this.clearResults();
  }

  exportResults(): void {
    console.log('Exportando resultados de impuestos...');
    alert('Resultados exportados exitosamente');
  }

  goBack(): void {
    this.router.navigate(['/calculadora-sueldo']);
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }
}
