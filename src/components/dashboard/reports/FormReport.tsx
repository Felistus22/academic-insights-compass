
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSupabaseAppContext } from '@/contexts/SupabaseAppContext';

interface FormReportProps {
  form: number;
  year: number;
  term: 1 | 2;
  stream?: string;
}

const FormReport: React.FC<FormReportProps> = ({ form, year, term, stream }) => {
  const { students, subjects, marks, exams } = useSupabaseAppContext();

  // Filter students by form and stream
  const formStudents = students.filter(student => {
    if (stream && stream !== "all") {
      return student.form === form && student.stream === stream;
    }
    return student.form === form;
  });

  // Filter exams by year, term, and form
  const formExams = exams.filter(exam => 
    exam.year === year && 
    exam.term === term && 
    exam.form === form
  );

  // Get grade from score
  const getGradeFromScore = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  // Get points from grade
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

  // Calculate GPA from points
  const calculateGPA = (points: number): number => {
    if (points === 4) return 4.0;     // A
    if (points === 3) return 3.0;     // B
    if (points === 2) return 2.0;     // C
    if (points === 1) return 1.0;     // D
    return 0.0;                       // F
  };

  // Calculate division from GPA
  const calculateDivision = (gpa: number): string => {
    if (gpa >= 3.5) return "I";
    if (gpa >= 3.0) return "II";
    if (gpa >= 2.0) return "III";
    if (gpa >= 1.0) return "IV";
    return "F";
  };

  // Calculate detailed performance for each student
  const studentPerformances = formStudents.map(student => {
    const subjectScores: Record<string, { score: number; grade: string; points: number }> = {};
    let totalScore = 0;
    let totalGpaPoints = 0;
    let subjectCount = 0;

    subjects.forEach(subject => {
      const subjectMarks = marks.filter(mark => 
        mark.studentId === student.id &&
        mark.subjectId === subject.id &&
        formExams.some(exam => exam.id === mark.examId)
      );

      if (subjectMarks.length > 0) {
        const avgScore = Math.round(subjectMarks.reduce((sum, mark) => sum + mark.score, 0) / subjectMarks.length);
        const grade = getGradeFromScore(avgScore);
        const points = getPointsFromGrade(grade);
        
        subjectScores[subject.id] = {
          score: avgScore,
          grade,
          points
        };
        totalScore += avgScore;
        totalGpaPoints += calculateGPA(points);
        subjectCount++;
      }
    });

    const overallAverage = subjectCount > 0 ? Math.round(totalScore / subjectCount) : 0;
    const gpa = subjectCount > 0 ? totalGpaPoints / subjectCount : 0;
    const division = calculateDivision(gpa);
    const totalPoints = Object.values(subjectScores).reduce((sum, s) => sum + s.points, 0);

    return {
      student,
      subjectScores,
      overallAverage,
      overallGrade: getGradeFromScore(overallAverage),
      totalPoints,
      gpa: Math.round(gpa * 100) / 100,
      division
    };
  });

  // Sort by overall average (highest first)
  studentPerformances.sort((a, b) => b.overallAverage - a.overallAverage);

  // Calculate subject-wise statistics
  const subjectStats = subjects.map(subject => {
    const subjectScores = studentPerformances
      .map(sp => sp.subjectScores[subject.id]?.score)
      .filter(score => score !== undefined) as number[];

    if (subjectScores.length === 0) {
      return {
        subject,
        average: 0,
        grade: 'F',
        A: 0, B: 0, C: 0, D: 0, F: 0,
        gpa: 0
      };
    }

    const average = Math.round(subjectScores.reduce((sum, score) => sum + score, 0) / subjectScores.length);
    const grades = subjectScores.map(score => getGradeFromScore(score));
    
    return {
      subject,
      average,
      grade: getGradeFromScore(average),
      A: grades.filter(g => g === 'A').length,
      B: grades.filter(g => g === 'B').length,
      C: grades.filter(g => g === 'C').length,
      D: grades.filter(g => g === 'D').length,
      F: grades.filter(g => g === 'F').length,
      gpa: Math.round((grades.reduce((sum, g) => {
        const points = g === 'A' ? 4 : g === 'B' ? 3 : g === 'C' ? 2 : g === 'D' ? 1 : 0;
        return sum + points;
      }, 0) / grades.length) * 100) / 100
    };
  });

  // Calculate overall class statistics
  const classAverage = studentPerformances.length > 0 
    ? Math.round(studentPerformances.reduce((sum, sp) => sum + sp.overallAverage, 0) / studentPerformances.length)
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 font-semibold";
    if (score >= 70) return "text-blue-600 font-semibold";
    if (score >= 60) return "text-yellow-600 font-semibold";
    if (score >= 50) return "text-orange-600 font-semibold";
    return "text-red-600 font-semibold";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            Form {form} {stream && stream !== "all" ? `Stream ${stream}` : ""} Performance Report - Term {term}, {year}
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Overall Class Performance: <span className="font-semibold">{classAverage}%</span> | 
            Total Students: <span className="font-semibold">{studentPerformances.length}</span>
          </div>
        </CardHeader>
        <CardContent>
          {studentPerformances.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No.</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Sex</TableHead>
                    {subjects.map(subject => (
                      <TableHead key={subject.id} className="text-center min-w-16">
                        {subject.code}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Average</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead className="text-center">GPA</TableHead>
                    <TableHead className="text-center">Division</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPerformances.map((performance, index) => (
                    <TableRow key={performance.student.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">
                        {performance.student.firstName} {performance.student.lastName}
                      </TableCell>
                      <TableCell className="text-center">F</TableCell>
                      {subjects.map(subject => (
                        <TableCell key={subject.id} className="text-center">
                          {performance.subjectScores[subject.id] ? (
                            <span className={getScoreColor(performance.subjectScores[subject.id].score)}>
                              {performance.subjectScores[subject.id].score}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">
                        {performance.totalPoints}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(performance.overallAverage)}>
                          {performance.overallAverage}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={performance.overallGrade === 'A' ? 'default' : 
                                      performance.overallGrade === 'B' ? 'secondary' : 
                                      performance.overallGrade === 'C' ? 'outline' : 'destructive'}>
                          {performance.overallGrade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {performance.totalPoints}
                      </TableCell>
                      <TableCell className="text-center font-semibold">
                        {performance.gpa}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={performance.division === 'I' ? 'default' : 
                                      performance.division === 'II' ? 'secondary' : 
                                      performance.division === 'III' ? 'outline' : 'destructive'}>
                          {performance.division}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No students found for Form {form} {stream && stream !== "all" ? `Stream ${stream}` : ""} in Term {term}, {year}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {subjectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject Name</TableHead>
                    <TableHead className="text-center">Subject Code</TableHead>
                    <TableHead className="text-center">Average</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-center">A</TableHead>
                    <TableHead className="text-center">B</TableHead>
                    <TableHead className="text-center">C</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">F</TableHead>
                    <TableHead className="text-center">GPA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjectStats.map(stat => (
                    <TableRow key={stat.subject.id}>
                      <TableCell className="font-medium">{stat.subject.name}</TableCell>
                      <TableCell className="text-center">{stat.subject.code}</TableCell>
                      <TableCell className="text-center">
                        <span className={getScoreColor(stat.average)}>
                          {stat.average}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={stat.grade === 'A' ? 'default' : 
                                      stat.grade === 'B' ? 'secondary' : 
                                      stat.grade === 'C' ? 'outline' : 'destructive'}>
                          {stat.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{stat.A}</TableCell>
                      <TableCell className="text-center">{stat.B}</TableCell>
                      <TableCell className="text-center">{stat.C}</TableCell>
                      <TableCell className="text-center">{stat.D}</TableCell>
                      <TableCell className="text-center">{stat.F}</TableCell>
                      <TableCell className="text-center font-semibold">{stat.gpa}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormReport;
