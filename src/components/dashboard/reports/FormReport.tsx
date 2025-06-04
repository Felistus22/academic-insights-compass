
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAppContext } from '@/contexts/SupabaseAppContext';

interface FormReportProps {
  form: number;
  year: number;
  term: 1 | 2;
}

const FormReport: React.FC<FormReportProps> = ({ form, year, term }) => {
  const { students, subjects, marks, exams } = useSupabaseAppContext();

  // Filter students by form
  const formStudents = students.filter(student => student.form === form);

  // Filter exams by year, term, and form
  const formExams = exams.filter(exam => 
    exam.year === year && 
    exam.term === term && 
    exam.form === form
  );

  // Calculate average score for each student
  const studentAverages = formStudents.map(student => {
    const studentMarks = marks.filter(mark => 
      mark.studentId === student.id &&
      formExams.some(exam => exam.id === mark.examId)
    );

    const totalScore = studentMarks.reduce((sum, mark) => sum + mark.score, 0);
    const average = studentMarks.length > 0 ? totalScore / studentMarks.length : 0;

    return {
      student,
      average: Math.round(average * 100) / 100,
      marksCount: studentMarks.length
    };
  });

  // Sort by average (highest first)
  studentAverages.sort((a, b) => b.average - a.average);

  // Calculate class statistics
  const classAverage = studentAverages.length > 0 
    ? studentAverages.reduce((sum, item) => sum + item.average, 0) / studentAverages.length 
    : 0;

  const getGradeColor = (average: number) => {
    if (average >= 80) return "bg-green-500";
    if (average >= 70) return "bg-blue-500";
    if (average >= 60) return "bg-yellow-500";
    if (average >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form {form} Report - Term {term}, {year}</CardTitle>
        <div className="text-sm text-gray-600">
          Class Average: <span className="font-semibold">{Math.round(classAverage * 100) / 100}%</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentAverages.map((item, index) => (
            <div key={item.student.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                  {index + 1}
                </Badge>
                <div>
                  <p className="font-medium">
                    {item.student.firstName} {item.student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.student.admissionNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  className={`${getGradeColor(item.average)} text-white`}
                >
                  {item.average}%
                </Badge>
                <span className="text-sm text-gray-500">
                  ({item.marksCount} subjects)
                </span>
              </div>
            </div>
          ))}
          
          {studentAverages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found for Form {form} in Term {term}, {year}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FormReport;
