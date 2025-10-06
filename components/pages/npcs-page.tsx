"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface NpcsPageProps {
  searchQuery: string
}

const placeholderNpcs = [
  {
    id: 1,
    name: "Example NPC 1",
    location: "Breach",
    description: "Add your NPC description here from the wiki",
    role: "Add NPC role/function here",
    unlockCondition: "Add unlock condition here",
  },
  {
    id: 2,
    name: "Example NPC 2",
    location: "Various Chambers",
    description: "Add your NPC description here from the wiki",
    role: "Add NPC role/function here",
    unlockCondition: "Add unlock condition here",
  },
  {
    id: 3,
    name: "Example NPC 3",
    location: "Breach",
    description: "Add your NPC description here from the wiki",
    role: "Add NPC role/function here",
    unlockCondition: "Add unlock condition here",
  },
]

export function NpcsPage({ searchQuery }: NpcsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredNpcs = placeholderNpcs.filter((npc) => npc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New NPC entry:", data)
    setIsModalOpen(false)
  }

  const npcFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "location", label: "Location", type: "text" as const, placeholder: "e.g., Breach, Various Chambers" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "role", label: "Role", type: "textarea" as const },
    { name: "unlockCondition", label: "Unlock Condition", type: "textarea" as const },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">NPCs</h2>
          <p className="text-muted-foreground">
            Guía completa de todos los NPCs en Enter The Gungeon.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNpcs.map((npc) => (
          <Card key={npc.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{npc.name}</CardTitle>
              <CardDescription>{npc.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{npc.description}</p>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Role:</span>
                  <p className="text-sm">{npc.role}</p>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-1">Unlock Condition:</span>
                  <p className="text-sm">{npc.unlockCondition}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNpcs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay NPCs que coincidan con tu búsqueda.</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New NPC"
        fields={npcFields}
      />
    </div>
  )
}
