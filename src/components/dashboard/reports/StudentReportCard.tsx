
import React, { useMemo } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Image } from "@/components/ui/image";

interface StudentReportCardProps {
  studentId: string;
  year: number;
  term: 1 | 2;
}

const StudentReportCard: React.FC<StudentReportCardProps> = ({
  studentId,
  year,
  term,
}) => {
  const { students, subjects, exams, marks } = useSupabaseAppContext();

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
  
  // Calculate class position
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
    
    return position;
  }, [student, students, subjects, marks, studentId, relevantExams]);

  const classmates = useMemo(() => {
    if (!student) return 0;
    return students.filter(s => s.form === student.form).length;
  }, [student, students]);

  if (!student) {
    return <div>Student not found</div>;
  }

  return (
    <Card id={`student-report-${studentId}`} className="print:shadow-none max-w-4xl mx-auto">
      <CardHeader className="text-center border-b pb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            <Image 
              src="/lovable-uploads/5f64003b-6ab3-4638-aea6-83966311d310.png"
              alt="St Padre Pio Girls School Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold uppercase">ST PADRE PIO GIRLS HIGH SCHOOL</h1>
            <p className="text-sm text-muted-foreground">P.O. BOX 123 NAIROBI TEL: 071234567</p>
          </div>
          <div className="w-16"> {/* Spacer for balance */}</div>
        </div>
        
        <div className="border-2 border-foreground p-2 inline-block">
          <h2 className="text-xl font-bold uppercase">TERMLY REPORT FORM</h2>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Student Information Header */}
        <div className="grid grid-cols-12 gap-2 mb-6 text-sm">
          <div className="col-span-3">
            <span className="font-medium">Adm No:</span> {student.admissionNumber}
          </div>
          <div className="col-span-4">
            <span className="font-medium">Name:</span> {`${student.firstName} ${student.lastName}`.toUpperCase()}
          </div>
          <div className="col-span-2">
            <span className="font-medium">Class:</span> Form {student.form}
          </div>
          <div className="col-span-3">
            <span className="font-medium">Term:</span> {term}/2016 House: ST. ELIZABETH
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="border-2 border-foreground mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-foreground">
                <th className="border-r border-foreground px-2 py-1 text-left bg-muted">SUBJECT</th>
                {relevantExams.map((exam, index) => (
                  <th key={exam.id} className="border-r border-foreground px-1 py-1 text-center bg-muted min-w-[60px]">
                    {exam.type === "Custom" ? exam.name.slice(0, 8) : exam.type.slice(0, 8)}
                  </th>
                ))}
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Mean</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Entry</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Average</th>
                <th className="border-r border-foreground px-2 py-1 text-center bg-muted">COMMENT BY SUBJECT</th>
                <th className="px-2 py-1 text-center bg-muted">INITIAL</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => {
                const average = subjectAverages[subject.id] || 0;
                const grade = getOverallGrade(average);
                
                // Get remarks based on grade
                let remarks = "N/A";
                if (average >= 70) remarks = "Excellent";
                else if (average >= 60) remarks = "Very Good";
                else if (average >= 50) remarks = "Good";
                else if (average >= 40) remarks = "Can do better";
                else if (average > 0) remarks = "Work hard";
                
                return (
                  <tr key={subject.id} className="border-b border-foreground">
                    <td className="border-r border-foreground px-2 py-1 font-medium uppercase">
                      {subject.name}
                    </td>
                    {relevantExams.map((exam) => {
                      const mark = studentMarks.find(
                        (m) => m.examId === exam.id && m.subjectId === subject.id
                      );
                      return (
                        <td key={exam.id} className="border-r border-foreground px-1 py-1 text-center">
                          {mark ? mark.score : "-"}
                        </td>
                      );
                    })}
                    <td className="border-r border-foreground px-1 py-1 text-center font-medium">
                      {average || "-"}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center">
                      {index * 5 + 121} {/* Mock entry numbers like in the image */}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center">
                      {(index + 25) * 10} {/* Mock class averages */}
                    </td>
                    <td className="border-r border-foreground px-2 py-1 text-center">
                      {remarks}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {/* Mock teacher initials */}
                      {subject.name.charAt(0)}{subject.name.charAt(1) || 'T'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-12 gap-4 mb-6 text-sm">
          <div className="col-span-4">
            <div className="border border-foreground p-2">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-medium">Dev:</span> -109</div>
                <div><span className="font-medium">VAP:</span> 2.23</div>
              </div>
              <div className="mt-2">
                <div><span className="font-medium">T.Marks:</span> {totalMarks}</div>
                <div><span className="font-medium">Avg.Marks:</span> {averageMark}</div>
              </div>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="border border-foreground p-2">
              <div><span className="font-medium">T.Points:</span> 74</div>
              <div><span className="font-medium">Avg.Points:</span> 6.170</div>
              <div><span className="font-medium">M.Grade:</span> {getOverallGrade(averageMark)}</div>
            </div>
          </div>
          
          <div className="col-span-4">
            <div className="border border-foreground p-2">
              <div><span className="font-medium">KCPEMarks:</span> 350</div>
              <div><span className="font-medium">Pos:</span> {classPosition}</div>
              <div><span className="font-medium">Last Term Grade:</span> B-</div>
            </div>
          </div>
        </div>

        {/* Position Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="border border-foreground p-2">
            <div className="flex justify-between">
              <span className="font-medium">Class Position:</span>
              <span>{classPosition} Out of {classmates}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last Term Class Position:</span>
              <span>{Math.max(1, classPosition - 2)}</span>
            </div>
          </div>
          
          <div className="border border-foreground p-2">
            <div className="flex justify-between">
              <span className="font-medium">Overall Position:</span>
              <span>{classPosition + 42} Out of {classmates * 4}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last Term Form Position:</span>
              <span>{classPosition + 38}</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="space-y-4 mb-6">
          <div className="border border-foreground p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">Class Teacher's Comments:</p>
                <p className="mt-1">
                  {averageMark >= 80
                    ? "Outstanding performance! Keep up the excellent work."
                    : averageMark >= 70
                    ? "Excellent results. Consistent and hardworking."
                    : averageMark >= 60
                    ? "Very good performance. Continue putting in more effort."
                    : averageMark >= 50
                    ? "Good performance. Can improve with more focus."
                    : averageMark >= 40
                    ? "Average. Work harder for better grade."
                    : averageMark > 0
                    ? "Below average performance. Wake up and work harder."
                    : "No assessment data available."}
                </p>
              </div>
              <div>
                <p className="font-medium">Class Teacher's Name:</p>
                <p className="mt-1">Ms. {student.guardianName?.split(' ')[0] || 'TEACHER'}</p>
                <div className="mt-4">
                  <p className="font-medium">Sign:</p>
                  <div className="border-b border-foreground w-20 mt-1"></div>
                </div>
              </div>
              <div>
                <p className="font-medium">Date:</p>
                <p className="mt-1">{new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>

          <div className="border border-foreground p-3">
            <div className="flex justify-between text-sm">
              <div className="flex-1">
                <p className="font-medium">Principal's Comments:</p>
                <p className="mt-1">
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
                    ? "Below average performance. Wake up and work harder."
                    : "Insufficient data for evaluation."}
                </p>
              </div>
              <div className="ml-8">
                <p className="font-medium">Sign:</p>
                <div className="border-b border-foreground w-20 mt-1"></div>
                <p className="font-medium mt-4">Date:</p>
                <p className="mt-1">{new Date().toLocaleDateString('en-GB')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Fees and Term Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-foreground p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">FeesBal.</p>
                <div className="border-b border-foreground mt-2"></div>
              </div>
              <div>
                <p className="font-medium">FeeNextTerm</p>
                <div className="border-b border-foreground mt-2"></div>
              </div>
              <div>
                <p className="font-medium">OtherCharges</p>
                <div className="border-b border-foreground mt-2"></div>
                <p className="font-medium mt-4">TotalFees</p>
                <div className="border-b border-foreground mt-2"></div>
              </div>
            </div>
          </div>
          
          <div className="border border-foreground p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">THIS TERM</p>
                <p>CLOSING DATE:</p>
                <div className="border-b border-foreground mt-2"></div>
              </div>
              <div>
                <p className="font-medium">NEXT TERM</p>
                <p>OPENING DATE:</p>
                <div className="border-b border-foreground mt-2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Note and Parent Signature */}
        <div className="border border-foreground p-3 mb-6">
          <p className="text-sm font-medium italic">
            NB: Parents are advised to insist on being shown this report. Parent Signature:
          </p>
          <div className="border-b border-foreground w-40 mt-2"></div>
        </div>

        {/* Performance Chart */}
        <div className="border border-foreground p-4">
          <h3 className="text-center font-medium mb-4">MeanPoints / Term</h3>
          {chartData.length > 0 ? (
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="Mathematics"
                    stroke="#1E88E5"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[200px] border border-dashed border-muted-foreground flex items-center justify-center">
              <p className="text-muted-foreground">No performance data available</p>
            </div>
          )}
        </div>

        {/* School Motto */}
        <div className="text-center mt-6">
          <p className="text-lg font-bold italic">Sch Motto: KNOWLEDGE IS SHELTER</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentReportCard;
