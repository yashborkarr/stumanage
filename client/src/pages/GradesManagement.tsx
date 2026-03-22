import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ExamForm {
  examName: string;
  examType: "midterm" | "final" | "quiz" | "practical";
  classLevel: string;
  examDate: string;
  totalMarks: number;
  passingMarks: number;
}

export default function GradesManagement() {
  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState<ExamForm>({
    examName: "",
    examType: "final",
    classLevel: "",
    examDate: "",
    totalMarks: 100,
    passingMarks: 40,
  });

  const { data: exams, refetch: refetchExams } = trpc.exams.list.useQuery();
  const createExamMutation = trpc.exams.create.useMutation();

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExamMutation.mutateAsync(examForm);
      toast.success("Exam created successfully");
      setIsExamDialogOpen(false);
      setExamForm({
        examName: "",
        examType: "final",
        classLevel: "",
        examDate: "",
        totalMarks: 100,
        passingMarks: 40,
      });
      refetchExams();
    } catch (error) {
      toast.error("Failed to create exam");
    }
  };

  // Sample data for performance chart
  const performanceData = [
    { subject: "Mathematics", average: 78 },
    { subject: "English", average: 82 },
    { subject: "Science", average: 75 },
    { subject: "History", average: 80 },
    { subject: "Geography", average: 77 },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Grades & Exams</h1>
            <p className="mt-2 text-muted-foreground">
              Manage exams and student grades
            </p>
          </div>
          <Button
            onClick={() => setIsExamDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Exam
          </Button>
        </div>

        {/* Exams List */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Exam Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Marks
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Passing Marks
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams && exams.length > 0 ? (
                  exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="border-b border-border transition-colors hover:bg-muted/50"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {exam.examName}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="badge-info">
                          {exam.examType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {exam.classLevel}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(exam.examDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {exam.totalMarks}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {exam.passingMarks}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">No exams created yet</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Performance Chart */}
        <Card className="p-6">
          <div className="mb-6 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-semibold text-foreground">
              Subject Performance
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="average" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Add Exam Dialog */}
      <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Exam</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Exam Name *
              </label>
              <Input
                required
                value={examForm.examName}
                onChange={(e) =>
                  setExamForm({ ...examForm, examName: e.target.value })
                }
                placeholder="e.g., Mathematics Final"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Exam Type *
              </label>
              <select
                value={examForm.examType}
                onChange={(e) =>
                  setExamForm({
                    ...examForm,
                    examType: e.target.value as any,
                  })
                }
                className="input-field mt-2"
              >
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="practical">Practical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Class *
              </label>
              <Input
                required
                value={examForm.classLevel}
                onChange={(e) =>
                  setExamForm({ ...examForm, classLevel: e.target.value })
                }
                placeholder="e.g., 10A"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Exam Date *
              </label>
              <Input
                required
                type="date"
                value={examForm.examDate}
                onChange={(e) =>
                  setExamForm({ ...examForm, examDate: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Total Marks
                </label>
                <Input
                  type="number"
                  value={examForm.totalMarks}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      totalMarks: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Passing Marks
                </label>
                <Input
                  type="number"
                  value={examForm.passingMarks}
                  onChange={(e) =>
                    setExamForm({
                      ...examForm,
                      passingMarks: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsExamDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Create Exam
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
