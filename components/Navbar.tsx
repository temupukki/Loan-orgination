"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { 
  Home, 
  User, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  RotateCcw,
  Edit3,
  Users,
  BarChart3,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

// Role display names mapping
const ROLE_DISPLAY_NAMES = {
  RELATIONSHIP_MANAGER: "Relationship Manager",
  CREDIT_ANALYST: "Credit Analyst",
  SUPERVISOR: "Supervisor",
  COMMITTE_MEMBER: "Committee Member"
};

// Define the link type with optional pulse property
interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  pulse?: boolean;
}

// Navigation links configuration
const NAV_LINKS: NavLink[] = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: Home 
  },
];

// Role-specific navigation links
const ROLE_LINKS: Record<string, NavLink[]> = {
  RELATIONSHIP_MANAGER: [
    { 
      href: "/dashboard/fetch", 
      label: "Personal Accounts", 
      icon: Briefcase 
    },
       { 
      href: "/dashboard/fetchcompany", 
      label: "Company Accounts", 
      icon: Briefcase 
    },
    { 
      href: "/dashboard/manage", 
      label: "Manage", 
      icon: FileText 
    },
       { 
      href: "/dashboard/request", 
      label: "Requested Comments", 
      icon: Edit3 
    },
  ],
  CREDIT_ANALYST: [
    { 
      href: "/dashboard/credit", 
      label: "Available", 
      icon: Briefcase,
      pulse: true
    },
    { 
      href: "/dashboard/credit/analysis", 
      label: "In Progress", 
      icon: BarChart3 
    },
    { 
      href: "/dashboard/credit/revised", 
      label: "Revised", 
      icon: RotateCcw 
    },
    { 
      href: "/dashboard/credit/reversed", 
      label: "Reversed", 
      icon: RotateCcw 
    },
    { 
      href: "/dashboard/credit/final", 
      label: "Edit Analysis", 
      icon: Edit3 
    },
  ],
  SUPERVISOR: [
    { 
      href: "/dashboard/supervisor-review", 
      label: "Available", 
      icon: Briefcase,
      pulse: true
    },
    { 
      href: "/dashboard/supervisor-review/supervisor", 
      label: "In Progress", 
      icon: BarChart3 
    },
  ],
  COMMITTE_MEMBER: [
    { 
      href: "/dashboard/members", 
      label: "Available", 
      icon: Users,
      pulse: true
    },
  ],
    APPROVAL_COMMITTE: [
    { 
      href: "/dashboard/view", 
      label: "Available", 
      icon: Users,
      pulse: true
    },
       { 
      href: "/dashboard/committe", 
      label: "Final Decision", 
      icon: Briefcase,
      
    },
  ],
    ADMIN: [
    { 
      href: "/dashboard/user", 
      label: "Manage Employee", 
      icon: Users,
      
    },
     { 
      href: "/dashboard/register", 
      label: "Register Employee", 
      icon: Users,
     
    },
  ],
};

