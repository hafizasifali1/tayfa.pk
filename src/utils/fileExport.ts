import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';

export const exportInvoicesToExcel = (invoices: Invoice[]) => {
  const data = invoices.map(inv => ({
    'Invoice #': inv.invoiceNumber || inv.id,
    'Date': inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A',
    'Order ID': inv.orderId,
    'Customer': inv.customerName || 'N/A',
    'Amount': inv.amount,
    'Status': inv.status
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices");
  XLSX.writeFile(wb, `Tayfa_Invoices_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportInvoiceToPDF = (inv: Invoice) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.text(`Invoice Number: ${inv.invoiceNumber || inv.id}`, 20, 40);
  doc.text(`Date: ${inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A'}`, 20, 45);
  doc.text(`Order ID: ${inv.orderId}`, 20, 50);
  doc.text(`Status: ${inv.status.toUpperCase()}`, 20, 55);

  // Customer info
  doc.text("Bill To:", 20, 70);
  doc.setFont(undefined, 'bold');
  doc.text(`${inv.customerName || 'Customer'}`, 20, 75);
  doc.setFont(undefined, 'normal');
  doc.text(`${inv.customerEmail || ''}`, 20, 80);

  // Table
  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Amount']],
    body: [
      [`Order ${inv.orderId} - Sales Items`, inv.amount - inv.taxAmount],
      ['Tax', inv.taxAmount],
    ],
    foot: [['Total', inv.amount]],
    theme: 'grid',
    headStyles: { fillColor: [184, 158, 102] } // Brand Gold
  });

  doc.save(`Invoice_${inv.invoiceNumber || inv.id}.pdf`);
};
