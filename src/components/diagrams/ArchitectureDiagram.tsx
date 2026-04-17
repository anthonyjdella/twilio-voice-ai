"use client";

import type { LucideIcon } from "lucide-react";
import { Smartphone, PhoneCall, Server, Brain, Wrench, UserRound } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Theme-aware palette. In dark mode, white-alpha reads well on #181D3C cards;
// in light mode we swap to navy-alpha (#000D25 base) so text/strokes remain
// visible on the #DEE0E7 card surface.
type DiagramPalette = {
  nodeTextActive: string;
  nodeTextInactive: string;
  nodeFillInactive: string;
  nodeStrokeInactive: string;
  sublabel: string;
  arrowInactive: string;
  websocketInactive: string;
  /** Brand accents — constant across themes, colocated here so every diagram
   *  node/arrow reads them from a single source. */
  brandRed: string;
  brandRedFill: string;
  success: string;
};

// Brand accents match the --color-twilio-red and --color-success tokens in
// globals.css. Both themes use the same hex (brand palette is theme-neutral).
const BRAND_RED = "#EF223A";
const BRAND_RED_FILL = "rgba(239, 34, 58, 0.1)";
const SUCCESS_GREEN = "#10B981";

function getPalette(isDark: boolean): DiagramPalette {
  if (isDark) {
    return {
      nodeTextActive: "rgba(255,255,255,0.9)",
      nodeTextInactive: "rgba(255,255,255,0.3)",
      nodeFillInactive: "rgba(255,255,255,0.03)",
      nodeStrokeInactive: "rgba(255,255,255,0.07)",
      sublabel: "rgba(255,255,255,0.2)",
      arrowInactive: "rgba(255,255,255,0.1)",
      websocketInactive: "rgba(255,255,255,0.1)",
      brandRed: BRAND_RED,
      brandRedFill: BRAND_RED_FILL,
      success: SUCCESS_GREEN,
    };
  }
  return {
    nodeTextActive: "rgba(0,13,37,0.88)",
    nodeTextInactive: "rgba(0,13,37,0.45)",
    nodeFillInactive: "rgba(0,13,37,0.04)",
    nodeStrokeInactive: "rgba(0,13,37,0.18)",
    sublabel: "rgba(0,13,37,0.55)",
    arrowInactive: "rgba(0,13,37,0.25)",
    websocketInactive: "rgba(0,13,37,0.25)",
    brandRed: BRAND_RED,
    brandRedFill: BRAND_RED_FILL,
    success: SUCCESS_GREEN,
  };
}

type Highlight =
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

interface ArchitectureDiagramProps {
  highlight?: Highlight;
  showTools?: boolean;
  showHandoff?: boolean;
}

