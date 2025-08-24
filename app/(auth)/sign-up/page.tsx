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
import { RegisterEmployeeSchema } from "@/lib/auth-schema";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState } from "react";

// Create a modified schema without password field
const RegisterSchemaWithoutPassword = RegisterEmployeeSchema.omit({
  password: true,
});
type SignupFormData = z.infer<typeof RegisterSchemaWithoutPassword>;

export default function BankSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(RegisterSchemaWithoutPassword),
  });

  async function onSubmit(values: SignupFormData) {
    try {
      toast.info("Registering employee...", { duration: 4000 });

      // Generate default password based on bank code
      const defaultPassword = `${values.lastName}@12341234`;

      const { error } = await authClient.signUp.email(
        {
          email: `${values.lastName}@dashenbank.com`,
          password: defaultPassword,
          name: `${values.firstName} - ${values.middleName} - ${values.lastName}`,
          image: `${values.address} - ${values.phone} - ${values.nationalId}`,
         
          callbackURL: "/dashboard",
        },
        {
          onRequest: () => {
            toast.loading("Processing your request...");
          },
          onSuccess: () => {
            toast.success(
              "Employee registered successfully! Default password is your last name  followed by @12341234"
            );
            window.location.href = "/";
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Registration failed, try again.");
          },
        }
      );

      if (error) {
        toast.error(error.message || "Signup failed, please try again.");
      }
    } catch (err) {
      toast.error("Unexpected error occurred");
      console.error("sign-up error →", err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6">
      <title>Employee Registration | Loan Orgination</title>
      <Card className="w-full max-w-2xl bg-white rounded-xl shadow-sm border-0">
        <CardHeader className="text-center space-y-1 pb-2">
          <CardTitle className="text-2xl font-bold text-blue-700">
            Register Employee
          </CardTitle>
          <CardDescription className="text-blue-500">
            Onboard to the Loan Orgination
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-700">First Name</Label>
                <Input
                  {...register("firstName")}
                  placeholder="Enter employee first name"
                />
                {errors.firstName && (
                  <p className="text-xs text-blue-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-blue-700">Middle Name</Label>
                <Input
                  {...register("middleName")}
                  placeholder="Enter employee middle name"
                />
                {errors.middleName && (
                  <p className="text-xs text-blue-600">
                    {errors.middleName.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-blue-700">Last Name</Label>
                <Input
                  {...register("lastName")}
                  placeholder="Enter employee last name"
                />
                {errors.lastName && (
                  <p className="text-xs text-blue-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-blue-700">National Id</Label>
                <Input
                  {...register("nationalId")}
                  placeholder="123xxxxxxxxxx"
                />
                {errors.nationalId && (
                  <p className="text-xs text-blue-600">
                    {errors.nationalId.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-blue-700">email</Label>
                <Input {...register("email")} placeholder="xxxx@email.com" />
                {errors.email && (
                  <p className="text-xs text-blue-600">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-blue-700"> Address</Label>
              <Input {...register("address")} placeholder="Bole, Addis Ababa" />
              {errors.address && (
                <p className="text-xs text-blue-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div>
              <Label className="text-blue-700">Phone</Label>
              <Input {...register("phone")} placeholder="0912345678" />
              {errors.phone && (
                <p className="text-xs text-blue-600">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label className="text-blue-700">Role</Label>
              <select
                {...register("role")}
                className="w-full border rounded-md p-2 text-blue-700 focus:ring focus:ring-blue-300"
                defaultValue=""
              >
                <option value="" disabled>
                  Select Role
                </option>
                <option value="ADMIN">Admin</option>
                <option value="RELATIONSHIP_MANAGER">
                  Relationship Manager
                </option>
                <option value="CREDIT_ANALYST">Credit Analyst</option>
                <option value="SUPERVISOR">Supervisor</option>
                <option value="COMMITTE_MEMBER">Committee Member</option>
              </select>
              {errors.role && (
                <p className="text-xs text-blue-600">{errors.role.message}</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                Default password will be automatically generated as:{" "}
                <strong>yourlastname@12341234</strong>
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-transform"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Employee...
                </>
              ) : (
                "Register Employee"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
