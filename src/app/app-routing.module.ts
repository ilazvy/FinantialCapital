import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Main Components
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { EmployeeRegistrationComponent } from './components/employee-registration/employee-registration.component';
import { SueldosComponent } from './components/sueldos/sueldos.component';
import { LandingComponent } from './components/landing/landing.component';
import { AvisoPrivacidadComponent } from './components/landing/aviso-privacidad.component';

// Calculator Components
import { CalculadoraSueldoComponent } from './components/calculadoraSueldo/calculadoraSueldo.component';
import { CalculadoraSalarioComponent } from './components/calculadoraSueldo/calculadora-salario/calculadora-salario.component';
import { CalculadoraNssComponent } from './components/calculadoraSueldo/calculadora-nss/calculadora-nss.component';
import { CalculadoraImpuestosComponent } from './components/calculadoraSueldo/calculadora-impuestos/calculadora-impuestos.component';
import { CalculadoraIndemnizacionesComponent } from './components/calculadoraSueldo/calculadora-indemnizaciones/calculadora-indemnizaciones.component';

// Form Components
import { FormularioPagoComponent } from './components/formularios/formulario-pago/formulario-pago.component';
import { FormularioIngresosComponent } from './components/formularios/formulario-ingresos/formulario-ingresos.component';
import { FormularioGastosComponent } from './components/formularios/formulario-gastos/formulario-gastos.component';
import { FormularioFiniquitoComponent } from './components/formularios/formulario-finiquito/formulario-finiquito.component';

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent },
  { path: 'aviso-privacidad', component: AvisoPrivacidadComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin-panel', component: AdminPanelComponent },
  { path: 'employee-registration', component: EmployeeRegistrationComponent },
  { path: 'sueldos', component: SueldosComponent },
  
  // Calculator Routes
  { path: 'calculadora-sueldo', component: CalculadoraSueldoComponent },
  { path: 'calculadora-salario', component: CalculadoraSalarioComponent },
  { path: 'calculadora-nss', component: CalculadoraNssComponent },
  { path: 'calculadora-impuestos', component: CalculadoraImpuestosComponent },
  { path: 'calculadora-indemnizaciones', component: CalculadoraIndemnizacionesComponent },
  
  // Form Routes
  { path: 'formulario-pago', component: FormularioPagoComponent },
  { path: 'formulario-ingresos', component: FormularioIngresosComponent },
  { path: 'formulario-gastos', component: FormularioGastosComponent },
  { path: 'formulario-finiquito', component: FormularioFiniquitoComponent },
  
  // Default redirect
  { path: '**', redirectTo: '/landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
