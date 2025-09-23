"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SigninSchema } from "@/lib/auth-schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SigninFormData = z.infer<typeof SigninSchema>;

export default function BankSignin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninSchema),
    defaultValues: {
      lastName: "",
      password: "",
    },
  });

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: session } = await authClient.getSession()
        if (session) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsCheckingSession(false);
      }
    }
    checkSession();
  }, [router]);

  async function onSubmit(values: SigninFormData) {
    const { lastName, password } = values;

    try {
      await authClient.signIn.email(
        {
          email: `${lastName}@dashenbank.com`,
          password,
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            toast.info("Authenticating...", {
              description: "Please wait while we sign you in",
            });
          },
          onSuccess: () => {
            toast.success("Welcome!", {
              description: "You've been signed in successfully",
            });
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error("Sign in failed", {
              description:
                ctx.error.message || "Please check your credentials and try again",
            });
          },
        }
      );
    } catch (err) {
      toast.error("An unexpected error occurred", {
        description: "Please try again later",
      });
      console.error("Sign-in error →", err);
    }
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6">
      <title>Sign In | Loan Orgination</title>
      <Card className="w-full max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-lg border border-blue-200">
        <CardHeader className="text-center space-y-2 mb-4 sm:mb-6">
          <CardTitle className="text-3xl sm:text-4xl font-extrabold text-blue-700 ml-16">
          <img src="/dashen logo.png" alt="dashen bank logo" className="flex flex-col justify-center items-center ml-7" />
          </CardTitle>
          <CardDescription className="text-blue-900 text-base sm:text-lg font-bold mt-8">
             Welcome to Dashen Bank Loan Orgination
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Bank Code Input */}
            <div className="space-y-2">
              <Label
                htmlFor="bankCode"
                className="font-semibold text-blue-700 text-sm sm:text-base"
              >
                Enter User name
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter your last name"
                className="placeholder-blue-300 text-blue-700 focus:ring-2 focus:ring-blue-400"
              />
              {errors.lastName && (
                <p className="text-xs sm:text-sm text-blue-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="password"
                  className="font-semibold text-blue-700 text-sm sm:text-base"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your password"
                className="placeholder-blue-300 text-blue-700 focus:ring-2 focus:ring-blue-400"
              />
              {errors.password && (
                <p className="text-xs sm:text-sm text-blue-600 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 font-semibold text-white rounded-lg shadow-sm active:scale-[0.98] transition-transform"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

      </Card>
    </div>
  );
}