"use client"
import type { Npc } from "@/context/DataContext"; 
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { WikiLinkRenderer } from "@/components/WikiLinkRenderer";

export const NpcDetails = ({ item }: { item: Npc }) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-2xl">{item.name}</DialogTitle>
      {item.quote && <DialogDescription className="italic text-base">"{item.quote}"</DialogDescription>}
    </DialogHeader>
    <div className="py-4 text-base">
      {item.image_url && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8 mb-4"><img src={item.image_url} alt={item.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}
      {item.description ? <WikiLinkRenderer text={item.description} /> : <p>No hay descripción disponible.</p>}
    </div>
  </>
);
