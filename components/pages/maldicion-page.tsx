"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Save } from "lucide-react"

export function MaldicionPage() {
  const [content, setContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState("")

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    const { data, error } = await supabase.from("text_pages").select("content").eq("page_name", "maldicion").single()

    if (error) {
      console.error("Error fetching content:", error)
    } else if (data) {
      setContent(data.content || "")
      setEditedContent(data.content || "")
    }
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase.from("text_pages").upsert({
        page_name: "maldicion",
        content: editedContent,
      })

      if (error) throw error

      setContent(editedContent)
      setIsEditing(false)
    } catch (error: any) {
      console.error("Error saving content:", error)
      alert(`Error saving content: ${error.message}`)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Maldición</h2>
          <p className="text-muted-foreground">Mecánica de maldición en Enter the Gungeon</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2 w-fit">
            <Pencil className="h-4 w-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2 w-fit">
            <Button
              variant="outline"
              onClick={() => {
                setEditedContent(content)
                setIsEditing(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <div className="bg-card border rounded-lg p-6">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Escribe aquí la explicación de la mecánica de maldición..."
            rows={20}
            className="font-mono w-full"
          />
        ) : (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {content ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <p className="text-muted-foreground italic">
                No hay contenido aún. Haz clic en "Editar" para añadir información sobre la mecánica de maldición.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
