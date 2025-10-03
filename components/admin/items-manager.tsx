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

interface Item {
  id: string
  name: string
  type: string | null
  quality: string | null
  effect: string | null
  quote: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function ItemsManager() {
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [formData, setFormData] = useState<Partial<Item>>({})

  const supabase = createClient()

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("items").select("*").order("name")

    if (!error && data) {
      setItems(data)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingItem) {
      const { error } = await supabase.from("items").update(formData).eq("id", editingItem.id)

      if (!error) {
        fetchItems()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("items").insert([formData])

      if (!error) {
        fetchItems()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      const { error } = await supabase.from("items").delete().eq("id", id)

      if (!error) {
        fetchItems()
      }
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Items Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Fill in the item details below</DialogDescription>
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
              <div>
                <Label htmlFor="effect" className="text-[#d4af37]">
                  Effect
                </Label>
                <Textarea
                  id="effect"
                  value={formData.effect || ""}
                  onChange={(e) => setFormData({ ...formData, effect: e.target.value })}
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
                  {editingItem ? "Update" : "Create"}
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
          {items.map((item) => (
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
                  {item.type && (
                    <p>
                      <strong>Type:</strong> {item.type}
                    </p>
                  )}
                  {item.quality && (
                    <p>
                      <strong>Quality:</strong> {item.quality}
                    </p>
                  )}
                  {item.effect && (
                    <p>
                      <strong>Effect:</strong> {item.effect}
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
