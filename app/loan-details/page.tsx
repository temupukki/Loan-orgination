"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { loanTypes } from "@/app/utils/constants";
import { supabase } from "@/lib/supabase";

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
    setCustomer({
      ...customer,
      [name]: name === 'loanAmount' || name === 'loanPeriod' ? Number(value) : value
    });

    // Clear error when field is updated
    if (errors[name]) {
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

    // shareholdersDetailsUrl is optional, no validation needed

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
      // shareholdersDetailsDoc is optional, no need to mark as touched
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
      window.location.href = '/documents';
    }
  };

  const goBack = () => {
    window.location.href = '/business-info';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Loan Request Details</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Purpose of Loan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Loan *
                </label>
                <textarea
                  name="purposeOfLoan"
                  value={customer.purposeOfLoan || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("purposeOfLoan")}
                  className={`w-full p-2 border rounded-md ${
                    errors.purposeOfLoan && touched.purposeOfLoan
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  rows={3}
                  placeholder="Describe the purpose of the loan"
                  required
                />
                {errors.purposeOfLoan && touched.purposeOfLoan && (
                  <p className="mt-1 text-sm text-red-600">{errors.purposeOfLoan}</p>
                )}
              </div>
              
              {/* Loan Application Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Application Form *
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'applicationForm')}
                  className={`w-full p-2 border rounded-md ${
                    errors.applicationFormDoc && touched.applicationFormDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'applicationForm' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.applicationFormDoc && touched.applicationFormDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.applicationFormDoc}</p>
                )}
                {customer.applicationFormUrl && !errors.applicationFormDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>

              {/* Shareholders Details Document (OPTIONAL) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shareholders Details Document
                  <span className="text-sm font-normal text-gray-500 ml-1">(Optional)</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'shareholdersDetails')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                {uploading === 'shareholdersDetails' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {customer.shareholdersDetailsUrl && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Upload shareholders details document if available
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Loan Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type *
                </label>
                <select
                  name="loanType"
                  value={customer.loanType || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("loanType")}
                  className={`w-full p-2 border rounded-md ${
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
                  <p className="mt-1 text-sm text-red-600">{errors.loanType}</p>
                )}
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount ($) *
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={customer.loanAmount || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("loanAmount")}
                  className={`w-full p-2 border rounded-md ${
                    errors.loanAmount && touched.loanAmount
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  min="1"
                  step="0.01"
                  placeholder="Enter loan amount"
                  required
                />
                {errors.loanAmount && touched.loanAmount && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>
                )}
              </div>

              {/* Loan Period */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Period (months) *
                </label>
                <input
                  type="number"
                  name="loanPeriod"
                  value={customer.loanPeriod || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("loanPeriod")}
                  className={`w-full p-2 border rounded-md ${
                    errors.loanPeriod && touched.loanPeriod
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  min="1"
                  placeholder="Enter loan period in months"
                  required
                />
                {errors.loanPeriod && touched.loanPeriod && (
                  <p className="mt-1 text-sm text-red-600">{errors.loanPeriod}</p>
                )}
              </div>

              {/* Mode of Repayment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode of Repayment *
                </label>
                <input
                  type="text"
                  name="modeOfRepayment"
                  value={customer.modeOfRepayment || ""}
                  onChange={handleFieldChange}
                  onBlur={() => handleBlur("modeOfRepayment")}
                  className={`w-full p-2 border rounded-md ${
                    errors.modeOfRepayment && touched.modeOfRepayment
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  placeholder="e.g., Monthly installments, Quarterly payments"
                  required
                />
                {errors.modeOfRepayment && touched.modeOfRepayment && (
                  <p className="mt-1 text-sm text-red-600">{errors.modeOfRepayment}</p>
                )}
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Fields marked with * are required. 
              Shareholders details document is optional but recommended if available.
            </p>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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