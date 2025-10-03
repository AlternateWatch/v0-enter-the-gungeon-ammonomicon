"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface BossesPageProps {
  searchQuery: string
}

const placeholderBosses = [
  {
    id: 1,
    name: "Example Boss 1",
    floor: "Chamber 1",
    difficulty: "Easy",
    description: "Add your boss description here from the wiki",
    health: "???",
    phases: "???",
    attacks: "Add attack patterns here",
  },
  {
    id: 2,
    name: "Example Boss 2",
    floor: "Chamber 3",
    difficulty: "Hard",
    description: "Add your boss description here from the wiki",
    health: "???",
    phases: "???",
    attacks: "Add attack patterns here",
  },
]

export function BossesPage({ searchQuery }: BossesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredBosses = placeholderBosses.filter((boss) => boss.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New boss entry:", data)
    setIsModalOpen(false)
  }

  const bossFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "floor", label: "Floor", type: "text" as const, placeholder: "e.g., Chamber 1" },
    { name: "difficulty", label: "Difficulty", type: "text" as const, placeholder: "e.g., Easy, Medium, Hard" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "health", label: "Health", type: "text" as const },
    { name: "phases", label: "Phases", type: "text" as const },
    { name: "attacks", label: "Attack Patterns", type: "textarea" as const },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Bosses</h2>
          <p className="text-muted-foreground">
            Complete guide to all bosses in Enter the Gungeon. Replace this placeholder data with actual wiki
            information.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBosses.map((boss) => (
          <Card key={boss.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{boss.name}</CardTitle>
                <Badge variant={boss.difficulty === "Hard" ? "destructive" : "secondary"}>{boss.difficulty}</Badge>
              </div>
              <CardDescription>{boss.floor}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{boss.description}</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health:</span>
                  <span className="font-mono">{boss.health}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phases:</span>
                  <span className="font-mono">{boss.phases}</span>
                </div>
                <div className="pt-2">
                  <span className="text-muted-foreground block mb-1">Attack Patterns:</span>
                  <p className="text-sm">{boss.attacks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBosses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No bosses found matching your search.</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New Boss"
        fields={bossFields}
      />
    </div>
  )
}
