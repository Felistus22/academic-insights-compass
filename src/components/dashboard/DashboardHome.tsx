
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppContext } from "@/contexts/AppContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DashboardHome: React.FC = () => {
  const { students, subjects, exams, marks, currentTeacher } = useAppContext();
  
  // Get latest activity logs
  const formCounts = students.reduce((acc, student) => {
    acc[`Form ${student.form}`] = (acc[`Form ${student.form}`] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const formCountsData = Object.entries(formCounts).map(([form, count]) => ({
    form,
    count,
  }));
  
  // Calculate average marks by subject
  const calculateSubjectAverages = () => {
    const subjectTotals: Record<string, { total: number; count: number }> = {};
    
    marks.forEach((mark) => {
      if (!subjectTotals[mark.subjectId]) {
        subjectTotals[mark.subjectId] = { total: 0, count: 0 };
      }
      subjectTotals[mark.subjectId].total += mark.score;
      subjectTotals[mark.subjectId].count++;
    });
    
    return subjects.map((subject) => {
      const data = subjectTotals[subject.id] || { total: 0, count: 0 };
      const average = data.count ? Math.round(data.total / data.count) : 0;
      return {
        subject: subject.name,
        average,
      };
    });
  };
  
  const subjectAverages = calculateSubjectAverages();
  
  // For teachers, filter to show only subjects they teach
  const teacherSubjects = currentTeacher?.role === "teacher" 
    ? subjectAverages.filter(item => 
        currentTeacher.subjectIds.some(id => 
          subjects.find(s => s.id === id)?.name === item.subject
        )
      )
    : subjectAverages;
  
  // Calculate average marks by form
  const calculateFormAverages = () => {
    const formTotals: Record<number, { total: number; count: number }> = {};
    
    marks.forEach((mark) => {
      const student = students.find(s => s.id === mark.studentId);
      if (student) {
        if (!formTotals[student.form]) {
          formTotals[student.form] = { total: 0, count: 0 };
        }
        formTotals[student.form].total += mark.score;
        formTotals[student.form].count++;
      }
    });
    
    return [1, 2, 3, 4].map((form) => {
      const data = formTotals[form] || { total: 0, count: 0 };
      const average = data.count ? Math.round(data.total / data.count) : 0;
      return {
        form: `Form ${form}`,
        average,
      };
    });
  };
  
  const formAverages = calculateFormAverages();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {currentTeacher?.firstName}! Here's an overview of your school's performance.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
              <path d="M10 9H8" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{exams.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marks.length > 0
                ? `${Math.round(
                    marks.reduce((sum, mark) => sum + mark.score, 0) / marks.length
                  )}%`
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Students by Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formCountsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="form" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1E88E5" name="Number of Students" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Average Marks by Form</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formAverages}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="form" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#43A047" name="Average Mark (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>
              {currentTeacher?.role === "teacher" 
                ? "Your Subject Averages" 
                : "Average Marks by Subject"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherSubjects}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#FF8F00" name="Average Mark (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
