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

interface EnemiesPageProps {
  searchQuery: string
}

interface Enemy {
  id: string
  name: string
  location: string | null
  health: string | null
  damage: string | null
  behavior: string | null
  quote: string | null
  description: string | null
  notes: string | null
  image_url: string | null
}

export function EnemiesPage({ searchQuery }: EnemiesPageProps) {
  const [enemies, setEnemies] = useState<Enemy[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedEnemy, setSelectedEnemy] = useState<Enemy | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEnemy, setEditingEnemy] = useState<Partial<Enemy> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchEnemies()
  }, [])

  const fetchEnemies = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("enemies").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setEnemies(data || [])
    }
  }

  const handleCardClick = (enemy: Enemy) => {
    setSelectedEnemy(enemy)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingEnemy({
      name: "",
      location: "",
      health: "",
      damage: "",
      behavior: "",
      quote: "",
      description: "",
      notes: "",
      image_url: null,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsEditOpen(true)
  }

  const handleEdit = (enemy: Enemy) => {
    setEditingEnemy(enemy)
    setImageFile(null)
    setImagePreview(enemy.image_url)
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
    if (editingEnemy) {
      setEditingEnemy({ ...editingEnemy, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingEnemy?.name) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingEnemy.image_url

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        imageUrl = await uploadImage(formData)
      }

      const enemyData = {
        ...editingEnemy,
        image_url: imageUrl,
      }

      if (editingEnemy.id) {
        const { error } = await supabase.from("enemies").update(enemyData).eq("id", editingEnemy.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("enemies").insert([enemyData])
        if (error) throw error
      }

      await fetchEnemies()
      setIsEditOpen(false)
      setEditingEnemy(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving enemy:", err)
      setError(err instanceof Error ? err.message : "Error saving enemy")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este enemigo?")) return

    const supabase = createClient()
    const { error } = await supabase.from("enemies").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchEnemies()
    }
  }

  const filteredEnemies = enemies.filter((enemy) => enemy.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const hasIncompleteFields = (enemy: Enemy): boolean => {
    const importantFields = [
      enemy.location,
      enemy.health,
      enemy.damage,
      enemy.description,
      enemy.behavior,
      enemy.image_url,
    ]
    return importantFields.some((field) => !field || field === "")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Enemigos</h2>
          <p className="text-muted-foreground">Bestiario completo de todos los enemigos de Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir Enemigo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredEnemies.map((enemy) => (
          <Card key={enemy.id} className="hover:shadow-lg transition-shadow group relative">
            {hasIncompleteFields(enemy) && (
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
                  handleEdit(enemy)
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
                  handleDelete(enemy.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(enemy)}>
              {enemy.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4">
                  <img
                    src={enemy.image_url || "/placeholder.svg"}
                    alt={enemy.name}
                    className="w-32 h-auto object-contain pixel-art"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{enemy.name}</CardTitle>
                {enemy.location && <Badge variant="secondary">{enemy.location}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(enemy)}>
              {enemy.description && <p className="text-sm text-muted-foreground line-clamp-2">{enemy.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEnemies.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay enemigos que coincidan con tu búsqueda.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error cargando enemigos: {error}</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEnemy?.name}</DialogTitle>
            {selectedEnemy?.quote && (
              <DialogDescription className="italic text-base">"{selectedEnemy.quote}"</DialogDescription>
            )}
          </DialogHeader>

          {selectedEnemy && (
            <div className="space-y-6">
              {selectedEnemy.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                  <img
                    src={selectedEnemy.image_url || "/placeholder.svg"}
                    alt={selectedEnemy.name}
                    className="w-80 h-auto object-contain pixel-art"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedEnemy.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ubicación</p>
                    <p className="font-medium">{selectedEnemy.location}</p>
                  </div>
                )}
                {selectedEnemy.health && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vida</p>
                    <p className="font-medium">{selectedEnemy.health}</p>
                  </div>
                )}
                {selectedEnemy.damage && (
                  <div>
                    <p className="text-sm text-muted-foreground">Daño</p>
                    <p className="font-medium">{selectedEnemy.damage}</p>
                  </div>
                )}
              </div>

              {selectedEnemy.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedEnemy.description}</p>
                </div>
              )}

              {selectedEnemy.behavior && (
                <div>
                  <h3 className="font-semibold mb-2">Comportamiento</h3>
                  <p className="text-base whitespace-pre-line">{selectedEnemy.behavior}</p>
                </div>
              )}

              {selectedEnemy.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedEnemy.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit/Add Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEnemy?.id ? "Editar Enemigo" : "Añadir Nuevo Enemigo"}</DialogTitle>
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
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del enemigo</p>
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
                  value={editingEnemy?.name || ""}
                  onChange={(e) => setEditingEnemy({ ...editingEnemy, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingEnemy?.location || ""}
                  onChange={(e) => setEditingEnemy({ ...editingEnemy, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="health">Vida</Label>
                <Input
                  id="health"
                  value={editingEnemy?.health || ""}
                  onChange={(e) => setEditingEnemy({ ...editingEnemy, health: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="damage">Daño</Label>
                <Input
                  id="damage"
                  value={editingEnemy?.damage || ""}
                  onChange={(e) => setEditingEnemy({ ...editingEnemy, damage: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quote">Frase Emblemática</Label>
              <Input
                id="quote"
                value={editingEnemy?.quote || ""}
                onChange={(e) => setEditingEnemy({ ...editingEnemy, quote: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingEnemy?.description || ""}
                onChange={(e) => setEditingEnemy({ ...editingEnemy, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="behavior">Comportamiento</Label>
              <Textarea
                id="behavior"
                value={editingEnemy?.behavior || ""}
                onChange={(e) => setEditingEnemy({ ...editingEnemy, behavior: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingEnemy?.notes || ""}
                onChange={(e) => setEditingEnemy({ ...editingEnemy, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingEnemy?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
