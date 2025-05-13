
import { Student, Subject, Exam, Mark, Teacher, ActivityLog } from "../types";

export const subjects: Subject[] = [
  { id: "subj1", name: "Mathematics", code: "MATH" },
  { id: "subj2", name: "English Language", code: "ENG" },
  { id: "subj3", name: "Physics", code: "PHY" },
  { id: "subj4", name: "Chemistry", code: "CHEM" },
  { id: "subj5", name: "Biology", code: "BIO" },
  { id: "subj6", name: "History", code: "HIST" },
  { id: "subj7", name: "Geography", code: "GEO" },
  { id: "subj8", name: "Computer Studies", code: "COMP" },
];

export const students: Student[] = [
  {
    id: "std1",
    firstName: "John",
    lastName: "Smith",
    admissionNumber: "F1-001",
    form: 1,
    guardianName: "Mary Smith",
    guardianPhone: "+2547123456789",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std2",
    firstName: "Sarah",
    lastName: "Johnson",
    admissionNumber: "F1-002",
    form: 1,
    guardianName: "Robert Johnson",
    guardianPhone: "+2547123456790",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std3",
    firstName: "Michael",
    lastName: "Williams",
    admissionNumber: "F2-001",
    form: 2,
    guardianName: "Patricia Williams",
    guardianPhone: "+2547123456791",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std4",
    firstName: "Jessica",
    lastName: "Brown",
    admissionNumber: "F2-002",
    form: 2,
    guardianName: "James Brown",
    guardianPhone: "+2547123456792",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std5",
    firstName: "David",
    lastName: "Miller",
    admissionNumber: "F3-001",
    form: 3,
    guardianName: "Linda Miller",
    guardianPhone: "+2547123456793",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std6",
    firstName: "Emily",
    lastName: "Davis",
    admissionNumber: "F3-002",
    form: 3,
    guardianName: "Richard Davis",
    guardianPhone: "+2547123456794",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std7",
    firstName: "Daniel",
    lastName: "Wilson",
    admissionNumber: "F4-001",
    form: 4,
    guardianName: "Susan Wilson",
    guardianPhone: "+2547123456795",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "std8",
    firstName: "Olivia",
    lastName: "Taylor",
    admissionNumber: "F4-002",
    form: 4,
    guardianName: "Charles Taylor",
    guardianPhone: "+2547123456796",
    imageUrl: "/placeholder.svg"
  },
];

export const exams: Exam[] = [
  // Form 1, Year 2023
  { id: "exam1", name: "Form 1 Term 1 Start Exam", type: "TermStart", term: 1, year: 2023, form: 1, date: "2023-01-15" },
  { id: "exam2", name: "Form 1 Term 1 Mid Term Exam", type: "MidTerm", term: 1, year: 2023, form: 1, date: "2023-03-01" },
  { id: "exam3", name: "Form 1 Term 1 End Term Exam", type: "EndTerm", term: 1, year: 2023, form: 1, date: "2023-04-15" },
  { id: "exam4", name: "Form 1 Term 2 Start Exam", type: "TermStart", term: 2, year: 2023, form: 1, date: "2023-05-15" },
  { id: "exam5", name: "Form 1 Term 2 Mid Term Exam", type: "MidTerm", term: 2, year: 2023, form: 1, date: "2023-07-01" },
  { id: "exam6", name: "Form 1 Term 2 End Term Exam", type: "EndTerm", term: 2, year: 2023, form: 1, date: "2023-08-15" },
  
  // Form 2, Year 2024
  { id: "exam7", name: "Form 2 Term 1 Start Exam", type: "TermStart", term: 1, year: 2024, form: 2, date: "2024-01-15" },
  { id: "exam8", name: "Form 2 Term 1 Mid Term Exam", type: "MidTerm", term: 1, year: 2024, form: 2, date: "2024-03-01" },
  { id: "exam9", name: "Form 2 Term 1 End Term Exam", type: "EndTerm", term: 1, year: 2024, form: 2, date: "2024-04-15" },
  
  // Custom exam
  { id: "examC1", name: "Special Assessment Test", type: "Custom", term: 1, year: 2024, form: 2, date: "2024-02-20" },
];

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

// Generate marks for students
export const generateMarks = (): Mark[] => {
  const marks: Mark[] = [];
  let idCounter = 1;
  
  students.forEach(student => {
    // Only generate marks for relevant exams based on student's form
    const relevantExams = exams.filter(exam => exam.form <= student.form);
    
    relevantExams.forEach(exam => {
      subjects.forEach(subject => {
        // Generate a random score between 30 and 95
        const score = Math.floor(Math.random() * 66) + 30;
        
        marks.push({
          id: `mark${idCounter++}`,
          studentId: student.id,
          subjectId: subject.id,
          examId: exam.id,
          score,
          grade: getGrade(score),
          remarks: score >= 70 ? "Excellent" : score >= 50 ? "Good" : "Needs improvement"
        });
      });
    });
  });
  
  return marks;
};

export const marks: Mark[] = generateMarks();

export const teachers: Teacher[] = [
  {
    id: "teacher1",
    firstName: "Thomas",
    lastName: "Anderson",
    email: "t.anderson@school.edu",
    password: "password123", // In a real app, this would be hashed
    subjectIds: ["subj1", "subj3"],
    role: "teacher"
  },
  {
    id: "teacher2",
    firstName: "Jane",
    lastName: "Doe",
    email: "j.doe@school.edu",
    password: "password123", // In a real app, this would be hashed
    subjectIds: ["subj2", "subj6"],
    role: "teacher"
  },
  {
    id: "admin1",
    firstName: "Principal",
    lastName: "Smith",
    email: "principal@school.edu",
    password: "admin123", // In a real app, this would be hashed
    subjectIds: [],
    role: "admin"
  },
];

export const activityLogs: ActivityLog[] = [
  {
    id: "log1",
    teacherId: "teacher1",
    action: "LOGIN",
    details: "Teacher logged in",
    timestamp: "2024-05-10T09:30:00Z"
  },
  {
    id: "log2",
    teacherId: "teacher1",
    action: "MARK_ENTRY",
    details: "Added marks for Form 1 Mathematics",
    timestamp: "2024-05-10T10:15:00Z"
  },
  {
    id: "log3",
    teacherId: "teacher2",
    action: "LOGIN",
    details: "Teacher logged in",
    timestamp: "2024-05-10T11:00:00Z"
  },
  {
    id: "log4",
    teacherId: "teacher2",
    action: "MARK_UPDATE",
    details: "Updated marks for Form 2 English",
    timestamp: "2024-05-10T11:45:00Z"
  },
  {
    id: "log5",
    teacherId: "admin1",
    action: "LOGIN",
    details: "Admin logged in",
    timestamp: "2024-05-10T13:30:00Z"
  },
];

// Initial data state for the application
export const initialData = {
  students,
  subjects,
  exams,
  marks,
  teachers,
  activityLogs
};

// Storage utilities
export const saveToLocalStorage = (data: typeof initialData) => {
  localStorage.setItem('reportCardSystem', JSON.stringify(data));
};

export const loadFromLocalStorage = (): typeof initialData | null => {
  const savedData = localStorage.getItem('reportCardSystem');
  if (savedData) {
    return JSON.parse(savedData);
  }
  return null;
};
