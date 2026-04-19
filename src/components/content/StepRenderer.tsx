"use client";

import type { ContentBlock } from "@/lib/content-blocks";
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
import { CallMe } from "@/components/CallMe";
import { AgentConfig } from "./AgentConfig";
import { VoicePicker } from "./VoicePicker";
import { LanguagePicker } from "./LanguagePicker";
import { BuilderOnly } from "./BuilderOnly";

interface StepRendererProps {
  blocks: ContentBlock[];
  chapterId?: number;
  stepId?: number;
  onVerifySuccess?: () => void;
}

export function StepRenderer({ blocks, onVerifySuccess }: StepRendererProps) {
  return (
    <>
      {blocks.map((block, i) => (
        <BlockRenderer
          key={`${block.type}-${i}`}
          block={block}
          onVerifySuccess={onVerifySuccess}
        />
      ))}
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
          highlight={block.highlight}
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
      return <Verify question={block.question} troubleshooting={block.troubleshooting} onSuccess={onVerifySuccess} />;

    case "diagram":
      return (
        <ArchitectureDiagram
          highlight={block.highlight}
          showTools={block.showTools ?? (block.highlight === "tools" || block.highlight === "all" || block.highlight === "complete")}
          showHandoff={block.showHandoff ?? (block.highlight === "handoff" || block.highlight === "complete")}
        />
      );

    case "image": {
      const sizeClass =
        block.size === "sm"
          ? "max-w-xs"
          : block.size === "md"
            ? "max-w-sm"
            : block.size === "lg"
              ? "max-w-xl"
              : "w-full";
      return (
        <figure className={`mb-6 ${block.size && block.size !== "full" ? "mx-auto " + sizeClass : ""}`}>
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
    }

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

    case "call-me":
      return <CallMe />;

    case "agent-config":
      return <AgentConfig />;

    case "voice-picker":
      return <VoicePicker />;

    case "language-picker":
      return <LanguagePicker />;

    case "builder-only":
      return <BuilderOnly context={block.context} />;

    case "page-break":
      return null;

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
