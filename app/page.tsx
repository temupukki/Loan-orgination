"use client";

import { useState, useEffect } from "react";

interface Customer {
  id: string;
  customerNumber: string;
  tinNumber?: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  mothersName: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email?: string | null;
  region: string;
  zone: string;
  city: string;
  subcity: string;
  woreda: string;
  monthlyIncome: number;
  status: string;
  nationalidUrl?: string | null;
  agreementFormUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LoanApplication {
  applicationRef: string;
  customerId: string;
  customerDetails: Customer;
  applicationDate: string;
  lastDocumentDate: string;
  purpose: string;
  loanType: string;
  amount: number;
  period: number;
  repaymentMode: string;
  economicSector: string[];
  loanPurpose: string[];
  requestDetails: RequestDetail[];
  mandatoryRequirements: MandatoryRequirement[];
  legalDocuments: LegalDocument[];
  shareholders: Shareholder[];
  creditProfile: CreditProfile;
  transactionProfile: TransactionProfile;
  collateralProfile: Collateral[];
  financialProfile: FinancialProfile[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface RequestDetail {
  type: string;
  amount: number;
  period: number;
  repaymentMode: string;
  remark: string;
}

interface MandatoryRequirement {
  requirement: string;
  confirmed: boolean;
  documentUrl?: string;
}

interface LegalDocument {
  documentType: string;
  isProvided: boolean;
  documentUrl?: string;
}

interface Shareholder {
  name: string;
  shareValue: number;
  sharePercentage: number;
  documentUrl?: string;
}

interface CreditProfile {
  creditScore: number;
  existingLoans: number;
  repaymentHistory: string;
  documentUrl?: string;
}

interface TransactionProfile {
  averageBalance: number;
  transactionFrequency: string;
  documentUrl?: string;
}

interface Collateral {
  type: string;
  description: string;
  estimatedValue: number;
  titleDeedNo: string;
  taxCustomsCharge: number;
  netValue: number;
  engineeringRemark: string;
  collateralDeclaration: string;
  documentUrl?: string;
}

interface FinancialProfile {
  year: number;
  revenue: number;
  profit: number;
  assets: number;
  liabilities: number;
  documentUrl?: string;
}

export default function LoanOriginationPage() {
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [step, setStep] = useState(1);

  // Fetch customer data when ID is provided
  useEffect(() => {
    if (customerId.length > 5) {
      fetchCustomerData();
    }
  }, [customerId]);

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/loan/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setCustomer(data.data);
        initializeApplication(data.data);
      } else {
        alert("Customer not found");
        setCustomer(null);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      alert("Error fetching customer data");
    } finally {
      setLoading(false);
    }
  };

  const initializeApplication = (customerData: Customer) => {
    const newApplication: LoanApplication = {
      applicationRef: generateApplicationRef(),
      customerId: customerData.id,
      customerDetails: customerData,
      applicationDate: new Date().toISOString().split('T')[0],
      lastDocumentDate: new Date().toISOString().split('T')[0],
      purpose: "",
      loanType: "",
      amount: 0,
      period: 0,
      repaymentMode: "",
      economicSector: [],
      loanPurpose: [],
      requestDetails: [],
      mandatoryRequirements: [],
      legalDocuments: [],
      shareholders: [],
      creditProfile: {
        creditScore: 0,
        existingLoans: 0,
        repaymentHistory: ""
      },
      transactionProfile: {
        averageBalance: 0,
        transactionFrequency: ""
      },
      collateralProfile: [],
      financialProfile: [],
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setApplication(newApplication);
  };

  const generateApplicationRef = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DB/LFF/${year}${month}${day}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!application) return;
    
    const { name, value } = e.target;
    setApplication({
      ...application,
      [name]: value
    });
  };

  const handleArrayInputChange = (section: keyof LoanApplication, index: number, field: string, value: any) => {
    if (!application) return;
    
    const sectionData = [...(application[section] as any[])];
    sectionData[index] = {
      ...sectionData[index],
      [field]: value
    };
    
    setApplication({
      ...application,
      [section]: sectionData
    });
  };

  const addArrayItem = (section: keyof LoanApplication, template: any) => {
    if (!application) return;
    
    const sectionData = [...(application[section] as any[])];
    sectionData.push(template);
    
    setApplication({
      ...application,
      [section]: sectionData
    });
  };

