// components/ToFinale.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
const { data: session, error } = await authClient.getSession()
interface ToFinaleProps {
  customerId: string;
  onSuccess: () => void;
}

export function ToFinale({ customerId, onSuccess }: ToFinaleProps) {
  const [isLoading, setIsLoading] = useState(false);
   const userId= session?.user.id;

  const handleTake = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/view`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          newStatus: "COMMITTE_REVIEW",
          committeManagerID: userId 
         }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to take application.');
      }

      toast.success("Application successfully Procced to Final decision'.");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleTake} disabled={isLoading}>
      {isLoading ? "Updating..." : "Procced to final decision"}
    </Button>
  );
}
