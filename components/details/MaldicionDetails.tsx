"use client"
import type { TextPage } from "@/context/DataContext"; 
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { WikiLinkRenderer } from "@/components/WikiLinkRenderer";

export const MaldicionDetails = ({ item }: { item: TextPage }) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-2xl">{item.page_name}</DialogTitle>
    </DialogHeader>
    <div className="py-4 text-base">
      {item.content ? <WikiLinkRenderer text={item.content} /> : <p>No hay contenido disponible.</p>}
    </div>
  </>
);
