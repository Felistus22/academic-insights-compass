
import React, { useState } from "react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { Subject } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Pencil, Plus, X, Trash2 } from "lucide-react";

const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required"),
});

type SubjectFormValues = z.infer<typeof subjectSchema>;

const ManageSubjects = () => {
  const { subjects, currentTeacher, addSubject, updateSubject, deleteSubject } = useSupabaseAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: "",
      code: "",
    },
  });

  // Only allow admins to access this page
  if (currentTeacher?.role !== "admin") {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800">Unauthorized</h2>
        <p className="mt-2 text-gray-600">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  const openAddDialog = () => {
    form.reset({
      name: "",
      code: "",
    });
    setEditingSubject(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    form.reset({
      name: subject.name,
      code: subject.code,
    });
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      if (editingSubject) {
        const success = await updateSubject(editingSubject.id, values);
        if (success) {
          toast.success("Subject updated successfully");
          setIsDialogOpen(false);
          form.reset();
        } else {
          toast.error("Failed to update subject");
        }
      } else {
        const newSubject = await addSubject(values as Subject);
        if (newSubject) {
          toast.success("Subject added successfully");
          setIsDialogOpen(false);
          form.reset();
        } else {
          toast.error("Failed to add subject");
        }
      }
    } catch (error) {
      console.error("Error submitting subject:", error);
      toast.error("An error occurred while saving the subject");
    }
  };

  const confirmDelete = (subject: Subject) => {
    setDeleteConfirmSubject(subject);
  };

  const handleDelete = async () => {
    if (deleteConfirmSubject) {
      try {
        const success = await deleteSubject(deleteConfirmSubject.id);
        if (success) {
          toast.success("Subject deleted successfully");
          setDeleteConfirmSubject(null);
        } else {
          toast.error("Failed to delete subject");
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast.error("An error occurred while deleting the subject");
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Manage Subjects</h2>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus size={16} /> Add Subject
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name</TableHead>
              <TableHead>Subject Code</TableHead>
              <TableHead className="w-[140px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                  No subjects found. Click "Add Subject" to create one.
                </TableCell>
              </TableRow>
            ) : (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(subject)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmDelete(subject)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? "Edit Subject" : "Add New Subject"}
            </DialogTitle>
            <DialogDescription>
              {editingSubject
                ? "Update the subject details below."
                : "Enter the details for the new subject."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mathematics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., MATH101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingSubject ? "Update Subject" : "Add Subject"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmSubject}
        onOpenChange={(open) => !open && setDeleteConfirmSubject(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the subject "{deleteConfirmSubject?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmSubject(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSubjects;
