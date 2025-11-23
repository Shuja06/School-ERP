import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Eye, Receipt, TrendingUp, CreditCard, Trash2 } from "lucide-react"; // Added Trash2
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useFeePayments, useCreateFeePayment, useDeleteFeePayment } from "@/hooks/useFeePayments";
import { useStudents } from "@/hooks/useStudents";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

// Define TypeScript Interface to prevent "Property does not exist" errors
interface Payment {
  id: string;
  student_id: string;
  amount: string | number;
  fee_type: string;
  payment_method: string;
  receipt_number: string;
  academic_year: string;
  payment_date?: string;
  created_at: string;
  class?: string;
  students?: {
    full_name: string;
    class: string;
    section: string;
  };
}

const Billing = () => {
  // Cast data to Payment[] to ensure type safety
  const { data: rawPayments, isLoading } = useFeePayments();
  const payments = (rawPayments || []) as Payment[]; 
  
  const { data: students = [] } = useStudents();
  const createPayment = useCreateFeePayment();
  const deletePayment = useDeleteFeePayment();

  const [open, setOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  
  // Typed state for selected payment
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [exportFilters, setExportFilters] = useState({
    startDate: "",
    endDate: "",
    class: "",
    paymentMethod: "",
    feeType: ""
  });
  
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    fee_type: "",
    payment_method: "Cash",
    receipt_number: "",
    academic_year: "2024-2025"
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPayments = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const uniqueMethods = new Set(payments.map(p => p.payment_method).filter(Boolean)).size;
    const thisMonth = payments.filter(p => {
      const dateStr = p.payment_date || p.created_at;
      if (!dateStr) return false;
      const paymentDate = new Date(dateStr);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalPayments,
      totalAmount,
      uniqueMethods,
      thisMonth
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const studentName = payment.students?.full_name?.toLowerCase() || '';
    const receiptNum = payment.receipt_number?.toLowerCase() || '';
    const feeType = payment.fee_type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return studentName.includes(search) || 
           receiptNum.includes(search) || 
           feeType.includes(search);
  });

  const resetForm = () => {
    setFormData({
      student_id: "",
      amount: "",
      fee_type: "",
      payment_method: "Cash",
      receipt_number: "",
      academic_year: "2024-2025"
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const selectedStudent = students.find(s => s.id === formData.student_id);
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        class: selectedStudent?.class || ''
      };

      await createPayment.mutateAsync(payload);
      setOpen(false);
      resetForm();
    } catch (error: any) {
      console.error("Failed to create payment:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment record?")) return;
    await deletePayment.mutateAsync(id);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    const doc = new jsPDF();
    
    // School Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SCHOOL ERP SYSTEM", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("123 Education Street, Knowledge City", 105, 28, { align: "center" });
    doc.text("Phone: +91 1234567890 | Email: info@school.com", 105, 34, { align: "center" });
    
    // Line separator
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Receipt Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("FEE RECEIPT", 105, 50, { align: "center" });
    
    // Receipt Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const startY = 65;
    const lineHeight = 8;
    const dateStr = payment.payment_date || payment.created_at || new Date().toISOString();
    
    // Left Column
    doc.setFont("helvetica", "bold");
    doc.text("Receipt No:", 20, startY);
    doc.setFont("helvetica", "normal");
    doc.text(payment.receipt_number || '-', 60, startY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Date:", 20, startY + lineHeight);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(dateStr).toLocaleDateString(), 60, startY + lineHeight);
    
    doc.setFont("helvetica", "bold");
    doc.text("Academic Year:", 20, startY + lineHeight * 2);
    doc.setFont("helvetica", "normal");
    doc.text(payment.academic_year || '-', 60, startY + lineHeight * 2);
    
    // Right Column
    doc.setFont("helvetica", "bold");
    doc.text("Student Name:", 110, startY);
    doc.setFont("helvetica", "normal");
    doc.text(payment.students?.full_name || 'N/A', 150, startY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Class:", 110, startY + lineHeight);
    doc.setFont("helvetica", "normal");
    doc.text(payment.class || payment.students?.class || '-', 150, startY + lineHeight);
    
    doc.setFont("helvetica", "bold");
    doc.text("Section:", 110, startY + lineHeight * 2);
    doc.setFont("helvetica", "normal");
    doc.text(payment.students?.section || '-', 150, startY + lineHeight * 2);
    
    // Payment Details Table
    const tableStartY = startY + lineHeight * 4;
    
    // Table Header
    doc.setFillColor(59, 130, 246);
    doc.rect(20, tableStartY, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, tableStartY + 7);
    doc.text("Amount", 160, tableStartY + 7);
    
    // Table Content
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const contentY = tableStartY + 17;
    doc.text(payment.fee_type, 25, contentY);
    doc.text(`₹${Number(payment.amount).toLocaleString()}`, 160, contentY);
    
    // Total
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount:", 120, contentY + 15);
    doc.text(`₹${Number(payment.amount).toLocaleString()}`, 160, contentY + 15);
    
    // Payment Method
    const paymentInfoY = contentY + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method:", 20, paymentInfoY);
    doc.setFont("helvetica", "normal");
    doc.text(payment.payment_method, 60, paymentInfoY);
    
    // Status Badge
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20, paymentInfoY + 10, 30, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("PAID", 35, paymentInfoY + 15.5, { align: "center" });
    
    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer generated receipt. No signature required.", 105, 270, { align: "center" });
    doc.text("Thank you for your payment!", 105, 280, { align: "center" });
    
    // Save PDF
    const fileName = `Receipt_${payment.receipt_number}_${payment.students?.full_name || 'Student'}.pdf`;
    doc.save(fileName);
  };

  const handleViewReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptOpen(true);
  };

  const handleExportReport = () => {
    // Filter payments based on selected criteria
    let filteredData = [...payments];

    if (exportFilters.startDate) {
      filteredData = filteredData.filter(p => {
        const paymentDate = new Date(p.payment_date || p.created_at);
        return paymentDate >= new Date(exportFilters.startDate);
      });
    }

    if (exportFilters.endDate) {
      filteredData = filteredData.filter(p => {
        const paymentDate = new Date(p.payment_date || p.created_at);
        return paymentDate <= new Date(exportFilters.endDate);
      });
    }

    if (exportFilters.class) {
      filteredData = filteredData.filter(p => 
        (p.class || p.students?.class) === exportFilters.class
      );
    }

    if (exportFilters.paymentMethod) {
      filteredData = filteredData.filter(p => 
        p.payment_method === exportFilters.paymentMethod
      );
    }

    if (exportFilters.feeType) {
      filteredData = filteredData.filter(p => 
        p.fee_type.toLowerCase().includes(exportFilters.feeType.toLowerCase())
      );
    }

    // Prepare data for export
    const exportData = filteredData.map(payment => ({
      'Receipt Number': payment.receipt_number,
      'Date': new Date(payment.payment_date || payment.created_at).toLocaleDateString(),
      'Student Name': payment.students?.full_name || 'N/A',
      'Class': payment.class || payment.students?.class || '-',
      'Section': payment.students?.section || '-',
      'Fee Type': payment.fee_type,
      'Amount': Number(payment.amount),
      'Payment Method': payment.payment_method,
      'Academic Year': payment.academic_year,
      'Status': 'Paid'
    }));

    // Calculate summary statistics
    const totalAmount = filteredData.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const avgAmount = filteredData.length > 0 ? totalAmount / filteredData.length : 0;
    
    // Payment method breakdown
    const methodBreakdown = filteredData.reduce((acc, p) => {
      acc[p.payment_method] = (acc[p.payment_method] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Fee type breakdown
    const feeTypeBreakdown = filteredData.reduce((acc, p) => {
      acc[p.fee_type] = (acc[p.fee_type] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Class breakdown
    const classBreakdown = filteredData.reduce((acc, p) => {
      const className = p.class || p.students?.class || 'Unknown';
      acc[className] = (acc[className] || 0) + Number(p.amount);
      return acc;
    }, {} as Record<string, number>);

    // Create summary data
    const summaryData = [
      { 'Metric': 'Total Payments', 'Value': filteredData.length },
      { 'Metric': 'Total Amount Collected', 'Value': `₹${totalAmount.toLocaleString()}` },
      { 'Metric': 'Average Payment', 'Value': `₹${avgAmount.toFixed(2)}` },
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Payment Method Breakdown', 'Value': '' },
      ...Object.entries(methodBreakdown).map(([method, amount]) => ({
        'Metric': `  ${method}`,
        'Value': `₹${amount.toLocaleString()}`
      })),
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Fee Type Breakdown', 'Value': '' },
      ...Object.entries(feeTypeBreakdown).map(([type, amount]) => ({
        'Metric': `  ${type}`,
        'Value': `₹${amount.toLocaleString()}`
      })),
      { 'Metric': '', 'Value': '' },
      { 'Metric': 'Class-wise Breakdown', 'Value': '' },
      ...Object.entries(classBreakdown).map(([className, amount]) => ({
        'Metric': `  Class ${className}`,
        'Value': `₹${amount.toLocaleString()}`
      }))
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Add payments sheet
    const ws1 = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws1, "Payment Records");

    // Add summary sheet
    const ws2 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws2, "Summary");

    // Generate filename
    const dateRange = exportFilters.startDate && exportFilters.endDate
      ? `_${new Date(exportFilters.startDate).toLocaleDateString().replace(/\//g, '-')}_to_${new Date(exportFilters.endDate).toLocaleDateString().replace(/\//g, '-')}`
      : `_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    
    const filename = `Payment_Report${dateRange}.xlsx`;

    // Download file
    XLSX.writeFile(wb, filename);

    // Close dialog and reset filters
    setExportOpen(false);
    setExportFilters({
      startDate: "",
      endDate: "",
      class: "",
      paymentMethod: "",
      feeType: ""
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Billing & Payments</h1>
            <p className="text-muted-foreground">Record and manage student fee payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">Total Payments</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{stats.totalPayments}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.thisMonth}</div>
              <p className="text-xs text-muted-foreground">Payments received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">Total Amount</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">₹{stats.totalAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-md font-medium">Payment Methods</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">{stats.uniqueMethods}</div>
              <p className="text-xs text-muted-foreground">Methods used</p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Records</CardTitle>
                <CardDescription>View and manage all fee payments</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  className="pl-9 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt No.</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.receipt_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.students?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.class || payment.students?.class || '-'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.class || payment.students?.class || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.fee_type}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">₹{Number(payment.amount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{payment.payment_method}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(payment.payment_date || payment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Paid
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="View Receipt"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Download Receipt"
                            onClick={() => handleDownloadReceipt(payment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {/* ADDED: Delete Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Delete Payment"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No payment records found. {searchTerm && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add Payment Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Enter the payment details below</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student *</Label>
              <Select 
                value={formData.student_id} 
                onValueChange={(value) => setFormData({ ...formData, student_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.full_name} - Class {student.class}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fee_type">Fee Type *</Label>
              <Input
                id="fee_type"
                value={formData.fee_type}
                onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
                placeholder="e.g., Tuition, Transport, Activities"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select 
                value={formData.payment_method} 
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Net Banking">Net Banking</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receipt_number">Receipt Number *</Label>
              <Input
                id="receipt_number"
                value={formData.receipt_number}
                onChange={(e) => setFormData({ ...formData, receipt_number: e.target.value })}
                placeholder="e.g., RCP-2024-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year *</Label>
              <Input
                id="academic_year"
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                placeholder="e.g., 2024-2025"
                required
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending ? 'Recording...' : 'Record Payment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fee Receipt</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-6 p-6 border rounded-lg bg-white" id="receipt-content">
              {/* School Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-primary">SCHOOL ERP SYSTEM</h2>
                <p className="text-sm text-muted-foreground">123 Education Street, Knowledge City</p>
                <p className="text-sm text-muted-foreground">Phone: +91 1234567890 | Email: info@school.com</p>
              </div>

              {/* Receipt Title */}
              <div className="text-center">
                <h3 className="text-xl font-bold">FEE RECEIPT</h3>
              </div>

              {/* Receipt Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Receipt No:</span>
                    <span>{selectedPayment.receipt_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Date:</span>
                    <span>{new Date(selectedPayment.payment_date || selectedPayment.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Academic Year:</span>
                    <span>{selectedPayment.academic_year}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Student Name:</span>
                    <span>{selectedPayment.students?.full_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Class:</span>
                    <span>{selectedPayment.class || selectedPayment.students?.class || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Section:</span>
                    <span>{selectedPayment.students?.section || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Payment Details Table */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-primary text-white">
                    <tr>
                      <th className="text-left p-3">Description</th>
                      <th className="text-right p-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-3">{selectedPayment.fee_type}</td>
                      <td className="text-right p-3 font-semibold">₹{Number(selectedPayment.amount).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-muted">
                      <td className="p-3 font-bold">Total Amount</td>
                      <td className="text-right p-3 font-bold text-lg">₹{Number(selectedPayment.amount).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Method & Status */}
              <div className="flex justify-between items-center pt-4">
                <div>
                  <span className="font-semibold">Payment Method: </span>
                  <Badge variant="secondary" className="ml-2">{selectedPayment.payment_method}</Badge>
                </div>
                <Badge className="bg-green-500 hover:bg-green-500 text-white px-4 py-1">PAID</Badge>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p className="italic">This is a computer generated receipt. No signature required.</p>
                <p className="font-semibold mt-2">Thank you for your payment!</p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => handleDownloadReceipt(selectedPayment)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Payment Report</DialogTitle>
            <DialogDescription>Select filters to customize your report</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={exportFilters.startDate}
                  onChange={(e) => setExportFilters({ ...exportFilters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={exportFilters.endDate}
                  onChange={(e) => setExportFilters({ ...exportFilters, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterClass">Class (Optional)</Label>
              <Select
                value={exportFilters.class}
                onValueChange={(value) => setExportFilters({ ...exportFilters, class: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {[...new Set(payments.map(p => p.class || p.students?.class).filter(Boolean))].map((className) => (
                    <SelectItem key={String(className)} value={String(className)}>
                      Class {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterMethod">Payment Method (Optional)</Label>
              <Select
                value={exportFilters.paymentMethod}
                onValueChange={(value) => setExportFilters({ ...exportFilters, paymentMethod: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {[...new Set(payments.map(p => p.payment_method).filter(Boolean))].map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterFeeType">Fee Type (Optional)</Label>
              <Input
                id="filterFeeType"
                placeholder="e.g., Tuition, Transport"
                value={exportFilters.feeType}
                onChange={(e) => setExportFilters({ ...exportFilters, feeType: e.target.value })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Leave filters blank to export all payment records. The report will include:
              </p>
              <ul className="text-xs text-blue-700 mt-2 ml-4 list-disc">
                <li>Payment records sheet</li>
                <li>Summary statistics sheet</li>
                <li>Breakdowns by method, fee type, and class</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setExportOpen(false);
                  setExportFilters({
                    startDate: "",
                    endDate: "",
                    class: "",
                    paymentMethod: "",
                    feeType: ""
                  });
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleExportReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Billing;