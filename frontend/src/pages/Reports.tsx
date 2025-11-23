import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, TrendingUp, DollarSign, Users, TrendingDown } from "lucide-react";
import { useState } from "react";
import { useDashboardReport, useFeeCollectionReport, useOutstandingDuesReport, useExpenseReport, usePayrollReport, useIncomeExpenseReport } from "@/hooks/useReports";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const Reports = () => {
  const { data: dashboardData, isLoading: dashboardLoading } = useDashboardReport();
  
  const [reportType, setReportType] = useState("fee-collection");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  // Fetch different report types based on selection
  const { data: feeCollectionData } = useFeeCollectionReport(startDate, endDate);
  const { data: outstandingDuesData } = useOutstandingDuesReport();
  const { data: expenseData } = useExpenseReport(startDate, endDate);
  const { data: payrollData } = usePayrollReport(selectedMonth);
  const { data: incomeExpenseData } = useIncomeExpenseReport(startDate, endDate);

  const handleDownloadReport = () => {
    let data: any = null;
    let filename = "";

    switch (reportType) {
      case "fee-collection":
        data = feeCollectionData;
        filename = "Fee_Collection_Report";
        break;
      case "outstanding-dues":
        data = outstandingDuesData;
        filename = "Outstanding_Dues_Report";
        break;
      case "expenses":
        data = expenseData;
        filename = "Expense_Report";
        break;
      case "payroll":
        data = payrollData;
        filename = "Payroll_Report";
        break;
      case "income-expense":
        data = incomeExpenseData;
        filename = "Income_Expense_Summary";
        break;
    }

    if (!data) {
      alert("Please select date range or month to generate report");
      return;
    }

    // Create Excel workbook
    const wb = XLSX.utils.book_new();

    // Add summary sheet
    const summaryData = Object.entries(data)
      .filter(([key]) => !key.includes('Breakdown') && !Array.isArray(data[key]))
      .map(([key, value]) => ({
        'Metric': key.replace(/([A-Z])/g, ' $1').trim(),
        'Value': typeof value === 'number' ? `₹${value.toLocaleString()}` : value
      }));

    const ws1 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws1, "Summary");

    // Add breakdown sheets if available
    Object.entries(data).forEach(([key, value]) => {
      if (key.includes('Breakdown') && typeof value === 'object' && !Array.isArray(value)) {
        const breakdownData = Object.entries(value).map(([k, v]) => ({
          'Category': k,
          'Amount': typeof v === 'number' ? v : v
        }));
        const ws = XLSX.utils.json_to_sheet(breakdownData);
        XLSX.utils.book_append_sheet(wb, ws, key.replace('Breakdown', ''));
      }
    });

    // Download
    const dateStr = startDate && endDate ? `_${startDate}_to_${endDate}` : `_${new Date().toISOString().split('T')[0]}`;
    XLSX.writeFile(wb, `${filename}${dateStr}.xlsx`);
  };

  const handleDownloadPDF = (reportTitle: string) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(reportTitle, 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SCHOOL ERP SYSTEM", 105, 28, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 34, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    doc.setFontSize(11);
    doc.text("Report generation in progress...", 20, 50);
    doc.text("Full report data will be displayed here.", 20, 58);
    
    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const quickStats = [
    { 
      label: "Total Revenue (YTD)", 
      value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`, 
      change: "+15.2%",
      icon: DollarSign,
      color: "text-green-600"
    },
    { 
      label: "Collection Rate", 
      value: `${dashboardData?.collectionRate || 0}%`, 
      change: "+3.5%",
      icon: TrendingUp,
      color: "text-blue-600"
    },
    { 
      label: "Outstanding Amount", 
      value: `₹${(dashboardData?.outstandingDues || 0).toLocaleString()}`, 
      change: "-8.1%",
      icon: TrendingDown,
      color: "text-orange-600"
    },
    { 
      label: "Total Expenses", 
      value: `₹${(dashboardData?.totalExpenses || 0).toLocaleString()}`, 
      change: "+5.4%",
      icon: FileText,
      color: "text-red-600"
    },
  ];

  const reports = [
    {
      title: "Fee Collection Report",
      description: "Daily, monthly & annual collection summary",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      data: feeCollectionData,
      reportType: "fee-collection"
    },
    {
      title: "Outstanding Dues Report",
      description: "Student-wise & class-wise dues",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      data: outstandingDuesData,
      reportType: "outstanding-dues"
    },
    {
      title: "Expense Report",
      description: "Category-wise expense breakdown",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-blue-50",
      data: expenseData,
      reportType: "expenses"
    },
    {
      title: "Payroll Report",
      description: "Salary disbursement summary",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      data: payrollData,
      reportType: "payroll"
    },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive financial reports</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  {stat.change} from last period
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${report.bgColor}`}>
                      <report.icon className={`h-6 w-6 ${report.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{report.title}</CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                      {report.data && (
                        <div className="mt-2 text-sm font-medium">
                          {report.reportType === 'fee-collection' && (
                            <p>Total: ₹{report.data.totalCollection?.toLocaleString() || 0}</p>
                          )}
                          {report.reportType === 'outstanding-dues' && (
                            <p>Outstanding: ₹{report.data.totalOutstanding?.toLocaleString() || 0}</p>
                          )}
                          {report.reportType === 'expenses' && (
                            <p>Total: ₹{report.data.totalExpenses?.toLocaleString() || 0}</p>
                          )}
                          {report.reportType === 'payroll' && (
                            <p>Total: ₹{report.data.totalPayroll?.toLocaleString() || 0}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDownloadPDF(report.title)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    View Report
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      setReportType(report.reportType);
                      handleDownloadReport();
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Report Generator & Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Report Generator</CardTitle>
              <CardDescription>Generate custom reports with date range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fee-collection">Fee Collection</SelectItem>
                    <SelectItem value="outstanding-dues">Outstanding Dues</SelectItem>
                    <SelectItem value="expenses">Expenses</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="income-expense">Income & Expense Summary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {reportType === 'payroll' ? (
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Input
                    id="month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={handleDownloadReport}>
                <Download className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
              <CardDescription>Overall financial health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Total Income</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{(dashboardData?.totalRevenue || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium">Total Expenses</span>
                  <span className="text-lg font-bold text-red-600">
                    ₹{((dashboardData?.totalExpenses || 0) + (dashboardData?.totalPayroll || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Net Income</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹{(dashboardData?.netIncome || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Students</span>
                  <span className="font-medium">{dashboardData?.totalStudents || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Staff</span>
                  <span className="font-medium">{dashboardData?.totalStaff || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Collection Rate</span>
                  <span className="font-medium">{dashboardData?.collectionRate || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;