import Dexie, { Table } from 'dexie';
import { Student, Teacher, Subject, Exam, Mark, ActivityLog } from '@/types';

// Offline data interfaces with sync metadata
export interface OfflineStudent extends Student {
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
  operation: 'create' | 'update' | 'delete';
}

export interface OfflineTeacher extends Teacher {
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
  operation: 'create' | 'update' | 'delete';
}

export interface OfflineMark extends Mark {
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
  operation: 'create' | 'update' | 'delete';
}

export interface OfflineExam extends Exam {
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
  operation: 'create' | 'update' | 'delete';
}

export interface OfflineActivityLog extends ActivityLog {
  syncStatus: 'pending' | 'synced' | 'failed';
  lastModified: Date;
  operation: 'create' | 'update' | 'delete';
}

// Dexie database class
export class OfflineDatabase extends Dexie {
  students!: Table<OfflineStudent>;
  teachers!: Table<OfflineTeacher>;
  subjects!: Table<Subject>;
  exams!: Table<OfflineExam>;
  marks!: Table<OfflineMark>;
  activityLogs!: Table<OfflineActivityLog>;

  constructor() {
    super('SchoolManagementDB');
    
    this.version(1).stores({
      students: 'id, syncStatus, lastModified, operation, admissionNumber, form, stream',
      teachers: 'id, syncStatus, lastModified, operation, email, role',
      subjects: 'id, name, code',
      exams: 'id, syncStatus, lastModified, operation, year, term, form, type',
      marks: 'id, syncStatus, lastModified, operation, studentId, subjectId, examId',
      activityLogs: 'id, syncStatus, lastModified, operation, teacherId, timestamp'
    });
  }
}

export const db = new OfflineDatabase();

// Offline storage service
export class OfflineStorageService {
  // Student operations
  static async addStudentOffline(student: Omit<Student, 'id'>): Promise<OfflineStudent> {
    const offlineStudent: OfflineStudent = {
      ...student,
      id: crypto.randomUUID(),
      syncStatus: 'pending',
      lastModified: new Date(),
      operation: 'create'
    };
    
    await db.students.add(offlineStudent);
    return offlineStudent;
  }

  static async updateStudentOffline(id: string, updates: Partial<Student>): Promise<void> {
    const existing = await db.students.get(id);
    if (existing) {
      await db.students.update(id, {
        ...updates,
        syncStatus: 'pending',
        lastModified: new Date(),
        operation: existing.operation === 'create' ? 'create' : 'update'
      });
    }
  }

  static async deleteStudentOffline(id: string): Promise<void> {
    const existing = await db.students.get(id);
    if (existing?.operation === 'create') {
      // If it was created offline and never synced, just remove it
      await db.students.delete(id);
    } else {
      // Mark for deletion
      await db.students.update(id, {
        syncStatus: 'pending',
        lastModified: new Date(),
        operation: 'delete'
      });
    }
  }

  // Teacher operations
  static async addTeacherOffline(teacher: Omit<Teacher, 'id'>): Promise<OfflineTeacher> {
    const offlineTeacher: OfflineTeacher = {
      ...teacher,
      id: crypto.randomUUID(),
      syncStatus: 'pending',
      lastModified: new Date(),
      operation: 'create'
    };
    
    await db.teachers.add(offlineTeacher);
    return offlineTeacher;
  }

  static async updateTeacherOffline(id: string, updates: Partial<Teacher>): Promise<void> {
    const existing = await db.teachers.get(id);
    if (existing) {
      await db.teachers.update(id, {
        ...updates,
        syncStatus: 'pending',
        lastModified: new Date(),
        operation: existing.operation === 'create' ? 'create' : 'update'
      });
    }
  }

  static async deleteTeacherOffline(id: string): Promise<void> {
    const existing = await db.teachers.get(id);
    if (existing?.operation === 'create') {
      await db.teachers.delete(id);
    } else {
      await db.teachers.update(id, {
        syncStatus: 'pending',
        lastModified: new Date(),
        operation: 'delete'
      });
    }
  }

  // Mark operations
  static async addMarkOffline(mark: Omit<Mark, 'id'>): Promise<OfflineMark> {
    const offlineMark: OfflineMark = {
      ...mark,
      id: crypto.randomUUID(),
      syncStatus: 'pending',
      lastModified: new Date(),
      operation: 'create'
    };
    
    await db.marks.add(offlineMark);
    return offlineMark;
  }

  static async updateMarkOffline(mark: Mark): Promise<void> {
    const existing = await db.marks.get(mark.id);
    await db.marks.update(mark.id, {
      ...mark,
      syncStatus: 'pending',
      lastModified: new Date(),
      operation: existing?.operation === 'create' ? 'create' : 'update'
    });
  }

  static async deleteMarkOffline(id: string): Promise<void> {
    const existing = await db.marks.get(id);
    if (existing?.operation === 'create') {
      await db.marks.delete(id);
    } else {
      await db.marks.update(id, {
        syncStatus: 'pending',
        lastModified: new Date(),
        operation: 'delete'
      });
    }
  }

