"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"

interface BossesPageProps {
  searchQuery: string
}

interface Boss {
  id: string
  name: string
  location: string | null
  description: string | null
  health: string | null
  phases: string | null
  attacks: string | null
  strategy: string | null
  notes: string | null
  common_name: string | null
  common_health: string | null
  image_url: string | null
  quote: string | null
  is_duo: boolean | null
  name_2: string | null
  image_url_2: string | null
  description_2: string | null
  quote_2: string | null
  health_2: string | null
}

const floors = [
  "Todos los pisos", "Fortaleza del Señor del Plomo", "Armazmorra en Sí", "Mina de Pólvora", "Hondanada", "Forja",
  "Infierno de las Balas", "Calabozo", "Abadía del Arma Verdadera", "Guarida de la Rata", "Departamento de I+D", "Pasado",
]

const isBossDataIncomplete = (boss: Boss): boolean => {
  const baseRequiredFields: (keyof Boss)[] = ['attacks', 'description', 'health', 'image_url', 'location', 'phases', 'strategy', 'quote'];

  if (boss.is_duo) {
    const duoRequiredFields: (keyof Boss)[] = [
      ...baseRequiredFields,
      'common_name',
      'name',
      'name_2', 'description_2', 'health_2', 'image_url_2', 'quote_2'
    ];
    for (const field of duoRequiredFields) {
      if (!boss[field]) return true;
    }
  } else {
    const singleRequiredFields: (keyof Boss)[] = [...baseRequiredFields, 'name'];
    for (const field of singleRequiredFields) {
      if (!boss[field]) return true;
    }
  }
  return false;
};


