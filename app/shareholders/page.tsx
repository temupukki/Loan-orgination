"use client";

import { useState, useEffect } from "react";
import { Customer, Shareholder, Shareholders } from "@/app/types/loan";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatPercentage } from "@/app/utils/formatters";

export default function ShareholdersPage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [shareholders, setShareholders] = useState<Shareholders>({});
  const [currentCompany, setCurrentCompany] = useState<string>("default");
  const [newShareholder, setNewShareholder] = useState<Shareholder>({
    name: "",
    shareValue: 0,
    sharePercentage: 0,
    nationality: "",
    idNumber: "",
    address: "",
    phone: "",
    email: "",
    isDirector: false,
    position: "",
    dateOfBirth: ""
  });
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    const customerData = localStorage.getItem('currentCustomer');
    if (customerData) {
      const customerObj = JSON.parse(customerData);
      setCustomer(customerObj);
      
      // Load shareholders from customer data if exists
      if (customerObj.shareholders && typeof customerObj.shareholders === 'object') {
        setShareholders(customerObj.shareholders);
      } else {
        // Initialize with default company
        setShareholders({
          default: []
        });
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const addShareholder = () => {
    if (newShareholder.name && newShareholder.shareValue > 0 && newShareholder.sharePercentage > 0) {
      const updatedShareholders = {
        ...shareholders,
        [currentCompany]: [
          ...(shareholders[currentCompany] || []),
          {
            ...newShareholder,
            id: Date.now().toString() // Temporary ID
          }
        ]
      };
      
      setShareholders(updatedShareholders);
      setNewShareholder({
        name: "",
        shareValue: 0,
        sharePercentage: 0,
        nationality: "",
        idNumber: "",
        address: "",
        phone: "",
        email: "",
        isDirector: false,
        position: "",
        dateOfBirth: ""
      });
      
      // Update customer with shareholders
      if (customer) {
        setCustomer({
          ...customer,
          shareholders: updatedShareholders
        });
      }
    }
  };

  const removeShareholder = (company: string, index: number) => {
    const updatedShareholders = {
      ...shareholders,
      [company]: shareholders[company].filter((_, i) => i !== index)
    };
    
    // Remove company if no shareholders left
    if (updatedShareholders[company].length === 0) {
      delete updatedShareholders[company];
    }
    
    setShareholders(updatedShareholders);
    
    if (customer) {
      setCustomer({
        ...customer,
        shareholders: updatedShareholders
      });
    }
  };

  const addCompany = () => {
    const companyName = prompt("Enter company name:");
    if (companyName && companyName.trim()) {
      setShareholders({
        ...shareholders,
        [companyName]: []
      });
      setCurrentCompany(companyName);
    }
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
      const updatedCustomer = {
        ...customer,
        shareholders
      };
      localStorage.setItem('currentCustomer', JSON.stringify(updatedCustomer));
      window.location.href = '/documents';
    }
  };

  const goBack = () => {
    window.location.href = '/loan-details';
  };

  const calculateTotals = (company: string) => {
    const companyShareholders = shareholders[company] || [];
    return {
      totalValue: companyShareholders.reduce((sum, sh) => sum + sh.shareValue, 0),
      totalPercentage: companyShareholders.reduce((sum, sh) => sum + sh.sharePercentage, 0)
    };
  };

  if (!customer) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Shareholders Information</h1>

          {/* Company Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Company
            </label>
            <div className="flex gap-2 flex-wrap">
              {Object.keys(shareholders).map(company => (
                <button
                  key={company}
                  onClick={() => setCurrentCompany(company)}
                  className={`px-4 py-2 rounded-lg ${
                    currentCompany === company
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {company === 'default' ? 'Main Company' : company}
                </button>
              ))}
              <button
                onClick={addCompany}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Company
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-4">
              Add New Shareholder to {currentCompany === 'default' ? 'Main Company' : currentCompany}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={newShareholder.name}
                  onChange={(e) => setNewShareholder({...newShareholder, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Value ($) *
                </label>
                <input
                  type="number"
                  value={newShareholder.shareValue}
                  onChange={(e) => setNewShareholder({...newShareholder, shareValue: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Share Percentage (%) *
                </label>
                <input
                  type="number"
                  value={newShareholder.sharePercentage}
                  onChange={(e) => setNewShareholder({...newShareholder, sharePercentage: Number(e.target.value)})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality
                </label>
                <input
                  type="text"
                  value={newShareholder.nationality}
                  onChange={(e) => setNewShareholder({...newShareholder, nationality: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Number
                </label>
                <input
                  type="text"
                  value={newShareholder.idNumber}
                  onChange={(e) => setNewShareholder({...newShareholder, idNumber: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newShareholder.phone}
                  onChange={(e) => setNewShareholder({...newShareholder, phone: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newShareholder.email}
                  onChange={(e) => setNewShareholder({...newShareholder, email: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position/Role
                </label>
                <input
                  type="text"
                  value={newShareholder.position}
                  onChange={(e) => setNewShareholder({...newShareholder, position: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={newShareholder.dateOfBirth}
                  onChange={(e) => setNewShareholder({...newShareholder, dateOfBirth: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newShareholder.isDirector}
                  onChange={(e) => setNewShareholder({...newShareholder, isDirector: e.target.checked})}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  Board Director
                </label>
              </div>
            </div>
            
            <button
              onClick={addShareholder}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            >
              Add Shareholder
            </button>
          </div>

          {/* Shareholders List by Company */}
          {Object.entries(shareholders).map(([company, companyShareholders]) => (
            <div key={company} className="mb-6">
              <h3 className="text-lg font-medium mb-4">
                {company === 'default' ? 'Main Company' : company} - Shareholders
                <span className="text-sm text-gray-500 ml-2">
                  ({companyShareholders.length} shareholders)
                </span>
              </h3>
              
              {companyShareholders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Share Value</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Percentage</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Position</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Director</th>
                          <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {companyShareholders.map((shareholder, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <div className="font-medium">{shareholder.name}</div>
                              {shareholder.nationality && (
                                <div className="text-sm text-gray-500">{shareholder.nationality}</div>
                              )}
                            </td>
                            <td className="px-4 py-2">{formatCurrency(shareholder.shareValue)}</td>
                            <td className="px-4 py-2">{formatPercentage(shareholder.sharePercentage)}</td>
                            <td className="px-4 py-2">{shareholder.position || '-'}</td>
                            <td className="px-4 py-2">{shareholder.isDirector ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => removeShareholder(company, index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-4 py-2 font-medium">Total</td>
                          <td className="px-4 py-2 font-medium">
                            {formatCurrency(calculateTotals(company).totalValue)}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {formatPercentage(calculateTotals(company).totalPercentage)}
                          </td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-sm">No shareholders added for this company.</p>
              )}
            </div>
          ))}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareholders Details Document
            </label>
            <input
              type="file"
              onChange={(e) => handleDocumentUpload(e, 'shareholdersDetails')}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            {uploading === 'shareholdersDetails' && <span className="text-sm text-gray-500">Uploading...</span>}
            {customer.shareholdersDetailsUrl && (
              <div className="mt-2 text-sm text-green-600">
                Document uploaded successfully
              </div>
            )}
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
              Next: Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}