import Prism from "prismjs";
import { useEffect } from "react";

import "./code-theme.css";

interface Props {
  code: string;
  language: string;
}

export const CodeView: React.FC<Props> = ({ code, language }) => {
  useEffect(() => {
    (async () => {
      // @ts-expect-error: ignore
      await import("prismjs/components/prism-javascript");
      // @ts-expect-error: ignore
      await import("prismjs/components/prism-jsx");
      // @ts-expect-error: ignore
      await import("prismjs/components/prism-typescript");
      // @ts-expect-error: ignore
      await import("prismjs/components/prism-tsx");
      // @ts-expect-error: ignore
      await import("prismjs/components/prism-python");
      Prism.highlightAll();
    })();
  }, [code]);

  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
};