function NodeBox({
  x,
  y,
  label,
  sublabel,
  Icon,
  active,
  completed,
  width = 130,
  palette,
}: {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  Icon: LucideIcon;
  active: boolean;
  completed?: boolean;
  width?: number;
  palette: DiagramPalette;
}) {
  const fillColor = active || completed ? palette.nodeTextActive : palette.nodeTextInactive;
  const halfW = width / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-halfW}
        y={-28}
        width={width}
        height={56}
        rx={12}
        fill={active ? palette.brandRedFill : palette.nodeFillInactive}
        stroke={
          completed
            ? palette.success
            : active
              ? palette.brandRed
              : palette.nodeStrokeInactive
        }
        strokeWidth={active ? 1.5 : 1}
        className={active ? "animate-pulse-glow" : ""}
      />
      <foreignObject x={-halfW + 5} y={sublabel ? -22 : -14} width={width - 10} height={28}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            height: "100%",
          }}
        >
          <Icon size={14} color={fillColor} style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-text)",
              color: fillColor,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>
      </foreignObject>
      {sublabel && (
        <text
          y={14}
          textAnchor="middle"
          fill={palette.sublabel}
          fontSize={9}
          fontFamily="var(--font-mono)"
        >
          {sublabel}
        </text>
      )}
    </g>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  active,
  bidirectional,
  palette,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  bidirectional?: boolean;
  palette: DiagramPalette;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={active ? palette.brandRed : palette.arrowInactive}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={active ? "6 3" : "none"}
        className={active ? "animate-flow" : ""}
        style={active ? { strokeDashoffset: 0 } : undefined}
      />
      <circle
        cx={x2 - (x2 > x1 ? 4 : x2 < x1 ? -4 : 0)}
        cy={y2 - (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
        r={2}
        fill={active ? palette.brandRed : palette.arrowInactive}
      />
      {bidirectional && (
        <circle
          cx={x1 + (x2 > x1 ? 4 : x2 < x1 ? -4 : 0)}
          cy={y1 + (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
          r={2}
          fill={active ? palette.brandRed : palette.arrowInactive}
        />
      )}
    </g>
  );
}

// Layout constants
const ROW1_Y = 55;
const ROW2_Y = 155;
const CALLER_X = 90;
const TWILIO_X = 280;
const SERVER_X = 530;
const LLM_X = 530;
const TOOLS_X = 350;
const HANDOFF_X = 160;

export function ArchitectureDiagram({
  highlight = "none",
  showTools = false,
  showHandoff = false,
}: ArchitectureDiagramProps) {
  const { isDark } = useTheme();
  const palette = getPalette(isDark);
  const isAll = highlight === "all" || highlight === "complete";
  const isComplete = highlight === "complete";
  const hasBottomRow = showTools || showHandoff || isAll || highlight === "llm" || highlight === "tools" || highlight === "handoff" || highlight === "server";
  const viewHeight = hasBottomRow ? 195 : 115;
  const websocketActive =
    isAll ||
    highlight === "websocket" ||
    highlight === "websocket-prompt" ||
    highlight === "websocket-response";

  return (
    <div className="rounded-xl bg-surface-1 border border-navy-border p-4 mb-8">
      <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Architecture
      </div>
      <svg viewBox={`0 0 630 ${viewHeight}`} className="w-full">
        {/* Top row arrows */}
        <Arrow
          x1={CALLER_X + 65} y1={ROW1_Y} x2={TWILIO_X - 80} y2={ROW1_Y}
          active={isAll || highlight === "setup"}
          bidirectional
          palette={palette}
        />
        <Arrow
          x1={TWILIO_X + 80} y1={ROW1_Y} x2={SERVER_X - 65} y2={ROW1_Y}
          active={websocketActive}
          bidirectional
          palette={palette}
        />

        {/* Server → LLM arrow (vertical) */}
        {hasBottomRow && (
          <Arrow
            x1={LLM_X} y1={ROW1_Y + 28} x2={LLM_X} y2={ROW2_Y - 28}
            active={isAll || highlight === "llm" || highlight === "server"}
            palette={palette}
          />
        )}

        {/* Server → Tools arrow */}
        {showTools && (
          <Arrow
            x1={SERVER_X - 40} y1={ROW1_Y + 28} x2={TOOLS_X + 40} y2={ROW2_Y - 28}
            active={highlight === "tools" || isAll}
            palette={palette}
          />
        )}

        {/* Server → Human Agent arrow */}
        {showHandoff && (
          <Arrow
            x1={SERVER_X - 60} y1={ROW1_Y + 28} x2={HANDOFF_X + 50} y2={ROW2_Y - 28}
            active={highlight === "handoff" || isAll}
            palette={palette}
          />
        )}

        {/* WebSocket label */}
        <text
          x={(TWILIO_X + SERVER_X) / 2}
          y={ROW1_Y - 18}
          textAnchor="middle"
          fill={websocketActive ? "rgba(239, 34, 58, 0.6)" : palette.websocketInactive}
          fontSize={9}
          fontFamily="var(--font-mono)"
        >
          WebSocket
        </text>

        {/* Top row nodes */}
        <NodeBox
          x={CALLER_X} y={ROW1_Y}
          label="Caller" Icon={Smartphone}
          active={isAll || highlight === "setup"}
          completed={isComplete}
          palette={palette}
        />
        <NodeBox
          x={TWILIO_X} y={ROW1_Y}
          label="Twilio Voice" sublabel="ConversationRelay" Icon={PhoneCall}
          active={isAll || highlight === "stt-tts" || highlight === "setup"}
          completed={isComplete}
          width={160}
          palette={palette}
        />
        <NodeBox
          x={SERVER_X} y={ROW1_Y}
          label="Your Server" sublabel="WebSocket" Icon={Server}
          active={
            isAll ||
            highlight === "server" ||
            highlight === "websocket" ||
            highlight === "websocket-prompt" ||
            highlight === "websocket-response"
          }
          completed={isComplete}
          width={140}
          palette={palette}
        />

        {/* Bottom row nodes */}
        {hasBottomRow && (
          <NodeBox
            x={LLM_X} y={ROW2_Y}
            label="LLM" sublabel="OpenAI" Icon={Brain}
            active={isAll || highlight === "llm"}
            completed={isComplete}
            palette={palette}
          />
        )}

        {showTools && (
          <NodeBox
            x={TOOLS_X} y={ROW2_Y}
            label="Tools" sublabel="Functions" Icon={Wrench}
            active={highlight === "tools" || isAll}
            completed={isComplete}
            palette={palette}
          />
        )}

        {showHandoff && (
          <NodeBox
            x={HANDOFF_X} y={ROW2_Y}
            label="Human Agent" Icon={UserRound}
            active={highlight === "handoff" || isAll}
            completed={isComplete}
            width={140}
            palette={palette}
          />
        )}
      </svg>
    </div>
  );
}
