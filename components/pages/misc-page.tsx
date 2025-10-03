"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface MiscPageProps {
  searchQuery: string
}

const placeholderMisc = [
  {
    id: 1,
    name: "Example Mechanic 1",
    category: "Game Mechanic",
    description: "Add your description here from the wiki",
    details: "Add detailed information here",
  },
  {
    id: 2,
    name: "Example Secret 1",
    category: "Secret",
    description: "Add your description here from the wiki",
    details: "Add detailed information here",
  },
  {
    id: 3,
    name: "Example Shrine 1",
    category: "Shrine",
    description: "Add your description here from the wiki",
    details: "Add detailed information here",
  },
]

export function MiscPage({ searchQuery }: MiscPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredMisc = placeholderMisc.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New misc entry:", data)
    // TODO: Add logic to save the new misc item to your data source
    setIsModalOpen(false)
  }

  const miscFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "category", label: "Category", type: "text" as const, placeholder: "e.g., Game Mechanic, Secret, Shrine" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "details", label: "Details", type: "textarea" as const },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Miscellaneous</h2>
          <p className="text-muted-foreground">
            Game mechanics, secrets, shrines, and other information. Replace this placeholder data with actual wiki
            information.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMisc.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{item.name}</CardTitle>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Details:</span>
                  <p className="text-sm">{item.details}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMisc.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found matching your search.</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New Entry"
        fields={miscFields}
      />
    </div>
  )
}
