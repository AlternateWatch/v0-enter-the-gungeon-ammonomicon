"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Boss {
  id: string
  name: string
  location: string | null
  health: string | null
  phases: number | null
  attacks: string | null
  description: string | null
  strategy: string | null
  notes: string | null
  image_url: string | null
}

export function BossesManager() {
  const [bosses, setBosses] = useState<Boss[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBoss, setEditingBoss] = useState<Boss | null>(null)
  const [formData, setFormData] = useState<Partial<Boss>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchBosses()
  }, [])

  const fetchBosses = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("bosses").select("*").order("name")

    if (!error && data) {
      setBosses(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingBoss) {
      const { error } = await supabase.from("bosses").update(formData).eq("id", editingBoss.id)

      if (!error) {
        fetchBosses()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("bosses").insert([formData])

      if (!error) {
        fetchBosses()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this boss?")) {
      const { error } = await supabase.from("bosses").delete().eq("id", id)

      if (!error) {
        fetchBosses()
      }
    }
  }

  const handleEdit = (boss: Boss) => {
    setEditingBoss(boss)
    setFormData(boss)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingBoss(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Bosses Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Boss
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingBoss ? "Edit Boss" : "Add New Boss"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Introduce los detalles del boss abajo</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-[#d4af37]">
                  Name *
                </Label>
                <Input
                  id="name"
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location" className="text-[#d4af37]">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
                <div>
                  <Label htmlFor="health" className="text-[#d4af37]">
                    Health
                  </Label>
                  <Input
                    id="health"
                    value={formData.health || ""}
                    onChange={(e) => setFormData({ ...formData, health: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phases" className="text-[#d4af37]">
                  Phases
                </Label>
                <Input
                  id="phases"
                  type="number"
                  value={formData.phases || ""}
                  onChange={(e) => setFormData({ ...formData, phases: Number.parseInt(e.target.value) || null })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div>
                <Label htmlFor="attacks" className="text-[#d4af37]">
                  Attacks
                </Label>
                <Textarea
                  id="attacks"
                  value={formData.attacks || ""}
                  onChange={(e) => setFormData({ ...formData, attacks: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-[#d4af37]">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div>
                <Label htmlFor="strategy" className="text-[#d4af37]">
                  Strategy
                </Label>
                <Textarea
                  id="strategy"
                  value={formData.strategy || ""}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
                  {editingBoss ? "Update" : "Create"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#8b6f47] text-[#d4af37] bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p className="text-[#c9b896]">Cargando...</p>
      ) : (
        <div className="grid gap-4">
          {bosses.map((boss) => (
            <Card key={boss.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-[#d4af37]">{boss.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(boss)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(boss.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {boss.location && (
                    <p>
                      <strong>Location:</strong> {boss.location}
                    </p>
                  )}
                  {boss.health && (
                    <p>
                      <strong>Health:</strong> {boss.health}
                    </p>
                  )}
                  {boss.description && (
                    <p>
                      <strong>Description:</strong> {boss.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
