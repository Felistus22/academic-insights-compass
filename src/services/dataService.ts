import { supabase } from "@/integrations/supabase/client";
import { Student, Teacher, Subject, Exam, Mark, ActivityLog } from "@/types";
import { subjects, students, teachers, exams, marks, activityLogs } from "@/data/mockData";

// Create a mockData object from the individual imports
const mockData = {
  subjects,
  students,
  teachers,
  exams,
  marks,
  activityLogs,
  teacherSubjects: [
    { teacherId: "teacher1", subjectId: "subj1" },
    { teacherId: "teacher1", subjectId: "subj3" },
    { teacherId: "teacher2", subjectId: "subj2" },
    { teacherId: "teacher2", subjectId: "subj6" },
  ]
};

export class DataService {
  static async migrateAllData() {
    try {
      console.log("Starting data migration...");
      
      // Insert subjects first (no dependencies)
      await this.insertSubjects();
      
      // Insert students (no dependencies)
      await this.insertStudents();
      
      // Insert teachers (no dependencies)  
      await this.insertTeachers();
      
      // Insert exams (depends on nothing)
      await this.insertExams();
      
      // Insert marks (depends on students, subjects, exams)
      await this.insertMarks();
      
      // Insert teacher subjects (depends on teachers, subjects)
      await this.insertTeacherSubjects();
      
      // Insert activity logs (depends on teachers)
      await this.insertActivityLogs();
      
      console.log("Data migration completed successfully!");
      return { success: true };
    } catch (error) {
      console.error("Migration failed:", error);
      return { success: false, error };
    }
  }

  private static async insertSubjects() {
    const { error } = await supabase
      .from('subjects')
      .insert(mockData.subjects);
    
    if (error) throw new Error(`Failed to insert subjects: ${error.message}`);
    console.log("Subjects migrated successfully");
  }

  private static async insertStudents() {
    const studentsData = mockData.students.map(student => ({
      id: student.id,
      first_name: student.firstName,
      last_name: student.lastName,
      admission_number: student.admissionNumber,
      form: student.form,
      stream: student.stream,
      guardian_name: student.guardianName,
      guardian_phone: student.guardianPhone,
      image_url: student.imageUrl
    }));

    const { error } = await supabase
      .from('students')
      .insert(studentsData);
    
    if (error) throw new Error(`Failed to insert students: ${error.message}`);
    console.log("Students migrated successfully");
  }

  private static async insertTeachers() {
    const teachersData = mockData.teachers.map(teacher => ({
      id: teacher.id,
      first_name: teacher.firstName,
      last_name: teacher.lastName,
      email: teacher.email,
      password_hash: teacher.passwordHash,
      role: teacher.role
    }));

    const { error } = await supabase
      .from('teachers')
      .insert(teachersData);
    
    if (error) throw new Error(`Failed to insert teachers: ${error.message}`);
    console.log("Teachers migrated successfully");
  }

  private static async insertExams() {
    const { error } = await supabase
      .from('exams')
      .insert(mockData.exams);
    
    if (error) throw new Error(`Failed to insert exams: ${error.message}`);
    console.log("Exams migrated successfully");
  }

  private static async insertMarks() {
    const marksData = mockData.marks.map(mark => ({
      id: mark.id,
      student_id: mark.studentId,
      subject_id: mark.subjectId,
      exam_id: mark.examId,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks
    }));

    const { error } = await supabase
      .from('marks')
      .insert(marksData);
    
    if (error) throw new Error(`Failed to insert marks: ${error.message}`);
    console.log("Marks migrated successfully");
  }

  private static async insertTeacherSubjects() {
    const teacherSubjectsData = mockData.teacherSubjects.map(ts => ({
      teacher_id: ts.teacherId,
      subject_id: ts.subjectId
    }));

    const { error } = await supabase
      .from('teacher_subjects')
      .insert(teacherSubjectsData);
    
    if (error) throw new Error(`Failed to insert teacher subjects: ${error.message}`);
    console.log("Teacher subjects migrated successfully");
  }

