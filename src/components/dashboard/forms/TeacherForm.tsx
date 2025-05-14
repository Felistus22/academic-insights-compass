
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Teacher } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { Checkbox } from "@/components/ui/checkbox";

// Define the schema for teacher form validation
const teacherSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  role: z.enum(["teacher", "admin"], {
    required_error: "Role is required",
  }),
  subjectIds: z.array(z.string()).optional(),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  teacher: Teacher | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const TeacherForm: React.FC<TeacherFormProps> = ({ teacher, onCancel, onSuccess }) => {
  const { addTeacher, updateTeacher, subjects } = useAppContext();
  const isEditing = !!teacher;
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    teacher ? teacher.subjectIds : []
  );
  
  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: teacher ? { 
      ...teacher,
    } : {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "teacher",
      subjectIds: [],
    }
  });

  const onSubmit = (data: TeacherFormValues) => {
    // Fix: Create a properly typed teacher object with all required fields
    const teacherData: Omit<Teacher, "id"> = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: data.role,
      subjectIds: selectedSubjects
    };
    
    if (isEditing && teacher) {
      updateTeacher({
        ...teacher,
        ...data,
        subjectIds: selectedSubjects
      });
    } else {
      addTeacher(teacherData);
    }
    onSuccess();
  };

  const handleSubjectToggle = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    } else {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Teacher" : "Add New Teacher"}</CardTitle>
        <CardDescription>
          {isEditing 
            ? "Update the teacher's information below" 
            : "Enter the new teacher's information below"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="teacher@school.edu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isEditing ? "Update Password" : "Password"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                    >
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel className="block mb-2">Subjects</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-4">
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject.id}`}
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                    />
                    <label
                      htmlFor={`subject-${subject.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subject.name} ({subject.code})
                    </label>
                  </div>
                ))}
              </div>
              {selectedSubjects.length === 0 && form.formState.isSubmitted && (
                <p className="text-sm font-medium text-destructive mt-2">
                  Please select at least one subject
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-education-primary hover:bg-education-dark">
              {isEditing ? "Update Teacher" : "Add Teacher"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TeacherForm;
