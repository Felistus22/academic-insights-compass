import React, { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpDown } from "lucide-react";

const EnterMarks: React.FC = () => {
  const { students, subjects, exams, marks, addMark, updateMark, deleteMark, currentTeacher, addExam } = useAppContext();
  
  // State management
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<number>(0);
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [editingMark, setEditingMark] = useState<any | null>(null);
  const [marksToEnter, setMarksToEnter] = useState<Record<string, number>>({});
  const [customExamYear, setCustomExamYear] = useState<string>(new Date().getFullYear().toString());
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Filter students by selected class and stream with proper sorting
  const filteredStudents = students
    .filter((student) => 
      (selectedClass === 0 || student.form === selectedClass) &&
      (selectedStream === "all" || student.stream === selectedStream)
    )
    .sort((a, b) => {
      // Sort by last name, then first name
      const lastNameComparison = a.lastName.localeCompare(b.lastName);
      if (lastNameComparison !== 0) {
        return sortDirection === "asc" ? lastNameComparison : -lastNameComparison;
      }
      const firstNameComparison = a.firstName.localeCompare(b.firstName);
      return sortDirection === "asc" ? firstNameComparison : -firstNameComparison;
    });
  
  // Filter exams by selected class
  const filteredExams = exams.filter((exam) => 
    selectedClass === 0 || exam.form === selectedClass
  );
  
  // Filter subjects that current teacher teaches (if teacher role)
  const filteredSubjects = currentTeacher?.role === "teacher" 
    ? subjects.filter((subject) => currentTeacher.subjectIds.includes(subject.id)) 
    : subjects;
  
  // Get existing marks for selected exam and subject
  const existingMarks = selectedExam && selectedSubject 
    ? marks.filter((mark) => 
        mark.examId === selectedExam && 
        mark.subjectId === selectedSubject
      ) 
    : [];
    
  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  // Handle adding a new exam with custom year
  const handleAddCustomExam = () => {
    // Display dialog for creating new exam
    const examName = prompt("Enter exam name:");
    if (!examName) return;
    
    const year = parseInt(customExamYear);
    if (isNaN(year)) {
      toast.error("Please enter a valid year");
      return;
    }
    
    const newExam = addExam({
      name: examName,
      type: "Custom",
      term: 1, // Default term
      year: year,
      form: selectedClass,
      date: new Date().toISOString()
    });
    
    // Set the newly created exam as selected
    setSelectedExam(newExam.id);
    toast.success(`New exam "${examName}" created successfully!`);
  };
  
  const handleSubmitMarks = () => {
    if (!selectedExam || !selectedSubject) {
      toast.error("Please select an exam and subject");
      return;
    }
    
    let success = 0;
    let skipped = 0;
    
    Object.entries(marksToEnter).forEach(([studentId, score]) => {
      // Validate the score
      if (score < 0 || score > 100) {
        toast.error(`Invalid score for student ${studentId}: ${score}`);
        return;
      }
      
      // Check if mark already exists
      const existingMark = marks.find(
        (mark) => 
          mark.studentId === studentId && 
          mark.examId === selectedExam && 
          mark.subjectId === selectedSubject
      );
      
      if (existingMark) {
        // Update existing mark
        updateMark({
          ...existingMark,
          score: score
        });
        success++;
      } else {
        // Add new mark
        addMark({
          studentId,
          examId: selectedExam,
          subjectId: selectedSubject,
          score: score,
          remarks: ""
        });
        success++;
      }
    });
    
    // Clear the marks after submission
    setMarksToEnter({});
    
    toast.success(`Successfully recorded ${success} marks${skipped > 0 ? `, skipped ${skipped}` : ""}!`);
  };
  
  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setMarksToEnter((prev) => ({
        ...prev,
        [studentId]: numValue
      }));
    } else if (value === "") {
      // Allow empty input for clearing
      setMarksToEnter((prev) => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
    }
  };
  
  const handleEditMark = (mark: any) => {
    setEditingMark(mark);
  };
  
  const handleUpdateMark = () => {
    if (!editingMark) return;
    
    if (editingMark.score < 0 || editingMark.score > 100) {
      toast.error("Score must be between 0 and 100");
      return;
    }
    
    updateMark(editingMark);
    setEditingMark(null);
    toast.success("Mark updated successfully");
  };
  
  const handleDeleteMark = (markId: string) => {
    if (confirm("Are you sure you want to delete this mark?")) {
      deleteMark(markId);
    }
  };
  
  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
  };
  
  // Get subject name by ID
  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };
  
  // Get exam name by ID
  const getExamName = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    return exam ? exam.name : "Unknown Exam";
  };
  
  // Format the exam date based on exam ID
  const getFormattedExamDate = (examId: string): string => {
    const exam = exams.find((e) => e.id === examId);
    if (!exam) return "Unknown Date";
    
    const date = new Date(exam.date);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Enter Marks</h2>
        <p className="text-muted-foreground">
          Record and manage student marks for subjects and exams
        </p>
      </div>
      
      <Tabs defaultValue="enter" className="space-y-4">
        <TabsList>
          <TabsTrigger value="enter">Enter New Marks</TabsTrigger>
          <TabsTrigger value="view">View & Edit Marks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="enter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class">Form/Class</Label>
                  <Select
                    value={selectedClass.toString()} 
                    onValueChange={(value) => setSelectedClass(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Forms</SelectItem>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                      <SelectItem value="4">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream</Label>
                  <Select
                    value={selectedStream}
                    onValueChange={setSelectedStream}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stream" />
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
                  <Label htmlFor="subject">Subject</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam</Label>
                  <div className="flex space-x-2">
                    <Select 
                      value={selectedExam} 
                      onValueChange={setSelectedExam}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select Exam" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredExams.map((exam) => (
                          <SelectItem key={exam.id} value={exam.id}>
                            {exam.name} ({exam.year})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={handleAddCustomExam}
                    >
                      Add Exam
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="examYear">Custom Exam Year</Label>
                  <Input
                    id="examYear"
                    type="number"
                    value={customExamYear}
                    onChange={(e) => setCustomExamYear(e.target.value)}
                    placeholder="Enter exam year"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {selectedExam && selectedSubject && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  Enter Marks for {getSubjectName(selectedSubject)} - {getExamName(selectedExam)}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSortDirection}
                  className="ml-auto"
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Sort {sortDirection === "asc" ? "A-Z" : "Z-A"}
                </Button>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Admission No.</TableHead>
                          <TableHead>Form</TableHead>
                          <TableHead className="text-right">Mark (0-100)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map((student) => {
                          // Check if a mark already exists
                          const existingMark = existingMarks.find(
                            (m) => m.studentId === student.id
                          );
                          
                          return (
                            <TableRow key={student.id}>
                              <TableCell>
                                {student.lastName}, {student.firstName}
                              </TableCell>
                              <TableCell>{student.admissionNumber}</TableCell>
                              <TableCell>Form {student.form}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={
                                    student.id in marksToEnter
                                      ? marksToEnter[student.id]
                                      : existingMark
                                      ? existingMark.score
                                      : ""
                                  }
                                  onChange={(e) =>
                                    handleMarkChange(student.id, e.target.value)
                                  }
                                  placeholder={
                                    existingMark
                                      ? `Current: ${existingMark.score}`
                                      : "Enter mark"
                                  }
                                  className="w-24 inline-block text-right"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-4">No students found for the selected criteria.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setMarksToEnter({})}>
                  Clear
                </Button>
                <Button 
                  onClick={handleSubmitMarks}
                  disabled={Object.keys(marksToEnter).length === 0}
                >
                  Save Marks
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="view" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>View Recorded Marks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="view-class">Form/Class</Label>
                  <Select
                    value={selectedClass.toString()} 
                    onValueChange={(value) => setSelectedClass(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">All Forms</SelectItem>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                      <SelectItem value="4">Form 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="view-stream">Stream</Label>
                  <Select
                    value={selectedStream}
                    onValueChange={setSelectedStream}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Stream" />
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
                  <Label htmlFor="view-subject">Subject</Label>
                  <Select 
                    value={selectedSubject} 
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="view-exam">Exam</Label>
                  <Select 
                    value={selectedExam} 
                    onValueChange={setSelectedExam}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredExams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name} ({exam.year})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedExam && selectedSubject && (
                <div className="border rounded-md mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {existingMarks.length > 0 ? (
                        existingMarks.map((mark) => {
                          const student = students.find(s => s.id === mark.studentId);
                          if (!student) return null;
                          
                          return (
                            <TableRow key={mark.id}>
                              <TableCell>
                                {student.firstName} {student.lastName}
                              </TableCell>
                              <TableCell>{student.admissionNumber}</TableCell>
                              <TableCell>{mark.score}</TableCell>
                              <TableCell>{mark.grade}</TableCell>
                              <TableCell className="text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="mr-2"
                                      onClick={() => handleEditMark({...mark})}
                                    >
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Mark</DialogTitle>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="studentName">Student</Label>
                                          <Input
                                            id="studentName"
                                            value={getStudentName(mark.studentId)}
                                            disabled
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="examName">Exam</Label>
                                          <Input
                                            id="examName"
                                            value={getExamName(mark.examId)}
                                            disabled
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="score">Score (0-100)</Label>
                                          <Input
                                            id="score"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={editingMark?.score || ""}
                                            onChange={(e) =>
                                              setEditingMark({
                                                ...editingMark,
                                                score: parseInt(e.target.value, 10) || 0
                                              })
                                            }
                                          />
                                        </div>
                                        <div>
                                          <Label htmlFor="remarks">Remarks (Optional)</Label>
                                          <Input
                                            id="remarks"
                                            value={editingMark?.remarks || ""}
                                            onChange={(e) =>
                                              setEditingMark({
                                                ...editingMark,
                                                remarks: e.target.value
                                              })
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div className="mt-4 flex justify-end">
                                        <Button onClick={handleUpdateMark}>
                                          Update Mark
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteMark(mark.id)}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No marks recorded for this selection
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterMarks;
