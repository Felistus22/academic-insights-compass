
import { supabase } from "@/integrations/supabase/client";
import { Student, Teacher, Subject, Exam, Mark, ActivityLog } from "@/types";

// Utility function to ensure type compliance
const ensureValidEnum = <T extends string>(value: string, validValues: readonly T[], defaultValue: T): T => {
  return validValues.includes(value as T) ? (value as T) : defaultValue;
};

export class DataService {
  // Fetch all students from Supabase
  static async fetchStudents(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('last_name');

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    return data.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      admissionNumber: student.admission_number,
      form: student.form,
      stream: ensureValidEnum(student.stream, ['A', 'B', 'C'] as const, 'A'),
      guardianName: student.guardian_name,
      guardianPhone: student.guardian_phone,
      imageUrl: student.image_url || '/placeholder.svg'
    }));
  }

  // Fetch all teachers from Supabase
  static async fetchTeachers(): Promise<Teacher[]> {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('last_name');

    if (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }

    return data.map(teacher => ({
      id: teacher.id,
      firstName: teacher.first_name,
      lastName: teacher.last_name,
      email: teacher.email,
      password: teacher.password_hash,
      role: teacher.role as "teacher" | "admin",
      subjectIds: [] // This will need to be populated from teacher_subjects table
    }));
  }

  // Fetch all subjects from Supabase
  static async fetchSubjects(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }

    return data.map(subject => ({
      id: subject.id,
      name: subject.name,
      code: subject.code
    }));
  }

  // Fetch all exams from Supabase
  static async fetchExams(): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }

    return data.map(exam => ({
      id: exam.id,
      name: exam.name,
      type: ensureValidEnum(exam.type, ['TermStart', 'MidTerm', 'EndTerm', 'Custom'] as const, 'Custom'),
      date: exam.date,
      form: exam.form,
      term: exam.term as 1 | 2,
      year: exam.year
    }));
  }

  // Fetch all marks from Supabase
  static async fetchMarks(): Promise<Mark[]> {
    const { data, error } = await supabase
      .from('marks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marks:', error);
      throw error;
    }

    return data.map(mark => ({
      id: mark.id,
      studentId: mark.student_id,
      subjectId: mark.subject_id,
      examId: mark.exam_id,
      score: mark.score,
      grade: mark.grade,
      remarks: mark.remarks || ''
    }));
  }

  // Fetch all activity logs from Supabase
  static async fetchActivityLogs(): Promise<ActivityLog[]> {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching activity logs:', error);
      throw error;
    }

    return data.map(log => ({
      id: log.id,
      teacherId: log.teacher_id,
      action: log.action,
      details: log.details,
      timestamp: log.timestamp
    }));
  }

  // Add a new student
  static async addStudent(studentData: Omit<Student, 'id'>): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          first_name: studentData.firstName,
          last_name: studentData.lastName,
          admission_number: studentData.admissionNumber,
          form: studentData.form,
          stream: studentData.stream,
          guardian_name: studentData.guardianName,
          guardian_phone: studentData.guardianPhone,
          image_url: studentData.imageUrl
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding student:', error);
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
        imageUrl: data.image_url || '/placeholder.svg'
      };
    } catch (error) {
      console.error('Error adding student:', error);
      return null;
    }
  }

  // Add a new teacher
  static async addTeacher(teacherData: Omit<Teacher, 'id'>): Promise<Teacher | null> {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .insert({
          first_name: teacherData.firstName,
          last_name: teacherData.lastName,
          email: teacherData.email,
          password_hash: teacherData.password,
          role: teacherData.role
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding teacher:', error);
        return null;
      }

      return {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        password: data.password_hash,
        role: data.role as "teacher" | "admin",
        subjectIds: []
      };
    } catch (error) {
      console.error('Error adding teacher:', error);
      return null;
    }
  }

  // Update a student
  static async updateStudent(id: string, studentData: Partial<Student>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (studentData.firstName) updateData.first_name = studentData.firstName;
      if (studentData.lastName) updateData.last_name = studentData.lastName;
      if (studentData.admissionNumber) updateData.admission_number = studentData.admissionNumber;
      if (studentData.form !== undefined) updateData.form = studentData.form;
      if (studentData.stream) updateData.stream = studentData.stream;
      if (studentData.guardianName) updateData.guardian_name = studentData.guardianName;
      if (studentData.guardianPhone) updateData.guardian_phone = studentData.guardianPhone;
      if (studentData.imageUrl) updateData.image_url = studentData.imageUrl;

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating student:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating student:', error);
      return false;
    }
  }

  // Update a teacher
  static async updateTeacher(id: string, teacherData: Partial<Teacher>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (teacherData.firstName) updateData.first_name = teacherData.firstName;
      if (teacherData.lastName) updateData.last_name = teacherData.lastName;
      if (teacherData.email) updateData.email = teacherData.email;
      if (teacherData.password) updateData.password_hash = teacherData.password;
      if (teacherData.role) updateData.role = teacherData.role;

      const { error } = await supabase
        .from('teachers')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating teacher:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating teacher:', error);
      return false;
    }
  }

  // Delete a student
  static async deleteStudent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting student:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting student:', error);
      return false;
    }
  }

  // Delete a teacher
  static async deleteTeacher(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting teacher:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting teacher:', error);
      return false;
    }
  }
}
