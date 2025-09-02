"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    image?: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function UsersPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempRole, setTempRole] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    async function getSession() {
      try {
        const res = await fetch("/api/session");
        
        if (!res.ok) {
          throw new Error("Failed to fetch session");
        }
        
        const sessionData = await res.json();

        if (!sessionData || !sessionData.user) {
          router.push("/");
          return;
        }

        // Check if user has admin role
        if (sessionData.user.role !== "ADMIN") {
          router.push("/dashboard");
          return;
        }

        setSession(sessionData);
        setIsAdmin(true);
      } catch (error) {
        console.error("Session error:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    getSession();
  }, [router]);

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchUsers() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    }
    
    fetchUsers();
  }, [isAdmin]);

  const handleEditClick = (user: User) => {
    setEditingId(user.id);
    setTempRole(user.role);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTempRole(e.target.value);
  };

  const handleSaveClick = async (userId: number) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: tempRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      // Update the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: tempRole } : user
      ));
      
      setEditingId(null);
      toast.success("User role updated successfully");
    } catch (err) {
      toast.error("Failed to update user");
    }
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-4 text-gray-700">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not admin (will redirect due to useEffect)
  if (!isAdmin) {
    return null;
  }

  if (loading) return (
    <div className="p-6">
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 text-lg">No users found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {editingId === user.id ? (
                        <select
                          value={tempRole}
                          onChange={handleRoleChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="RELATIONSHIP_MANAGER">Relationship Manager</option>
                          <option value="CREDIT_ANALYST">Credit Analyst</option>
                          <option value="SUPERVISOR">Supervisor</option>
                          <option value="COMMITTE_MEMBER">Committee Member</option>
                        
                          <option value="APPROVAL_COMMITTE">Approval Committe</option>
                          <option value="BANNED">Ban Employee</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'RELATIONSHIP_MANAGER' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'CREDIT_ANALYST' ? 'bg-green-100 text-green-800' :
                          user.role === 'SUPERVISOR' ? 'bg-yellow-100 text-yellow-800' :
                          user.role === 'COMMITTE_MEMBER' ? 'bg-indigo-100 text-indigo-800' :
                      
                          user.role === 'APPROVAL_COMMITTE' ? 'bg-pink-100 text-pink-800' :
                          user.role === 'BANNED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingId === user.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveClick(user.id)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelClick}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md text-sm"
                        >
                          Edit Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}