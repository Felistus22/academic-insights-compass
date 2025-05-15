
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, MessageSquare, Share, Download, CheckSquare } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import StudentReportCard from "./StudentReportCard";
import { getStudentPerformanceSummary } from "@/utils/reportUtils";

const BatchTab: React.FC = () => {
  const { students, subjects, exams, marks } = useAppContext();
  
  const [selectedForm, setSelectedForm] = useState<string>("1");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedTerm, setSelectedTerm] = useState<string>("1");
  const [selectedExamType, setSelectedExamType] = useState<string>("All");
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [batchProcessing, setBatchProcessing] = useState<boolean>(false);
  
  // Available years and exam types
  const availableYears = Array.from(new Set(exams.map(exam => exam.year))).sort();
  const availableExamTypes = ["All", "TermStart", "MidTerm", "EndTerm", "Custom"];
  
  // Generate batch PDFs for multiple students
  const generateBatchPDFs = async () => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }
    
    setBatchProcessing(true);
    toast.info(`Generating ${selectedStudents.length} PDFs. This may take a moment...`);
    
    try {
      // Create a combined PDF for all selected students
      const pdf = new jsPDF("p", "mm", "a4");
      
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentId = selectedStudents[i];
        const reportElement = document.getElementById(`student-report-${studentId}`);
        
        if (reportElement) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const canvas = await html2canvas(reportElement, {
            scale: 2,
            logging: false,
            useCORS: true,
          });
          
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 0;
          
          pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
          
          toast.success(`Processed ${i + 1}/${selectedStudents.length} reports`);
        }
      }
      
      // Save the combined PDF
      pdf.save(`Class_${selectedForm}_Term${selectedTerm}_${selectedYear}_Reports.pdf`);
      toast.success("Batch PDFs generated successfully!");
      
      // Create a blob URL for sharing
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(blobUrl);
      
    } catch (error) {
      console.error("Error generating batch PDFs:", error);
      toast.error("Failed to generate batch PDFs");
    } finally {
      setBatchProcessing(false);
    }
  };
  
  // Send SMS to multiple guardians
  const sendBatchSMS = () => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }
    
    toast.info(`Sending SMS to ${selectedStudents.length} guardians...`);
    
    let successCount = 0;
    
    selectedStudents.forEach(studentId => {
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
      
      // Create a more detailed SMS message
      const studentName = `${student.firstName} ${student.lastName}`;
      const smsMessage = 
        `Academic Report - ${studentName}: Average score: ${performanceSummary.averageScore}%, 
        Grade: ${performanceSummary.grade}, 
        Term ${selectedTerm}, ${selectedYear}`;
      
      console.log("SMS message content:", smsMessage);
      
      // Simulate API call for SMS
      setTimeout(() => {
        successCount++;
        if (successCount === selectedStudents.length) {
          toast.success(`Reports sent to all ${selectedStudents.length} guardians successfully!`);
        }
      }, 500);
    });
  };
  
  // Share batch reports via WhatsApp
  const shareBatchViaWhatsApp = async () => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }
    
    // First, generate the combined PDF
    setBatchProcessing(true);
    toast.info(`Preparing batch reports for WhatsApp...`);
    
    try {
      // Create a combined PDF for all selected students
      const pdf = new jsPDF("p", "mm", "a4");
      
      for (let i = 0; i < selectedStudents.length; i++) {
        const studentId = selectedStudents[i];
        const reportElement = document.getElementById(`student-report-${studentId}`);
        
        if (reportElement) {
          if (i > 0) {
            pdf.addPage();
          }
          
          const canvas = await html2canvas(reportElement, {
            scale: 2,
            logging: false,
            useCORS: true,
          });
          
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio) / 2;
          const imgY = 0;
          
          pdf.addImage(imgData, "JPEG", imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        }
      }
      
      // Create a blob URL
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setGeneratedPdfUrl(blobUrl);
      
      // Create a general message for all guardians
      const message = encodeURIComponent(
        `Hello Parents/Guardians, I'm sharing the academic reports for Form ${selectedForm}, Term ${selectedTerm}, ${selectedYear}. Please find the PDF report attached separately.`
      );
      
      // Create WhatsApp group message (since individual sharing would be tiresome)
      const whatsappURL = `https://api.whatsapp.com/send?text=${message}`;
      window.open(whatsappURL, '_blank');
      
      toast.success(`Batch reports ready for WhatsApp. Please share the generated PDF with the group.`);
    } catch (error) {
      console.error("Error preparing batch reports:", error);
      toast.error("Failed to prepare batch reports");
    } finally {
      setBatchProcessing(false);
    }
  };
  
  // Toggle student selection for batch processing
  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };
  
  // Select all students in the current form
  const selectAllStudentsInForm = () => {
    const formStudents = students.filter(s => s.form === parseInt(selectedForm))
                              .map(s => s.id);
    setSelectedStudents(formStudents);
  };
  
  // Filter students based on form and exam type if needed
  const filteredStudents = selectedExamType === "All" 
    ? students.filter(s => s.form === parseInt(selectedForm))
    : students.filter(s => {
        // Check if student has marks for the selected exam type
        const relevantExams = exams.filter(
          e => e.year === parseInt(selectedYear) && 
              e.term === parseInt(selectedTerm) as 1 | 2 && 
              e.form === s.form &&
              e.type === selectedExamType
        );
        
        return s.form === parseInt(selectedForm) && 
              marks.some(m => 
                m.studentId === s.id && 
                relevantExams.some(e => e.id === m.examId)
              );
      });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Batch Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="form">Form</Label>
              <Select
                value={selectedForm}
                onValueChange={(value) => {
                  setSelectedForm(value);
                  setSelectedStudents([]);
                }}
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
            
            <div className="space-y-2">
              <Label htmlFor="examType">Exam Type</Label>
              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Exam Type" />
                </SelectTrigger>
                <SelectContent>
                  {availableExamTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "All" ? "All Types" : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={selectAllStudentsInForm}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Select All Students
            </Button>
            
            <Button 
              disabled={selectedStudents.length === 0 || batchProcessing}
              onClick={generateBatchPDFs}
            >
              <Download className="mr-2 h-4 w-4" />
              Generate Batch PDFs
            </Button>
            
            <Button 
              variant="outline"
              disabled={selectedStudents.length === 0}
              onClick={sendBatchSMS}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Batch SMS
            </Button>
            
            <Button 
              className="bg-green-500 text-white hover:bg-green-600 border-0"
              disabled={selectedStudents.length === 0 || batchProcessing}
              onClick={shareBatchViaWhatsApp}
            >
              <Share className="mr-2 h-4 w-4" />
              Share Batch via WhatsApp
            </Button>
          </div>
          
          {batchProcessing && (
            <div className="mt-4">
              <p className="text-sm text-amber-500">Processing reports, please wait...</p>
            </div>
          )}
          
          {generatedPdfUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Batch PDF ready for sharing:</p>
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
          
          <div className="mt-6">
            <h3 className="font-medium mb-4">Select Students ({selectedStudents.length} selected)</h3>
            <div className="border rounded-md overflow-hidden">
              <div className="max-h-64 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Select</th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Admission No.</th>
                      <th className="px-4 py-2 text-left">Guardian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-center">
                          No students found in Form {selectedForm}
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => (
                        <tr key={student.id} className="border-t">
                          <td className="px-4 py-2">
                            <Checkbox 
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                            />
                          </td>
                          <td className="px-4 py-2">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-4 py-2">
                            {student.admissionNumber}
                          </td>
                          <td className="px-4 py-2">
                            {student.guardianName}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Hidden report cards for batch processing */}
          <div className="hidden">
            {selectedStudents.map(studentId => (
              <StudentReportCard
                key={studentId}
                studentId={studentId}
                year={parseInt(selectedYear)}
                term={parseInt(selectedTerm) as 1 | 2}
                containerId={`student-report-${studentId}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatchTab;
