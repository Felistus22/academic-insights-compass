import React, { createContext, useContext, useState, useEffect } from "react";
import { Student, Subject, Exam, Mark, Teacher, ActivityLog } from "../types";
import { initialData, loadFromLocalStorage, saveToLocalStorage } from "../data/mockData";
import { toast } from "sonner";

interface AppContextType {
  students: Student[];
  subjects: Subject[];
  exams: Exam[];
  marks: Mark[];
  teachers: Teacher[];
  activityLogs: ActivityLog[];
  currentTeacher: Teacher | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addMark: (mark: Omit<Mark, "id" | "grade">) => void;
  updateMark: (mark: Mark) => void;
  deleteMark: (markId: string) => void;
  addExam: (exam: Omit<Exam, "id">) => Exam;
  addActivityLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  getStudentMarks: (studentId: string) => Mark[];
  getFormStudents: (form: number) => Student[];
  addStudent: (student: Omit<Student, "id">) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  addTeacher: (teacher: Omit<Teacher, "id">) => void;
  updateTeacher: (teacher: Teacher) => void;
  deleteTeacher: (teacherId: string) => void;
  addSubject: (subject: Omit<Subject, "id">) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(initialData);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = async () => {
      const savedData = loadFromLocalStorage();
      if (savedData) {
        setData(savedData);
      } else {
        saveToLocalStorage(initialData);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      saveToLocalStorage(data);
    }
  }, [data, loading]);

  // Helper function to generate a grade based on score
  const getGrade = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 75) return "A-";
    if (score >= 70) return "B+";
    if (score >= 65) return "B";
    if (score >= 60) return "B-";
    if (score >= 55) return "C+";
    if (score >= 50) return "C";
    if (score >= 45) return "C-";
    if (score >= 40) return "D+";
    if (score >= 35) return "D";
    if (score >= 30) return "D-";
    return "E";
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const teacher = data.teachers.find(t => t.email === email && t.passwordHash === password);
    
    if (teacher) {
      setCurrentTeacher(teacher);
      addActivityLog({
        teacherId: teacher.id,
        action: "LOGIN",
        details: "Teacher logged in"
      });
      return true;
    }
    
    return false;
  };

  const logout = () => {
    if (currentTeacher) {
      addActivityLog({
        teacherId: currentTeacher.id,
        action: "LOGOUT",
        details: "Teacher logged out"
      });
    }
    setCurrentTeacher(null);
  };

  const addMark = (markData: Omit<Mark, "id" | "grade">) => {
    if (!currentTeacher) return;
    
    const newMark: Mark = {
      id: `mark${Date.now()}`,
      ...markData,
      grade: getGrade(markData.score)
    };
    
    setData(prevData => ({
      ...prevData,
      marks: [...prevData.marks, newMark]
    }));
    
    addActivityLog({
      teacherId: currentTeacher.id,
      action: "MARK_ENTRY",
      details: `Added mark for student ${markData.studentId}, subject ${markData.subjectId}`
    });
    
    toast.success("Mark added successfully");
  };

  const updateMark = (updatedMark: Mark) => {
    if (!currentTeacher) return;
    
    setData(prevData => ({
      ...prevData,
      marks: prevData.marks.map(mark => 
        mark.id === updatedMark.id ? 
          { ...updatedMark, grade: getGrade(updatedMark.score) } : 
          mark
      )
    }));
    
    addActivityLog({
      teacherId: currentTeacher.id,
      action: "MARK_UPDATE",
      details: `Updated mark for student ${updatedMark.studentId}, subject ${updatedMark.subjectId}`
    });
    
    toast.success("Mark updated successfully");
  };

  const deleteMark = (markId: string) => {
    if (!currentTeacher) return;
    
    const markToDelete = data.marks.find(m => m.id === markId);
    if (!markToDelete) return;
    
    setData(prevData => ({
      ...prevData,
      marks: prevData.marks.filter(mark => mark.id !== markId)
    }));
    
    addActivityLog({
      teacherId: currentTeacher.id,
      action: "MARK_DELETE",
      details: `Deleted mark for student ${markToDelete.studentId}, subject ${markToDelete.subjectId}`
    });
    
    toast.success("Mark deleted successfully");
  };

  const addExam = (examData: Omit<Exam, "id">): Exam => {
    if (!currentTeacher) throw new Error("Authentication required");
    
    const newExam: Exam = {
      id: `exam${Date.now()}`,
      ...examData
    };
    
    setData(prevData => ({
      ...prevData,
      exams: [...prevData.exams, newExam]
    }));
    
    addActivityLog({
      teacherId: currentTeacher.id,
      action: "EXAM_ADD",
      details: `Added new exam: ${examData.name}`
    });
    
    toast.success("Exam added successfully");
    return newExam;
  };

  const addActivityLog = (logData: Omit<ActivityLog, "id" | "timestamp">) => {
    const newLog: ActivityLog = {
      id: `log${Date.now()}`,
      ...logData,
      timestamp: new Date().toISOString()
    };
    
    setData(prevData => ({
      ...prevData,
      activityLogs: [...prevData.activityLogs, newLog]
    }));
  };

  const getStudentMarks = (studentId: string): Mark[] => {
    return data.marks.filter(mark => mark.studentId === studentId);
  };

  const getFormStudents = (form: number): Student[] => {
    return data.students.filter(student => student.form === form);
  };

  // Student management functions
  const addStudent = (studentData: Omit<Student, "id">) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can add students");
      return;
    }

    const newStudent: Student = {
      id: `std${Date.now()}`,
      ...studentData
    };

    setData(prevData => ({
      ...prevData,
      students: [...prevData.students, newStudent]
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "STUDENT_ADD",
      details: `Added new student: ${studentData.firstName} ${studentData.lastName}`
    });

    toast.success("Student added successfully");
  };

  const updateStudent = (updatedStudent: Student) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can update students");
      return;
    }

    setData(prevData => ({
      ...prevData,
      students: prevData.students.map(student => 
        student.id === updatedStudent.id ? updatedStudent : student
      )
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "STUDENT_UPDATE",
      details: `Updated student: ${updatedStudent.firstName} ${updatedStudent.lastName}`
    });

    toast.success("Student updated successfully");
  };

  const deleteStudent = (studentId: string) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can delete students");
      return;
    }

    const studentToDelete = data.students.find(s => s.id === studentId);
    if (!studentToDelete) return;

    setData(prevData => ({
      ...prevData,
      students: prevData.students.filter(student => student.id !== studentId),
      // Also remove any marks associated with the student
      marks: prevData.marks.filter(mark => mark.studentId !== studentId)
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "STUDENT_DELETE",
      details: `Deleted student: ${studentToDelete.firstName} ${studentToDelete.lastName}`
    });

    toast.success("Student deleted successfully");
  };

  // Teacher management functions
  const addTeacher = (teacherData: Omit<Teacher, "id">) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can add teachers");
      return;
    }

    const newTeacher: Teacher = {
      id: `teacher${Date.now()}`,
      ...teacherData
    };

    setData(prevData => ({
      ...prevData,
      teachers: [...prevData.teachers, newTeacher]
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "TEACHER_ADD",
      details: `Added new teacher: ${teacherData.firstName} ${teacherData.lastName}`
    });

    toast.success("Teacher added successfully");
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can update teachers");
      return;
    }

    setData(prevData => ({
      ...prevData,
      teachers: prevData.teachers.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "TEACHER_UPDATE",
      details: `Updated teacher: ${updatedTeacher.firstName} ${updatedTeacher.lastName}`
    });

    toast.success("Teacher updated successfully");
  };

  const deleteTeacher = (teacherId: string) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can delete teachers");
      return;
    }

    // Don't allow deleting the current logged-in teacher
    if (currentTeacher.id === teacherId) {
      toast.error("You cannot delete your own account");
      return;
    }

    const teacherToDelete = data.teachers.find(t => t.id === teacherId);
    if (!teacherToDelete) return;

    setData(prevData => ({
      ...prevData,
      teachers: prevData.teachers.filter(teacher => teacher.id !== teacherId)
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "TEACHER_DELETE",
      details: `Deleted teacher: ${teacherToDelete.firstName} ${teacherToDelete.lastName}`
    });

    toast.success("Teacher deleted successfully");
  };

  // New Subject Management Functions
  const addSubject = (subjectData: Omit<Subject, "id">) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can add subjects");
      return;
    }

    const newSubject: Subject = {
      id: `subj${Date.now()}`,
      ...subjectData
    };

    setData(prevData => ({
      ...prevData,
      subjects: [...prevData.subjects, newSubject]
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "SUBJECT_ADD",
      details: `Added new subject: ${subjectData.name}`
    });

    toast.success("Subject added successfully");
  };

  const updateSubject = (updatedSubject: Subject) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can update subjects");
      return;
    }

    setData(prevData => ({
      ...prevData,
      subjects: prevData.subjects.map(subject => 
        subject.id === updatedSubject.id ? updatedSubject : subject
      )
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "SUBJECT_UPDATE",
      details: `Updated subject: ${updatedSubject.name}`
    });

    toast.success("Subject updated successfully");
  };

  const deleteSubject = (subjectId: string) => {
    if (!currentTeacher || currentTeacher.role !== "admin") {
      toast.error("Only administrators can delete subjects");
      return;
    }

    const subjectToDelete = data.subjects.find(s => s.id === subjectId);
    if (!subjectToDelete) return;

    // Check if the subject is being used in any marks
    const isUsed = data.marks.some(mark => mark.subjectId === subjectId);
    if (isUsed) {
      toast.error("Cannot delete a subject that has marks associated with it");
      return;
    }

    // Check if the subject is assigned to any teachers
    const isAssigned = data.teachers.some(teacher => 
      teacher.subjectIds.includes(subjectId)
    );
    if (isAssigned) {
      toast.error("Cannot delete a subject that is assigned to teachers");
      return;
    }

    setData(prevData => ({
      ...prevData,
      subjects: prevData.subjects.filter(subject => subject.id !== subjectId)
    }));

    addActivityLog({
      teacherId: currentTeacher.id,
      action: "SUBJECT_DELETE",
      details: `Deleted subject: ${subjectToDelete.name}`
    });

    toast.success("Subject deleted successfully");
  };

  const contextValue: AppContextType = {
    ...data,
    currentTeacher,
    loading,
    login,
    logout,
    addMark,
    updateMark,
    deleteMark,
    addExam,
    addActivityLog,
    getStudentMarks,
    getFormStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    addSubject,
    updateSubject,
    deleteSubject
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
