import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface StudentForm {
  studentId: string;
  name: string;
  classLevel: string;
  email: string;
  phone: string;
}

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<StudentForm>({
    studentId: "",
    name: "",
    classLevel: "",
    email: "",
    phone: "",
  });

  const { data: students, isLoading, refetch } = trpc.students.list.useQuery();
  const createMutation = trpc.students.create.useMutation();
  const updateMutation = trpc.students.update.useMutation();
  const deleteMutation = trpc.students.delete.useMutation();

  const filteredStudents = students?.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (student?: any) => {
    if (student) {
      setEditingId(student.id);
      setFormData({
        studentId: student.studentId,
        name: student.name,
        classLevel: student.classLevel,
        email: student.email || "",
        phone: student.phone || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        studentId: "",
        name: "",
        classLevel: "",
        email: "",
        phone: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: formData,
        });
        toast.success("Student updated successfully");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Student added successfully");
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to save student");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Student deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Student Management</h1>
            <p className="mt-2 text-muted-foreground">
              Manage all students in your school
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Student
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Students Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-accent"></div>
                <p className="text-muted-foreground">Loading students...</p>
              </div>
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Student ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Class
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {student.classLevel}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {student.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {student.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(student)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-muted-foreground">No students found</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Student ID *
              </label>
              <Input
                required
                value={formData.studentId}
                onChange={(e) =>
                  setFormData({ ...formData, studentId: e.target.value })
                }
                placeholder="e.g., STU001"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Name *
              </label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Class *
              </label>
              <Input
                required
                value={formData.classLevel}
                onChange={(e) =>
                  setFormData({ ...formData, classLevel: e.target.value })
                }
                placeholder="e.g., 10A"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="student@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Phone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 9999999999"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingId ? "Update" : "Add"} Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
