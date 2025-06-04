
import React, { useState } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import TeacherForm from "./forms/TeacherForm";
import { Teacher } from "@/types";

const ManageTeachers: React.FC = () => {
  const { teachers, subjects, currentTeacher, deleteTeacher } = useSupabaseAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Only admin can access this page
  if (currentTeacher?.role !== "admin") {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold">Unauthorized Access</h2>
        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const filteredTeachers = teachers
    .filter((teacher) => {
      const matchesSearch =
        teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const handleDelete = (teacher: Teacher) => {
    if (teacher.id === currentTeacher.id) {
      toast.error("You cannot delete your own account");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}?`)) {
      deleteTeacher(teacher.id);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowAddForm(true);
  };

  const getTeacherSubjects = (subjectIds: string[]) => {
    return subjectIds
      .map(id => subjects.find(subject => subject.id === id)?.name || "")
      .filter(name => name)
      .join(", ");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Teachers</h2>
        <p className="text-muted-foreground">
          Add, edit, or remove teacher accounts
        </p>
      </div>

      {showAddForm ? (
        <TeacherForm 
          teacher={editingTeacher} 
          onCancel={() => {
            setShowAddForm(false);
            setEditingTeacher(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingTeacher(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-md w-full max-w-sm"
            />
            <Button onClick={() => setShowAddForm(true)} className="bg-education-primary hover:bg-education-dark">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Teacher Records</CardTitle>
              <CardDescription>
                Displaying {filteredTeachers.length} of {teachers.length} teachers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-education-primary text-white">
                              {teacher.firstName[0]}{teacher.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          teacher.role === "admin" 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {teacher.role === "admin" ? "Administrator" : "Teacher"}
                        </span>
                      </TableCell>
                      <TableCell>{getTeacherSubjects(teacher.subjectIds)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(teacher)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className={`text-red-500 hover:text-red-600 ${teacher.id === currentTeacher.id ? "opacity-50 cursor-not-allowed" : ""}`} 
                            onClick={() => handleDelete(teacher)}
                            disabled={teacher.id === currentTeacher.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredTeachers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6">
                        No teachers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageTeachers;
