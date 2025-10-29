"use client"
import type { Boss } from "@/context/DataContext";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { WikiLinkRenderer } from "@/components/WikiLinkRenderer";

export const BossDetails = ({ item: boss }: { item: Boss }) => (
  <>
    <DialogHeader>
      <DialogTitle className="text-2xl">{boss.is_duo ? boss.common_name : boss.name}</DialogTitle>
      {!boss.is_duo && boss.quote && <DialogDescription className="italic text-base">"{boss.quote}"</DialogDescription>}
      <p className="text-base text-muted-foreground pt-2">{boss.location || ""}</p>
    </DialogHeader>
    <div className="space-y-6 py-4">
      {boss.is_duo && <div className="space-y-4"><h3 className="font-semibold text-xl pt-2">Detalles de {boss.name || "Entidad 1"}</h3>{boss.quote && <p className="italic text-muted-foreground">"{boss.quote}"</p>}{boss.image_url && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={boss.image_url} alt={boss.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}{boss.description && <div className="text-base"><WikiLinkRenderer text={boss.description} /></div>}</div>}
      {boss.is_duo && <><Separator /><div className="space-y-4"><h3 className="font-semibold text-xl pt-2">Detalles de {boss.name_2 || "Entidad 2"}</h3>{boss.quote_2 && <p className="italic text-muted-foreground">"{boss.quote_2}"</p>}{boss.image_url_2 && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={boss.image_url_2} alt={`${boss.name_2}`} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}{boss.description_2 && <div className="text-base"><WikiLinkRenderer text={boss.description_2} /></div>}</div></>}
      {!boss.is_duo && boss.image_url && <div className="w-full h-64 bg-muted rounded-lg flex items-center justify-center p-8"><img src={boss.image_url} alt={boss.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }}/></div>}
      <Separator />
      <h3 className="font-semibold text-xl">Estadísticas</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">{item.is_duo && item.common_health && <div><p className="text-muted-foreground">Vida Total</p><p className="font-mono">{item.common_health}</p></div>}<div><p className="text-muted-foreground">Vida {item.is_duo ? `(${item.name || "Ent. 1"})` : ""}</p><p className="font-mono">{item.health || "N/A"}</p></div>{item.is_duo && item.health_2 && <div><p className="text-muted-foreground">Vida ({item.name_2 || "Ent. 2"})</p><p className="font-mono">{item.health_2}</p></div>}<div><p className="text-muted-foreground">Fases</p><p className="font-mono">{item.phases || "N/A"}</p></div></div>
      {!boss.is_duo && boss.description && <div><h4 className="font-semibold mb-2">Descripción</h4><div className="text-base"><WikiLinkRenderer text={boss.description} /></div></div>}
      {boss.attacks && <div><h4 className="font-semibold mb-2">Patrones de Ataque</h4><div className="text-base whitespace-pre-wrap"><WikiLinkRenderer text={boss.attacks} /></div></div>}
      {boss.strategy && <div><h4 className="font-semibold mb-2">Estrategia</h4><div className="text-base whitespace-pre-wrap"><WikiLinkRenderer text={boss.strategy} /></div></div>}
      {boss.notes && <div><h4 className="font-semibold mb-2">Notas</h4><div className="text-base whitespace-pre-wrap"><WikiLinkRenderer text={boss.notes} /></div></div>}
    </div>
  </>
);