  private static async insertActivityLogs() {
    const activityLogsData = mockData.activityLogs.map(log => ({
      id: log.id,
      teacher_id: log.teacherId,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));

    const { error } = await supabase
      .from('activity_logs')
      .insert(activityLogsData);
    
    if (error) throw new Error(`Failed to insert activity logs: ${error.message}`);
    console.log("Activity logs migrated successfully");
  }

  // Data fetching methods
  static async fetchStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('form', { ascending: true })
      .order('admission_number', { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      return [];
    }

    return data.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      admissionNumber: student.admission_number,
      form: student.form,
      stream: student.stream as "A" | "B" | "C",
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      imageUrl: student.image_url
    }));
  }

  static async fetchTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        *,
        teacher_subjects (
          subject_id
        )
      `)
      .order('first_name', { ascending: true });

    if (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }

    return data.map(teacher => ({
      id: teacher.id,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      email: teacher.email,
      passwordHash: teacher.password_hash,
      role: teacher.role as 'teacher' | 'admin',
      subjectIds: teacher.teacher_subjects?.map((ts: any) => ts.subject_id) || []
    }));
  }

  static async fetchSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }

    return data || [];
  }

  static async fetchExams(): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('year', { ascending: false })
      .order('term', { ascending: false })
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching exams:", error);
      return [];
    }

    return data.map(exam => ({
      id: exam.id,
      name: exam.name,
      type: exam.type as "TermStart" | "MidTerm" | "EndTerm" | "Custom",
      term: exam.term as 1 | 2,
      year: exam.year,
      form: exam.form,
      date: exam.date
    }));
  }

  static async fetchMarks(): Promise<Mark[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*');

    if (error) {
      console.error("Error fetching marks:", error);
      return [];
    }

    return data.map(mark => ({
      id: mark.id,
      studentId: mark.student_id,
      subjectId: mark.subject_id,
      examId: mark.exam_id,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks
    }));
  }

  static async fetchActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error("Error fetching activity logs:", error);
      return [];
    }

    return data.map(log => ({
      id: log.id,
      teacherId: log.teacher_id,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));
  }

  // CRUD operations
  static async addStudent(student: Omit<Student, 'id'>): Promise<Student | null> {
    const studentData = {
      id: crypto.randomUUID(),
      first_name: student.firstName,
      last_name: student.lastName,
      admission_number: student.admissionNumber,
      form: student.form,
      stream: student.stream,
      guardian_name: student.guardianName,
      guardian_phone: student.guardianPhone,
      image_url: student.imageUrl
    };

    const { data, error } = await supabase
      .from('students')
      .insert(studentData)
      .select()
      .single();

    if (error) {
      console.error("Error adding student:", error);
      return null;
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      admissionNumber: data.admission_number,
      form: data.form,
      stream: data.stream as "A" | "B" | "C",
      guardianName: data.guardian_name,
      guardianPhone: data.guardian_phone,
      imageUrl: data.image_url
    };
  }

  static async updateStudent(id: string, student: Partial<Student>): Promise<boolean> {
    const updateData: any = {};
    
    if (student.firstName !== undefined) updateData.first_name = student.firstName;
    if (student.lastName !== undefined) updateData.last_name = student.lastName;
    if (student.admissionNumber !== undefined) updateData.admission_number = student.admissionNumber;
    if (student.form !== undefined) updateData.form = student.form;
    if (student.stream !== undefined) updateData.stream = student.stream;
    if (student.guardianName !== undefined) updateData.guardian_name = student.guardianName;
    if (student.guardianPhone !== undefined) updateData.guardian_phone = student.guardianPhone;
    if (student.imageUrl !== undefined) updateData.image_url = student.imageUrl;

    const { error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating student:", error);
      return false;
    }

    return true;
  }

  static async deleteStudent(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting student:", error);
      return false;
    }

    return true;
  }

  static async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher | null> {
    const teacherData = {
      id: crypto.randomUUID(),
      first_name: teacher.firstName,
      last_name: teacher.lastName,
      email: teacher.email,
      password_hash: teacher.passwordHash,
      role: teacher.role
    };

    const { data, error } = await supabase
      .from('teachers')
      .insert(teacherData)
      .select()
      .single();

    if (error) {
      console.error("Error adding teacher:", error);
      return null;
    }

    // Handle teacher subjects
    if (teacher.subjectIds && teacher.subjectIds.length > 0) {
      const teacherSubjectsData = teacher.subjectIds.map(subjectId => ({
        teacher_id: data.id,
        subject_id: subjectId
      }));

      const { error: subjectError } = await supabase
        .from('teacher_subjects')
        .insert(teacherSubjectsData);

      if (subjectError) {
        console.error("Error adding teacher subjects:", subjectError);
      }
    }

    return {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      passwordHash: data.password_hash,
      role: data.role as 'teacher' | 'admin',
      subjectIds: teacher.subjectIds || []
    };
  }

  static async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<boolean> {
    const updateData: any = {};
    
    if (teacher.firstName !== undefined) updateData.first_name = teacher.firstName;
    if (teacher.lastName !== undefined) updateData.last_name = teacher.lastName;
    if (teacher.email !== undefined) updateData.email = teacher.email;
    if (teacher.passwordHash !== undefined) updateData.password_hash = teacher.passwordHash;
    if (teacher.role !== undefined) updateData.role = teacher.role;

    const { error } = await supabase
      .from('teachers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating teacher:", error);
      return false;
    }

    // Handle teacher subjects update
    if (teacher.subjectIds !== undefined) {
      // Delete existing teacher subjects
      await supabase
        .from('teacher_subjects')
        .delete()
        .eq('teacher_id', id);

      // Insert new teacher subjects
      if (teacher.subjectIds.length > 0) {
        const teacherSubjectsData = teacher.subjectIds.map(subjectId => ({
          teacher_id: id,
          subject_id: subjectId
        }));

        const { error: subjectError } = await supabase
          .from('teacher_subjects')
          .insert(teacherSubjectsData);

        if (subjectError) {
          console.error("Error updating teacher subjects:", subjectError);
        }
      }
    }

    return true;
  }

  static async deleteTeacher(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting teacher:", error);
      return false;
    }

    return true;
  }
}