export function BossesPage({ searchQuery }: BossesPageProps) {
  const [bosses, setBosses] = useState<Boss[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedFloor, setSelectedFloor] = useState("Todos los pisos")
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBoss, setEditingBoss] = useState<Partial<Boss> | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile2, setImageFile2] = useState<File | null>(null)
  const [imagePreview2, setImagePreview2] = useState<string | null>(null)
  const [isDuo, setIsDuo] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => { fetchBosses() }, [])

  const fetchBosses = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("bosses").select("*").order("name")
    if (error) setError(error.message)
    else setBosses(data || [])
  }

  const handleCardClick = (boss: Boss) => { setSelectedBoss(boss); setIsDetailOpen(true) }
  const handleAddNew = () => {
    setEditingBoss({ name: "", location: "", description: "", health: "", phases: "", attacks: "", strategy: "", notes: "", common_name: "", common_health: "", image_url: null, quote: "", is_duo: false, name_2: "", image_url_2: null, description_2: "", quote_2: "", health_2: "", })
    setIsDuo(false); setImageFile(null); setImagePreview(null); setImageFile2(null); setImagePreview2(null); setIsEditOpen(true)
  }
  const handleEdit = (boss: Boss) => {
    setEditingBoss(boss); setIsDuo(!!boss.is_duo); setImageFile(null); setImagePreview(boss.image_url); setImageFile2(null); setImagePreview2(boss.image_url_2); setIsEditOpen(true)
  }
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file) } }
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (editingBoss) setEditingBoss({ ...editingBoss, image_url: null }) }
  const handleImageChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile2(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview2(reader.result as string); reader.readAsDataURL(file) } }
  const handleRemoveImage2 = () => { setImageFile2(null); setImagePreview2(null); if (editingBoss) setEditingBoss({ ...editingBoss, image_url_2: null }) }
  
  const handleSave = async () => {
    if (!editingBoss) return
    if ((!isDuo && !editingBoss.name) || (isDuo && !editingBoss.common_name)) return

    setIsSaving(true)
    const supabase = createClient()
    try {
      let imageUrl = editingBoss.image_url
      let imageUrl2 = editingBoss.image_url_2
      if (imageFile) { const formData = new FormData(); formData.append("file", imageFile); imageUrl = await uploadImage(formData) }
      if (imageFile2) { const formData = new FormData(); formData.append("file", imageFile2); imageUrl2 = await uploadImage(formData) }

      const bossData: Partial<Boss> = { ...editingBoss, image_url: imageUrl, is_duo: isDuo }

      if (isDuo) {
        bossData.image_url_2 = imageUrl2
      } else {
        bossData.name_2 = null; bossData.image_url_2 = null; bossData.description_2 = null; bossData.quote_2 = null; bossData.health_2 = null;
        bossData.common_name = null; bossData.common_health = null;
      }
      
      if (editingBoss.id) { const { error } = await supabase.from("bosses").update(bossData).eq("id", editingBoss.id); if (error) throw error }
      else { const { error } = await supabase.from("bosses").insert([bossData]); if (error) throw error }
      
      await fetchBosses()
      setIsEditOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando el jefe")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => { if (confirm("¿Estás seguro de que quieres eliminar este jefe?")) { const supabase = createClient(); const { error } = await supabase.from("bosses").delete().eq("id", id); if (error) setError(error.message); else await fetchBosses() } }
  
  const filteredBosses = bosses.filter((boss) => {
    const floorMatch = selectedFloor === "Todos los pisos" || boss.location === selectedFloor
    const nameToSearch = boss.is_duo ? boss.common_name : boss.name
    const searchMatch = nameToSearch?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    return floorMatch && searchMatch
  })

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div><h2 className="text-3xl font-bold text-foreground mb-2">Jefes</h2><p className="text-muted-foreground">Guía completa para todos los jefes de Enter The Gungeon.</p></div>
        <Button onClick={handleAddNew} className="gap-2"><Plus className="w-4 h-4" />Añadir Jefe</Button>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {floors.map((floor) => (<Button key={floor} variant={selectedFloor === floor ? "default" : "secondary"} onClick={() => setSelectedFloor(floor)}>{floor}</Button>))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBosses.map((boss) => {
          const isIncomplete = isBossDataIncomplete(boss);
          return (
            <Card key={boss.id} onClick={() => handleCardClick(boss)} className="cursor-pointer hover:shadow-lg transition-shadow group relative flex flex-col">
              {isIncomplete && (
                <div className="absolute top-2 left-2 z-10" title="Faltan datos en esta entrada">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" />
                </div>
              )}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(boss); }}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(boss.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
              <CardHeader>
                {boss.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={boss.image_url} alt={boss.name || boss.common_name || "Jefe"} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
                <div className="flex justify-between items-start">
                  <CardTitle>{boss.is_duo ? boss.common_name : boss.name}</CardTitle>
                  {boss.location && <Badge variant="secondary">{boss.location}</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{boss.description || ""}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {filteredBosses.length === 0 && !error && ( <div className="text-center py-12"><p className="text-muted-foreground">No hay jefes que coincidan con tu búsqueda.</p></div> )}
      {error && ( <div className="text-center py-12"><p className="text-destructive">Error cargando jefes: {error}</p></div> )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedBoss && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedBoss.is_duo ? selectedBoss.common_name : selectedBoss.name}</DialogTitle>
                {!selectedBoss.is_duo && selectedBoss.quote && <DialogDescription className="italic text-base">"{selectedBoss.quote}"</DialogDescription>}
                <p className="text-base text-muted-foreground pt-2">{selectedBoss.location || ""}</p>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {selectedBoss.is_duo && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-xl pt-2">Detalles de {selectedBoss.name || "Entidad 1"}</h3>
                    {selectedBoss.quote && <p className="italic text-muted-foreground">"{selectedBoss.quote}"</p>}
                    {selectedBoss.image_url && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={selectedBoss.image_url} alt={selectedBoss.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}
                    {selectedBoss.description && <p className="text-base">{selectedBoss.description}</p>}
                  </div>
                )}
                {selectedBoss.is_duo && (
                  <><Separator /><div className="space-y-4">
                    <h3 className="font-semibold text-xl pt-2">Detalles de {selectedBoss.name_2 || "Entidad 2"}</h3>
                    {selectedBoss.quote_2 && <p className="italic text-muted-foreground">"{selectedBoss.quote_2}"</p>}
                    {selectedBoss.image_url_2 && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={selectedBoss.image_url_2} alt={`${selectedBoss.name_2}`} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}
                    {selectedBoss.description_2 && <p className="text-base">{selectedBoss.description_2}</p>}
                  </div></>
                )}
                {!selectedBoss.is_duo && selectedBoss.image_url && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={selectedBoss.image_url} alt={selectedBoss.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}
                <Separator />
                <h3 className="font-semibold text-xl">Estadísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {selectedBoss.is_duo && selectedBoss.common_health && <div><p className="text-muted-foreground">Vida Total</p><p className="font-mono">{selectedBoss.common_health}</p></div>}
                  <div><p className="text-muted-foreground">Vida {selectedBoss.is_duo ? `(${selectedBoss.name || "Ent. 1"})` : ""}</p><p className="font-mono">{selectedBoss.health || "N/A"}</p></div>
                  {selectedBoss.is_duo && selectedBoss.health_2 && <div><p className="text-muted-foreground">Vida ({selectedBoss.name_2 || "Ent. 2"})</p><p className="font-mono">{selectedBoss.health_2}</p></div>}
                  <div><p className="text-muted-foreground">Fases</p><p className="font-mono">{selectedBoss.phases || "N/A"}</p></div>
                </div>
                {!selectedBoss.is_duo && selectedBoss.description && <div><h4 className="font-semibold mb-2">Descripción</h4><p className="text-base">{selectedBoss.description}</p></div>}
                {selectedBoss.attacks && <div><h4 className="font-semibold mb-2">Patrones de Ataque</h4><p className="text-base whitespace-pre-line">{selectedBoss.attacks}</p></div>}
                {selectedBoss.strategy && <div><h4 className="font-semibold mb-2">Estrategia</h4><p className="text-base whitespace-pre-line">{selectedBoss.strategy}</p></div>}
                {selectedBoss.notes && <div><h4 className="font-semibold mb-2">Notas</h4><p className="text-base whitespace-pre-line">{selectedBoss.notes}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBoss?.id ? "Editar Jefe" : "Añadir Nuevo Jefe"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2"><Checkbox id="isDuo" checked={isDuo} onCheckedChange={(checked) => setIsDuo(Boolean(checked))} /><Label htmlFor="isDuo" className="font-medium">Este jefe es un dúo</Label></div>
            <Separator />
            {isDuo ? (
              <>
                <h4 className="font-semibold text-lg pt-2">Datos Comunes del Dúo</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="common_name">Nombre del Dúo *</Label><Input id="common_name" value={editingBoss?.common_name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, common_name: e.target.value })} required /></div>
                  <div><Label htmlFor="location">Piso</Label><Input id="location" value={editingBoss?.location || ""} onChange={(e) => setEditingBoss({ ...editingBoss, location: e.target.value })} /></div>
                  <div><Label htmlFor="common_health">Vida Total (Opcional)</Label><Input id="common_health" value={editingBoss?.common_health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, common_health: e.target.value })} /></div>
                </div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Primera Entidad</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Nombre Individual 1</Label><Input id="name" value={editingBoss?.name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })} /></div>
                  <div><Label htmlFor="health">Vida Individual 1</Label><Input id="health" value={editingBoss?.health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="quote">Frase Icónica 1</Label><Input id="quote" value={editingBoss?.quote || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote: e.target.value })} /></div>
                <div><Label>Imagen 1</Label><div className="mt-2 space-y-4">{imagePreview ? <div className="relative"><div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-4"><img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div> : <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground mb-2">Sube una imagen</p><Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" /></div>}</div></div>
                <div><Label htmlFor="description">Descripción 1</Label><Textarea id="description" value={editingBoss?.description || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description: e.target.value })} rows={3} /></div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Segunda Entidad</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="name_2">Nombre Individual 2</Label><Input id="name_2" value={editingBoss?.name_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name_2: e.target.value })} /></div>
                  <div><Label htmlFor="health_2">Vida Individual 2</Label><Input id="health_2" value={editingBoss?.health_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health_2: e.target.value })} /></div>
                </div>
                <div><Label htmlFor="quote_2">Frase Icónica 2</Label><Input id="quote_2" value={editingBoss?.quote_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote_2: e.target.value })} /></div>
                <div><Label>Imagen 2</Label><div className="mt-2 space-y-4">{imagePreview2 ? <div className="relative"><div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-4"><img src={imagePreview2} alt="Preview 2" className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage2}><X className="h-4 w-4" /></Button></div> : <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground mb-2">Sube una imagen</p><Input type="file" accept="image/*" onChange={handleImageChange2} className="max-w-xs mx-auto" /></div>}</div></div>
                <div><Label htmlFor="description_2">Descripción 2</Label><Textarea id="description_2" value={editingBoss?.description_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description_2: e.target.value })} rows={3} /></div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Estrategia y Notas Comunes</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div><Label htmlFor="phases">Fases</Label><Input id="phases" value={editingBoss?.phases || ""} onChange={(e) => setEditingBoss({ ...editingBoss, phases: e.target.value })} /></div>
                  <div><Label htmlFor="attacks">Patrones de Ataque</Label><Textarea id="attacks" value={editingBoss?.attacks || ""} onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })} rows={4} /></div>
                  <div><Label htmlFor="strategy">Estrategia</Label><Textarea id="strategy" value={editingBoss?.strategy || ""} onChange={(e) => setEditingBoss({ ...editingBoss, strategy: e.target.value })} rows={4} /></div>
                  <div><Label htmlFor="notes">Notas</Label><Textarea id="notes" value={editingBoss?.notes || ""} onChange={(e) => setEditingBoss({ ...editingBoss, notes: e.target.value })} rows={3} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="name">Nombre *</Label><Input id="name" value={editingBoss?.name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })} required /></div>
                  <div><Label htmlFor="location">Piso</Label><Input id="location" value={editingBoss?.location || ""} onChange={(e) => setEditingBoss({ ...editingBoss, location: e.target.value })} /></div>
                  <div><Label htmlFor="health">Vida</Label><Input id="health" value={editingBoss?.health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health: e.target.value })} /></div>
                </div>
                {/* --- LÍNEA CORREGIDA --- */}
                <div><Label htmlFor="quote">Frase Icónica</Label><Input id="quote" value={editingBoss?.quote || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote: e.target.value })} /></div>
                <div><Label>Imagen</Label><div className="mt-2 space-y-4">{imagePreview ? <div className="relative"><div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-4"><img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div> : <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground mb-2">Sube una imagen</p><Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" /></div>}</div></div>
                <div><Label htmlFor="description">Descripción</Label><Textarea id="description" value={editingBoss?.description || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description: e.target.value })} rows={3} /></div>
                <div className="grid grid-cols-1 gap-4">
                  <div><Label htmlFor="phases">Fases</Label><Input id="phases" value={editingBoss?.phases || ""} onChange={(e) => setEditingBoss({ ...editingBoss, phases: e.target.value })} /></div>
                  <div><Label htmlFor="attacks">Patrones de Ataque</Label><Textarea id="attacks" value={editingBoss?.attacks || ""} onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })} rows={4} /></div>
                  <div><Label htmlFor="strategy">Estrategia</Label><Textarea id="strategy" value={editingBoss?.strategy || ""} onChange={(e) => setEditingBoss({ ...editingBoss, strategy: e.target.value })} rows={4} /></div>
                  <div><Label htmlFor="notes">Notas</Label><Textarea id="notes" value={editingBoss?.notes || ""} onChange={(e) => setEditingBoss({ ...editingBoss, notes: e.target.value })} rows={3} /></div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button><Button onClick={handleSave} disabled={isSaving || (!isDuo && !editingBoss?.name) || (isDuo && !editingBoss?.common_name)}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
