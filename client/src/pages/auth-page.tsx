import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [userRole, setUserRole] = useState<"user" | "professor">("user");

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "user" as const
    }
  });

  if (user) {
    return user.role === "professor" ? <Redirect to="/professor" /> : <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="bg-muted p-8 hidden md:flex items-center justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Welcome to Peerbud</h1>
          <p className="text-muted-foreground">
            Join our academic community to get your research papers peer reviewed by
            top institutes and expand your scholarly impact.
          </p>
        </div>
      </div>

      <div className="p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Tabs defaultValue="login">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form
                  onSubmit={loginForm.handleSubmit((data) => {
                    loginMutation.mutate({
                      username: data.username,
                      password: data.password
                    });
                  })}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input {...loginForm.register("username")} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      {...loginForm.register("password")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-role">Account Type</Label>
                    <Select
                      value={userRole}
                      onValueChange={(value: "user" | "professor") => {
                        setUserRole(value);
                      }}
                    >
                      <SelectTrigger id="login-role">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Student</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: Selecting 'Professor' lets you review papers; 'Student' lets you submit papers
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form
                  onSubmit={registerForm.handleSubmit((data) => {
                    registerMutation.mutate({
                      username: data.username,
                      password: data.password,
                      role: userRole
                    });
                  })}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input {...registerForm.register("username")} />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      {...registerForm.register("password")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-role">Account Type</Label>
                    <Select
                      value={userRole}
                      onValueChange={(value: "user" | "professor") => {
                        setUserRole(value);
                      }}
                    >
                      <SelectTrigger id="register-role">
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Student</SelectItem>
                        <SelectItem value="professor">Professor</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Note: Selecting 'Professor' lets you review papers; 'Student' lets you submit papers
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
