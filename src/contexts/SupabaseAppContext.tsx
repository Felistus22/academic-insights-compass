import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { DataService } from "@/services/dataService";
import { OfflineStorageService } from "@/services/offlineStorage";
import { SyncService } from "@/services/syncService";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { Student, Teacher, Subject, Exam, Mark, ActivityLog } from "@/types";
import { toast } from "sonner";
import * as mockData from "@/data/mockData";

// Demo credentials for offline login
const DEMO_ACCOUNTS = {
  admin: {
    email: "principal@school.edu",
    password: "admin123",
    teacher: {
      id: "demo-admin-id",
      firstName: "Principal",
      lastName: "User",
      email: "principal@school.edu",
      passwordHash: "admin123",
      role: "admin" as const,
      subjectIds: []
    }
  },
  teacher: {
    email: "t.anderson@school.edu", 
    password: "password123",
    teacher: {
      id: "demo-teacher-id",
      firstName: "T.",
      lastName: "Anderson",
      email: "t.anderson@school.edu",
      passwordHash: "password123",
      role: "teacher" as const,
      subjectIds: []
    }
  }
};

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
  
  // Network state
  isOnline: boolean;
  wasOffline: boolean;
  markSyncHandled: () => void;

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

  // Mark management
  addMark: (mark: Omit<Mark, 'id'>) => Promise<void>;
  updateMark: (mark: Mark) => Promise<void>;
  deleteMark: (id: string) => Promise<void>;

  // Exam management
  addExam: (exam: Omit<Exam, 'id'>) => Promise<Exam>;
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
  const [isMigrated, setIsMigrated] = useState(false); // Start with false to check properly
  
  // Network status
  const { isOnline, wasOffline, markSyncHandled } = useNetworkStatus();

  // Check if data exists in database
  const checkIfDataMigrated = async () => {
    try {
      console.log("Checking migration status...");
      const [studentsData, teachersData, subjectsData] = await Promise.all([
        DataService.fetchStudents(),
        DataService.fetchTeachers(),
        DataService.fetchSubjects()
      ]);
      
      console.log("Migration check results:", {
        students: studentsData.length,
        teachers: teachersData.length,
        subjects: subjectsData.length
      });
      
      const hasData = studentsData.length > 0 && teachersData.length > 0 && subjectsData.length > 0;
      setIsMigrated(hasData);
      return hasData;
    } catch (error) {
      console.error("Error checking migration status:", error);
      setIsMigrated(false);
      return false;
    }
  };

  // Load all data (from online or offline storage)
  const refreshData = async () => {
    setIsLoading(true);
    try {
      if (isOnline) {
        console.log("Refreshing data from database...");
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

        console.log("Data loaded from online:", {
          students: studentsData.length,
          teachers: teachersData.length,
          subjects: subjectsData.length,
          exams: examsData.length,
          marks: marksData.length,
          activityLogs: activityLogsData.length
        });

        // Cache data for offline access
        await OfflineStorageService.cacheOnlineData({
          students: studentsData,
          teachers: teachersData,
          subjects: subjectsData,
          exams: examsData,
          marks: marksData,
          activityLogs: activityLogsData
        });

        setStudents(studentsData);
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setExams(examsData);
        setMarks(marksData);
        setActivityLogs(activityLogsData);
      } else {
        console.log("Loading data from offline storage...");
        const [
          studentsData,
          teachersData,
          subjectsData,
          examsData,
          marksData
        ] = await Promise.all([
          OfflineStorageService.getAllStudents(),
          OfflineStorageService.getAllTeachers(),
          OfflineStorageService.getAllSubjects(),
          OfflineStorageService.getAllExams(),
          OfflineStorageService.getAllMarks()
        ]);

        console.log("Data loaded from offline:", {
          students: studentsData.length,
          teachers: teachersData.length,
          subjects: subjectsData.length,
          exams: examsData.length,
          marks: marksData.length
        });

        setStudents(studentsData);
        setTeachers(teachersData);
        setSubjects(subjectsData);
        setExams(examsData);
        setMarks(marksData);
        setActivityLogs([]); // Activity logs not cached offline
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  // Migrate data from mock to Supabase
  const migrateData = async () => {
    setIsLoading(true);
    toast.info("Starting data migration...");
    
    try {
      console.log("Starting migration process...");
      const result = await DataService.migrateAllData();
      
      if (result.success) {
        console.log("Migration successful, refreshing data...");
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

  // Auto-sync when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      console.log("Connection restored, attempting auto-sync...");
      SyncService.syncAllData().then(() => {
        // Refresh data after sync
        refreshData();
      });
    }
  }, [isOnline, wasOffline]);

  // Refresh data when network status changes
  useEffect(() => {
    refreshData();
  }, [isOnline]);

  // Check for existing session on init
  useEffect(() => {
    const savedSession = localStorage.getItem('offline_demo_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        setCurrentTeacher(session);
        console.log("Restored offline demo session for:", session.email);
      } catch (error) {
        console.error("Error restoring session:", error);
        localStorage.removeItem('offline_demo_session');
      }
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    const initializeData = async () => {
      console.log("Initializing application data...");
      if (isOnline) {
        const migrated = await checkIfDataMigrated();
        if (migrated) {
          console.log("Data exists, loading...");
          await refreshData();
        } else {
          console.log("No data found, showing migration prompt");
          setIsLoading(false);
        }
      } else {
        console.log("Offline mode, loading cached data...");
        await refreshData();
      }
    };

    initializeData();
  }, []);

  // Populate demo data for offline login
  const populateDemoData = async () => {
    console.log("Populating demo data for offline login...");
    try {
      // Clear existing offline data
      await OfflineStorageService.clearAllData();
      
      // Populate offline storage with demo data
      await OfflineStorageService.cacheOnlineData({
        students: mockData.students,
        teachers: mockData.teachers,
        subjects: mockData.subjects,
        exams: mockData.exams,
        marks: mockData.marks,
        activityLogs: mockData.activityLogs
      });

      // Update state with demo data
      setStudents(mockData.students);
      setTeachers(mockData.teachers);
      setSubjects(mockData.subjects);
      setExams(mockData.exams);
      setMarks(mockData.marks);
      setActivityLogs(mockData.activityLogs);
      
      console.log("Demo data populated successfully");
    } catch (error) {
      console.error("Error populating demo data:", error);
    }
  };

  // Authentication functions
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Attempting login for:", email);
    console.log("Available teachers:", teachers.map(t => ({ email: t.email, role: t.role })));
    console.log("Is online:", isOnline);
    
    // First try regular login with loaded teachers (works when online and data is loaded)
    const teacher = teachers.find(t => t.email === email && t.passwordHash === password);
    if (teacher) {
      console.log("Login successful for:", teacher.firstName, teacher.lastName);
      setCurrentTeacher(teacher);
      // Clear any offline demo session
      localStorage.removeItem('offline_demo_session');
      toast.success("Login successful!");
      return true;
    }
    
    // If offline or no teachers loaded, check demo credentials
    if (!isOnline || teachers.length === 0) {
      console.log("Checking demo credentials for offline login...");
      
      // Check admin demo credentials
      if (email === DEMO_ACCOUNTS.admin.email && password === DEMO_ACCOUNTS.admin.password) {
        console.log("Demo admin login successful");
        const demoTeacher = DEMO_ACCOUNTS.admin.teacher;
        setCurrentTeacher(demoTeacher);
        localStorage.setItem('offline_demo_session', JSON.stringify(demoTeacher));
        
        // Populate demo data for offline use
        await populateDemoData();
        
        toast.success("Demo admin login successful! (Offline mode)");
        return true;
      }
      
      // Check teacher demo credentials
      if (email === DEMO_ACCOUNTS.teacher.email && password === DEMO_ACCOUNTS.teacher.password) {
        console.log("Demo teacher login successful");
        const demoTeacher = DEMO_ACCOUNTS.teacher.teacher;
        setCurrentTeacher(demoTeacher);
        localStorage.setItem('offline_demo_session', JSON.stringify(demoTeacher));
        
        // Populate demo data for offline use
        await populateDemoData();
        
        toast.success("Demo teacher login successful! (Offline mode)");
        return true;
      }
    }
    
    console.log("Login failed - credentials not found");
    toast.error("Invalid credentials");
    return false;
  };

  const logout = () => {
    setCurrentTeacher(null);
    localStorage.removeItem('offline_demo_session');
    toast.info("Logged out successfully");
  };

  // Student management (offline-aware)
  const addStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      // Check if we're in demo mode by checking if current teacher is a demo account
      const isDemoAccount = currentTeacher && (
        currentTeacher.email === DEMO_ACCOUNTS.admin.email || 
        currentTeacher.email === DEMO_ACCOUNTS.teacher.email
      );
      
      if (isOnline && !isDemoAccount) {
        const newStudent = await DataService.addStudent(studentData);
        if (newStudent) {
          setStudents(prev => [...prev, newStudent]);
          toast.success("Student added successfully");
        } else {
          toast.error("Failed to add student");
        }
      } else {
        const newStudent = await OfflineStorageService.addStudentOffline(studentData);
        setStudents(prev => [...prev, {
          id: newStudent.id,
          firstName: newStudent.firstName,
          lastName: newStudent.lastName,
          admissionNumber: newStudent.admissionNumber,
          form: newStudent.form,
          stream: newStudent.stream,
          guardianName: newStudent.guardianName,
          guardianPhone: newStudent.guardianPhone,
          imageUrl: newStudent.imageUrl
        }]);
        toast.success(isDemoAccount ? "Student added to demo data" : "Student added (will sync when online)");
      }
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student");
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    try {
      if (isOnline) {
        const success = await DataService.updateStudent(id, studentData);
        if (success) {
          setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
          toast.success("Student updated successfully");
        } else {
          toast.error("Failed to update student");
        }
      } else {
        await OfflineStorageService.updateStudentOffline(id, studentData);
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...studentData } : s));
        toast.success("Student updated (will sync when online)");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      if (isOnline) {
        const success = await DataService.deleteStudent(id);
        if (success) {
          setStudents(prev => prev.filter(s => s.id !== id));
          toast.success("Student deleted successfully");
        } else {
          toast.error("Failed to delete student");
        }
      } else {
        await OfflineStorageService.deleteStudentOffline(id);
        setStudents(prev => prev.filter(s => s.id !== id));
        toast.success("Student deleted (will sync when online)");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  // Teacher management (offline-aware)
  const addTeacher = async (teacherData: Omit<Teacher, 'id'>) => {
    try {
      if (isOnline) {
        const newTeacher = await DataService.addTeacher(teacherData);
        if (newTeacher) {
          setTeachers(prev => [...prev, newTeacher]);
          toast.success("Teacher added successfully");
        } else {
          toast.error("Failed to add teacher");
        }
      } else {
        const newTeacher = await OfflineStorageService.addTeacherOffline(teacherData);
        setTeachers(prev => [...prev, {
          id: newTeacher.id,
          firstName: newTeacher.firstName,
          lastName: newTeacher.lastName,
          email: newTeacher.email,
          passwordHash: newTeacher.passwordHash,
          role: newTeacher.role,
          subjectIds: newTeacher.subjectIds
        }]);
        toast.success("Teacher added (will sync when online)");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("Failed to add teacher");
    }
  };

  const updateTeacher = async (id: string, teacherData: Partial<Teacher>) => {
    try {
      if (isOnline) {
        const success = await DataService.updateTeacher(id, teacherData);
        if (success) {
          setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacherData } : t));
          toast.success("Teacher updated successfully");
        } else {
          toast.error("Failed to update teacher");
        }
      } else {
        await OfflineStorageService.updateTeacherOffline(id, teacherData);
        setTeachers(prev => prev.map(t => t.id === id ? { ...t, ...teacherData } : t));
        toast.success("Teacher updated (will sync when online)");
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher");
    }
  };

  const deleteTeacher = async (id: string) => {
    try {
      if (isOnline) {
        const success = await DataService.deleteTeacher(id);
        if (success) {
          setTeachers(prev => prev.filter(t => t.id !== id));
          toast.success("Teacher deleted successfully");
        } else {
          toast.error("Failed to delete teacher");
        }
      } else {
        await OfflineStorageService.deleteTeacherOffline(id);
        setTeachers(prev => prev.filter(t => t.id !== id));
        toast.success("Teacher deleted (will sync when online)");
      }
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
    }
  };

  // Mark management (offline-aware)
  const addMark = async (markData: Omit<Mark, 'id'>) => {
    try {
      if (isOnline) {
        const newMark = await DataService.addMark(markData);
        if (newMark) {
          setMarks(prev => [...prev, newMark]);
          toast.success("Mark added successfully");
        } else {
          toast.error("Failed to add mark");
        }
      } else {
        const newMark = await OfflineStorageService.addMarkOffline(markData);
        setMarks(prev => [...prev, {
          id: newMark.id,
          studentId: newMark.studentId,
          subjectId: newMark.subjectId,
          examId: newMark.examId,
          score: newMark.score,
          grade: newMark.grade,
          remarks: newMark.remarks
        }]);
        toast.success("Mark added (will sync when online)");
      }
    } catch (error) {
      console.error("Error adding mark:", error);
      toast.error("Failed to add mark");
    }
  };

  const updateMark = async (mark: Mark) => {
    try {
      if (isOnline) {
        const success = await DataService.updateMark(mark.id, mark);
        if (success) {
          setMarks(prev => prev.map(m => m.id === mark.id ? mark : m));
          toast.success("Mark updated successfully");
        } else {
          toast.error("Failed to update mark");
        }
      } else {
        await OfflineStorageService.updateMarkOffline(mark);
        setMarks(prev => prev.map(m => m.id === mark.id ? mark : m));
        toast.success("Mark updated (will sync when online)");
      }
    } catch (error) {
      console.error("Error updating mark:", error);
      toast.error("Failed to update mark");
    }
  };

  const deleteMark = async (id: string) => {
    try {
      if (isOnline) {
        const success = await DataService.deleteMark(id);
        if (success) {
          setMarks(prev => prev.filter(m => m.id !== id));
          toast.success("Mark deleted successfully");
        } else {
          toast.error("Failed to delete mark");
        }
      } else {
        await OfflineStorageService.deleteMarkOffline(id);
        setMarks(prev => prev.filter(m => m.id !== id));
        toast.success("Mark deleted (will sync when online)");
      }
    } catch (error) {
      console.error("Error deleting mark:", error);
      toast.error("Failed to delete mark");
    }
  };

  // Exam management (offline-aware)
  const addExam = async (examData: Omit<Exam, 'id'>): Promise<Exam> => {
    try {
      if (isOnline) {
        const newExam = await DataService.addExam(examData);
        if (newExam) {
          setExams(prev => [...prev, newExam]);
          toast.success("Exam added successfully");
          return newExam;
        } else {
          toast.error("Failed to add exam");
          throw new Error("Failed to add exam");
        }
      } else {
        const newExam = await OfflineStorageService.addExamOffline(examData);
        const examForState = {
          id: newExam.id,
          name: newExam.name,
          type: newExam.type,
          term: newExam.term,
          year: newExam.year,
          form: newExam.form,
          date: newExam.date
        };
        setExams(prev => [...prev, examForState]);
        toast.success("Exam added (will sync when online)");
        return examForState;
      }
    } catch (error) {
      console.error("Error adding exam:", error);
      toast.error("Failed to add exam");
      throw error;
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
    isOnline,
    wasOffline,
    markSyncHandled,
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
    addMark,
    updateMark,
    deleteMark,
    addExam,
  };

  return (
    <SupabaseAppContext.Provider value={value}>
      {children}
    </SupabaseAppContext.Provider>
  );
};
