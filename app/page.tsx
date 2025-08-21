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

interface Collateral {
  id: string;
  type: string;
  description: string;
  estimatedValue: number;
  titleDeedNo: string;
  taxCustomsCharge: number;
  netValue: number;
  documentUrl?: string;
}

interface LoanApplication {
  id: string;
  applicationRef: string;
  customerId: string;
  purpose: string;
  loanType: string;
  amount: number;
  period: number;
  repaymentMode: string;
  economicSector: string[];
  collaterals: Collateral[];
  status: string;
  createdAt: string;
}

export default function LoanOriginationSystem() {
  const [step, setStep] = useState(1);
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [collaterals, setCollaterals] = useState<Collateral[]>([]);

  // Form state
  const [purpose, setPurpose] = useState("");
  const [loanType, setLoanType] = useState("");
  const [amount, setAmount] = useState(0);
  const [period, setPeriod] = useState(0);
  const [repaymentMode, setRepaymentMode] = useState("");
  const [economicSector, setEconomicSector] = useState<string[]>([]);

  // Collateral form state
  const [collateralType, setCollateralType] = useState("");
  const [collateralDescription, setCollateralDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState(0);
  const [titleDeedNo, setTitleDeedNo] = useState("");
  const [taxCustomsCharge, setTaxCustomsCharge] = useState(0);

const fetchCustomerData = async () => {
  if (!customerId.trim()) {
    setError("Please enter a customer ID");
    return;
  }

  setLoading(true);
  setError("");
  try {
    const response = await fetch(
      `/api/loan?customerNumber=${encodeURIComponent(customerId)}`
    );

    const data = await response.json();

    if (response.ok && data.success) {
      setCustomer(data.data);
      setStep(2); // Move to next step after successful customer fetch
    } else {
      setError(data.error || "Customer not found");
    }
  } catch (err) {
    console.error("Error fetching customer:", err);
    setError("Failed to fetch customer data. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleAddCollateral = () => {
    const netValue = estimatedValue - taxCustomsCharge;
    const newCollateral: Collateral = {
      id: Date.now().toString(),
      type: collateralType,
      description: collateralDescription,
      estimatedValue,
      titleDeedNo,
      taxCustomsCharge,
      netValue
    };
    
    setCollaterals([...collaterals, newCollateral]);
    
    // Reset form
    setCollateralType("");
    setCollateralDescription("");
    setEstimatedValue(0);
    setTitleDeedNo("");
    setTaxCustomsCharge(0);
  };

  const handleRemoveCollateral = (id: string) => {
    setCollaterals(collaterals.filter(c => c.id !== id));
  };

  const handleSubmitApplication = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/loan-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customer?.id,
          purpose,
          loanType,
          amount,
          period,
          repaymentMode,
          economicSector,
          collaterals
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setApplication(data.data);
        setStep(4); // Move to confirmation step
      } else {
        setError(data.error || "Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateApplicationRef = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `DB/LFF/ADD/KIR/JD/${random}/${year}`;
  };

  const economicSectors = [
    "Agriculture",
    "Construction",
    "Domestic Service",
    "Domestic Trade",
    "Export",
    "Import",
    "Manufacturing",
    "Mining",
    "Real Estate",
    "Transport",
    "Personal Loan/Finance",
    "Staff Mortgage Loan/Finance",
    "Staff Personal Loan/Finance"
  ];

  const loanTypes = [
    "Term Loan",
    "Overdraft Facility",
    "Murabaha",
    "Qard",
    "Kafalah (Guarantee)",
    "Letter of Credit",
    "Advance on LC",
    "Merchandise Loan",
    "ECG Loan",
    "Export Pre-shipment Loan",
    "Export Post-shipment Loan",
    "Warehouse Financing"
  ];

  const repaymentModes = [
    "Monthly Installment",
    "Quarterly Installment",
    "Bi-Annual Installment",
    "Annual Installment",
    "Bullet Payment",
    "Grace Period + Installment"
  ];

  const collateralTypes = [
    "Land and Building",
    "Vehicle",
    "Machinery",
    "Equipment",
    "Inventory",
    "Receivables",
    "Time Deposit",
    "Guarantee",
    "Other"
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashen Bank Loan Origination System</h1>
          <p className="text-gray-600 mb-6">Complete your loan application in a few simple steps</p>
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((stepNumber, index) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                    step === stepNumber ? "bg-blue-600 text-white" : 
                    step > stepNumber ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                  }`}>
                    {step > stepNumber ? "✓" : stepNumber}
                  </div>
                  {index < 3 && (
                    <div className={`h-1 w-16 ${step > stepNumber ? "bg-green-500" : "bg-gray-300"}`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Customer Verification</span>
              <span>Loan Details</span>
              <span>Collateral</span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Customer Verification */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Customer Verification</h2>
              <form onSubmit={(e) => { e.preventDefault(); fetchCustomerData(); }} className="space-y-4">
                <div>
                  <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Customer ID or TIN Number
                  </label>
                  <input
                    type="text"
                    id="customerId"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CUST-12345 or TIN-123456789"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    "Verify Customer"
                  )}
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Don't have a customer ID?</h3>
                <p className="text-blue-700 text-sm">
                  If you're not yet a Dashen Bank customer, please visit your nearest branch to open an account first.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Loan Details */}
          {step === 2 && customer && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Loan Details</h2>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Customer Information</h3>
                <p className="text-sm">{customer.firstName} {customer.middleName} {customer.lastName}</p>
                <p className="text-sm">ID: {customer.customerNumber} | TIN: {customer.tinNumber}</p>
                <p className="text-sm">Phone: {customer.phone} | Email: {customer.email || "N/A"}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Loan
                  </label>
                  <input
                    type="text"
                    id="purpose"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe what you need the loan for"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Loan
                  </label>
                  <select
                    id="loanType"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={loanType}
                    onChange={(e) => setLoanType(e.target.value)}
                    required
                  >
                    <option value="">Select Loan Type</option>
                    {loanTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Loan Amount (ETB)
                    </label>
                    <input
                      type="number"
                      id="amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      value={amount || ""}
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      required
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                      Repayment Period (Months)
                    </label>
                    <input
                      type="number"
                      id="period"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., 12, 24, 36"
                      value={period || ""}
                      onChange={(e) => setPeriod(parseInt(e.target.value))}
                      required
                      min="1"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="repaymentMode" className="block text-sm font-medium text-gray-700 mb-2">
                    Repayment Mode
                  </label>
                  <select
                    id="repaymentMode"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={repaymentMode}
                    onChange={(e) => setRepaymentMode(e.target.value)}
                    required
                  >
                    <option value="">Select Repayment Mode</option>
                    {repaymentModes.map(mode => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Economic Sector(s)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {economicSectors.map(sector => (
                      <div key={sector} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`sector-${sector}`}
                          checked={economicSector.includes(sector)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEconomicSector([...economicSector, sector]);
                            } else {
                              setEconomicSector(economicSector.filter(s => s !== sector));
                            }
                          }}
                          className="mr-2"
                        />
                        <label htmlFor={`sector-${sector}`} className="text-sm">
                          {sector}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    disabled={!purpose || !loanType || !amount || !period || !repaymentMode}
                  >
                    Next: Add Collateral
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Collateral Information */}
          {step === 3 && customer && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Step 3: Collateral Information</h2>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Important Note</h3>
                <p className="text-blue-700 text-sm">
                  All collateral documents must be verified and registered. Please provide accurate information about any assets you're using to secure your loan.
                </p>
              </div>
              
              <div className="space-y-4 mb-6">
                <h3 className="font-medium">Add New Collateral</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="collateralType" className="block text-sm font-medium text-gray-700 mb-2">
                      Collateral Type
                    </label>
                    <select
                      id="collateralType"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      value={collateralType}
                      onChange={(e) => setCollateralType(e.target.value)}
                    >
                      <option value="">Select Collateral Type</option>
                      {collateralTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="estimatedValue" className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Value (ETB)
                    </label>
                    <input
                      type="number"
                      id="estimatedValue"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      value={estimatedValue || ""}
                      onChange={(e) => setEstimatedValue(parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="collateralDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="collateralDescription"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Describe the collateral in detail"
                    value={collateralDescription}
                    onChange={(e) => setCollateralDescription(e.target.value)}
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="titleDeedNo" className="block text-sm font-medium text-gray-700 mb-2">
                      Title Deed/Serial Number
                    </label>
                    <input
                      type="text"
                      id="titleDeedNo"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., TD-123456"
                      value={titleDeedNo}
                      onChange={(e) => setTitleDeedNo(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="taxCustomsCharge" className="block text-sm font-medium text-gray-700 mb-2">
                      Tax & Customs Charge (ETB)
                    </label>
                    <input
                      type="number"
                      id="taxCustomsCharge"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                      value={taxCustomsCharge || ""}
                      onChange={(e) => setTaxCustomsCharge(parseFloat(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleAddCollateral}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  disabled={!collateralType || !estimatedValue}
                >
                  Add Collateral
                </button>
              </div>
              
              {/* List of Collaterals */}
              {collaterals.length > 0 ? (
                <div className="mb-6">
                  <h3 className="font-medium mb-4">Your Collaterals</h3>
                  <div className="space-y-4">
                    {collaterals.map(collateral => (
                      <div key={collateral.id} className="border rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{collateral.type}</h4>
                            <p className="text-sm text-gray-600">{collateral.description}</p>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Value:</span> ETB {collateral.estimatedValue.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Net Value:</span> ETB {collateral.netValue.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Title Deed:</span> {collateral.titleDeedNo || "N/A"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveCollateral(collateral.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-yellow-50 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    No collateral added yet. Adding collateral may improve your loan approval chances.
                  </p>
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitApplication}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  disabled={!purpose || !loanType || !amount || !period || !repaymentMode || loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && application && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Application Submitted Successfully!</h2>
              
              <div className="p-4 bg-green-50 rounded-md mb-6">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-700 font-medium">Your loan application has been submitted for processing.</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Application Reference Number</h3>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded">{application.applicationRef}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please save this reference number for future inquiries about your application.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Loan Details</h3>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Purpose:</span> {application.purpose}</p>
                      <p><span className="font-medium">Type:</span> {application.loanType}</p>
                      <p><span className="font-medium">Amount:</span> ETB {application.amount.toLocaleString()}</p>
                      <p><span className="font-medium">Period:</span> {application.period} months</p>
                      <p><span className="font-medium">Repayment:</span> {application.repaymentMode}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Next Steps</h3>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      <li>Your application will be reviewed by our credit team</li>
                      <li>We may contact you for additional information</li>
                      <li>You will receive updates via SMS and email</li>
                      <li>Approval process typically takes 3-5 business days</li>
                    </ul>
                  </div>
                </div>
                
                {collaterals.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">Collateral Summary</h3>
                    <div className="text-sm">
                      <p className="mb-2">You have provided {collaterals.length} collateral item(s) with total value of ETB {collaterals.reduce((sum, c) => sum + c.netValue, 0).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setStep(1);
                    setCustomerId("");
                    setCustomer(null);
                    setApplication(null);
                    setCollaterals([]);
                    setPurpose("");
                    setLoanType("");
                    setAmount(0);
                    setPeriod(0);
                    setRepaymentMode("");
                    setEconomicSector([]);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Start New Application
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Print Application
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Information Panel */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Need Help?</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>Visit your nearest Dashen Bank branch for assistance with your loan application.</p>
            <p>Call our customer service: +251 11 5 75 75 75</p>
            <p>Email: info@dashenbanksc.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}