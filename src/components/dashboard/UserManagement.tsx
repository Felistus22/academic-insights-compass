import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserInvite from "@/components/auth/UserInvite";
import { Mail, Users } from "lucide-react";

const UserManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <p className="text-muted-foreground">
          Invite new users and manage authentication
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Invite New User */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Invite New User</CardTitle>
              </div>
              <CardDescription>
                Send an email invitation with a setup link to new users
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
                <h4 className="font-medium">Invitation Process:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Enter the user's email address above</li>
                  <li>Click "Send Invitation" to send the email</li>
                  <li>User receives email with a secure setup link</li>
                  <li>User clicks the link and sets their password</li>
                  <li>User can then sign in with their email and password</li>
                </ol>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Important Notes:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Invitations are sent from your app, not Supabase directly</li>
                  <li>Users will be redirected to the password setup page</li>
                  <li>Invitation links expire after 24 hours</li>
                  <li>You can manage users in the Supabase dashboard</li>
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