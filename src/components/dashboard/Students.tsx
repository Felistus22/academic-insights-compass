import React, { useState } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChevronDown, ArrowUpSquare } from "lucide-react";

const Students: React.FC = () => {
  const { students, updateStudent, currentTeacher } = useSupabaseAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("lastName"); // default sort by last name
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // default ascending
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [promotionForm, setPromotionForm] = useState<number>(0);

  // Filter students based on search term and form
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
      // Improved sort by selected field
      let comparison = 0;
      
      if (sortBy === "firstName") {
        comparison = a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' });
      } else if (sortBy === "lastName") {
        comparison = a.lastName.localeCompare(b.lastName, undefined, { sensitivity: 'base' });
      } else if (sortBy === "admissionNumber") {
        // Handle numeric parts of admission numbers properly
        const admNoA = a.admissionNumber;
        const admNoB = b.admissionNumber;
        
        // If both admission numbers are in the same format (e.g., ABC123)
        // Extract any numeric parts for proper numeric comparison
        const numA = admNoA.replace(/^\D+/g, '');
        const numB = admNoB.replace(/^\D+/g, '');
        
        if (numA && numB) {
          // If both have numeric parts, compare those numerically
          const numCompare = parseInt(numA) - parseInt(numB);
          if (numCompare !== 0) return numCompare;
        }
        
        // Fall back to string comparison if numeric comparison doesn't yield a result
        comparison = admNoA.localeCompare(admNoB);
      } else {
        // Default fallback sort (by form then last name)
        if (a.form !== b.form) return a.form - b.form;
        return a.lastName.localeCompare(b.lastName);
      }
      
      // Apply sort direction
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Function to handle promoting students
  const openPromoteDialog = (form: number) => {
    setPromotionForm(form);
    // Pre-select all students from the current form
    const studentsInForm = students
      .filter(student => student.form === form)
      .map(student => student.id);
    setSelectedStudents(studentsInForm);
    setIsPromoteDialogOpen(true);
  };

  const handleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePromoteStudents = () => {
    if (selectedStudents.length === 0) {
      toast.error("No students selected");
      return;
    }

    let promoted = 0;
    let graduated = 0;
    
    selectedStudents.forEach(studentId => {
      const student = students.find(s => s.id === studentId);
      if (!student) return;
      
      if (student.form < 4) {
        // Promote to next form
        updateStudent(student.id, {
          form: student.form + 1
        });
        promoted++;
      } else if (student.form === 4) {
        // Form 4 students are graduating
        updateStudent(student.id, {
          form: 5, // Form 5 can represent alumni in this system
        });
        graduated++;
      }
    });

    setIsPromoteDialogOpen(false);
    setSelectedStudents([]);
    
    if (promoted > 0 && graduated > 0) {
      toast.success(`Promoted ${promoted} students and graduated ${graduated} students`);
    } else if (promoted > 0) {
      toast.success(`Successfully promoted ${promoted} students`);
    } else if (graduated > 0) {
      toast.success(`Successfully graduated ${graduated} students`);
    }
  };

  // Get count of students by form
  const getFormCount = (form: number) => {
    return students.filter(s => s.form === form).length;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <p className="text-muted-foreground">
          View and manage all student records
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-1 items-center">
                  Sort By: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="p-0 h-4 w-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSortDirection();
                    }}
                  >
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </Button>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSortBy("firstName")}>
                  First Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("lastName")}>
                  Last Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("admissionNumber")}>
                  Admission Number
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {currentTeacher?.role === "admin" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <ArrowUpSquare className="h-4 w-4" />
                    Promote Students
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => openPromoteDialog(1)}>
                    Form 1 to Form 2 ({getFormCount(1)} students)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPromoteDialog(2)}>
                    Form 2 to Form 3 ({getFormCount(2)} students)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPromoteDialog(3)}>
                    Form 3 to Form 4 ({getFormCount(3)} students)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openPromoteDialog(4)}>
                    Form 4 to Alumni ({getFormCount(4)} students)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Forms</TabsTrigger>
            <TabsTrigger value="form1">Form 1</TabsTrigger>
            <TabsTrigger value="form2">Form 2</TabsTrigger>
            <TabsTrigger value="form3">Form 3</TabsTrigger>
            <TabsTrigger value="form4">Form 4</TabsTrigger>
            {currentTeacher?.role === "admin" && (
              <TabsTrigger value="form5">Alumni</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>
                        {student.lastName}, {student.firstName}
                      </span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        student.form === 5 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-education-light text-education-primary"
                      }`}>
                        {student.form === 5 ? "Alumni" : `Form ${student.form}`}
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
      
      {/* Promotion Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {promotionForm < 4 
                ? `Promote Form ${promotionForm} Students to Form ${promotionForm + 1}` 
                : "Graduate Form 4 Students to Alumni"}
            </DialogTitle>
            <DialogDescription>
              Select the students you want to {promotionForm < 4 ? "promote" : "graduate"}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-2">
            {students
              .filter(s => s.form === promotionForm)
              .sort((a, b) => a.lastName.localeCompare(b.lastName))
              .map(student => (
                <div key={student.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={student.id}
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleStudentSelection(student.id)}
                    className="rounded border-gray-300 text-education-primary focus:ring-education-primary"
                  />
                  <label htmlFor={student.id} className="flex-1 cursor-pointer">
                    {student.lastName}, {student.firstName} ({student.admissionNumber})
                  </label>
                </div>
              ))}
              
            {students.filter(s => s.form === promotionForm).length === 0 && (
              <p className="text-center py-4 text-gray-500">No students found in this form</p>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setSelectedStudents(students.filter(s => s.form === promotionForm).map(s => s.id))}
            >
              Select All
            </Button>
            <span className="text-sm text-gray-500">
              {selectedStudents.filter(id => 
                students.find(s => s.id === id)?.form === promotionForm
              ).length} of {students.filter(s => s.form === promotionForm).length} selected
            </span>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePromoteStudents}>
              {promotionForm < 4 ? "Promote Students" : "Graduate Students"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
