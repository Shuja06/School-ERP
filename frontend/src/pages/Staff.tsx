import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Users, Building2, DollarSign } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStaff, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/useStaff";
import { usePermissions } from "@/hooks/usePermissions";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const Staff = () => {
  const { data: staff = [], isLoading } = useStaff();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    staff_id: "",
    full_name: "",
    designation: "",
    department: "",
    email: "",
    phone: "",
    salary: "",
    joining_date: new Date().toISOString().split('T')[0]
  });

  const stats = useMemo(() => {
    const totalStaff = staff.length;
    const departments = new Set(staff.map(s => s.department).filter(Boolean)).size;
    const totalPayroll = staff.reduce((sum, s) => sum + Number(s.salary || 0), 0);

    return {
      totalStaff,
      departments,
      totalPayroll
    };
  }, [staff]);

  const filteredStaff = staff.filter(member =>
    member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.staff_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      staff_id: "",
      full_name: "",
      designation: "",
      department: "",
      email: "",
      phone: "",
      salary: "",
      joining_date: new Date().toISOString().split('T')[0]
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingStaff && !permissions.canEditStaff) {
      toast.error("You don't have permission to edit staff");
      return;
    }
    
    if (!editingStaff && !permissions.canAddStaff) {
      toast.error("You don't have permission to add staff");
      return;
    }
    
    try {
      const payload = {
        ...formData,
        salary: parseFloat(formData.salary)
      };

      if (editingStaff) {
        await updateStaff.mutateAsync({ id: editingStaff.id, updates: payload });
      } else {
        await createStaff.mutateAsync(payload);
      }
      
      setOpen(false);
      resetForm();
    } catch (error: any) {
      // Error already handled in mutation
    }
  };

  const handleEdit = (member: any) => {
    if (!permissions.canEditStaff) {
      toast.error("You don't have permission to edit staff");
      return;
    }
    
    setEditingStaff(member);
    setFormData({
      staff_id: member.staff_id,
      full_name: member.full_name,
      designation: member.designation,
      department: member.department || "",
      email: member.email || "",
      phone: member.phone || "",
      salary: member.salary?.toString() || "",
      joining_date: member.joining_date ? new Date(member.joining_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDeleteStaff) {
      toast.error("You don't have permission to delete staff");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this staff member?")) return;
    await deleteStaff.mutateAsync(id);
  };

  if (isLoading || permissionsLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!permissions.canViewStaff) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view staff</p>
          </div>
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
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-muted-foreground">Manage staff and teacher records</p>
          </div>
          {permissions.canAddStaff && (
            <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) resetForm(); }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingStaff ? "Edit Staff" : "Add New Staff"}</DialogTitle>
                  <DialogDescription>
                    {editingStaff ? "Update staff information" : "Enter staff details to add a new record"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff_id">Staff ID *</Label>
                      <Input
                        id="staff_id"
                        placeholder="e.g., ST001"
                        required
                        value={formData.staff_id}
                        onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation *</Label>
                      <Input
                        id="designation"
                        placeholder="e.g., Teacher"
                        required
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        placeholder="e.g., Mathematics"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@school.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salary *</Label>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="50000"
                        required
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="joining_date">Joining Date</Label>
                      <Input
                        id="joining_date"
                        type="date"
                        value={formData.joining_date}
                        onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createStaff.isPending || updateStaff.isPending}>
                      {createStaff.isPending || updateStaff.isPending ? 'Saving...' : editingStaff ? "Update" : "Add"} Staff
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">{stats.totalStaff}</div>
              <p className="text-sm text-muted-foreground">Active members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600">{stats.departments}</div>
              <p className="text-sm text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">₹{stats.totalPayroll.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total salaries</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Records Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Staff Records</CardTitle>
                <CardDescription>View and manage all staff members</CardDescription>
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
                  <TableHead>Staff ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Salary</TableHead>
                  {(permissions.canEditStaff || permissions.canDeleteStaff) && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.staff_id}</TableCell>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.designation}</TableCell>
                      <TableCell>{member.department || '-'}</TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>{member.phone || '-'}</TableCell>
                      <TableCell>₹{Number(member.salary).toLocaleString()}</TableCell>
                      {(permissions.canEditStaff || permissions.canDeleteStaff) && (
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {permissions.canEditStaff && (
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            {permissions.canDeleteStaff && (
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No staff members found. {searchTerm && 'Try adjusting your search.'}
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

export default Staff;