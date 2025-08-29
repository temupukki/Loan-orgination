// components/TakeButton.tsx
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Changed from Input to Textarea
import { toast } from 'sonner';

interface AnswerButtonProps {
  customerId: string;
  onSuccess: () => void;
}

export function AnswerButton({ customerId, onSuccess }: AnswerButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState('');

  const handleTake = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment before taking the application.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/customer/${customerId}/answer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
        newStatus: "UNDER_REVIEW",
        rmRecommendation : comment.trim()
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to Answer application.');
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
    <div className="flex flex-col gap-2 w-full">
      <Textarea
        placeholder="Enter your answer here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isLoading}
        className="min-h-[80px]"
      />
      <Button onClick={handleTake} disabled={isLoading || !comment.trim()}>
        {isLoading ? "Updating..." : "Submit Answer"}
      </Button>
    </div>
  );
}