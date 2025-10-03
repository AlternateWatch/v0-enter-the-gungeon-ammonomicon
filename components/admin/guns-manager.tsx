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

interface Gun {
  id: string
  name: string
  type: string | null
  quality: string | null
  magazine_size: number | null
  max_ammo: number | null
  reload_time: number | null
  damage: string | null
  fire_rate: string | null
  shot_speed: string | null
  range: string | null
  force: string | null
  spread: string | null
  quote: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function GunsManager() {
  const [guns, setGuns] = useState<Gun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGun, setEditingGun] = useState<Gun | null>(null)
  const [formData, setFormData] = useState<Partial<Gun>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchGuns()
  }, [])

  const fetchGuns = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("guns").select("*").order("name")

    if (!error && data) {
      setGuns(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingGun) {
      // Update existing gun
      const { error } = await supabase.from("guns").update(formData).eq("id", editingGun.id)

      if (!error) {
        fetchGuns()
        resetForm()
      }
    } else {
      // Create new gun
      const { error } = await supabase.from("guns").insert([formData])

      if (!error) {
        fetchGuns()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gun?")) {
      const { error } = await supabase.from("guns").delete().eq("id", id)

      if (!error) {
        fetchGuns()
      }
    }
  }

  const handleEdit = (gun: Gun) => {
    setEditingGun(gun)
    setFormData(gun)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingGun(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Guns Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Gun
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingGun ? "Edit Gun" : "Add New Gun"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Fill in the gun details below</DialogDescription>
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
                  <Label htmlFor="type" className="text-[#d4af37]">
                    Type
                  </Label>
                  <Input
                    id="type"
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
                <div>
                  <Label htmlFor="quality" className="text-[#d4af37]">
                    Quality
                  </Label>
                  <Input
                    id="quality"
                    value={formData.quality || ""}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="magazine_size" className="text-[#d4af37]">
                    Magazine Size
                  </Label>
                  <Input
                    id="magazine_size"
                    type="number"
                    value={formData.magazine_size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, magazine_size: Number.parseInt(e.target.value) || null })
                    }
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
                <div>
                  <Label htmlFor="max_ammo" className="text-[#d4af37]">
                    Max Ammo
                  </Label>
                  <Input
                    id="max_ammo"
                    type="number"
                    value={formData.max_ammo || ""}
                    onChange={(e) => setFormData({ ...formData, max_ammo: Number.parseInt(e.target.value) || null })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
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
                <Label htmlFor="notes" className="text-[#d4af37]">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
                  {editingGun ? "Update" : "Create"}
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
          {guns.map((gun) => (
            <Card key={gun.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-[#d4af37]">{gun.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(gun)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(gun.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {gun.type && (
                    <p>
                      <strong>Type:</strong> {gun.type}
                    </p>
                  )}
                  {gun.quality && (
                    <p>
                      <strong>Quality:</strong> {gun.quality}
                    </p>
                  )}
                  {gun.description && (
                    <p>
                      <strong>Description:</strong> {gun.description}
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
