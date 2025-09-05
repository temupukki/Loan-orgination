'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SaveReviewButtonProps {
  customerId: string;
  refNumber?: string;
  reviewData?: Record<string, any>;
  validateData?: (refNumber: string) => string[];
  onSuccess: () => void;
  buttonText?: string;
  newStatus?: string;
}

export function SaveReviewButton({
  customerId,
  refNumber,
  reviewData,
  validateData,
  onSuccess,
  buttonText,
  newStatus
}: SaveReviewButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Internal validation function (fallback if validateData is not provided)
  const validateSupervisorData = (refNumber: string) => {
    const errors: string[] = [];
    const review = reviewData?.[refNumber];

    // Check all required fields with correct field names (matching the main component)
    if (review?.pestelanalysisScore === undefined || review.pestelanalysisScore === null) {
      errors.push("PESTEL Analysis score is required");
    } else if (review.pestelanalysisScore < 0 || review.pestelanalysisScore > 100) {
      errors.push("PESTEL Analysis score must be between 0 and 100");
    }
    
    if (review?.swotanalysisScore === undefined || review.swotanalysisScore === null) {
      errors.push("SWOT Analysis score is required");
    } else if (review.swotanalysisScore < 0 || review.swotanalysisScore > 100) {
      errors.push("SWOT Analysis score must be between 0 and 100");
    }
    
    if (review?.riskassesmentScore === undefined || review.riskassesmentScore === null) {
      errors.push("Risk Assessment score is required");
    } else if (review.riskassesmentScore < 0 || review.riskassesmentScore > 100) {
      errors.push("Risk Assessment score must be between 0 and 100");
    }
    
    if (review?.esgassesmentScore === undefined || review.esgassesmentScore === null) {
      errors.push("ESG Assessment score is required");
    } else if (review.esgassesmentScore < 0 || review.esgassesmentScore > 100) {
      errors.push("ESG Assessment score must be between 0 and 100");
    }
    
    if (review?.financialneedScore === undefined || review.financialneedScore === null) {
      errors.push("Financial Need score is required");
    } else if (review.financialneedScore < 0 || review.financialneedScore > 100) {
      errors.push("Financial Need score must be between 0 and 100");
    }
    
    if (!review?.reviewNotes || review.reviewNotes.trim() === "") {
      errors.push("Review Notes are required");
    }

    return errors;
  };

  const handleSaveReview = async () => {
    if (!refNumber) {
      toast.error("Missing reference number.");
      return;
    }

    if (!reviewData || !reviewData[refNumber]) {
      toast.error("No review data found for this reference number.");
      return;
    }

    // ✅ Run validation (use provided validateData function or fallback to internal)
    const errors = validateData ? validateData(refNumber) : validateSupervisorData(refNumber);
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    const analysisPayload = reviewData[refNumber];
    setIsLoading(true);

    try {
      // 1️⃣ Save the review/analysis data
      const saveResponse = await fetch('/api/save-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationReferenceNumber: refNumber,
          ...analysisPayload,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save review data.');
      }

      // 2️⃣ Update status (default SUPERVISED if newStatus not passed)
      const statusResponse = await fetch(`/api/customer/${customerId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStatus: newStatus || "SUPERVISED" }),
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.error || 'Failed to update application status.');
      }

      toast.success("Review saved and status updated!");
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleSaveReview} disabled={isLoading}>
      {isLoading ? "Saving..." : buttonText || "Save Review"}
    </Button>
  );
}