"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";
import { Loader2, ArrowLeft, Upload, CheckCircle } from "lucide-react";

export default function DocumentsPage() {
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

  const validateField = (fieldName: string) => {
    let isValid = true;
    let errorMessage = "";

    if (!customer) return false;

    switch (fieldName) {
      case "creditProfileDoc":
        if (!customer.creditProfileUrl) {
          errorMessage = "Credit profile document is required";
          isValid = false;
        }
        break;
      
      case "transactionProfileDoc":
        if (!customer.transactionProfileUrl) {
          errorMessage = "Transaction profile document is required";
          isValid = false;
        }
        break;
      
      case "collateralProfileDoc":
        if (!customer.collateralProfileUrl) {
          errorMessage = "Collateral profile document is required";
          isValid = false;
        }
        break;
      
      case "financialProfileDoc":
        if (!customer.financialProfileUrl) {
          errorMessage = "Financial profile document is required";
          isValid = false;
        }
        break;
      
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

    if (!customer.creditProfileUrl) {
      newErrors.creditProfileDoc = "Credit profile document is required";
      isValid = false;
    }

    if (!customer.transactionProfileUrl) {
      newErrors.transactionProfileDoc = "Transaction profile document is required";
      isValid = false;
    }

    if (!customer.collateralProfileUrl) {
      newErrors.collateralProfileDoc = "Collateral profile document is required";
      isValid = false;
    }

    if (!customer.financialProfileUrl) {
      newErrors.financialProfileDoc = "Financial profile document is required";
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
    setTouched({
      creditProfileDoc: true,
      transactionProfileDoc: true,
      collateralProfileDoc: true,
      financialProfileDoc: true
    });

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (customer) {
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      window.location.href = '/dashboard/review';
    }
  };

  const goBack = () => {
    window.location.href = '/dashboard/loan-details';
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
          <h1 className="text-xl font-bold text-gray-800">Required Documents</h1>
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
            <div className="flex items-center opacity-40 whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold text-xs sm:text-sm">
                4
              </div>
              <span className="ml-1 sm:ml-2 text-gray-500 hidden xs:inline">Loan</span>
            </div>
            <div className="w-6 sm:w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center whitespace-nowrap">
              <div className="h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-xs sm:text-sm">
                5
              </div>
              <span className="ml-1 sm:ml-2 font-semibold text-blue-700 hidden xs:inline">Documents</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-4 sm:p-6 mb-4">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
              Loan Origination – Step 5
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Upload all required documents to continue
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Credit Profile Document */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Credit Profile Document *
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'creditProfile' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.creditProfileUrl ? (
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
                    onChange={(e) => handleDocumentUpload(e, 'creditProfile')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </label>
              </div>
              {errors.creditProfileDoc && touched.creditProfileDoc && (
                <p className="mt-1 text-xs text-red-600">{errors.creditProfileDoc}</p>
              )}
            </div>

            {/* Transaction Profile Document */}
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-2 border-blue-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Transaction Profile Document *
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'transactionProfile' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.transactionProfileUrl ? (
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
                    onChange={(e) => handleDocumentUpload(e, 'transactionProfile')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </label>
              </div>
              {errors.transactionProfileDoc && touched.transactionProfileDoc && (
                <p className="mt-1 text-xs text-red-600">{errors.transactionProfileDoc}</p>
              )}
            </div>

            {/* Collateral Profile Document */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Collateral Profile Document *
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'collateralProfile' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.collateralProfileUrl ? (
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
                    onChange={(e) => handleDocumentUpload(e, 'collateralProfile')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </label>
              </div>
              {errors.collateralProfileDoc && touched.collateralProfileDoc && (
                <p className="mt-1 text-xs text-red-600">{errors.collateralProfileDoc}</p>
              )}
            </div>

            {/* Financial Profile Document */}
            <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border-2 border-purple-100">
              <h3 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Financial Profile Document *
              </h3>
              <div className="relative">
                <label className="flex flex-col items-center justify-center w-full p-3 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    {uploading === 'financialProfile' ? (
                      <>
                        <Loader2 className="w-6 h-6 mb-1 text-blue-600 animate-spin" />
                        <p className="text-xs text-gray-500">Uploading...</p>
                      </>
                    ) : customer.financialProfileUrl ? (
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
                    onChange={(e) => handleDocumentUpload(e, 'financialProfile')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                </label>
              </div>
              {errors.financialProfileDoc && touched.financialProfileDoc && (
                <p className="mt-1 text-xs text-red-600">{errors.financialProfileDoc}</p>
              )}
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs sm:text-sm">
            <p className="text-blue-700">
              <span className="font-medium">Note:</span> All documents marked with * are required. 
              Please upload all necessary documents to complete your loan application.
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
              Next: Review Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}