
import React, { useMemo } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FormReportProps {
  form: number;
  year: number;
  term: 1 | 2;
}

const FormReport: React.FC<FormReportProps> = ({ form, year, term }) => {
  const { students, subjects, exams, marks } = useAppContext();

  // Filter students for the specified form
  const formStudents = useMemo(() => {
    return students.filter(s => s.form === form).sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );
  }, [students, form]);

  // Filter exams relevant to this form, year, and term
  const relevantExams = useMemo(() => {
    return exams.filter(
      e => e.form === form && e.year === year && e.term === term
    );
  }, [exams, form, year, term]);

  // Get all marks for the relevant students and exams
  const formMarks = useMemo(() => {
    return marks.filter(
      m => 
        formStudents.some(s => s.id === m.studentId) &&
        relevantExams.some(e => e.id === m.examId)
    );
  }, [marks, formStudents, relevantExams]);

  // Calculate student averages
  const studentAverages = useMemo(() => {
    const averages: Record<string, { totalScore: number; count: number; average: number }> = {};
    
    formStudents.forEach(student => {
      const studentMarks = formMarks.filter(m => m.studentId === student.id);
      
      if (studentMarks.length > 0) {
        const totalScore = studentMarks.reduce((sum, m) => sum + m.score, 0);
        averages[student.id] = {
          totalScore,
          count: studentMarks.length,
          average: Math.round(totalScore / studentMarks.length)
        };
      }
    });
    
    return averages;
  }, [formStudents, formMarks]);

  // Calculate subject averages
  const subjectAverages = useMemo(() => {
    const averages: Record<string, { totalScore: number; count: number; average: number }> = {};
    
    subjects.forEach(subject => {
      const subjectMarks = formMarks.filter(m => m.subjectId === subject.id);
      
      if (subjectMarks.length > 0) {
        const totalScore = subjectMarks.reduce((sum, m) => sum + m.score, 0);
        averages[subject.id] = {
          totalScore,
          count: subjectMarks.length,
          average: Math.round(totalScore / subjectMarks.length)
        };
      }
    });
    
    return averages;
  }, [subjects, formMarks]);

  // Sort students by average for rankings
  const rankedStudents = useMemo(() => {
    return [...formStudents]
      .filter(student => studentAverages[student.id])
      .sort((a, b) => {
        const avgA = studentAverages[a.id]?.average || 0;
        const avgB = studentAverages[b.id]?.average || 0;
        return avgB - avgA;
      });
  }, [formStudents, studentAverages]);

  // Calculate overall form average
  const formAverage = useMemo(() => {
    const values = Object.values(studentAverages);
    if (values.length === 0) return 0;
    
    const totalScore = values.reduce((sum, value) => sum + value.totalScore, 0);
    const totalCount = values.reduce((sum, value) => sum + value.count, 0);
    
    return totalCount > 0 ? Math.round(totalScore / totalCount) : 0;
  }, [studentAverages]);

  // Create chart data for subject performance
  const subjectPerformanceData = useMemo(() => {
    return subjects.map(subject => {
      const data = subjectAverages[subject.id];
      return {
        subject: subject.name,
        average: data?.average || 0
      };
    }).filter(item => item.average > 0);
  }, [subjects, subjectAverages]);

  // Create chart data for top students
  const topStudentsData = useMemo(() => {
    return rankedStudents.slice(0, 10).map(student => ({
      name: `${student.firstName} ${student.lastName}`,
      average: studentAverages[student.id]?.average || 0
    }));
  }, [rankedStudents, studentAverages]);

  // Get grade for average
  const getGrade = (average: number): string => {
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

  return (
    <Card id="form-report">
      <CardHeader className="text-center border-b pb-4">
        <div className="flex justify-center mb-2">
          <div className="h-16 w-16 rounded-full bg-education-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
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
        <CardTitle className="text-3xl">Form Performance Report</CardTitle>
        <p className="text-xl font-semibold mt-2">
          {`Form ${form} - Academic Year ${year}, Term ${term}`}
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{formStudents.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Form Average</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">
                {formAverage}% ({getGrade(formAverage)})
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-lg">Exams Taken</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-center">{relevantExams.length}</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Subject Performance</h3>
          {subjectPerformanceData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" name="Average Score (%)">
                    {subjectPerformanceData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.average >= 70 ? "#43A047" : entry.average >= 50 ? "#1E88E5" : "#E53935"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No subject data available</p>
          )}
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Top 10 Students</h3>
          {topStudentsData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStudentsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" name="Average Score (%)">
                    {topStudentsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index < 3 ? "#FF8F00" : "#1E88E5"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground">No student data available</p>
          )}
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Student Rankings</h3>
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Rank</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Adm No.</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="text-right">Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedStudents.map((student, index) => {
                  const average = studentAverages[student.id]?.average || 0;
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell className="text-right">{average}%</TableCell>
                      <TableCell className="text-right">{getGrade(average)}</TableCell>
                    </TableRow>
                  );
                })}
                
                {rankedStudents.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No student data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Overall Assessment</h3>
            <div className="p-4 border rounded-md">
              {formAverage >= 70
                ? "The form has performed excellently. Most students demonstrate strong understanding across subjects."
                : formAverage >= 60
                ? "The form has performed well above average. A good number of students show good grasp of the subjects."
                : formAverage >= 50
                ? "The form has performed satisfactorily. There is room for improvement in several areas."
                : formAverage >= 40
                ? "The form's performance is average. More effort is needed to improve overall results."
                : formAverage > 0
                ? "The form's performance is below average. Significant intervention is required."
                : "No assessment data available for evaluation."}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
            <div className="p-4 border rounded-md">
              {formAverage >= 70
                ? "Continue with the current teaching strategies. Consider offering enrichment activities for top performers."
                : formAverage >= 60
                ? "Maintain the teaching approaches while providing additional support for struggling students."
                : formAverage >= 50
                ? "Implement targeted interventions for lower-performing subjects. Consider revision sessions."
                : formAverage >= 40
                ? "Schedule remedial classes for weak subjects. Encourage more student participation."
                : formAverage > 0
                ? "Conduct a comprehensive review of teaching methodologies. Implement intensive remedial programs."
                : "Insufficient data to provide recommendations."}
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

export default FormReport;
