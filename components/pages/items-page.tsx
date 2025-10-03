"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface ItemsPageProps {
  searchQuery: string
}

const placeholderItems = [
  {
    id: 1,
    name: "Example Item 1",
    type: "Active",
    quality: "A",
    description: "Add your item description here from the wiki",
    effect: "Add item effect here",
    cooldown: "???",
  },
  {
    id: 2,
    name: "Example Item 2",
    type: "Passive",
    quality: "S",
    description: "Add your item description here from the wiki",
    effect: "Add item effect here",
    cooldown: "N/A",
  },
  {
    id: 3,
    name: "Example Item 3",
    type: "Active",
    quality: "B",
    description: "Add your item description here from the wiki",
    effect: "Add item effect here",
    cooldown: "???",
  },
]

export function ItemsPage({ searchQuery }: ItemsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredItems = placeholderItems.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New item entry:", data)
    setIsModalOpen(false)
  }

  const itemFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "type", label: "Type", type: "text" as const, placeholder: "e.g., Active, Passive" },
    { name: "quality", label: "Quality", type: "text" as const, placeholder: "e.g., S, A, B, C, D" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "effect", label: "Effect", type: "textarea" as const },
    { name: "cooldown", label: "Cooldown", type: "text" as const, placeholder: "For active items" },
  ]

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Items</h2>
          <p className="text-muted-foreground">
            Complete catalog of all items in Enter the Gungeon. Replace this placeholder data with actual wiki
            information.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{item.name}</CardTitle>
                <Badge variant={item.quality === "S" ? "default" : "secondary"}>{item.quality}</Badge>
              </div>
              <CardDescription>{item.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground block mb-1">Effect:</span>
                  <p className="text-sm">{item.effect}</p>
                </div>
                {item.type === "Active" && (
                  <div className="flex justify-between pt-2">
                    <span className="text-muted-foreground">Cooldown:</span>
                    <span className="font-mono">{item.cooldown}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No items found matching your search.</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New Item"
        fields={itemFields}
      />
    </div>
  )
}
