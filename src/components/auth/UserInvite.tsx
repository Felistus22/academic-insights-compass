import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { AlertTriangle, UserPlus } from "lucide-react";

const UserInvite: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("teacher");
  const [isLoading, setIsLoading] = useState(false);
  const { currentTeacher } = useSupabaseAppContext();

  // Check if user is properly authenticated with Supabase (not a demo user)
  const isDemoUser = currentTeacher?.email?.includes('@school.edu') || 
                     currentTeacher?.email?.includes('demo') ||
                     !currentTeacher?.id?.includes('-'); // Real Supabase UUIDs have dashes

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Call Edge Function to create user with proper permissions
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`https://nsfaxsswgshpseyeoqzm.supabase.co/functions/v1/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          role
        })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        toast.error(result.error || "Failed to create user");
        console.error("Create user error:", result.error);
        return;
      }

      toast.success(`User ${firstName} ${lastName} created successfully! They can now log in.`);
      
      // Reset form
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setRole("teacher");

    } catch (error) {
      toast.error("Failed to create user");
      console.error("Create user error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {isDemoUser && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You're currently using a demo account. To create users, you need to be signed in with a real Supabase user account with admin privileges.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </CardTitle>
          <CardDescription>
            Add a new user directly to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isDemoUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isDemoUser}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDemoUser}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isDemoUser}
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isDemoUser}
                className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || isDemoUser}
            >
              {isLoading ? "Creating User..." : "Create User"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInvite;