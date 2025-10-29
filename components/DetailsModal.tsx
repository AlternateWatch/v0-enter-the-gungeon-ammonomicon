"use client"

import { useData } from "@/context/DataContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { detailsRegistry } from "@/lib/details-registry";

export function DetailsModal() {
  const { modalContent, closeDetailsModal } = useData();

  const renderContent = () => {
    if (!modalContent) return null;

    // 1. Busca la plantilla correcta en nuestro "Índice de Archivadores"
    const ComponentToRender = detailsRegistry[modalContent.type];

    if (ComponentToRender) {
      // 2. Si la encuentra, la usa para "dibujar" los datos
      return <ComponentToRender item={modalContent.data} />;
    }

    // 3. Si no, muestra un mensaje de error (esto no debería pasar si todo está bien configurado)
    return <div>No se encontró una plantilla de detalles para la categoría "{modalContent.type}".</div>;
  };

  return (
    <Dialog open={!!modalContent} onOpenChange={closeDetailsModal}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
