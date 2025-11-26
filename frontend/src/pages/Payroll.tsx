import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Download, Edit, Trash2, Users, DollarSign, CheckCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePayroll, useCreatePayroll, useUpdatePayroll, useDeletePayroll, useProcessBulkPayroll } from "@/hooks/usePayroll";
import { useStaff } from "@/hooks/useStaff";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const Payroll = () => {
  const { data: payroll = [], isLoading: payrollLoading } = usePayroll();
  const { data: staff = [], isLoading: staffLoading } = useStaff();
  const createPayroll = useCreatePayroll();
  const updatePayroll = useUpdatePayroll();
  const deletePayroll = useDeletePayroll();
  const processBulkPayroll = useProcessBulkPayroll();
  
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bulkMonth, setBulkMonth] = useState("");
  
  const [formData, setFormData] = useState({
    staff_id: "",
    month: "",
    basic_salary: "",
    allowances: "",
    deductions: "",
    payment_status: "pending",
    payment_date: "",
    payment_method: "",
    notes: ""
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalPayroll = payroll.reduce((sum, p) => sum + Number(p.net_salary || 0), 0);
    const processed = payroll.filter(p => p.payment_status === 'paid').length;
    const pending = payroll.filter(p => p.payment_status === 'pending').length;
    const totalStaff = staff.length;

    return {
      totalStaff,
      totalPayroll,
      processed,
      pending
    };
  }, [payroll, staff]);

  // Filter payroll
  const filteredPayroll = payroll.filter(entry => {
    const staffName = entry.staff?.full_name?.toLowerCase() || '';
    const designation = entry.staff?.designation?.toLowerCase() || '';
    const month = entry.month?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return staffName.includes(search) || 
           designation.includes(search) || 
           month.includes(search);
  });

  const resetForm = () => {
    setFormData({
      staff_id: "",
      month: "",
      basic_salary: "",
      allowances: "",
      deductions: "",
      payment_status: "pending",
      payment_date: "",
      payment_method: "",
      notes: ""
    });
    setEditingPayroll(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances || "0"),
        deductions: parseFloat(formData.deductions || "0")
      };

      if (editingPayroll) {
        await updatePayroll.mutateAsync({ id: editingPayroll.id, updates: payload });
      } else {
        await createPayroll.mutateAsync(payload);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      // Error already handled in mutation
    }
  };

  const handleEdit = (entry: any) => {
    setEditingPayroll(entry);
    setFormData({
      staff_id: entry.staff_id,
      month: entry.month,
      basic_salary: entry.basic_salary.toString(),
      allowances: entry.allowances?.toString() || "0",
      deductions: entry.deductions?.toString() || "0",
      payment_status: entry.payment_status,
      payment_date: entry.payment_date ? new Date(entry.payment_date).toISOString().split('T')[0] : "",
      payment_method: entry.payment_method || "",
      notes: entry.notes || ""
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payroll record?")) return;
    await deletePayroll.mutateAsync(id);
  };

  const handleBulkProcess = async () => {
    if (!bulkMonth) {
      alert("Please select a month");
      return;
    }
    
    await processBulkPayroll.mutateAsync(bulkMonth);
    setBulkOpen(false);
    setBulkMonth("");
  };

  const handleDownloadSlip = (entry: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("SALARY SLIP", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("IDEAL SCHOOL KUMTA", 105, 28, { align: "center" });
    doc.text("123 Knowledge Park, Education District, Main Highway", 105, 34, { align: "center" });
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Month
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Month: ${entry.month}`, 20, 50);
    
    // Employee Details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const startY = 60;
    const lineHeight = 8;
    
    doc.setFont("helvetica", "bold");
    doc.text("Employee Name:", 20, startY);
    doc.setFont("helvetica", "normal");
    doc.text(entry.staff?.full_name || 'N/A', 70, startY);
    
    doc.setFont("helvetica", "bold");
    doc.text("Designation:", 20, startY + lineHeight);
    doc.setFont("helvetica", "normal");
    doc.text(entry.staff?.designation || '-', 70, startY + lineHeight);
    
    doc.setFont("helvetica", "bold");
    doc.text("Department:", 20, startY + lineHeight * 2);
    doc.setFont("helvetica", "normal");
    doc.text(entry.staff?.department || '-', 70, startY + lineHeight * 2);
    
    // Salary Breakdown
    const tableY = startY + lineHeight * 4;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(20, tableY, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Description", 25, tableY + 7);
    doc.text("Amount", 160, tableY + 7);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    let currentY = tableY + 17;
    doc.text("Basic Salary", 25, currentY);
    doc.text(`₹${Number(entry.basic_salary).toLocaleString()}`, 160, currentY);
    
    currentY += lineHeight;
    doc.text("Allowances", 25, currentY);
    doc.text(`₹${Number(entry.allowances || 0).toLocaleString()}`, 160, currentY);
    
    currentY += lineHeight;
    doc.setTextColor(220, 38, 38);
    doc.text("Deductions", 25, currentY);
    doc.text(`-₹${Number(entry.deductions || 0).toLocaleString()}`, 160, currentY);
    
    // Net Salary
    currentY += lineHeight * 2;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Net Salary", 25, currentY);
    doc.text(`₹${Number(entry.net_salary).toLocaleString()}`, 160, currentY);
    
    // Footer
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("This is a computer generated salary slip. No signature required.", 105, 270, { align: "center" });
    
    const fileName = `Salary_Slip_${entry.staff?.full_name}_${entry.month}.pdf`;
    doc.save(fileName);
  };

  const handleExportPayroll = () => {
    const exportData = payroll.map(entry => ({
      'Month': entry.month,
      'Staff Name': entry.staff?.full_name || 'N/A',
      'Designation': entry.staff?.designation || '-',
      'Department': entry.staff?.department || '-',
      'Basic Salary': Number(entry.basic_salary),
      'Allowances': Number(entry.allowances || 0),
      'Deductions': Number(entry.deductions || 0),
      'Net Salary': Number(entry.net_salary),
      'Status': entry.payment_status,
      'Payment Date': entry.payment_date ? new Date(entry.payment_date).toLocaleDateString() : '-',
      'Payment Method': entry.payment_method || '-'
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, "Payroll Records");
    
    const filename = `Payroll_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(wb, filename);
  };
  
  if (payrollLoading || staffLoading) {
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
            <h1 className="text-3xl font-bold">Payroll Management</h1>
            <p className="text-muted-foreground">Manage staff salaries & generate slips</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportPayroll}>
              <Download className="mr-2 h-4 w-4" />
              Export Payroll
            </Button>
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Process Payroll
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Record
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalPayroll.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
              <p className="text-xs text-muted-foreground">Paid records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">To be processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payroll Records</CardTitle>
                <CardDescription>Monthly salary processing</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
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
                  <TableHead>Month</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Basic</TableHead>
                  <TableHead>Allowances</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayroll.length > 0 ? (
                  filteredPayroll.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.month}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.staff?.full_name || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{entry.staff?.designation}</p>
                        </div>
                      </TableCell>
                      <TableCell>₹{Number(entry.basic_salary).toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">₹{Number(entry.allowances || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-red-600">₹{Number(entry.deductions || 0).toLocaleString()}</TableCell>
                      <TableCell className="font-semibold">₹{Number(entry.net_salary).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.payment_status === "paid"
                              ? "bg-green-100 text-green-800 border-green-300"
                              : "bg-orange-100 text-orange-800 border-orange-300"
                          }
                        >
                          {entry.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadSlip(entry)}
                            title="Download Slip"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(entry)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(entry.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No payroll records found. {searchTerm && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Payroll Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPayroll ? 'Edit Payroll' : 'Add Payroll Record'}</DialogTitle>
            <DialogDescription>
              {editingPayroll ? 'Update payroll information' : 'Create a new payroll record'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staff_id">Staff Member *</Label>
              <Select 
                value={formData.staff_id} 
                onValueChange={(value) => {
                  const selectedStaff = staff.find(s => s.id === value);
                  setFormData({ 
                    ...formData, 
                    staff_id: value,
                    basic_salary: selectedStaff?.salary?.toString() || ""
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name} - {member.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Input
                id="month"
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basic_salary">Basic Salary *</Label>
                <Input
                  id="basic_salary"
                  type="number"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowances">Allowances</Label>
                <Input
                  id="allowances"
                  type="number"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deductions">Deductions</Label>
              <Input
                id="deductions"
                type="number"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_status">Payment Status *</Label>
              <Select 
                value={formData.payment_status} 
                onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.payment_status === 'paid' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Payment Date</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => {
                setOpen(false);
                resetForm();
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPayroll.isPending || updatePayroll.isPending}>
                {createPayroll.isPending || updatePayroll.isPending ? 'Saving...' : editingPayroll ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Process Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payroll for All Staff</DialogTitle>
            <DialogDescription>
              This will create payroll records for all staff members for the selected month
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulk_month">Select Month *</Label>
              <Input
                id="bulk_month"
                type="month"
                value={bulkMonth}
                onChange={(e) => setBulkMonth(e.target.value)}
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This will create payroll records for {stats.totalStaff} staff members using their current basic salary. Records will be created with "pending" status.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBulkProcess} disabled={processBulkPayroll.isPending}>
                {processBulkPayroll.isPending ? 'Processing...' : 'Process Payroll'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Payroll;