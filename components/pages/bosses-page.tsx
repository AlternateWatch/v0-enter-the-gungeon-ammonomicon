"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface BossesPageProps {
  searchQuery: string
}

// 1. Definimos la estructura de datos para un Jefe
interface Boss {
  id: string
  name: string
  floor: string | null
  difficulty: string | null
  description: string | null
  health: string | null
  phases: string | null
  attacks: string | null
  // Si tienes una columna para imagen, descomenta la siguiente línea
  // image_url: string | null
}

export function BossesPage({ searchQuery }: BossesPageProps) {
  // 2. Añadimos todos los estados necesarios, como en GunsPage
  const [bosses, setBosses] = useState<Boss[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingBoss, setEditingBoss] = useState<Partial<Boss> | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 3. Obtenemos los datos de Supabase cuando el componente se carga
  useEffect(() => {
    fetchBosses()
  }, [])

  const fetchBosses = async () => {
    const supabase = createClient()
    // Asegúrate de que tu tabla se llama "bosses"
    const { data, error } = await supabase.from("bosses").select("*").order("name")

    if (error) {
      setError(error.message)
    } else {
      setBosses(data || [])
    }
  }

  // 4. Funciones para abrir los modales de "Añadir" y "Editar"
  const handleAddNew = () => {
    setEditingBoss({
      name: "",
      floor: "",
      difficulty: "",
      description: "",
      health: "",
      phases: "",
      attacks: "",
    })
    setIsEditOpen(true)
  }

  const handleEdit = (boss: Boss) => {
    setEditingBoss(boss)
    setIsEditOpen(true)
  }

  // 5. Función para guardar (crear o actualizar) un jefe
  const handleSave = async () => {
    if (!editingBoss?.name) return

    setIsSaving(true)
    const supabase = createClient()

    try {
      const bossData = { ...editingBoss }

      if (editingBoss.id) {
        // Actualizar un jefe existente
        const { error } = await supabase.from("bosses").update(bossData).eq("id", editingBoss.id)
        if (error) throw error
      } else {
        // Insertar un nuevo jefe
        const { error } = await supabase.from("bosses").insert([bossData])
        if (error) throw error
      }

      await fetchBosses() // Refrescar la lista
      setIsEditOpen(false)
      setEditingBoss(null)
    } catch (err) {
      console.error("Error guardando el jefe:", err)
      setError(err instanceof Error ? err.message : "Error guardando el jefe")
    } finally {
      setIsSaving(false)
    }
  }

  // 6. Función para eliminar un jefe
  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este jefe?")) return

    const supabase = createClient()
    const { error } = await supabase.from("bosses").delete().eq("id", id)

    if (error) {
      setError(error.message)
    } else {
      await fetchBosses() // Refrescar la lista
    }
  }

  const filteredBosses = bosses.filter((boss) => boss.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Jefes</h2>
          <p className="text-muted-foreground">Guía completa para todos los jefes de Enter The Gungeon.</p>
        </div>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Añadir Jefe
        </Button>
      </div>

      {/* 7. Actualizamos el grid para mostrar los datos de Supabase y los botones de acción */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBosses.map((boss) => (
          <Card key={boss.id} className="hover:shadow-lg transition-shadow group relative">
            {/* Botones de Editar y Borrar que aparecen al pasar el ratón */}
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

            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl">{boss.name}</CardTitle>
                {boss.difficulty && (
                  <Badge variant={boss.difficulty.toLowerCase() === "hard" ? "destructive" : "secondary"}>
                    {boss.difficulty}
                  </Badge>
                )}
              </div>
              <CardDescription>{boss.floor}</CardDescription>
            </CardHeader>
            <CardContent>
              {boss.description && <p className="text-sm text-muted-foreground mb-4">{boss.description}</p>}
              <div className="space-y-3 text-sm">
                {boss.health && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vida:</span>
                    <span className="font-mono">{boss.health}</span>
                  </div>
                )}
                {boss.phases && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fases:</span>
                    <span className="font-mono">{boss.phases}</span>
                  </div>
                )}
                {boss.attacks && (
                  <div className="pt-2">
                    <span className="text-muted-foreground block mb-1">Patrones de Ataque:</span>
                    <p className="text-sm whitespace-pre-line">{boss.attacks}</p>
                  </div>
                )}
              </div>
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

      {/* 8. Añadimos el Dialog/Modal para editar y crear, igual que en GunsPage */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBoss?.id ? "Editar Jefe" : "Añadir Nuevo Jefe"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
                <Label htmlFor="floor">Piso</Label>
                <Input
                  id="floor"
                  value={editingBoss?.floor || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, floor: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Dificultad</Label>
                <Input
                  id="difficulty"
                  value={editingBoss?.difficulty || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, difficulty: e.target.value })}
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
                <Label htmlFor="phases">Fases</Label>
                <Input
                  id="phases"
                  value={editingBoss?.phases || ""}
                  onChange={(e) => setEditingBoss({ ...editingBoss, phases: e.target.value })}
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
              <Label htmlFor="attacks">Patrones de Ataque</Label>
              <Textarea
                id="attacks"
                value={editingBoss?.attacks || ""}
                onChange={(e) => setEditingBoss({ ...editingBoss, attacks: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !editingBoss?.name}>
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
