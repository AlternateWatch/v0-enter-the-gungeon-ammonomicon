"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X } from "lucide-react"
import { put } from "@vercel/blob"

interface Field {
  name: string
  label: string
  type: "text" | "textarea" | "number" | "image"
  placeholder?: string
  required?: boolean
}

interface EntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Record<string, string>) => void
  title: string
  fields: Field[]
}

export function EntryModal({ isOpen, onClose, onSave, title, fields }: EntryModalProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    setFormData({})
    setImagePreview(null)
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Vercel Blob
    setIsUploading(true)
    try {
      const blob = await put(file.name, file, {
        access: "public",
      })
      handleChange(fieldName, blob.url)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Error al subir la imagen. Por favor intenta de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (fieldName: string) => {
    setImagePreview(null)
    handleChange(fieldName, "")
  }

  const handleClose = () => {
    setFormData({})
    setImagePreview(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Fill in the details below to add a new entry to the Ammonomicon.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === "image" ? (
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden border-2 border-border">
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
                          onClick={() => handleRemoveImage(field.name)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor={field.name}
                          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click para subir</span> o arrastra y suelta
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF o WEBP</p>
                          </div>
                          <Input
                            id={field.name}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, field.name)}
                            required={field.required}
                            disabled={isUploading}
                          />
                        </label>
                      </div>
                    )}
                    {isUploading && <p className="text-sm text-muted-foreground text-center">Subiendo imagen...</p>}
                  </div>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    rows={4}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "Subiendo..." : "Save Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
