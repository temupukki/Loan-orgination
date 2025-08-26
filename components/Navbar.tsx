import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "./ui/button";
import { headers } from "next/headers";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  
];

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/"); // redirect if not logged in
  }

  const userName = session.user.name || "User";
  const userRole = session.user.role;

  return (
    <nav className="w-full bg-blue-700 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/dashen logo.png"
            alt="ESX Logo"
            className="w-30 h-16 object-contain rounded-full"
          />
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3 md:gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}

          
          {userRole === "RELATIONSHIP_MANAGER" && (
            <>
              <Link
                href="/dashboard/fetch"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Start
              </Link>
               <Link
                href="/dashboard/manage"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Manage
              </Link>
             
           
            </>
          )}
          
             
          {userRole === "CREDIT_ANALYST" && (
            <>
              <Link
                href="/dashboard/credit"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                loan Applications
              </Link>
              <Link
                href="/dashboard/credit/analysis"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Analysis
              </Link>
                 <Link
                href="/dashboard/revised"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
                Revised Applications
              </Link>
             
           
            </>
          )}

                 
          {userRole === "SUPERVISOR" && (
            <>
              <Link
                href="/dashboard/supervisor"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
              Review Credit Analysis
              </Link>
             
           
            </>
          )}
                    
          {userRole === "COMMITTE_MEMBER" && (
            <>
              <Link
                href="/dashboard/committe"
                className="text-white font-medium hover:bg-blue-600 px-3 py-2 rounded-lg transition-colors duration-200"
              >
              Review Loan Application
              </Link>
             
           
            </>
          )}

          <Link href="/dashboard/profile">   <span className="text-white font-semibold px-3 py-2 bg-blue-800 rounded-lg">
            {userName}
          </span></Link>
          
          {/* Sign Out */}
          <form
            action={async () => {
              "use server";
              await auth.api.signOut({ headers: await headers() });
              redirect("/");
            }}
          >
            <Button className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </nav>
  );
}
