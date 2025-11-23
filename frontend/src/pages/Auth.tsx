// src/pages/Auth.tsx - DEBUGGED VERSION
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    console.log("🔵 handleLogin called");
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🔵 Form prevented, starting login...");
    setIsLoading(true);

    try {
      console.log("🔵 Attempting fetch to:", `${API_BASE_URL}/auth/login`);
      
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          email: loginEmail.trim(), 
          password: loginPassword 
        }),
      });

      console.log("🔵 Response status:", res.status);
      const data = await res.json();
      console.log("🔵 Response data:", data);

      if (!res.ok) {
        console.log("❌ Login failed:", data.message);
        toast.error(data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      // Save token and user data
      console.log("✅ Login successful, saving to localStorage...");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);

      console.log("✅ Data saved, showing toast...");
      toast.success(`Welcome ${data.full_name || data.email}!`);

      console.log("✅ Navigating to dashboard...");
      // Try immediate navigation first
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      console.error("❌ Login error:", err);
      toast.error("Cannot connect to server. Please check if backend is running.");
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    console.log("🟢 handleSignup called");
    e.preventDefault();
    e.stopPropagation();
    
    console.log("🟢 Form prevented, starting signup...");
    setIsLoading(true);

    try {
      console.log("🟢 Attempting fetch to:", `${API_BASE_URL}/auth/register`);
      
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: signupEmail.trim(),
          password: signupPassword,
          full_name: signupName.trim(),
          role: "accountant",
        }),
      });

      console.log("🟢 Response status:", res.status);
      const data = await res.json();
      console.log("🟢 Response data:", data);

      if (!res.ok) {
        console.log("❌ Signup failed:", data.message);
        toast.error(data.message || "Signup failed");
        setIsLoading(false);
        return;
      }

      // Save token and user data
      console.log("✅ Signup successful, saving to localStorage...");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userEmail", data.email);

      console.log("✅ Data saved, showing toast...");
      toast.success("Account created successfully!");
      
      console.log("✅ Navigating to dashboard...");
      navigate("/dashboard", { replace: true });
      
    } catch (err) {
      console.error("❌ Signup error:", err);
      toast.error("Network error. Please check if backend is running.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-3 rounded-full">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">School ERP System</CardTitle>
          <CardDescription>Account Management Module</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@school.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@school.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 p-4 bg-muted rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-2">Test Account:</p>
            <p>• Email: admin@school.com</p>
            <p>• Password: 123456</p>
            <p className="mt-2 text-[10px] opacity-75">
              Backend: http://localhost:5000
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;