export interface WikiLinkToken {
  type: 'text' | 'link';
  content: string;
}

export function parseWikiLinks(text: string): WikiLinkToken[] {
  if (!text) {
    return [];
  }

  // --- LA REGLA CORREGIDA Y DEFINITIVA CON SOPORTE UNICODE ---
  // Explicación:
  // (\p{L}) -> Busca cualquier letra de cualquier idioma (incluyendo á, é, í, ó, ú, ñ, Ü, etc.).
  // (u) -> Es una "bandera" que activa el modo Unicode para que \p{L} funcione.
  const regex = /(^|\s):([\p{L}0-9\s\-.']+):/gu;
  
  const tokens: WikiLinkToken[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Texto antes del enlace
    const precedingText = text.substring(lastIndex, match.index);
    if (precedingText) {
      tokens.push({ type: 'text', content: precedingText });
    }

    // El espacio que precede al enlace, si lo hay
    if (match[1]) {
      tokens.push({ type: 'text', content: match[1] });
    }
    
    // El enlace en sí
    tokens.push({ type: 'link', content: match[2].trim() });

    lastIndex = regex.lastIndex;
  }

  // El resto del texto al final
  if (lastIndex < text.length) {
    tokens.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return tokens;
}
