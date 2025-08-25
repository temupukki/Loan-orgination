"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";

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
      
      case "nationalidDoc":
        if (!customer.nationalidUrl) {
          errorMessage = "National ID document is required";
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
      
      case "agreementFormDoc":
        if (!customer.agreementFormUrl) {
          errorMessage = "Agreement form is required";
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

    // Validate all required documents
    if (!customer.creditProfileUrl) {
      newErrors.creditProfileDoc = "Credit profile document is required";
      isValid = false;
    }

    if (!customer.transactionProfileUrl) {
      newErrors.transactionProfileDoc = "Transaction profile document is required";
      isValid = false;
    }

    if (!customer.nationalidUrl) {
      newErrors.nationalidDoc = "National ID document is required";
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

    if (!customer.agreementFormUrl) {
      newErrors.agreementFormDoc = "Agreement form is required";
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
    // Mark all documents as touched
    setTouched({
      creditProfileDoc: true,
      transactionProfileDoc: true,
      nationalidDoc: true,
      collateralProfileDoc: true,
      financialProfileDoc: true,
      agreementFormDoc: true
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
      window.location.href = '/dashboard/review';
    }
  };

  const goBack = () => {
    window.location.href = '/dashboard/loan-details';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Stepper Header */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                1
              </div>
              <span className="ml-2 text-gray-500">Search Customer</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                2
              </div>
              <span className="ml-2 text-gray-500">Basic Info</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                3
              </div>
              <span className="ml-2 text-gray-500">Business Info</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center opacity-40">
              <div className="h-10 w-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold">
                4
              </div>
              <span className="ml-2 text-gray-500">Loan Details</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                5
              </div>
              <span className="ml-2 font-semibold text-blue-700">Documents</span>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Loan Origination – Step 5
            </h1>
            <p className="text-gray-600">
              Upload all required documents to continue
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Credit Profile Document */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                <h3 className="text-lg font-medium mb-3">
                  Credit Profile Document *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'creditProfile')}
                  className={`w-full p-2 border rounded-md ${
                    errors.creditProfileDoc && touched.creditProfileDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'creditProfile' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.creditProfileDoc && touched.creditProfileDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditProfileDoc}</p>
                )}
                {customer.creditProfileUrl && !errors.creditProfileDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>

              {/* Transaction Profile Document */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                <h3 className="text-lg font-medium mb-3">
                  Transaction Profile Document *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'transactionProfile')}
                  className={`w-full p-2 border rounded-md ${
                    errors.transactionProfileDoc && touched.transactionProfileDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'transactionProfile' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.transactionProfileDoc && touched.transactionProfileDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.transactionProfileDoc}</p>
                )}
                {customer.transactionProfileUrl && !errors.transactionProfileDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>

              {/* National ID Document */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-100">
                <h3 className="text-lg font-medium mb-3">
                  National ID Document *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'nationalid')}
                  className={`w-full p-2 border rounded-md ${
                    errors.nationalidDoc && touched.nationalidDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'nationalid' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.nationalidDoc && touched.nationalidDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.nationalidDoc}</p>
                )}
                {customer.nationalidUrl && !errors.nationalidDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Collateral Profile Document */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
                <h3 className="text-lg font-medium mb-3">
                  Collateral Profile Document *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'collateralProfile')}
                  className={`w-full p-2 border rounded-md ${
                    errors.collateralProfileDoc && touched.collateralProfileDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'collateralProfile' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.collateralProfileDoc && touched.collateralProfileDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.collateralProfileDoc}</p>
                )}
                {customer.collateralProfileUrl && !errors.collateralProfileDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>

              {/* Financial Profile Document */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
                <h3 className="text-lg font-medium mb-3">
                  Financial Profile Document *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'financialProfile')}
                  className={`w-full p-2 border rounded-md ${
                    errors.financialProfileDoc && touched.financialProfileDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'financialProfile' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.financialProfileDoc && touched.financialProfileDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.financialProfileDoc}</p>
                )}
                {customer.financialProfileUrl && !errors.financialProfileDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>

              {/* Agreement Form */}
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-100">
                <h3 className="text-lg font-medium mb-3">
                  Agreement Form *
                </h3>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'agreementForm')}
                  className={`w-full p-2 border rounded-md ${
                    errors.agreementFormDoc && touched.agreementFormDoc
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  required
                />
                {uploading === 'agreementForm' && (
                  <p className="mt-1 text-sm text-blue-600">Uploading...</p>
                )}
                {errors.agreementFormDoc && touched.agreementFormDoc && (
                  <p className="mt-1 text-sm text-red-600">{errors.agreementFormDoc}</p>
                )}
                {customer.agreementFormUrl && !errors.agreementFormDoc && (
                  <p className="mt-1 text-sm text-green-600">✓ Document uploaded successfully</p>
                )}
              </div>
            </div>
          </div>

          {/* Required fields note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> All documents marked with * are required. 
              Please upload all necessary documents to complete your loan application.
            </p>
          </div>

          {/* Actions */}
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
              Next: Review Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}