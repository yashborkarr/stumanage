import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FeeForm {
  studentId: number;
  feeType: string;
  amount: number;
  dueDate: string;
  paymentMethod?: string;
}

export default function FeeManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [feeForm, setFeeForm] = useState<FeeForm>({
    studentId: 0,
    feeType: "Tuition",
    amount: 0,
    dueDate: "",
    paymentMethod: "Cash",
  });

  const { data: students } = trpc.students.list.useQuery();
  const { data: pendingFees, refetch } = trpc.fees.getPending.useQuery();
  const createFeeMutation = trpc.fees.create.useMutation();
  const updateStatusMutation = trpc.fees.updateStatus.useMutation();

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFeeMutation.mutateAsync(feeForm);
      toast.success("Fee created successfully");
      setIsDialogOpen(false);
      setFeeForm({
        studentId: 0,
        feeType: "Tuition",
        amount: 0,
        dueDate: "",
        paymentMethod: "Cash",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to create fee");
    }
  };

  const handleMarkAsPaid = async (feeId: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        feeId,
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      });
      toast.success("Fee marked as paid");
      refetch();
    } catch (error) {
      toast.error("Failed to update fee status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="badge-success flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Paid
          </span>
        );
      case "pending":
        return (
          <span className="badge-warning flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case "overdue":
        return (
          <span className="badge-danger flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </span>
        );
      default:
        return <span className="badge-info">{status}</span>;
    }
  };

  const getStudentName = (studentId: number) => {
    return students?.find((s) => s.id === studentId)?.name || "Unknown";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fee Management</h1>
            <p className="mt-2 text-muted-foreground">
              Track and manage student fees
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Fee
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="stat-card stat-card-success p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Collected</p>
            <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
              ₹{pendingFees?.filter((f) => f.status === "paid").reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0).toLocaleString("en-IN") || 0}
            </p>
          </Card>
          <Card className="stat-card stat-card-warning p-6">
            <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
            <p className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{pendingFees?.filter((f) => f.status === "pending").reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0).toLocaleString("en-IN") || 0}
            </p>
          </Card>
          <Card className="stat-card stat-card-danger p-6">
            <p className="text-sm font-medium text-muted-foreground">Overdue Amount</p>
            <p className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
              ₹{pendingFees?.filter((f) => f.status === "overdue").reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0).toLocaleString("en-IN") || 0}
            </p>
          </Card>
        </div>

        {/* Fees Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Fee Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingFees && pendingFees.length > 0 ? (
                  pendingFees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {getStudentName(fee.studentId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {fee.feeType}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        ₹{parseFloat(fee.amount.toString()).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {getStatusBadge(fee.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {fee.status !== "paid" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAsPaid(fee.id)}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">No fees found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Add Fee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFee} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Student *
              </label>
              <select
                required
                value={feeForm.studentId}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, studentId: parseInt(e.target.value) })
                }
                className="input-field mt-2"
              >
                <option value="">Select a student</option>
                {students?.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Fee Type *
              </label>
              <Input
                required
                value={feeForm.feeType}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, feeType: e.target.value })
                }
                placeholder="e.g., Tuition, Transport"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Amount *
              </label>
              <Input
                required
                type="number"
                value={feeForm.amount}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, amount: parseFloat(e.target.value) })
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Due Date *
              </label>
              <Input
                required
                type="date"
                value={feeForm.dueDate}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, dueDate: e.target.value })
                }
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
                Add Fee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
