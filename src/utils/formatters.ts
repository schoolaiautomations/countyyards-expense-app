// Currency and Date formatting utilities for Country Yards

export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatFileSize = (kb?: number): string => {
  if (!kb) return '0 KB';
  if (kb > 1024) {
    return (kb / 1024).toFixed(1) + ' MB';
  }
  return Math.round(kb) + ' KB';
};
