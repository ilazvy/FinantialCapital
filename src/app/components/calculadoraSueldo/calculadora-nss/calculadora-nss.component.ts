import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface NSSResult {
  label: string;
  value: string;
  color: string;
  description?: string;
}

interface NSSValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Component({
  selector: 'app-calculadora-nss',
  templateUrl: './calculadora-nss.component.html',
  styleUrls: ['./calculadora-nss.component.css']
})
export class CalculadoraNssComponent implements OnInit {
  userRole: string = '';
  
  // Forms
  nssForm!: FormGroup;
  nssGeneratorForm!: FormGroup;
  
  // Results
  nssResults: NSSResult[] = [];
  nssValidation: NSSValidation = { isValid: false, errors: [], warnings: [] };
  generatedNSS: string = '';
  
  // UI State
  showValidation: boolean = false;
  showGenerator: boolean = false;
  
  // NSS Structure
  readonly NSS_LENGTH = 11;
  readonly SUBDELEGACIONES = [
    { code: '01', name: 'Aguascalientes' },
    { code: '02', name: 'Baja California' },
    { code: '03', name: 'Baja California Sur' },
    { code: '04', name: 'Campeche' },
    { code: '05', name: 'Coahuila' },
    { code: '06', name: 'Colima' },
    { code: '07', name: 'Chiapas' },
    { code: '08', name: 'Chihuahua' },
    { code: '09', name: 'Ciudad de México' },
    { code: '10', name: 'Durango' },
    { code: '11', name: 'Guanajuato' },
    { code: '12', name: 'Guerrero' },
    { code: '13', name: 'Hidalgo' },
    { code: '14', name: 'Jalisco' },
    { code: '15', name: 'México' },
    { code: '16', name: 'Michoacán' },
    { code: '17', name: 'Morelos' },
    { code: '18', name: 'Nayarit' },
    { code: '19', name: 'Nuevo León' },
    { code: '20', name: 'Oaxaca' },
    { code: '21', name: 'Puebla' },
    { code: '22', name: 'Querétaro' },
    { code: '23', name: 'Quintana Roo' },
    { code: '24', name: 'San Luis Potosí' },
    { code: '25', name: 'Sinaloa' },
    { code: '26', name: 'Sonora' },
    { code: '27', name: 'Tabasco' },
    { code: '28', name: 'Tamaulipas' },
    { code: '29', name: 'Tlaxcala' },
    { code: '30', name: 'Veracruz' },
    { code: '31', name: 'Yucatán' },
    { code: '32', name: 'Zacatecas' }
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
    // NSS Validation Form
    this.nssForm = this.fb.group({
      nssNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]]
    });

    // NSS Generator Form
    this.nssGeneratorForm = this.fb.group({
      subdelegacion: ['09', Validators.required], // Default to CDMX
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
      month: [new Date().getMonth() + 1, [Validators.required, Validators.min(1), Validators.max(12)]],
      day: [new Date().getDate(), [Validators.required, Validators.min(1), Validators.max(31)]],
      gender: ['M', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      motherLastName: ['', [Validators.required, Validators.minLength(2)]]
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

  validateNSS(): void {
    if (this.nssForm.valid) {
      const nss = this.nssForm.get('nssNumber')?.value;
      this.nssValidation = this.performNSSValidation(nss);
      this.generateNSSResults(nss);
      this.showValidation = true;
    } else {
      this.markFormGroupTouched(this.nssForm);
    }
  }

  generateNSS(): void {
    if (this.nssGeneratorForm.valid) {
      const formValue = this.nssGeneratorForm.value;
      this.generatedNSS = this.createNSS(formValue);
      this.generateNSSResults(this.generatedNSS);
      this.showGenerator = true;
    } else {
      this.markFormGroupTouched(this.nssGeneratorForm);
    }
  }

  performNSSValidation(nss: string): NSSValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic length validation
    if (nss.length !== this.NSS_LENGTH) {
      errors.push(`El NSS debe tener exactamente ${this.NSS_LENGTH} dígitos`);
    }

    // Check if all characters are numbers
    if (!/^\d+$/.test(nss)) {
      errors.push('El NSS solo debe contener números');
    }

    // Validate subdelegación
    const subdelegacion = nss.substring(0, 2);
    const validSubdelegacion = this.SUBDELEGACIONES.find(s => s.code === subdelegacion);
    if (!validSubdelegacion) {
      errors.push(`La subdelegación ${subdelegacion} no es válida`);
    } else {
      warnings.push(`Subdelegación: ${validSubdelegacion.name}`);
    }

    // Validate year (positions 2-5)
    const year = parseInt(nss.substring(2, 6));
    if (year < 1900 || year > new Date().getFullYear()) {
      warnings.push(`El año ${year} parece incorrecto`);
    }

    // Validate month (positions 6-7)
    const month = parseInt(nss.substring(6, 8));
    if (month < 1 || month > 12) {
      errors.push('El mes debe estar entre 01 y 12');
    }

    // Validate day (positions 8-9)
    const day = parseInt(nss.substring(8, 10));
    if (day < 1 || day > 31) {
      errors.push('El día debe estar entre 01 y 31');
    }

    // Validate check digit (position 11)
    const checkDigit = parseInt(nss.charAt(10));
    const calculatedCheckDigit = this.calculateCheckDigit(nss.substring(0, 10));
    if (checkDigit !== calculatedCheckDigit) {
      errors.push(`Dígito verificador incorrecto. Debería ser ${calculatedCheckDigit}`);
    }

    // Additional validations
    if (year > new Date().getFullYear()) {
      warnings.push('El año es posterior al año actual');
    }

    // Validate date consistency
    if (this.isValidDate(year, month, day)) {
      warnings.push('La fecha parece ser válida');
    } else {
      errors.push('La fecha de nacimiento no es válida');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  calculateCheckDigit(nssBase: string): number {
    const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
    let sum = 0;

    for (let i = 0; i < nssBase.length; i++) {
      const digit = parseInt(nssBase.charAt(i));
      const weight = weights[i];
      const product = digit * weight;
      sum += Math.floor(product / 10) + (product % 10);
    }

    const remainder = sum % 10;
    return remainder === 0 ? 0 : 10 - remainder;
  }

  isValidDate(year: number, month: number, day: number): boolean {
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
  }

  createNSS(formData: any): string {
    // Subdelegación (2 digits)
    const subdelegacion = formData.subdelegacion.padStart(2, '0');
    
    // Year (4 digits)
    const year = formData.year.toString().padStart(4, '0');
    
    // Month (2 digits)
    const month = formData.month.toString().padStart(2, '0');
    
    // Day (2 digits)
    const day = formData.day.toString().padStart(2, '0');
    
    // Gender (1 digit) - M=1, F=2
    const gender = formData.gender === 'M' ? '1' : '2';
    
    // Sequential number (1 digit) - Random for demo
    const sequential = Math.floor(Math.random() * 10).toString();
    
    // Create base NSS (10 digits)
    const nssBase = subdelegacion + year + month + day + gender + sequential;
    
    // Calculate check digit
    const checkDigit = this.calculateCheckDigit(nssBase);
    
    // Return complete NSS
    return nssBase + checkDigit;
  }

  generateNSSResults(nss: string): void {
    if (nss.length === this.NSS_LENGTH) {
      const subdelegacion = nss.substring(0, 2);
      const year = nss.substring(2, 6);
      const month = nss.substring(6, 8);
      const day = nss.substring(8, 10);
      const gender = nss.charAt(10) === '1' ? 'Masculino' : 'Femenino';
      const sequential = nss.charAt(9);
      const checkDigit = nss.charAt(10);

      const subdelegacionInfo = this.SUBDELEGACIONES.find(s => s.code === subdelegacion);

      this.nssResults = [
        {
          label: 'NSS Completo',
          value: nss,
          color: 'primary',
          description: 'Número de Seguridad Social completo'
        },
        {
          label: 'Subdelegación',
          value: subdelegacion,
          color: 'info',
          description: subdelegacionInfo ? subdelegacionInfo.name : 'Subdelegación no válida'
        },
        {
          label: 'Año de Nacimiento',
          value: year,
          color: 'success',
          description: 'Año de nacimiento del titular'
        },
        {
          label: 'Mes de Nacimiento',
          value: month,
          color: 'warning',
          description: 'Mes de nacimiento del titular'
        },
        {
          label: 'Día de Nacimiento',
          value: day,
          color: 'warning',
          description: 'Día de nacimiento del titular'
        },
        {
          label: 'Género',
          value: gender,
          color: 'info',
          description: 'Género del titular'
        },
        {
          label: 'Número Secuencial',
          value: sequential,
          color: 'secondary',
          description: 'Número secuencial asignado'
        },
        {
          label: 'Dígito Verificador',
          value: checkDigit,
          color: 'danger',
          description: 'Dígito de control para validación'
        }
      ];
    }
  }

  formatNSS(nss: string): string {
    if (nss.length === this.NSS_LENGTH) {
      return `${nss.substring(0, 2)}-${nss.substring(2, 6)}-${nss.substring(6, 8)}-${nss.substring(8, 10)}-${nss.substring(10)}`;
    }
    return nss;
  }

  getSubdelegacionName(code: string): string {
    const subdelegacion = this.SUBDELEGACIONES.find(s => s.code === code);
    return subdelegacion ? subdelegacion.name : 'Desconocida';
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  resetValidation(): void {
    this.nssForm.reset();
    this.nssResults = [];
    this.nssValidation = { isValid: false, errors: [], warnings: [] };
    this.showValidation = false;
  }

  resetGenerator(): void {
    this.nssGeneratorForm.reset({
      subdelegacion: '09',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate(),
      gender: 'M'
    });
    this.generatedNSS = '';
    this.nssResults = [];
    this.showGenerator = false;
  }

  exportResults(): void {
    // Simular exportación
    console.log('Exportando resultados de NSS...');
    alert('Resultados exportados exitosamente');
  }

  goBack(): void {
    this.router.navigate(['/calculadora-sueldo']);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('NSS copiado al portapapeles');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('NSS copiado al portapapeles');
    });
  }

  toggleValidation(): void {
    this.showValidation = !this.showValidation;
  }

  toggleGenerator(): void {
    this.showGenerator = !this.showGenerator;
  }
}
