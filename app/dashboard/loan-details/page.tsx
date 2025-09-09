"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { loanTypes } from "@/app/utils/constants";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Upload, CheckCircle } from "lucide-react";

export default function LoanDetailsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      setCustomer(JSON.parse(customerData));
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!customer) return;
    
    const { name, value } = e.target;
    
    // Special handling for loan amount to ensure it's within valid range
    if (name === 'loanAmount') {
      const numValue = Number(value);
      if (numValue < 100000) {
        setErrors(prev => ({
          ...prev,
          [name]: "Minimum loan amount is 100,000 ETB"
        }));
      } else if (numValue > 10000000) {
        setErrors(prev => ({
          ...prev,
          [name]: "Maximum loan amount is 10,000,000 ETB"
        }));
      } else if (errors[name]) {
        // Clear error if value is now valid
        setErrors(prev => ({
          ...prev,
          [name]: ""
        }));
      }
    }
    
    setCustomer({
      ...customer,
      [name]: name === 'loanAmount' || name === 'loanPeriod' ? Number(value) : value
    });

    // Clear error when field is updated
    if (errors[name] && name !== 'loanAmount') {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
    
    // Validate the field when it loses focus
    validateField(fieldName, customer?.[fieldName as keyof Customer] as string);
  };

  const validateField = (fieldName: string, value: any) => {
    let isValid = true;
    let errorMessage = "";

    switch (fieldName) {
      case "purposeOfLoan":
        if (!value || value.trim() === "") {
          errorMessage = "Purpose of loan is required";
          isValid = false;
        }
        break;
      
      case "loanType":
        if (!value || value.trim() === "") {
          errorMessage = "Loan type is required";
          isValid = false;
        }
        break;
      
      case "loanAmount":
        if (!value || value <= 0) {
          errorMessage = "Valid loan amount is required";
          isValid = false;
        } else if (value < 100000) {
          errorMessage = "Minimum loan amount is 100,000 ETB";
          isValid = false;
        } else if (value > 10000000) {
          errorMessage = "Maximum loan amount is 10,000,000 ETB";
          isValid = false;
        }
        break;
      
      case "loanPeriod":
        if (!value || value <= 0) {
          errorMessage = "Valid loan period is required";
          isValid = false;
        }
        break;
      
      case "modeOfRepayment":
        if (!value || value.trim() === "") {
          errorMessage = "Mode of repayment is required";
          isValid = false;
        }
        break;
      
      case "applicationFormDoc":
        if (!customer?.applicationFormUrl) {
          errorMessage = "Loan application form is required";
          isValid = false;
        }
        break;
      
      // shareholdersDetailsUrl is optional, no validation needed
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [fieldName]: errorMessage
    }));

    return isValid;
  };

  const validateForm = () => {
    if (!customer) return false;

    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate all required fields
    if (!customer.purposeOfLoan?.trim()) {
      newErrors.purposeOfLoan = "Purpose of loan is required";
      isValid = false;
    }

    if (!customer.loanType?.trim()) {
      newErrors.loanType = "Loan type is required";
      isValid = false;
    }

    if (!customer.loanAmount || customer.loanAmount <= 0) {
      newErrors.loanAmount = "Valid loan amount is required";
      isValid = false;
    } else if (customer.loanAmount < 100000) {
      newErrors.loanAmount = "Minimum loan amount is 100,000 ETB";
      isValid = false;
    } else if (customer.loanAmount > 10000000) {
      newErrors.loanAmount = "Maximum loan amount is 10,000,000 ETB";
      isValid = false;
    }

    if (!customer.loanPeriod || customer.loanPeriod <= 0) {
      newErrors.loanPeriod = "Valid loan period is required";
      isValid = false;
    }

    if (!customer.modeOfRepayment?.trim()) {
      newErrors.modeOfRepayment = "Mode of repayment is required";
      isValid = false;
    }

    if (!customer.applicationFormUrl) {
      newErrors.applicationFormDoc = "Loan application form is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const bucketName = "LOAN";
      const filePath = `${type}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      throw new Error(`Failed to upload ${type} document: ${(err as Error).message}`);
    } finally {
      setUploading(null);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (!e.target.files || e.target.files.length === 0 || !customer) return;
    
    const file = e.target.files[0];
    
    // Validate file
    const validTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [`${type}Doc`]: "Please upload PDF, Word, or image files only"
      }));
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [`${type}Doc`]: "File size must be less than 10MB"
      }));
      return;
    }

    try {
      const fileUrl = await uploadDocument(file, type);
      
      setCustomer({
        ...customer,
        [`${type}Url`]: fileUrl
      });

      // Clear document error after successful upload
      if (errors[`${type}Doc`]) {
        setErrors(prev => ({
          ...prev,
          [`${type}Doc`]: ""
        }));
      }
    } catch (err: any) {
      console.error(err.message);
      setErrors(prev => ({
        ...prev,
        [`${type}Doc`]: "Failed to upload document. Please try again."
      }));
    }
  };

  const saveAndContinue = () => {
    // Mark all required fields as touched
    setTouched({
      purposeOfLoan: true,
      loanType: true,
      loanAmount: true,
      loanPeriod: true,
      modeOfRepayment: true,
      applicationFormDoc: true
    });

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (customer) {
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      window.location.href = '/dashboard/documents';
    }
  };

  const goBack = () => {
    window.location.href = '/dashboard/business-info';
  };

  if (!customer) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-gray-700">Loading customer data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mobile Header */}
        <div className="flex items-center mb-4 md:hidden">
          <button 
            onClick={goBack}
            className="p-2 rounded-full bg-white shadow-sm mr-2"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Loan Details</h1>
        </div>

        {/* Stepper Header - Mobile Optimized */}
        <div className="flex items-center justify-center mb-6 overflow-x-auto py-2">
          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                1
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">Search</span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                2
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">Basic</span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                3
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">Business</span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm">
                4
              </div>
              <span className="ml-1 sm:ml-2 font-semibold text-blue-700 hidden xs:inline">Loan</span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                5
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">Documents</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 mb-4">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              Loan Origination – Step 4
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Provide loan details to continue
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Purpose of Loan */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Purpose of Loan *
              </h3>
              <textarea
                name="purposeOfLoan"
                value={customer.purposeOfLoan || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("purposeOfLoan")}
                className={`w-full p-2 text-sm border rounded-md ${
                  errors.purposeOfLoan && touched.purposeOfLoan
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                rows={3}
                placeholder="Describe the purpose of the loan"
                required
              />
              {errors.purposeOfLoan && touched.purposeOfLoan && (
                <p className="mt-1 text-xs text-red-600">{errors.purposeOfLoan}</p>
              )}
            </div>
            
            {/* Loan Type */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Loan Type *
              </h3>
              <select
                name="loanType"
                value={customer.loanType || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("loanType")}
                className={`w-full p-2 text-sm border rounded-md ${
                  errors.loanType && touched.loanType
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                required
              >
                <option value="">Select Loan Type</option>
                {loanTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.loanType && touched.loanType && (
                <p className="mt-1 text-xs text-red-600">{errors.loanType}</p>
              )}
            </div>

            {/* Loan Amount */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Loan Amount (ETB) *
              </h3>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">ETB</span>
                <input
                  type="number"
                  name="loanAmount"
                  value={customer.loanAmount || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("loanAmount")}
                  className={`w-full pl-12 pr-3 py-2 text-sm border rounded-md ${
                    errors.loanAmount && touched.loanAmount
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  min="100000"
                  max="10000000"
                  step="1000"
                  placeholder="Enter loan amount"
                  required
                />
              </div>
              {errors.loanAmount && touched.loanAmount && (
                <p className="mt-1 text-xs text-red-600">{errors.loanAmount}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum: 100,000 ETB | Maximum: 10,000,000 ETB
              </p>
            </div>

            {/* Loan Period */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Loan Period (months) *
              </h3>
              <input
                type="number"
                name="loanPeriod"
                value={customer.loanPeriod || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("loanPeriod")}
                className={`w-full p-2 text-sm border rounded-md ${
                  errors.loanPeriod && touched.loanPeriod
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                min="1"
                placeholder="Enter loan period in months"
                required
              />
              {errors.loanPeriod && touched.loanPeriod && (
                <p className="mt-1 text-xs text-red-600">{errors.loanPeriod}</p>
              )}
            </div>

            {/* Mode of Repayment */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Mode of Repayment *
              </h3>
              <input
                type="text"
                name="modeOfRepayment"
                value={customer.modeOfRepayment || ""}
                onChange={handleFieldChange}
                onBlur={() => handleBlur("modeOfRepayment")}
                className={`w-full p-2 text-sm border rounded-md ${
                  errors.modeOfRepayment && touched.modeOfRepayment
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
                placeholder="e.g., Monthly installments, Quarterly payments"
                required
              />
              {errors.modeOfRepayment && touched.modeOfRepayment && (
                <p className="mt-1 text-xs text-red-600">{errors.modeOfRepayment}</p>
              )}
            </div>

            {/* Loan Application Form */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Loan Application Form *
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'applicationForm' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.applicationFormUrl ? (
                      <>
                        <CheckCircle className="w-6 h-6 mb-1 text-green-600" />
                        <p className="text-xs text-gray-500">Document uploaded</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF, Word, or images (max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, 'applicationForm')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </label>
              </div>
              {errors.applicationFormDoc && touched.applicationFormDoc && (
                <p className="mt-1 text-xs text-red-600">{errors.applicationFormDoc}</p>
              )}
            </div>

            {/* Shareholders Details Document (OPTIONAL) */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Shareholders Details Document
                <span className="text-sm font-normal text-gray-500 ml-1">(Optional)</span>
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'shareholdersDetails' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.shareholdersDetailsUrl ? (
                      <>
                        <CheckCircle className="w-6 h-6 mb-1 text-green-600" />
                        <p className="text-xs text-gray-500">Document uploaded</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 mb-1 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">PDF, Word, or images (max 10MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    onChange={(e) => handleDocumentUpload(e, 'shareholdersDetails')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Upload shareholders details document if available
              </p>
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm">
            <p className="text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are required. 
              Shareholders details document is optional but recommended if available.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between mt-6 gap-3">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex-1 sm:flex-initial"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
              disabled={Object.values(errors).some(error => error) && Object.keys(touched).length > 0}
            >
              Next: Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}