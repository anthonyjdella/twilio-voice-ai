"use client";

import type { ContentBlock, StepDefinition } from "@/lib/content-blocks";
import { useAudienceMode } from "@/lib/AudienceContext";
import { renderMarkdown } from "@/lib/markdown";
import { SectionHeader, Prose } from "./Prose";
import { CodeBlock } from "./CodeBlock";
import { Terminal } from "./Terminal";
import { Callout } from "./Callout";
import { DeepDive } from "./DeepDive";
import { ShowSolution } from "./ShowSolution";
import { JsonMessage } from "./JsonMessage";
import { DiffView } from "./DiffView";
import { Verify } from "./Verify";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { VisualStep } from "./VisualStep";
import { ConceptCard } from "./ConceptCard";

interface StepRendererProps {
  step: StepDefinition;
  chapterId?: number;
  stepId?: number;
  onVerifySuccess?: () => void;
}

export function StepRenderer({ step, onVerifySuccess }: StepRendererProps) {
  const { mode } = useAudienceMode();

  return (
    <>
      {step.blocks.map((block, i) => {
        if (block.audience && block.audience !== mode) return null;
        return (
          <BlockRenderer
            key={`${block.type}-${i}`}
            block={block}
            onVerifySuccess={onVerifySuccess}
          />
        );
      })}
    </>
  );
}

function BlockRenderer({ block, onVerifySuccess }: { block: ContentBlock; onVerifySuccess?: () => void }) {
  switch (block.type) {
    case "section":
      return <SectionHeader>{block.title}</SectionHeader>;

    case "prose":
      return <Prose>{renderMarkdown(block.content)}</Prose>;

    case "code":
      return (
        <CodeBlock
          code={block.code}
          language={block.language}
          file={block.file}
          startLine={block.startLine}
          showLineNumbers={block.showLineNumbers}
        />
      );

    case "terminal":
      return <Terminal commands={block.commands} />;

    case "callout":
      return (
        <Callout type={block.variant}>{renderMarkdown(block.content)}</Callout>
      );

    case "deep-dive":
      return (
        <DeepDive title={block.title}>
          <p>{renderMarkdown(block.content)}</p>
        </DeepDive>
      );

    case "solution":
      return (
        <ShowSolution
          code={block.code}
          file={block.file}
          language={block.language}
          explanation={block.explanation}
        />
      );

    case "json-message":
      return (
        <JsonMessage
          direction={block.direction}
          type={block.messageType}
          code={block.code}
        />
      );

    case "verify":
      return <Verify question={block.question} onSuccess={onVerifySuccess} />;

    case "diagram":
      return (
        <ArchitectureDiagram
          highlight={block.highlight}
          showTools={block.highlight === "tools" || block.highlight === "all" || block.highlight === "complete"}
          showHandoff={block.highlight === "handoff" || block.highlight === "complete"}
        />
      );

    case "image":
      return (
        <figure className="mb-6">
          <div className="rounded-xl overflow-hidden border border-navy-border">
            <img src={block.src} alt={block.alt} className="w-full h-auto" />
          </div>
          {block.caption && (
            <figcaption className="text-xs text-text-muted mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "visual-step":
      return <VisualStep steps={block.steps} />;

    case "concept-card":
      return (
        <ConceptCard
          title={block.title}
          content={block.content}
          illustration={block.illustration}
        />
      );

    case "diff":
      return (
        <DiffView
          file={block.file || ""}
          lines={parseDiffString(block.code)}
        />
      );

    case "spacer":
      return <div className="h-6" />;

    default:
      return null;
  }
}

/** Parse a unified diff string into DiffView's lines format */
function parseDiffString(
  code: string
): { type: "add" | "remove" | "context"; content: string }[] {
  return code.split("\n").map((line) => {
    if (line.startsWith("+")) {
      return { type: "add", content: line.slice(1) };
    }
    if (line.startsWith("-")) {
      return { type: "remove", content: line.slice(1) };
    }
    return { type: "context", content: line.startsWith(" ") ? line.slice(1) : line };
  });
}
