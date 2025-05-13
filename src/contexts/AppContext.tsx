
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
    
    const teacher = data.teachers.find(t => t.email === email && t.password === password);
    
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
    getFormStudents
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
