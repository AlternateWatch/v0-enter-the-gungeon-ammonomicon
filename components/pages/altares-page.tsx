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

interface Altar {
  id: number
  name: string
  quote?: string
  location?: string
  effect?: string
  cost?: string
  description?: string
  image_url?: string
  notes?: string
}

export function AltaresPage() {
  const [altares, setAltares] = useState<Altar[]>([])
  const [selectedAltar, setSelectedAltar] = useState<Altar | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingAltar, setEditingAltar] = useState<Partial<Altar> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchAltares()
  }, [])

  const fetchAltares = async () => {
    const { data, error } = await supabase.from("altares").select("*").order("name")

    if (error) {
      console.error("Error fetching altares:", error)
    } else {
      setAltares(data || [])
    }
  }

  const handleAddAltar = () => {
    setEditingAltar({
      name: "",
      quote: "",
      location: "",
      effect: "",
      cost: "",
      description: "",
      image_url: "",
      notes: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setIsAddDialogOpen(true)
  }

  const handleEditAltar = (altar: Altar) => {
    setEditingAltar({ ...altar })
    setImageFile(null)
    setImagePreview(altar.image_url || null)
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
    if (!editingAltar?.name) {
      alert("El nombre es obligatorio")
      return
    }

    try {
      let imageUrl = editingAltar.image_url || ""

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          throw new Error(uploadResult.error || "Error uploading image")
        }
      }

      const altarData = {
        ...editingAltar,
        image_url: imageUrl,
      }

      if (editingAltar.id) {
        const { error } = await supabase.from("altares").update(altarData).eq("id", editingAltar.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("altares").insert([altarData])

        if (error) throw error
      }

      setIsAddDialogOpen(false)
      setEditingAltar(null)
      setImageFile(null)
      setImagePreview(null)
      fetchAltares()
    } catch (error: any) {
      console.error("Error saving altar:", error)
      alert(`Error saving altar: ${error.message}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este altar?")) return

    try {
      const { error } = await supabase.from("altares").delete().eq("id", id)

      if (error) throw error
      fetchAltares()
    } catch (error: any) {
      console.error("Error deleting altar:", error)
      alert(`Error deleting altar: ${error.message}`)
    }
  }

  const hasIncompleteFields = (altar: Altar) => {
    const fieldsToCheck = [altar.location, altar.effect, altar.cost, altar.description, altar.image_url]
    return fieldsToCheck.some((field) => !field || field.trim() === "")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Altares</h2>
          <p className="text-muted-foreground">Altares y santuarios del Gungeon</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddAltar} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Altar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAltar?.id ? "Editar Altar" : "Añadir Altar"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={editingAltar?.name || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, name: e.target.value })}
                  placeholder="Nombre del altar"
                />
              </div>

              <div>
                <Label htmlFor="quote">Frase Emblemática</Label>
                <Input
                  id="quote"
                  value={editingAltar?.quote || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, quote: e.target.value })}
                  placeholder="Frase característica"
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingAltar?.location || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, location: e.target.value })}
                  placeholder="Dónde se encuentra"
                />
              </div>

              <div>
                <Label htmlFor="effect">Efecto</Label>
                <Input
                  id="effect"
                  value={editingAltar?.effect || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, effect: e.target.value })}
                  placeholder="Qué hace el altar"
                />
              </div>

              <div>
                <Label htmlFor="cost">Coste</Label>
                <Input
                  id="cost"
                  value={editingAltar?.cost || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, cost: e.target.value })}
                  placeholder="Coste de uso"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingAltar?.description || ""}
                  onChange={(e) =>
                    setEditingAltar({
                      ...editingAltar,
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
                  value={editingAltar?.notes || ""}
                  onChange={(e) => setEditingAltar({ ...editingAltar, notes: e.target.value })}
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingAltar(null)
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
        {altares.map((altar) => (
          <div
            key={altar.id}
            className="group relative bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedAltar(altar)
              setIsDetailDialogOpen(true)
            }}
          >
            {hasIncompleteFields(altar) && (
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
                  handleEditAltar(altar)
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
                  handleDelete(altar.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-40 flex items-center justify-center bg-muted/30 rounded">
                {altar.image_url ? (
                  <img
                    src={altar.image_url || "/placeholder.svg"}
                    alt={altar.name}
                    className="pixel-art"
                    style={{ width: "auto", height: "160px" }}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">Sin imagen</div>
                )}
              </div>
              <h3 className="font-semibold text-center">{altar.name}</h3>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedAltar?.name}</DialogTitle>
            {selectedAltar?.quote && (
              <DialogDescription className="italic text-base">"{selectedAltar.quote}"</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {selectedAltar?.image_url && (
              <div className="flex justify-center bg-muted/30 rounded-lg p-6">
                <img
                  src={selectedAltar.image_url || "/placeholder.svg"}
                  alt={selectedAltar.name}
                  className="pixel-art"
                  style={{ width: "auto", height: "320px" }}
                />
              </div>
            )}
            {selectedAltar?.location && (
              <div>
                <h4 className="font-semibold mb-1">Ubicación</h4>
                <p className="text-muted-foreground">{selectedAltar.location}</p>
              </div>
            )}
            {selectedAltar?.effect && (
              <div>
                <h4 className="font-semibold mb-1">Efecto</h4>
                <p className="text-muted-foreground">{selectedAltar.effect}</p>
              </div>
            )}
            {selectedAltar?.cost && (
              <div>
                <h4 className="font-semibold mb-1">Coste</h4>
                <p className="text-muted-foreground">{selectedAltar.cost}</p>
              </div>
            )}
            {selectedAltar?.description && (
              <div>
                <h4 className="font-semibold mb-1">Descripción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedAltar.description}</p>
              </div>
            )}
            {selectedAltar?.notes && (
              <div>
                <h4 className="font-semibold mb-1">Notas</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedAltar.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
