import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('Cargando...');
  
  public isLoading$ = this.isLoadingSubject.asObservable();
  public loadingMessage$ = this.loadingMessageSubject.asObservable();

  constructor() {}

  show(message: string = 'Cargando...') {
    this.loadingMessageSubject.next(message);
    this.isLoadingSubject.next(true);
  }

  hide() {
    this.isLoadingSubject.next(false);
  }

  // Métodos específicos para diferentes acciones update
  showNavigation() {
    this.show('Navegando...');
  }

  showCalculation() {
    this.show('Calculando...');
  }

  showSaving() {
    this.show('Guardando...');
  }

  showLoading() {
    this.show('Cargando datos...');
  }

  showProcessing() {
    this.show('Procesando...');
  }
} 
