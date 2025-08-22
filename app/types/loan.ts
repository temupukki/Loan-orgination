export interface Customer {
  shareholders: any;
  id: string;
  customerNumber: string;
  tinNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  mothersName: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email: string;
  region: string;
  zone: string;
  city: string;
  subcity: string;
  woreda: string;
  monthlyIncome: number;
  status: string;
  nationalidUrl: string;
  agreementFormUrl: string;
  accountType: string;
  majorLineBusiness?: string;
  majorLineBusinessUrl?: string;
  otherLineBusiness?: string;
  otherLineBusinessUrl?: string;
  createdAt: string;
  updatedAt: string;
  dateOfEstablishmentMLB?: string;
  dateOfEstablishmentOLB?: string;
  purposeOfLoan?: string;
  loanType?: string;
  loanAmount?: number;
  loanPeriod?: number;
  modeOfRepayment?: string;
  economicSector?: string;
  customerSegmentation?: string;
  creditInitiationCenter?: string;
  applicationReferenceNumber?: string;
  applicationDate?: string;
  lastDocumentReceivedDate?: string;
  applicationFormUrl?: string;
  shareholdersDetailsUrl?: string;
  creditProfileUrl?: string;
  transactionProfileUrl?: string;
  collateralProfileUrl?: string;
  financialProfileUrl?: string;
}

export interface Shareholder {
  id?: string;
  name: string;
  shareValue: number;
  sharePercentage: number;
  nationality?: string;
  idNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  isDirector?: boolean;
  position?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Shareholders {
  [key: string]: Shareholder[];
}

// Or if you prefer an array structure:
export interface ShareholderGroup {
  companyId?: string;
  companyName?: string;
  shareholders: Shareholder[];
  totalShares: number;
  totalValue: number;
}

export interface LoanRequest {
  type: string;
  amount: number;
  period: number;
  repaymentMode: string;
  remark: string;
}

export interface LineOfBusiness {
  majorLineBusiness: string;
  otherLineBusiness: string;
}