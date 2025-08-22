"use client";

import { useState } from "react";

interface Customer {
  id: string;
  customerNumber: string;
  tinNumber: string;
  firstName: string;
  middleName: string;
  lastName: string;
  mothersName: string;
  gender: string;
  maritalStatus: string;
  dateOfBirth: string;
  nationalId: string;
  phone: string;
  email: string;
  region: string;
  zone: string;
  city: string;
  subcity: string;
  woreda: string;
  monthlyIncome: number;
  status: string;
  nationalidUrl: string;
  agreementFormUrl: string;
  accountType: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [customerNumber, setCustomerNumber] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCustomer = async () => {
    if (!customerNumber.trim()) {
      setError("Please enter a customer number");
      return;
    }

    setLoading(true);
    setError("");
    setCustomer(null);

    try {
      const res = await fetch(
        `http://localhost:3000/api/customer?customerNumber=${customerNumber}`
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }

      const data: Customer = await res.json();
      setCustomer(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Fetch Customer Data</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter customer number"
          value={customerNumber}
          onChange={(e) => setCustomerNumber(e.target.value)}
          style={{ padding: "0.5rem", width: "300px" }}
        />
        <button
          onClick={fetchCustomer}
          style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
        >
          Fetch
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {customer && (
        <div>
          <h2>Customer Info:</h2>
          <pre>{JSON.stringify(customer, null, 2)}</pre>
          <p>
            <a href={customer.nationalidUrl} target="_blank" rel="noreferrer">
              View National ID
            </a>
          </p>
          <p>
            <a href={customer.agreementFormUrl} target="_blank" rel="noreferrer">
              View Agreement Form
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
