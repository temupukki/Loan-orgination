export const formatDate = (dateString: string): string => {
  if (!dateString) return "Not provided";
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

export const formatCurrency = (amount: number): string => {
  if (amount === null || amount === undefined) return "Not provided";
  
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return "Invalid amount";
  }
};

export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "Not provided";
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if the phone number has exactly 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if it doesn't match expected format
  return phone;
};

export const formatPercentage = (value: number): string => {
  if (value === null || value === undefined) return "Not provided";
  
  try {
    return `${value.toFixed(2)}%`;
  } catch (error) {
    console.error("Error formatting percentage:", error);
    return "Invalid percentage";
  }
};

export const formatDocumentStatus = (url: string | undefined): string => {
  if (!url) return "❌ Not uploaded";
  return "✅ Uploaded";
};

export const formatCustomerStatus = (status: string): string => {
  if (!status) return "Unknown";
  
  const statusMap: { [key: string]: string } = {
    "active": "🟢 Active",
    "pending": "🟡 Pending",
    "inactive": "🔴 Inactive",
    "approved": "✅ Approved",
    "rejected": "❌ Rejected",
    "under_review": "🔍 Under Review"
  };
  
  return statusMap[status.toLowerCase()] || status;
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + "...";
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatLoanPeriod = (months: number): string => {
  if (!months) return "Not specified";
  
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    } else {
      return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
    }
  }
};

export const formatAddress = (customer: any): string => {
  if (!customer) return "Not provided";
  
  const addressParts = [
    customer.woreda,
    customer.subcity,
    customer.city,
    customer.zone,
    customer.region
  ].filter(part => part && part.trim() !== '');
  
  return addressParts.join(', ') || "Address not complete";
};

export const formatName = (firstName: string, middleName: string, lastName: string): string => {
  const nameParts = [firstName, middleName, lastName].filter(part => part && part.trim() !== '');
  return nameParts.join(' ') || "Name not provided";
};

export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) return "Not available";
  
  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return "Invalid date";
  }
};