import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, FolderPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from "@/hooks/useExpenses";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState, useMemo } from "react";
import { toast } from "sonner";

// UPDATED: Exactly 6 categories as requested
const PREDEFINED_CATEGORIES = [
  "Stationery",
  "Maintenance",
  "Transport",
  "Events",
  "Utilities",
  "Salaries"
];

const Expenses = () => {
  const { data: expenses = [], isLoading } = useExpenses();
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const [open, setOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    amount: "",
    payment_method: "Cash",
    receipt_number: ""
  });
  
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");

  // --- CALCULATIONS FOR DASHBOARD ---

  // 1. Filter Logic
  const filteredExpenses = expenses.filter((expense: any) =>
    expense.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Stats Calculations
  const stats = useMemo(() => {
    const totalAmount = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    const totalCount = expenses.length;
    const uniqueCats = new Set(expenses.map((e: any) => e.category)).size;
    const avgExpense = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      total: totalAmount,
      count: totalCount,
      categories: uniqueCats,
      average: avgExpense
    };
  }, [expenses]);

  // 3. Category Budget Logic (FIXED: Shows ALL categories now)
  const categoryStats = useMemo(() => {
    const catMap: Record<string, { amount: number, count: number }> = {};
    
    expenses.forEach((e: any) => {
      if (!catMap[e.category]) {
        catMap[e.category] = { amount: 0, count: 0 };
      }
      catMap[e.category].amount += Number(e.amount);
      catMap[e.category].count += 1;
    });

    // Sort by amount descending (Highest spend first)
    return Object.entries(catMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // --- HANDLERS ---

  const resetForm = () => {
    setFormData({
      category: "",
      description: "",
      amount: "",
      payment_method: "Cash",
      receipt_number: ""
    });
    setIsCustomCategory(false);
    setCustomCategoryInput("");
    setEditingExpense(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalCategory = formData.category;
      if (formData.category === "Other" || isCustomCategory) {
        finalCategory = customCategoryInput;
      }

      if (!finalCategory) {
        toast.error("Please enter a category");
        return;
      }

      const payload = {
        ...formData,
        category: finalCategory,
        amount: parseFloat(formData.amount)
      };

      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, updates: payload });
      } else {
        await createExpense.mutateAsync(payload);
      }
      
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (expense: any) => {
    setEditingExpense(expense);
    const isPredefined = PREDEFINED_CATEGORIES.includes(expense.category);
    setFormData({
      category: isPredefined ? expense.category : "Other",
      description: expense.description,
      amount: expense.amount.toString(),
      payment_method: expense.payment_method || "Cash",
      receipt_number: expense.receipt_number || ""
    });
    if (!isPredefined) {
      setIsCustomCategory(true);
      setCustomCategoryInput(expense.category);
    } else {
      setIsCustomCategory(false);
      setCustomCategoryInput("");
    }
    setOpen(true);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Other") {
      setIsCustomCategory(true);
      setFormData({ ...formData, category: "Other" });
    } else {
      setIsCustomCategory(false);
      setFormData({ ...formData, category: value });
    }
  };

  // Helper for formatting currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
      <div className="p-8 space-y-8 bg-gray-50/50 min-h-screen">
        
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expense Management</h1>
            <p className="text-muted-foreground mt-1">Track expenses, vendors & budgets</p>
          </div>
          <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" /> Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                <DialogDescription>Enter the details of the expense transaction.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomCategory && (
                    <Input 
                      placeholder="Enter custom category name"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="mt-2"
                      required
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the expense"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="0.00"
                        required
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="Net Banking">Net Banking</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-blue-600">
                        {editingExpense ? 'Update' : 'Add'} Expense
                    </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.total)}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.count}</div>
              <p className="text-xs text-muted-foreground mt-1">Expense entries</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.categories}</div>
              <p className="text-xs text-muted-foreground mt-1">Active categories</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Expense</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(stats.average)}</div>
              <p className="text-xs text-muted-foreground mt-1">Per transaction</p>
            </CardContent>
          </Card>
        </div>

        {/* MIDDLE SECTION: BUDGET & QUICK ACTIONS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Category Budget Progress - FIXED SCROLLABLE */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Category-wise Budget</CardTitle>
                    <CardDescription>Budget utilization by category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {categoryStats.length > 0 ? (
                        categoryStats.map((cat) => (
                            <div key={cat.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm font-medium">
                                    <span>{cat.name}</span>
                                    <div className="flex gap-2 text-muted-foreground">
                                        <span>{formatCurrency(cat.amount)}</span>
                                        <span>({cat.count} items)</span>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                        style={{ 
                                            width: `${categoryStats[0].amount > 0 ? (cat.amount / categoryStats[0].amount) * 100 : 0}%` 
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground py-8">No data available</div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Actions Grid */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2 border-dashed border-2" onClick={() => setOpen(true)}>
                            <Plus className="h-6 w-6 text-blue-600" />
                            <span>Add Expense</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => toast.info("Reports feature coming soon")}>
                            <FileText className="h-6 w-6 text-slate-600" />
                            <span>View Reports</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => {
                             setOpen(true);
                             setTimeout(() => handleCategoryChange("Other"), 200);
                        }}>
                            <FolderPlus className="h-6 w-6 text-slate-600" />
                            <span>Add Category</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => {
                            const searchInput = document.getElementById('expense-search');
                            if (searchInput) searchInput.focus();
                        }}>
                            <Search className="h-6 w-6 text-slate-600" />
                            <span>Search</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* TABLE SECTION */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Expenses</CardTitle>
              <CardDescription>Latest expense transactions</CardDescription>
            </div>
            <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="expense-search"
                  placeholder="Search expenses..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Expense ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense: any) => (
                    <TableRow key={expense.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleEdit(expense)}>
                      <TableCell className="font-bold text-xs text-slate-500">
                        {expense.id ? `EXP${expense.id.substring(0, 4).toUpperCase()}` : '---'}
                      </TableCell>
                      <TableCell>
                         {expense.category}
                      </TableCell>
                      <TableCell className="text-slate-600">{expense.description}</TableCell>
                      <TableCell className="font-bold text-slate-900">{formatCurrency(Number(expense.amount))}</TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(expense.expense_date || expense.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1 rounded-full">
                            Recorded
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => {
                             e.stopPropagation(); // Prevent row click (edit)
                             if (confirm("Delete this expense?")) deleteExpense.mutate(expense.id);
                         }}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      No expenses found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Expenses;