"use client"
import { useState, useEffect } from "react";
import { useData, Altar } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function AltaresPage() {
  const { allData, openDetailsModal } = useData();
  const [localAltares, setLocalAltares] = useState<Altar[]>([]);

  useEffect(() => { setLocalAltares(allData.altares || []); }, [allData.altares]);

  const handleCardClick = (altar: Altar) => { openDetailsModal(altar, 'altares'); }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Altares</h2>
        <p className="text-muted-foreground">Santuarios especiales que se encuentran en la Armazmorra.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localAltares.map((altar) => (
          <Card key={altar.id} onClick={() => handleCardClick(altar)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {altar.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={altar.image_url} alt={altar.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{altar.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{altar.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
