import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Income {
  id?: number;
  description: string;
  amount: number;
  category: string;
  source: string;
  incomeDate: string;
  reference?: string;
  notes?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Expense {
  id?: number;
  description: string;
  amount: number;
  expenseDate: string;
  category: string;
  vendor?: string;
  reference?: string;
  notes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  constructor(private apiService: ApiService) { }

  // Income
  getAllIncome(): Observable<Income[]> {
    return this.apiService.get<Income[]>('/income');
  }

  getIncomeById(id: number): Observable<Income> {
    return this.apiService.get<Income>(`/income/${id}`);
  }

  createIncome(income: Income): Observable<Income> {
    return this.apiService.post<Income>('/income', income);
  }

  updateIncome(id: number, income: Income): Observable<Income> {
    return this.apiService.put<Income>(`/income/${id}`, income);
  }

  deleteIncome(id: number): Observable<void> {
    return this.apiService.delete<void>(`/income/${id}`);
  }

  updateIncomeStatus(id: number, status: string): Observable<Income> {
    return this.apiService.put<Income>(`/income/${id}/status`, status);
  }

  getTotalIncome(): Observable<number> {
    return this.apiService.get<number>('/income/total');
  }

   getAllExpenses(): Observable<Expense[]> {
    return this.apiService.get<Expense[]>('/expenses');
  }

  getExpenseById(id: number): Observable<Expense> {
    return this.apiService.get<Expense>(`/expenses/${id}`);
  }

  createExpense(expense: Expense): Observable<Expense> {
    return this.apiService.post<Expense>('/expenses', expense);
  }

  updateExpense(id: number, expense: Expense): Observable<Expense> {
    return this.apiService.put<Expense>(`/expenses/${id}`, expense);
  }

  deleteExpense(id: number): Observable<void> {
    return this.apiService.delete<void>(`/expenses/${id}`);
  }

  getTotalExpenses(): Observable<number> {
    return this.apiService.get<number>('/expenses/total');
  }

  // Dashboard Statistics
  getDashboardStats(): Observable<any> {
    return this.apiService.get<any>('/dashboard/stats');
  }
} 
