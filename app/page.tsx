import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const HomePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) return redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 p-8 text-gray-800">
      <div className="flex flex-col items-center space-y-8 text-center">
        {/* Logo at the top */}
        <Image
          src="/dashen logo.png"
          alt="Dashen Bank Logo"
          width={120}
          height={120}
          className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
        />

        {/* Title and description */}
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-gray-900">
          Loan Origination System
        </h1>
        <p className="max-w-prose text-lg text-gray-600 md:text-xl">
          Welcome to the new system. Your gateway to efficient credit application management.
        </p>

        {/* The prominent "Get Started" button in the middle */}
        <div className="mt-8">
          <Link href="/sign-in">
            <Button
              className="group relative inline-flex h-16 items-center justify-center overflow-hidden rounded-[50px] bg-gradient-to-r from-blue-700 to-indigo-800 px-10 text-lg font-bold text-white shadow-lg transition-all duration-500 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300"
              size="lg"
            >
              <span className="relative z-10 transition-transform duration-500 group-hover:-translate-y-1">
                Get Started
              </span>
              <span className="absolute inset-0 z-0 bg-gradient-to-l from-indigo-800 to-blue-700 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subtle footer text */}
      <div className="mt-12 text-sm text-gray-500">
        <p>Your journey to streamlined credit management starts here.</p>
      </div>
    </div>
  );
};

export default HomePage;