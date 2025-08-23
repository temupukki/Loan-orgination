import { ReactNode } from "react";

export interface LoanApplication {
  purposeOfLoan: string;
  loanPeriod: number;
  phone: string;
  tinNumber: string;
  region: string;
  zone: string;
  city: string;
  monthlyIncome: number;
  email: ReactNode;
  id: string;
  customerNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  loanAmount: number | null;
  loanType: string | null;
  applicationDate: string | null;
  createdAt: string;
  updatedAt: string;
  shareholders: any[];
  loanRequests: any[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface LoanApplicationsResponse {
  success: boolean;
  data: LoanApplication[];
  pagination: PaginationInfo;
}

export const loanApi = {
  // Get loan applications with filtering
  getApplications: async (
    filters: {
      customerNumber?: string;
      status?: string;
      page?: number;
      limit?: number;
      search?: string;
    } = {}
  ): Promise<LoanApplicationsResponse> => {
    const params = new URLSearchParams();
    
    if (filters.customerNumber) params.append('customerNumber', filters.customerNumber);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`/api/loan?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch loan applications');
    }
    
    return response.json();
  },

  // Get single loan application by customer number
  getApplicationByCustomerNumber: async (customerNumber: string): Promise<LoanApplication> => {
    const response = await fetch(`/api/loan?customerNumber=${encodeURIComponent(customerNumber)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch loan application');
    }
    
    const result = await response.json();
    return result.data[0]; // Return the first matching application
  },
};