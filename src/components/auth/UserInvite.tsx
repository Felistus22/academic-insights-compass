import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { AlertTriangle } from "lucide-react";

const UserInvite: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { currentTeacher } = useSupabaseAppContext();

  // Check if user is properly authenticated with Supabase (not a demo user)
  const isDemoUser = currentTeacher?.email?.includes('@school.edu') || 
                     currentTeacher?.email?.includes('demo') ||
                     !currentTeacher?.id?.includes('-'); // Real Supabase UUIDs have dashes

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Check if user is authenticated with Supabase
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || isDemoUser) {
      toast.error("User invitations require a real authenticated admin account. Please sign in with a Supabase user account.");
      setIsLoading(false);
      return;
    }
    
    try {
      const redirectUrl = `${window.location.origin}/password-setup`;
      
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectUrl
      });

      if (error) {
        if (error.message.includes('not allowed') || error.message.includes('admin')) {
          toast.error("Admin privileges required to send invitations. Please contact your system administrator.");
        } else {
          toast.error(error.message || "Failed to send invitation");
        }
        console.error("Invite error:", error);
      } else {
        toast.success(`Invitation sent to ${email}`);
        setEmail("");
      }
    } catch (error) {
      toast.error("Failed to send invitation");
      console.error("Invite error:", error);
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
            You're currently using a demo account. To send user invitations, you need to be signed in with a real Supabase user account with admin privileges.
          </AlertDescription>
        </Alert>
      )}

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invite New User</CardTitle>
          <CardDescription>
            Send an email invitation to a new user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                placeholder="user@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isDemoUser}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || isDemoUser}
            >
              {isLoading ? "Sending Invitation..." : "Send Invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserInvite;