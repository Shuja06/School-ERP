import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, BookOpen, FileText, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFeeStructures, useCreateFeeStructure, useUpdateFeeStructure, useDeleteFeeStructure } from "@/hooks/useFeeStructures";
import { useStudents } from "@/hooks/useStudents";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";

const FeeManagement = () => {
  const { data: feeStructures = [], isLoading } = useFeeStructures();
  const { data: students = [] } = useStudents();
  const createFee = useCreateFeeStructure();
  const updateFee = useUpdateFeeStructure();
  const deleteFee = useDeleteFeeStructure();

  const [open, setOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    class: "",
    fee_type: "",
    amount: "",
    academic_year: "2024-2025"
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueClasses = new Set(feeStructures.map(f => f.class)).size;
    const totalFeeTypes = feeStructures.length;
    const totalStudents = students.length;

    return {
      uniqueClasses,
      totalFeeTypes,
      totalStudents
    };
  }, [feeStructures, students]);

  // Filter fee structures
  const filteredFees = feeStructures.filter(fee =>
    fee.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.fee_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.academic_year?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      class: "",
      fee_type: "",
      amount: "",
      academic_year: "2024-2025"
    });
    setEditingFee(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      if (editingFee) {
        await updateFee.mutateAsync({ id: editingFee.id, updates: payload });
      } else {
        await createFee.mutateAsync(payload);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      // Error already handled in mutation
    }
  };

  const handleEdit = (fee: any) => {
    setEditingFee(fee);
    setFormData({
      class: fee.class,
      fee_type: fee.fee_type,
      amount: fee.amount.toString(),
      academic_year: fee.academic_year
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this fee structure?")) return;
    await deleteFee.mutateAsync(id);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fee Management</h1>
            <p className="text-muted-foreground">Manage fee structures, discounts & installments</p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Fee Structure
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{stats.uniqueClasses}</div>
              <p className="text-lg text-muted-foreground">With fee structures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fee Types</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">{stats.totalFeeTypes}</div>
              <p className="text-lg text-muted-foreground">Fee components</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{stats.totalStudents}</div>
              <p className="text-lg text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Fee Structures</CardTitle>
                <CardDescription>Class-wise fee breakdown</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search class..."
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
                  <TableHead>Class</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length > 0 ? (
                  filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">Class {fee.class}</TableCell>
                      <TableCell>{fee.fee_type}</TableCell>
                      <TableCell className="font-semibold">₹{Number(fee.amount).toLocaleString()}</TableCell>
                      <TableCell>{fee.academic_year}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(fee)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(fee.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No fee structures found. {searchTerm && 'Try adjusting your search.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee Structure" : "Add Fee Structure"}</DialogTitle>
            <DialogDescription>
              {editingFee ? "Update the fee structure details" : "Enter the fee structure details"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="class">Class *</Label>
              <Input
                id="class"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                placeholder="e.g., 1, 2, 10, 11"
                required
              />
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
              <Button type="submit" disabled={createFee.isPending || updateFee.isPending}>
                {createFee.isPending || updateFee.isPending ? 'Saving...' : editingFee ? "Update" : "Add"} Fee Structure
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FeeManagement;




















// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Plus, Search, Edit, Trash2, BookOpen, FileText, Users, TrendingUp, Copy, Download, Calendar, Percent, DollarSign, AlertCircle } from "lucide-react";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Label } from "@/components/ui/label";
// import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useState, useMemo } from "react";

// // Dummy Data
// const dummyFeeStructures = [
//   { id: '1', class: '10', fee_type: 'Tuition', amount: 20000, academic_year: '2024-2025' },
//   { id: '2', class: '10', fee_type: 'Transport', amount: 3000, academic_year: '2024-2025' },
//   { id: '3', class: '10', fee_type: 'Activities', amount: 2000, academic_year: '2024-2025' },
//   { id: '4', class: '9', fee_type: 'Tuition', amount: 18000, academic_year: '2024-2025' },
//   { id: '5', class: '9', fee_type: 'Activities', amount: 1000, academic_year: '2024-2025' },
//   { id: '6', class: '11', fee_type: 'Tuition', amount: 25000, academic_year: '2024-2025' },
//   { id: '7', class: '11', fee_type: 'Lab Fee', amount: 5000, academic_year: '2024-2025' },
//   { id: '8', class: '12', fee_type: 'Tuition', amount: 28000, academic_year: '2024-2025' },
//   { id: '9', class: '12', fee_type: 'Exam Fee', amount: 3000, academic_year: '2024-2025' },
//   { id: '10', class: '8', fee_type: 'Tuition', amount: 15000, academic_year: '2024-2025' },
// ];

// const dummyStudents = [
//   { id: '1', class: '10', count: 45 },
//   { id: '2', class: '9', count: 50 },
//   { id: '3', class: '11', count: 40 },
//   { id: '4', class: '12', count: 35 },
//   { id: '5', class: '8', count: 48 },
// ];

// const dummyDiscounts = [
//   { id: '1', name: 'Sibling Discount', type: 'Percentage', value: 10, applicable_to: 'All Classes' },
//   { id: '2', name: 'Merit Scholarship', type: 'Fixed', value: 5000, applicable_to: 'Class 10-12' },
//   { id: '3', name: 'Early Payment', type: 'Percentage', value: 5, applicable_to: 'All Classes' },
// ];

// const dummyInstallments = [
//   { id: '1', class: '10', installments: 3, months: 'Apr, Aug, Dec' },
//   { id: '2', class: '9', installments: 3, months: 'Apr, Aug, Dec' },
//   { id: '3', class: '11', installments: 4, months: 'Apr, Jul, Oct, Jan' },
//   { id: '4', class: '12', installments: 4, months: 'Apr, Jul, Oct, Jan' },
// ];

// const FeeManagement = () => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [open, setOpen] = useState(false);
//   const [discountOpen, setDiscountOpen] = useState(false);
//   const [installmentOpen, setInstallmentOpen] = useState(false);
//   const [editingFee, setEditingFee] = useState<any>(null);

//   const [formData, setFormData] = useState({
//     class: "",
//     fee_type: "",
//     amount: "",
//     academic_year: "2024-2025"
//   });

//   // Calculate statistics
//   const stats = useMemo(() => {
//     const uniqueClasses = new Set(dummyFeeStructures.map(f => f.class)).size;
//     const totalFeeTypes = dummyFeeStructures.length;
//     const totalStudents = dummyStudents.reduce((sum, s) => sum + s.count, 0);
    
//     // Calculate expected revenue
//     const expectedRevenue = dummyFeeStructures.reduce((total, fee) => {
//       const classData = dummyStudents.find(s => s.class === fee.class);
//       const studentCount = classData ? classData.count : 0;
//       return total + (fee.amount * studentCount);
//     }, 0);

//     // Group fees by class
//     const classFees = dummyFeeStructures.reduce((acc, fee) => {
//       if (!acc[fee.class]) {
//         acc[fee.class] = [];
//       }
//       acc[fee.class].push(fee);
//       return acc;
//     }, {} as Record<string, typeof dummyFeeStructures>);

//     return {
//       uniqueClasses,
//       totalFeeTypes,
//       totalStudents,
//       expectedRevenue,
//       classFees
//     };
//   }, []);

//   // Filter fee structures
//   const filteredFees = dummyFeeStructures.filter(fee =>
//     fee.class?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     fee.fee_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     fee.academic_year?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const resetForm = () => {
//     setFormData({
//       class: "",
//       fee_type: "",
//       amount: "",
//       academic_year: "2024-2025"
//     });
//     setEditingFee(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     alert('This is a demo with dummy data. Backend integration needed.');
//     setOpen(false);
//     resetForm();
//   };

//   const handleEdit = (fee: any) => {
//     setEditingFee(fee);
//     setFormData({
//       class: fee.class,
//       fee_type: fee.fee_type,
//       amount: fee.amount.toString(),
//       academic_year: fee.academic_year
//     });
//     setOpen(true);
//   };

//   const handleDelete = (id: string) => {
//     if (confirm("Are you sure you want to delete this fee structure?")) {
//       alert('This is a demo with dummy data. Backend integration needed.');
//     }
//   };

//   return (
//     <DashboardLayout>
//       <div className="p-8 space-y-6">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-bold">Fee Management</h1>
//             <p className="text-muted-foreground">Manage fee structures, discounts & installments</p>
//           </div>
//           <div className="flex gap-2">
//             <Button variant="outline" size="sm">
//               <Copy className="mr-2 h-4 w-4" />
//               Clone from Previous Year
//             </Button>
//             <Button variant="outline" size="sm">
//               <Download className="mr-2 h-4 w-4" />
//               Export
//             </Button>
//             <Button onClick={() => setOpen(true)}>
//               <Plus className="mr-2 h-4 w-4" />
//               Add Fee Structure
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
//               <BookOpen className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-primary">{stats.uniqueClasses}</div>
//               <p className="text-xs text-muted-foreground">With fee structures</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Fee Types</CardTitle>
//               <FileText className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-green-600">{stats.totalFeeTypes}</div>
//               <p className="text-xs text-muted-foreground">Fee components</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Students</CardTitle>
//               <Users className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">{stats.totalStudents}</div>
//               <p className="text-xs text-muted-foreground">Enrolled</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Expected Revenue</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold text-blue-600">₹{(stats.expectedRevenue / 100000).toFixed(2)}L</div>
//               <p className="text-xs text-muted-foreground">Annual projection</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tabs for different sections */}
//         <Tabs defaultValue="structures" className="space-y-4">
//           <TabsList>
//             <TabsTrigger value="structures">Fee Structures</TabsTrigger>
//             <TabsTrigger value="discounts">Discounts & Concessions</TabsTrigger>
//             <TabsTrigger value="installments">Installment Plans</TabsTrigger>
//             <TabsTrigger value="summary">Class Summary</TabsTrigger>
//           </TabsList>

//           {/* Fee Structures Tab */}
//           <TabsContent value="structures" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle>Fee Structures</CardTitle>
//                     <CardDescription>Class-wise fee breakdown for academic year 2024-2025</CardDescription>
//                   </div>
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       placeholder="Search class..."
//                       className="pl-9 w-64"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Class</TableHead>
//                       <TableHead>Fee Type</TableHead>
//                       <TableHead>Amount</TableHead>
//                       <TableHead>Students</TableHead>
//                       <TableHead>Total Revenue</TableHead>
//                       <TableHead>Academic Year</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredFees.length > 0 ? (
//                       filteredFees.map((fee) => {
//                         const classData = dummyStudents.find(s => s.class === fee.class);
//                         const studentCount = classData ? classData.count : 0;
//                         const totalRevenue = fee.amount * studentCount;
                        
//                         return (
//                           <TableRow key={fee.id}>
//                             <TableCell className="font-medium">Class {fee.class}</TableCell>
//                             <TableCell>
//                               <Badge variant="outline">{fee.fee_type}</Badge>
//                             </TableCell>
//                             <TableCell className="font-semibold">₹{fee.amount.toLocaleString()}</TableCell>
//                             <TableCell>{studentCount}</TableCell>
//                             <TableCell className="text-green-600 font-medium">₹{totalRevenue.toLocaleString()}</TableCell>
//                             <TableCell>{fee.academic_year}</TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex gap-2 justify-end">
//                                 <Button variant="ghost" size="icon" onClick={() => handleEdit(fee)}>
//                                   <Edit className="h-4 w-4" />
//                                 </Button>
//                                 <Button variant="ghost" size="icon" onClick={() => handleDelete(fee.id)}>
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         );
//                       })
//                     ) : (
//                       <TableRow>
//                         <TableCell colSpan={7} className="h-24 text-center">
//                           No fee structures found. {searchTerm && 'Try adjusting your search.'}
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Discounts Tab */}
//           <TabsContent value="discounts" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle>Discounts & Concessions</CardTitle>
//                     <CardDescription>Manage discounts, scholarships, and fee waivers</CardDescription>
//                   </div>
//                   <Button onClick={() => setDiscountOpen(true)}>
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add Discount
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Discount Name</TableHead>
//                       <TableHead>Type</TableHead>
//                       <TableHead>Value</TableHead>
//                       <TableHead>Applicable To</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dummyDiscounts.map((discount) => (
//                       <TableRow key={discount.id}>
//                         <TableCell className="font-medium">
//                           <div className="flex items-center gap-2">
//                             <Percent className="h-4 w-4 text-green-600" />
//                             {discount.name}
//                           </div>
//                         </TableCell>
//                         <TableCell>
//                           <Badge variant={discount.type === 'Percentage' ? 'default' : 'secondary'}>
//                             {discount.type}
//                           </Badge>
//                         </TableCell>
//                         <TableCell className="font-semibold">
//                           {discount.type === 'Percentage' ? `${discount.value}%` : `₹${discount.value.toLocaleString()}`}
//                         </TableCell>
//                         <TableCell>{discount.applicable_to}</TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex gap-2 justify-end">
//                             <Button variant="ghost" size="icon">
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button variant="ghost" size="icon">
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Installments Tab */}
//           <TabsContent value="installments" className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <CardTitle>Installment Plans</CardTitle>
//                     <CardDescription>Define payment schedules for each class</CardDescription>
//                   </div>
//                   <Button onClick={() => setInstallmentOpen(true)}>
//                     <Plus className="mr-2 h-4 w-4" />
//                     Add Plan
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Class</TableHead>
//                       <TableHead>Number of Installments</TableHead>
//                       <TableHead>Payment Months</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {dummyInstallments.map((plan) => (
//                       <TableRow key={plan.id}>
//                         <TableCell className="font-medium">Class {plan.class}</TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Calendar className="h-4 w-4 text-blue-600" />
//                             {plan.installments} Installments
//                           </div>
//                         </TableCell>
//                         <TableCell>{plan.months}</TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex gap-2 justify-end">
//                             <Button variant="ghost" size="icon">
//                               <Edit className="h-4 w-4" />
//                             </Button>
//                             <Button variant="ghost" size="icon">
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </CardContent>
//             </Card>
//           </TabsContent>

//           {/* Class Summary Tab */}
//           <TabsContent value="summary" className="space-y-4">
//             <div className="grid gap-4 md:grid-cols-2">
//               {Object.entries(stats.classFees).map(([className, fees]) => {
//                 const classData = dummyStudents.find(s => s.class === className);
//                 const studentCount = classData ? classData.count : 0;
//                 const totalFee = fees.reduce((sum, f) => sum + f.amount, 0);
//                 const totalRevenue = totalFee * studentCount;

//                 return (
//                   <Card key={className}>
//                     <CardHeader>
//                       <CardTitle>Class {className}</CardTitle>
//                       <CardDescription>{studentCount} students enrolled</CardDescription>
//                     </CardHeader>
//                     <CardContent className="space-y-4">
//                       <div className="space-y-2">
//                         {fees.map((fee) => (
//                           <div key={fee.id} className="flex justify-between items-center">
//                             <span className="text-sm text-muted-foreground">{fee.fee_type}</span>
//                             <span className="font-medium">₹{fee.amount.toLocaleString()}</span>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="pt-4 border-t">
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="font-semibold">Total per Student</span>
//                           <span className="text-lg font-bold">₹{totalFee.toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between items-center">
//                           <span className="text-sm text-muted-foreground">Expected Revenue</span>
//                           <span className="text-sm font-medium text-green-600">₹{totalRevenue.toLocaleString()}</span>
//                         </div>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           </TabsContent>
//         </Tabs>

//         {/* Info Banner */}
//         <Card className="border-blue-200 bg-blue-50">
//           <CardContent className="pt-6">
//             <div className="flex items-start gap-3">
//               <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
//               <div>
//                 <h4 className="font-semibold text-blue-900">Demo Mode</h4>
//                 <p className="text-sm text-blue-700">
//                   This is a preview with dummy data. Connect to your backend to enable full functionality including creating, editing, and deleting fee structures.
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Add/Edit Fee Structure Dialog */}
//       <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>{editingFee ? "Edit Fee Structure" : "Add Fee Structure"}</DialogTitle>
//             <DialogDescription>
//               {editingFee ? "Update the fee structure details" : "Enter the fee structure details"}
//             </DialogDescription>
//           </DialogHeader>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="class">Class *</Label>
//               <Input
//                 id="class"
//                 value={formData.class}
//                 onChange={(e) => setFormData({ ...formData, class: e.target.value })}
//                 placeholder="e.g., 1, 2, 10, 11"
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="fee_type">Fee Type *</Label>
//               <Input
//                 id="fee_type"
//                 value={formData.fee_type}
//                 onChange={(e) => setFormData({ ...formData, fee_type: e.target.value })}
//                 placeholder="e.g., Tuition, Transport, Activities"
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="amount">Amount *</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                 placeholder="Enter amount"
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="academic_year">Academic Year *</Label>
//               <Input
//                 id="academic_year"
//                 value={formData.academic_year}
//                 onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
//                 placeholder="e.g., 2024-2025"
//                 required
//               />
//             </div>
//             <div className="flex gap-2 justify-end">
//               <Button type="button" variant="outline" onClick={() => {
//                 setOpen(false);
//                 resetForm();
//               }}>
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {editingFee ? "Update" : "Add"} Fee Structure
//               </Button>
//             </div>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </DashboardLayout>
//   );
// };

// export default FeeManagement;