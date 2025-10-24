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

interface NpcsPageProps {
  searchQuery: string
}

interface Npc {
  id: string
  name: string
  location: string | null
  role: string | null
  services: string | null
  unlocked_by: string | null
  dialogue: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function NpcsPage({ searchQuery }: NpcsPageProps) {
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingNpc, setEditingNpc] = useState<Partial<Npc> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchNpcs()
  }, [])

  const fetchNpcs = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("npcs").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setNpcs(data || [])
    }
  }

  const handleCardClick = (npc: Npc) => {
    setSelectedNpc(npc)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingNpc({
      name: "",
      location: "",
      role: "",
      services: "",
      unlocked_by: "",
      dialogue: "",
      description: "",
      notes: "",
      image_url: null,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsEditOpen(true)
  }

  const handleEdit = (npc: Npc) => {
    setEditingNpc(npc)
    setImageFile(null)
    setImagePreview(npc.image_url)
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
    if (editingNpc) {
      setEditingNpc({ ...editingNpc, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingNpc?.name) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingNpc.image_url

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        imageUrl = await uploadImage(formData)
      }

      const npcData = {
        ...editingNpc,
        image_url: imageUrl,
      }

      if (editingNpc.id) {
        const { error } = await supabase.from("npcs").update(npcData).eq("id", editingNpc.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("npcs").insert([npcData])
        if (error) throw error
      }

      await fetchNpcs()
      setIsEditOpen(false)
      setEditingNpc(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving NPC:", err)
      setError(err instanceof Error ? err.message : "Error saving NPC")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este NPC?")) return

    const supabase = createClient()
    const { error } = await supabase.from("npcs").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchNpcs()
    }
  }

  const filteredNpcs = npcs.filter((npc) => npc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const hasIncompleteFields = (npc: Npc): boolean => {
    const importantFields = [
      npc.location,
      npc.role,
      npc.services,
      npc.unlocked_by,
      npc.dialogue,
      npc.description,
      npc.image_url,
    ]
    return importantFields.some((field) => !field || field === "")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">NPCs</h2>
          <p className="text-muted-foreground">Guía completa de todos los NPCs en Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir NPC
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNpcs.map((npc) => (
          <Card key={npc.id} className="hover:shadow-lg transition-shadow group relative">
            {hasIncompleteFields(npc) && (
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
                  handleEdit(npc)
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
                  handleDelete(npc.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(npc)}>
              {npc.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4">
                  <img
                    src={npc.image_url || "/placeholder.svg"}
                    alt={npc.name}
                    className="w-32 h-auto object-contain pixel-art"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{npc.name}</CardTitle>
                {npc.location && <Badge variant="secondary">{npc.location}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(npc)}>
              {npc.description && <p className="text-sm text-muted-foreground line-clamp-2">{npc.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNpcs.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay NPCs que coincidan con tu búsqueda.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error cargando NPCs: {error}</p>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedNpc?.name}</DialogTitle>
            {selectedNpc?.location && (
              <DialogDescription className="text-base">{selectedNpc.location}</DialogDescription>
            )}
          </DialogHeader>

          {selectedNpc && (
            <div className="space-y-6">
              {selectedNpc.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                  <img
                    src={selectedNpc.image_url || "/placeholder.svg"}
                    alt={selectedNpc.name}
                    className="w-80 h-auto object-contain pixel-art"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedNpc.role && (
                  <div>
                    <p className="text-sm text-muted-foreground">Rol</p>
                    <p className="font-medium">{selectedNpc.role}</p>
                  </div>
                )}
                {selectedNpc.unlocked_by && (
                  <div>
                    <p className="text-sm text-muted-foreground">Desbloqueo</p>
                    <p className="font-medium">{selectedNpc.unlocked_by}</p>
                  </div>
                )}
              </div>

              {selectedNpc.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedNpc.description}</p>
                </div>
              )}

              {selectedNpc.services && (
                <div>
                  <h3 className="font-semibold mb-2">Servicios</h3>
                  <p className="text-base whitespace-pre-line">{selectedNpc.services}</p>
                </div>
              )}

              {selectedNpc.dialogue && (
                <div>
                  <h3 className="font-semibold mb-2">Diálogo</h3>
                  <p className="text-base whitespace-pre-line italic">{selectedNpc.dialogue}</p>
                </div>
              )}

              {selectedNpc.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedNpc.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNpc?.id ? "Editar NPC" : "Añadir Nuevo NPC"}</DialogTitle>
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
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del NPC</p>
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
                  value={editingNpc?.name || ""}
                  onChange={(e) => setEditingNpc({ ...editingNpc, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingNpc?.location || ""}
                  onChange={(e) => setEditingNpc({ ...editingNpc, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Input
                  id="role"
                  value={editingNpc?.role || ""}
                  onChange={(e) => setEditingNpc({ ...editingNpc, role: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unlocked_by">Desbloqueo</Label>
                <Input
                  id="unlocked_by"
                  value={editingNpc?.unlocked_by || ""}
                  onChange={(e) => setEditingNpc({ ...editingNpc, unlocked_by: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingNpc?.description || ""}
                onChange={(e) => setEditingNpc({ ...editingNpc, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="services">Servicios</Label>
              <Textarea
                id="services"
                value={editingNpc?.services || ""}
                onChange={(e) => setEditingNpc({ ...editingNpc, services: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="dialogue">Diálogo</Label>
              <Textarea
                id="dialogue"
                value={editingNpc?.dialogue || ""}
                onChange={(e) => setEditingNpc({ ...editingNpc, dialogue: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingNpc?.notes || ""}
                onChange={(e) => setEditingNpc({ ...editingNpc, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingNpc?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
