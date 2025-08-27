// app/dashboard/profile/page.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/"); // not logged in
  }

  const user = session.user;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 border">
        <div className="flex items-center gap-4">
          <img
            src="/profile.png"
            alt="Profile"
            className="w-20 h-20 rounded-full border object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-700">
              {user.role}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t my-6"></div>

        <div className="flex justify-end gap-3">
          <Button className="bg-blue-700 hover:bg-blue-800 text-white">
            Edit Profile
          </Button>

          <form
            action={async () => {
              "use server";
              await auth.api.signOut({ headers: await headers() });
              redirect("/");
            }}
          >
            <Button className="bg-gray-700 hover:bg-black text-white">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
