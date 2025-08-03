export interface RecentActivity {
  employees: any[];
  payments: any[];
  incomes: any[];
  expenses: any[];
  severancePayments: any[];
}

export interface FinancialSummary {
  monthlyIncome: any[];
  monthlyExpenses: any[];
  expenseDistribution: any[];
  employeeGrowth: any[];
  efficiencyData: any[];
}
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface DashboardStats {
  totalEmployees: number;
  totalIncome: number;
  totalExpenses: number;
  monthlyPayroll: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  getRecentActivity(): Observable<RecentActivity> {
    return this.apiService.get<RecentActivity>('/dashboard/recent-activity');
  }

  getFinancialSummary(): Observable<FinancialSummary> {
    return this.apiService.get<FinancialSummary>('/dashboard/financial-summary');
  }
  constructor(private apiService: ApiService) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>('/dashboard/stats');
  }
} 