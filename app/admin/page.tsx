import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user is an admin
  const { data: adminData } = await supabase.from("admins").select("*").eq("user_id", data.user.id).single()

  if (!adminData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a1410]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#d4af37] mb-4">Access Denied</h1>
          <p className="text-[#c9b896]">You do not have admin privileges.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard user={data.user} />
}
