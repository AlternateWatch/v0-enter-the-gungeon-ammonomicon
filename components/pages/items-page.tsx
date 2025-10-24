"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"

interface ItemsPageProps {
  searchQuery: string
}

interface Item {
  id: string
  name: string
  type: string | null
  quality: string | null
  effect: string | null
  quote: string | null
  description: string | null
  synergies: string | null
  notes: string | null
  image_url: string | null
}

export function ItemsPage({ searchQuery }: ItemsPageProps) {
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Partial<Item> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("items").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setItems(data || [])
    }
  }

  const handleCardClick = (item: Item) => {
    setSelectedItem(item)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingItem({
      name: "",
      type: "",
      quality: "",
      effect: "",
      quote: "",
      description: "",
      synergies: "",
      notes: "",
      image_url: null,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsEditOpen(true)
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    setImageFile(null)
    setImagePreview(item.image_url)
    setIsEditOpen(true)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (editingItem) {
      setEditingItem({ ...editingItem, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingItem?.name) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingItem.image_url

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        imageUrl = await uploadImage(formData)
      }

      const itemData = {
        ...editingItem,
        image_url: imageUrl,
      }

      if (editingItem.id) {
        const { error } = await supabase.from("items").update(itemData).eq("id", editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("items").insert([itemData])
        if (error) throw error
      }

      await fetchItems()
      setIsEditOpen(false)
      setEditingItem(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving item:", err)
      setError(err instanceof Error ? err.message : "Error saving item")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este ítem?")) return

    const supabase = createClient()
    const { error } = await supabase.from("items").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchItems()
    }
  }

  const filteredItems = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const hasIncompleteFields = (item: Item): boolean => {
    const importantFields = [item.type, item.quality, item.effect, item.description, item.synergies, item.image_url]
    return importantFields.some((field) => !field || field === "")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Ítems</h2>
          <p className="text-muted-foreground">Catálogo completo de todos los ítems de Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir Ítem
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow group relative">
            {hasIncompleteFields(item) && (
              <div className="absolute top-2 left-2 z-10" title="Faltan campos por completar">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            )}

            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(item)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(item.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(item)}>
              {item.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.name}
                    className="w-32 h-auto object-contain pixel-art"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.quality && <Badge variant={item.quality === "S" ? "default" : "secondary"}>{item.quality}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(item)}>
              {item.description && <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay ítems que coincidan con tu búsqueda.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error cargando ítems: {error}</p>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedItem?.name}</DialogTitle>
            {selectedItem?.quote && (
              <DialogDescription className="italic text-base">"{selectedItem.quote}"</DialogDescription>
            )}
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {selectedItem.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                  <img
                    src={selectedItem.image_url || "/placeholder.svg"}
                    alt={selectedItem.name}
                    className="w-80 h-auto object-contain pixel-art"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedItem.type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{selectedItem.type}</p>
                  </div>
                )}
                {selectedItem.quality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Calidad</p>
                    <p className="font-medium">{selectedItem.quality}</p>
                  </div>
                )}
              </div>

              {selectedItem.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedItem.description}</p>
                </div>
              )}

              {selectedItem.effect && (
                <div>
                  <h3 className="font-semibold mb-2">Efecto</h3>
                  <p className="text-base whitespace-pre-line">{selectedItem.effect}</p>
                </div>
              )}

              {selectedItem.synergies && (
                <div>
                  <h3 className="font-semibold mb-2">Sinergias</h3>
                  <p className="text-base whitespace-pre-line">{selectedItem.synergies}</p>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedItem.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Editar Ítem" : "Añadir Nuevo Ítem"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Imagen</Label>
              <div className="mt-2 space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-80 h-auto object-contain pixel-art"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del ítem</p>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={editingItem?.name || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={editingItem?.type || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
                  placeholder="Activo, Pasivo, etc."
                />
              </div>
              <div>
                <Label htmlFor="quality">Calidad</Label>
                <Input
                  id="quality"
                  value={editingItem?.quality || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, quality: e.target.value })}
                  placeholder="D, C, B, A, S"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quote">Frase Emblemática</Label>
              <Input
                id="quote"
                value={editingItem?.quote || ""}
                onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingItem?.description || ""}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="effect">Efecto</Label>
              <Textarea
                id="effect"
                value={editingItem?.effect || ""}
                onChange={(e) => setEditingItem({ ...editingItem, effect: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="synergies">Sinergias</Label>
              <Textarea
                id="synergies"
                value={editingItem?.synergies || ""}
                onChange={(e) => setEditingItem({ ...editingItem, synergies: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingItem?.notes || ""}
                onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingItem?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
