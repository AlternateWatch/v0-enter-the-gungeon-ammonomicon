"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react"
import { put } from "@vercel/blob"

interface GunsPageProps {
  searchQuery: string
}

interface Gun {
  id: string
  name: string
  type: string | null
  quality: string | null
  magazine_size: number | null
  max_ammo: number | null
  reload_time: number | null
  dps: string | null
  damage: string | null
  fire_rate: string | null
  shot_speed: string | null
  range: string | null
  force: string | null
  spread: string | null
  class: string | null
  sell_price: string | null
  quote: string | null
  description: string | null
  synergies: string | null
  notes: string | null
  image_url: string | null
}

export function GunsPage({ searchQuery }: GunsPageProps) {
  const [guns, setGuns] = useState<Gun[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedGun, setSelectedGun] = useState<Gun | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingGun, setEditingGun] = useState<Partial<Gun> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchGuns()
  }, [])

  const fetchGuns = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("guns").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setGuns(data || [])
    }
  }

  const handleCardClick = (gun: Gun) => {
    setSelectedGun(gun)
    setIsDetailOpen(true)
  }

  const handleAddNew = () => {
    setEditingGun({
      name: "",
      type: "",
      quality: "",
      class: "",
      magazine_size: null,
      max_ammo: null,
      reload_time: null,
      dps: "",
      damage: "",
      fire_rate: "",
      shot_speed: "",
      range: "",
      force: "",
      spread: "",
      sell_price: "",
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

  const handleEdit = (gun: Gun) => {
    setEditingGun(gun)
    setImageFile(null)
    setImagePreview(gun.image_url)
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
    if (editingGun) {
      setEditingGun({ ...editingGun, image_url: null })
    }
  }

  const handleSave = async () => {
    if (!editingGun?.name) return

    setIsUploading(true)
    const supabase = createClient()

    try {
      let imageUrl = editingGun.image_url

      if (imageFile) {
        const blob = await put(imageFile.name, imageFile, {
          access: "public",
        })
        imageUrl = blob.url
      }

      const gunData = {
        ...editingGun,
        image_url: imageUrl,
        magazine_size: editingGun.magazine_size ? Number(editingGun.magazine_size) : null,
        max_ammo: editingGun.max_ammo ? Number(editingGun.max_ammo) : null,
        reload_time: editingGun.reload_time ? Number(editingGun.reload_time) : null,
      }

      if (editingGun.id) {
        const { error } = await supabase.from("guns").update(gunData).eq("id", editingGun.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("guns").insert([gunData])
        if (error) throw error
      }

      await fetchGuns()
      setIsEditOpen(false)
      setEditingGun(null)
      setImageFile(null)
      setImagePreview(null)
    } catch (err) {
      console.error("Error saving gun:", err)
      setError(err instanceof Error ? err.message : "Error saving gun")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta arma?")) return

    const supabase = createClient()
    const { error } = await supabase.from("guns").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchGuns()
    }
  }

  const filteredGuns = guns.filter((gun) => gun.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Guns</h2>
          <p className="text-muted-foreground">Complete arsenal of all guns in Enter the Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Añadir Arma
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGuns.map((gun) => (
          <Card key={gun.id} className="hover:shadow-lg transition-shadow group relative">
            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(gun)
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
                  handleDelete(gun.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <CardHeader className="cursor-pointer" onClick={() => handleCardClick(gun)}>
              {gun.image_url && (
                <div className="w-full h-40 mb-4 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={gun.image_url || "/placeholder.svg"}
                    alt={gun.name}
                    className="max-h-full max-w-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              )}
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{gun.name}</CardTitle>
                {gun.quality && <Badge variant={gun.quality === "S" ? "default" : "secondary"}>{gun.quality}</Badge>}
              </div>
              {gun.type && <CardDescription>{gun.type}</CardDescription>}
            </CardHeader>
            <CardContent className="cursor-pointer" onClick={() => handleCardClick(gun)}>
              {gun.description && <p className="text-sm text-muted-foreground line-clamp-2">{gun.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuns.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No guns found matching your search.</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-destructive">Error loading guns: {error}</p>
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedGun?.name}</DialogTitle>
            {selectedGun?.quote && (
              <DialogDescription className="italic text-base">"{selectedGun.quote}"</DialogDescription>
            )}
          </DialogHeader>

          {selectedGun && (
            <div className="space-y-6">
              {selectedGun.image_url && (
                <div className="w-full h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                  <img
                    src={selectedGun.image_url || "/placeholder.svg"}
                    alt={selectedGun.name}
                    className="max-h-full max-w-full object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                {selectedGun.type && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{selectedGun.type}</p>
                  </div>
                )}
                {selectedGun.quality && (
                  <div>
                    <p className="text-sm text-muted-foreground">Calidad</p>
                    <p className="font-medium">{selectedGun.quality}</p>
                  </div>
                )}
                {selectedGun.class && (
                  <div>
                    <p className="text-sm text-muted-foreground">Clase</p>
                    <p className="font-medium">{selectedGun.class}</p>
                  </div>
                )}
                {selectedGun.sell_price && (
                  <div>
                    <p className="text-sm text-muted-foreground">Precio de Venta</p>
                    <p className="font-medium">{selectedGun.sell_price}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedGun.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-base">{selectedGun.description}</p>
                </div>
              )}

              {/* Stats */}
              <div>
                <h3 className="font-semibold mb-3">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedGun.magazine_size && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tamaño del Cargador</p>
                      <p className="font-mono">{selectedGun.magazine_size}</p>
                    </div>
                  )}
                  {selectedGun.max_ammo && (
                    <div>
                      <p className="text-sm text-muted-foreground">Munición Máxima</p>
                      <p className="font-mono">{selectedGun.max_ammo}</p>
                    </div>
                  )}
                  {selectedGun.reload_time && (
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo de Recarga</p>
                      <p className="font-mono">{selectedGun.reload_time}s</p>
                    </div>
                  )}
                  {selectedGun.damage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Daño</p>
                      <p className="font-mono">{selectedGun.damage}</p>
                    </div>
                  )}
                  {selectedGun.dps && (
                    <div>
                      <p className="text-sm text-muted-foreground">DPS</p>
                      <p className="font-mono">{selectedGun.dps}</p>
                    </div>
                  )}
                  {selectedGun.fire_rate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Cadencia</p>
                      <p className="font-mono">{selectedGun.fire_rate}</p>
                    </div>
                  )}
                  {selectedGun.shot_speed && (
                    <div>
                      <p className="text-sm text-muted-foreground">Velocidad del Disparo</p>
                      <p className="font-mono">{selectedGun.shot_speed}</p>
                    </div>
                  )}
                  {selectedGun.range && (
                    <div>
                      <p className="text-sm text-muted-foreground">Alcance</p>
                      <p className="font-mono">{selectedGun.range}</p>
                    </div>
                  )}
                  {selectedGun.force && (
                    <div>
                      <p className="text-sm text-muted-foreground">Fuerza</p>
                      <p className="font-mono">{selectedGun.force}</p>
                    </div>
                  )}
                  {selectedGun.spread && (
                    <div>
                      <p className="text-sm text-muted-foreground">Dispersión</p>
                      <p className="font-mono">{selectedGun.spread}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Synergies */}
              {selectedGun.synergies && (
                <div>
                  <h3 className="font-semibold mb-2">Sinergias</h3>
                  <p className="text-base whitespace-pre-line">{selectedGun.synergies}</p>
                </div>
              )}

              {/* Notes */}
              {selectedGun.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notas</h3>
                  <p className="text-base whitespace-pre-line">{selectedGun.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGun?.id ? "Editar Arma" : "Añadir Nueva Arma"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <Label>Imagen</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-2">
                Tamaño recomendado: 256x256 píxeles o similar (formato PNG con fondo transparente)
              </p>
              <div className="mt-2 space-y-4">
                {imagePreview ? (
                  <div className="relative">
                    <div className="w-full h-96 bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        style={{ imageRendering: "pixelated" }}
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
                    <p className="text-sm text-muted-foreground mb-2">Sube una imagen del arma</p>
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
                  value={editingGun?.name || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={editingGun?.type || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, type: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="quality">Calidad</Label>
                <Input
                  id="quality"
                  value={editingGun?.quality || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, quality: e.target.value })}
                  placeholder="D, C, B, A, S"
                />
              </div>
              <div>
                <Label htmlFor="class">Clase</Label>
                <Input
                  id="class"
                  value={editingGun?.class || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, class: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quote">Frase</Label>
              <Input
                id="quote"
                value={editingGun?.quote || ""}
                onChange={(e) => setEditingGun({ ...editingGun, quote: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editingGun?.description || ""}
                onChange={(e) => setEditingGun({ ...editingGun, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="magazine_size">Tamaño del Cargador</Label>
                <Input
                  id="magazine_size"
                  type="number"
                  value={editingGun?.magazine_size || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, magazine_size: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="max_ammo">Munición Máxima</Label>
                <Input
                  id="max_ammo"
                  type="number"
                  value={editingGun?.max_ammo || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, max_ammo: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="reload_time">Tiempo de Recarga (s)</Label>
                <Input
                  id="reload_time"
                  type="number"
                  step="0.1"
                  value={editingGun?.reload_time || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, reload_time: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="damage">Daño</Label>
                <Input
                  id="damage"
                  value={editingGun?.damage || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, damage: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dps">DPS</Label>
                <Input
                  id="dps"
                  value={editingGun?.dps || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, dps: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="fire_rate">Cadencia</Label>
                <Input
                  id="fire_rate"
                  value={editingGun?.fire_rate || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, fire_rate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shot_speed">Velocidad del Disparo</Label>
                <Input
                  id="shot_speed"
                  value={editingGun?.shot_speed || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, shot_speed: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="range">Alcance</Label>
                <Input
                  id="range"
                  value={editingGun?.range || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, range: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="force">Fuerza</Label>
                <Input
                  id="force"
                  value={editingGun?.force || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, force: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="spread">Dispersión</Label>
                <Input
                  id="spread"
                  value={editingGun?.spread || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, spread: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sell_price">Precio de Venta</Label>
                <Input
                  id="sell_price"
                  value={editingGun?.sell_price || ""}
                  onChange={(e) => setEditingGun({ ...editingGun, sell_price: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="synergies">Sinergias</Label>
              <Textarea
                id="synergies"
                value={editingGun?.synergies || ""}
                onChange={(e) => setEditingGun({ ...editingGun, synergies: e.target.value })}
                rows={3}
                placeholder="Lista las sinergias con otros objetos..."
              />
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editingGun?.notes || ""}
                onChange={(e) => setEditingGun({ ...editingGun, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUploading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isUploading || !editingGun?.name}>
                {isUploading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
