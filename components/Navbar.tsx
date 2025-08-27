import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Button } from "./ui/button";
import { headers } from "next/headers";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
];

// Role display names mapping
const ROLE_DISPLAY_NAMES = {
  RELATIONSHIP_MANAGER: "Relationship Manager",
  CREDIT_ANALYST: "Credit Analyst",
  SUPERVISOR: "Supervisor",
  COMMITTE_MEMBER: "Committee Member"
};

export default async function Navbar() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/"); // redirect if not logged in
  }

  const userName = session.user.name || "User";
  const userRole = session.user.role;


  return (
    <nav className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 sticky top-0 z-50 shadow-lg border-b border-blue-600 p-7">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full p-1 transition-all duration-300 group-hover:scale-105">
                <img
                  src="/dashen logo.png"
                  alt="Dashen Bank Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden md:flex flex-col">
                <span className="text-white font-bold text-lg">Dashen Bank</span>
                <span className="text-blue-200 text-xs">{userRole}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Role-specific links */}
            {userRole === "RELATIONSHIP_MANAGER" && (
              <>
                <Link
                  href="/dashboard/fetch"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Start
                </Link>
                <Link
                  href="/dashboard/manage"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Manage
                </Link>
              </>
            )}
            
            {userRole === "CREDIT_ANALYST" && (
              <>
                <Link
                  href="/dashboard/credit"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Available
                </Link>
                <Link
                  href="/dashboard/credit/analysis"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  In Progress
                </Link>
                <Link
                  href="/dashboard/credit/revised"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Revised
                </Link>
                   <Link
                  href="/dashboard/credit/reversed"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Reversed
                </Link>
                 <Link
                  href="/dashboard/credit/final"
                  className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
                >
                  Edit Analysis
                </Link>
              </>
            )}

            {userRole === "SUPERVISOR" && (
              <>
              <Link
                href="/dashboard/supervisor-review"
                className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
              >
                Avaliable
              </Link><Link
                href="/dashboard/supervisor-review/supervisor"
                className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
              >
                  In Progress
                </Link>
                
                </>
              
              
            )}
                    
            {userRole === "COMMITTE_MEMBER" && (
              <Link
                href="/dashboard/committe"
                className="text-white font-medium hover:bg-blue-700/60 px-4 py-2 rounded-md transition-all duration-200"
              >
                Avaliable
              </Link>
            )}
          </div>

          {/* User profile */}
          <div className="flex items-center">
            <Link 
              href="/dashboard/profile"
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 pl-2 pr-4 py-2 rounded-full transition-all duration-200 group"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-semibold rounded-full group-hover:bg-blue-500">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium text-sm hidden md:block">
                {userName}
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <div className="flex overflow-x-auto space-x-2 scrollbar-hide pt-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
            
            {/* Role-specific mobile links */}
            {userRole === "RELATIONSHIP_MANAGER" && (
              <>
                <Link
                  href="/dashboard/fetch"
                  className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                  Start
                </Link>
                <Link
                  href="/dashboard/manage"
                  className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                  Manage
                </Link>
              </>
            )}
            
            {userRole === "CREDIT_ANALYST" && (
              <>
                <Link
                  href="/dashboard/credit"
                  className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                  Available
                </Link>
                <Link
                  href="/dashboard/credit/analysis"
                  className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                  In Progress
                </Link>
                <Link
                  href="/dashboard/credit/revised"
                  className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
                >
                  Revised
                </Link>
              </>
            )}

            {userRole === "SUPERVISOR" && (
              <Link
                href="/dashboard/supervisor"
                className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
              >
                Review
              </Link>
            )}
                    
            {userRole === "COMMITTE_MEMBER" && (
              <Link
                href="/dashboard/committe"
                className="flex-shrink-0 text-white text-sm font-medium hover:bg-blue-700/60 px-3 py-1.5 rounded-md transition-colors duration-200"
              >
                Committee
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}