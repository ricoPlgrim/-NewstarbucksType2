import { useEffect, useMemo, useRef, useState } from "react";

type CodeBlockProps = {
  code: string;
  language?: "tsx" | "typescript" | "javascript" | "json" | "scss" | "css" | "bash" | "html";
};

const CodeBlock = ({ code, language = "tsx" }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement | null>(null);
  const [copied, setCopied] = useState(false);

  // (옵션) 너무 자주 highlight 돌리는거 방지용 키
  const highlightKey = useMemo(() => `${language}:${code.length}`, [language, code]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!codeRef.current) return;

      // ✅ highlight.js core만 로드
      const hljs = (await import("highlight.js/lib/core")).default;

      // ✅ 필요한 언어만 골라 등록 (너 프로젝트 기준으로 필요한 것만 남겨)
      const lang = language;

      if (lang === "tsx" || lang === "typescript") {
        const ts = (await import("highlight.js/lib/languages/typescript")).default;
        hljs.registerLanguage("typescript", ts);

        // tsx를 별도로 쓰고 싶으면 xml/jsx 계열도 등록해야 하는데
        // 실무에선 tsx도 typescript로만 하이라이트 돌려도 충분히 괜찮음.
      } else if (lang === "javascript") {
        const js = (await import("highlight.js/lib/languages/javascript")).default;
        hljs.registerLanguage("javascript", js);
      } else if (lang === "json") {
        const json = (await import("highlight.js/lib/languages/json")).default;
        hljs.registerLanguage("json", json);
      } else if (lang === "scss") {
        const scss = (await import("highlight.js/lib/languages/scss")).default;
        hljs.registerLanguage("scss", scss);
      } else if (lang === "css") {
        const css = (await import("highlight.js/lib/languages/css")).default;
        hljs.registerLanguage("css", css);
      } else if (lang === "bash") {
        const bash = (await import("highlight.js/lib/languages/bash")).default;
        hljs.registerLanguage("bash", bash);
      } else if (lang === "html") {
        const xml = (await import("highlight.js/lib/languages/xml")).default;
        hljs.registerLanguage("xml", xml);
      }

      // ✅ 스타일도 필요할 때만 로드 (guide에서만)
      await import("highlight.js/styles/vs2015.css");

      if (!mounted || !codeRef.current) return;

      // language 클래스는 highlight.js가 인식 가능한 값으로
      // tsx는 typescript로 매핑 (가벼운 선택)
      const classLang =
        lang === "tsx" ? "typescript" : lang === "html" ? "xml" : lang;

      codeRef.current.className = `language-${classLang}`;

      // ✅ 실제 하이라이트 적용
      hljs.highlightElement(codeRef.current);
    })();

    return () => {
      mounted = false;
    };
  }, [highlightKey, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = code;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="guide-section__code-wrapper">
      <button
        className="guide-section__copy-button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : "Copy code"}
        title={copied ? "Copied!" : "Copy code"}
        type="button"
      >
        {copied ? (
          <>
            {/* ...svg 그대로... */}
            <span>Copied</span>
          </>
        ) : (
          <>
            {/* ...svg 그대로... */}
            <span>Copy</span>
          </>
        )}
      </button>

      <pre className="guide-section__code-pre">
        <code ref={codeRef}>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
