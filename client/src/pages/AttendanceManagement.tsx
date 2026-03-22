import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedClass, setSelectedClass] = useState("10A");
  const [attendance, setAttendance] = useState<Record<number, "present" | "absent" | "leave">>({});

  const { data: students } = trpc.students.getByClass.useQuery({
    classLevel: selectedClass,
  });

  const markAttendanceMutation = trpc.attendance.mark.useMutation();

  const handleAttendanceChange = (
    studentId: number,
    status: "present" | "absent" | "leave"
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === status ? undefined : status,
    }));
  };

  const handleSubmit = async () => {
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
        if (status) {
          await markAttendanceMutation.mutateAsync({
            studentId: parseInt(studentId),
            attendanceDate: selectedDate,
            status: status as "present" | "absent" | "leave",
          });
        }
      }
      toast.success("Attendance marked successfully");
      setAttendance({});
    } catch (error) {
      toast.error("Failed to mark attendance");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="mt-2 text-muted-foreground">
            Mark daily attendance for students
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground">
                Date
              </label>
              <div className="mt-2 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Class
              </label>
              <Input
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                placeholder="e.g., 10A"
                className="mt-2"
              />
            </div>
          </div>
        </Card>

        {/* Attendance Table */}
        <Card className="overflow-hidden">
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
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Leave
                  </th>
                </tr>
              </thead>
              <tbody>
                {students && students.length > 0 ? (
                  students.map((student) => (
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
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "present")
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                            attendance[student.id] === "present"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "absent")
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                            attendance[student.id] === "absent"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            handleAttendanceChange(student.id, "leave")
                          }
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                            attendance[student.id] === "leave"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">
                        No students found in this class
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Submit Button */}
        {students && students.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit} size="lg">
              Save Attendance
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