  const removeArrayItem = (section: keyof LoanApplication, index: number) => {
    if (!application) return;
    
    const sectionData = [...(application[section] as any[])];
    sectionData.splice(index, 1);
    
    setApplication({
      ...application,
      [section]: sectionData
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;
    
    try {
      const res = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(application),
      });
      
      if (res.ok) {
        alert('Loan application submitted successfully!');
        // Reset form or redirect
      } else {
        alert('Error submitting application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application');
    }
  };

  if (!customer) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Loan Origination</h1>
          <div className="mb-6">
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
              Enter Customer ID
            </label>
            <input
              type="text"
              id="customerId"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Customer ID or TIN Number"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </div>
          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Loan Origination Form</h1>
            <div className="text-sm text-gray-600">
              Application Ref: <span className="font-semibold">{application?.applicationRef}</span>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5].map((stepNum) => (
                <button
                  key={stepNum}
                  onClick={() => setStep(stepNum)}
                  className={`px-4 py-2 rounded-md ${
                    step === stepNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  Step {stepNum}
                </button>
              ))}
            </div>
            <div className="text-center text-sm text-gray-600">
              {step === 1 && "Customer & Application Details"}
              {step === 2 && "Financial Information"}
              {step === 3 && "Collateral Details"}
              {step === 4 && "Documents Upload"}
              {step === 5 && "Review & Submit"}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Customer & Application Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {customer.firstName} {customer.middleName} {customer.lastName}</p>
                      <p><span className="font-medium">Customer ID:</span> {customer.customerNumber}</p>
                      <p><span className="font-medium">TIN:</span> {customer.tinNumber || "N/A"}</p>
                      <p><span className="font-medium">Phone:</span> {customer.phone}</p>
                      <p><span className="font-medium">Email:</span> {customer.email || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700 mb-1">
                          Application Date
                        </label>
                        <input
                          type="date"
                          id="applicationDate"
                          name="applicationDate"
                          value={application?.applicationDate || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
                          Purpose of Loan
                        </label>
                        <input
                          type="text"
                          id="purpose"
                          name="purpose"
                          value={application?.purpose || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-1">
                          Type of Loan
                        </label>
                        <select
                          id="loanType"
                          name="loanType"
                          value={application?.loanType || ""}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Select Loan Type</option>
                          <option value="term">Term Loan</option>
                          <option value="overdraft">Overdraft Facility</option>
                          <option value="murabaha">Murabaha</option>
                          <option value="qard">Qard</option>
                          <option value="kafalah">Kafalah</option>
                          <option value="lc">Letter of Credit</option>
                          <option value="guarantee">Guarantee Facility</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                  {application?.requestDetails.map((detail, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <input
                          type="text"
                          value={detail.type}
                          onChange={(e) => handleArrayInputChange('requestDetails', index, 'type', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input
                          type="number"
                          value={detail.amount}
                          onChange={(e) => handleArrayInputChange('requestDetails', index, 'amount', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Period (months)</label>
                        <input
                          type="number"
                          value={detail.period}
                          onChange={(e) => handleArrayInputChange('requestDetails', index, 'period', parseInt(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('requestDetails', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('requestDetails', { type: '', amount: 0, period: 0, repaymentMode: '', remark: '' })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Request Detail
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Financial Information */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                
                <div>
                  <h4 className="font-medium mb-2">Financial Profiles</h4>
                  {application?.financialProfile.map((profile, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4 p-4 border rounded">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                          type="number"
                          value={profile.year}
                          onChange={(e) => handleArrayInputChange('financialProfile', index, 'year', parseInt(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Revenue</label>
                        <input
                          type="number"
                          value={profile.revenue}
                          onChange={(e) => handleArrayInputChange('financialProfile', index, 'revenue', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profit</label>
                        <input
                          type="number"
                          value={profile.profit}
                          onChange={(e) => handleArrayInputChange('financialProfile', index, 'profit', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assets</label>
                        <input
                          type="number"
                          value={profile.assets}
                          onChange={(e) => handleArrayInputChange('financialProfile', index, 'assets', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('financialProfile', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('financialProfile', { year: new Date().getFullYear(), revenue: 0, profit: 0, assets: 0, liabilities: 0 })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Financial Year
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Credit Profile</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credit Score</label>
                        <input
                          type="number"
                          value={application?.creditProfile.creditScore || 0}
                          onChange={(e) => setApplication({
                            ...application!,
                            creditProfile: {
                              ...application!.creditProfile,
                              creditScore: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Existing Loans</label>
                        <input
                          type="number"
                          value={application?.creditProfile.existingLoans || 0}
                          onChange={(e) => setApplication({
                            ...application!,
                            creditProfile: {
                              ...application!.creditProfile,
                              existingLoans: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Transaction Profile</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Average Balance</label>
                        <input
                          type="number"
                          value={application?.transactionProfile.averageBalance || 0}
                          onChange={(e) => setApplication({
                            ...application!,
                            transactionProfile: {
                              ...application!.transactionProfile,
                              averageBalance: parseFloat(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Frequency</label>
                        <select
                          value={application?.transactionProfile.transactionFrequency || ""}
                          onChange={(e) => setApplication({
                            ...application!,
                            transactionProfile: {
                              ...application!.transactionProfile,
                              transactionFrequency: e.target.value
                            }
                          })}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        >
                          <option value="">Select Frequency</option>
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Collateral Details */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Collateral Details</h3>
                
                {application?.collateralProfile.map((collateral, index) => (
                  <div key={index} className="border rounded p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Collateral Type</label>
                        <input
                          type="text"
                          value={collateral.type}
                          onChange={(e) => handleArrayInputChange('collateralProfile', index, 'type', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value</label>
                        <input
                          type="number"
                          value={collateral.estimatedValue}
                          onChange={(e) => handleArrayInputChange('collateralProfile', index, 'estimatedValue', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title Deed No.</label>
                        <input
                          type="text"
                          value={collateral.titleDeedNo}
                          onChange={(e) => handleArrayInputChange('collateralProfile', index, 'titleDeedNo', e.target.value)}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tax & Customs Charge</label>
                        <input
                          type="number"
                          value={collateral.taxCustomsCharge}
                          onChange={(e) => handleArrayInputChange('collateralProfile', index, 'taxCustomsCharge', parseFloat(e.target.value))}
                          className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={collateral.description}
                        onChange={(e) => handleArrayInputChange('collateralProfile', index, 'description', e.target.value)}
                        className="w-full px-3 py-1 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeArrayItem('collateralProfile', index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove Collateral
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayItem('collateralProfile', {
                    type: '',
                    description: '',
                    estimatedValue: 0,
                    titleDeedNo: '',
                    taxCustomsCharge: 0,
                    netValue: 0,
                    engineeringRemark: '',
                    collateralDeclaration: ''
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Collateral
                </button>
              </div>
            )}

            {/* Step 4: Documents Upload */}
            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
                
                <div>
                  <h4 className="font-medium mb-2">Mandatory Requirements</h4>
                  <div className="space-y-4">
                    {[
                      "Formal loan application",
                      "Business license",
                      "Tax clearance certificate",
                      "Financial statements",
                      "Project feasibility study",
                      "Collateral documents"
                    ].map((req, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`req-${index}`}
                          checked={application?.mandatoryRequirements.some(r => r.requirement === req) || false}
                          onChange={(e) => {
                            if (!application) return;
                            
                            const requirements = [...application.mandatoryRequirements];
                            if (e.target.checked) {
                              requirements.push({ requirement: req, confirmed: true });
                            } else {
                              const idx = requirements.findIndex(r => r.requirement === req);
                              if (idx > -1) requirements.splice(idx, 1);
                            }
                            
                            setApplication({
                              ...application,
                              mandatoryRequirements: requirements
                            });
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`req-${index}`} className="text-sm">
                          {req}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Upload Documents</h4>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop documents here, or click to select files
                    </p>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      // Handle file uploads here
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Review Application</h3>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Application Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm"><span className="font-medium">Application Ref:</span> {application?.applicationRef}</p>
                      <p className="text-sm"><span className="font-medium">Customer:</span> {customer.firstName} {customer.lastName}</p>
                      <p className="text-sm"><span className="font-medium">Loan Type:</span> {application?.loanType}</p>
                    </div>
                    <div>
                      <p className="text-sm"><span className="font-medium">Purpose:</span> {application?.purpose}</p>
                      <p className="text-sm"><span className="font-medium">Amount:</span> ETB {application?.requestDetails.reduce((sum, detail) => sum + detail.amount, 0).toLocaleString()}</p>
                      <p className="text-sm"><span className="font-medium">Collateral Value:</span> ETB {application?.collateralProfile.reduce((sum, collateral) => sum + collateral.estimatedValue, 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submit Application
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={step === 1}
                  className={`px-4 py-2 rounded-md ${step === 1 ? 'bg-gray-300 text-gray-500' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}