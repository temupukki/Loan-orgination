"use client";

import { useState } from "react";
import { Customer } from "./types/loan";

export default function HomePage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomer = async () => {
    if (!customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `http://localhost:3000/api/loan?customerNumber=${customerNumber}`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }
      const customer: Customer = await res.json();
      
      // Store customer data and navigate to basic info
      localStorage.setItem('currentCustomer', JSON.stringify(customer));
      // Use window.location for navigation instead of useRouter
      window.location.href = '/basic-info';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Loan Origination System
          </h1>
          <p className="text-gray-600">
            Start by searching for a customer
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Number
            </label>
            <input
              type="text"
              placeholder="Enter customer number"
              value={customerNumber}
              onChange={(e) => setCustomerNumber(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchCustomer();
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {error && (
            <div className="mb-4 text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={fetchCustomer}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search Customer"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have a customer number?{" "}
              <a href="/new-customer" className="text-blue-600 hover:underline">
                Create new customer
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}