
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StudentTab from "./reports/StudentTab";
import BatchTab from "./reports/BatchTab";
import FormTab from "./reports/FormTab";

const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view performance reports
        </p>
      </div>
      
      <Tabs defaultValue="student" className="space-y-4">
        <TabsList>
          <TabsTrigger value="student">Student Report Card</TabsTrigger>
          <TabsTrigger value="batch">Batch Reports</TabsTrigger>
          <TabsTrigger value="form">Form Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="student">
          <StudentTab />
        </TabsContent>
        
        <TabsContent value="batch">
          <BatchTab />
        </TabsContent>
        
        <TabsContent value="form">
          <FormTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
