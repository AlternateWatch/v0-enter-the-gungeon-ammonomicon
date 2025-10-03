"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GunsManager } from "./guns-manager"
import { EnemiesManager } from "./enemies-manager"
import { ItemsManager } from "./items-manager"
import { BossesManager } from "./bosses-manager"
import { NpcsManager } from "./npcs-manager"
import { MiscManager } from "./misc-manager"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#d4af37] mb-2">Ammonomicon Admin</h1>
            <p className="text-[#c9b896]">Logged in as: {user.email}</p>
          </div>
          <Button
            onClick={handleLogout}
            disabled={isLoggingOut}
            variant="outline"
            className="bg-[#2a1f1a] border-[#8b6f47] text-[#d4af37] hover:bg-[#3a2f2a]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>

        <Tabs defaultValue="guns" className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-[#2a1f1a] border border-[#8b6f47]">
            <TabsTrigger value="guns" className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]">
              Guns
            </TabsTrigger>
            <TabsTrigger
              value="enemies"
              className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]"
            >
              Enemies
            </TabsTrigger>
            <TabsTrigger value="items" className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]">
              Items
            </TabsTrigger>
            <TabsTrigger value="bosses" className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]">
              Bosses
            </TabsTrigger>
            <TabsTrigger value="npcs" className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]">
              NPCs
            </TabsTrigger>
            <TabsTrigger value="misc" className="data-[state=active]:bg-[#8b6f47] data-[state=active]:text-[#1a1410]">
              Misc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guns" className="mt-6">
            <GunsManager />
          </TabsContent>
          <TabsContent value="enemies" className="mt-6">
            <EnemiesManager />
          </TabsContent>
          <TabsContent value="items" className="mt-6">
            <ItemsManager />
          </TabsContent>
          <TabsContent value="bosses" className="mt-6">
            <BossesManager />
          </TabsContent>
          <TabsContent value="npcs" className="mt-6">
            <NpcsManager />
          </TabsContent>
          <TabsContent value="misc" className="mt-6">
            <MiscManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
