// ─── Declarative Content Block System ───────────────────────────────
// Workshop creators define step content as arrays of these typed blocks.
// The StepRenderer component maps each block to the appropriate UI component.

export type ContentBlock =
  | SectionBlock
  | ProseBlock
  | CodeBlock
  | TerminalBlock
  | CalloutBlock
  | DeepDiveBlock
  | SolutionBlock
  | JsonMessageBlock
  | VerifyBlock
  | DiagramBlock
  | ImageBlock
  | VisualStepBlock
  | ConceptCardBlock
  | DiffBlock
  | SpacerBlock;

// ─── Base Block ─────────────────────────────────────────────────────

/** Shared fields for all content blocks */
interface BaseBlock {
  /**
   * Optional audience targeting.
   * - "builder" → only visible in Builder mode
   * - "explorer" → only visible in Explorer mode
   * - undefined → visible in both modes
   */
  audience?: "builder" | "explorer";
}

// ─── Individual Block Types ─────────────────────────────────────────

/** Section heading — rendered as an h2 divider */
export interface SectionBlock extends BaseBlock {
  type: "section";
  title: string;
}

/** Rich text paragraph — supports inline markdown: **bold**, `code`, [links](url) */
export interface ProseBlock extends BaseBlock {
  type: "prose";
  content: string;
}

/** Syntax-highlighted code snippet with optional file label and line numbers */
export interface CodeBlock extends BaseBlock {
  type: "code";
  code: string;
  language?: string;
  file?: string;
  startLine?: number;
  showLineNumbers?: boolean;
}

/** Terminal/shell display — lines starting with $ are commands (copyable), rest is output */
export interface TerminalBlock extends BaseBlock {
  type: "terminal";
  commands: string;
}

/** Info/tip/warning/error callout box */
export interface CalloutBlock extends BaseBlock {
  type: "callout";
  variant: "info" | "tip" | "warning" | "error";
  content: string;
}

/** Expandable deep-dive section for advanced/educational content */
export interface DeepDiveBlock extends BaseBlock {
  type: "deep-dive";
  title: string;
  content: string;
}

/** Expandable "stuck? show solution" block with full code and explanation */
export interface SolutionBlock extends BaseBlock {
  type: "solution";
  code: string;
  file: string;
  language?: string;
  explanation: string;
}

/** JSON message display with direction label (inbound/outbound) */
export interface JsonMessageBlock extends BaseBlock {
  type: "json-message";
  direction: "inbound" | "outbound";
  messageType: string;
  code: string;
}

/** Interactive verification checkpoint — "Did it work?" with yes/help buttons */
export interface VerifyBlock extends BaseBlock {
  type: "verify";
  question: string;
}

/** Architecture or flow diagram with optional highlight state */
export interface DiagramBlock extends BaseBlock {
  type: "diagram";
  variant: string;
  highlight?:
    | "none"
    | "all"
    | "setup"
    | "websocket"
    | "websocket-prompt"
    | "websocket-response"
    | "stt-tts"
    | "server"
    | "llm"
    | "tools"
    | "handoff"
    | "complete";
}

/** Image with alt text and optional caption */
export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/** Numbered visual steps — for non-technical "click here, then there" instructions */
export interface VisualStepBlock extends BaseBlock {
  type: "visual-step";
  steps: { icon: string; title: string; description: string }[];
}

/** Concept card — visual explanation with optional illustration, no code */
export interface ConceptCardBlock extends BaseBlock {
  type: "concept-card";
  title: string;
  illustration?: string;
  content: string;
}

/** Unified diff display */
export interface DiffBlock extends BaseBlock {
  type: "diff";
  code: string;
  file?: string;
  language?: string;
}

/** Vertical spacer for layout control */
export interface SpacerBlock extends BaseBlock {
  type: "spacer";
}

// ─── Step Definition ────────────────────────────────────────────────

/** A single workshop step — an ordered array of content blocks */
export interface StepDefinition {
  blocks: ContentBlock[];
}
