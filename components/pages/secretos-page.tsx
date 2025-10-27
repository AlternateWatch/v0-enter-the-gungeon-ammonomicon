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

interface Secreto {
  id: number
  name: string
  quote?: string
  type?: string
  location?: string
  how_to_find?: string
  description?: string
  image_url?: string
  notes?: string
}

export function SecretosPage() {
  const [secretos, setSecretos] = useState<Secreto[]>([])
  const [selectedSecreto, setSelectedSecreto] = useState<Secreto | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingSecreto, setEditingSecreto] = useState<Partial<Secreto> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchSecretos()
  }, [])

  const fetchSecretos = async () => {
    const { data, error } = await supabase.from("secretos").select("*").order("name")

    if (error) {
      console.error("Error fetching secretos:", error)
    } else {
      setSecretos(data || [])
    }
  }

  const handleAddSecreto = () => {
    setEditingSecreto({
      name: "",
      quote: "",
      type: "",
      location: "",
      how_to_find: "",
      description: "",
      image_url: "",
      notes: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setIsAddDialogOpen(true)
  }

  const handleEditSecreto = (secreto: Secreto) => {
    setEditingSecreto({ ...secreto })
    setImageFile(null)
    setImagePreview(secreto.image_url || null)
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
    if (!editingSecreto?.name) {
      alert("El nombre es obligatorio")
      return
    }

    try {
      let imageUrl = editingSecreto.image_url || ""

      if (imageFile) {
        const uploadResult = await uploadImage(imageFile)
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url
        } else {
          throw new Error(uploadResult.error || "Error uploading image")
        }
      }

      const secretoData = {
        ...editingSecreto,
        image_url: imageUrl,
      }

      if (editingSecreto.id) {
        const { error } = await supabase.from("secretos").update(secretoData).eq("id", editingSecreto.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("secretos").insert([secretoData])

        if (error) throw error
      }

      setIsAddDialogOpen(false)
      setEditingSecreto(null)
      setImageFile(null)
      setImagePreview(null)
      fetchSecretos()
    } catch (error: any) {
      console.error("Error saving secreto:", error)
      alert(`Error saving secreto: ${error.message}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este secreto?")) return

    try {
      const { error } = await supabase.from("secretos").delete().eq("id", id)

      if (error) throw error
      fetchSecretos()
    } catch (error: any) {
      console.error("Error deleting secreto:", error)
      alert(`Error deleting secreto: ${error.message}`)
    }
  }

  const hasIncompleteFields = (secreto: Secreto) => {
    const fieldsToCheck = [secreto.type, secreto.location, secreto.how_to_find, secreto.description, secreto.image_url]
    return fieldsToCheck.some((field) => !field || field.trim() === "")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Secretos</h2>
          <p className="text-muted-foreground">Secretos y easter eggs del Gungeon</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddSecreto} className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Secreto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSecreto?.id ? "Editar Secreto" : "Añadir Secreto"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={editingSecreto?.name || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, name: e.target.value })}
                  placeholder="Nombre del secreto"
                />
              </div>

              <div>
                <Label htmlFor="quote">Frase Emblemática</Label>
                <Input
                  id="quote"
                  value={editingSecreto?.quote || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, quote: e.target.value })}
                  placeholder="Frase característica"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={editingSecreto?.type || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, type: e.target.value })}
                  placeholder="Tipo de secreto"
                />
              </div>

              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingSecreto?.location || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, location: e.target.value })}
                  placeholder="Dónde se encuentra"
                />
              </div>

              <div>
                <Label htmlFor="how_to_find">Cómo Encontrarlo</Label>
                <Textarea
                  id="how_to_find"
                  value={editingSecreto?.how_to_find || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, how_to_find: e.target.value })}
                  placeholder="Pasos para encontrar el secreto"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={editingSecreto?.description || ""}
                  onChange={(e) =>
                    setEditingSecreto({
                      ...editingSecreto,
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
                  value={editingSecreto?.notes || ""}
                  onChange={(e) => setEditingSecreto({ ...editingSecreto, notes: e.target.value })}
                  placeholder="Notas adicionales"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false)
                    setEditingSecreto(null)
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
        {secretos.map((secreto) => (
          <div
            key={secreto.id}
            className="group relative bg-card border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedSecreto(secreto)
              setIsDetailDialogOpen(true)
            }}
          >
            {hasIncompleteFields(secreto) && (
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
                  handleEditSecreto(secreto)
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
                  handleDelete(secreto.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-40 flex items-center justify-center bg-muted/30 rounded">
                {secreto.image_url ? (
                  <img
                    src={secreto.image_url || "/placeholder.svg"}
                    alt={secreto.name}
                    className="pixel-art"
                    style={{ width: "auto", height: "160px" }}
                  />
                ) : (
                  <div className="text-muted-foreground text-sm">Sin imagen</div>
                )}
              </div>
              <h3 className="font-semibold text-center">{secreto.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {secretos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay secretos que coincidan con tu búsqueda.</p>
        </div>
      )}

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedSecreto?.name}</DialogTitle>
            {selectedSecreto?.quote && (
              <DialogDescription className="italic text-base">"{selectedSecreto.quote}"</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4">
            {selectedSecreto?.image_url && (
              <div className="flex justify-center bg-muted/30 rounded-lg p-6">
                <img
                  src={selectedSecreto.image_url || "/placeholder.svg"}
                  alt={selectedSecreto.name}
                  className="pixel-art"
                  style={{ width: "auto", height: "320px" }}
                />
              </div>
            )}
            {selectedSecreto?.type && (
              <div>
                <h4 className="font-semibold mb-1">Tipo</h4>
                <p className="text-muted-foreground">{selectedSecreto.type}</p>
              </div>
            )}
            {selectedSecreto?.location && (
              <div>
                <h4 className="font-semibold mb-1">Ubicación</h4>
                <p className="text-muted-foreground">{selectedSecreto.location}</p>
              </div>
            )}
            {selectedSecreto?.how_to_find && (
              <div>
                <h4 className="font-semibold mb-1">Cómo Encontrarlo</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedSecreto.how_to_find}</p>
              </div>
            )}
            {selectedSecreto?.description && (
              <div>
                <h4 className="font-semibold mb-1">Descripción</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedSecreto.description}</p>
              </div>
            )}
            {selectedSecreto?.notes && (
              <div>
                <h4 className="font-semibold mb-1">Notas</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{selectedSecreto.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
