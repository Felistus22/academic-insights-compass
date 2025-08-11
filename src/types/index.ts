
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  form: number; // Now can be 1-5, with 5 representing alumni
  stream: "A" | "B" | "C";
  guardianName: string;
  guardianPhone: string;
  imageUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
}

export interface Exam {
  id: string;
  name: string;
  type: "TermStart" | "MidTerm" | "EndTerm" | "Custom";
  term: 1 | 2;
  year: number;
  form: number;
  date: string;
}

export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  examId: string;
  score: number;
  grade: string;
  remarks?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string; // Changed from password to passwordHash to match database
  subjectIds: string[]; // Added back the missing subjectIds property
  role: "teacher" | "admin";
  phoneNumber?: string; // Added phoneNumber property
}

export interface ActivityLog {
  id: string;
  teacherId: string;
  action: string;
  details: string;
  timestamp: string;
}

export type ReportType = 'form' | 'student' | 'overview';

export interface StudentReportCardProps {
  studentId: string;
  year: number;
  term: 1 | 2;
}

export interface FormReportProps {
  form: number;
  year: number;
  term: 1 | 2;
}

export interface GradingSystem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GradeRange {
  id: string;
  gradingSystemId: string;
  grade: string;
  minScore: number;
  maxScore: number;
  points?: number;
  createdAt: string;
}

export interface DivisionRange {
  id: string;
  gradingSystemId: string;
  division: string;
  minPoints: number;
  maxPoints: number;
  description?: string;
  createdAt: string;
}
