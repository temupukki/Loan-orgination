/**
 * Utility functions for date handling and validation
 */

/**
 * Checks if a date string is valid
 * @param dateString - The date string to validate
 * @returns boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string | undefined | null): boolean => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * Safely parses a date string, returning undefined for invalid dates
 * @param dateString - The date string to parse
 * @returns Date object or undefined if invalid
 */
export const parseDateSafe = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString || typeof dateString !== 'string') return undefined;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  } catch {
    return undefined;
  }
};

/**
 * Formats a date for HTML date input fields (YYYY-MM-DD)
 * @param date - Date object or date string
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateForInput = (date: Date | string | undefined | null): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
};

/**
 * Formats a date for display (e.g., "January 1, 2023")
 * @param date - Date object or date string
 * @returns Formatted date string or "Invalid date" if invalid
 */
export const formatDateForDisplay = (date: Date | string | undefined | null): string => {
  if (!date) return 'Not provided';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Invalid date';
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Checks if a date is in the future
 * @param dateString - The date string to check
 * @returns boolean indicating if the date is in the future
 */
export const isFutureDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * Checks if a date is in the past
 * @param dateString - The date string to check
 * @returns boolean indicating if the date is in the past
 */
export const isPastDate = (dateString: string): boolean => {
  if (!isValidDate(dateString)) return false;
  
  const date = new Date(dateString);
  return date < new Date();
};

/**
 * Calculates age from birth date
 * @param dateString - Birth date string
 * @returns Age in years or null if invalid
 */
export const getAgeFromDate = (dateString: string): number | null => {
  if (!isValidDate(dateString)) return null;
  
  const birthDate = new Date(dateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Validates if a person is at least a certain age
 * @param dateString - Birth date string
 * @param minAge - Minimum required age
 * @returns boolean indicating if the person is at least minAge years old
 */
export const isAtLeastAge = (dateString: string, minAge: number): boolean => {
  const age = getAgeFromDate(dateString);
  return age !== null && age >= minAge;
};

/**
 * Gets the minimum date allowed for date inputs (e.g., 18 years ago for adult)
 * @param yearsAgo - Number of years ago
 * @returns Date string in YYYY-MM-DD format
 */
export const getMinDate = (yearsAgo: number = 18): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - yearsAgo);
  return formatDateForInput(date);
};

/**
 * Gets the maximum date allowed for date inputs (e.g., today for birth date)
 * @returns Date string in YYYY-MM-DD format
 */
export const getMaxDate = (): string => {
  return formatDateForInput(new Date());
};

/**
 * Calculates the difference between two dates in days
 * @param startDate - Start date string
 * @param endDate - End date string (defaults to today)
 * @returns Number of days or null if invalid dates
 */
export const getDaysDifference = (
  startDate: string, 
  endDate: string = new Date().toISOString()
): number | null => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Adds days to a date
 * @param dateString - Original date string
 * @param days - Number of days to add
 * @returns New date or null if invalid
 */
export const addDays = (dateString: string, days: number): Date | null => {
  if (!isValidDate(dateString)) return null;
  
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Validates date range (start date before end date)
 * @param startDate - Start date string
 * @param endDate - End date string
 * @returns boolean indicating if start date is before end date
 */
export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start < end;
};