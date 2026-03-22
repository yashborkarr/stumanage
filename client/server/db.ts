import { eq, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  students,
  attendance,
  exams,
  grades,
  fees,
  timetable,
  subjects,
  teachers,
  classes,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `user-${user.openId}@stumanage.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle email separately since it's required
    if (user.email) {
      values.email = user.email;
      updateSet.email = user.email;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Student queries
export async function getAllStudents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).orderBy(students.name);
}

export async function getStudentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(students).where(eq(students.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStudentsByClass(classLevel: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(students).where(eq(students.classLevel, classLevel));
}

export async function createStudent(data: typeof students.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(students).values(data);
  return result;
}

export async function updateStudent(id: number, data: Partial<typeof students.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(students).set(data).where(eq(students.id, id));
}

export async function deleteStudent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(students).where(eq(students.id, id));
}

// Attendance queries
export async function getAttendanceByStudent(studentId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) return [];

  if (startDate && endDate) {
    return db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, studentId),
          gte(attendance.attendanceDate, startDate),
          lte(attendance.attendanceDate, endDate)
        )
      );
  }

  return db.select().from(attendance).where(eq(attendance.studentId, studentId));
}

export async function markAttendance(data: typeof attendance.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(attendance).values(data);
}

export async function getAttendancePercentage(studentId: number) {
  const db = await getDb();
  if (!db) return 0;

  const records = await db
    .select()
    .from(attendance)
    .where(eq(attendance.studentId, studentId));

  if (records.length === 0) return 0;

  const presentCount = records.filter((r) => r.status === "present").length;
  return Math.round((presentCount / records.length) * 100);
}

// Exam queries
export async function getAllExams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exams).orderBy(exams.examDate);
}

export async function getExamsByClass(classLevel: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(exams).where(eq(exams.classLevel, classLevel));
}

export async function createExam(data: typeof exams.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(exams).values(data);
}

// Grade queries
export async function getGradesByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(grades).where(eq(grades.studentId, studentId));
}

export async function getGradesByExam(examId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(grades).where(eq(grades.examId, examId));
}

export async function addGrades(data: typeof grades.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(grades).values(data);
}

// Fee queries
export async function getFeesByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fees).where(eq(fees.studentId, studentId));
}

export async function getPendingFees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fees).where(eq(fees.status, "pending"));
}

export async function createFee(data: typeof fees.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(fees).values(data);
}

export async function updateFeeStatus(feeId: number, status: string, paidDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db
    .update(fees)
    .set({ status: status as any, paidDate })
    .where(eq(fees.id, feeId));
}

// Timetable queries
export async function getTimetableByClass(classLevel: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(timetable)
    .where(eq(timetable.classLevel, classLevel))
    .orderBy(timetable.dayOfWeek, timetable.period);
}

export async function createTimetableEntry(data: typeof timetable.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(timetable).values(data);
}

// Subject queries
export async function getAllSubjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subjects);
}

// Teacher queries
export async function getAllTeachers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teachers);
}

// Class queries
export async function getAllClasses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(classes);
}

export async function getClassByName(name: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(classes).where(eq(classes.name, name)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Dashboard statistics
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const totalStudents = await db.select().from(students);
  const totalFees = await db.select().from(fees);
  const totalExams = await db.select().from(exams);

  const paidFees = totalFees.filter((f) => f.status === "paid");
  const pendingFees = totalFees.filter((f) => f.status === "pending");

  return {
    totalStudents: totalStudents.length,
    totalFees: totalFees.length,
    paidFeesCount: paidFees.length,
    pendingFeesCount: pendingFees.length,
    totalExams: totalExams.length,
    paidFeesAmount: paidFees.reduce((sum, f) => sum + parseFloat(f.amount.toString()), 0),
  };
}
