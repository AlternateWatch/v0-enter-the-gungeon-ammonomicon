"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface EnemiesPageProps {
  searchQuery: string
}

// Placeholder data structure - user will replace with actual wiki data
const placeholderEnemies = [
  {
    id: 1,
    name: "Example Enemy 1",
    type: "Basic",
    floor: "Chamber 1",
    description: "Add your enemy description here from the wiki",
    health: "???",
    behavior: "Add behavior patterns here",
  },
  {
    id: 2,
    name: "Example Enemy 2",
    type: "Elite",
    floor: "Chamber 2",
    description: "Add your enemy description here from the wiki",
    health: "???",
    behavior: "Add behavior patterns here",
  },
  {
    id: 3,
    name: "Example Enemy 3",
    type: "Basic",
    floor: "Chamber 1",
    description: "Add your enemy description here from the wiki",
    health: "???",
    behavior: "Add behavior patterns here",
  },
]

export function EnemiesPage({ searchQuery }: EnemiesPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredEnemies = placeholderEnemies.filter((enemy) =>
    enemy.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New enemy entry:", data)
    // TODO: Add logic to save the new enemy to your data source
    setIsModalOpen(false)
  }

  const enemyFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "type", label: "Type", type: "text" as const, placeholder: "e.g., Basic, Elite" },
    { name: "floor", label: "Floor", type: "text" as const, placeholder: "e.g., Chamber 1" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "health", label: "Health", type: "text" as const },
    { name: "behavior", label: "Behavior", type: "textarea" as const },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Enemies</h2>
          <p className="text-muted-foreground">
            Complete bestiary of all enemies in Enter the Gungeon. Replace this placeholder data with actual wiki
            information.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEnemies.map((enemy) => (
          <Card key={enemy.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{enemy.name}</CardTitle>
                <Badge variant="outline">{enemy.type}</Badge>
              </div>
              <CardDescription>{enemy.floor}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{enemy.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Health:</span>
                  <span className="font-mono">{enemy.health}</span>
                </div>
                <div className="mt-3">
                  <span className="text-muted-foreground block mb-1">Behavior:</span>
                  <p className="text-sm">{enemy.behavior}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEnemies.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No enemies found matching your search.</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New Enemy"
        fields={enemyFields}
      />
    </div>
  )
}
