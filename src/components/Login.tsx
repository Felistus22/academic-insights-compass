
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { useSupabaseAppContext } from "@/contexts/SupabaseAppContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useSupabaseAppContext();
  const { isOnline } = useNetworkStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-education-primary/10 to-education-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {!isOnline && (
            <div className="mb-2">
              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                Offline Mode - Demo Accounts Only
              </Badge>
            </div>
          )}
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <Image 
              src="/lovable-uploads/5263c487-173b-4d9b-83a5-6824f9f805d8.png" 
              alt="Padre Pio School Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <div className="text-center mb-2">
            <h2 className="text-lg font-bold text-education-primary">PADRE PIO</h2>
            <p className="text-sm text-gray-600">Girls Secondary School</p>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access the Padre Pio School Management System
            {!isOnline && (
              <span className="block mt-1 text-orange-600">
                Currently offline - using demo data
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="teacher@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-education-primary hover:bg-education-dark"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs">
              <p><strong>Admin:</strong> admin@school.com / admin123</p>
              <p><strong>Teacher:</strong> teacher@school.com / teacher123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
