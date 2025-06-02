
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

  // Get current exam
  const currentExam = formExams.find(exam => exam.id === selectedExam);

  // Calculate student performance and rankings for the selected exam
  const getStudentRankings = () => {
    if (!currentExam) return [];

    const studentPerformance = formStudents.map(student => {
      // Get marks for current exam
      const currentMarks = marks.filter(mark => 
        mark.studentId === student.id && mark.examId === currentExam.id
      );

      // Calculate current average
      const currentAverage = currentMarks.length > 0 
        ? currentMarks.reduce((sum, mark) => sum + mark.score, 0) / currentMarks.length 
        : 0;

      return {
        student,
        average: Math.round(currentAverage * 100) / 100,
        subjectCount: currentMarks.length,
        marks: currentMarks
      };
    });

    // Sort by average and add ranking
    const rankedStudents = studentPerformance
      .filter(perf => perf.subjectCount > 0)
      .sort((a, b) => b.average - a.average)
      .map((perf, index) => ({
        ...perf,
        rank: index + 1
      }));

    return rankedStudents;
  };

  const studentRankings = getStudentRankings();

  // Calculate class statistics
  const classStats = {
    totalStudents: formStudents.length,
    studentsWithMarks: studentRankings.length,
    averageMark: studentRankings.length > 0
      ? Math.round((studentRankings.reduce((sum, student) => sum + student.average, 0) / studentRankings.length) * 100) / 100
      : 0,
    passRate: studentRankings.length > 0
      ? Math.round((studentRankings.filter(student => student.average >= 50).length / studentRankings.length) * 100)
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

    const highestScore = subjectMarks.length > 0 
      ? Math.max(...subjectMarks.map(mark => mark.score))
      : 0;

    const lowestScore = subjectMarks.length > 0 
      ? Math.min(...subjectMarks.map(mark => mark.score))
      : 0;

    return {
      name: subject.name,
      average: Math.round(average * 100) / 100,
      highest: highestScore,
      lowest: lowestScore,
      studentsCount: subjectMarks.length
    };
  }).filter(subject => subject.average > 0);

  // Grade distribution data
  const gradeDistribution = [
    { name: 'A (80-100)', value: studentRankings.filter(s => s.average >= 80).length, color: '#10B981' },
    { name: 'B (65-79)', value: studentRankings.filter(s => s.average >= 65 && s.average < 80).length, color: '#3B82F6' },
    { name: 'C (50-64)', value: studentRankings.filter(s => s.average >= 50 && s.average < 65).length, color: '#F59E0B' },
    { name: 'D (40-49)', value: studentRankings.filter(s => s.average >= 40 && s.average < 50).length, color: '#EF4444' },
    { name: 'F (0-39)', value: studentRankings.filter(s => s.average < 40).length, color: '#6B7280' }
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

        {/* Student Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Student Rankings</CardTitle>
            <CardDescription>
              Top performing students in {currentExam.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {studentRankings.map((ranking) => (
                <div key={ranking.student.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="w-10 h-8 rounded-full flex items-center justify-center font-bold">
                      {ranking.rank}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {ranking.student.firstName} {ranking.student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {ranking.student.admissionNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-lg">
                      {ranking.average}%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {ranking.subjectCount} subjects
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance Summary</CardTitle>
            <CardDescription>
              Detailed breakdown by subject for {currentExam.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject) => (
                <div key={subject.name} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{subject.name}</h4>
                    <Badge variant="secondary">{subject.studentsCount} students</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Average</p>
                      <p className="font-medium text-lg">{subject.average}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Highest</p>
                      <p className="font-medium text-lg text-green-600">{subject.highest}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lowest</p>
                      <p className="font-medium text-lg text-red-600">{subject.lowest}%</p>
                    </div>
                  </div>
                </div>
              ))}
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
