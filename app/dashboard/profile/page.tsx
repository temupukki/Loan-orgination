// app/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Shield,
  LogOut,
  Edit3,
  CheckCircle,
  Calendar,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/"); // not logged in
  }

  const user = session.user;

  // Function to capitalize the first letter of a string
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Mock user metadata (replace with actual data from your auth system)
  const userMetadata = {
    memberSince: "2023",
    lastLogin: "2 hours ago",
    accountStatus: "verified",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <Card className="lg:col-span-2 shadow-xl border-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
              <CardHeader className="p-0">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold text-white backdrop-blur-sm">
                      {user.name
                        ? user.name.charAt(0)
                        : user.email?.charAt(0) || "U"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 border-4 border-white dark:border-gray-900">
                      <UserCheck className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold text-white">
                      {user.name || "User Profile"}
                    </CardTitle>
                    <CardDescription className="text-blue-100 mt-1">
                      Welcome back to your account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>

            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">Full Name</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.name || "Not provided"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Email Address</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Account Role</span>
                  </div>
                  <Badge className="px-3 py-1 text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-200 dark:hover:bg-indigo-800">
                    {capitalize(user.role)}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="text-sm font-medium">Status</span>
                  </div>
                  <Badge className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800">
                    {userMetadata.accountStatus === "verified"
                      ? "Verified"
                      : "Active"}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6 bg-gray-200 dark:bg-gray-700" />

              <div className="flex flex-col sm:flex-row gap-4">
            

                <form
                  className="flex-1"
                  action={async () => {
                    "use server";
                    await auth.api.signOut({ headers: await headers() });
                    redirect("/");
                  }}
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Account Status Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Account Status
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Your account is fully verified and in good standing.
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
              </CardContent>
            </Card>

      

            {/* Security Card */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Security
                  </h3>
                </div>
              <Link href="/dashboard/profile/change">
                <Button variant="outline" className="w-full">
                  Change Password
                </Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
