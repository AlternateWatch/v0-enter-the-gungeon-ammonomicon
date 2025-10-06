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

interface Misc {
  id: string
  name: string
  category: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function MiscManager() {
  const [misc, setMisc] = useState<Misc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMisc, setEditingMisc] = useState<Misc | null>(null)
  const [formData, setFormData] = useState<Partial<Misc>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchMisc()
  }, [])

  const fetchMisc = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("miscellaneous").select("*").order("name")

    if (!error && data) {
      setMisc(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingMisc) {
      const { error } = await supabase.from("miscellaneous").update(formData).eq("id", editingMisc.id)

      if (!error) {
        fetchMisc()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("miscellaneous").insert([formData])

      if (!error) {
        fetchMisc()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from("miscellaneous").delete().eq("id", id)

      if (!error) {
        fetchMisc()
      }
    }
  }

  const handleEdit = (item: Misc) => {
    setEditingMisc(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingMisc(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Miscellaneous Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingMisc ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Introduce los detalles del ítem debajo</DialogDescription>
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
                <Label htmlFor="category" className="text-[#d4af37]">
                  Category
                </Label>
                <Input
                  id="category"
                  value={formData.category || ""}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  {editingMisc ? "Update" : "Create"}
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
          {misc.map((item) => (
            <Card key={item.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-[#d4af37]">{item.name}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {item.category && (
                    <p>
                      <strong>Category:</strong> {item.category}
                    </p>
                  )}
                  {item.description && (
                    <p>
                      <strong>Description:</strong> {item.description}
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
