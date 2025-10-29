"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2, Upload, X, AlertTriangle } from "lucide-react"
import { uploadImage } from "@/app/actions/upload-image"
import { useData, Boss } from "@/context/DataContext"

interface BossesPageProps {
  searchQuery: string
}

const floors = [
  "Todos los pisos", "Fortaleza del Señor del Plomo", "Armazmorra en Sí", "Mina de Pólvora", "Hondanada", "Forja",
  "Infierno de las Balas", "Calabozo", "Abadía del Arma Verdadera", "Guarida de la Rata", "Departamento de I+D", "Pasado",
]

const isBossDataIncomplete = (boss: Boss): boolean => {
  const baseRequiredFields: (keyof Boss)[] = ['attacks', 'description', 'health', 'image_url', 'location', 'phases', 'strategy', 'quote'];
  if (boss.is_duo) {
    const duoRequiredFields: (keyof Boss)[] = [...baseRequiredFields, 'common_name', 'name', 'name_2', 'description_2', 'health_2', 'image_url_2', 'quote_2'];
    for (const field of duoRequiredFields) { if (!boss[field]) return true; }
  } else {
    const singleRequiredFields: (keyof Boss)[] = [...baseRequiredFields, 'name'];
    for (const field of singleRequiredFields) { if (!boss[field]) return true; }
  }
  return false;
};

