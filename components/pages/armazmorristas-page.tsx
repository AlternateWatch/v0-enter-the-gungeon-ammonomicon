"use client"
import { useState, useEffect } from "react";
import { useData, Gungeoneer } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ArmazmorristasPageProps { searchQuery: string; }

export function ArmazmorrristasPage({ searchQuery }: ArmazmorristasPageProps) {
  const { allData, openDetailsModal } = useData();
  const [localGungeoneers, setLocalGungeoneers] = useState<Gungeoneer[]>([]);

  useEffect(() => { setLocalGungeoneers(allData.gungeoneers || []); }, [allData.gungeoneers]);

  const handleCardClick = (gungeoneer: Gungeoneer) => { openDetailsModal(gungeoneer, 'gungeoneers'); }

  const filteredGungeoneers = localGungeoneers.filter((gungeoneer) => gungeoneer.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Armazmorristas</h2>
        <p className="text-muted-foreground">Los personajes jugables de Enter the Gungeon.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGungeoneers.map((gungeoneer) => (
          <Card key={gungeoneer.id} onClick={() => handleCardClick(gungeoneer)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {gungeoneer.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={gungeoneer.image_url} alt={gungeoneer.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{gungeoneer.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{gungeoneer.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
