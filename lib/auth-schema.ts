import { z } from "zod";

export const RegisterEmployeeSchema = z.object({
  firstName: z
    .string()
    .min(3, { message: "name must be at least 3 characters" })
    .max(100, { message: "name too long" }),
  middleName: z.string().optional(),
  lastName: z
    .string()
    .min(3, { message: "name must be at least 3 characters" })
    .max(100, { message: "name too long" }),

  nationalId: z
    .string()
    .min(5, { message: "TIN must be at least 5 characters" })
    .max(20, { message: "TIN too long" }),
  address: z
    .string()
    .min(6, { message: "Address must be at least 6 characters" })
    .max(120, { message: "Address too long" }),
  email: z.string().email({ message: "Enter a valid email address" }),

  phone: z
    .string()
    .regex(/^(09|07|9|7)\d{8}$/, { message: "Enter correct phone number" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 chars" })
    .max(40, { message: "Password too long" }),
  role: z.enum(
    [
      "ADMIN",
      "RELATIONSHIP_MANAGER",
      "CREDIT_ANALYST",
      "SUPERVISOR",
      "COMMITTE_MEMBER",
    ],
    { message: "Select a valid role" }
  ),
});

export const SigninSchema = RegisterEmployeeSchema.pick({
  lastName: true,
  password: true,
});
