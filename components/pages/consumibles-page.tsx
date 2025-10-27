"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
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
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"

interface Consumible {
  id: number
  name: string
  quote?: string
  type?: string
  effect?: string
  duration?: string
  description?: string
  image_url?: string
  notes?: string
}

export function ConsumiblesPage() {
  const [consumibles, setConsumibles] = useState<Consumible[]>([])
  const [selectedConsumible, setSelectedConsumible] = useState<Consumible | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingConsumible, setEditingConsumible] = useState<Partial<Consumible> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchConsumibles()
  }, [])

  const fetchConsumibles = async () => {
    const { data, error } = await supabase.from("consumibles").select("*").order("name")

    if (error) {
      console.error("Error fetching consumibles:", error)
    } else {
      setConsumibles(data || [])
    }
  }

  const handleAddConsumible = () => {
    setEditingConsumible({
      name: "",
      quote: "",
      type: "",
      effect: "",
      duration: "",
      description: "",
      image_url: "",
      notes: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setIsAddDialogOpen(true)
  }

  const handleEditConsumible = (consumible: Consumible) => {
    setEditingConsumible({ ...consumible })
    setImageFile(null)
    setImagePreview(consumible.image_url || null)
    setIsAddDialogOpen(true)
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

  const handleSave = async () => {
    if (!editingConsumible?.name) {
      alert("El nombre es obligatorio")
      return
    }

    try {
      let imageUrl = editingConsumible.image_url || ""

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          throw new Error(uploadResult.error || "Error uploading image")
        }
      }

      const consumibleData = {
        ...editingConsumible,
        image_url: imageUrl,
      }

      if (editingConsumible.id) {
        const { error } = await supabase.from("consumibles").update(consumibleData).eq("id", editingConsumible.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("consumibles").insert([consumibleData])

        if (error) throw error
      }

      setIsAddDialogOpen(false)
      setEditingConsumible(null)
      setImageFile(null)
      setImagePreview(null)
      fetchConsumibles()
    } catch (error: any) {
      console.error("Error saving consumible:", error)
      alert(`Error saving consumible: ${error.message}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este consumible?")) return

    try {
      const { error } = await supabase.from("consumibles").delete().eq("id", id)

      if (error) throw error
      fetchConsumibles()
    } catch (error: any) {
      console.error("Error deleting consumible:", error)
      alert(`Error deleting consumible: ${error.message}`)
    }
  }

  const hasIncompleteFields = (consumible: Consumible) => {
    const fieldsToCheck = [consumible.type, consumible.effect, consumible.description, consumible.image_url]
    return fieldsToCheck.some((field) => !field || field.trim() === "")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Consumibles</h2>
          <p className="text-muted-foreground">Objetos consumibles y recogibles</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddConsumible} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Consumible
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingConsumible?.id ? "Editar Consumible" : "Añadir Consumible"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={editingConsumible?.name || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, name: e.target.value })}
                  placeholder="Nombre del consumible"
                />
              </div>

              <div>
                <Label htmlFor="quote">Frase Emblemática</Label>
                <Input
                  id="quote"
                  value={editingConsumible?.quote || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, quote: e.target.value })}
                  placeholder="Frase característica"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={editingConsumible?.type || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, type: e.target.value })}
                  placeholder="Tipo de consumible"
                />
              </div>

              <div>
                <Label htmlFor="effect">Efecto</Label>
                <Input
                  id="effect"
                  value={editingConsumible?.effect || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, effect: e.target.value })}
                  placeholder="Efecto del consumible"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duración</Label>
                <Input
                  id="duration"
                  value={editingConsumible?.duration || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, duration: e.target.value })}
                  placeholder="Duración del efecto"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingConsumible?.description || ""}
                  onChange={(e) =>
                    setEditingConsumible({
                      ...editingConsumible,
                      description: e.target.value,
                    })
                  }
                  placeholder="Descripción detallada"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image">Imagen</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Tamaño recomendado: 256x256px PNG con fondo transparente
                </p>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
                {imagePreview && (
                  <div className="mt-4 flex justify-center bg-muted/30 rounded-lg p-4">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="pixel-art max-w-full"
                      style={{ maxHeight: "384px", width: "auto" }}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={editingConsumible?.notes || ""}
                  onChange={(e) => setEditingConsumible({ ...editingConsumible, notes: e.target.value })}
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingConsumible(null)
                    setImageFile(null)
                    setImagePreview(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSave}>Guardar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {consumibles.map((consumible) => (
          <div
            key={consumible.id}
            className="group relative bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedConsumible(consumible)
              setIsDetailDialogOpen(true)
            }}
          >
            {hasIncompleteFields(consumible) && (
              <div className="absolute top-2 left-2 z-10">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
            )}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEditConsumible(consumible)
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
                  handleDelete(consumible.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-40 flex items-center justify-center bg-muted/30 rounded">
                {consumible.image_url ? (
                  <img
                    src={consumible.image_url || "/placeholder.svg"}
                    alt={consumible.name}
                    className="pixel-art"
                    style={{ width: "auto", height: "160px" }}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">Sin imagen</div>
                )}
              </div>
              <h3 className="font-semibold text-center">{consumible.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {consumibles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay consumibles que coincidan con tu búsqueda.</p>
        </div>
      )}

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedConsumible?.name}</DialogTitle>
            {selectedConsumible?.quote && (
              <DialogDescription className="italic text-base">"{selectedConsumible.quote}"</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {selectedConsumible?.image_url && (
              <div className="flex justify-center bg-muted/30 rounded-lg p-6">
                <img
                  src={selectedConsumible.image_url || "/placeholder.svg"}
                  alt={selectedConsumible.name}
                  className="pixel-art"
                  style={{ width: "auto", height: "320px" }}
                />
              </div>
            )}
            {selectedConsumible?.type && (
              <div>
                <h4 className="font-semibold mb-1">Tipo</h4>
                <p className="text-muted-foreground">{selectedConsumible.type}</p>
              </div>
            )}
            {selectedConsumible?.effect && (
              <div>
                <h4 className="font-semibold mb-1">Efecto</h4>
                <p className="text-muted-foreground">{selectedConsumible.effect}</p>
              </div>
            )}
            {selectedConsumible?.duration && (
              <div>
                <h4 className="font-semibold mb-1">Duración</h4>
                <p className="text-muted-foreground">{selectedConsumible.duration}</p>
              </div>
            )}
            {selectedConsumible?.description && (
              <div>
                <h4 className="font-semibold mb-1">Descripción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedConsumible.description}</p>
              </div>
            )}
            {selectedConsumible?.notes && (
              <div>
                <h4 className="font-semibold mb-1">Notas</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedConsumible.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
