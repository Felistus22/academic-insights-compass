import React, { useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface StudentReportCardProps {
  studentId: string;
  year: number;
  term: 1 | 2;
  containerId?: string; // Added prop for custom container ID
}

const StudentReportCard: React.FC<StudentReportCardProps> = ({
  studentId,
  year,
  term,
  containerId = "student-report", // Default ID for backward compatibility
}) => {
  const { students, subjects, exams, marks } = useAppContext();

  const student = useMemo(() => {
    return students.find(s => s.id === studentId);
  }, [studentId, students]);

  const relevantExams = useMemo(() => {
    return exams.filter(
      e => e.year === year && e.term === term && e.form === student?.form
    ).sort((a, b) => {
      // Sort by exam type
      const typeOrder: Record<string, number> = {
        "TermStart": 1,
        "MidTerm": 2,
        "EndTerm": 3,
        "Custom": 4,
      };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [exams, year, term, student]);

  const studentMarks = useMemo(() => {
    return marks.filter(
      m => m.studentId === studentId && 
      relevantExams.some(e => e.id === m.examId)
    );
  }, [marks, studentId, relevantExams]);

  // Calculate subject averages
  const subjectAverages = useMemo(() => {
    const averages: Record<string, number> = {};
    
    subjects.forEach(subject => {
      const subjectMarks = studentMarks.filter(m => m.subjectId === subject.id);
      if (subjectMarks.length > 0) {
        const total = subjectMarks.reduce((sum, m) => sum + m.score, 0);
        averages[subject.id] = Math.round(total / subjectMarks.length);
      }
    });
    
    return averages;
  }, [subjects, studentMarks]);

  // Generate data for the performance chart
  const chartData = useMemo(() => {
    const data: any[] = [];
    
    // Process current exams
    relevantExams.forEach(exam => {
      const examData: any = {
        name: exam.type === "Custom" ? exam.name : exam.type,
      };
      
      subjects.forEach(subject => {
        const mark = studentMarks.find(
          m => m.examId === exam.id && m.subjectId === subject.id
        );
        if (mark) {
          examData[subject.name] = mark.score;
        }
      });
      
      data.push(examData);
    });
    
    return data;
  }, [relevantExams, subjects, studentMarks]);

  // Generate colors for the chart
  const lineColors = [
    "#1E88E5", // Blue
    "#43A047", // Green
    "#FF8F00", // Amber
    "#E53935", // Red
    "#5E35B1", // Deep Purple
    "#00ACC1", // Cyan
    "#F4511E", // Deep Orange
    "#3949AB", // Indigo
  ];

  // Calculate total and average
  const totalMarks = useMemo(() => {
    return Object.values(subjectAverages).reduce((sum, avg) => sum + avg, 0);
  }, [subjectAverages]);
  
  const averageMark = useMemo(() => {
    const subjectCount = Object.keys(subjectAverages).length;
    return subjectCount > 0 ? Math.round(totalMarks / subjectCount) : 0;
  }, [totalMarks, subjectAverages]);
  
  // Get grade for average
  const getOverallGrade = (average: number): string => {
    if (average >= 80) return "A";
    if (average >= 75) return "A-";
    if (average >= 70) return "B+";
    if (average >= 65) return "B";
    if (average >= 60) return "B-";
    if (average >= 55) return "C+";
    if (average >= 50) return "C";
    if (average >= 45) return "C-";
    if (average >= 40) return "D+";
    if (average >= 35) return "D";
    if (average >= 30) return "D-";
    return "E";
  };
  
  // Calculate class position (simplified)
  const classPosition = useMemo(() => {
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
          relevantExams.some(e => e.id === m.examId)
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
  }, [student, students, subjects, marks, studentId, relevantExams]);

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <Card id={containerId} className="print:shadow-none">
      <CardHeader className="text-center border-b pb-4">
        <div className="flex justify-center mb-2">
          <div className="h-20 w-20 rounded-full bg-education-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
        </div>
        <CardTitle className="text-3xl">Academic Report Card</CardTitle>
        <p className="text-xl font-semibold mt-2">
          {`Form ${student.form} - Academic Year ${year}, Term ${term}`}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium">Name:</p>
              <p>{`${student.firstName} ${student.lastName}`}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Admission Number:</p>
              <p>{student.admissionNumber}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Form:</p>
              <p>{`Form ${student.form}`}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium">Guardian:</p>
              <p>{student.guardianName}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Contact:</p>
              <p>{student.guardianPhone}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Class Position:</p>
              <p>{classPosition}</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <h3 className="text-xl font-semibold mb-4">Subject Performance</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border px-4 py-2 text-left">Subject</th>
                {relevantExams.map((exam) => (
                  <th key={exam.id} className="border px-4 py-2 text-center">
                    {exam.type === "Custom" ? exam.name : exam.type}
                  </th>
                ))}
                <th className="border px-4 py-2 text-center">Average</th>
                <th className="border px-4 py-2 text-center">Grade</th>
                <th className="border px-4 py-2 text-center">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const average = subjectAverages[subject.id] || 0;
                const grade = getOverallGrade(average);
                
                // Get remarks based on grade
                let remarks = "N/A";
                if (average >= 70) remarks = "Excellent";
                else if (average >= 60) remarks = "Very Good";
                else if (average >= 50) remarks = "Good";
                else if (average >= 40) remarks = "Fair";
                else if (average > 0) remarks = "Needs Improvement";
                
                return (
                  <tr key={subject.id}>
                    <td className="border px-4 py-2">{subject.name}</td>
                    {relevantExams.map((exam) => {
                      const mark = studentMarks.find(
                        (m) => m.examId === exam.id && m.subjectId === subject.id
                      );
                      return (
                        <td key={exam.id} className="border px-4 py-2 text-center">
                          {mark ? mark.score : "-"}
                        </td>
                      );
                    })}
                    <td className="border px-4 py-2 text-center font-medium">
                      {average || "-"}
                    </td>
                    <td className="border px-4 py-2 text-center font-medium">
                      {average > 0 ? grade : "-"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {remarks}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-muted font-medium">
                <td className="border px-4 py-2">Total</td>
                <td className="border px-4 py-2 text-center" colSpan={relevantExams.length}>
                  -
                </td>
                <td className="border px-4 py-2 text-center">{totalMarks || "-"}</td>
                <td className="border px-4 py-2 text-center" colSpan={2}>
                  -
                </td>
              </tr>
              <tr className="bg-education-light font-medium text-education-primary">
                <td className="border px-4 py-2">Mean Score / Grade</td>
                <td className="border px-4 py-2 text-center" colSpan={relevantExams.length}>
                  -
                </td>
                <td className="border px-4 py-2 text-center">{averageMark || "-"}</td>
                <td className="border px-4 py-2 text-center">
                  {averageMark > 0 ? getOverallGrade(averageMark) : "-"}
                </td>
                <td className="border px-4 py-2 text-center">
                  {averageMark >= 70
                    ? "Excellent"
                    : averageMark >= 60
                    ? "Very Good"
                    : averageMark >= 50
                    ? "Good"
                    : averageMark >= 40
                    ? "Fair"
                    : averageMark > 0
                    ? "Needs Improvement"
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Performance Trend</h3>
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  {subjects.map((subject, index) => {
                    // Only display subjects that have data
                    const hasData = chartData.some(item => item[subject.name]);
                    if (!hasData) return null;
                    
                    return (
                      <Line
                        key={subject.id}
                        type="monotone"
                        dataKey={subject.name}
                        stroke={lineColors[index % lineColors.length]}
                        activeDot={{ r: 8 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">
              No performance data available for the selected term
            </p>
          )}
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Class Teacher's Remarks</h3>
            <div className="p-4 border rounded-md min-h-[100px]">
              {averageMark >= 80
                ? "Outstanding performance! Keep up the excellent work."
                : averageMark >= 70
                ? "Excellent results. Consistent and hardworking."
                : averageMark >= 60
                ? "Very good performance. Continue putting in more effort."
                : averageMark >= 50
                ? "Good performance. Can improve with more focus."
                : averageMark >= 40
                ? "Fair performance. Needs to work harder."
                : averageMark > 0
                ? "Performance below average. Requires significant improvement."
                : "No assessment data available for evaluation."}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Principal's Remarks</h3>
            <div className="p-4 border rounded-md min-h-[100px]">
              {averageMark >= 80
                ? "Exceptional achievement. Demonstrates outstanding academic potential."
                : averageMark >= 70
                ? "Excellent results. Keep maintaining this high standard."
                : averageMark >= 60
                ? "Commendable performance. Continue working hard."
                : averageMark >= 50
                ? "Satisfactory results. Work on improving weak areas."
                : averageMark >= 40
                ? "Average performance. More dedication needed."
                : averageMark > 0
                ? "Needs significant improvement. Additional support required."
                : "Insufficient data for evaluation."}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Report generated on {new Date().toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentReportCard;
