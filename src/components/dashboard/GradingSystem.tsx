import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GradingSystem as GradingSystemType, GradeRange, DivisionRange } from "@/types";

interface GradeRangeForm {
  grade: string;
  minScore: number;
  maxScore: number;
  points: number;
}

interface DivisionRangeForm {
  division: string;
  minPoints: number;
  maxPoints: number;
  description: string;
}

export const GradingSystem: React.FC = () => {
  const [gradingSystems, setGradingSystems] = useState<GradingSystemType[]>([]);
  const [selectedSystem, setSelectedSystem] = useState<GradingSystemType | null>(null);
  const [gradeRanges, setGradeRanges] = useState<GradeRange[]>([]);
  const [divisionRanges, setDivisionRanges] = useState<DivisionRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSystemDialogOpen, setIsSystemDialogOpen] = useState(false);
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [isDivisionDialogOpen, setIsDivisionDialogOpen] = useState(false);
  const [systemForm, setSystemForm] = useState({ name: "", description: "" });
  const [gradeForm, setGradeForm] = useState<GradeRangeForm>({ grade: "", minScore: 0, maxScore: 100, points: 1 });
  const [divisionForm, setDivisionForm] = useState<DivisionRangeForm>({ division: "", minPoints: 0, maxPoints: 100, description: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchGradingSystems();
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      fetchGradeRanges(selectedSystem.id);
      fetchDivisionRanges(selectedSystem.id);
    }
  }, [selectedSystem]);

  const fetchGradingSystems = async () => {
    try {
      const { data, error } = await supabase
        .from('grading_systems')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const systems = data.map(system => ({
        id: system.id,
        name: system.name,
        description: system.description,
        isActive: system.is_active,
        createdAt: system.created_at,
        updatedAt: system.updated_at
      }));

      setGradingSystems(systems);
      
      // Select the active system by default
      const activeSystem = systems.find(s => s.isActive);
      if (activeSystem && !selectedSystem) {
        setSelectedSystem(activeSystem);
      }
    } catch (error) {
      console.error('Error fetching grading systems:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grading systems",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeRanges = async (systemId: string) => {
    try {
      const { data, error } = await supabase
        .from('grade_ranges')
        .select('*')
        .eq('grading_system_id', systemId)
        .order('max_score', { ascending: false });

      if (error) throw error;

      setGradeRanges(data.map(range => ({
        id: range.id,
        gradingSystemId: range.grading_system_id,
        grade: range.grade,
        minScore: range.min_score,
        maxScore: range.max_score,
        points: range.points,
        createdAt: range.created_at
      })));
    } catch (error) {
      console.error('Error fetching grade ranges:', error);
    }
  };

  const fetchDivisionRanges = async (systemId: string) => {
    try {
      const { data, error } = await supabase
        .from('division_ranges')
        .select('*')
        .eq('grading_system_id', systemId)
        .order('min_points', { ascending: false });

      if (error) throw error;

      setDivisionRanges(data.map(range => ({
        id: range.id,
        gradingSystemId: range.grading_system_id,
        division: range.division,
        minPoints: range.min_points,
        maxPoints: range.max_points,
        description: range.description,
        createdAt: range.created_at
      })));
    } catch (error) {
      console.error('Error fetching division ranges:', error);
    }
  };

  const handleCreateSystem = async () => {
    if (!systemForm.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('grading_systems')
        .insert({
          name: systemForm.name,
          description: systemForm.description,
          is_active: false
        })
        .select()
        .single();

      if (error) throw error;

      const newSystem = {
        id: data.id,
        name: data.name,
        description: data.description,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setGradingSystems([newSystem, ...gradingSystems]);
      setSystemForm({ name: "", description: "" });
      setIsSystemDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Grading system created successfully",
      });
    } catch (error) {
      console.error('Error creating grading system:', error);
      toast({
        title: "Error",
        description: "Failed to create grading system",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (systemId: string, isActive: boolean) => {
    try {
      // If activating a system, deactivate all others first
      if (isActive) {
        await supabase
          .from('grading_systems')
          .update({ is_active: false })
          .neq('id', systemId);
      }

      const { error } = await supabase
        .from('grading_systems')
        .update({ is_active: isActive })
        .eq('id', systemId);

      if (error) throw error;

      setGradingSystems(systems =>
        systems.map(s => ({
          ...s,
          isActive: s.id === systemId ? isActive : (isActive ? false : s.isActive)
        }))
      );

      toast({
        title: "Success",
        description: `Grading system ${isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating grading system:', error);
      toast({
        title: "Error",
        description: "Failed to update grading system",
        variant: "destructive",
      });
    }
  };

  const handleAddGradeRange = async () => {
    if (!selectedSystem || !gradeForm.grade.trim()) return;

    try {
      const { data, error } = await supabase
        .from('grade_ranges')
        .insert({
          grading_system_id: selectedSystem.id,
          grade: gradeForm.grade,
          min_score: gradeForm.minScore,
          max_score: gradeForm.maxScore,
          points: gradeForm.points
        })
        .select()
        .single();

      if (error) throw error;

      const newRange = {
        id: data.id,
        gradingSystemId: data.grading_system_id,
        grade: data.grade,
        minScore: data.min_score,
        maxScore: data.max_score,
        points: data.points,
        createdAt: data.created_at
      };

      setGradeRanges([...gradeRanges, newRange].sort((a, b) => b.maxScore - a.maxScore));
      setGradeForm({ grade: "", minScore: 0, maxScore: 100, points: 1 });
      setIsGradeDialogOpen(false);

      toast({
        title: "Success",
        description: "Grade range added successfully",
      });
    } catch (error) {
      console.error('Error adding grade range:', error);
      toast({
        title: "Error",
        description: "Failed to add grade range",
        variant: "destructive",
      });
    }
  };

  const handleAddDivisionRange = async () => {
    if (!selectedSystem || !divisionForm.division.trim()) return;

    try {
      const { data, error } = await supabase
        .from('division_ranges')
        .insert({
          grading_system_id: selectedSystem.id,
          division: divisionForm.division,
          min_points: divisionForm.minPoints,
          max_points: divisionForm.maxPoints,
          description: divisionForm.description
        })
        .select()
        .single();

      if (error) throw error;

      const newRange = {
        id: data.id,
        gradingSystemId: data.grading_system_id,
        division: data.division,
        minPoints: data.min_points,
        maxPoints: data.max_points,
        description: data.description,
        createdAt: data.created_at
      };

      setDivisionRanges([...divisionRanges, newRange].sort((a, b) => b.minPoints - a.minPoints));
      setDivisionForm({ division: "", minPoints: 0, maxPoints: 100, description: "" });
      setIsDivisionDialogOpen(false);

      toast({
        title: "Success",
        description: "Division range added successfully",
      });
    } catch (error) {
      console.error('Error adding division range:', error);
      toast({
        title: "Error",
        description: "Failed to add division range",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading grading systems...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grading System Management</h1>
          <p className="text-muted-foreground">Configure grade ranges and division criteria</p>
        </div>
        <Dialog open={isSystemDialogOpen} onOpenChange={setIsSystemDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Grading System
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Grading System</DialogTitle>
              <DialogDescription>
                Create a new grading system with custom grade and division ranges.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">System Name</Label>
                <Input
                  id="name"
                  value={systemForm.name}
                  onChange={(e) => setSystemForm({ ...systemForm, name: e.target.value })}
                  placeholder="e.g., Kenyan System, International System"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={systemForm.description}
                  onChange={(e) => setSystemForm({ ...systemForm, description: e.target.value })}
                  placeholder="Brief description of this grading system"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSystemDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSystem}>Create System</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grading Systems</CardTitle>
            <CardDescription>Available grading systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {gradingSystems.map((system) => (
              <div
                key={system.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedSystem?.id === system.id
                    ? 'border-primary bg-primary/5'
                    : 'border-muted hover:border-primary/50'
                }`}
                onClick={() => setSelectedSystem(system)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{system.name}</h3>
                  {system.isActive && <Badge variant="default">Active</Badge>}
                </div>
                {system.description && (
                  <p className="text-sm text-muted-foreground mb-2">{system.description}</p>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={system.isActive}
                    onCheckedChange={(checked) => handleToggleActive(system.id, checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Label className="text-sm">Set as active</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {selectedSystem ? (
            <Tabs defaultValue="grades">
              <TabsList>
                <TabsTrigger value="grades">Grade Ranges</TabsTrigger>
                <TabsTrigger value="divisions">Division Ranges</TabsTrigger>
              </TabsList>

              <TabsContent value="grades" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Grade Ranges - {selectedSystem.name}</CardTitle>
                        <CardDescription>Configure score-to-grade mappings</CardDescription>
                      </div>
                      <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Grade
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Grade Range</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="grade">Grade</Label>
                              <Input
                                id="grade"
                                value={gradeForm.grade}
                                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                placeholder="e.g., A, B+, C"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="minScore">Minimum Score</Label>
                                <Input
                                  id="minScore"
                                  type="number"
                                  value={gradeForm.minScore}
                                  onChange={(e) => setGradeForm({ ...gradeForm, minScore: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="maxScore">Maximum Score</Label>
                                <Input
                                  id="maxScore"
                                  type="number"
                                  value={gradeForm.maxScore}
                                  onChange={(e) => setGradeForm({ ...gradeForm, maxScore: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="points">Points</Label>
                              <Input
                                id="points"
                                type="number"
                                value={gradeForm.points}
                                onChange={(e) => setGradeForm({ ...gradeForm, points: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddGradeRange}>Add Grade</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Grade</TableHead>
                          <TableHead>Score Range</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gradeRanges.map((range) => (
                          <TableRow key={range.id}>
                            <TableCell className="font-medium">{range.grade}</TableCell>
                            <TableCell>{range.minScore} - {range.maxScore}</TableCell>
                            <TableCell>{range.points}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="divisions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Division Ranges - {selectedSystem.name}</CardTitle>
                        <CardDescription>Configure point-to-division classifications</CardDescription>
                      </div>
                      <Dialog open={isDivisionDialogOpen} onOpenChange={setIsDivisionDialogOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Division
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Division Range</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="division">Division</Label>
                              <Input
                                id="division"
                                value={divisionForm.division}
                                onChange={(e) => setDivisionForm({ ...divisionForm, division: e.target.value })}
                                placeholder="e.g., Division I, First Class"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="minPoints">Minimum Points</Label>
                                <Input
                                  id="minPoints"
                                  type="number"
                                  value={divisionForm.minPoints}
                                  onChange={(e) => setDivisionForm({ ...divisionForm, minPoints: Number(e.target.value) })}
                                />
                              </div>
                              <div>
                                <Label htmlFor="maxPoints">Maximum Points</Label>
                                <Input
                                  id="maxPoints"
                                  type="number"
                                  value={divisionForm.maxPoints}
                                  onChange={(e) => setDivisionForm({ ...divisionForm, maxPoints: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="divDescription">Description</Label>
                              <Textarea
                                id="divDescription"
                                value={divisionForm.description}
                                onChange={(e) => setDivisionForm({ ...divisionForm, description: e.target.value })}
                                placeholder="Description of this division level"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDivisionDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleAddDivisionRange}>Add Division</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Division</TableHead>
                          <TableHead>Point Range</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {divisionRanges.map((range) => (
                          <TableRow key={range.id}>
                            <TableCell className="font-medium">{range.division}</TableCell>
                            <TableCell>{range.minPoints} - {range.maxPoints}</TableCell>
                            <TableCell>{range.description}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center p-8">
                <div className="text-center">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Select a Grading System</h3>
                  <p className="text-muted-foreground">
                    Choose a grading system from the left to view and edit its grade and division ranges.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};