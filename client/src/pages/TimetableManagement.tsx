import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Plus, Clock } from "lucide-react";
import { toast } from "sonner";

interface TimetableForm {
  classLevel: string;
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  period: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room?: string;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableManagement() {
  const [selectedClass, setSelectedClass] = useState("10A");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timetableForm, setTimetableForm] = useState<TimetableForm>({
    classLevel: "10A",
    dayOfWeek: "Monday",
    period: 1,
    subject: "",
    teacher: "",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
  });

  const { data: timetable, refetch } = trpc.timetable.getByClass.useQuery({
    classLevel: selectedClass,
  });

  const createMutation = trpc.timetable.create.useMutation();

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...timetableForm,
        classLevel: selectedClass,
      });
      toast.success("Timetable entry added successfully");
      setIsDialogOpen(false);
      setTimetableForm({
        classLevel: selectedClass,
        dayOfWeek: "Monday",
        period: 1,
        subject: "",
        teacher: "",
        startTime: "09:00",
        endTime: "10:00",
        room: "",
      });
      refetch();
    } catch (error) {
      toast.error("Failed to add timetable entry");
    }
  };

  // Group timetable by day
  const timetableByDay = DAYS.reduce(
    (acc, day) => {
      acc[day] = timetable?.filter((t) => t.dayOfWeek === day) || [];
      return acc;
    },
    {} as Record<string, any[]>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
            <p className="mt-2 text-muted-foreground">
              Manage weekly class schedule
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Entry
          </Button>
        </div>

        {/* Class Selector */}
        <Card className="p-4">
          <label className="text-sm font-medium text-foreground">
            Select Class
          </label>
          <Input
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            placeholder="e.g., 10A"
            className="mt-2"
          />
        </Card>

        {/* Weekly Timetable */}
        <div className="grid gap-4 lg:grid-cols-2">
          {DAYS.map((day) => (
            <Card key={day} className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {day}
              </h3>
              <div className="space-y-3">
                {timetableByDay[day] && timetableByDay[day].length > 0 ? (
                  timetableByDay[day]
                    .sort((a, b) => a.period - b.period)
                    .map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-lg border border-border bg-muted p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-foreground">
                              {entry.subject}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {entry.teacher}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {entry.startTime} - {entry.endTime}
                            </div>
                            {entry.room && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Room: {entry.room}
                              </p>
                            )}
                          </div>
                          <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                            P{entry.period}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No classes scheduled
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Timetable Entry</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEntry} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                Day *
              </label>
              <select
                value={timetableForm.dayOfWeek}
                onChange={(e) =>
                  setTimetableForm({
                    ...timetableForm,
                    dayOfWeek: e.target.value as any,
                  })
                }
                className="input-field mt-2"
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Period *
              </label>
              <Input
                required
                type="number"
                min="1"
                value={timetableForm.period}
                onChange={(e) =>
                  setTimetableForm({
                    ...timetableForm,
                    period: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Subject *
              </label>
              <Input
                required
                value={timetableForm.subject}
                onChange={(e) =>
                  setTimetableForm({ ...timetableForm, subject: e.target.value })
                }
                placeholder="e.g., Mathematics"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Teacher *
              </label>
              <Input
                required
                value={timetableForm.teacher}
                onChange={(e) =>
                  setTimetableForm({ ...timetableForm, teacher: e.target.value })
                }
                placeholder="Teacher name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Start Time *
                </label>
                <Input
                  required
                  type="time"
                  value={timetableForm.startTime}
                  onChange={(e) =>
                    setTimetableForm({
                      ...timetableForm,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  End Time *
                </label>
                <Input
                  required
                  type="time"
                  value={timetableForm.endTime}
                  onChange={(e) =>
                    setTimetableForm({
                      ...timetableForm,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Room
              </label>
              <Input
                value={timetableForm.room || ""}
                onChange={(e) =>
                  setTimetableForm({ ...timetableForm, room: e.target.value })
                }
                placeholder="e.g., A101"
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
                Add Entry
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
