import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Package, Users, BarChart3 } from "lucide-react";
import lightLogo from "../assets/light-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(() => {
    return new URLSearchParams(window.location.search).get('showLogin') === 'true';
  });
  const [loginData, setLoginData] = useState({ email: "", password: "", useTempUser: false });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  const { login, register, isLoginLoading, isRegisterLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ssoToken = params.get('ssoToken');
    const ssoError = params.get('ssoError');

    if (ssoToken) {
      localStorage.setItem('auth_token', ssoToken);
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      window.history.replaceState({}, '', '/');
      window.location.href = '/';
    }

    if (ssoError) {
      toast({
        title: "SSO Login Failed",
        description: decodeURIComponent(ssoError),
        variant: "destructive"
      });
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const { data: samlSettings } = useQuery<any>({
    queryKey: ['/api/saml-settings-public'],
  });

  const handleSamlLogin = () => {
    if (samlSettings?.enabled) {
      window.location.href = '/api/saml/login';
    } else {
      toast({
        title: "SSO Not Configured",
        description: "SAML SSO is not currently enabled or configured.",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive"
      });
      return;
    }
    try {
      await login(loginData);
      toast({ title: "Success", description: "Logged in successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Login failed",
        variant: "destructive" 
      });
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast({
        title: "Error",
        description: "Name, email and password are required",
        variant: "destructive"
      });
      return;
    }
    try {
      await register(registerData);
      toast({ title: "Success", description: "Account created successfully!" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Registration failed",
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={lightLogo} alt="Light Microfinance" className="h-10 w-auto object-contain" />
              <h1 className="ml-3 text-xl font-bold text-slate-900">Light Microfinance Pvt Ltd</h1>
            </div>
            <Dialog open={showLogin} onOpenChange={setShowLogin}>
              <DialogTrigger asChild>
                <Button data-testid="button-login">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50/30 border-blue-200">
                <DialogHeader className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <img src={lightLogo} alt="Light Microfinance" className="h-12 w-auto object-contain" />
                  </div>
                  <div className="text-center">
                    <DialogTitle className="text-xl font-bold text-slate-800">
                      Welcome Back
                    </DialogTitle>
                    <p className="text-sm text-slate-600">Light Microfinance Pvt Ltd</p>
                  </div>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                    <Button 
                      className="w-full h-12 text-base font-medium transition-all duration-200 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white border-0 shadow-lg"
                      onClick={handleSamlLogin}
                    >
                      Login with SSO
                    </Button>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-500">Or continue with</span>
                      </div>
                    </div>
                  </div>
                  {isRegisterMode && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isRegisterMode ? registerData.email : loginData.email}
                      onChange={(e) => {
                        if (isRegisterMode) {
                          setRegisterData({ ...registerData, email: e.target.value });
                        } else {
                          setLoginData({ ...loginData, email: e.target.value });
                        }
                      }}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={isRegisterMode ? registerData.password : loginData.password}
                      onChange={(e) => {
                        if (isRegisterMode) {
                          setRegisterData({ ...registerData, password: e.target.value });
                        } else {
                          setLoginData({ ...loginData, password: e.target.value });
                        }
                      }}
                      placeholder="Enter your password"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (isRegisterMode) {
                            handleRegister();
                          } else {
                            handleLogin();
                          }
                        }
                      }}
                    />
                  </div>
                  {/* Temporary account option removed */}
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={isRegisterMode ? handleRegister : handleLogin}
                      disabled={isRegisterMode ? isRegisterLoading : isLoginLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white border-0 shadow-lg"
                    >
                      {isRegisterMode ? (isRegisterLoading ? "Please wait..." : "Sign Up") : (isLoginLoading ? "Please wait..." : "Sign In")}
                    </Button>
                    {!isRegisterMode && (
                      <Button
                        variant="outline"
                        onClick={async () => {
                          if (!loginData.email) {
                            toast({ 
                              title: "Error", 
                              description: "Please enter your email address first",
                              variant: "destructive" 
                            });
                            return;
                          }
                          
                          try {
                            const response = await fetch('/api/auth/forgot-password', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: loginData.email })
                            });
                            
                            const data = await response.json();
                            toast({ 
                              title: "Success", 
                              description: "Password reset link sent to your email!"
                            });
                          } catch (error) {
                            toast({ 
                              title: "Error", 
                              description: "Failed to send reset email",
                              variant: "destructive" 
                            });
                          }
                        }}
                        className="w-full"
                      >
                        Forgot Password?
                      </Button>
                    )}
                    {/* Sign Up button removed */}
                    <Button 
                      variant="link" 
                      className="text-slate-600 invisible"
                      onClick={() => setIsRegisterMode(!isRegisterMode)}
                    >
                      {isRegisterMode ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
            Courier Management System
          </h1>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            {/* Get Started button removed as requested */}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="text-center">
              <Package className="h-12 w-12 text-primary mx-auto" />
              <CardTitle className="text-lg">Document Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 text-center">
                Complete lifecycle management of documents and couriers from dispatch to delivery with real-time status updates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto" />
              <CardTitle className="text-lg">Role-Based Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 text-center">
                Admin, Manager, and User roles with granular permissions for secure operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BarChart3 className="h-12 w-12 text-primary mx-auto" />
              <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 text-center">
                Comprehensive insights with charts and statistics to optimize your operations.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Building2 className="h-12 w-12 text-primary mx-auto" />
              <CardTitle className="text-lg">Branch Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 text-center">
                Manage documents and communications across multiple Light Microfinance branch locations.
              </p>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-orange-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-sm text-slate-600">
            <div className="flex justify-center mb-3">
              <img src={lightLogo} alt="Light Microfinance" className="h-8 w-auto object-contain" />
            </div>
            <p>&copy; 2024 Light Microfinance Pvt Ltd. Professional courier management system.</p>
            <p className="mt-1 text-xs text-slate-500">Finance. Simple.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
