"use client";

import { useState, useEffect } from "react";
import { Customer } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";

export default function DocumentsPage() {
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
      window.location.href = '/review';
    }
  };

  const goBack = () => {
    window.location.href = '/shareholders';
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Required Documents</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credit Profile Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'creditProfile')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'creditProfile' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.creditProfileUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Profile Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'transactionProfile')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'transactionProfile' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.transactionProfileUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National ID Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'nationalid')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'nationalid' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.nationalidUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collateral Profile Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'collateralProfile')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'collateralProfile' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.collateralProfileUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Financial Profile Document
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'financialProfile')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'financialProfile' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.financialProfileUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agreement Form
                </label>
                <input
                  type="file"
                  onChange={(e) => handleDocumentUpload(e, 'agreementForm')}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {uploading === 'agreementForm' && <span className="text-sm text-gray-500">Uploading...</span>}
                {customer.agreementFormUrl && (
                  <div className="mt-2 text-sm text-green-600">
                    Document uploaded successfully
                  </div>
                )}
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
              Next: Review Application
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}