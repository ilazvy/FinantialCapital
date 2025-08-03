import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

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

// Navigation Components
import { HeaderComponent } from './components/navegacion/header/header.component';
import { SidebarComponent } from './components/navegacion/sidebar/sidebar.component';

// Shared Components
import { LoadingComponent } from './components/shared/loading/loading.component';
import { FormularioFiniquitoComponent } from './components/formularios/formulario-finiquito/formulario-finiquito.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    AdminPanelComponent,
    EmployeeRegistrationComponent,
    SueldosComponent,
    LandingComponent,
    CalculadoraSueldoComponent,
    CalculadoraSalarioComponent,
    CalculadoraNssComponent,
    CalculadoraImpuestosComponent,
    CalculadoraIndemnizacionesComponent,
    FormularioPagoComponent,
    FormularioIngresosComponent,
    FormularioGastosComponent,
    HeaderComponent,
    SidebarComponent,
    LoadingComponent,
    FormularioFiniquitoComponent,
    AvisoPrivacidadComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
