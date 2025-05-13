
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import StudentForm from "./forms/StudentForm";
import { Student } from "@/types";

const ManageStudents: React.FC = () => {
  const { students, currentTeacher, deleteStudent } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (a.form !== b.form) return a.form - b.form;
      return a.lastName.localeCompare(b.lastName);
    });

  const handleDelete = (student: Student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      deleteStudent(student.id);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Students</h2>
        <p className="text-muted-foreground">
          Add, edit, or remove student records
        </p>
      </div>

      {showAddForm ? (
        <StudentForm 
          student={editingStudent} 
          onCancel={() => {
            setShowAddForm(false);
            setEditingStudent(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingStudent(null);
          }}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-md w-full max-w-sm"
            />
            <Button onClick={() => setShowAddForm(true)} className="bg-education-primary hover:bg-education-dark">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
              <CardDescription>
                Displaying {filteredStudents.length} of {students.length} students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No.</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Guardian</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={student.imageUrl} />
                            <AvatarFallback className="bg-education-primary text-white">
                              {student.firstName[0]}{student.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.admissionNumber}</TableCell>
                      <TableCell>{student.form}</TableCell>
                      <TableCell>{student.guardianName}</TableCell>
                      <TableCell>{student.guardianPhone}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(student)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="outline" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(student)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredStudents.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No students found
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

export default ManageStudents;
