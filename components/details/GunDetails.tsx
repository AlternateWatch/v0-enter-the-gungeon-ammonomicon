"use client"

import type { Gun } from "@/context/DataContext";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { WikiLinkRenderer } from "@/components/WikiLinkRenderer";
import { Badge } from "@/components/ui/badge";

export const GunDetails = ({ item: gun }: { item: Gun }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-2xl">{gun.name}</DialogTitle>
        {gun.quote && <DialogDescription className="italic text-base">"{gun.quote}"</DialogDescription>}
      </DialogHeader>
      <div className="space-y-6 py-4">
        {gun.image_url && (
          <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center p-8">
            <img src={gun.image_url} alt={gun.name} className="w-80 h-auto object-contain" style={{ imageRendering: "pixelated" }} />
          </div>
        )}

        {/* --- Información Básica --- */}
        <div className="grid grid-cols-2 gap-4">
          {gun.type && <div><p className="text-sm text-muted-foreground">Tipo</p><p className="font-medium">{gun.type}</p></div>}
          {gun.quality && <div><p className="text-sm text-muted-foreground">Calidad</p><Badge variant={gun.quality === "S" ? "default" : "secondary"}>{gun.quality}</Badge></div>}
          {gun.class && <div><p className="text-sm text-muted-foreground">Clase</p><p className="font-medium">{gun.class}</p></div>}
          {gun.sell_price && <div><p className="text-sm text-muted-foreground">Precio de Venta</p><p className="font-medium">{gun.sell_price}</p></div>}
        </div>

        {gun.description && (
          <div>
            <h4 className="font-semibold mb-2">Descripción</h4>
            <div className="text-base">
              <WikiLinkRenderer text={gun.description} />
            </div>
          </div>
        )}

        {/* --- Sección de Estadísticas (RESTAURADA) --- */}
        <div>
          <h3 className="font-semibold mb-3">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            {gun.magazine_size && <div><p className="text-muted-foreground">Cargador</p><p className="font-mono">{gun.magazine_size}</p></div>}
            {gun.max_ammo && <div><p className="text-muted-foreground">Munición Máx.</p><p className="font-mono">{gun.max_ammo}</p></div>}
            {gun.reload_time && <div><p className="text-muted-foreground">Recarga (s)</p><p className="font-mono">{gun.reload_time}</p></div>}
            {gun.damage && <div><p className="text-muted-foreground">Daño</p><p className="font-mono">{gun.damage}</p></div>}
            {gun.dps && <div><p className="text-muted-foreground">DPS</p><p className="font-mono">{gun.dps}</p></div>}
            {gun.fire_rate && <div><p className="text-muted-foreground">Cadencia</p><p className="font-mono">{gun.fire_rate}</p></div>}
            {gun.shot_speed && <div><p className="text-muted-foreground">Vel. Disparo</p><p className="font-mono">{gun.shot_speed}</p></div>}
            {gun.range && <div><p className="text-muted-foreground">Alcance</p><p className="font-mono">{gun.range}</p></div>}
            {gun.force && <div><p className="text-muted-foreground">Fuerza</p><p className="font-mono">{gun.force}</p></div>}
            {gun.spread && <div><p className="text-muted-foreground">Dispersión</p><p className="font-mono">{gun.spread}</p></div>}
          </div>
        </div>

        {/* --- Sinergias y Notas (RESTAURADAS) --- */}
        {gun.synergies && (
          <div>
            <h4 className="font-semibold mb-2">Sinergias</h4>
            <div className="text-base whitespace-pre-line">
              <WikiLinkRenderer text={gun.synergies} />
            </div>
          </div>
        )}
        
        {gun.notes && (
          <div>
            <h4 className="font-semibold mb-2">Notas</h4>
            <div className="text-base whitespace-pre-line">
              <WikiLinkRenderer text={gun.notes} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};
