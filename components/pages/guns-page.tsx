"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"
import { useData, Gun } from "@/context/DataContext"

interface GunsPageProps {
  searchQuery: string
}

export function GunsPage({ searchQuery }: GunsPageProps) {
  const { allData, openDetailsModal, forceRefetch } = useData();
  const [localGuns, setLocalGuns] = useState<Gun[]>([]);

  useEffect(() => { setLocalGuns(allData.guns || []); }, [allData.guns]);

  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGun, setEditingGun] = useState<Partial<Gun> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCardClick = (gun: Gun) => { openDetailsModal(gun, 'guns'); }
  const handleAddNew = () => {
    setEditingGun({ name: "", type: "", quality: "", class: "", magazine_size: null, max_ammo: null, reload_time: null, dps: "", damage: "", fire_rate: "", shot_speed: "", range: "", force: "", spread: "", sell_price: "", quote: "", description: "", synergies: "", notes: "", image_url: null, });
    setImageFile(null); setImagePreview(null); setIsEditOpen(true);
  }
  const handleEdit = (gun: Gun) => { setEditingGun(gun); setImageFile(null); setImagePreview(gun.image_url); setIsEditOpen(true); }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); } }
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (editingGun) { setEditingGun({ ...editingGun, image_url: null }); } }
  
  const handleSave = async () => {
    if (!editingGun?.name) return;
    setIsSaving(true);
    const supabase = createClient();
    try {
      let imageUrl = editingGun.image_url;
      if (imageFile) { const formData = new FormData(); formData.append("file", imageFile); imageUrl = await uploadImage(formData); }
      const gunData = { ...editingGun, image_url: imageUrl, };
      if (editingGun.id) {
        await supabase.from("guns").update(gunData).eq("id", editingGun.id).throwOnError();
      } else {
        await supabase.from("guns").insert([gunData]).throwOnError();
      }
      await forceRefetch();
      setIsEditOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving gun");
    } finally {
      setIsSaving(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro?")) {
      const supabase = createClient();
      try {
        await supabase.from("guns").delete().eq("id", id).throwOnError();
        await forceRefetch();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error");
      }
    }
  }
  
  const filteredGuns = localGuns.filter((gun) => gun.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-3xl font-bold text-foreground mb-2">Armas</h2><p className="text-muted-foreground">Arsenal completo de todas las armas.</p></div><Button onClick={handleAddNew} className="gap-2"><Plus className="h-4 w-4" />Añadir Arma</Button></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGuns.map((gun) => (
          <Card key={gun.id} onClick={() => handleCardClick(gun)} className="cursor-pointer hover:shadow-lg transition-shadow group relative">
             <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(gun) }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(gun.id) }}><Trash2 className="h-4 w-4" /></Button></div>
            <CardHeader>
              {gun.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={gun.image_url} alt={gun.name} className="w-32 h-auto object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <div className="flex items-start justify-between"><CardTitle className="text-lg">{gun.name}</CardTitle>{gun.quality && <Badge variant={gun.quality === "S" ? "default" : "secondary"}>{gun.quality}</Badge>}</div>
              {gun.type && <CardDescription>{gun.type}</CardDescription>}
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{gun.description}</p></CardContent>
          </Card>
        ))}
      </div>
      {filteredGuns.length === 0 && !error && (<div className="text-center py-12"><p className="text-muted-foreground">No hay armas que coincidan.</p></div>)}
      {error && (<div className="text-center py-12"><p className="text-destructive">Error: {error}</p></div>)}
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingGun?.id ? "Editar Arma" : "Añadir Arma"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Imagen</Label><div className="mt-2">{imagePreview ? ( <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-96 object-contain bg-muted rounded-lg" style={{ imageRendering: "pixelated" }}/><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div>) : ( <Input type="file" accept="image/*" onChange={handleImageChange} />)}</div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label>Nombre *</Label><Input value={editingGun?.name || ""} onChange={(e) => setEditingGun({ ...editingGun, name: e.target.value })} required /></div><div><Label>Tipo</Label><Input value={editingGun?.type || ""} onChange={(e) => setEditingGun({ ...editingGun, type: e.target.value })} /></div><div><Label>Calidad</Label><Input value={editingGun?.quality || ""} onChange={(e) => setEditingGun({ ...editingGun, quality: e.target.value })} /></div><div><Label>Clase</Label><Input value={editingGun?.class || ""} onChange={(e) => setEditingGun({ ...editingGun, class: e.target.value })} /></div></div>
            <div><Label>Frase</Label><Input value={editingGun?.quote || ""} onChange={(e) => setEditingGun({ ...editingGun, quote: e.target.value })} /></div>
            <div><Label>Descripción</Label><Textarea value={editingGun?.description || ""} onChange={(e) => setEditingGun({ ...editingGun, description: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4"><div><Label>Cargador</Label><Input type="number" value={editingGun?.magazine_size || ""} onChange={(e) => setEditingGun({ ...editingGun, magazine_size: Number(e.target.value) })} /></div><div><Label>Munición Máx.</Label><Input type="number" value={editingGun?.max_ammo || ""} onChange={(e) => setEditingGun({ ...editingGun, max_ammo: Number(e.target.value) })} /></div><div><Label>Recarga (s)</Label><Input type="number" step="0.1" value={editingGun?.reload_time || ""} onChange={(e) => setEditingGun({ ...editingGun, reload_time: Number(e.target.value) })} /></div><div><Label>Daño</Label><Input value={editingGun?.damage || ""} onChange={(e) => setEditingGun({ ...editingGun, damage: e.target.value })} /></div><div><Label>DPS</Label><Input value={editingGun?.dps || ""} onChange={(e) => setEditingGun({ ...editingGun, dps: e.target.value })} /></div><div><Label>Cadencia</Label><Input value={editingGun?.fire_rate || ""} onChange={(e) => setEditingGun({ ...editingGun, fire_rate: e.target.value })} /></div></div>
            <div><Label>Sinergias</Label><Textarea value={editingGun?.synergies || ""} onChange={(e) => setEditingGun({ ...editingGun, synergies: e.target.value })} /></div>
            <div><Label>Notas</Label><Textarea value={editingGun?.notes || ""} onChange={(e) => setEditingGun({ ...editingGun, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button><Button onClick={handleSave} disabled={isSaving || !editingGun?.name}>{isSaving ? "Guardando..." : "Guardar"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
