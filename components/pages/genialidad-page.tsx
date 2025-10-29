"use client"
import { useState, useEffect } from "react";
import { useData, TextPage } from "@/context/DataContext";
import { WikiLinkRenderer } from "@/components/WikiLinkRenderer";

export function GenialidadPage() {
  const { allData } = useData();
  const [pageContent, setPageContent] = useState<TextPage | null>(null);

  useEffect(() => {
    const pageData = (allData.genialidad || [])[0];
    if (pageData) {
      setPageContent(pageData);
    }
  }, [allData.genialidad]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {pageContent ? (
        <article className="prose dark:prose-invert">
          <h1>{pageContent.page_name}</h1>
          <WikiLinkRenderer text={pageContent.content} />
        </article>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
