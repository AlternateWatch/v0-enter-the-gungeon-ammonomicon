"use client"
import { useState, useEffect } from "react";
import { useData, Item } from "@/context/DataContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ItemsPageProps { searchQuery: string; }

export function ItemsPage({ searchQuery }: ItemsPageProps) {
  const { allData, openDetailsModal } = useData();
  const [localItems, setLocalItems] = useState<Item[]>([]);

  useEffect(() => { setLocalItems(allData.items || []); }, [allData.items]);

  const handleCardClick = (item: Item) => { openDetailsModal(item, 'items'); }

  const filteredItems = localItems.filter((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Objetos</h2>
        <p className="text-muted-foreground">Todos los objetos pasivos y activos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} onClick={() => handleCardClick(item)} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              {item.image_url && <div className="w-full h-40 mb-4 bg-muted rounded-lg flex items-center justify-center p-4"><img src={item.image_url} alt={item.name || ""} className="max-h-full max-w-full object-contain" style={{ imageRendering: "pixelated" }} /></div>}
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground line-clamp-3">{item.description || ""}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
