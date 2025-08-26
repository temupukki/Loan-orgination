// components/CreditEdit.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface CreditEditProps {
  customerId: string;
  onSuccess: () => void;
}

export function CreditEdit({ customerId, onSuccess }: CreditEditProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTake = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/take`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: "UNDER_REVIEW" }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to take application.');
      }

      toast.success("Application successfully assigned to you and status updated to 'Under Review'.");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTake} disabled={isLoading}>
      {isLoading ? "Updating..." : "Edit Credit"}
    </Button>
  );
}
