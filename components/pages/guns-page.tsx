"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { EntryModal } from "@/components/entry-modal"

interface GunsPageProps {
  searchQuery: string
}

export function GunsPage({ searchQuery }: GunsPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [guns, setGuns] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGuns = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from("guns").select("*").order("name")

      if (error) {
        setError(error.message)
      } else {
        setGuns(data || [])
      }
    }

    fetchGuns()
  }, [])

  const handleSave = (data: Record<string, string>) => {
    console.log("[v0] New gun entry:", data)
    // TODO: Add logic to save the new gun to your data source
    setIsModalOpen(false)
  }

  const gunFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "type", label: "Type", type: "text" as const, placeholder: "e.g., Pistol, Rifle, Shotgun" },
    { name: "quality", label: "Quality", type: "text" as const, placeholder: "e.g., S, A, B, C, D" },
    { name: "description", label: "Description", type: "textarea" as const },
    { name: "damage", label: "Damage", type: "text" as const },
    { name: "fireRate", label: "Fire Rate", type: "text" as const },
    { name: "magazineSize", label: "Magazine Size", type: "text" as const },
    { name: "specialEffect", label: "Special Effect", type: "textarea" as const },
  ]

  const filteredGuns = guns.filter((gun) => gun.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Guns</h2>
          <p className="text-muted-foreground">
            Complete arsenal of all guns in Enter the Gungeon. Replace this placeholder data with actual wiki
            information.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Entry
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuns.map((gun) => (
          <Card key={gun.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-xl">{gun.name}</CardTitle>
                {gun.quality && <Badge variant={gun.quality === "S" ? "default" : "secondary"}>{gun.quality}</Badge>}
              </div>
              {gun.type && <CardDescription>{gun.type}</CardDescription>}
            </CardHeader>
            <CardContent>
              {gun.description && <p className="text-sm text-muted-foreground mb-4">{gun.description}</p>}
              <div className="space-y-2 text-sm">
                {gun.damage && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Damage:</span>
                    <span className="font-mono">{gun.damage}</span>
                  </div>
                )}
                {gun.fire_rate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fire Rate:</span>
                    <span className="font-mono">{gun.fire_rate}</span>
                  </div>
                )}
                {gun.magazine_size && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Magazine:</span>
                    <span className="font-mono">{gun.magazine_size}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuns.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No guns found matching your search.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error loading guns: {error}</p>
        </div>
      )}

      <EntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Add New Gun"
        fields={gunFields}
      />
    </div>
  )
}
