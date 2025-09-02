import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, Download, CheckCircle, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Student } from "@/types";

interface ExcelImportProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface StudentRow {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  form: number;
  stream: "A" | "B" | "C";
  guardianName: string;
  guardianPhone: string;
  imageUrl?: string;
  isValid: boolean;
  errors: string[];
}

const ExcelImport: React.FC<ExcelImportProps> = ({ onClose, onSuccess }) => {
  const { addStudent } = useSupabaseAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const validateStudent = (row: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!row.firstName || typeof row.firstName !== 'string' || row.firstName.trim() === '') {
      errors.push('First name is required');
    }
    if (!row.lastName || typeof row.lastName !== 'string' || row.lastName.trim() === '') {
      errors.push('Last name is required');
    }
    if (!row.admissionNumber || typeof row.admissionNumber !== 'string' || row.admissionNumber.trim() === '') {
      errors.push('Admission number is required');
    }
    if (!row.form || ![1, 2, 3, 4, 5].includes(Number(row.form))) {
      errors.push('Form must be 1, 2, 3, 4, or 5');
    }
    if (!row.stream || !['A', 'B', 'C'].includes(row.stream?.toString().toUpperCase())) {
      errors.push('Stream must be A, B, or C');
    }
    if (!row.guardianName || typeof row.guardianName !== 'string' || row.guardianName.trim() === '') {
      errors.push('Guardian name is required');
    }
    if (!row.guardianPhone || typeof row.guardianPhone !== 'string' || row.guardianPhone.trim() === '') {
      errors.push('Guardian phone is required');
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStudentRows([]);
      setShowPreview(false);
    }
  };

  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedRows: StudentRow[] = jsonData.map((row: any) => {
        const validation = validateStudent(row);
        return {
          firstName: row.firstName?.toString().trim() || '',
          lastName: row.lastName?.toString().trim() || '',
          admissionNumber: row.admissionNumber?.toString().trim() || '',
          form: Number(row.form) || 1,
          stream: row.stream?.toString().toUpperCase() as "A" | "B" | "C" || 'A',
          guardianName: row.guardianName?.toString().trim() || '',
          guardianPhone: row.guardianPhone?.toString().trim() || '',
          imageUrl: row.imageUrl?.toString().trim() || '',
          isValid: validation.isValid,
          errors: validation.errors,
        };
      });

      setStudentRows(processedRows);
      setShowPreview(true);
      toast.success(`Processed ${processedRows.length} rows from Excel file`);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error processing Excel file. Please check the format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const importStudents = async () => {
    const validStudents = studentRows.filter(row => row.isValid);
    if (validStudents.length === 0) {
      toast.error('No valid students to import');
      return;
    }

    setIsProcessing(true);
    try {
      let successCount = 0;
      for (const studentRow of validStudents) {
        const studentData: Omit<Student, 'id'> = {
          firstName: studentRow.firstName,
          lastName: studentRow.lastName,
          admissionNumber: studentRow.admissionNumber,
          form: studentRow.form,
          stream: studentRow.stream,
          guardianName: studentRow.guardianName,
          guardianPhone: studentRow.guardianPhone,
          imageUrl: studentRow.imageUrl || undefined,
        };

        try {
          await addStudent(studentData);
          successCount++;
        } catch (error) {
          console.error('Error adding student:', error);
        }
      }

      toast.success(`Successfully imported ${successCount} students`);
      if (successCount > 0) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error importing students:', error);
      toast.error('Error importing students');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        firstName: 'John',
        lastName: 'Doe',
        admissionNumber: 'ADM001',
        form: 1,
        stream: 'A',
        guardianName: 'Jane Doe',
        guardianPhone: '+255123456789',
        imageUrl: 'https://example.com/photo.jpg (optional)'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
    XLSX.writeFile(workbook, 'students_template.xlsx');
    toast.success('Template downloaded successfully');
  };

  const validCount = studentRows.filter(row => row.isValid).length;
  const invalidCount = studentRows.length - validCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Import Students from Excel</h3>
          <p className="text-muted-foreground">Upload an Excel file to import multiple students at once</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Close
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Excel Format Requirements</CardTitle>
          <CardDescription>
            Download the template below or ensure your Excel file has these exact column headers:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={downloadTemplate} className="mb-4">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Required Columns:</h4>
              <ul className="text-sm space-y-1">
                <li><strong>firstName</strong> - Student's first name (required)</li>
                <li><strong>lastName</strong> - Student's last name (required)</li>
                <li><strong>admissionNumber</strong> - Unique admission number (required)</li>
                <li><strong>form</strong> - Form/Grade level: 1, 2, 3, 4, or 5 (required)</li>
                <li><strong>stream</strong> - Class stream: A, B, or C (required)</li>
                <li><strong>guardianName</strong> - Guardian's full name (required)</li>
                <li><strong>guardianPhone</strong> - Guardian's phone number (required)</li>
                <li><strong>imageUrl</strong> - Photo URL (optional)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="excel-file">Select Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="mt-1"
            />
          </div>

          {file && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={processFile}
            disabled={!file || isProcessing}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Process File'}
          </Button>
        </CardContent>
      </Card>

      {showPreview && studentRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Validation</CardTitle>
            <CardDescription>
              {validCount} valid students, {invalidCount} with errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invalidCount > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Some rows have validation errors. Only valid students will be imported.
                  </AlertDescription>
                </Alert>
              )}

              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Form</TableHead>
                      <TableHead>Stream</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentRows.map((row, index) => (
                      <TableRow key={index} className={row.isValid ? 'bg-green-50' : 'bg-red-50'}>
                        <TableCell>
                          {row.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>{row.firstName} {row.lastName}</TableCell>
                        <TableCell>{row.admissionNumber}</TableCell>
                        <TableCell>{row.form}</TableCell>
                        <TableCell>{row.stream}</TableCell>
                        <TableCell>{row.guardianName}</TableCell>
                        <TableCell>{row.guardianPhone}</TableCell>
                        <TableCell className="text-red-600 text-sm">
                          {row.errors.join('; ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                onClick={importStudents}
                disabled={validCount === 0 || isProcessing}
                className="w-full bg-education-primary hover:bg-education-dark"
              >
                {isProcessing ? 'Importing...' : `Import ${validCount} Valid Students`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelImport;