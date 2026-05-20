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

export const exportInvoiceToPDF = (data: any) => {
  const { invoice, items, order, customer, sellerCompany } = data;
  const doc = new jsPDF();
  
  // Brand Header
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(184, 158, 102); // Brand Gold
  doc.text("TAYFA", 20, 20);

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(80, 80, 80);

  // Seller Info (Left side)
  doc.text(`${sellerCompany?.name || 'Tayfa Store'}`, 20, 30);
  doc.text(`Address: ${sellerCompany?.address || 'Pakistan'}`, 20, 35);
  doc.text(`Phone: ${sellerCompany?.phone || 'N/A'}`, 20, 40);
  doc.text(`Email: ${sellerCompany?.email || 'N/A'}`, 20, 45);
  doc.text(`Tax ID: ${sellerCompany?.taxId || 'N/A'}`, 20, 50);

  // Invoice Meta Info (Right side)
  doc.setFont(undefined, 'bold');
  doc.text("INVOICE DETAILS", 140, 20);
  doc.setFont(undefined, 'normal');
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 140, 30);
  doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}`, 140, 35);
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 140, 40);
  doc.text(`Order #: ${order?.orderNumber || order?.id || 'N/A'}`, 140, 45);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 140, 50);

  // Bill To / Client Info
  doc.setLineWidth(0.5);
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 58, 190, 58); // Horizontal Separator

  doc.setFont(undefined, 'bold');
  doc.text("BILL TO:", 20, 66);
  doc.setFont(undefined, 'normal');
  doc.text(`Customer: ${customer?.fullName || 'Valued Client'}`, 20, 72);
  doc.text(`Email: ${order?.customerEmail || customer?.email || 'N/A'}`, 20, 77);
  doc.text(`Phone: ${order?.shippingAddress?.phone || customer?.phone || 'N/A'}`, 20, 82);

  // Billing & Shipping Address
  const addressObj = order?.shippingAddress;
  const addressString = addressObj 
    ? `${addressObj.firstName || ''} ${addressObj.lastName || ''}, ${addressObj.addressLine1 || ''}, ${addressObj.city || ''}, ${addressObj.country || ''}`
    : 'No Address Provided';
  
  doc.text("Address:", 110, 72);
  const splitAddress = doc.splitTextToSize(addressString, 80);
  doc.text(splitAddress, 110, 77);

  // Items table
  const tableBody = (items || []).map((item: any) => [
    item.productName + (item.sku ? ` (${item.sku})` : ''),
    item.quantity.toString(),
    `PKR ${parseFloat(item.unitPrice).toFixed(2)}`,
    `PKR ${parseFloat(item.totalAmount).toFixed(2)}`
  ]);

  const subtotal = parseFloat(invoice.amount) - parseFloat(invoice.taxAmount);

  autoTable(doc, {
    startY: 95,
    head: [['Product Details', 'Qty', 'Unit Price', 'Total']],
    body: tableBody,
    foot: [
      ['', '', 'Subtotal:', `PKR ${subtotal.toFixed(2)}`],
      ['', '', 'Tax:', `PKR ${parseFloat(invoice.taxAmount).toFixed(2)}`],
      ['', '', 'Total Amount:', `PKR ${parseFloat(invoice.amount).toFixed(2)}`]
    ],
    theme: 'striped',
    headStyles: { fillColor: [184, 158, 102], textColor: [255, 255, 255] },
    footStyles: { fillColor: [248, 248, 248], textColor: [40, 40, 40], fontStyle: 'bold' }
  });

  // Save PDF file
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};

