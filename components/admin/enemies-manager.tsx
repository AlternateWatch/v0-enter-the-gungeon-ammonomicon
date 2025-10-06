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

interface Enemy {
  id: string
  name: string
  location: string | null
  health: string | null
  damage: string | null
  behavior: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function EnemiesManager() {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEnemy, setEditingEnemy] = useState<Enemy | null>(null)
  const [formData, setFormData] = useState<Partial<Enemy>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchEnemies()
  }, [])

  const fetchEnemies = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("enemies").select("*").order("name")

    if (!error && data) {
      setEnemies(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingEnemy) {
      const { error } = await supabase.from("enemies").update(formData).eq("id", editingEnemy.id)

      if (!error) {
        fetchEnemies()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("enemies").insert([formData])

      if (!error) {
        fetchEnemies()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this enemy?")) {
      const { error } = await supabase.from("enemies").delete().eq("id", id)

      if (!error) {
        fetchEnemies()
      }
    }
  }

  const handleEdit = (enemy: Enemy) => {
    setEditingEnemy(enemy)
    setFormData(enemy)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingEnemy(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Enemies Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Enemy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingEnemy ? "Edit Enemy" : "Add New Enemy"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Introduce los detalles del enemigo debajo</DialogDescription>
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
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="damage" className="text-[#d4af37]">
                    Damage
                  </Label>
                  <Input
                    id="damage"
                    value={formData.damage || ""}
                    onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="behavior" className="text-[#d4af37]">
                  Behavior
                </Label>
                <Textarea
                  id="behavior"
                  value={formData.behavior || ""}
                  onChange={(e) => setFormData({ ...formData, behavior: e.target.value })}
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
                  {editingEnemy ? "Update" : "Create"}
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
          {enemies.map((enemy) => (
            <Card key={enemy.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-[#d4af37]">{enemy.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(enemy)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(enemy.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {enemy.location && (
                    <p>
                      <strong>Location:</strong> {enemy.location}
                    </p>
                  )}
                  {enemy.health && (
                    <p>
                      <strong>Health:</strong> {enemy.health}
                    </p>
                  )}
                  {enemy.description && (
                    <p>
                      <strong>Description:</strong> {enemy.description}
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
