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
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react"
import { put } from "@vercel/blob"

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

export function GunsManager() {
  const [guns, setGuns] = useState<Gun[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGun, setEditingGun] = useState<Gun | null>(null)
  const [formData, setFormData] = useState<Partial<Gun>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchGuns()
  }, [])

  const fetchGuns = async () => {
    setIsLoading(true)
    const { data, error } = await supabase.from("guns").select("*").order("name")

    if (!error && data) {
      setGuns(data)
    }
    setIsLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const blob = await put(file.name, file, {
        access: "public",
      })
      setFormData({ ...formData, image_url: blob.url })
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setFormData({ ...formData, image_url: null })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingGun) {
      const { error } = await supabase.from("guns").update(formData).eq("id", editingGun.id)

      if (!error) {
        fetchGuns()
        resetForm()
      }
    } else {
      const { error } = await supabase.from("guns").insert([formData])

      if (!error) {
        fetchGuns()
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this gun?")) {
      const { error } = await supabase.from("guns").delete().eq("id", id)

      if (!error) {
        fetchGuns()
      }
    }
  }

  const handleEdit = (gun: Gun) => {
    setEditingGun(gun)
    setFormData(gun)
    if (gun.image_url) {
      setImagePreview(gun.image_url)
    }
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({})
    setEditingGun(null)
    setIsDialogOpen(false)
    setImagePreview(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#d4af37]">Guns Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]">
              <Plus className="w-4 h-4 mr-2" />
              Add Gun
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#2a1f1a] border-[#8b6f47]">
            <DialogHeader>
              <DialogTitle className="text-[#d4af37]">{editingGun ? "Edit Gun" : "Add New Gun"}</DialogTitle>
              <DialogDescription className="text-[#c9b896]">Fill in the gun details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-[#d4af37]">Imagen</Label>
                {imagePreview ? (
                  <div className="relative mt-2">
                    <div className="relative w-full h-80 bg-[#1a1410] rounded-lg overflow-hidden border-2 border-[#8b6f47]">
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
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
                  <div className="flex items-center justify-center w-full mt-2">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[#8b6f47] rounded-lg cursor-pointer bg-[#1a1410] hover:bg-[#2a1f1a] transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-12 h-12 mb-3 text-[#8b6f47]" />
                        <p className="mb-2 text-sm text-[#c9b896]">
                          <span className="font-semibold">Click para subir</span> o arrastra y suelta
                        </p>
                        <p className="text-xs text-[#8b6f47]">PNG, JPG, GIF o WEBP</p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                )}
                {isUploading && <p className="text-sm text-[#c9b896] text-center mt-2">Subiendo imagen...</p>}
              </div>

              <div>
                <Label htmlFor="name" className="text-[#d4af37]">
                  Nombre *
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
                    Tipo
                  </Label>
                  <Input
                    id="type"
                    value={formData.type || ""}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: Automático, Semiautomático"
                  />
                </div>
                <div>
                  <Label htmlFor="quality" className="text-[#d4af37]">
                    Calidad
                  </Label>
                  <Input
                    id="quality"
                    value={formData.quality || ""}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: S, A, B, C, D"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class" className="text-[#d4af37]">
                    Clase
                  </Label>
                  <Input
                    id="class"
                    value={formData.class || ""}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: Pistola, Rifle, Escopeta"
                  />
                </div>
                <div>
                  <Label htmlFor="sell_price" className="text-[#d4af37]">
                    Precio de Venta (Duende)
                  </Label>
                  <Input
                    id="sell_price"
                    value={formData.sell_price || ""}
                    onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 21"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="magazine_size" className="text-[#d4af37]">
                    Tamaño del Cargador
                  </Label>
                  <Input
                    id="magazine_size"
                    type="number"
                    value={formData.magazine_size || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, magazine_size: Number.parseInt(e.target.value) || null })
                    }
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
                <div>
                  <Label htmlFor="max_ammo" className="text-[#d4af37]">
                    Munición Máxima
                  </Label>
                  <Input
                    id="max_ammo"
                    type="number"
                    value={formData.max_ammo || ""}
                    onChange={(e) => setFormData({ ...formData, max_ammo: Number.parseInt(e.target.value) || null })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  />
                </div>
                <div>
                  <Label htmlFor="reload_time" className="text-[#d4af37]">
                    Tiempo de Recarga
                  </Label>
                  <Input
                    id="reload_time"
                    type="number"
                    step="0.01"
                    value={formData.reload_time || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, reload_time: Number.parseFloat(e.target.value) || null })
                    }
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="damage" className="text-[#d4af37]">
                    Daño
                  </Label>
                  <Input
                    id="damage"
                    value={formData.damage || ""}
                    onChange={(e) => setFormData({ ...formData, damage: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 5.5"
                  />
                </div>
                <div>
                  <Label htmlFor="dps" className="text-[#d4af37]">
                    DPS
                  </Label>
                  <Input
                    id="dps"
                    value={formData.dps || ""}
                    onChange={(e) => setFormData({ ...formData, dps: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 22.5"
                  />
                </div>
                <div>
                  <Label htmlFor="fire_rate" className="text-[#d4af37]">
                    Cadencia
                  </Label>
                  <Input
                    id="fire_rate"
                    value={formData.fire_rate || ""}
                    onChange={(e) => setFormData({ ...formData, fire_rate: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 0.15"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="shot_speed" className="text-[#d4af37]">
                    Velocidad del Disparo
                  </Label>
                  <Input
                    id="shot_speed"
                    value={formData.shot_speed || ""}
                    onChange={(e) => setFormData({ ...formData, shot_speed: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 23"
                  />
                </div>
                <div>
                  <Label htmlFor="range" className="text-[#d4af37]">
                    Alcance
                  </Label>
                  <Input
                    id="range"
                    value={formData.range || ""}
                    onChange={(e) => setFormData({ ...formData, range: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 1000"
                  />
                </div>
                <div>
                  <Label htmlFor="force" className="text-[#d4af37]">
                    Fuerza
                  </Label>
                  <Input
                    id="force"
                    value={formData.force || ""}
                    onChange={(e) => setFormData({ ...formData, force: e.target.value })}
                    className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                    placeholder="ej: 12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="spread" className="text-[#d4af37]">
                  Dispersión
                </Label>
                <Input
                  id="spread"
                  value={formData.spread || ""}
                  onChange={(e) => setFormData({ ...formData, spread: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  placeholder="ej: 5"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[#d4af37]">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="synergies" className="text-[#d4af37]">
                  Sinergias
                </Label>
                <Textarea
                  id="synergies"
                  value={formData.synergies || ""}
                  onChange={(e) => setFormData({ ...formData, synergies: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  placeholder="Lista las sinergias con otros objetos"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="quote" className="text-[#d4af37]">
                  Cita
                </Label>
                <Input
                  id="quote"
                  value={formData.quote || ""}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  placeholder="Cita del juego"
                />
              </div>

              <div>
                <Label htmlFor="notes" className="text-[#d4af37]">
                  Notas
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-[#1a1410] border-[#8b6f47] text-[#e8dcc4]"
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-[#8b6f47] hover:bg-[#a0824f] text-[#1a1410]" disabled={isUploading}>
                  {isUploading ? "Subiendo..." : editingGun ? "Actualizar" : "Crear"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="border-[#8b6f47] text-[#d4af37] bg-transparent"
                >
                  Cancelar
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
          {guns.map((gun) => (
            <Card key={gun.id} className="bg-[#2a1f1a] border-[#8b6f47]">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {gun.image_url && (
                      <img
                        src={gun.image_url || "/placeholder.svg"}
                        alt={gun.name}
                        className="w-12 h-12 object-cover bg-[#1a1410] rounded border border-[#8b6f47]"
                      />
                    )}
                    <span className="text-[#d4af37]">{gun.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(gun)}
                      className="border-[#8b6f47] text-[#d4af37]"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(gun.id)}
                      className="border-red-500 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-[#c9b896] space-y-1">
                  {gun.type && (
                    <p>
                      <strong>Tipo:</strong> {gun.type}
                    </p>
                  )}
                  {gun.quality && (
                    <p>
                      <strong>Calidad:</strong> {gun.quality}
                    </p>
                  )}
                  {gun.description && (
                    <p>
                      <strong>Descripción:</strong> {gun.description}
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
