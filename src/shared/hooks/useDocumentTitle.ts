import { useEffect } from "react";

/** Título da aba descreve a página atual (WCAG 2.4.2). */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} · HAE Fatec`;
  }, [title]);
}
