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
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"
import { useData, Gun } from "@/context/DataContext"

interface GunsPageProps {
  searchQuery: string
}

const isGunDataIncomplete = (gun: Gun): boolean => {
  const requiredFields: (keyof Gun)[] = [ 'name', 'type', 'quality', 'class', 'magazine_size', 'max_ammo', 'reload_time', 'damage', 'dps', 'fire_rate', 'quote', 'description', 'synergies', 'image_url', 'shot_speed', 'range', 'force', 'spread', 'sell_price' ];
  for (const field of requiredFields) { if (gun[field] === null || gun[field] === '') return true; }
  return false;
};

// --- AÑADIDO: Lista de calidades para los botones de filtro ---
const qualities = ["Todas", "Inicial", "D", "C", "B", "A", "S"];

export function GunsPage({ searchQuery }: GunsPageProps) {
  const { allData, openDetailsModal, forceRefetch } = useData();
  const [localGuns, setLocalGuns] = useState<Gun[]>([]);
  useEffect(() => { setLocalGuns(allData.guns || []); }, [allData.guns]);

  // --- AÑADIDO: Estado para el filtro de calidad ---
  const [selectedQuality, setSelectedQuality] = useState("Todas");

  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGun, setEditingGun] = useState<Partial<Gun> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCardClick = (gun: Gun) => { openDetailsModal(gun, 'guns'); }
  const handleAddNew = () => { setEditingGun({ name: "", type: "", quality: "", class: "", magazine_size: null, max_ammo: null, reload_time: null, dps: "", damage: "", fire_rate: "", shot_speed: "", range: "", force: "", spread: "", sell_price: "", quote: "", description: "", synergies: "", notes: "", image_url: null, }); setImageFile(null); setImagePreview(null); setIsEditOpen(true); }
  const handleEdit = (gun: Gun) => { setEditingGun(gun); setImageFile(null); setImagePreview(gun.image_url); setIsEditOpen(true); }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string); }; reader.readAsDataURL(file); } }
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (editingGun) { setEditingGun({ ...editingGun, image_url: null }); } }
  
  const handleSave = async () => { if (!editingGun?.name) return; setIsSaving(true); setError(null); const supabase = createClient(); try { let imageUrl = editingGun.image_url; if (imageFile) { const formData = new FormData(); formData.append("file", imageFile); imageUrl = await uploadImage(formData); } const gunData = { ...editingGun, image_url: imageUrl, magazine_size: editingGun.magazine_size || null, max_ammo: editingGun.max_ammo || null, reload_time: editingGun.reload_time || null, }; if (editingGun.id) { await supabase.from("guns").update(gunData).eq("id", editingGun.id).throwOnError(); } else { await supabase.from("guns").insert([gunData]).throwOnError(); } await forceRefetch(); setIsEditOpen(false); } catch (err) { setError(err instanceof Error ? err.message : "Error al guardar el arma."); } finally { setIsSaving(false); } }
  const handleDelete = async (id: string) => { if (confirm("¿Estás seguro?")) { const supabase = createClient(); try { await supabase.from("guns").delete().eq("id", id).throwOnError(); await forceRefetch(); } catch (err) { setError(err instanceof Error ? err.message : "Error"); } } }
  
  // --- LÓGICA DE FILTRADO ACTUALIZADA ---
  const filteredGuns = localGuns.filter((gun) => {
    const qualityMatch = selectedQuality === "Todas" || gun.quality === selectedQuality;
    const searchMatch = gun.name.toLowerCase().includes(searchQuery.toLowerCase());
    return qualityMatch && searchMatch;
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between"><div><h2 className="text-3xl font-bold text-foreground mb-2">Armas</h2><p className="text-muted-foreground">Arsenal completo de todas las armas.</p></div><Button onClick={handleAddNew} className="gap-2"><Plus className="h-4 w-4" />Añadir Arma</Button></div>
      
      {/* --- BOTONES DE FILTRO AÑADIDOS --- */}
      <div className="mb-6 flex flex-wrap gap-2">
        {qualities.map((quality) => (
          <Button
            key={quality}
            variant={selectedQuality === quality ? "default" : "secondary"}
            onClick={() => setSelectedQuality(quality)}
          >
            {quality === "Todas" ? "Todas" : `${quality}`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGuns.map((gun) => {
          const isIncomplete = isGunDataIncomplete(gun);
          return (
            <Card key={gun.id} onClick={() => handleCardClick(gun)} className="cursor-pointer hover:shadow-lg transition-shadow group relative">
              {isIncomplete && (<div className="absolute top-2 left-2 z-10" title="Faltan datos"><AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" /></div>)}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(gun) }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(gun.id) }}><Trash2 className="h-4 w-4" /></Button></div>
              <CardHeader>
                {gun.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={gun.image_url} alt={gun.name} className="w-32 h-auto object-contain" style={{ imageRendering: "pixelated" }} /></div>}
                <div className="flex items-start justify-between"><CardTitle className="text-lg">{gun.name}</CardTitle>{gun.quality && <Badge variant={gun.quality === "S" ? "default" : "secondary"}>{gun.quality}</Badge>}</div>
                {gun.type && <CardDescription>{gun.type}</CardDescription>}
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground line-clamp-2">{gun.description}</p></CardContent>
            </Card>
          );
        })}
      </div>
      {error && (<div className="text-center py-12"><p className="text-destructive">Error: {error}</p></div>)}
      
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingGun?.id ? "Editar Arma" : "Añadir Arma"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Imagen</Label><div className="mt-2 space-y-4">{imagePreview ? ( <div className="relative"><div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8"><img src={imagePreview} alt="Preview" className="w-80 h-auto object-contain" style={{ imageRendering: "pixelated" }} /></div><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div>) : ( <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center"><Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground mb-2">Sube una imagen</p><Input type="file" accept="image/*" onChange={handleImageChange} className="max-w-xs mx-auto" /></div>)}</div></div>
            <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="name">Nombre *</Label><Input id="name" value={editingGun?.name || ""} onChange={(e) => setEditingGun({ ...editingGun, name: e.target.value })} required /></div><div><Label htmlFor="type">Tipo</Label><Input id="type" value={editingGun?.type || ""} onChange={(e) => setEditingGun({ ...editingGun, type: e.target.value })} /></div><div><Label htmlFor="quality">Calidad</Label><Input id="quality" value={editingGun?.quality || ""} onChange={(e) => setEditingGun({ ...editingGun, quality: e.target.value })} /></div><div><Label htmlFor="class">Clase</Label><Input id="class" value={editingGun?.class || ""} onChange={(e) => setEditingGun({ ...editingGun, class: e.target.value })} /></div></div>
            <div><Label htmlFor="quote">Frase</Label><Input id="quote" value={editingGun?.quote || ""} onChange={(e) => setEditingGun({ ...editingGun, quote: e.target.value })} /></div>
            <div><Label htmlFor="description">Descripción</Label><Textarea id="description" value={editingGun?.description || ""} onChange={(e) => setEditingGun({ ...editingGun, description: e.target.value })} rows={3} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="magazine_size">Cargador</Label><Input id="magazine_size" value={editingGun?.magazine_size || ""} onChange={(e) => setEditingGun({ ...editingGun, magazine_size: e.target.value })} /></div>
              <div><Label htmlFor="max_ammo">Munición Máx.</Label><Input id="max_ammo" value={editingGun?.max_ammo || ""} onChange={(e) => setEditingGun({ ...editingGun, max_ammo: e.target.value })} /></div>
              <div><Label htmlFor="reload_time">Recarga (s)</Label><Input id="reload_time" value={editingGun?.reload_time || ""} onChange={(e) => setEditingGun({ ...editingGun, reload_time: e.target.value })} /></div>
              <div><Label htmlFor="damage">Daño</Label><Input id="damage" value={editingGun?.damage || ""} onChange={(e) => setEditingGun({ ...editingGun, damage: e.target.value })} /></div>
              <div><Label htmlFor="dps">DPS</Label><Input id="dps" value={editingGun?.dps || ""} onChange={(e) => setEditingGun({ ...editingGun, dps: e.target.value })} /></div>
              <div><Label htmlFor="fire_rate">Cadencia</Label><Input id="fire_rate" value={editingGun?.fire_rate || ""} onChange={(e) => setEditingGun({ ...editingGun, fire_rate: e.target.value })} /></div>
              <div><Label htmlFor="shot_speed">Vel. Disparo</Label><Input id="shot_speed" value={editingGun?.shot_speed || ""} onChange={(e) => setEditingGun({ ...editingGun, shot_speed: e.target.value })} /></div>
              <div><Label htmlFor="range">Alcance</Label><Input id="range" value={editingGun?.range || ""} onChange={(e) => setEditingGun({ ...editingGun, range: e.target.value })} /></div>
              <div><Label htmlFor="force">Fuerza</Label><Input id="force" value={editingGun?.force || ""} onChange={(e) => setEditingGun({ ...editingGun, force: e.target.value })} /></div>
              <div><Label htmlFor="spread">Dispersión</Label><Input id="spread" value={editingGun?.spread || ""} onChange={(e) => setEditingGun({ ...editingGun, spread: e.target.value })} /></div>
              <div><Label htmlFor="sell_price">Precio Venta</Label><Input id="sell_price" value={editingGun?.sell_price || ""} onChange={(e) => setEditingGun({ ...editingGun, sell_price: e.target.value })} /></div>
            </div>
            <div><Label htmlFor="synergies">Sinergias</Label><Textarea id="synergies" value={editingGun?.synergies || ""} onChange={(e) => setEditingGun({ ...editingGun, synergies: e.target.value })} rows={3} /></div>
            <div><Label htmlFor="notes">Notas</Label><Textarea id="notes" value={editingGun?.notes || ""} onChange={(e) => setEditingGun({ ...editingGun, notes: e.target.value })} rows={3} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button><Button onClick={handleSave} disabled={isSaving || !editingGun?.name}>{isSaving ? "Guardando..." : "Guardar"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
