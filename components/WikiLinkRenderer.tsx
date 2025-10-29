"use client"

import { parseWikiLinks } from "@/lib/wiki-parser";
import { useData } from "@/context/DataContext";

interface WikiLinkRendererProps {
  text: string | null | undefined;
}

export function WikiLinkRenderer({ text }: WikiLinkRendererProps) {
  const { isLoading, lookupTable, openDetailsModal } = useData();

  if (!text) return null;

  if (isLoading) {
    return <>{text}</>;
  }

  const tokens = parseWikiLinks(text);

  // --- MICRÓFONO 3.1 ---
  console.log(`[Renderer] Para el texto: "${text.substring(0, 50)}..."`);
  // ----------------------

  const handleLinkClick = (itemName: string) => {
    const lowerCaseItemName = itemName.toLowerCase();
    const linkData = lookupTable.get(lowerCaseItemName);
    if (linkData) {
      openDetailsModal(linkData.data, linkData.type);
    }
  };

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === 'link') {
          const lowerCaseContent = token.content.toLowerCase();
          const linkData = lookupTable.get(lowerCaseContent);

          // --- MICRÓFONO 3.2 (EL DECISIVO) ---
          console.log(` > Buscando en el índice la clave: "${lowerCaseContent}". ¿Encontrado?:`, !!linkData);
          // ------------------------------------

          if (linkData) {
            return (
              <button key={index} onClick={() => handleLinkClick(token.content)}
                className="text-blue-500 hover:underline inline p-0 m-0 bg-transparent border-none cursor-pointer font-medium">
                {token.content}
              </button>
            );
          }
        }
        return <span key={index}>{token.type === 'link' ? `:${token.content}:` : token.content}</span>;
      })}
    </>
  );
}
