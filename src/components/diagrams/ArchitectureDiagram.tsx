"use client";

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
  icon,
  active,
  completed,
}: {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  icon: string;
  active: boolean;
  completed?: boolean;
}) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect
        x={-60}
        y={-30}
        width={120}
        height={60}
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
      <text
        y={-6}
        textAnchor="middle"
        fill={active || completed ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.3)"}
        fontSize={12}
        fontFamily="var(--font-text)"
      >
        {icon} {label}
      </text>
      {sublabel && (
        <text
          y={12}
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
      {/* Arrow head */}
      <circle
        cx={x2 - (x2 > x1 ? 4 : -4)}
        cy={y2 - (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
        r={2}
        fill={active ? "#EF223A" : "rgba(255,255,255,0.1)"}
      />
      {bidirectional && (
        <circle
          cx={x1 + (x2 > x1 ? 4 : -4)}
          cy={y1 + (y2 > y1 ? 4 : y2 < y1 ? -4 : 0)}
          r={2}
          fill={active ? "#EF223A" : "rgba(255,255,255,0.1)"}
        />
      )}
    </g>
  );
}

export function ArchitectureDiagram({
  highlight = "none",
  showTools = false,
  showHandoff = false,
}: ArchitectureDiagramProps) {
  const isAll = highlight === "all" || highlight === "complete";
  const isComplete = highlight === "complete";

  return (
    <div className="rounded-xl bg-white/[0.02] border border-navy-border p-4 mb-8">
      <div className="text-xs font-mono text-text-muted uppercase tracking-wider mb-3">
        Architecture
      </div>
      <svg viewBox="0 0 700 160" className="w-full" style={{ maxHeight: 140 }}>
        {/* Arrows */}
        <Arrow
          x1={130} y1={70} x2={240} y2={70}
          active={isAll || highlight === "setup"}
          bidirectional
        />
        <Arrow
          x1={360} y1={70} x2={470} y2={70}
          active={
            isAll ||
            highlight === "websocket" ||
            highlight === "websocket-prompt" ||
            highlight === "websocket-response"
          }
          bidirectional
        />
        <Arrow
          x1={590} y1={70} x2={590} y2={130}
          active={isAll || highlight === "llm" || highlight === "server"}
        />

        {showTools && (
          <Arrow
            x1={530} y1={100} x2={460} y2={130}
            active={highlight === "tools" || isAll}
          />
        )}

        {/* Nodes */}
        <NodeBox
          x={70} y={70}
          label="Caller" icon="\u{1F4F1}"
          active={isAll || highlight === "setup"}
          completed={isComplete}
        />
        <NodeBox
          x={300} y={70}
          label="Twilio Voice" sublabel="STT + TTS" icon="\u{1F4DE}"
          active={isAll || highlight === "stt-tts" || highlight === "setup"}
          completed={isComplete}
        />
        <NodeBox
          x={530} y={70}
          label="Your Server" sublabel="WebSocket" icon="\u{1F5A5}\u{FE0F}"
          active={
            isAll ||
            highlight === "server" ||
            highlight === "websocket" ||
            highlight === "websocket-prompt" ||
            highlight === "websocket-response"
          }
          completed={isComplete}
        />
        <NodeBox
          x={590} y={150}
          label="LLM" sublabel="OpenAI" icon="\u{1F9E0}"
          active={isAll || highlight === "llm"}
          completed={isComplete}
        />

        {showTools && (
          <NodeBox
            x={420} y={150}
            label="Tools" sublabel="Functions" icon="\u{1F527}"
            active={highlight === "tools" || isAll}
            completed={isComplete}
          />
        )}

        {showHandoff && (
          <>
            <Arrow x1={460} y1={100} x2={420} y2={130} active={highlight === "handoff" || isAll} />
            <NodeBox
              x={350} y={150}
              label="Human Agent" icon="\u{1F468}\u{200D}\u{1F4BC}"
              active={highlight === "handoff" || isAll}
              completed={isComplete}
            />
          </>
        )}

        {/* WebSocket label */}
        <text
          x={415}
          y={58}
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
      </svg>
    </div>
  );
}
