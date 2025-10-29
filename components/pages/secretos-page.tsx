"use client"
import { useState, useEffect } from "react";
import { useData, Secreto } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export function SecretosPage() {
  const { allData, openDetailsModal } = useData();
  const [localSecretos, setLocalSecretos] = useState<Secreto[]>([]);

  useEffect(() => { setLocalSecretos(allData.secretos || []); }, [allData.secretos]);

  const handleCardClick = (secreto: Secreto) => { openDetailsModal(secreto, 'secretos'); }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Secretos</h2>
        <p className="text-muted-foreground">Misterios y zonas ocultas de la Armazmorra.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {localSecretos.map((secreto) => (
          <Card key={secreto.id} onClick={() => handleCardClick(secreto)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {secreto.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={secreto.image_url} alt={secreto.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{secreto.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{secreto.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
