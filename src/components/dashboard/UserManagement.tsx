import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserInvite from "@/components/auth/UserInvite";
import { UserPlus, Users } from "lucide-react";

const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Create new users and manage authentication
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Create New User */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <CardTitle>Create New User</CardTitle>
              </div>
              <CardDescription>
                Add users directly to the system with their credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserInvite />
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <CardTitle>How It Works</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">User Creation Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Fill in the user's details in the form</li>
                  <li>Choose their role (Teacher or Admin)</li>
                  <li>Click "Create User" to add them to the system</li>
                  <li>User can immediately sign in with their credentials</li>
                  <li>New users will appear in the system instantly</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Login Credentials:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Users log in with the email and password you set</li>
                  <li>No email confirmation required</li>
                  <li>Passwords must be at least 6 characters</li>
                  <li>You can reset passwords via Supabase dashboard</li>
                  <li>Real Supabase authentication required for creation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;