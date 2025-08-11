
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
      
      // Force migration by clearing existing data first (if any)
      await this.clearExistingData();
      
      // Insert data in correct order (considering dependencies)
      console.log("Inserting subjects...");
      await this.insertSubjects();
      
      console.log("Inserting students...");
      await this.insertStudents();
      
      console.log("Inserting teachers...");
      await this.insertTeachers();
      
      console.log("Inserting exams...");
      await this.insertExams();
      
      console.log("Inserting marks...");
      await this.insertMarks();
      
      console.log("Inserting teacher subjects...");
      await this.insertTeacherSubjects();
      
      console.log("Inserting activity logs...");
      await this.insertActivityLogs();
      
      console.log("Data migration completed successfully!");
      return { success: true };
    } catch (error) {
      console.error("Migration failed:", error);
      return { success: false, error };
    }
  }

  private static async clearExistingData() {
    try {
      // Delete in reverse order to respect foreign key constraints
      await supabase.from('activity_logs').delete().neq('id', '');
      await supabase.from('marks').delete().neq('id', '');
      await supabase.from('exams').delete().neq('id', '');
      await supabase.from('teachers').delete().neq('id', '');
      await supabase.from('students').delete().neq('id', '');
      await supabase.from('subjects').delete().neq('id', '');
      
      console.log("Cleared existing data");
    } catch (error) {
      console.log("No existing data to clear or error clearing:", error);
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
      firstname: student.firstName,
      lastname: student.lastName,
      admissionnumber: student.admissionNumber,
      form: student.form,
      stream: student.stream,
      guardianname: student.guardianName,
      guardianphone: student.guardianPhone,
      imageurl: student.imageUrl
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
      firstname: teacher.firstName,
      lastname: teacher.lastName,
      email: teacher.email,
      password: teacher.passwordHash,
      role: teacher.role,
      subjectids: teacher.subjectIds
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
      studentid: mark.studentId,
      subjectid: mark.subjectId,
      examid: mark.examId,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks
    }));

    // Insert marks in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < marksData.length; i += batchSize) {
      const batch = marksData.slice(i, i + batchSize);
      const { error } = await supabase
        .from('marks')
        .insert(batch);
      
      if (error) throw new Error(`Failed to insert marks batch ${Math.floor(i/batchSize) + 1}: ${error.message}`);
    }
    
    console.log("Marks migrated successfully");
  }

  private static async insertTeacherSubjects() {
    // Skip teacher subjects as this table doesn't exist in our schema
    // Subject assignments are stored in the teachers table's subjectids array
    console.log("Teacher subjects handled in teachers table");
  }

  private static async insertActivityLogs() {
    const activityLogsData = mockData.activityLogs.map(log => ({
      id: log.id,
      teacherid: log.teacherId,
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
      .order('admissionnumber', { ascending: true });

    if (error) {
      console.error("Error fetching students:", error);
      return [];
    }

    return data.map(student => ({
      id: student.id,
      firstName: student.firstname,
      lastName: student.lastname,
      admissionNumber: student.admissionnumber,
      form: student.form,
      stream: student.stream as "A" | "B" | "C",
      guardianName: student.guardianname,
      guardianPhone: student.guardianphone,
      imageUrl: student.imageurl
    }));
  }

  static async fetchTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('firstname', { ascending: true });

    if (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }

    return data.map(teacher => ({
      id: teacher.id,
      firstName: teacher.firstname,
      lastName: teacher.lastname,
      email: teacher.email,
      passwordHash: teacher.password,
      role: teacher.role as 'teacher' | 'admin',
      subjectIds: teacher.subjectids || []
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
      studentId: mark.studentid,
      subjectId: mark.subjectid,
      examId: mark.examid,
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
      teacherId: log.teacherid,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));
  }

  // CRUD operations
  static async addStudent(student: Omit<Student, 'id'>): Promise<Student | null> {
    const studentData = {
      id: crypto.randomUUID(),
      firstname: student.firstName,
      lastname: student.lastName,
      admissionnumber: student.admissionNumber,
      form: student.form,
      stream: student.stream,
      guardianname: student.guardianName,
      guardianphone: student.guardianPhone,
      imageurl: student.imageUrl
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
      firstName: data.firstname,
      lastName: data.lastname,
      admissionNumber: data.admissionnumber,
      form: data.form,
      stream: data.stream as "A" | "B" | "C",
      guardianName: data.guardianname,
      guardianPhone: data.guardianphone,
      imageUrl: data.imageurl
    };
  }

  static async updateStudent(id: string, student: Partial<Student>): Promise<boolean> {
    const updateData: any = {};
    
    if (student.firstName !== undefined) updateData.firstname = student.firstName;
    if (student.lastName !== undefined) updateData.lastname = student.lastName;
    if (student.admissionNumber !== undefined) updateData.admissionnumber = student.admissionNumber;
    if (student.form !== undefined) updateData.form = student.form;
    if (student.stream !== undefined) updateData.stream = student.stream;
    if (student.guardianName !== undefined) updateData.guardianname = student.guardianName;
    if (student.guardianPhone !== undefined) updateData.guardianphone = student.guardianPhone;
    if (student.imageUrl !== undefined) updateData.imageurl = student.imageUrl;

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
      firstname: teacher.firstName,
      lastname: teacher.lastName,
      email: teacher.email,
      password: teacher.passwordHash,
      role: teacher.role,
      subjectids: teacher.subjectIds
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

    return {
      id: data.id,
      firstName: data.firstname,
      lastName: data.lastname,
      email: data.email,
      passwordHash: data.password,
      role: data.role as 'teacher' | 'admin',
      subjectIds: teacher.subjectIds || []
    };
  }

  static async updateTeacher(id: string, teacher: Partial<Teacher>): Promise<boolean> {
    const updateData: any = {};
    
    if (teacher.firstName !== undefined) updateData.firstname = teacher.firstName;
    if (teacher.lastName !== undefined) updateData.lastname = teacher.lastName;
    if (teacher.email !== undefined) updateData.email = teacher.email;
    if (teacher.passwordHash !== undefined) updateData.password = teacher.passwordHash;
    if (teacher.role !== undefined) updateData.role = teacher.role;
    if (teacher.subjectIds !== undefined) updateData.subjectids = teacher.subjectIds;

    const { error } = await supabase
      .from('teachers')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating teacher:", error);
      return false;
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

  // Mark management methods
  static async addMark(mark: Omit<Mark, 'id'>): Promise<Mark | null> {
    const markData = {
      id: crypto.randomUUID(),
      studentid: mark.studentId,
      subjectid: mark.subjectId,
      examid: mark.examId,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks
    };

    const { data, error } = await supabase
      .from('marks')
      .insert(markData)
      .select()
      .single();

    if (error) {
      console.error("Error adding mark:", error);
      return null;
    }

    return {
      id: data.id,
      studentId: data.studentid,
      subjectId: data.subjectid,
      examId: data.examid,
      score: data.score,
      grade: data.grade,
      remarks: data.remarks
    };
  }

  static async updateMark(id: string, mark: Partial<Mark>): Promise<boolean> {
    const updateData: any = {};
    
    if (mark.studentId !== undefined) updateData.studentid = mark.studentId;
    if (mark.subjectId !== undefined) updateData.subjectid = mark.subjectId;
    if (mark.examId !== undefined) updateData.examid = mark.examId;
    if (mark.score !== undefined) updateData.score = mark.score;
    if (mark.grade !== undefined) updateData.grade = mark.grade;
    if (mark.remarks !== undefined) updateData.remarks = mark.remarks;

    const { error } = await supabase
      .from('marks')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error("Error updating mark:", error);
      return false;
    }

    return true;
  }

  static async deleteMark(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('marks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting mark:", error);
      return false;
    }

    return true;
  }

  // Exam management methods
  static async addExam(exam: Omit<Exam, 'id'>): Promise<Exam | null> {
    const examData = {
      id: crypto.randomUUID(),
      name: exam.name,
      type: exam.type,
      term: exam.term,
      year: exam.year,
      form: exam.form,
      date: exam.date
    };

    const { data, error } = await supabase
      .from('exams')
      .insert(examData)
      .select()
      .single();

    if (error) {
      console.error("Error adding exam:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type as "TermStart" | "MidTerm" | "EndTerm" | "Custom",
      term: data.term as 1 | 2,
      year: data.year,
      form: data.form,
      date: data.date
    };
  }
}