  // Exam operations
  static async addExamOffline(exam: Omit<Exam, 'id'>): Promise<OfflineExam> {
    const offlineExam: OfflineExam = {
      ...exam,
      id: crypto.randomUUID(),
      syncStatus: 'pending',
      lastModified: new Date(),
      operation: 'create'
    };
    
    await db.exams.add(offlineExam);
    return offlineExam;
  }

  // Get pending sync data
  static async getPendingStudents(): Promise<OfflineStudent[]> {
    return await db.students.where('syncStatus').equals('pending').toArray();
  }

  static async getPendingTeachers(): Promise<OfflineTeacher[]> {
    return await db.teachers.where('syncStatus').equals('pending').toArray();
  }

  static async getPendingMarks(): Promise<OfflineMark[]> {
    return await db.marks.where('syncStatus').equals('pending').toArray();
  }

  static async getPendingExams(): Promise<OfflineExam[]> {
    return await db.exams.where('syncStatus').equals('pending').toArray();
  }

  // Mark as synced
  static async markStudentSynced(id: string): Promise<void> {
    await db.students.update(id, { syncStatus: 'synced' });
  }

  static async markTeacherSynced(id: string): Promise<void> {
    await db.teachers.update(id, { syncStatus: 'synced' });
  }

  static async markMarkSynced(id: string): Promise<void> {
    await db.marks.update(id, { syncStatus: 'synced' });
  }

  static async markExamSynced(id: string): Promise<void> {
    await db.exams.update(id, { syncStatus: 'synced' });
  }

  // Mark as failed
  static async markStudentSyncFailed(id: string): Promise<void> {
    await db.students.update(id, { syncStatus: 'failed' });
  }

  static async markTeacherSyncFailed(id: string): Promise<void> {
    await db.teachers.update(id, { syncStatus: 'failed' });
  }

  static async markMarkSyncFailed(id: string): Promise<void> {
    await db.marks.update(id, { syncStatus: 'failed' });
  }

  static async markExamSyncFailed(id: string): Promise<void> {
    await db.exams.update(id, { syncStatus: 'failed' });
  }

  // Cache online data for offline access
  static async cacheOnlineData(data: {
    students: Student[];
    teachers: Teacher[];
    subjects: Subject[];
    exams: Exam[];
    marks: Mark[];
    activityLogs: ActivityLog[];
  }): Promise<void> {
    // Cache all data for offline access
    await db.subjects.clear();
    await db.subjects.bulkAdd(data.subjects);

    // Clear and cache students as synced offline data
    await db.students.clear();
    const offlineStudents = data.students.map(student => ({
      ...student,
      syncStatus: 'synced' as const,
      lastModified: new Date(),
      operation: 'create' as const
    }));
    await db.students.bulkAdd(offlineStudents);

    // Clear and cache teachers as synced offline data
    await db.teachers.clear();
    const offlineTeachers = data.teachers.map(teacher => ({
      ...teacher,
      syncStatus: 'synced' as const,
      lastModified: new Date(),
      operation: 'create' as const
    }));
    await db.teachers.bulkAdd(offlineTeachers);

    // Clear and cache exams as synced offline data
    await db.exams.clear();
    const offlineExams = data.exams.map(exam => ({
      ...exam,
      syncStatus: 'synced' as const,
      lastModified: new Date(),
      operation: 'create' as const
    }));
    await db.exams.bulkAdd(offlineExams);

    // Clear and cache marks as synced offline data
    await db.marks.clear();
    const offlineMarks = data.marks.map(mark => ({
      ...mark,
      syncStatus: 'synced' as const,
      lastModified: new Date(),
      operation: 'create' as const
    }));
    await db.marks.bulkAdd(offlineMarks);
  }

  // Clear all offline data
  static async clearAllData(): Promise<void> {
    await Promise.all([
      db.students.clear(),
      db.teachers.clear(),
      db.subjects.clear(),
      db.exams.clear(),
      db.marks.clear(),
      db.activityLogs.clear()
    ]);
  }

  // Get all data for display (combines cached and offline data)
  static async getAllStudents(): Promise<Student[]> {
    const offlineStudents = await db.students.where('operation').notEqual('delete').toArray();
    return offlineStudents.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      form: student.form,
      stream: student.stream,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      imageUrl: student.imageUrl
    }));
  }

  static async getAllTeachers(): Promise<Teacher[]> {
    const offlineTeachers = await db.teachers.where('operation').notEqual('delete').toArray();
    return offlineTeachers.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      passwordHash: teacher.passwordHash,
      role: teacher.role,
      subjectIds: teacher.subjectIds
    }));
  }

  static async getAllSubjects(): Promise<Subject[]> {
    return await db.subjects.toArray();
  }

  static async getAllExams(): Promise<Exam[]> {
    const offlineExams = await db.exams.where('operation').notEqual('delete').toArray();
    return offlineExams.map(exam => ({
      id: exam.id,
      name: exam.name,
      type: exam.type,
      term: exam.term,
      year: exam.year,
      form: exam.form,
      date: exam.date
    }));
  }

  static async getAllMarks(): Promise<Mark[]> {
    const offlineMarks = await db.marks.where('operation').notEqual('delete').toArray();
    return offlineMarks.map(mark => ({
      id: mark.id,
      studentId: mark.studentId,
      subjectId: mark.subjectId,
      examId: mark.examId,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks
    }));
  }
}