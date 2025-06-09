
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

interface FeeStructure {
  form: number;
  tuitionFee: number;
  boardingFee: number;
  otherCharges: number;
  total: number;
}

interface TermDates {
  form: number;
  term: number;
  year: number;
  closingDate: string;
  openingDate: string;
}

const FeeManagement: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<string>("1");
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  
  // Mock fee structures - in real app, this would come from database
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    { form: 1, tuitionFee: 400000, boardingFee: 150000, otherCharges: 50000, total: 600000 },
    { form: 2, tuitionFee: 420000, boardingFee: 150000, otherCharges: 50000, total: 620000 },
    { form: 3, tuitionFee: 450000, boardingFee: 150000, otherCharges: 50000, total: 650000 },
    { form: 4, tuitionFee: 480000, boardingFee: 150000, otherCharges: 50000, total: 680000 },
  ]);

  // Mock term dates - in real app, this would come from database
  const [termDates, setTermDates] = useState<TermDates[]>([
    // Form 1
    { form: 1, term: 1, year: 2023, closingDate: "2023-12-15", openingDate: "2024-01-08" },
    { form: 1, term: 2, year: 2023, closingDate: "2024-04-12", openingDate: "2024-05-06" },
    // Form 2
    { form: 2, term: 1, year: 2023, closingDate: "2023-12-16", openingDate: "2024-01-09" },
    { form: 2, term: 2, year: 2023, closingDate: "2024-04-13", openingDate: "2024-05-07" },
    // Form 3
    { form: 3, term: 1, year: 2023, closingDate: "2023-12-17", openingDate: "2024-01-10" },
    { form: 3, term: 2, year: 2023, closingDate: "2024-04-14", openingDate: "2024-05-08" },
    // Form 4
    { form: 4, term: 1, year: 2023, closingDate: "2023-12-18", openingDate: "2024-01-11" },
    { form: 4, term: 2, year: 2023, closingDate: "2024-04-15", openingDate: "2024-05-09" },
  ]);

  const [newFee, setNewFee] = useState({
    form: 1,
    tuitionFee: 0,
    boardingFee: 0,
    otherCharges: 0,
  });

  const [newTermDate, setNewTermDate] = useState({
    form: 1,
    term: 1,
    year: 2023,
    closingDate: "",
    openingDate: "",
  });

  const updateFeeStructure = () => {
    const total = newFee.tuitionFee + newFee.boardingFee + newFee.otherCharges;
    const updatedFees = feeStructures.map(fee => 
      fee.form === newFee.form 
        ? { ...newFee, total }
        : fee
    );
    
    if (!feeStructures.find(fee => fee.form === newFee.form)) {
      updatedFees.push({ ...newFee, total });
    }
    
    setFeeStructures(updatedFees);
    toast.success("Fee structure updated successfully!");
  };

  const updateTermDates = () => {
    const updatedDates = termDates.map(date => 
      date.form === newTermDate.form && date.term === newTermDate.term && date.year === newTermDate.year
        ? { ...newTermDate }
        : date
    );
    
    if (!termDates.find(date => 
      date.form === newTermDate.form && 
      date.term === newTermDate.term && 
      date.year === newTermDate.year
    )) {
      updatedDates.push({ ...newTermDate });
    }
    
    setTermDates(updatedDates);
    toast.success("Term dates updated successfully!");
  };

  const filteredTermDates = termDates.filter(date => 
    date.form === parseInt(selectedForm) && date.year === parseInt(selectedYear)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Fee Management</h2>
        <p className="text-muted-foreground">
          Manage school fees and term dates for each form
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Structure Management */}
        <Card>
          <CardHeader>
            <CardTitle>Fee Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form</Label>
                <Select
                  value={newFee.form.toString()}
                  onValueChange={(value) => setNewFee({...newFee, form: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Form 1</SelectItem>
                    <SelectItem value="2">Form 2</SelectItem>
                    <SelectItem value="3">Form 3</SelectItem>
                    <SelectItem value="4">Form 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tuition Fee (TSh)</Label>
                <Input
                  type="number"
                  value={newFee.tuitionFee}
                  onChange={(e) => setNewFee({...newFee, tuitionFee: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Boarding Fee (TSh)</Label>
                <Input
                  type="number"
                  value={newFee.boardingFee}
                  onChange={(e) => setNewFee({...newFee, boardingFee: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="space-y-2">
                <Label>Other Charges (TSh)</Label>
                <Input
                  type="number"
                  value={newFee.otherCharges}
                  onChange={(e) => setNewFee({...newFee, otherCharges: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <Button onClick={updateFeeStructure} className="w-full">
              Update Fee Structure
            </Button>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Current Fee Structures</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Form</TableHead>
                    <TableHead>Tuition</TableHead>
                    <TableHead>Boarding</TableHead>
                    <TableHead>Other</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fee) => (
                    <TableRow key={fee.form}>
                      <TableCell>Form {fee.form}</TableCell>
                      <TableCell>TSh {fee.tuitionFee.toLocaleString()}</TableCell>
                      <TableCell>TSh {fee.boardingFee.toLocaleString()}</TableCell>
                      <TableCell>TSh {fee.otherCharges.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">TSh {fee.total.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Term Dates Management */}
        <Card>
          <CardHeader>
            <CardTitle>Term Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Form</Label>
                <Select
                  value={newTermDate.form.toString()}
                  onValueChange={(value) => setNewTermDate({...newTermDate, form: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Form 1</SelectItem>
                    <SelectItem value="2">Form 2</SelectItem>
                    <SelectItem value="3">Form 3</SelectItem>
                    <SelectItem value="4">Form 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Term</Label>
                <Select
                  value={newTermDate.term.toString()}
                  onValueChange={(value) => setNewTermDate({...newTermDate, term: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Term 1</SelectItem>
                    <SelectItem value="2">Term 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={newTermDate.year}
                  onChange={(e) => setNewTermDate({...newTermDate, year: parseInt(e.target.value) || 2023})}
                />
              </div>
              <div className="space-y-2">
                <Label>Closing Date</Label>
                <Input
                  type="date"
                  value={newTermDate.closingDate}
                  onChange={(e) => setNewTermDate({...newTermDate, closingDate: e.target.value})}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Opening Date (Next Term)</Label>
                <Input
                  type="date"
                  value={newTermDate.openingDate}
                  onChange={(e) => setNewTermDate({...newTermDate, openingDate: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={updateTermDates} className="w-full">
              Update Term Dates
            </Button>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Filter Term Dates</h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Form 1</SelectItem>
                    <SelectItem value="2">Form 2</SelectItem>
                    <SelectItem value="3">Form 3</SelectItem>
                    <SelectItem value="4">Form 4</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Closing Date</TableHead>
                    <TableHead>Opening Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTermDates.map((date) => (
                    <TableRow key={`${date.form}-${date.term}-${date.year}`}>
                      <TableCell>Term {date.term}</TableCell>
                      <TableCell>{new Date(date.closingDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(date.openingDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeeManagement;
