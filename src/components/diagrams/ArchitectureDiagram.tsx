"use client";

import type { LucideIcon } from "lucide-react";
import { Smartphone, PhoneCall, Server, Brain, Wrench, UserRound } from "lucide-react";

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
}: {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  Icon: LucideIcon;
  active: boolean;
  completed?: boolean;
  width?: number;
}) {
  const fillColor = active || completed ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)";
  const halfW = width / 2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-halfW}
        y={-28}
        width={width}
        height={56}
        rx={12}
        fill={active ? "rgba(239, 34, 58, 0.1)" : "rgba(255, 255, 255, 0.03)"}
        stroke={
          completed
            ? "#10B981"
            : active
              ? "#EF223A"
              : "rgba(255, 255, 255, 0.07)"
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
          fill="rgba(255,255,255,0.2)"
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
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
  bidirectional?: boolean;
}) {
  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={active ? "#EF223A" : "rgba(255,255,255,0.1)"}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={active ? "6 3" : "none"}
        className={active ? "animate-flow" : ""}
        style={active ? { strokeDashoffset: 0 } : undefined}
      />
      <circle
        cx={x2 - (x2 > x1 ? 4 : x2 < x1 ? -4 : 0)}
        cy={y2 - (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
        r={2}
        fill={active ? "#EF223A" : "rgba(255,255,255,0.1)"}
      />
      {bidirectional && (
        <circle
          cx={x1 + (x2 > x1 ? 4 : x2 < x1 ? -4 : 0)}
          cy={y1 + (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
          r={2}
          fill={active ? "#EF223A" : "rgba(255,255,255,0.1)"}
        />
      )}
    </g>
  );
}

// Layout constants
const ROW1_Y = 55;
const ROW2_Y = 155;
const CALLER_X = 90;
const TWILIO_X = 290;
const SERVER_X = 490;
const LLM_X = 490;
const TOOLS_X = 320;
const HANDOFF_X = 160;

export function ArchitectureDiagram({
  highlight = "none",
  showTools = false,
  showHandoff = false,
}: ArchitectureDiagramProps) {
  const isAll = highlight === "all" || highlight === "complete";
  const isComplete = highlight === "complete";
  const hasBottomRow = showTools || showHandoff || isAll || highlight === "llm" || highlight === "tools" || highlight === "handoff" || highlight === "server";
  const viewHeight = hasBottomRow ? 195 : 115;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-navy-border p-4 mb-8">
      <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Architecture
      </div>
      <svg viewBox={`0 0 580 ${viewHeight}`} className="w-full">
        {/* Top row arrows */}
        <Arrow
          x1={CALLER_X + 65} y1={ROW1_Y} x2={TWILIO_X - 65} y2={ROW1_Y}
          active={isAll || highlight === "setup"}
          bidirectional
        />
        <Arrow
          x1={TWILIO_X + 65} y1={ROW1_Y} x2={SERVER_X - 65} y2={ROW1_Y}
          active={
            isAll ||
            highlight === "websocket" ||
            highlight === "websocket-prompt" ||
            highlight === "websocket-response"
          }
          bidirectional
        />

        {/* Server → LLM arrow (vertical) */}
        {hasBottomRow && (
          <Arrow
            x1={LLM_X} y1={ROW1_Y + 28} x2={LLM_X} y2={ROW2_Y - 28}
            active={isAll || highlight === "llm" || highlight === "server"}
          />
        )}

        {/* Server → Tools arrow */}
        {showTools && (
          <Arrow
            x1={SERVER_X - 40} y1={ROW1_Y + 28} x2={TOOLS_X + 40} y2={ROW2_Y - 28}
            active={highlight === "tools" || isAll}
          />
        )}

        {/* Server → Human Agent arrow */}
        {showHandoff && (
          <Arrow
            x1={SERVER_X - 60} y1={ROW1_Y + 28} x2={HANDOFF_X + 50} y2={ROW2_Y - 28}
            active={highlight === "handoff" || isAll}
          />
        )}

        {/* WebSocket label */}
        <text
          x={(TWILIO_X + SERVER_X) / 2}
          y={ROW1_Y - 18}
          textAnchor="middle"
          fill={
            highlight === "websocket" ||
            highlight === "websocket-prompt" ||
            highlight === "websocket-response" ||
            isAll
              ? "rgba(239, 34, 58, 0.6)"
              : "rgba(255,255,255,0.1)"
          }
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
        />
        <NodeBox
          x={TWILIO_X} y={ROW1_Y}
          label="Twilio Voice" sublabel="STT + TTS" Icon={PhoneCall}
          active={isAll || highlight === "stt-tts" || highlight === "setup"}
          completed={isComplete}
          width={140}
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
        />

        {/* Bottom row nodes */}
        {hasBottomRow && (
          <NodeBox
            x={LLM_X} y={ROW2_Y}
            label="LLM" sublabel="OpenAI" Icon={Brain}
            active={isAll || highlight === "llm"}
            completed={isComplete}
          />
        )}

        {showTools && (
          <NodeBox
            x={TOOLS_X} y={ROW2_Y}
            label="Tools" sublabel="Functions" Icon={Wrench}
            active={highlight === "tools" || isAll}
            completed={isComplete}
          />
        )}

        {showHandoff && (
          <NodeBox
            x={HANDOFF_X} y={ROW2_Y}
            label="Human Agent" Icon={UserRound}
            active={highlight === "handoff" || isAll}
            completed={isComplete}
            width={140}
          />
        )}
      </svg>
    </div>
  );
}
