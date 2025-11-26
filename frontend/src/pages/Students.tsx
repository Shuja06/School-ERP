// Students.tsx - FINAL CORRECTED VERSION
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, GraduationCap, BookOpen, UserPlus, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from "@/hooks/useStudents";
import { usePermissions } from "@/hooks/usePermissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const Students = () => {
  const { data: students = [], isLoading } = useStudents();
  const { permissions, loading: permissionsLoading } = usePermissions();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    full_name: "",
    class: "",
    section: "",
    parent_name: "",
    parent_contact: "",
    admission_date: new Date().toISOString().split("T")[0],
  });

  // Stats (unchanged)
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const uniqueClasses = new Set(students.map((s) => s.class)).size;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthAdmissions = students.filter((student) => {
      const admissionDate = new Date(student.admission_date || student.created_at);
      return admissionDate.getMonth() === currentMonth && admissionDate.getFullYear() === currentYear;
    }).length;

    return { totalStudents, activeClasses: uniqueClasses, thisMonthAdmissions };
  }, [students]);

  // Real class-wise summary from actual students data
  const classSummary = useMemo(() => {
    const classMap = new Map<string, number>();

    students.forEach((student) => {
      const cls = student.class?.trim();
      if (cls) {
        classMap.set(cls, (classMap.get(cls) || 0) + 1);
      }
    });

    // Sort classes numerically (8, 9, 10, 11, etc.)
    return Array.from(classMap.entries())
      .map(([className, count]) => ({
        class: className,
        students: count,
      }))
      .sort((a, b) => {
        const aNum = parseInt(a.class) || 0;
        const bNum = parseInt(b.class) || 0;
        return aNum - bNum;
      });
  }, [students]);

  const filteredStudents = students.filter(
    (student) =>
      student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // All your existing handlers (resetForm, handleSubmit, handleEdit, handleDelete) remain exactly the same
  const resetForm = () => {
    setFormData({
      student_id: "",
      full_name: "",
      class: "",
      section: "",
      parent_name: "",
      parent_contact: "",
      admission_date: new Date().toISOString().split("T")[0],
    });
    setEditingStudent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && !permissions.canEditStudents) {
      toast.error("You don't have permission to edit students");
      return;
    }
    if (!editingStudent && !permissions.canAddStudents) {
      toast.error("You don't have permission to add students");
      return;
    }

    try {
      if (editingStudent) {
        await updateStudent.mutateAsync({ id: editingStudent.id, updates: formData });
      } else {
        await createStudent.mutateAsync(formData);
      }
      setOpen(false);
      resetForm();
    } catch (error: any) {}
  };

  const handleEdit = (student: any) => {
    if (!permissions.canEditStudents) {
      toast.error("You don't have permission to edit students");
      return;
    }
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      class: student.class,
      section: student.section || "",
      parent_name: student.parent_name || "",
      parent_contact: student.parent_contact || "",
      admission_date: new Date(student.admission_date).toISOString().split("T")[0],
    });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDeleteStudents) {
      toast.error("You don't have permission to delete students");
      return;
    }
    if (!confirm("Are you sure you want to delete this student?")) return;
    await deleteStudent.mutateAsync(id);
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

  if (!permissions.canViewStudents) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view students</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-muted-foreground">Manage student records and view class summary</p>
          </div>
          {permissions.canAddStudents && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingStudent ? "Edit Student" : "Add New Student"}</DialogTitle>
                  <DialogDescription>Fill in the student details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Your full form - unchanged */}
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID</Label>
                    <Input id="student_id" placeholder="e.g., STU001" value={formData.student_id} onChange={(e) => setFormData({ ...formData, student_id: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input id="full_name" placeholder="John Doe" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class</Label>
                    <Input id="class" placeholder="e.g., 10" value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input id="section" placeholder="e.g., A" value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_name">Parent Name</Label>
                    <Input id="parent_name" placeholder="Jane Doe" value={formData.parent_name} onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parent_contact">Parent Contact</Label>
                    <Input id="parent_contact" placeholder="+91 98765 43210" value={formData.parent_contact} onChange={(e) => setFormData({ ...formData, parent_contact: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admission_date">Admission Date</Label>
                    <Input id="admission_date" type="date" value={formData.admission_date} onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={createStudent.isPending || updateStudent.isPending}>
                    {createStudent.isPending || updateStudent.isPending ? "Saving..." : editingStudent ? "Update Student" : "Add Student"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-blue-600">{stats.totalStudents}</div>
              <p className="text-sm text-muted-foreground">Enrolled</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Active Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600">{stats.activeClasses}</div>
              <p className="text-sm text-muted-foreground">Different classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">This Month</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold">{stats.thisMonthAdmissions}</div>
              <p className="text-sm text-muted-foreground">New admissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="records" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="records">
              <Users className="mr-2 h-4 w-4" />
              Student Records
            </TabsTrigger>
            <TabsTrigger value="summary">
              <GraduationCap className="mr-2 h-4 w-4" />
              Class Summary
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Student Records - FULLY PRESERVED */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Records</CardTitle>
                    <CardDescription>View and manage all students</CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." className="pl-9 w-64" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Parent Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Admission Date</TableHead>
                      {(permissions.canEditStudents || permissions.canDeleteStudents) && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_id}</TableCell>
                          <TableCell>{student.full_name}</TableCell>
                          <TableCell>{student.class}</TableCell>
                          <TableCell>{student.section || "-"}</TableCell>
                          <TableCell>{student.parent_name || "-"}</TableCell>
                          <TableCell>{student.parent_contact || "-"}</TableCell>
                          <TableCell>{new Date(student.admission_date || student.created_at).toLocaleDateString()}</TableCell>
                          {(permissions.canEditStudents || permissions.canDeleteStudents) && (
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                {permissions.canEditStudents && (
                                  <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {permissions.canDeleteStudents && (
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
                          No students found. {searchTerm && "Try adjusting your search."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Class Summary - REAL DATA */}
          <TabsContent value="summary">
            {classSummary.length === 0 ? (
              <Card>
                <CardContent className="py-10 text-center text-muted-foreground">
                  No students enrolled yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {classSummary.map(({ class: cls, students: count }) => (
                  <Card key={cls} className="overflow-hidden">
                    <CardHeader className="bg-muted/50">
                      <CardTitle className="text-2xl">Class {cls}</CardTitle>
                      <CardDescription className="text-lg">
                        {count} student{count !== 1 ? "s" : ""} enrolled
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="text-4xl font-bold text-primary">
                        {count}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Total students in this class
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Students;