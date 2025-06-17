import React, { useMemo } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Image } from "@/components/ui/image";
import { User } from "lucide-react";

interface StudentReportCardProps {
  studentId: string;
  year: number;
  term: 1 | 2;
}

// Helper function to calculate grade, points and remarks based on score
const calculateGradeInfo = (score: number): { grade: string; points: number; remarks: string } => {
  if (score >= 74.5) {
    return { grade: 'A', points: 1, remarks: 'Excellent!' };
  } else if (score >= 64.5) {
    return { grade: 'B', points: 2, remarks: 'Good' };
  } else if (score >= 44.5) {
    return { grade: 'C', points: 3, remarks: 'Fair' };
  } else if (score >= 29.5) {
    return { grade: 'D', points: 4, remarks: 'Needs Improvement' };
  } else {
    return { grade: 'F', points: 5, remarks: 'Failed' };
  }
};

// Helper function to calculate division based on total points
const calculateDivision = (totalPoints: number): string => {
  if (totalPoints >= 7 && totalPoints < 18) {
    return 'I';
  } else if (totalPoints >= 18 && totalPoints < 22) {
    return 'II';
  } else if (totalPoints >= 22 && totalPoints < 26) {
    return 'III';
  } else if (totalPoints >= 26 && totalPoints <= 34) {
    return 'IV';
  } else {
    return 'ABS';
  }
};

