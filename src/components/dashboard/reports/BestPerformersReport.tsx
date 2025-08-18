import React, { useState, useMemo } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Search, Filter } from "lucide-react";
import { Student, Subject } from "@/types";

interface PerformanceData {
  student: Student;
  subject: Subject;
  averageScore: number;
  totalMarks: number;
  examCount: number;
  grade: string;
  rank: number;
}

const BestPerformersReport: React.FC = () => {
  const { students, subjects, exams, marks } = useSupabaseAppContext();
  
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedForm, setSelectedForm] = useState<string>("all");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [startYear, setStartYear] = useState<string>("2020");
  const [endYear, setEndYear] = useState<string>("2024");
  const [limitResults, setLimitResults] = useState<string>("10");

  // Get available years from exams
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(exams.map(exam => exam.year))).sort();
    return years;
  }, [exams]);

  // Helper function to get grade from score
  const getGradeFromScore = (score: number): string => {
    if (score >= 80) return "A";
    if (score >= 70) return "B";
    if (score >= 60) return "C";
    if (score >= 50) return "D";
    return "F";
  };

  // Calculate best performers based on filters
  const bestPerformers = useMemo(() => {
    const yearStart = parseInt(startYear);
    const yearEnd = parseInt(endYear);
    
    // Filter exams by year range
    const filteredExams = exams.filter(exam => 
      exam.year >= yearStart && exam.year <= yearEnd
    );

    // Filter students by form and stream
    let filteredStudents = students;
    if (selectedForm !== "all") {
      filteredStudents = filteredStudents.filter(s => s.form === parseInt(selectedForm));
    }
    if (selectedStream !== "all") {
      filteredStudents = filteredStudents.filter(s => s.stream === selectedStream);
    }

    // Filter subjects
    let targetSubjects = subjects;
    if (selectedSubject !== "all") {
      targetSubjects = subjects.filter(s => s.id === selectedSubject);
    }

    const performanceData: PerformanceData[] = [];

    // Calculate performance for each student-subject combination
    filteredStudents.forEach(student => {
      targetSubjects.forEach(subject => {
        // Get marks for this student-subject combination within the year range
        const relevantMarks = marks.filter(mark => 
          mark.studentId === student.id &&
          mark.subjectId === subject.id &&
          filteredExams.some(exam => exam.id === mark.examId)
        );

        if (relevantMarks.length > 0) {
          const totalScore = relevantMarks.reduce((sum, mark) => sum + mark.score, 0);
          const averageScore = Math.round((totalScore / relevantMarks.length) * 100) / 100;
          const grade = getGradeFromScore(averageScore);

          performanceData.push({
            student,
            subject,
            averageScore,
            totalMarks: totalScore,
            examCount: relevantMarks.length,
            grade,
            rank: 0 // Will be calculated later
          });
        }
      });
    });

    // Sort by average score descending and assign ranks
    performanceData.sort((a, b) => {
      // First sort by subject, then by score
      if (selectedSubject === "all") {
        if (a.subject.name !== b.subject.name) {
          return a.subject.name.localeCompare(b.subject.name);
        }
      }
      return b.averageScore - a.averageScore;
    });

    // Assign ranks per subject
    if (selectedSubject === "all") {
      // Group by subject and assign ranks within each subject
      const subjectGroups: { [key: string]: PerformanceData[] } = {};
      performanceData.forEach(data => {
        if (!subjectGroups[data.subject.id]) {
          subjectGroups[data.subject.id] = [];
        }
        subjectGroups[data.subject.id].push(data);
      });

      Object.values(subjectGroups).forEach(group => {
        group.sort((a, b) => b.averageScore - a.averageScore);
        group.forEach((data, index) => {
          data.rank = index + 1;
        });
      });
    } else {
      // Single subject, assign ranks normally
      performanceData.forEach((data, index) => {
        data.rank = index + 1;
      });
    }

    // Limit results if specified
    const limit = parseInt(limitResults);
    if (selectedSubject !== "all") {
      return performanceData.slice(0, limit);
    } else {
      // For "all subjects", show top performers per subject
      const result: PerformanceData[] = [];
      const subjectGroups: { [key: string]: PerformanceData[] } = {};
      
      performanceData.forEach(data => {
        if (!subjectGroups[data.subject.id]) {
          subjectGroups[data.subject.id] = [];
        }
        subjectGroups[data.subject.id].push(data);
      });

      Object.values(subjectGroups).forEach(group => {
        result.push(...group.slice(0, Math.min(limit, 5))); // Max 5 per subject
      });

      return result;
    }
  }, [students, subjects, exams, marks, selectedSubject, selectedForm, selectedStream, startYear, endYear, limitResults]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2) return "secondary";
    if (rank === 3) return "outline";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Best Performers Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="form">Form</Label>
              <Select value={selectedForm} onValueChange={setSelectedForm}>
                <SelectTrigger>
                  <SelectValue placeholder="Select form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Forms</SelectItem>
                  <SelectItem value="1">Form 1</SelectItem>
                  <SelectItem value="2">Form 2</SelectItem>
                  <SelectItem value="3">Form 3</SelectItem>
                  <SelectItem value="4">Form 4</SelectItem>
                  <SelectItem value="5">Alumni (Form 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stream">Stream</Label>
              <Select value={selectedStream} onValueChange={setSelectedStream}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stream" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Streams</SelectItem>
                  <SelectItem value="A">Stream A</SelectItem>
                  <SelectItem value="B">Stream B</SelectItem>
                  <SelectItem value="C">Stream C</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Show Top</Label>
              <Select value={limitResults} onValueChange={setLimitResults}>
                <SelectTrigger>
                  <SelectValue placeholder="Limit results" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">Top 5</SelectItem>
                  <SelectItem value="10">Top 10</SelectItem>
                  <SelectItem value="20">Top 20</SelectItem>
                  <SelectItem value="50">Top 50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startYear">Start Year</Label>
              <Select value={startYear} onValueChange={setStartYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Start year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endYear">End Year</Label>
              <Select value={endYear} onValueChange={setEndYear}>
                <SelectTrigger>
                  <SelectValue placeholder="End year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Top Performers ({bestPerformers.length} results)</span>
            <Badge variant="secondary">
              {startYear} - {endYear}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bestPerformers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No performance data found for the selected criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or date range.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Average Score</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    <TableHead className="text-right">Exams Taken</TableHead>
                    <TableHead className="text-right">Total Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bestPerformers.map((data, index) => (
                    <TableRow key={`${data.student.id}-${data.subject.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRankIcon(data.rank)}
                          <Badge variant={getRankBadgeVariant(data.rank)}>
                            #{data.rank}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {data.student.firstName} {data.student.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {data.student.admissionNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Form {data.student.form}{data.student.stream}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{data.subject.name}</span>
                        <p className="text-sm text-muted-foreground">
                          {data.subject.code}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-lg">
                          {data.averageScore}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={data.grade === "A" ? "default" : 
                                  data.grade === "B" ? "secondary" : "outline"}
                        >
                          {data.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {data.examCount}
                      </TableCell>
                      <TableCell className="text-right">
                        {Math.round(data.totalMarks)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BestPerformersReport;