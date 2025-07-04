import { DataService } from './dataService';
import { OfflineStorageService } from './offlineStorage';
import { toast } from 'sonner';

export class SyncService {
  private static isSyncing = false;

  static async syncAllData(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return { success: true, synced: 0, failed: 0 };
    }

    this.isSyncing = true;
    let totalSynced = 0;
    let totalFailed = 0;

    try {
      console.log('Starting offline data sync...');
      toast.info('Syncing offline data...');

      // Sync students
      const studentsResult = await this.syncStudents();
      totalSynced += studentsResult.synced;
      totalFailed += studentsResult.failed;

      // Sync teachers
      const teachersResult = await this.syncTeachers();
      totalSynced += teachersResult.synced;
      totalFailed += teachersResult.failed;

      // Sync exams
      const examsResult = await this.syncExams();
      totalSynced += examsResult.synced;
      totalFailed += examsResult.failed;

      // Sync marks
      const marksResult = await this.syncMarks();
      totalSynced += marksResult.synced;
      totalFailed += marksResult.failed;

      if (totalSynced > 0) {
        toast.success(`Successfully synced ${totalSynced} item(s)`);
      }
      
      if (totalFailed > 0) {
        toast.error(`Failed to sync ${totalFailed} item(s)`);
      }

      if (totalSynced === 0 && totalFailed === 0) {
        console.log('No offline data to sync');
      }

      return { success: totalFailed === 0, synced: totalSynced, failed: totalFailed };
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Sync failed unexpectedly');
      return { success: false, synced: totalSynced, failed: totalFailed + 1 };
    } finally {
      this.isSyncing = false;
    }
  }

  private static async syncStudents(): Promise<{ synced: number; failed: number }> {
    const pendingStudents = await OfflineStorageService.getPendingStudents();
    let synced = 0;
    let failed = 0;

    for (const student of pendingStudents) {
      try {
        if (student.operation === 'create') {
          const { id, syncStatus, lastModified, operation, ...studentData } = student;
          const newStudent = await DataService.addStudent(studentData);
          if (newStudent) {
            await OfflineStorageService.markStudentSynced(student.id);
            synced++;
          } else {
            await OfflineStorageService.markStudentSyncFailed(student.id);
            failed++;
          }
        } else if (student.operation === 'update') {
          const { syncStatus, lastModified, operation, ...studentData } = student;
          const success = await DataService.updateStudent(student.id, studentData);
          if (success) {
            await OfflineStorageService.markStudentSynced(student.id);
            synced++;
          } else {
            await OfflineStorageService.markStudentSyncFailed(student.id);
            failed++;
          }
        } else if (student.operation === 'delete') {
          const success = await DataService.deleteStudent(student.id);
          if (success) {
            await OfflineStorageService.markStudentSynced(student.id);
            synced++;
          } else {
            await OfflineStorageService.markStudentSyncFailed(student.id);
            failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync student ${student.id}:`, error);
        await OfflineStorageService.markStudentSyncFailed(student.id);
        failed++;
      }
    }

    return { synced, failed };
  }

  private static async syncTeachers(): Promise<{ synced: number; failed: number }> {
    const pendingTeachers = await OfflineStorageService.getPendingTeachers();
    let synced = 0;
    let failed = 0;

    for (const teacher of pendingTeachers) {
      try {
        if (teacher.operation === 'create') {
          const { id, syncStatus, lastModified, operation, ...teacherData } = teacher;
          const newTeacher = await DataService.addTeacher(teacherData);
          if (newTeacher) {
            await OfflineStorageService.markTeacherSynced(teacher.id);
            synced++;
          } else {
            await OfflineStorageService.markTeacherSyncFailed(teacher.id);
            failed++;
          }
        } else if (teacher.operation === 'update') {
          const { syncStatus, lastModified, operation, ...teacherData } = teacher;
          const success = await DataService.updateTeacher(teacher.id, teacherData);
          if (success) {
            await OfflineStorageService.markTeacherSynced(teacher.id);
            synced++;
          } else {
            await OfflineStorageService.markTeacherSyncFailed(teacher.id);
            failed++;
          }
        } else if (teacher.operation === 'delete') {
          const success = await DataService.deleteTeacher(teacher.id);
          if (success) {
            await OfflineStorageService.markTeacherSynced(teacher.id);
            synced++;
          } else {
            await OfflineStorageService.markTeacherSyncFailed(teacher.id);
            failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync teacher ${teacher.id}:`, error);
        await OfflineStorageService.markTeacherSyncFailed(teacher.id);
        failed++;
      }
    }

    return { synced, failed };
  }

  private static async syncExams(): Promise<{ synced: number; failed: number }> {
    const pendingExams = await OfflineStorageService.getPendingExams();
    let synced = 0;
    let failed = 0;

    for (const exam of pendingExams) {
      try {
        if (exam.operation === 'create') {
          const { id, syncStatus, lastModified, operation, ...examData } = exam;
          const newExam = await DataService.addExam(examData);
          if (newExam) {
            await OfflineStorageService.markExamSynced(exam.id);
            synced++;
          } else {
            await OfflineStorageService.markExamSyncFailed(exam.id);
            failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync exam ${exam.id}:`, error);
        await OfflineStorageService.markExamSyncFailed(exam.id);
        failed++;
      }
    }

    return { synced, failed };
  }

  private static async syncMarks(): Promise<{ synced: number; failed: number }> {
    const pendingMarks = await OfflineStorageService.getPendingMarks();
    let synced = 0;
    let failed = 0;

    for (const mark of pendingMarks) {
      try {
        if (mark.operation === 'create') {
          const { id, syncStatus, lastModified, operation, ...markData } = mark;
          const newMark = await DataService.addMark(markData);
          if (newMark) {
            await OfflineStorageService.markMarkSynced(mark.id);
            synced++;
          } else {
            await OfflineStorageService.markMarkSyncFailed(mark.id);
            failed++;
          }
        } else if (mark.operation === 'update') {
          const { syncStatus, lastModified, operation, ...markData } = mark;
          const success = await DataService.updateMark(mark.id, markData);
          if (success) {
            await OfflineStorageService.markMarkSynced(mark.id);
            synced++;
          } else {
            await OfflineStorageService.markMarkSyncFailed(mark.id);
            failed++;
          }
        } else if (mark.operation === 'delete') {
          const success = await DataService.deleteMark(mark.id);
          if (success) {
            await OfflineStorageService.markMarkSynced(mark.id);
            synced++;
          } else {
            await OfflineStorageService.markMarkSyncFailed(mark.id);
            failed++;
          }
        }
      } catch (error) {
        console.error(`Failed to sync mark ${mark.id}:`, error);
        await OfflineStorageService.markMarkSyncFailed(mark.id);
        failed++;
      }
    }

    return { synced, failed };
  }
}