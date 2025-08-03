import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginAttempts = 0;
  maxAttempts = 3;
  isBlocked = false;
  blockTime = 300000; // 5 minutos
  captchaValue = '';
  userCaptcha = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['employee', Validators.required],
      captcha: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCaptcha();
    this.checkBlockStatus();
  }

  generateCaptcha(): void {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.captchaValue = '';
    for (let i = 0; i < 6; i++) {
      this.captchaValue += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }

  checkBlockStatus(): void {
    const blockedUntil = localStorage.getItem('loginBlockedUntil');
    if (blockedUntil && Date.now() < parseInt(blockedUntil)) {
      this.isBlocked = true;
      const remainingTime = Math.ceil((parseInt(blockedUntil) - Date.now()) / 1000);
      setTimeout(() => {
        this.isBlocked = false;
        this.loginAttempts = 0;
        localStorage.removeItem('loginBlockedUntil');
      }, remainingTime * 1000);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isBlocked) {
      this.isLoading = true;
      
      // Simular validación de CAPTCHA
      if (this.loginForm.get('captcha')?.value.toUpperCase() !== this.captchaValue) {
        this.handleLoginError('CAPTCHA incorrecto');
        return;
      }

      // Simular validación de credenciales
      setTimeout(() => {
        const email = this.loginForm.get('email')?.value;
        const password = this.loginForm.get('password')?.value;
        const role = this.loginForm.get('role')?.value;

        // Credenciales de ejemplo (en producción esto vendría de un backend)
        if (this.validateCredentials(email, password, role)) {
          this.loginSuccess(role);
        } else {
          this.handleLoginError('Credenciales incorrectas');
        }
        this.isLoading = false;
      }, 1500);
    }
  }

  validateCredentials(email: string, password: string, role: string): boolean {
    // Credenciales de ejemplo
    const validCredentials = {
      admin: { email: 'admin@financial.com', password: 'admin123' },
      employee: { email: 'empleado@financial.com', password: 'empleado123' }
    };

    const expected = validCredentials[role as keyof typeof validCredentials];
    return email === expected.email && password === expected.password;
  }

  loginSuccess(role: string): void {
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', this.loginForm.get('email')?.value);
    this.router.navigate(['/dashboard']);
  }

  handleLoginError(message: string): void {
    this.loginAttempts++;
    this.generateCaptcha();
    this.loginForm.patchValue({ captcha: '' });

    if (this.loginAttempts >= this.maxAttempts) {
      this.isBlocked = true;
      const blockedUntil = Date.now() + this.blockTime;
      localStorage.setItem('loginBlockedUntil', blockedUntil.toString());
      setTimeout(() => {
        this.isBlocked = false;
        this.loginAttempts = 0;
        localStorage.removeItem('loginBlockedUntil');
      }, this.blockTime);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  getRemainingAttempts(): number {
    return this.maxAttempts - this.loginAttempts;
  }
}
