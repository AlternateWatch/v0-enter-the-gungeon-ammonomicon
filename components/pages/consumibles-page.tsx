"use client"
import { useState, useEffect } from "react";
import { useData, Consumible } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function ConsumiblesPage() {
  const { allData, openDetailsModal } = useData();
  const [localConsumibles, setLocalConsumibles] = useState<Consumible[]>([]);

  useEffect(() => { setLocalConsumibles(allData.consumibles || []); }, [allData.consumibles]);

  const handleCardClick = (consumible: Consumible) => { openDetailsModal(consumible, 'consumibles'); }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Consumibles</h2>
        <p className="text-muted-foreground">Objetos de un solo uso como llaves, corazones y munición.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localConsumibles.map((consumible) => (
          <Card key={consumible.id} onClick={() => handleCardClick(consumible)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {consumible.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={consumible.image_url} alt={consumible.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{consumible.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{consumible.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
