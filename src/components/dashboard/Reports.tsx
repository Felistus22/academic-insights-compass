import React, { useState } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import StudentReportCard from "./reports/StudentReportCard";
import FormReport from "./reports/FormReport";
import BestPerformersReport from "./reports/BestPerformersReport";
import { Separator } from "@/components/ui/separator";
import { FileText, MessageSquare, Send, Phone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Student, ReportType } from "@/types";

const Reports: React.FC = () => {
  const { students, subjects, exams, marks } = useSupabaseAppContext();
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<string>("1");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // Phone number for sending messages
  const senderPhoneNumber = "+255697127596";
  
  // Available years and terms
  const availableYears = Array.from(new Set(exams.map(exam => exam.year))).sort();
  
  // Filter students by form and stream if needed
  const filteredStudents = React.useMemo(() => {
    let result = students;
    
    if (selectedForm !== "all") {
      result = result.filter(s => s.form === parseInt(selectedForm));
    }
    
    if (selectedStream !== "all") {
      result = result.filter(s => s.stream === selectedStream);
    }
    
    return result;
  }, [students, selectedForm, selectedStream]);
  
  // Generate PDF for student report
  const generateStudentPDF = async (forSharing: boolean = false, studentId: string = selectedStudent) => {
    const reportElement = document.getElementById(`student-report-${studentId}`);
    if (!reportElement) {
      toast.error("Report not found. Please select a student first.");
      return null;
    }
    
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
        setGeneratedPdfUrl(blobUrl);
        toast.success("PDF ready for sharing!");
        return blobUrl;
      } else {
        // Download the PDF
        const student = students.find(s => s.id === studentId);
        const fileName = student 
          ? `report-${student.firstName}-${student.lastName}-form${student.form}.pdf` 
          : "student-report.pdf";
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
  const generateFormPDF = async () => {
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
  
  // Toggle student selection for batch operations
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };
  
  // Select all students in the current form/stream
  const selectAllStudents = () => {
    setSelectedStudentIds(filteredStudents.map(student => student.id));
  };
  
  // Deselect all students
  const deselectAllStudents = () => {
    setSelectedStudentIds([]);
  };
  
  // Helper function to get student position info
  const getStudentPositionInfo = (studentId: string): string => {
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
  
  // Enhanced helper function to generate a comprehensive summary of student performance
  const getStudentPerformanceSummary = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { 
      summary: "performance information not available",
      averageScore: 0,
      grade: "N/A",
      gpa: 0,
      division: "N/A",
      totalPoints: 0,
      subjectBreakdown: [],
      position: "N/A"
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
    
    if (studentMarks.length === 0) {
      return { 
        summary: "no recorded marks for this term",
        averageScore: 0,
        grade: "N/A",
        gpa: 0,
        division: "N/A",
        totalPoints: 0,
        subjectBreakdown: [],
        position: "N/A"
      };
    }
    
    // Calculate subject averages and grades
    const subjectPerformance: Array<{
      subject: string;
      average: number;
      grade: string;
      points: number;
    }> = [];
    
    let totalScore = 0;
    let totalGpaPoints = 0;
    let totalPoints = 0;
    let subjectCount = 0;
    
    subjects.forEach(subject => {
      const subjectMarks = studentMarks.filter(m => m.subjectId === subject.id);
      if (subjectMarks.length > 0) {
        const subjectTotal = subjectMarks.reduce((sum, m) => sum + m.score, 0);
        const subjectAverage = Math.round(subjectTotal / subjectMarks.length);
        const grade = getGradeFromScore(subjectAverage);
        const points = getPointsFromGrade(grade);
        
        subjectPerformance.push({
          subject: subject.name,
          average: subjectAverage,
          grade,
          points
        });
        
        totalScore += subjectAverage;
        totalGpaPoints += points;
        totalPoints += points;
        subjectCount++;
      }
    });
    
    const averageScore = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
    const gpa = subjectCount > 0 ? Math.round((totalGpaPoints / subjectCount) * 100) / 100 : 0;
    const overallGrade = getGradeFromScore(averageScore);
    const division = getDivisionFromGPA(gpa);
    const position = getStudentPositionInfo(studentId);
    
    // Create comprehensive summary
    let summary = "";
    if (averageScore >= 80) {
      summary = `outstanding performance with an average of ${averageScore}% (Grade ${overallGrade})`;
    } else if (averageScore >= 70) {
      summary = `excellent performance with an average of ${averageScore}% (Grade ${overallGrade})`;
    } else if (averageScore >= 60) {
      summary = `very good performance with an average of ${averageScore}% (Grade ${overallGrade})`;
    } else if (averageScore >= 50) {
      summary = `good performance with an average of ${averageScore}% (Grade ${overallGrade})`;
    } else if (averageScore >= 40) {
      summary = `fair performance with an average of ${averageScore}% (Grade ${overallGrade})`;
    } else {
      summary = `performance that needs improvement, with an average of ${averageScore}% (Grade ${overallGrade})`;
    }
    
    return {
      summary,
      averageScore,
      grade: overallGrade,
      gpa,
      division,
      totalPoints,
      subjectBreakdown: subjectPerformance,
      position
    };
  };
  
  // Helper function to get grade from score
  const getGradeFromScore = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };
  
  // Updated helper function to calculate points from grade
  const getPointsFromGrade = (grade: string): number => {
    switch (grade) {
      case "A": return 4;
      case "B": return 3;
      case "C": return 2;
      case "D": return 1;
      case "F": return 0;
      default: return 0;
    }
  };

  // Updated helper function to calculate division from GPA
  const getDivisionFromGPA = (gpa: number): string => {
    if (gpa >= 3.5) return "I";
    if (gpa >= 3.0) return "II";
    if (gpa >= 2.0) return "III";
    if (gpa >= 1.0) return "IV";
    return "F";
  };
  
  // Enhanced SMS function with comprehensive academic data
  const sendSMS = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Get comprehensive performance data for the SMS
    const performanceData = getStudentPerformanceSummary(studentId);
    const studentName = `${student.firstName} ${student.lastName}`;
    
    // Create a detailed SMS message with all key academic metrics
    const smsMessage = 
      `📚 ACADEMIC REPORT - ${studentName}\n` +
      `📊 Overall Average: ${performanceData.averageScore}%\n` +
      `🎯 Grade: ${performanceData.grade} | GPA: ${performanceData.gpa}\n` +
      `🏆 Division: ${performanceData.division}\n` +
      `📍 Class Position: ${performanceData.position}\n` +
      `📈 Total Points: ${performanceData.totalPoints}\n\n` +
      `📋 Subject Performance:\n` +
      performanceData.subjectBreakdown.slice(0, 5).map(subject => 
        `• ${subject.subject}: ${subject.average}% *(Grade ${subject.grade})*`
      ).join('\n') +
      (performanceData.subjectBreakdown.length > 5 ? '\n...and more subjects' : '') +
      `\n\n📞 Contact school for full detailed report card.\n` +
      `📄 Download the full PDF report by clicking the download button in the reports section.`;
    
    toast.info(`Sending comprehensive report to ${student.guardianName} at ${student.guardianPhone}...`);
    console.log("Enhanced SMS message content:", smsMessage);
    console.log(`Sending from ${senderPhoneNumber} to ${student.guardianPhone}`);
    
    // Simulate API call for SMS
    return new Promise<void>(resolve => {
      setTimeout(() => {
        toast.success(`Comprehensive report summary sent to ${student.guardianName} successfully!`);
        resolve();
      }, 2000);
    });
  };
  
  // Send batch SMS to multiple students
  const sendBatchSMS = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    
    setIsSending(true);
    toast.info(`Sending comprehensive reports to ${selectedStudentIds.length} guardians...`);
    
    try {
      // Process in batches of 5 to avoid overwhelming the system
      for (let i = 0; i < selectedStudentIds.length; i += 5) {
        const batch = selectedStudentIds.slice(i, i + 5);
        await Promise.all(batch.map(id => sendSMS(id)));
      }
      
      toast.success(`Successfully sent ${selectedStudentIds.length} comprehensive reports!`);
    } catch (error) {
      console.error("Error sending batch SMS:", error);
      toast.error("An error occurred while sending reports");
    } finally {
      setIsSending(false);
    }
  };

  // Enhanced WhatsApp sharing with comprehensive academic summary and PDF download link
  const shareViaWhatsApp = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const studentName = `${student.firstName} ${student.lastName}`;
    const performanceData = getStudentPerformanceSummary(studentId);
    
    // Create comprehensive WhatsApp message with all academic details
    const message = encodeURIComponent(
      `🎓 *ACADEMIC REPORT CARD*\n` +
      `👩‍🎓 Student: *${studentName}*\n` +
      `📅 Academic Period: ${selectedYear} Term ${selectedTerm}\n` +
      `📚 Class: Form ${student.form}${student.stream ? ` ${student.stream}` : ''}\n\n` +
      
      `📊 *OVERALL PERFORMANCE SUMMARY:*\n` +
      `• Overall Average: *${performanceData.averageScore}%*\n` +
      `• Overall Grade: *${performanceData.grade}*\n` +
      `• GPA: *${performanceData.gpa}/4.0*\n` +
      `• Division: *${performanceData.division}*\n` +
      `• Class Position: *${performanceData.position}*\n` +
      `• Total Points: *${performanceData.totalPoints}*\n\n` +
      
      `📋 *SUBJECT BREAKDOWN:*\n` +
      performanceData.subjectBreakdown.map(subject => 
        `• ${subject.subject}: ${subject.average}% *(Grade ${subject.grade})*`
      ).join('\n') + '\n\n' +
      
      `📈 *ACADEMIC INSIGHT:*\n` +
      `Your child has demonstrated ${performanceData.summary}.\n\n` +
      
      `📄 *COMPLETE REPORT CARD:*\n` +
      `Please download the PDF report card from the school's reports section for the full detailed breakdown, teacher comments, and performance charts.\n\n` +
      
      `📞 For any questions about this report or to schedule a parent-teacher meeting, please contact the school.\n\n` +
      
      `🏫 *St. Padre Pio Girls Secondary School*\n` +
      `📧 st.padrepiogirls@gmail.com\n` +
      `📱 0682 159 199`
    );
    
    // Open WhatsApp with comprehensive pre-filled message
    const whatsappURL = `https://api.whatsapp.com/send?phone=${student.guardianPhone.replace(/\D/g, '')}&text=${message}`;
    window.open(whatsappURL, '_blank');
    
    toast.success(`Opening WhatsApp to send comprehensive report to ${student.guardianName}. Please use the Download PDF button to get the full report.`);
  };
  
  // Generate PDFs for all students in form/stream
  const generateBatchReportCards = async () => {
    if (filteredStudents.length === 0) {
      toast.error("No students found for the selected form/stream");
      return;
    }

    toast.info(`Generating ${filteredStudents.length} report cards...`);
    
    try {
      for (let i = 0; i < filteredStudents.length; i++) {
        const student = filteredStudents[i];
        
        // Wait a bit between generations to avoid overwhelming the browser
        if (i > 0) await new Promise(resolve => setTimeout(resolve, 500));
        
        await generateStudentPDF(false, student.id);
        
        // Show progress
        if (i % 5 === 0 || i === filteredStudents.length - 1) {
          toast.info(`Generated ${i + 1}/${filteredStudents.length} report cards...`);
        }
      }
      
      toast.success(`Successfully generated ${filteredStudents.length} report cards!`);
    } catch (error) {
      console.error("Error generating batch PDFs:", error);
      toast.error("Failed to generate some report cards");
    }
  };

  // Share batch reports via WhatsApp
  const shareBatchViaWhatsApp = async () => {
    if (selectedStudentIds.length === 0) {
      toast.error("Please select at least one student");
      return;
    }
    
    setIsSending(true);
    toast.info(`Preparing comprehensive WhatsApp reports for ${selectedStudentIds.length} guardians...`);
    
    try {
      // Process sequentially as each will open a new window
      for (const studentId of selectedStudentIds) {
        await shareViaWhatsApp(studentId);
        // Add a small delay between openings to avoid browser blocking
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (error) {
      console.error("Error sharing batch reports:", error);
      toast.error("An error occurred while preparing WhatsApp messages");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view performance reports
        </p>
      </div>
      
      <Tabs defaultValue="student" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="student">Student Report Card</TabsTrigger>
          <TabsTrigger value="form">Form Performance</TabsTrigger>
          <TabsTrigger value="best-performers">Best Performers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - Form {student.form}{student.stream ? ` ${student.stream}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="form">Form</Label>
                  <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Forms</SelectItem>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                      <SelectItem value="4">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Select
                    value={selectedTerm}
                    onValueChange={setSelectedTerm}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Term 1</SelectItem>
                      <SelectItem value="2">Term 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedStudent && (
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button onClick={() => generateStudentPDF()}>
                    <FileText className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => sendSMS(selectedStudent)}
                    className="bg-blue-500 text-white hover:bg-blue-600 border-0"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Comprehensive SMS Report
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => shareViaWhatsApp(selectedStudent)}
                    className="bg-green-500 text-white hover:bg-green-600 border-0"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Share Detailed Report via WhatsApp
                  </Button>
                </div>
              )}
              
              {generatedPdfUrl && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">PDF ready for sharing:</p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => {
                        if (generatedPdfUrl) {
                          window.open(generatedPdfUrl, '_blank');
                        }
                      }}
                    >
                      Open PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setGeneratedPdfUrl(null)}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Display the selected student's report card */}
          {selectedStudent && (
            <div className="mt-6">
              <StudentReportCard
                studentId={selectedStudent}
                year={parseInt(selectedYear)}
                term={parseInt(selectedTerm) as 1 | 2}
              />
            </div>
          )}
          
          {/* Bulk PDF Download Card */}
          <Card>
            <CardHeader>
              <CardTitle>Bulk PDF Download</CardTitle>
              <p className="text-sm text-muted-foreground">
                Download all report cards for a specific form or stream for easy printing
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-form">Form</Label>
                    <Select
                      value={selectedForm}
                      onValueChange={setSelectedForm}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Form 1</SelectItem>
                        <SelectItem value="2">Form 2</SelectItem>
                        <SelectItem value="3">Form 3</SelectItem>
                        <SelectItem value="4">Form 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bulk-stream">Stream</Label>
                    <Select
                      value={selectedStream}
                      onValueChange={setSelectedStream}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Streams</SelectItem>
                        <SelectItem value="A">Stream A</SelectItem>
                        <SelectItem value="B">Stream B</SelectItem>
                        <SelectItem value="C">Stream C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Form {selectedForm} {selectedStream !== 'all' ? `Stream ${selectedStream}` : '(All Streams)'}
                    </p>
                  </div>
                  <Button 
                    onClick={generateBatchReportCards}
                    disabled={filteredStudents.length === 0}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download {filteredStudents.length} Report Cards
                  </Button>
                </div>
                
                {filteredStudents.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <p>This will download individual PDF report cards for each student:</p>
                    <ul className="mt-2 space-y-1">
                      {filteredStudents.slice(0, 5).map(student => (
                        <li key={student.id} className="flex justify-between">
                          <span>{student.firstName} {student.lastName}</span>
                          <span>report-{student.firstName}-{student.lastName}-form{student.form}.pdf</span>
                        </li>
                      ))}
                      {filteredStudents.length > 5 && (
                        <li className="text-muted-foreground italic">
                          ... and {filteredStudents.length - 5} more students
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Batch Operations Card */}
          <Card>
            <CardHeader>
              <CardTitle>Batch Report Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Select students to perform batch operations with comprehensive academic summaries
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={selectAllStudents}
                    >
                      Select All
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={deselectAllStudents}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <table className="w-full">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="w-12 p-2 text-center">
                          <Checkbox 
                            checked={
                              filteredStudents.length > 0 && 
                              selectedStudentIds.length === filteredStudents.length
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                selectAllStudents();
                              } else {
                                deselectAllStudents();
                              }
                            }}
                          />
                        </th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Admission No.</th>
                        <th className="p-2 text-left">Form</th>
                        <th className="p-2 text-left">Guardian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => (
                          <tr key={student.id} className="border-t hover:bg-muted/50">
                            <td className="p-2 text-center">
                              <Checkbox
                                checked={selectedStudentIds.includes(student.id)}
                                onCheckedChange={() => toggleStudentSelection(student.id)}
                              />
                            </td>
                            <td className="p-2">{student.firstName} {student.lastName}</td>
                            <td className="p-2">{student.admissionNumber}</td>
                            <td className="p-2">Form {student.form}{student.stream ? ` ${student.stream}` : ''}</td>
                            <td className="p-2">{student.guardianName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-muted-foreground">
                            No students match the selected criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {selectedStudentIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    <p className="w-full text-sm">
                      {selectedStudentIds.length} student(s) selected for comprehensive reporting
                    </p>
                    <Button 
                      onClick={sendBatchSMS}
                      disabled={isSending}
                      className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send {selectedStudentIds.length} Comprehensive SMS Reports
                    </Button>
                    <Button 
                      className="bg-green-500 text-white hover:bg-green-600"
                      onClick={shareBatchViaWhatsApp}
                      disabled={isSending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Share {selectedStudentIds.length} Detailed Reports via WhatsApp
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Hidden report cards for batch operations */}
          <div className="hidden">
            {/* Render all filtered students' report cards for bulk PDF generation */}
            {filteredStudents.map((student) => (
              <div key={student.id} id={`student-report-${student.id}`}>
                <StudentReportCard
                  studentId={student.id}
                  year={parseInt(selectedYear)}
                  term={parseInt(selectedTerm) as 1 | 2}
                />
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Form and Term</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="form">Form</Label>
                  <Select
                    value={selectedForm}
                    onValueChange={setSelectedForm}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                      <SelectItem value="4">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream</Label>
                  <Select
                    value={selectedStream}
                    onValueChange={setSelectedStream}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Streams</SelectItem>
                      <SelectItem value="A">Stream A</SelectItem>
                      <SelectItem value="B">Stream B</SelectItem>
                      <SelectItem value="C">Stream C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year</Label>
                  <Select
                    value={selectedYear}
                    onValueChange={setSelectedYear}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="term">Term</Label>
                  <Select
                    value={selectedTerm}
                    onValueChange={setSelectedTerm}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Term 1</SelectItem>
                      <SelectItem value="2">Term 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={generateFormPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={sendBatchSMS}
                  disabled={isSending}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Send Comprehensive Reports to All Form {selectedForm} Guardians
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div id="form-report">
            <FormReport
              form={parseInt(selectedForm)}
              year={parseInt(selectedYear)}
              term={parseInt(selectedTerm) as 1 | 2}
              stream={selectedStream}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="best-performers" className="space-y-4">
          <BestPerformersReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
