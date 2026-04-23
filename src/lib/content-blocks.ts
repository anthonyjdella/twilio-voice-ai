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
  | SpacerBlock
  | CallMeBlock
  | AgentConfigBlock
  | AgentSummaryBlock
  | VoicePickerBlock
  | LanguagePickerBlock
  | ToolPickerBlock
  | HandoffToggleBlock
  | DemoScriptBlock
  | BuilderOnlyBlock
  | PageBreakBlock;

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
  /** Lines to highlight as "new" code. Supports individual numbers and ranges: [3, 5, "7-10"] */
  highlight?: (number | string)[];
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

/** Expandable "stuck? show solution" block with full code and explanation.
 *  Pass either a single file (code + file + language) or a `files` array
 *  to render a tabbed switcher across multiple files. */
export interface SolutionBlock extends BaseBlock {
  type: "solution";
  code?: string;
  file?: string;
  language?: string;
  files?: Array<{ file: string; code: string; language?: string }>;
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
  troubleshooting?: string[];
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
  showTools?: boolean;
  showHandoff?: boolean;
}

/** Image with alt text and optional caption */
export interface ImageBlock extends BaseBlock {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
  /** Max width. Defaults to full column width. */
  size?: "sm" | "md" | "lg" | "full";
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

/** "Call Me" button — triggers an outbound call via the API */
export interface CallMeBlock extends BaseBlock {
  type: "call-me";
}

/** Interactive persona configurator — name, personality, greeting */
export interface AgentConfigBlock extends BaseBlock {
  type: "agent-config";
}

/** Read-only summary card — shows the agent's name, tone, voice, language, greeting */
export interface AgentSummaryBlock extends BaseBlock {
  type: "agent-summary";
}

/** Interactive voice selector — provider + voice */
export interface VoicePickerBlock extends BaseBlock {
  type: "voice-picker";
}

/** Interactive language selector */
export interface LanguagePickerBlock extends BaseBlock {
  type: "language-picker";
}

/** Interactive tool toggle — pick which tools the AI can call on the next test call */
export interface ToolPickerBlock extends BaseBlock {
  type: "tool-picker";
}

/** Interactive single switch — allow the AI to hand off to a human on the next test call */
export interface HandoffToggleBlock extends BaseBlock {
  type: "handoff-toggle";
}

/** Adaptive demo script — builds a call-walkthrough from enabled tools + handoff state */
export interface DemoScriptBlock extends BaseBlock {
  type: "demo-script";
}

/** Placeholder shown to Explorers on Builder-only steps */
export interface BuilderOnlyBlock extends BaseBlock {
  type: "builder-only";
  context?: string;
  /** Optional illustration path, relative to /public (e.g.
   *  "/images/illustrations/lego-building.svg"). Falls back to the
   *  default "no-result.svg" if omitted. */
  illustration?: string;
}

/** Sub-page boundary — splits a step's content into paginated slides */
export interface PageBreakBlock extends BaseBlock {
  type: "page-break";
}

// ─── Step Definition ────────────────────────────────────────────────

/** A single workshop step — an ordered array of content blocks */
export interface StepDefinition {
  blocks: ContentBlock[];
}
