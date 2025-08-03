import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Employee {
  id?: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: string;
  address?: string;
  curp?: string;
  rfc?: string;
  nss?: string;
  postalCode?: string;
  employeeNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  constructor(private apiService: ApiService) { }

  getAllEmployees(): Observable<Employee[]> {
    return this.apiService.get<Employee[]>('/employees');
  }

  getEmployeeById(id: number): Observable<Employee> {
    return this.apiService.get<Employee>(`/employees/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.apiService.post<Employee>('/employees', employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.apiService.put<Employee>(`/employees/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<void> {
    return this.apiService.delete<void>(`/employees/${id}`);
  }

  getEmployeeCount(): Observable<number> {
    return this.apiService.get<number>('/employees/count');
  }
} 

//update
