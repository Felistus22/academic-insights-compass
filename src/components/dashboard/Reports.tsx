
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
import { FilePdf, MessageSquare, Send, Share, WhatsApp } from "lucide-react";

const Reports: React.FC = () => {
  const { students, subjects, exams, marks } = useAppContext();
  
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedForm, setSelectedForm] = useState<string>("1");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  
  // Available years and terms
  const availableYears = Array.from(new Set(exams.map(exam => exam.year))).sort();
  
  // Generate PDF for student report
  const generateStudentPDF = async () => {
    const reportElement = document.getElementById("student-report");
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
      pdf.save("student-report.pdf");
      
      toast.success("PDF generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
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
  
  // Simulate sending SMS
  const sendSMS = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    toast.info(`Sending report to ${student.guardianName} at ${student.guardianPhone}...`);
    
    // Simulate API call
    setTimeout(() => {
      toast.success(`Report sent to ${student.guardianName} successfully!`);
    }, 2000);
  };

  // Share report via WhatsApp
  const shareViaWhatsApp = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const studentName = `${student.firstName} ${student.lastName}`;
    const message = encodeURIComponent(
      `Dear ${student.guardianName}, here is the academic report card for ${studentName} for ${selectedYear} Term ${selectedTerm}. Please review it at your earliest convenience.`
    );
    
    // Open WhatsApp with pre-filled message
    const whatsappURL = `https://wa.me/${student.guardianPhone.replace(/\D/g, '')}?text=${message}`;
    window.open(whatsappURL, '_blank');
    
    toast.success(`Opening WhatsApp to share report with ${student.guardianName}`);
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
                  <Button onClick={generateStudentPDF}>
                    <FilePdf className="mr-2 h-4 w-4" />
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
                    <WhatsApp className="mr-2 h-4 w-4" />
                    Share via WhatsApp
                  </Button>
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
                  <FilePdf className="mr-2 h-4 w-4" />
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
