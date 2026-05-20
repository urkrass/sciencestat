import katex from "katex";

type MathExpressionProps = {
  math: string;
  displayMode?: boolean;
  className?: string;
};

export function MathExpression({
  math,
  displayMode = false,
  className
}: MathExpressionProps) {
  const html = katex.renderToString(math, {
    displayMode,
    throwOnError: false,
    strict: "ignore"
  });
  const Component = displayMode ? "div" : "span";

  return (
    <Component
      className={["simulation-math", className].filter(Boolean).join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
