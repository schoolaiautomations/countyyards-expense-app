import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ClientPayment } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Printer, X, CheckCircle2, Share2 } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: ClientPayment | null;
  projectName: string;
  clientName?: string;
  clientPhone?: string;
  location?: string;
  quotedAmount: number;
  totalCollected: number;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  projectName,
  clientName,
  clientPhone,
  location,
  quotedAmount,
  totalCollected,
}) => {
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen || !payment) return null;

  const balanceDue = Math.max(0, quotedAmount - totalCollected);
  const receiptNo = `CY-${payment.id.slice(-6).toUpperCase()}`;
  const clientDisplayName = clientName || 'Valued Client';
  const paymentDateFormatted = formatDate(payment.date);

  // Generate self-contained A4 HTML string that covers ~85% of an A4 page
  const getA4ReceiptHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt ${receiptNo} - Country Yards</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #1c1917;
      background: #ffffff;
      padding: 0;
      margin: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .a4-container {
      width: 100%;
      max-width: 190mm;
      min-height: 240mm; /* Covers ~85% of A4 page */
      margin: 0 auto;
      padding: 24px 28px;
      border: 2.5px solid #15803d;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #bbf7d0;
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand-section {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      border: 1px solid #e7e5e4;
      object-fit: cover;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      color: #15803d;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      line-height: 1.1;
    }
    .brand-subtitle {
      font-size: 13px;
      color: #78716c;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 4px;
    }
    .receipt-meta {
      text-align: right;
    }
    .official-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #dcfce7;
      color: #15803d;
      border: 1px solid #86efac;
      margin-bottom: 6px;
    }
    .receipt-number {
      font-size: 15px;
      font-weight: 800;
      color: #1c1917;
    }
    .receipt-date {
      font-size: 13px;
      color: #78716c;
      margin-top: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f5f5f4;
      padding: 16px 20px;
      border-radius: 12px;
      border: 1px solid #e7e5e4;
      margin-bottom: 22px;
    }
    .info-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #a8a29e;
      margin-bottom: 4px;
    }
    .info-name {
      font-size: 16px;
      font-weight: 800;
      color: #1c1917;
    }
    .info-sub {
      font-size: 13px;
      color: #78716c;
      margin-top: 3px;
    }
    .info-divider {
      border-left: 1px solid #d6d3d1;
      padding-left: 16px;
    }
    .particulars-box {
      border: 1.5px solid #e7e5e4;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 22px;
    }
    .particulars-header {
      background: #f5f5f4;
      padding: 12px 18px;
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #57534e;
      display: flex;
      justify-content: space-between;
    }
    .particulars-body {
      padding: 22px 20px;
      background: #f0fdf4;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .particulars-title {
      font-size: 16px;
      font-weight: 800;
      color: #1c1917;
    }
    .particulars-note {
      font-size: 13px;
      color: #78716c;
      font-style: italic;
      margin-top: 4px;
    }
    .amount-highlight {
      font-size: 28px;
      font-weight: 900;
      color: #166534;
      letter-spacing: -0.5px;
    }
    .financial-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 12px;
      margin-bottom: 26px;
    }
    .financial-card {
      background: #f5f5f4;
      padding: 14px 16px;
      border-radius: 10px;
      border: 1px solid #e7e5e4;
      text-align: center;
    }
    .financial-card-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #78716c;
      margin-bottom: 4px;
    }
    .financial-card-val {
      font-size: 17px;
      font-weight: 800;
      color: #1c1917;
    }
    .val-paid { color: #15803d; }
    .val-balance { color: #b45309; }
    .footer-section {
      border-top: 1.5px dashed #d6d3d1;
      padding-top: 18px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .footer-note {
      font-size: 12px;
      color: #a8a29e;
      font-style: italic;
      line-height: 1.5;
    }
    .signature-box {
      border: 2px dashed #86efac;
      background: #f0fdf4;
      padding: 12px 24px;
      border-radius: 10px;
      text-align: center;
    }
    .signature-brand {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #15803d;
    }
    .signature-title {
      font-size: 12px;
      font-weight: 800;
      color: #44403c;
      margin-top: 3px;
    }
  </style>
</head>
<body>
  <div class="a4-container">
    <div>
      <!-- Header -->
      <div class="header-row">
        <div class="brand-section">
          <img class="brand-logo" src="/cy_logo.jpg" alt="Logo" onerror="this.style.display='none'">
          <div>
            <div class="brand-title">Country Yards</div>
            <div class="brand-subtitle">Landscaping & Garden Design</div>
          </div>
        </div>
        <div class="receipt-meta">
          <span class="official-badge">Official Receipt</span>
          <div class="receipt-number">Receipt #${receiptNo}</div>
          <div class="receipt-date">Date: ${paymentDateFormatted}</div>
        </div>
      </div>

      <!-- Client & Project Details -->
      <div class="info-grid">
        <div>
          <div class="info-label">Received From</div>
          <div class="info-name">${clientDisplayName}</div>
          ${clientPhone ? `<div class="info-sub">${clientPhone}</div>` : ''}
          ${location ? `<div class="info-sub">${location}</div>` : ''}
        </div>
        <div class="info-divider">
          <div class="info-label">Project Name</div>
          <div class="info-name">${projectName}</div>
          <div class="info-sub">Payment Mode: <strong>${payment.payment_method || 'UPI / Transfer'}</strong></div>
        </div>
      </div>

      <!-- Payment Particulars -->
      <div class="particulars-box">
        <div class="particulars-header">
          <span>Particulars</span>
          <span>Amount Received</span>
        </div>
        <div class="particulars-body">
          <div>
            <div class="particulars-title">Client Milestone Payment</div>
            ${payment.notes ? `<div class="particulars-note">Note: ${payment.notes}</div>` : ''}
          </div>
          <div class="amount-highlight">${formatCurrency(payment.amount)}</div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <div class="footer-note">
        <p>Thank you for choosing Country Yards!</p>
        <p style="margin-top: 3px;">This is a computer generated official payment receipt.</p>
      </div>
      <div class="signature-box">
        <div class="signature-brand">Country Yards</div>
        <div class="signature-title">Authorized Signatory</div>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  // 1. Mobile-friendly Print / PDF Spooler (uses iframe isolation for reliable printing on Android & iOS)
  const handlePrint = () => {
    setIsPrinting(true);
    try {
      // Create hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(getA4ReceiptHTML());
        iframeDoc.close();

        // Wait for image/DOM to paint then print
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            console.warn('Iframe print failed, falling back to window.print', err);
            window.print();
          } finally {
            setIsPrinting(false);
            setTimeout(() => {
              document.body.removeChild(iframe);
            }, 30000);
          }
        }, 350);
      } else {
        // Fallback
        window.print();
        setIsPrinting(false);
      }
    } catch (e) {
      console.error('Print trigger exception:', e);
      window.print();
      setIsPrinting(false);
    }
  };

  // 2. Mobile Download / Share option (guaranteed to work on all phones)
  const handleDownloadOrShare = async () => {
    const htmlContent = getA4ReceiptHTML();
    const fileName = `Receipt-${receiptNo}.html`;

    // Try native Web Share API on mobile
    if (navigator.share) {
      try {
        const file = new File([htmlContent], fileName, { type: 'text/html' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Country Yards Receipt #${receiptNo}`,
            text: `Payment Receipt #${receiptNo} for ${projectName} - Amount: ${formatCurrency(payment.amount)}`,
            files: [file],
          });
          return;
        } else {
          await navigator.share({
            title: `Country Yards Receipt #${receiptNo}`,
            text: `Payment Receipt #${receiptNo} for ${projectName} - Amount: ${formatCurrency(payment.amount)}, Balance Due: ${formatCurrency(balanceDue)}`,
          });
          return;
        }
      } catch (err) {
        console.log('Share dismissed or failed, falling back to download', err);
      }
    }

    // Direct download file fallback
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto print-receipt-portal animate-in fade-in">
      {/* Outer Modal Container */}
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto print-receipt-card">
        {/* Screen Header (Hidden on Print) */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-yard-green text-white print:hidden">
          <div className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <h3 className="text-xs font-bold tracking-tight">Payment Receipt Preview</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CONTENT - Styled for preview & print */}
        <div id="printable-receipt" className="p-5 bg-white text-stone-900">
          {/* Receipt Top Header */}
          <div className="flex items-center justify-between border-b-2 border-yard-green/30 pb-3 mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-stone-200 shadow-xs overflow-hidden flex items-center justify-center">
                <img
                  src="/cy_logo.jpg"
                  alt="Country Yards Logo"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div>
                <h1 className="text-base font-black text-yard-green tracking-tight leading-tight uppercase">
                  Country Yards
                </h1>
                <p className="text-[10px] text-stone-500 font-semibold tracking-wide uppercase">
                  Landscaping & Garden Design
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yard-mint text-yard-green border border-yard-accent/30 mb-0.5">
                Official Receipt
              </span>
              <div className="text-xs font-bold text-stone-900">
                Receipt #{receiptNo}
              </div>
              <div className="text-[10px] text-stone-500">
                Date: {paymentDateFormatted}
              </div>
            </div>
          </div>

          {/* Project & Client Details */}
          <div className="grid grid-cols-2 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200/80 mb-3 text-xs">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 block mb-0.5">
                Received From
              </span>
              <div className="font-bold text-stone-900 text-sm">
                {clientDisplayName}
              </div>
              {clientPhone && <div className="text-stone-500 text-[11px] mt-0.5">{clientPhone}</div>}
              {location && <div className="text-stone-500 text-[11px] mt-0.5">{location}</div>}
            </div>

            <div className="border-l border-stone-200/80 pl-2.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-stone-400 block mb-0.5">
                Project Name
              </span>
              <div className="font-bold text-stone-900 text-sm">
                {projectName}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                Mode: <strong className="text-stone-700">{payment.payment_method || 'UPI / Transfer'}</strong>
              </div>
            </div>
          </div>

          {/* Payment Particulars Box */}
          <div className="border border-stone-200 rounded-xl overflow-hidden mb-3">
            <div className="bg-stone-100 px-3 py-1.5 text-[10px] font-bold text-stone-600 uppercase tracking-wider flex justify-between">
              <span>Particulars</span>
              <span>Amount Received</span>
            </div>
            <div className="p-3.5 flex justify-between items-center bg-emerald-50/30">
              <div>
                <p className="text-sm font-bold text-stone-900">
                  Client Milestone Payment
                </p>
                {payment.notes && (
                  <p className="text-[11px] text-stone-500 mt-0.5 italic">
                    Note: {payment.notes}
                  </p>
                )}
              </div>
              <div className="text-lg sm:text-xl font-black text-emerald-800">
                {formatCurrency(payment.amount)}
              </div>
            </div>
          </div>

          {/* Footer & Signature Stamp */}
          <div className="pt-2 border-t border-dashed border-stone-300 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-stone-400 italic">
                Thank you for choosing Country Yards!
              </p>
              <p className="text-[9px] text-stone-400 mt-0.5">
                This is a computer generated receipt.
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block border-2 border-dashed border-yard-green/40 rounded-lg px-3 py-1.5 text-center bg-yard-mint/20">
                <span className="text-[9px] font-black uppercase tracking-wider text-yard-green block">
                  Country Yards
                </span>
                <span className="text-[10px] font-bold text-stone-700 block mt-0.5">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Hidden on Print) */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-2.5 rounded-lg border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors text-center"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleDownloadOrShare}
            className="py-2 px-3 rounded-lg border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs flex items-center justify-center space-x-1 transition-all"
            title="Download or share receipt"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share / Save</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={isPrinting}
            className="flex-1 py-2 px-3 rounded-lg bg-yard-green hover:bg-yard-dark text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 active:scale-98 transition-all disabled:opacity-50"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isPrinting ? 'Opening...' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
