"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { authAPI } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const errors = {
    email: !formData.email.trim()
      ? "Email is required"
      : !EMAIL_REGEX.test(formData.email)
      ? "Enter a valid email address"
      : null,
    password: !formData.password
      ? "Password is required"
      : formData.password.length < 6
      ? "Password must be at least 6 characters"
      : null,
  };

  const isFormValid = Object.values(errors).every((e) => e === null);

  const touch = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;

    setApiError("");
    setIsLoading(true);
    try {
      await authAPI.login(formData);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar p-12 flex-col justify-center items-center text-sidebar-foreground">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="bg-sidebar-primary p-3 rounded-xl">
              <BarChart3 className="w-10 h-10 text-sidebar-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold">Cottage Coins</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your personal finance companion for smarter money management
          </p>
          <img
            src="/illustration1.svg"
            alt="Finance illustration"
            className="w-full max-w-sm mx-auto"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="space-y-1">
            <div className="flex lg:hidden items-center gap-2 mb-4">
              <BarChart3 className="w-8 h-8 text-sidebar-primary" />
              <span className="text-2xl font-bold">Cottage Coins</span>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {apiError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => touch("email")}
                  className={cn(touched.email && errors.email && "border-destructive focus-visible:ring-destructive")}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => touch("password")}
                  className={cn(touched.password && errors.password && "border-destructive focus-visible:ring-destructive")}
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
