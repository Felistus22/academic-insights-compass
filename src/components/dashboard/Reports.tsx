
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
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
import { Separator } from "@/components/ui/separator";
import { FileText, MessageSquare, Share, Phone } from "lucide-react";

const Reports: React.FC = () => {
  const { students, subjects, exams, marks } = useAppContext();
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<string>("1");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  
  // Available years and terms
  const availableYears = Array.from(new Set(exams.map(exam => exam.year))).sort();
  
  // Generate PDF for student report
  const generateStudentPDF = async (forSharing: boolean = false) => {
    const reportElement = document.getElementById("student-report");
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
        setGeneratedPdfUrl(blobUrl);
        toast.success("PDF ready for sharing!");
        return blobUrl;
      } else {
        // Download the PDF
        pdf.save("student-report.pdf");
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
  
  // Simulate sending SMS with detailed performance data
  const sendSMS = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Get performance data for the SMS
    const performanceSummary = getStudentPerformanceSummary(studentId);
    const positionInfo = getStudentPositionInfo(studentId);
    const studentName = `${student.firstName} ${student.lastName}`;
    
    // Create a more detailed SMS message
    const smsMessage = 
      `Academic Report - ${studentName}: Average score: ${performanceSummary.averageScore}%, 
      Grade: ${performanceSummary.grade}, 
      Class Position: ${positionInfo}, 
      Term ${selectedTerm}, ${selectedYear}`;
    
    toast.info(`Sending report to ${student.guardianName} at ${student.guardianPhone}...`);
    console.log("SMS message content:", smsMessage);
    
    // Simulate API call for SMS
    setTimeout(() => {
      toast.success(`Report summary sent to ${student.guardianName} successfully!`);
    }, 2000);
  };

  // Share report via WhatsApp with PDF attachment instructions
  const shareViaWhatsApp = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Generate PDF first
    const pdfUrl = await generateStudentPDF(true);
    if (!pdfUrl) {
      toast.error("Failed to generate PDF for sharing");
      return;
    }
    
    const studentName = `${student.firstName} ${student.lastName}`;
    const performanceSummary = getStudentPerformanceSummary(studentId);
    
    // Create message with instructions to attach the downloaded PDF
    const message = encodeURIComponent(
      `Hello ${student.guardianName}, this is an update from the school regarding ${studentName}'s academic report card for ${selectedYear} Term ${selectedTerm}. The report shows ${performanceSummary.summary}. Average: ${performanceSummary.averageScore}%, Position: ${getStudentPositionInfo(studentId)}. I've prepared a PDF report that I'll share with you separately.`
    );
    
    // Open WhatsApp with pre-filled message to send TO the guardian
    const whatsappURL = `https://api.whatsapp.com/send?phone=${student.guardianPhone.replace(/\D/g, '')}&text=${message}`;
    window.open(whatsappURL, '_blank');
    
    toast.success(`Opening WhatsApp to send message to ${student.guardianName}. Please share the downloaded PDF separately.`);
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
  
  // Helper function to generate a summary of student performance
  const getStudentPerformanceSummary = (studentId: string) => {
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
  
  // Helper function to get grade from score
  const getGradeFromScore = (score: number): string => {
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
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view performance reports
        </p>
      </div>
      
      <Tabs defaultValue="student" className="space-y-4">
        <TabsList>
          <TabsTrigger value="student">Student Report Card</TabsTrigger>
          <TabsTrigger value="form">Form Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Student</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Student</Label>
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} - Form {student.form}
                        </SelectItem>
                      ))}
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
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send SMS to Guardian
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => shareViaWhatsApp(selectedStudent)}
                    className="bg-green-500 text-white hover:bg-green-600 border-0"
                  >
                    <Share className="mr-2 h-4 w-4" />
                    Share via WhatsApp
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
          
          {selectedStudent && (
            <StudentReportCard
              studentId={selectedStudent}
              year={parseInt(selectedYear)}
              term={parseInt(selectedTerm) as 1 | 2}
            />
          )}
        </TabsContent>
        
        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Form and Term</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>
            </CardContent>
          </Card>
          
          <FormReport
            form={parseInt(selectedForm)}
            year={parseInt(selectedYear)}
            term={parseInt(selectedTerm) as 1 | 2}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
