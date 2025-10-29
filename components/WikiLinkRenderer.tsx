"use client"

import { parseWikiLinks } from "@/lib/wiki-parser";
import { useData } from "@/context/DataContext";

interface WikiLinkRendererProps {
  text: string | null | undefined;
}

export function WikiLinkRenderer({ text }: WikiLinkRendererProps) {
  // Usamos nuestro "Índice Maestro" para acceder a la tabla de búsqueda y la función de abrir el pop-up
  const { lookupTable, openDetailsModal } = useData();

  // Si no hay texto, no mostramos nada.
  if (!text) {
    return null;
  }

  // 1. Le pedimos a nuestro "Buscador" que divida el texto en trozos
  const tokens = parseWikiLinks(text);

  // 2. Definimos qué hacer cuando alguien hace clic en un enlace
  const handleLinkClick = (itemName: string) => {
    const lowerCaseItemName = itemName.toLowerCase();
    // Buscamos la palabra en nuestra tabla de búsqueda
    const linkData = lookupTable.get(lowerCaseItemName);
    if (linkData) {
      // Si la encontramos, llamamos a la función central para abrir el pop-up
      openDetailsModal(linkData.data, linkData.type);
    }
  };

  return (
    <>
      {/* 3. Recorremos los trozos de texto y los "dibujamos" */}
      {tokens.map((token, index) => {
        const linkData = lookupTable.get(token.content.toLowerCase());

        // Si el trozo es un 'link' Y existe en nuestra tabla de búsqueda...
        if (token.type === 'link' && linkData) {
          // ...lo dibujamos como un botón azul clicable.
          return (
            <button
              key={index}
              onClick={() => handleLinkClick(token.content)}
              className="text-blue-500 hover:underline inline p-0 m-0 bg-transparent border-none cursor-pointer font-medium"
            >
              {token.content}
            </button>
          );
        }

        // Si es texto normal, o un enlace que no existe, lo dibujamos como texto simple.
        // Si el enlace no existe, le devolvemos los dos puntos para que el usuario vea que está mal escrito.
        return <span key={index}>{token.type === 'link' ? `:${token.content}:` : token.content}</span>;
      })}
    </>
  );
}
