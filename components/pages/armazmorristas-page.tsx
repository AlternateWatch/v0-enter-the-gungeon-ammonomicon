"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"

interface ArmazmorrristasPageProps {
  searchQuery: string
}

interface Gungeoneer {
  id: string
  name: string
  quote: string | null
  starting_weapon: string | null
  starting_items: string | null
  armor: number | null
  health: number | null
  past: string | null
  description: string | null
  unlocked_by: string | null
  image_url: string | null
  notes: string | null
}

export function ArmazmorrristasPage({ searchQuery }: ArmazmorrristasPageProps) {
  const [gungeoneers, setGungeoneers] = useState<Gungeoneer[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedGungeoneer, setSelectedGungeoneer] = useState<Gungeoneer | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGungeoneer, setEditingGungeoneer] = useState<Partial<Gungeoneer> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchGungeoneers()
  }, [])

  const fetchGungeoneers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("gungeoneers").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setGungeoneers(data || [])
    }
  }

  const handleCardClick = (gungeoneer: Gungeoneer) => {
    setSelectedGungeoneer(gungeoneer)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingGungeoneer({
      name: "",
      quote: "",
      starting_weapon: "",
      starting_items: "",
      armor: null,
      health: null,
      past: "",
      description: "",
      unlocked_by: "",
      image_url: null,
      notes: "",
    })
    setImageFile(null)
    setImagePreview(null)
    setIsEditOpen(true)
  }

  const handleEdit = (gungeoneer: Gungeoneer) => {
    setEditingGungeoneer(gungeoneer)
    setImageFile(null)
    setImagePreview(gungeoneer.image_url)
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
    if (editingGungeoneer) {
      setEditingGungeoneer({ ...editingGungeoneer, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingGungeoneer?.name) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingGungeoneer.image_url

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        imageUrl = await uploadImage(formData)
      }

      const gungeoneerData = {
        ...editingGungeoneer,
        image_url: imageUrl,
      }

      if (editingGungeoneer.id) {
        const { error } = await supabase.from("gungeoneers").update(gungeoneerData).eq("id", editingGungeoneer.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("gungeoneers").insert([gungeoneerData])
        if (error) throw error
      }

      await fetchGungeoneers()
      setIsEditOpen(false)
      setEditingGungeoneer(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving gungeoneer:", err)
      setError(err instanceof Error ? err.message : "Error saving gungeoneer")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este armazmorrista?")) return

    const supabase = createClient()
    const { error } = await supabase.from("gungeoneers").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchGungeoneers()
    }
  }

  const filteredGungeoneers = gungeoneers.filter((gungeoneer) =>
    gungeoneer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const hasIncompleteFields = (gungeoneer: Gungeoneer): boolean => {
    const importantFields = [
      gungeoneer.starting_weapon,
      gungeoneer.starting_items,
      gungeoneer.armor,
      gungeoneer.health,
      gungeoneer.past,
      gungeoneer.description,
      gungeoneer.unlocked_by,
      gungeoneer.image_url,
    ]
    return importantFields.some((field) => !field || field === "")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Armazmorristas</h2>
          <p className="text-muted-foreground">Todos los personajes jugables de Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir Armazmorrista
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGungeoneers.map((gungeoneer) => (
          <Card key={gungeoneer.id} className="hover:shadow-lg transition-shadow group relative">
            {hasIncompleteFields(gungeoneer) && (
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
                  handleEdit(gungeoneer)
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
                  handleDelete(gungeoneer.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(gungeoneer)}>
              {gungeoneer.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4">
                  <img
                    src={gungeoneer.image_url || "/placeholder.svg"}
                    alt={gungeoneer.name}
                    className="w-32 h-auto object-contain"
                    style={{
                      imageRendering: "pixelated",
                      WebkitFontSmoothing: "none",
                    }}
                  />
                </div>
              )}
              <CardTitle className="text-lg">{gungeoneer.name}</CardTitle>
              {gungeoneer.starting_weapon && <CardDescription>{gungeoneer.starting_weapon}</CardDescription>}
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(gungeoneer)}>
              {gungeoneer.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{gungeoneer.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGungeoneers.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay armazmorristas que coincidan con tu búsqueda.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error cargando armazmorristas: {error}</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedGungeoneer?.name}</DialogTitle>
            {selectedGungeoneer?.quote && (
              <DialogDescription className="italic text-base">"{selectedGungeoneer.quote}"</DialogDescription>
            )}
          </DialogHeader>

          {selectedGungeoneer && (
            <div className="space-y-6">
              {selectedGungeoneer.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                  <img
                    src={selectedGungeoneer.image_url || "/placeholder.svg"}
                    alt={selectedGungeoneer.name}
                    className="w-80 h-auto object-contain"
                    style={{
                      imageRendering: "pixelated",
                      WebkitFontSmoothing: "none",
                    }}
                  />
                </div>
              )}

              {selectedGungeoneer.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedGungeoneer.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedGungeoneer.starting_weapon && (
                  <div>
                    <p className="text-sm text-muted-foreground">Arma Inicial</p>
                    <p className="font-medium">{selectedGungeoneer.starting_weapon}</p>
                  </div>
                )}
                {selectedGungeoneer.starting_items && (
                  <div>
                    <p className="text-sm text-muted-foreground">Items Iniciales</p>
                    <p className="font-medium">{selectedGungeoneer.starting_items}</p>
                  </div>
                )}
                {selectedGungeoneer.armor !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Armadura</p>
                    <p className="font-medium">{selectedGungeoneer.armor}</p>
                  </div>
                )}
                {selectedGungeoneer.health !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Salud</p>
                    <p className="font-medium">{selectedGungeoneer.health}</p>
                  </div>
                )}
                {selectedGungeoneer.unlocked_by && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Cómo Desbloquear</p>
                    <p className="font-medium">{selectedGungeoneer.unlocked_by}</p>
                  </div>
                )}
              </div>

              {selectedGungeoneer.past && (
                <div>
                  <h3 className="font-semibold mb-2">Pasado</h3>
                  <p className="text-base whitespace-pre-line">{selectedGungeoneer.past}</p>
                </div>
              )}

              {selectedGungeoneer.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedGungeoneer.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGungeoneer?.id ? "Editar Armazmorrista" : "Añadir Nuevo Armazmorrista"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Imagen</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Usa el sprite original de la wiki. Se escalará automáticamente manteniendo el estilo pixel-art.
              </p>
              <div className="mt-2 space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-80 h-auto object-contain"
                        style={{
                          imageRendering: "pixelated",
                          WebkitFontSmoothing: "none",
                        }}
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
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del armazmorrista</p>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={editingGungeoneer?.name || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="quote">Frase</Label>
              <Input
                id="quote"
                value={editingGungeoneer?.quote || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, quote: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingGungeoneer?.description || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starting_weapon">Arma Inicial</Label>
                <Input
                  id="starting_weapon"
                  value={editingGungeoneer?.starting_weapon || ""}
                  onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, starting_weapon: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="starting_items">Items Iniciales</Label>
                <Input
                  id="starting_items"
                  value={editingGungeoneer?.starting_items || ""}
                  onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, starting_items: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="armor">Armadura</Label>
                <Input
                  id="armor"
                  type="number"
                  value={editingGungeoneer?.armor || ""}
                  onChange={(e) =>
                    setEditingGungeoneer({
                      ...editingGungeoneer,
                      armor: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="health">Salud</Label>
                <Input
                  id="health"
                  type="number"
                  value={editingGungeoneer?.health || ""}
                  onChange={(e) =>
                    setEditingGungeoneer({
                      ...editingGungeoneer,
                      health: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="unlocked_by">Cómo Desbloquear</Label>
              <Input
                id="unlocked_by"
                value={editingGungeoneer?.unlocked_by || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, unlocked_by: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="past">Pasado</Label>
              <Textarea
                id="past"
                value={editingGungeoneer?.past || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, past: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingGungeoneer?.notes || ""}
                onChange={(e) => setEditingGungeoneer({ ...editingGungeoneer, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingGungeoneer?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