// Helper function to calculate GPA from points
const calculateGPA = (points: number): number => {
  if (points === 1) return 4.0;     // A
  if (points === 2) return 3.0;     // B
  if (points === 3) return 2.0;     // C
  if (points === 4) return 1.0;     // D
  return 0.0;                       // F
};

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

  // Calculate subject averages for this student
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

  // Calculate subject means (class averages for each subject)
  const subjectMeans = useMemo(() => {
    const means: Record<string, number> = {};
    
    subjects.forEach(subject => {
      // Get all marks for this subject from students in the same form
      const formStudents = students.filter(s => s.form === student?.form);
      const allSubjectMarks = marks.filter(
        m => m.subjectId === subject.id && 
        formStudents.some(s => s.id === m.studentId) &&
        relevantExams.some(e => e.id === m.examId)
      );
      
      if (allSubjectMarks.length > 0) {
        // Group by student and calculate their average first
        const studentAverages: Record<string, number[]> = {};
        allSubjectMarks.forEach(mark => {
          if (!studentAverages[mark.studentId]) {
            studentAverages[mark.studentId] = [];
          }
          studentAverages[mark.studentId].push(mark.score);
        });
        
        // Calculate class average from student averages
        const classAverages = Object.values(studentAverages).map(scores => 
          scores.reduce((sum, score) => sum + score, 0) / scores.length
        );
        
        means[subject.id] = Math.round(
          classAverages.reduce((sum, avg) => sum + avg, 0) / classAverages.length
        );
      }
    });
    
    return means;
  }, [subjects, students, marks, student, relevantExams]);

  // Calculate student ranks in each subject
  const subjectRanks = useMemo(() => {
    const ranks: Record<string, number> = {};
    
    if (!student) return ranks;
    
    subjects.forEach(subject => {
      const formStudents = students.filter(s => s.form === student.form);
      
      // Calculate averages for all students in this subject
      const studentSubjectAverages = formStudents.map(s => {
        const studentSubjectMarks = marks.filter(
          m => m.studentId === s.id && 
          m.subjectId === subject.id &&
          relevantExams.some(e => e.id === m.examId)
        );
        
        if (studentSubjectMarks.length > 0) {
          const total = studentSubjectMarks.reduce((sum, m) => sum + m.score, 0);
          return {
            studentId: s.id,
            average: total / studentSubjectMarks.length
          };
        }
        
        return {
          studentId: s.id,
          average: 0
        };
      });
      
      // Sort by average (descending) and find rank
      studentSubjectAverages.sort((a, b) => b.average - a.average);
      const rank = studentSubjectAverages.findIndex(item => item.studentId === studentId) + 1;
      ranks[subject.id] = rank;
    });
    
    return ranks;
  }, [subjects, students, marks, student, studentId, relevantExams]);

  // Calculate subject entry counts
  const subjectEntries = useMemo(() => {
    const entries: Record<string, number> = {};
    
    if (!student) return entries;
    
    subjects.forEach(subject => {
      const formStudents = students.filter(s => s.form === student.form);
      
      // Count students who have at least one mark in this subject
      const studentsWithMarks = formStudents.filter(s => 
        marks.some(m => 
          m.studentId === s.id && 
          m.subjectId === subject.id &&
          relevantExams.some(e => e.id === m.examId)
        )
      );
      
      entries[subject.id] = studentsWithMarks.length;
    });
    
    return entries;
  }, [subjects, students, marks, student, relevantExams]);

  // Generate data for the performance chart (terminal averages)
  const chartData = useMemo(() => {
    const data: any[] = [];
    
    // Get terminal averages for each term
    [1, 2].forEach(termNum => {
      const termExams = exams.filter(
        e => e.year === year && e.term === termNum && e.form === student?.form
      );
      
      if (termExams.length > 0) {
        const termMarks = marks.filter(
          m => m.studentId === studentId && 
          termExams.some(e => e.id === m.examId)
        );
        
        if (termMarks.length > 0) {
          const termTotal = termMarks.reduce((sum, m) => sum + m.score, 0);
          const termAverage = Math.round(termTotal / termMarks.length);
          
          data.push({
            name: `Term ${termNum}`,
            average: termAverage
          });
        }
      }
    });
    
    return data;
  }, [exams, marks, studentId, year, student]);

  // Calculate total marks, points, GPA, and division
  const performanceMetrics = useMemo(() => {
    const subjectValues = Object.values(subjectAverages);
    const totalMarks = subjectValues.reduce((sum, avg) => sum + avg, 0);
    const averageMark = subjectValues.length > 0 ? Math.round(totalMarks / subjectValues.length) : 0;
    
    // Calculate total points using the helper function
    let totalPoints = 0;
    const subjectGrades: Record<string, { grade: string; points: number; remarks: string }> = {};
    
    Object.entries(subjectAverages).forEach(([subjectId, average]) => {
      const gradeInfo = calculateGradeInfo(average);
      subjectGrades[subjectId] = gradeInfo;
      totalPoints += gradeInfo.points;
    });
    
    // Calculate division and GPA
    const division = calculateDivision(totalPoints);
    const gpa = subjectValues.length > 0 
      ? subjectValues.reduce((sum, mark) => sum + calculateGPA(calculateGradeInfo(mark).points), 0) / subjectValues.length
      : 0;
    
    return {
      totalMarks,
      averageMark,
      totalPoints,
      division,
      gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      subjectGrades
    };
  }, [subjectAverages]);

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

  // Mock term dates - in real app, this would come from fee management
  const getTermDates = (form: number, term: number) => {
    const mockDates = {
      1: { 1: { closing: "15th Dec 2023", opening: "8th Jan 2024" }, 2: { closing: "12th Apr 2024", opening: "6th May 2024" } },
      2: { 1: { closing: "16th Dec 2023", opening: "9th Jan 2024" }, 2: { closing: "13th Apr 2024", opening: "7th May 2024" } },
      3: { 1: { closing: "17th Dec 2023", opening: "10th Jan 2024" }, 2: { closing: "14th Apr 2024", opening: "8th May 2024" } },
      4: { 1: { closing: "18th Dec 2023", opening: "11th Jan 2024" }, 2: { closing: "15th Apr 2024", opening: "9th May 2024" } },
    };
    
    return mockDates[form as keyof typeof mockDates]?.[term as keyof typeof mockDates[1]] || 
           { closing: "15th Dec 2023", opening: "8th Jan 2024" };
  };

  if (!student) {
    return <div>Student not found</div>;
  }

  const termDates = getTermDates(student.form, term);

  return (
    <Card id={`student-report-${studentId}`} className="print:shadow-none max-w-4xl mx-auto">
      <CardHeader className="text-center border-b pb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            {/* Student Photo or SVG on the left */}
            <div className="w-16 h-16 flex items-center justify-center border rounded">
              {student.imageUrl && student.imageUrl !== '/placeholder.svg' ? (
                <Image 
                  src={student.imageUrl}
                  alt={`${student.firstName} ${student.lastName}`}
                  className="h-16 w-16 object-cover rounded"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold uppercase">LITTLE SISTERS OF ST.FRANCIS</h1>
            <h2 className="text-xl font-bold uppercase">ST.PADRE PIO GIRLS SECONDARY SCHOOL</h2>
            <p className="text-sm">RIPOTI YA MAENDELEO YA KITAALUMA KIDATO CHA PILI</p>
            <p className="text-sm font-bold uppercase">MUHULA WA KWANZA - {year}</p>
            <div className="text-xs mt-2">
              <p>P.O.BOX 11531, &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; PHONE No: 0682 159 199</p>
              <p>ARUSHA-TANZANIA &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; E-mail:- st.padrepiogirls@gmail.com</p>
            </div>
          </div>
          {/* School Logo on the right */}
          <div className="flex items-center gap-4">
            <Image 
              src="/lovable-uploads/5f64003b-6ab3-4638-aea6-83966311d310.png"
              alt="St Padre Pio Girls School Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
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
            <span className="font-medium">Class:</span> Form {student.form} {student.stream}
          </div>
          <div className="col-span-3">
            <span className="font-medium">Term:</span> {term}/{year}
          </div>
        </div>

        {/* Subject Performance Table - Updated with new column structure */}
        <div className="border-2 border-foreground mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-foreground">
                <th className="border-r border-foreground px-2 py-1 text-left bg-muted">SUBJECT</th>
                {relevantExams.map((exam) => (
                  <th key={exam.id} className="border-r border-foreground px-1 py-1 text-center bg-muted min-w-[50px]">
                    {exam.type === "Custom" ? exam.name.slice(0, 6) : exam.type.slice(0, 6)}
                  </th>
                ))}
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">S.Mean</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Position</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Entry</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Average</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Grade</th>
                <th className="border-r border-foreground px-1 py-1 text-center bg-muted">Points</th>
                <th className="border-r border-foreground px-2 py-1 text-center bg-muted">COMMENT BY SUBJECT</th>
                <th className="px-2 py-1 text-center bg-muted">INITIAL</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const average = subjectAverages[subject.id] || 0;
                const gradeInfo = performanceMetrics.subjectGrades[subject.id] || { grade: "N/A", points: 0, remarks: "N/A" };
                const subjectMean = subjectMeans[subject.id] || 0;
                const rank = subjectRanks[subject.id] || 0;
                const entry = subjectEntries[subject.id] || 0;
                
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
                    <td className="border-r border-foreground px-1 py-1 text-center">
                      {subjectMean || "-"}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center">
                      {rank || "-"}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center">
                      {entry}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center font-medium">
                      {average || "-"}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center font-medium">
                      {gradeInfo.grade}
                    </td>
                    <td className="border-r border-foreground px-1 py-1 text-center font-medium">
                      {gradeInfo.points}
                    </td>
                    <td className="border-r border-foreground px-2 py-1 text-center">
                      {gradeInfo.remarks}
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

        {/* Summary Section - Updated with new metrics */}
        <div className="grid grid-cols-12 gap-4 mb-6 text-sm">
          <div className="col-span-3">
            <div className="border border-foreground p-2">
              <div className="grid grid-cols-1 gap-1">
                <div><span className="font-medium">T.Marks:</span> {performanceMetrics.totalMarks}</div>
                <div><span className="font-medium">Avg.Marks:</span> {performanceMetrics.averageMark}</div>
              </div>
            </div>
          </div>
          
          <div className="col-span-3">
            <div className="border border-foreground p-2">
              <div><span className="font-medium">T.Points:</span> {performanceMetrics.totalPoints}</div>
              <div><span className="font-medium">Avg.Points:</span> {(performanceMetrics.totalPoints / Object.keys(subjectAverages).length || 0).toFixed(3)}</div>
              <div><span className="font-medium">M.Grade:</span> {calculateGradeInfo(performanceMetrics.averageMark).grade}</div>
            </div>
          </div>
          
          <div className="col-span-3">
            <div className="border border-foreground p-2">
              <div><span className="font-medium">Division:</span> {performanceMetrics.division}</div>
              <div><span className="font-medium">GPA:</span> {performanceMetrics.gpa}</div>
              <div><span className="font-medium">Pos:</span> {classPosition}</div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="border border-foreground p-2">
              <div><span className="font-medium">Fee Balance:</span> TSh 0</div>
              <div><span className="font-medium">Other Charges:</span> TSh 0</div>
              <div><span className="font-medium">Total Due:</span> TSh 0</div>
            </div>
          </div>
        </div>

        {/* Position Information */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="border border-foreground p-2">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Class Position:</span>
              <span>{classPosition} Out of {classmates}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Term Class Position:</span>
              <span>{Math.max(1, Number(classPosition) - 2)}</span>
            </div>
          </div>
          
          <div className="border border-foreground p-2">
            <div className="flex justify-between mb-1">
              <span className="font-medium">Overall Position:</span>
              <span>{classPosition} Out of {classmates}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Term Form Position:</span>
              <span>{Math.max(1, Number(classPosition) - 1)}</span>
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
                  {performanceMetrics.averageMark >= 80
                    ? "Outstanding performance! Keep up the excellent work."
                    : performanceMetrics.averageMark >= 70
                    ? "Excellent results. Consistent and hardworking."
                    : performanceMetrics.averageMark >= 60
                    ? "Very good performance. Continue putting in more effort."
                    : performanceMetrics.averageMark >= 50
                    ? "Good performance. Can improve with more focus."
                    : performanceMetrics.averageMark >= 40
                    ? "Average. Work harder for better grade."
                    : performanceMetrics.averageMark > 0
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
                  {performanceMetrics.averageMark >= 80
                    ? "Exceptional achievement. Demonstrates outstanding academic potential."
                    : performanceMetrics.averageMark >= 70
                    ? "Excellent results. Keep maintaining this high standard."
                    : performanceMetrics.averageMark >= 60
                    ? "Commendable performance. Continue working hard."
                    : performanceMetrics.averageMark >= 50
                    ? "Satisfactory results. Work on improving weak areas."
                    : performanceMetrics.averageMark >= 40
                    ? "Average performance. More dedication needed."
                    : performanceMetrics.averageMark > 0
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

        {/* Fees and Term Information - Using form-specific dates */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="border border-foreground p-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium">FeesBal.</p>
                <p>TSh 0</p>
              </div>
              <div>
                <p className="font-medium">FeeNextTerm</p>
                <p>TSh 450,000</p>
              </div>
              <div>
                <p className="font-medium">OtherCharges</p>
                <p>TSh 50,000</p>
                <p className="font-medium mt-2">TotalFees</p>
                <p>TSh 500,000</p>
              </div>
            </div>
          </div>
          
          <div className="border border-foreground p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">THIS TERM</p>
                <p>CLOSING DATE:</p>
                <p className="font-medium">{termDates.closing}</p>
              </div>
              <div>
                <p className="font-medium">NEXT TERM</p>
                <p>OPENING DATE:</p>
                <p className="font-medium">{termDates.opening}</p>
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

        {/* Performance Chart - Terminal Average Scores */}
        <div className="border border-foreground p-4">
          <h3 className="text-center font-medium mb-4">Terminal Average Scores (Out of 100)</h3>
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
                    dataKey="average"
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
