
import React from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, GraduationCap, TrendingUp, Calendar, Award, Clock, Bell, Plus, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

const DashboardHome: React.FC = () => {
  const { students, teachers, subjects, exams, marks, currentTeacher } = useSupabaseAppContext();
  const navigate = useNavigate();

  // Calculate basic statistics
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalSubjects = subjects.length;
  const totalExams = exams.length;

  // Quick actions for different user roles - filtered based on role
  const allQuickActions = [
    {
      title: "Add New Student",
      description: "Register a new student",
      icon: Plus,
      action: () => navigate("/dashboard/manage-students"),
      roles: ["admin"]
    },
    {
      title: "Enter Marks",
      description: "Record student examination marks",
      icon: FileText,
      action: () => navigate("/dashboard/enter-marks"),
      roles: ["admin", "teacher"]
    },
    {
      title: "View Reports",
      description: "Generate student performance reports",
      icon: TrendingUp,
      action: () => navigate("/dashboard/reports"),
      roles: ["admin", "teacher"]
    },
    {
      title: "Manage Teachers",
      description: "Add or edit teacher information",
      icon: GraduationCap,
      action: () => navigate("/dashboard/manage-teachers"),
      roles: ["admin"]
    }
  ];

  // Filter quick actions based on current user's role
  const availableActions = allQuickActions.filter(action => 
    currentTeacher && action.roles.includes(currentTeacher.role)
  );

  // Students by form distribution with proper labeling (changed to bar chart data)
  const studentsByForm = [1, 2, 3, 4, 5].map(form => ({
    form: form === 5 ? "Alumni" : `Form ${form}`,
    students: students.filter(student => student.form === form).length
  })).filter(item => item.students > 0);

  // Recent exams (last 5)
  const recentExams = exams
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Average marks by subject with complete subject names
  const subjectPerformance = subjects.map(subject => {
    const subjectMarks = marks.filter(mark => mark.subjectId === subject.id);
    const average = subjectMarks.length > 0 
      ? subjectMarks.reduce((sum, mark) => sum + mark.score, 0) / subjectMarks.length 
      : 0;
    
    return {
      name: subject.name.length > 15 ? subject.name.substring(0, 12) + "..." : subject.name,
      fullName: subject.name,
      average: Math.round(average * 100) / 100
    };
  }).filter(subject => subject.average > 0);

  // Performance trend (last 6 months of exams)
  const performanceTrend = exams
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-6)
    .map(exam => {
      const examMarks = marks.filter(mark => mark.examId === exam.id);
      const average = examMarks.length > 0 
        ? examMarks.reduce((sum, mark) => sum + mark.score, 0) / examMarks.length 
        : 0;
      
      return {
        name: exam.name,
        average: Math.round(average * 100) / 100,
        date: new Date(exam.date).toLocaleDateString()
      };
    });

  // Top performing students (overall)
  const topStudents = students
    .map(student => {
      const studentMarks = marks.filter(mark => mark.studentId === student.id);
      const average = studentMarks.length > 0 
        ? studentMarks.reduce((sum, mark) => sum + mark.score, 0) / studentMarks.length 
        : 0;
      
      return { student, average: Math.round(average * 100) / 100 };
    })
    .filter(item => item.average > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  // Activity feed (recent exams and high scores)
  const activities = [
    ...recentExams.slice(0, 3).map(exam => ({
      type: 'exam',
      message: `${exam.name} conducted for Form ${exam.form}`,
      date: exam.date,
      icon: Calendar
    })),
    ...topStudents.slice(0, 2).map(({ student, average }) => ({
      type: 'achievement',
      message: `${student.firstName} ${student.lastName} achieved ${average}% average`,
      date: new Date().toISOString(),
      icon: Award
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-medium">{payload[0]?.payload?.fullName || label}</p>
          <p className="text-blue-600">
            Average: {payload[0]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome back, {currentTeacher?.firstName}!
        </h2>
        <p className="text-muted-foreground">
          Here's what's happening at your school today.
          {currentTeacher?.role === "teacher" && " (Teacher View)"}
        </p>
      </div>

      {/* Quick Actions - Role filtered */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {availableActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.title} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={action.action}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics Cards - Show all for now but could be filtered */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>
        
        {currentTeacher?.role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTeachers}</div>
              <p className="text-xs text-muted-foreground">
                Faculty members
              </p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Available courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Conducted</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExams}</div>
            <p className="text-xs text-muted-foreground">
              Assessment records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {subjectPerformance.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Average Marks by Subject</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="average" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Students by Form</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={studentsByForm} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="form" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity and Top Students */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? activities.map((activity, index) => {
                const Icon = activity.icon;
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              }) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
            <CardDescription>
              Students with highest overall averages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStudents.length > 0 ? topStudents.map((item, index) => (
                <div key={item.student.id} className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={item.student.imageUrl} />
                    <AvatarFallback>
                      {item.student.firstName[0]}{item.student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {item.student.firstName} {item.student.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Form {item.student.form} • {item.student.admissionNumber}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {item.average}%
                  </Badge>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">No student records available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