interface UserSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Function to format name (first word + first letter of last word)
function formatUserName(fullName: string): string {
  if (!fullName) return "User";
  
  const names = fullName.trim().split(/\s+/);
  if (names.length === 1) return names[0];
  
  // Get first name and first letter of last name
  const firstName = names[0];
  const lastNameInitial = names[names.length - 1].charAt(0);
  
  return `${firstName} ${lastNameInitial}.`;
}

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Handle scroll for navbar background
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
  }, [pathname]);

  if (isLoading) {
    return (
      <nav className="w-full bg-gradient-to-r from-blue-800 to-indigo-900 sticky top-0 z-50 shadow-lg border-b border-blue-600 p-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-700 rounded-full animate-pulse"></div>
              <div className="hidden md:flex flex-col gap-2">
                <div className="h-4 w-32 bg-blue-700 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-blue-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session) {
    return null;
  }

  const userName = session.user.name || "User";
  const formattedName = formatUserName(userName);
  const userRole = session.user.role;
  const userInitial = userName.charAt(0).toUpperCase();

  const roleLinks = ROLE_LINKS[userRole] || [];

  return (
    <>
      <nav className={cn(
        "w-full bg-gradient-to-r from-blue-900 to-indigo-900 sticky top-0 z-50 shadow-lg border-b border-blue-600 p-4 transition-all duration-300",
        isScrolled && "bg-gradient-to-r from-blue-900 to-indigo-950 shadow-xl"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link 
                href="/" 
                className="flex items-center gap-3 group transition-transform duration-300 hover:scale-105"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full p-1 transition-all duration-300 group-hover:rotate-12">
                  <img
                    src="/dashen logo.png"
                    alt="Dashen Bank Logo"
                    className="w-10 h-10 object-cover "
                  />
                </div>
                <div className="hidden md:flex flex-col">
                  <span className="text-white font-bold text-lg">Dashen Bank</span>
                  <span className="text-blue-200 text-xs">
                    {ROLE_DISPLAY_NAMES[userRole as keyof typeof ROLE_DISPLAY_NAMES] || userRole}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 relative">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 group/nav-item",
                      isActive 
                        ? "bg-blue-700/80 shadow-inner" 
                        : "hover:bg-blue-700/40 hover:shadow-lg"
                    )}
                    onMouseEnter={() => setHoveredTab(link.href)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <Icon 
                      size={18} 
                      className={cn(
                        "transition-all duration-300",
                        hoveredTab === link.href && "scale-110 text-blue-200"
                      )} 
                    />
                    <span className="relative">
                      {link.label}
                      <span className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300",
                        (isActive || hoveredTab === link.href) && "w-full"
                      )} />
                    </span>
                    
                    {/* Hover effect */}
                    <span className="absolute inset-0 rounded-md bg-white/10 opacity-0 group-hover/nav-item:opacity-100 transition-opacity duration-300" />
                  </Link>
                );
              })}
              
              {/* Role-specific links */}
              {roleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                const hasPulse = link.pulse;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative flex items-center gap-2 text-white font-medium px-4 py-2 rounded-md transition-all duration-300 group/nav-item",
                      isActive 
                        ? "bg-blue-700/80 shadow-inner" 
                        : "hover:bg-blue-700/40 hover:shadow-lg",
                      hasPulse && "relative"
                    )}
                    onMouseEnter={() => setHoveredTab(link.href)}
                    onMouseLeave={() => setHoveredTab(null)}
                  >
                    <div className="relative">
                      <Icon 
                        size={18} 
                        className={cn(
                          "transition-all duration-300",
                          hoveredTab === link.href && "scale-110 text-blue-200"
                        )} 
                      />
                      {hasPulse && (
                        <span className="absolute -top-1 -right-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </span>
                      )}
                    </div>
                    <span className="relative">
                      {link.label}
                      <span className={cn(
                        "absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300",
                        (isActive || hoveredTab === link.href) && "w-full"
                      )} />
                    </span>
                    
                    {/* Hover effect */}
                    <span className="absolute inset-0 rounded-md bg-white/10 opacity-0 group-hover/nav-item:opacity-100 transition-opacity duration-300" />
                    
                    {/* Sparkle effect on hover */}
                    {hoveredTab === link.href && (
                      <>
                        <Sparkles className="absolute -top-1 -left-1 h-3 w-3 text-yellow-300 opacity-70 animate-pulse" />
                        <Sparkles className="absolute -bottom-1 -right-1 h-2 w-2 text-yellow-300 opacity-70 animate-pulse delay-150" />
                      </>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* User profile and mobile menu button */}
            <div className="flex items-center gap-4">
              {/* User profile */}
              <Link 
                href="/dashboard/profile"
                className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 pl-2 pr-4 py-2 rounded-full transition-all duration-300 group hover:shadow-lg relative overflow-hidden"
                onMouseEnter={(e) => {
                  e.currentTarget.classList.add('bg-blue-600');
                  e.currentTarget.classList.add('scale-105');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.classList.remove('bg-blue-600');
                  e.currentTarget.classList.remove('scale-105');
                }}
              >
                {/* Animated background effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-semibold rounded-full group-hover:bg-blue-500 transition-all duration-300 relative z-10 group-hover:scale-110">
                  {userInitial}
                </div>
                <span className="text-white font-medium text-sm hidden lg:block relative z-10 transition-all duration-300 group-hover:text-blue-100">
                  {formattedName}
                </span>
                
                {/* Hover animation line */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 rounded-md bg-blue-700/50 text-white hover:bg-blue-600 transition-all duration-300 hover:scale-110"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-in-out",
          mobileMenuOpen ? "max-h-96 opacity-100 pt-4" : "max-h-0 opacity-0"
        )}>
          <div className="flex flex-col space-y-2 pb-4">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 text-white font-medium px-4 py-3 rounded-md transition-all duration-300 transform hover:translate-x-2",
                    isActive 
                      ? "bg-blue-700/80 shadow-inner" 
                      : "hover:bg-blue-700/40"
                  )}
                >
                  <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                  {link.label}
                </Link>
              );
            })}
            
            {/* Role-specific mobile links */}
            {roleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const hasPulse = link.pulse;
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 text-white font-medium px-4 py-3 rounded-md transition-all duration-300 transform hover:translate-x-2 group/mobile-item",
                    isActive 
                      ? "bg-blue-700/80 shadow-inner" 
                      : "hover:bg-blue-700/40"
                  )}
                >
                  <div className="relative">
                    <Icon size={20} className="transition-transform duration-300 group-hover/mobile-item:scale-110" />
                    {hasPulse && (
                      <span className="absolute -top-1 -right-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                      </span>
                    )}
                  </div>
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden animate-in fade-in duration-300"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}