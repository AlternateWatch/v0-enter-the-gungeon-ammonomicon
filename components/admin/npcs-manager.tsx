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

interface Npc {
  id: string
  name: string
  location: string | null
  role: string | null
  unlocked_by: string | null
  services: string | null
  dialogue: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function NpcsManager() {
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingNpc, setEditingNpc] = useState<Npc | null>(null)
  const [formData, setFormData] = useState<Partial<Npc>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchNpcs()
  }, [])

  const fetchNpcs = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("npcs").select("*").order("name")

    if (!error && data) {
      setNpcs(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingNpc) {
      const { error } = await supabase.from("npcs").update(formData).eq("id", editingNpc.id)

      if (!error) {
        fetchNpcs()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("npcs").insert([formData])

      if (!error) {
        fetchNpcs()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this NPC?")) {
      const { error } = await supabase.from("npcs").delete().eq("id", id)

      if (!error) {
        fetchNpcs()
      }
    }
  }

  const handleEdit = (npc: Npc) => {
    setEditingNpc(npc)
    setFormData(npc)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingNpc(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">NPCs Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add NPC
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingNpc ? "Edit NPC" : "Add New NPC"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Fill in the NPC details below</DialogDescription>
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
                  <Label htmlFor="role" className="text-[#d4af37]">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={formData.role || ""}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="services" className="text-[#d4af37]">
                  Services
                </Label>
                <Textarea
                  id="services"
                  value={formData.services || ""}
                  onChange={(e) => setFormData({ ...formData, services: e.target.value })}
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
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
                  {editingNpc ? "Update" : "Create"}
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
        <p className="text-[#c9b896]">Loading...</p>
      ) : (
        <div className="grid gap-4">
          {npcs.map((npc) => (
            <Card key={npc.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-[#d4af37]">{npc.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(npc)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(npc.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {npc.location && (
                    <p>
                      <strong>Location:</strong> {npc.location}
                    </p>
                  )}
                  {npc.role && (
                    <p>
                      <strong>Role:</strong> {npc.role}
                    </p>
                  )}
                  {npc.description && (
                    <p>
                      <strong>Description:</strong> {npc.description}
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
