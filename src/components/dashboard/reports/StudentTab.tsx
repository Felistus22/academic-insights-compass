
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileText, MessageSquare, Share } from "lucide-react";
import { toast } from "sonner";
import StudentReportCard from "./StudentReportCard";
import { generateStudentPDF, getStudentPerformanceSummary, getStudentPositionInfo } from "@/utils/reportUtils";

const StudentTab: React.FC = () => {
  const { students, subjects, exams, marks } = useAppContext();
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  
  // Available years
  const availableYears = Array.from(new Set(exams.map(exam => exam.year))).sort();
  
  // Simulate sending SMS with detailed performance data
  const sendSMS = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    // Get performance data for the SMS
    const performanceSummary = getStudentPerformanceSummary(
      studentId,
      students,
      exams,
      marks,
      selectedYear,
      selectedTerm
    );
    const positionInfo = getStudentPositionInfo(
      studentId,
      students,
      subjects,
      exams,
      marks,
      selectedYear,
      selectedTerm
    );
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
    const pdfUrl = await generateStudentPDF(studentId, students, true);
    if (!pdfUrl) {
      toast.error("Failed to generate PDF for sharing");
      return;
    }
    
    setGeneratedPdfUrl(pdfUrl);
    
    const studentName = `${student.firstName} ${student.lastName}`;
    const performanceSummary = getStudentPerformanceSummary(
      studentId,
      students,
      exams,
      marks,
      selectedYear,
      selectedTerm
    );
    
    // Create message with instructions to attach the downloaded PDF
    const message = encodeURIComponent(
      `Hello ${student.guardianName}, this is an update from the school regarding ${studentName}'s academic report card for ${selectedYear} Term ${selectedTerm}. The report shows ${performanceSummary.summary}. Average: ${performanceSummary.averageScore}%, Position: ${getStudentPositionInfo(studentId, students, subjects, exams, marks, selectedYear, selectedTerm)}. I've prepared a PDF report that I'll share with you separately.`
    );
    
    // Open WhatsApp with pre-filled message to send TO the guardian
    const whatsappURL = `https://api.whatsapp.com/send?phone=${student.guardianPhone.replace(/\D/g, '')}&text=${message}`;
    window.open(whatsappURL, '_blank');
    
    toast.success(`Opening WhatsApp to send message to ${student.guardianName}. Please share the downloaded PDF separately.`);
  };
  
  return (
    <div className="space-y-4">
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
              <Button onClick={() => generateStudentPDF(selectedStudent, students)}>
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
          containerId={`student-report-${selectedStudent}`}
        />
      )}
    </div>
  );
};

export default StudentTab;
