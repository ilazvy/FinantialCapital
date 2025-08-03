import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Payment {
  id?: number;
  employeeId: number;
  employeeName?: string;
  amount: number;
  type: string;
  paymentDate: string;
  description: string;
  status: string;
  reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeverancePayment {
  id?: number;
  employeeId: number;
  employeeName?: string;
  amount: number;
  reason: string;
  paymentDate: string;
  status: string;
  reference?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private apiService: ApiService) { }

  // Regular Payments
  getAllPayments(): Observable<Payment[]> {
    return this.apiService.get<Payment[]>('/payments');
  }

  getPaymentById(id: number): Observable<Payment> {
    return this.apiService.get<Payment>(`/payments/${id}`);
  }

  createPayment(payment: Payment): Observable<Payment> {
    return this.apiService.post<Payment>('/payments', payment);
  }

  updatePayment(id: number, payment: Payment): Observable<Payment> {
    return this.apiService.put<Payment>(`/payments/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.apiService.delete<void>(`/payments/${id}`);
  }

  updatePaymentStatus(id: number, status: string): Observable<Payment> {
    return this.apiService.put<Payment>(`/payments/${id}/status`, status);
  }

  // Severance Payments
  getAllSeverancePayments(): Observable<SeverancePayment[]> {
    return this.apiService.get<SeverancePayment[]>('/severance-payments');
  }

  getSeverancePaymentById(id: number): Observable<SeverancePayment> {
    return this.apiService.get<SeverancePayment>(`/severance-payments/${id}`);
  }

  createSeverancePayment(severancePayment: SeverancePayment): Observable<SeverancePayment> {
    return this.apiService.post<SeverancePayment>('/severance-payments', severancePayment);
  }

  // updateSeverancePayment(id: number, severancePayment: SeverancePayment): Observable<SeverancePayment> {
  //   return this.apiService.put<SeverancePayment>(`/severance-payments/${id}`, severancePayment);
  // }

  deleteSeverancePayment(id: number): Observable<void> {
    return this.apiService.delete<void>(`/severance-payments/${id}`);
  }

  updateSeverancePayment(id: number, severancePayment: Partial<SeverancePayment>): Observable<SeverancePayment> {
    return this.apiService.put<SeverancePayment>(`/severance-payments/${id}`, severancePayment);
  }
} 