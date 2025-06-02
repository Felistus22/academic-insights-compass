
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, FileText, Users, BookOpen, MessageSquare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FormReport: React.FC = () => {
  const { students, marks, exams, subjects } = useAppContext();
  const [selectedForm, setSelectedForm] = useState<number>(1);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingReport, setIsSendingReport] = useState(false);

  // Filter students by form
  const formStudents = students.filter(student => student.form === selectedForm);

  // Get exams for the selected form
  const formExams = exams
    .filter(exam => exam.form === selectedForm)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Get current exam and previous exam for improvement calculation
  const currentExam = formExams.find(exam => exam.id === selectedExam);
  const currentExamIndex = formExams.findIndex(exam => exam.id === selectedExam);
  const previousExam = currentExamIndex < formExams.length - 1 ? formExams[currentExamIndex + 1] : null;

  // Calculate student performance and improvements
  const getStudentPerformance = () => {
    if (!currentExam) return [];

    const studentPerformance = formStudents.map(student => {
      // Get marks for current exam
      const currentMarks = marks.filter(mark => 
        mark.studentId === student.id && mark.examId === currentExam.id
      );
      
      // Get marks for previous exam (if exists)
      const previousMarks = previousExam ? marks.filter(mark => 
        mark.studentId === student.id && mark.examId === previousExam.id
      ) : [];

      // Calculate current average
      const currentAverage = currentMarks.length > 0 
        ? currentMarks.reduce((sum, mark) => sum + mark.score, 0) / currentMarks.length 
        : 0;

      // Calculate previous average
      const previousAverage = previousMarks.length > 0 
        ? previousMarks.reduce((sum, mark) => sum + mark.score, 0) / previousMarks.length 
        : 0;

      // Calculate improvement (only if there's a previous exam)
      const improvement = previousExam && previousAverage > 0 
        ? currentAverage - previousAverage 
        : 0;

      return {
        student,
        currentAverage: Math.round(currentAverage * 100) / 100,
        previousAverage: Math.round(previousAverage * 100) / 100,
        improvement: Math.round(improvement * 100) / 100,
        subjectCount: currentMarks.length
      };
    });

    return studentPerformance.filter(perf => perf.subjectCount > 0);
  };

  const studentPerformance = getStudentPerformance();

  // Get 10 most improved students (only if there's a previous exam)
  const mostImprovedStudents = previousExam 
    ? studentPerformance
        .filter(perf => perf.improvement > 0) // Only students who improved
        .sort((a, b) => b.improvement - a.improvement)
        .slice(0, 10)
    : [];

  // Get top 10 students by current performance (fallback if no previous exam)
  const topStudents = studentPerformance
    .sort((a, b) => b.currentAverage - a.currentAverage)
    .slice(0, 10);

  // Calculate class statistics
  const classStats = {
    totalStudents: formStudents.length,
    studentsWithMarks: studentPerformance.length,
    averageMark: studentPerformance.length > 0
      ? Math.round((studentPerformance.reduce((sum, perf) => sum + perf.currentAverage, 0) / studentPerformance.length) * 100) / 100
      : 0,
    passRate: studentPerformance.length > 0
      ? Math.round((studentPerformance.filter(perf => perf.currentAverage >= 50).length / studentPerformance.length) * 100)
      : 0
  };

  // Subject performance data for chart
  const subjectPerformance = subjects.map(subject => {
    const subjectMarks = marks.filter(mark => 
      mark.subjectId === subject.id && 
      mark.examId === selectedExam &&
      formStudents.some(student => student.id === mark.studentId)
    );

    const average = subjectMarks.length > 0
      ? subjectMarks.reduce((sum, mark) => sum + mark.score, 0) / subjectMarks.length
      : 0;

    return {
      name: subject.name,
      average: Math.round(average * 100) / 100
    };
  }).filter(subject => subject.average > 0);

  // Grade distribution data
  const gradeDistribution = [
    { name: 'A (80-100)', value: studentPerformance.filter(p => p.currentAverage >= 80).length, color: '#10B981' },
    { name: 'B (65-79)', value: studentPerformance.filter(p => p.currentAverage >= 65 && p.currentAverage < 80).length, color: '#3B82F6' },
    { name: 'C (50-64)', value: studentPerformance.filter(p => p.currentAverage >= 50 && p.currentAverage < 65).length, color: '#F59E0B' },
    { name: 'D (40-49)', value: studentPerformance.filter(p => p.currentAverage >= 40 && p.currentAverage < 50).length, color: '#EF4444' },
    { name: 'F (0-39)', value: studentPerformance.filter(p => p.currentAverage < 40).length, color: '#6B7280' }
  ].filter(grade => grade.value > 0);

  const generatePDF = async () => {
    if (!currentExam) {
      toast.error("Please select an exam first");
      return;
    }

    setIsGeneratingPDF(true);
    toast.info("Generating PDF report...");

    try {
      const reportElement = document.getElementById('form-report-content');
      if (!reportElement) throw new Error("Report content not found");

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.getImageData();
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `Form_${selectedForm}_Report_${currentExam.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sendReport = async () => {
    if (!currentExam) {
      toast.error("Please select an exam first");
      return;
    }

    setIsSendingReport(true);
    toast.info("Sending report to guardians...");

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`Form ${selectedForm} report sent to ${formStudents.length} guardians via SMS from +255697127596`);
    } catch (error) {
      console.error("Error sending report:", error);
      toast.error("Failed to send report");
    } finally {
      setIsSendingReport(false);
    }
  };

  if (!currentExam) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Form Performance Report</h2>
          <p className="text-muted-foreground">
            Comprehensive performance analysis for each form
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Report Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form/Class</Label>
                <Select value={selectedForm.toString()} onValueChange={(value) => setSelectedForm(parseInt(value))}>
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
                <Label>Exam</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {formExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} ({exam.year})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Form {selectedForm} Performance Report</h2>
          <p className="text-muted-foreground">
            {currentExam.name} ({new Date(currentExam.date).toLocaleDateString()})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generatePDF} disabled={isGeneratingPDF}>
            <FileText className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
          <Button onClick={sendReport} disabled={isSendingReport}>
            <MessageSquare className="mr-2 h-4 w-4" />
            {isSendingReport ? "Sending..." : "Send to Guardians"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Form/Class</Label>
          <Select value={selectedForm.toString()} onValueChange={(value) => setSelectedForm(parseInt(value))}>
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
          <Label>Exam</Label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger>
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {formExams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.name} ({exam.year})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div id="form-report-content" className="space-y-6">
        {/* Class Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.totalStudents}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students with Marks</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.studentsWithMarks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.averageMark}%</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Badge className="text-xs">{classStats.passRate >= 60 ? "Good" : "Needs Improvement"}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classStats.passRate}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Most Improved Students (if previous exam exists) or Top Students */}
        <Card>
          <CardHeader>
            <CardTitle>
              {previousExam && mostImprovedStudents.length > 0 
                ? `Top 10 Most Improved Students (from ${previousExam.name})`
                : "Top 10 Students by Performance"
              }
            </CardTitle>
            <CardDescription>
              {previousExam && mostImprovedStudents.length > 0
                ? "Students showing the greatest improvement from previous exam"
                : "Highest performing students in this exam"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(mostImprovedStudents.length > 0 ? mostImprovedStudents : topStudents).map((performance, index) => (
                <div key={performance.student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {performance.student.firstName} {performance.student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {performance.student.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      Current: {performance.currentAverage}%
                    </p>
                    {previousExam && mostImprovedStudents.length > 0 && (
                      <p className="text-sm text-green-600">
                        Improved by: +{performance.improvement}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {mostImprovedStudents.length === 0 && previousExam && (
                <p className="text-center text-muted-foreground py-4">
                  No students showed improvement from the previous exam
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Marks by Subject</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="average" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Grade Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormReport;
