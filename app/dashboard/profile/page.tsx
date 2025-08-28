// app/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/"); // not logged in
  }

  const user = session.user;

  // Function to capitalize the first letter of a string
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl transition-all duration-300 ease-in-out bg-white dark:bg-gray-900 border-0">
        {/* Header Section */}
        <CardHeader className="flex flex-col items-center p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-t-xl">
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            {user.name ? user.name.charAt(0) : user.email?.charAt(0) || 'U'}
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {user.name || 'User Profile'}
          </CardTitle>
          <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </CardHeader>

        {/* User Details Section */}
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Role</span>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                {capitalize(user.role)}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
              <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                Active
              </div>
            </div>
          </div>

          <Separator className="bg-gray-200 dark:bg-gray-700" />
          
          {/* Action Buttons Section */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
              className="flex-1 w-full text-gray-900 dark:text-white dark:hover:bg-gray-700"
              variant="outline"
            >
              Edit Profile
            </Button>
            
            <form className="flex-1 w-full" action={async () => {
              "use server";
              await auth.api.signOut({ headers: await headers() });
              redirect("/");
            }}>
              <Button
                className="w-full bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
                variant="default"
              >
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}