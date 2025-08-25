"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Clock, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  Shield,
  UserCheck,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
  };
}

interface DashboardStats {
  totalClients?: number;
  totalUsers?: number;
  activeLoans: number;
  pendingApplications: number;
  overduePayments: number;
  approvalRate?: number;
  clientSatisfaction?: number;
  newClientsThisMonth?: number;
}

interface Application {
  id: string;
  client: string;
  amount: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

interface Task {
  id: string;
  task: string;
  time: string;
  priority: "high" | "medium" | "low";
}

export default function Dashboard() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<Task[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await authClient.getSession();
        
        if (error || !data) {
          router.push("/login");
          return;
        }

        setSession(data as UserSession);
      } catch (error) {
        console.error("Session error:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    getSession();
  }, [router]);

  useEffect(() => {
    if (session?.user?.role) {
      fetchDashboardData();
    }
  }, [session]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      setStatsLoading(true);
      const statsResponse = await fetch('/api/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // Fetch recent applications
      setApplicationsLoading(true);
      const appsResponse = await fetch('/api/dashboard/applications');
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setRecentApplications(appsData);
      }
      
      // Fetch upcoming tasks
      setTasksLoading(true);
      const tasksResponse = await fetch('/api/dashboard/tasks');
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        setUpcomingTasks(tasksData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setStatsLoading(false);
      setApplicationsLoading(false);
      setTasksLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800"
    };
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800"
    };
    return variants[priority as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      ADMIN: "bg-red-100 text-red-800",
      RELATIONSHIP_MANAGER: "bg-blue-100 text-blue-800",
      CREDIT_ANALYST: "bg-green-100 text-green-800",
      SUPERVISOR: "bg-purple-100 text-purple-800",
      COMMITTE_MEMBER: "bg-orange-100 text-orange-800"
    };
    return variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "RELATIONSHIP_MANAGER") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <title>Dashboard | Loan Origination System</title>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getRoleBadge(userRole)}>
              {userRole.replace(/_/g, ' ')}
            </Badge>
            <p className="text-gray-600">Here's your overview for today</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Link href={userRole === "RELATIONSHIP_MANAGER" ? "/dashboard/fetch" : "/clients/create"}>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin-specific features */}
      {userRole === "ADMIN" && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Tools</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button variant="outline" size="sm" className="w-full mb-2">
                  User Management
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button variant="outline" size="sm" className="w-full">
                  System Settings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/register-employee">
                <Button variant="outline" size="sm" className="w-full mb-2">
                  Register Employee
                </Button>
              </Link>
              <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm" className="w-full">
                  View Audit Log
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <Link href="/admin/reports">
                <Button variant="outline" size="sm" className="w-full mb-2">
                  Generate Reports
                </Button>
              </Link>
              <Link href="/admin/analytics">
                <Button variant="outline" size="sm" className="w-full">
                  System Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={`Search ${userRole === "ADMIN" ? "users" : "clients"}, applications, or loans...`}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {userRole === "ADMIN" ? "Total Users" : "Total Clients"}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {userRole === "ADMIN" ? stats?.totalUsers || 0 : stats?.totalClients || 0}
                </div>
                <p className="text-xs text-gray-600">Loading data...</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.activeLoans || 0}</div>
                <p className="text-xs text-gray-600">Loading data...</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.pendingApplications || 0}</div>
                <p className="text-xs text-gray-600">Needs review</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.overduePayments || 0}</div>
                <p className="text-xs text-gray-600">Requires follow-up</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <Link href={userRole === "ADMIN" ? "/admin/users" : "/clients"}>
            <TabsTrigger value={userRole === "ADMIN" ? "users" : "clients"}>
              {userRole === "ADMIN" ? "Users" : "Clients"}
            </TabsTrigger>
          </Link>
          <Link href="/applications">
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </Link>
          <Link href="/loans">
            <TabsTrigger value="loans">Loans</TabsTrigger>
          </Link>
          <Link href="/reports">
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </Link>
          {userRole === "ADMIN" && (
            <Link href="/admin">
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </Link>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Applications</span>
                  <Link href="/applications">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : recentApplications.length > 0 ? (
                  <div className="space-y-4">
                    {recentApplications.map((app) => (
                      <Link key={app.id} href={`/applications/${app.id}`}>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div>
                            <p className="font-medium">{app.client}</p>
                            <p className="text-sm text-gray-600">{app.amount}</p>
                            <p className="text-xs text-gray-500">{app.date}</p>
                          </div>
                          <Badge className={getStatusBadge(app.status)}>
                            {app.status.toUpperCase()}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent applications found
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Upcoming Tasks</span>
                  <Link href="/tasks">
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTasks.map((task) => (
                      <Link key={task.id} href={`/tasks/${task.id}`}>
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <div>
                            <p className="font-medium">{task.task}</p>
                            <p className="text-sm text-gray-600">{task.time}</p>
                          </div>
                          <Badge className={getPriorityBadge(task.priority)}>
                            {task.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No upcoming tasks
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/reports/approval-rate">
                  <div className="text-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.approvalRate || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Approval Rate</p>
                  </div>
                </Link>
                <Link href="/reports/satisfaction">
                  <div className="text-center p-4 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition-colors">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.clientSatisfaction || 0}%
                    </div>
                    <p className="text-sm text-gray-600">Client Satisfaction</p>
                  </div>
                </Link>
                <Link href="/reports/new-clients">
                  <div className="text-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition-colors">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.newClientsThisMonth || 0}
                    </div>
                    <p className="text-sm text-gray-600">
                      {userRole === "ADMIN" ? "New Users" : "New Clients"} This Month
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions Footer */}
      <div className="fixed bottom-6 right-6 flex gap-2">
        <Link href={userRole === "ADMIN" ? "/admin/users/create" : "/clients/create"}>
          <Button className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
        <Link href="/applications/create">
          <Button variant="outline" className="rounded-full w-12 h-12 p-0">
            <FileText className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  );
}