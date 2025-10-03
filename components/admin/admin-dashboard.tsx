"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GunsManager } from "./guns-manager"
import { EnemiesManager } from "./enemies-manager"
import { ItemsManager } from "./items-manager"
import { BossesManager } from "./bosses-manager"
import { NpcsManager } from "./npcs-manager"
import { MiscManager } from "./misc-manager"

export function AdminDashboard() {
  return (
    <div className="min-h-screen bg-[#1a1410] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#d4af37] mb-2">Ammonomicon Admin</h1>
          <p className="text-[#c9b896]">Manage your Enter the Gungeon database</p>
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
