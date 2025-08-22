"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { loanTypes } from "@/app/utils/constants";
import { supabase } from "@/lib/supabase";

export default function LoanDetailsPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const saveAndContinue = () => {
    if (customer) {
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      window.location.href = '/shareholders';
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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose of Loan
                </label>
                <textarea
                  name="purposeOfLoan"
                  value={customer.purposeOfLoan || ""}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Application Form
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'applicationForm')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'applicationForm' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.applicationFormUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Type
                </label>
                <select
                  name="loanType"
                  value={customer.loanType || ""}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select Loan Type</option>
                  {loanTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={customer.loanAmount || ""}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loan Period (months)
                </label>
                <input
                  type="number"
                  name="loanPeriod"
                  value={customer.loanPeriod || ""}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mode of Repayment
                </label>
                <input
                  type="text"
                  name="modeOfRepayment"
                  value={customer.modeOfRepayment || ""}
                  onChange={handleFieldChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={goBack}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={saveAndContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Next: Shareholders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}