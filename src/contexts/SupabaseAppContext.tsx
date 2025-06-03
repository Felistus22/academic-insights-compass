
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DataService } from "@/services/dataService";
import { Student, Teacher, Subject, Exam, Mark, ActivityLog } from "@/types";
import { toast } from "sonner";

interface AppContextType {
  // Data
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  exams: Exam[];
  marks: Mark[];
  activityLogs: ActivityLog[];
  teacherSubjects: { teacherId: string; subjectId: string }[];

  // Current user
  currentTeacher: Teacher | null;
  
  // Loading states
  isLoading: boolean;
  isMigrated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshData: () => Promise<void>;
  migrateData: () => Promise<void>;

  // Student management
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Teacher management
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  updateTeacher: (id: string, teacher: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
}

const SupabaseAppContext = createContext<AppContextType | undefined>(undefined);

export const useSupabaseAppContext = () => {
  const context = useContext(SupabaseAppContext);
  if (context === undefined) {
    throw new Error('useSupabaseAppContext must be used within a SupabaseAppProvider');
  }
  return context;
};

interface SupabaseAppProviderProps {
  children: ReactNode;
}

export const SupabaseAppProvider: React.FC<SupabaseAppProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [teacherSubjects] = useState<{ teacherId: string; subjectId: string }[]>([]);
  
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMigrated, setIsMigrated] = useState(false);

  // Check if data exists in database
  const checkIfDataMigrated = async () => {
    try {
      const studentsData = await DataService.fetchStudents();
      const teachersData = await DataService.fetchTeachers();
      
      if (studentsData.length > 0 && teachersData.length > 0) {
        setIsMigrated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking migration status:", error);
      return false;
    }
  };

  // Load all data from Supabase
  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [
        studentsData,
        teachersData,
        subjectsData,
        examsData,
        marksData,
        activityLogsData
      ] = await Promise.all([
        DataService.fetchStudents(),
        DataService.fetchTeachers(),
        DataService.fetchSubjects(),
        DataService.fetchExams(),
        DataService.fetchMarks(),
        DataService.fetchActivityLogs()
      ]);

      setStudents(studentsData);
      setTeachers(teachersData);
      setSubjects(subjectsData);
      setExams(examsData);
      setMarks(marksData);
      setActivityLogs(activityLogsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data from database");
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate data from mock to Supabase
  const migrateData = async () => {
    setIsLoading(true);
    toast.info("Starting data migration...");
    
    try {
      const result = await DataService.migrateAllData();
      
      if (result.success) {
        toast.success("Data migration completed successfully!");
        setIsMigrated(true);
        await refreshData();
      } else {
        toast.error("Data migration failed");
        console.error("Migration error:", result.error);
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast.error("Data migration failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      const migrated = await checkIfDataMigrated();
      if (migrated) {
        await refreshData();
      } else {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    const teacher = teachers.find(t => t.email === email && t.password === password);
    if (teacher) {
      setCurrentTeacher(teacher);
      toast.success("Login successful!");
      return true;
    }
    toast.error("Invalid credentials");
    return false;
  };

  const logout = () => {
    setCurrentTeacher(null);
    toast.info("Logged out successfully");
  };

  // Student management
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    const newStudent = await DataService.addStudent(studentData);
    if (newStudent) {
      setStudents(prev => [...prev, newStudent]);
      toast.success("Student added successfully");
    } else {
      toast.error("Failed to add student");
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    const success = await DataService.updateStudent(id, studentData);
    if (success) {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
      toast.success("Student updated successfully");
    } else {
      toast.error("Failed to update student");
    }
  };

  const deleteStudent = async (id: string) => {
    const success = await DataService.deleteStudent(id);
    if (success) {
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success("Student deleted successfully");
    } else {
      toast.error("Failed to delete student");
    }
  };

  // Teacher management
  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    const newTeacher = await DataService.addTeacher(teacherData);
    if (newTeacher) {
      setTeachers(prev => [...prev, newTeacher]);
      toast.success("Teacher added successfully");
    } else {
      toast.error("Failed to add teacher");
    }
  };

  const updateTeacher = async (id: string, teacherData: Partial<Teacher>) => {
    const success = await DataService.updateTeacher(id, teacherData);
    if (success) {
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacherData } : t));
      toast.success("Teacher updated successfully");
    } else {
      toast.error("Failed to update teacher");
    }
  };

  const deleteTeacher = async (id: string) => {
    const success = await DataService.deleteTeacher(id);
    if (success) {
      setTeachers(prev => prev.filter(t => t.id !== id));
      toast.success("Teacher deleted successfully");
    } else {
      toast.error("Failed to delete teacher");
    }
  };

  const value: AppContextType = {
    students,
    teachers,
    subjects,
    exams,
    marks,
    activityLogs,
    teacherSubjects,
    currentTeacher,
    isLoading,
    isMigrated,
    login,
    logout,
    refreshData,
    migrateData,
    addStudent,
    updateStudent,
    deleteStudent,
    addTeacher,
    updateTeacher,
    deleteTeacher,
  };

  return (
    <SupabaseAppContext.Provider value={value}>
      {children}
    </SupabaseAppContext.Provider>
  );
};
