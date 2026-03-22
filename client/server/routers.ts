import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import * as db from "./db";

// Validation schemas
const studentSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required"),
  classLevel: z.string().min(1, "Class is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  parentName: z.string().optional().nullable(),
  parentPhone: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

const attendanceSchema = z.object({
  studentId: z.number(),
  attendanceDate: z.string(),
  status: z.enum(["present", "absent", "leave"]),
  remarks: z.string().optional().nullable(),
});

const examSchema = z.object({
  examName: z.string().min(1, "Exam name is required"),
  examType: z.enum(["midterm", "final", "quiz", "practical"]),
  classLevel: z.string().min(1, "Class is required"),
  examDate: z.string(),
  totalMarks: z.number().default(100),
  passingMarks: z.number().default(40),
});

const gradeSchema = z.object({
  studentId: z.number(),
  examId: z.number(),
  subject: z.string().min(1, "Subject is required"),
  marksObtained: z.number(),
  grade: z.string().optional().nullable(),
  percentage: z.number().optional().nullable(),
});

const feeSchema = z.object({
  studentId: z.number(),
  feeType: z.string().min(1, "Fee type is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  dueDate: z.string(),
  paymentMethod: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

const timetableSchema = z.object({
  classLevel: z.string().min(1, "Class is required"),
  dayOfWeek: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]),
  period: z.number(),
  subject: z.string().min(1, "Subject is required"),
  teacher: z.string().min(1, "Teacher is required"),
  startTime: z.string(),
  endTime: z.string(),
  room: z.string().optional().nullable(),
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard
  dashboard: router({
    getStats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),
  }),

  // Student Management
  students: router({
    list: protectedProcedure.query(async () => {
      return db.getAllStudents();
    }),

    getById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
      return db.getStudentById(input.id);
    }),

    getByClass: protectedProcedure
      .input(z.object({ classLevel: z.string() }))
      .query(async ({ input }) => {
        return db.getStudentsByClass(input.classLevel);
      }),

    create: protectedProcedure.input(studentSchema).mutation(async ({ input }) => {
      const data = { ...input } as any;
      if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
        data.dateOfBirth = new Date(data.dateOfBirth);
      }
      return db.createStudent({
        ...data,
        enrollmentDate: new Date(),
      });
    }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          data: studentSchema.partial(),
        })
      )
      .mutation(async ({ input }) => {
        const data = { ...input.data } as any;
        if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
          data.dateOfBirth = new Date(data.dateOfBirth);
        }
        return db.updateStudent(input.id, data);
      }),

    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
      return db.deleteStudent(input.id);
    }),
  }),

  // Attendance
  attendance: router({
    getByStudent: protectedProcedure
      .input(
        z.object({
          studentId: z.number(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        const startDate = input.startDate ? new Date(input.startDate) : undefined;
        const endDate = input.endDate ? new Date(input.endDate) : undefined;
        return db.getAttendanceByStudent(input.studentId, startDate, endDate);
      }),

    mark: protectedProcedure.input(attendanceSchema).mutation(async ({ input }) => {
      return db.markAttendance({
        ...input,
        attendanceDate: new Date(input.attendanceDate),
      });
    }),

    getPercentage: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return db.getAttendancePercentage(input.studentId);
      }),
  }),

  // Exams
  exams: router({
    list: protectedProcedure.query(async () => {
      return db.getAllExams();
    }),

    getByClass: protectedProcedure
      .input(z.object({ classLevel: z.string() }))
      .query(async ({ input }) => {
        return db.getExamsByClass(input.classLevel);
      }),

    create: protectedProcedure.input(examSchema).mutation(async ({ input }) => {
      return db.createExam({
        ...input,
        examDate: new Date(input.examDate),
      });
    }),
  }),

  // Grades
  grades: router({
    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return db.getGradesByStudent(input.studentId);
      }),

    getByExam: protectedProcedure
      .input(z.object({ examId: z.number() }))
      .query(async ({ input }) => {
        return db.getGradesByExam(input.examId);
      }),

    add: protectedProcedure.input(gradeSchema).mutation(async ({ input }) => {
      return db.addGrades({
        ...input,
        marksObtained: input.marksObtained.toString() as any,
        percentage: input.percentage ? input.percentage.toString() as any : undefined,
      });
    }),

    addBulk: protectedProcedure
      .input(z.array(gradeSchema))
      .mutation(async ({ input }) => {
        const results = [];
        for (const grade of input) {
          const result = await db.addGrades({
            ...grade,
            marksObtained: grade.marksObtained.toString() as any,
            percentage: grade.percentage ? grade.percentage.toString() as any : undefined,
          });
          results.push(result);
        }
        return results;
      }),
  }),

  // Fees
  fees: router({
    getByStudent: protectedProcedure
      .input(z.object({ studentId: z.number() }))
      .query(async ({ input }) => {
        return db.getFeesByStudent(input.studentId);
      }),

    getPending: protectedProcedure.query(async () => {
      return db.getPendingFees();
    }),

    create: protectedProcedure.input(feeSchema).mutation(async ({ input }) => {
      return db.createFee({
        ...input,
        amount: input.amount.toString() as any,
        dueDate: new Date(input.dueDate),
        status: "pending",
      });
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          feeId: z.number(),
          status: z.enum(["pending", "paid", "overdue"]),
          paidDate: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return db.updateFeeStatus(
          input.feeId,
          input.status,
          input.paidDate ? new Date(input.paidDate) : undefined
        );
      }),
  }),

  // Timetable
  timetable: router({
    getByClass: protectedProcedure
      .input(z.object({ classLevel: z.string() }))
      .query(async ({ input }) => {
        return db.getTimetableByClass(input.classLevel);
      }),

    create: protectedProcedure.input(timetableSchema).mutation(async ({ input }) => {
      return db.createTimetableEntry(input);
    }),
  }),

  // Subjects
  subjects: router({
    list: protectedProcedure.query(async () => {
      return db.getAllSubjects();
    }),
  }),

  // Teachers
  teachers: router({
    list: protectedProcedure.query(async () => {
      return db.getAllTeachers();
    }),
  }),

  // Classes
  classes: router({
    list: protectedProcedure.query(async () => {
      return db.getAllClasses();
    }),
  }),
});

export type AppRouter = typeof appRouter;
