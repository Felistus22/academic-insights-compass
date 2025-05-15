
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { Student, Subject, Exam, Mark } from "@/types";

// Helper function to get grade from score
export const getGradeFromScore = (score: number): string => {
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

// Helper function to get student position info
export const getStudentPositionInfo = (
  studentId: string,
  students: Student[],
  subjects: Subject[],
  exams: Exam[],
  marks: Mark[],
  selectedYear: string,
  selectedTerm: string
): string => {
  const student = students.find(s => s.id === studentId);
  if (!student) return "N/A";
  
  // Get all students in the same form
  const classmates = students.filter(s => s.form === student.form);
  
  // Calculate average for each student
  const studentAverages = classmates.map(s => {
    const studentSubjectAverages: Record<string, number> = {};
    
    subjects.forEach(subject => {
      const subjectMarks = marks.filter(
        m => m.studentId === s.id && 
        m.subjectId === subject.id &&
        exams.some(e => 
          e.id === m.examId && 
          e.year === parseInt(selectedYear) && 
          e.term === parseInt(selectedTerm) as 1 | 2
        )
      );
      
      if (subjectMarks.length > 0) {
        const total = subjectMarks.reduce((sum, m) => sum + m.score, 0);
        studentSubjectAverages[subject.id] = Math.round(total / subjectMarks.length);
      }
    });
    
    const subjectValues = Object.values(studentSubjectAverages);
    const average = subjectValues.length > 0
      ? subjectValues.reduce((sum, avg) => sum + avg, 0) / subjectValues.length
      : 0;
    
    return {
      studentId: s.id,
      average,
    };
  });
  
  // Sort by average score (descending)
  studentAverages.sort((a, b) => b.average - a.average);
  
  // Find position of current student
  const position = studentAverages.findIndex(item => item.studentId === studentId) + 1;
  
  return `${position} out of ${classmates.length}`;
};

// Helper function to generate a summary of student performance
export const getStudentPerformanceSummary = (
  studentId: string,
  students: Student[],
  exams: Exam[],
  marks: Mark[],
  selectedYear: string,
  selectedTerm: string
) => {
  const student = students.find(s => s.id === studentId);
  if (!student) return { 
    summary: "performance information not available",
    averageScore: 0,
    grade: "N/A" 
  };
  
  // Find relevant exams
  const relevantExams = exams.filter(
    e => e.year === parseInt(selectedYear) && 
         e.term === parseInt(selectedTerm) as 1 | 2 && 
         e.form === student.form
  );
  
  // Find student marks for these exams
  const studentMarks = marks.filter(
    m => m.studentId === studentId && 
    relevantExams.some(e => e.id === m.examId)
  );
  
  // Calculate average score
  if (studentMarks.length === 0) {
    return { 
      summary: "no recorded marks for this term",
      averageScore: 0,
      grade: "N/A" 
    };
  }
  
  const totalScore = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
  const averageScore = Math.round(totalScore / studentMarks.length);
  
  // Get grade
  const grade = getGradeFromScore(averageScore);
  
  // Return appropriate message based on performance
  let summary = "";
  if (averageScore >= 80) {
    summary = `outstanding performance with an average of ${averageScore}%`;
  } else if (averageScore >= 70) {
    summary = `excellent performance with an average of ${averageScore}%`;
  } else if (averageScore >= 60) {
    summary = `very good performance with an average of ${averageScore}%`;
  } else if (averageScore >= 50) {
    summary = `good performance with an average of ${averageScore}%`;
  } else if (averageScore >= 40) {
    summary = `fair performance with an average of ${averageScore}%`;
  } else {
    summary = `performance that needs improvement, with an average of ${averageScore}%`;
  }
  
  return {
    summary,
    averageScore,
    grade
  };
};

// Generate PDF for student report
export const generateStudentPDF = async (
  studentId: string,
  students: Student[],
  forSharing: boolean = false
): Promise<string | null> => {
  const reportElement = document.getElementById(`student-report-${studentId}`);
  if (!reportElement) return null;
  
  toast.info("Generating PDF...");
  
  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    if (forSharing) {
      // Return blob URL for sharing
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      toast.success("PDF ready for sharing!");
      return blobUrl;
    } else {
      // Download the PDF
      const student = students.find(s => s.id === studentId);
      const fileName = student ? `${student.firstName}_${student.lastName}_report.pdf` : "student-report.pdf";
      pdf.save(fileName);
      toast.success("PDF downloaded successfully!");
      return null;
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
    return null;
  }
};

// Generate PDF for form report
export const generateFormPDF = async (): Promise<void> => {
  const reportElement = document.getElementById("form-report");
  if (!reportElement) return;
  
  toast.info("Generating PDF...");
  
  try {
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save("form-report.pdf");
    
    toast.success("PDF generated successfully!");
  } catch (error) {
    console.error("Error generating PDF:", error);
    toast.error("Failed to generate PDF");
  }
};
