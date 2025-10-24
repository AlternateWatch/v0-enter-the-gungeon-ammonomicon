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

interface BossesPageProps {
  searchQuery: string
}

interface Boss {
  id: string
  name: string
  location: string | null
  health: string | null
  phases: number | null
  attacks: string | null
  quote: string | null
  description: string | null
  strategy: string | null
  notes: string | null
  image_url: string | null
}

export function BossesPage({ searchQuery }: BossesPageProps) {
  const [bosses, setBosses] = useState<Boss[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBoss, setEditingBoss] = useState<Partial<Boss> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [floorFilter, setFloorFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchBosses()
  }, [])

  const fetchBosses = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("bosses").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setBosses(data || [])
    }
  }

  const handleCardClick = (boss: Boss) => {
    setSelectedBoss(boss)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingBoss({
      name: "",
      location: "",
      health: "",
      phases: null,
      attacks: "",
      quote: "",
      description: "",
      strategy: "",
      notes: "",
      image_url: null,
    })
    setImageFile(null)
    setImagePreview(null)
    setIsEditOpen(true)
  }

  const handleEdit = (boss: Boss) => {
    setEditingBoss(boss)
    setImageFile(null)
    setImagePreview(boss.image_url)
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
    if (editingBoss) {
      setEditingBoss({ ...editingBoss, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingBoss?.name) {
      return
    }

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingBoss.image_url

      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)
        imageUrl = await uploadImage(formData)
      }

      const bossData = {
        ...editingBoss,
        image_url: imageUrl,
        phases: editingBoss.phases ? Number(editingBoss.phases) : null,
      }

      if (editingBoss.id) {
        const { error } = await supabase.from("bosses").update(bossData).eq("id", editingBoss.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("bosses").insert([bossData])
        if (error) throw error
      }

      await fetchBosses()
      setIsEditOpen(false)
      setEditingBoss(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving boss:", err)
      setError(err instanceof Error ? err.message : "Error saving boss")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este jefe?")) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("bosses").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchBosses()
    }
  }

  const filteredBosses = bosses.filter((boss) => {
    const matchesSearch = boss.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFloor = !floorFilter || boss.location?.includes(floorFilter)
    return matchesSearch && matchesFloor
  })

  const hasIncompleteFields = (boss: Boss): boolean => {
    const importantFields = [
      boss.location,
      boss.health,
      boss.phases,
      boss.attacks,
      boss.description,
      boss.strategy,
      boss.image_url,
    ]
    return importantFields.some((field) => !field || field === "")
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Jefes</h2>
          <p className="text-muted-foreground">Guía completa para todos los jefes de Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir Jefe
        </Button>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        <Button variant={floorFilter === null ? "default" : "outline"} onClick={() => setFloorFilter(null)} size="sm">
          Todos los Pisos
        </Button>
        {[
          "Cámara 1",
          "Cámara 2",
          "Cámara 3",
          "Cámara 4",
          "Cámara 5",
          "Forja",
          "Infierno",
          "Bala del Pasado",
          "R&G Dept.",
        ].map((floor) => (
          <Button
            key={floor}
            variant={floorFilter === floor ? "default" : "outline"}
            onClick={() => setFloorFilter(floor)}
            size="sm"
          >
            {floor}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBosses.map((boss) => (
          <Card key={boss.id} className="hover:shadow-lg transition-shadow group relative">
            {hasIncompleteFields(boss) && (
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
                  handleEdit(boss)
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
                  handleDelete(boss.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(boss)}>
              {boss.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4">
                  <img
                    src={boss.image_url || "/placeholder.svg"}
                    alt={boss.name}
                    className="pixel-art w-32 h-auto object-contain"
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{boss.name}</CardTitle>
                {boss.location && <Badge variant="secondary">{boss.location}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(boss)}>
              {boss.description && <p className="text-sm text-muted-foreground line-clamp-2">{boss.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBosses.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay jefes que coincidan con tu búsqueda.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error cargando jefes: {error}</p>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedBoss?.name}</DialogTitle>
            {selectedBoss?.quote && (
              <DialogDescription className="italic text-base">"{selectedBoss.quote}"</DialogDescription>
            )}
            {selectedBoss?.location && (
              <DialogDescription className="text-base">{selectedBoss.location}</DialogDescription>
            )}
          </DialogHeader>

          {selectedBoss && (
            <div className="space-y-6">
              {selectedBoss.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
                  <img
                    src={selectedBoss.image_url || "/placeholder.svg"}
                    alt={selectedBoss.name}
                    className="pixel-art w-80 h-auto object-contain"
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedBoss.health && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vida</p>
                    <p className="font-medium">{selectedBoss.health}</p>
                  </div>
                )}
                {selectedBoss.phases && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fases</p>
                    <p className="font-medium">{selectedBoss.phases}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedBoss.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedBoss.description}</p>
                </div>
              )}

              {/* Attacks */}
              {selectedBoss.attacks && (
                <div>
                  <h3 className="font-semibold mb-2">Patrones de Ataque</h3>
                  <p className="text-base whitespace-pre-line">{selectedBoss.attacks}</p>
                </div>
              )}

              {/* Strategy */}
              {selectedBoss.strategy && (
                <div>
                  <h3 className="font-semibold mb-2">Estrategia</h3>
                  <p className="text-base whitespace-pre-line">{selectedBoss.strategy}</p>
                </div>
              )}

              {/* Notes */}
              {selectedBoss.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedBoss.notes}</p>
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
            <DialogTitle>{editingBoss?.id ? "Editar Jefe" : "Añadir Nuevo Jefe"}</DialogTitle>
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
                        className="pixel-art w-80 h-auto object-contain"
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
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del jefe</p>
                    <Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={editingBoss?.name || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={editingBoss?.location || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, location: e.target.value })}
                  placeholder="ej., Cámara 2"
                />
              </div>
              <div>
                <Label htmlFor="health">Vida</Label>
                <Input
                  id="health"
                  value={editingBoss?.health || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, health: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phases">Número de Fases</Label>
                <Input
                  id="phases"
                  type="number"
                  value={editingBoss?.phases || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, phases: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingBoss?.description || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="quote">Frase Emblemática</Label>
              <Input
                id="quote"
                value={editingBoss?.quote || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, quote: e.target.value })}
                placeholder="La frase icónica del jefe..."
              />
            </div>

            <div>
              <Label htmlFor="attacks">Patrones de Ataque</Label>
              <Textarea
                id="attacks"
                value={editingBoss?.attacks || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })}
                rows={4}
                placeholder="Describe los patrones de ataque del jefe..."
              />
            </div>

            <div>
              <Label htmlFor="strategy">Estrategia</Label>
              <Textarea
                id="strategy"
                value={editingBoss?.strategy || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, strategy: e.target.value })}
                rows={4}
                placeholder="Consejos y estrategias para derrotar al jefe..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingBoss?.notes || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingBoss?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