export function BossesPage({ searchQuery }: BossesPageProps) {
  const { allData, openDetailsModal, forceRefetch } = useData();
  const [localBosses, setLocalBosses] = useState<Boss[]>([]);
  useEffect(() => { setLocalBosses(allData.bosses || []); }, [allData.bosses]);

  const [error, setError] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState("Todos los pisos");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBoss, setEditingBoss] = useState<Partial<Boss> | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile2, setImageFile2] = useState<File | null>(null);
  const [imagePreview2, setImagePreview2] = useState<string | null>(null);
  const [isDuo, setIsDuo] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCardClick = (boss: Boss) => { openDetailsModal(boss, 'bosses'); }
  const handleAddNew = () => { setEditingBoss({ name: "", location: "", description: "", health: "", phases: "", attacks: "", strategy: "", notes: "", common_name: "", common_health: "", image_url: null, quote: "", is_duo: false, name_2: "", image_url_2: null, description_2: "", quote_2: "", health_2: "" }); setIsDuo(false); setImageFile(null); setImagePreview(null); setImageFile2(null); setImagePreview2(null); setIsEditOpen(true); }
  const handleEdit = (boss: Boss) => { setEditingBoss(boss); setIsDuo(!!boss.is_duo); setImageFile(null); setImagePreview(boss.image_url); setImageFile2(null); setImagePreview2(boss.image_url_2); setIsEditOpen(true); }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview(reader.result as string); reader.readAsDataURL(file) } }
  const handleRemoveImage = () => { setImageFile(null); setImagePreview(null); if (editingBoss) setEditingBoss({ ...editingBoss, image_url: null }) }
  const handleImageChange2 = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) { setImageFile2(file); const reader = new FileReader(); reader.onloadend = () => setImagePreview2(reader.result as string); reader.readAsDataURL(file) } }
  const handleRemoveImage2 = () => { setImageFile2(null); setImagePreview2(null); if (editingBoss) setEditingBoss({ ...editingBoss, image_url_2: null }) }
  
  const handleSave = async () => {
    if (!editingBoss) return;
    if ((!isDuo && !editingBoss.name) || (isDuo && !editingBoss.common_name)) return;
    setIsSaving(true);
    const supabase = createClient();
    try {
      let imageUrl = editingBoss.image_url, imageUrl2 = editingBoss.image_url_2;
      if (imageFile) { const fd = new FormData(); fd.append("file", imageFile); imageUrl = await uploadImage(fd); }
      if (imageFile2) { const fd = new FormData(); fd.append("file", imageFile2); imageUrl2 = await uploadImage(fd); }
      const bossData: Partial<Boss> = { ...editingBoss, image_url: imageUrl, is_duo: isDuo };
      if (isDuo) { bossData.image_url_2 = imageUrl2; } else { Object.assign(bossData, { name_2: null, image_url_2: null, description_2: null, quote_2: null, health_2: null, common_name: null, common_health: null }); }
      if (editingBoss.id) { await supabase.from("bosses").update(bossData).eq("id", editingBoss.id).throwOnError(); }
      else { await supabase.from("bosses").insert([bossData]).throwOnError(); }
      await forceRefetch();
      setIsEditOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setIsSaving(false); }
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro?")) {
      const supabase = createClient();
      try {
        await supabase.from("bosses").delete().eq("id", id).throwOnError();
        await forceRefetch();
      } catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    }
  }
  
  const filteredBosses = localBosses.filter((boss) => { const floorMatch = selectedFloor === "Todos los pisos" || boss.location === selectedFloor; const nameToSearch = boss.is_duo ? boss.common_name : boss.name; const searchMatch = nameToSearch?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false; return floorMatch && searchMatch; });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between"><div><h2 className="text-3xl font-bold text-foreground mb-2">Jefes</h2><p className="text-muted-foreground">Guía completa de todos los jefes.</p></div><Button onClick={handleAddNew} className="gap-2"><Plus className="w-4 h-4" />Añadir Jefe</Button></div>
      <div className="mb-6 flex flex-wrap gap-2">{floors.map((floor) => (<Button key={floor} variant={selectedFloor === floor ? "default" : "secondary"} onClick={() => setSelectedFloor(floor)}>{floor}</Button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBosses.map((boss) => {
          const isIncomplete = isBossDataIncomplete(boss);
          return (
            <Card key={boss.id} onClick={() => handleCardClick(boss)} className="cursor-pointer hover:shadow-lg transition-shadow group relative flex flex-col">
              {isIncomplete && (<div className="absolute top-2 left-2 z-10" title="Faltan datos en esta entrada"><AlertTriangle className="h-5 w-5 text-yellow-500 fill-yellow-500/20" /></div>)}
              <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><Button size="icon" variant="secondary" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(boss); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleDelete(boss.id); }}><Trash2 className="h-4 w-4" /></Button></div>
              <CardHeader>{boss.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={boss.image_url} alt={boss.name || boss.common_name || "Jefe"} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}<div className="flex justify-between items-start"><CardTitle>{boss.is_duo ? boss.common_name : boss.name}</CardTitle>{boss.location && <Badge variant="secondary">{boss.location}</Badge>}</div></CardHeader>
              <CardContent className="flex-grow"><p className="text-sm text-muted-foreground line-clamp-3">{boss.description || ""}</p></CardContent>
            </Card>
          );
        })}
      </div>
      {filteredBosses.length === 0 && !error && (<div className="text-center py-12"><p className="text-muted-foreground">No hay jefes que coincidan.</p></div>)}
      {error && (<div className="text-center py-12"><p className="text-destructive">Error: {error}</p></div>)}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingBoss?.id ? "Editar Jefe" : "Añadir Jefe"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2"><Checkbox id="isDuo" checked={isDuo} onCheckedChange={(c) => setIsDuo(Boolean(c))} /><Label htmlFor="isDuo" className="font-medium">Es un dúo</Label></div>
            <Separator />
            {isDuo ? (
              <>
                <h4 className="font-semibold text-lg pt-2">Datos Comunes</h4>
                <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="common_name">Nombre Dúo *</Label><Input id="common_name" value={editingBoss?.common_name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, common_name: e.target.value })} required /></div><div><Label>Piso</Label><Input value={editingBoss?.location || ""} onChange={(e) => setEditingBoss({ ...editingBoss, location: e.target.value })} /></div><div><Label>Vida Total</Label><Input value={editingBoss?.common_health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, common_health: e.target.value })} /></div></div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Entidad 1</h4>
                <div className="grid grid-cols-2 gap-4"><div><Label>Nombre 1</Label><Input value={editingBoss?.name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })} /></div><div><Label>Vida 1</Label><Input value={editingBoss?.health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health: e.target.value })} /></div></div>
                <div><Label>Frase 1</Label><Input value={editingBoss?.quote || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote: e.target.value })} /></div>
                <div><Label>Imagen 1</Label><div className="mt-2">{imagePreview ? <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-64 object-contain bg-muted rounded-lg" style={{ imageRendering: "pixelated" }} /><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div> : <Input type="file" accept="image/*" onChange={handleImageChange} />}</div></div>
                <div><Label>Descripción 1</Label><Textarea value={editingBoss?.description || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description: e.target.value })} /></div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Entidad 2</h4>
                <div className="grid grid-cols-2 gap-4"><div><Label>Nombre 2</Label><Input value={editingBoss?.name_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name_2: e.target.value })} /></div><div><Label>Vida 2</Label><Input value={editingBoss?.health_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health_2: e.target.value })} /></div></div>
                <div><Label>Frase 2</Label><Input value={editingBoss?.quote_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote_2: e.target.value })} /></div>
                <div><Label>Imagen 2</Label><div className="mt-2">{imagePreview2 ? <div className="relative"><img src={imagePreview2} alt="Preview 2" className="w-full h-64 object-contain bg-muted rounded-lg" style={{ imageRendering: "pixelated" }}/><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage2}><X className="h-4 w-4" /></Button></div> : <Input type="file" accept="image/*" onChange={handleImageChange2} />}</div></div>
                <div><Label>Descripción 2</Label><Textarea value={editingBoss?.description_2 || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description_2: e.target.value })} /></div>
                <Separator className="my-6" /><h4 className="font-semibold text-lg">Notas Comunes</h4>
                <div><Label>Fases</Label><Input value={editingBoss?.phases || ""} onChange={(e) => setEditingBoss({ ...editingBoss, phases: e.target.value })} /></div>
                <div><Label>Ataques</Label><Textarea value={editingBoss?.attacks || ""} onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })} /></div>
                <div><Label>Estrategia</Label><Textarea value={editingBoss?.strategy || ""} onChange={(e) => setEditingBoss({ ...editingBoss, strategy: e.target.value })} /></div>
                <div><Label>Notas</Label><Textarea value={editingBoss?.notes || ""} onChange={(e) => setEditingBoss({ ...editingBoss, notes: e.target.value })} /></div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4"><div><Label>Nombre *</Label><Input value={editingBoss?.name || ""} onChange={(e) => setEditingBoss({ ...editingBoss, name: e.target.value })} required /></div><div><Label>Piso</Label><Input value={editingBoss?.location || ""} onChange={(e) => setEditingBoss({ ...editingBoss, location: e.target.value })} /></div><div><Label>Vida</Label><Input value={editingBoss?.health || ""} onChange={(e) => setEditingBoss({ ...editingBoss, health: e.target.value })} /></div></div>
                <div><Label>Frase</Label><Input value={editingBoss?.quote || ""} onChange={(e) => setEditingBoss({ ...editingBoss, quote: e.target.value })} /></div>
                <div><Label>Imagen</Label><div className="mt-2">{imagePreview ? <div className="relative"><img src={imagePreview} alt="Preview" className="w-full h-64 object-contain bg-muted rounded-lg" style={{ imageRendering: "pixelated" }}/><Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={handleRemoveImage}><X className="h-4 w-4" /></Button></div> : <Input type="file" accept="image/*" onChange={handleImageChange} />}</div></div>
                <div><Label>Descripción</Label><Textarea value={editingBoss?.description || ""} onChange={(e) => setEditingBoss({ ...editingBoss, description: e.target.value })} /></div>
                <div><Label>Fases</Label><Input value={editingBoss?.phases || ""} onChange={(e) => setEditingBoss({ ...editingBoss, phases: e.target.value })} /></div>
                <div><Label>Ataques</Label><Textarea value={editingBoss?.attacks || ""} onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })} /></div>
                <div><Label>Estrategia</Label><Textarea value={editingBoss?.strategy || ""} onChange={(e) => setEditingBoss({ ...editingBoss, strategy: e.target.value })} /></div>
                <div><Label>Notas</Label><Textarea value={editingBoss?.notes || ""} onChange={(e) => setEditingBoss({ ...editingBoss, notes: e.target.value })} /></div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-4"><Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancelar</Button><Button onClick={handleSave} disabled={isSaving || (!isDuo && !editingBoss?.name) || (isDuo && !editingBoss?.common_name)}>{isSaving ? "Guardando..." : "Guardar"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
