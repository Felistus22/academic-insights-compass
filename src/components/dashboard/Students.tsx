
import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const Students: React.FC = () => {
  const { students } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredStudents = students
    .filter((student) => {
      const matchesSearch =
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesForm =
        activeTab === "all" || 
        activeTab === `form${student.form}`;
      
      return matchesSearch && matchesForm;
    })
    .sort((a, b) => {
      if (a.form !== b.form) return a.form - b.form;
      return a.lastName.localeCompare(b.lastName);
    });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          View and manage all student records
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Forms</TabsTrigger>
            <TabsTrigger value="form1">Form 1</TabsTrigger>
            <TabsTrigger value="form2">Form 2</TabsTrigger>
            <TabsTrigger value="form3">Form 3</TabsTrigger>
            <TabsTrigger value="form4">Form 4</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        {student.firstName} {student.lastName}
                      </span>
                      <span className="text-sm bg-education-light text-education-primary px-2 py-1 rounded-full">
                        Form {student.form}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={student.imageUrl} />
                        <AvatarFallback className="bg-education-primary text-white text-lg">
                          {student.firstName[0]}
                          {student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          <strong>Admission No:</strong> {student.admissionNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Guardian:</strong> {student.guardianName}
                        </p>
                        <p className="text-sm text-gray-500">
                          <strong>Contact:</strong> {student.guardianPhone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredStudents.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">No students found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Students;
