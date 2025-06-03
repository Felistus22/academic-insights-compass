
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowRight, CheckCircle } from "lucide-react";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";

const MigrationPrompt: React.FC = () => {
  const { migrateData, isLoading } = useSupabaseAppContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-education-primary/10 to-education-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-education-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
            <Database className="h-8 w-8 text-education-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Database Migration Required</CardTitle>
          <CardDescription className="text-base">
            Your application data needs to be migrated to the Supabase database to enable full functionality.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-800">Database tables created successfully</span>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <ArrowRight className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-blue-800">Ready to migrate your data</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              The migration will transfer:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Student records and information</li>
              <li>• Teacher accounts and assignments</li>
              <li>• Subject definitions</li>
              <li>• Exam records and marks</li>
              <li>• Activity logs</li>
            </ul>
          </div>

          <Button 
            onClick={migrateData} 
            disabled={isLoading}
            className="w-full bg-education-primary hover:bg-education-dark"
            size="lg"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Migrating Data...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Start Migration
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This process may take a few moments. Please do not close the window.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MigrationPrompt;
