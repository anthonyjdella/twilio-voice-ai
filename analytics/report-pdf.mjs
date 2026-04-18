import PDFDocument from "pdfkit";
import { join } from "node:path";

const NAVY = "#000D25";
const SURFACE = "#181D3C";
const RED = "#EF223A";
const BLUE = "#1866EE";
const SUCCESS = "#10B981";
const GOLD = "#F4B400";
const WHITE = "#FFFFFF";
const MUTED = "#8890A8";
const BORDER = "#2A3050";

const FONT_DIR = join(process.cwd(), "public", "fonts");

export function generateReport(data) {
  const { overview, funnel, chapters, audience, calls, agentConfig, pacing, timePerChapter, hourlyActivity, skipAhead, engagement } = data;
  const completionRate = overview.totalSessions > 0
    ? Math.round((overview.totalCompleted / overview.totalSessions) * 100) : 0;
  const callRate = overview.totalSessions > 0
    ? Math.round((calls.sessionsWithCalls / overview.totalSessions) * 100) : 0;

  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });

  doc.registerFont("display", join(FONT_DIR, "TwilioSansDisplay-Bold.otf"));
  doc.registerFont("display-xb", join(FONT_DIR, "TwilioSansDisplay-Extrabold.otf"));
  doc.registerFont("text", join(FONT_DIR, "TwilioSansText-Regular.otf"));
  doc.registerFont("text-medium", join(FONT_DIR, "TwilioSansText-Medium.otf"));
  doc.registerFont("text-semi", join(FONT_DIR, "TwilioSansText-Semibold.otf"));
  doc.registerFont("mono", join(FONT_DIR, "TwilioSansMono-Regular.otf"));

  const PAGE_W = doc.page.width;
  const M = 48;
  const CONTENT_W = PAGE_W - M * 2;

  function pageBg() {
    doc.rect(0, 0, PAGE_W, doc.page.height).fill(NAVY);
  }

  doc.on("pageAdded", () => {
    pageBg();
    doc.y = M;
  });

  function ensureSpace(needed) {
    if (doc.y + needed > doc.page.height - 60) {
      doc.addPage();
    }
  }

  function sectionTitle(title) {
    ensureSpace(40);
    doc.rect(M, doc.y, 3, 14).fill(RED);
    doc.font("display-xb").fontSize(13).fillColor(WHITE).text(title, M + 12, doc.y, { width: CONTENT_W - 12 });
    doc.moveDown(0.6);
  }

  function statRow(label, value) {
    const y = doc.y;
    doc.font("text").fontSize(10).fillColor(MUTED).text(label, M, y, { width: CONTENT_W * 0.65 });
    doc.font("text-semi").fontSize(10).fillColor(WHITE).text(String(value), M + CONTENT_W * 0.65, y, { width: CONTENT_W * 0.35, align: "right" });
    doc.y = y + 16;
  }

  function drawBar(x, y, width, maxWidth, color) {
    doc.rect(x, y, maxWidth, 10).fill(SURFACE);
    if (width > 0) {
      doc.roundedRect(x, y, Math.max(2, width), 10, 2).fill(color);
    }
  }

  // --- Page 1: Title + Overview ---
  pageBg();

  const logoPath = join(process.cwd(), "public", "images", "twilio-bug-red.svg");
  try {
    doc.image(logoPath, M, M, { width: 32 });
  } catch {
    // SVG might not be supported; skip logo
  }

  doc.y = M + 48;
  doc.font("display-xb").fontSize(26).fillColor(WHITE).text("Workshop Analytics Report", M, doc.y, { width: CONTENT_W });
  doc.moveDown(0.2);
  doc.font("text").fontSize(11).fillColor(MUTED).text("Build a Voice AI Agent — Twilio SIGNAL 2026", M);
  doc.font("text").fontSize(10).fillColor(MUTED).text(`Generated ${new Date().toLocaleString()}`, M);
  if (overview.firstEvent) {
    doc.font("text").fontSize(10).fillColor(MUTED).text(`Data collected since ${overview.firstEvent}`, M);
  }

  doc.moveDown(1.5);

  // Overview stat cards (2x4 grid)
  const cardW = (CONTENT_W - 12 * 3) / 4;
  const cardH = 58;
  const statsData = [
    { label: "ATTENDEES", value: overview.totalSessions, sub: `${overview.sessionsToday} today` },
    { label: "COMPLETION", value: `${completionRate}%`, sub: `${overview.totalCompleted} finished`, accent: true },
    { label: "BUILDERS", value: overview.builders, sub: `${overview.totalSessions > 0 ? Math.round(overview.builders / overview.totalSessions * 100) : 0}%` },
    { label: "EXPLORERS", value: overview.explorers, sub: `${overview.totalSessions > 0 ? Math.round(overview.explorers / overview.totalSessions * 100) : 0}%` },
    { label: "CALLS MADE", value: calls.totalCalls, sub: `${callRate}% called` },
    { label: "AVG SESSION", value: `${pacing.avgMinutes}m`, sub: `median ${pacing.medianMinutes}m` },
    { label: "STEPS DONE", value: overview.totalStepCompleted, sub: `${overview.totalBadges} badges` },
    { label: "CONFIGURED", value: engagement.sessionsWithConfig, sub: `${overview.totalSessions > 0 ? Math.round(engagement.sessionsWithConfig / overview.totalSessions * 100) : 0}% of users` },
  ];

  for (let row = 0; row < 2; row++) {
    const baseY = doc.y;
    for (let col = 0; col < 4; col++) {
      const idx = row * 4 + col;
      const s = statsData[idx];
      const cx = M + col * (cardW + 12);
      doc.roundedRect(cx, baseY, cardW, cardH, 6).fill(SURFACE);
      doc.font("display").fontSize(8).fillColor(MUTED).text(s.label, cx + 10, baseY + 8, { width: cardW - 20 });
      doc.font("display-xb").fontSize(20).fillColor(s.accent ? RED : WHITE).text(String(s.value), cx + 10, baseY + 20, { width: cardW - 20 });
      doc.font("text").fontSize(8).fillColor(MUTED).text(s.sub, cx + 10, baseY + 42, { width: cardW - 20 });
    }
    doc.y = baseY + cardH + 10;
  }

  doc.moveDown(0.8);

  // --- Completion Funnel ---
  sectionTitle("Completion Funnel");
  if (funnel.length === 0) {
    doc.font("text").fontSize(10).fillColor(MUTED).text("No completion data yet", M);
    doc.moveDown(0.5);
  } else {
    const barMaxW = CONTENT_W * 0.45;
    for (const row of funnel) {
      ensureSpace(16);
      const pct = overview.totalSessions > 0 ? row.sessions / overview.totalSessions : 0;
      const y = doc.y;
      doc.font("text").fontSize(9).fillColor(MUTED).text(`${row.chapter}/${row.step}`, M, y, { width: CONTENT_W * 0.32 });
      drawBar(M + CONTENT_W * 0.34, y + 1, pct * barMaxW, barMaxW, RED);
      doc.font("mono").fontSize(8).fillColor(MUTED).text(`${Math.round(pct * 100)}%`, M + CONTENT_W * 0.82, y, { width: 30, align: "right" });
      doc.font("mono").fontSize(8).fillColor(WHITE).text(String(row.sessions), M + CONTENT_W * 0.9, y, { width: 40, align: "right" });
      doc.y = y + 14;
    }
  }

  doc.moveDown(0.5);

  // --- Chapter Completion ---
  sectionTitle("Chapter Completion");
  if (chapters.length === 0) {
    doc.font("text").fontSize(10).fillColor(MUTED).text("No chapter completions yet", M);
    doc.moveDown(0.5);
  } else {
    const barMaxW = CONTENT_W * 0.45;
    for (const ch of chapters) {
      ensureSpace(16);
      const pct = overview.totalSessions > 0 ? ch.sessions / overview.totalSessions : 0;
      const y = doc.y;
      doc.font("text").fontSize(9).fillColor(MUTED).text(ch.badgeId, M, y, { width: CONTENT_W * 0.32 });
      drawBar(M + CONTENT_W * 0.34, y + 1, pct * barMaxW, barMaxW, SUCCESS);
      doc.font("mono").fontSize(8).fillColor(MUTED).text(`${Math.round(pct * 100)}%`, M + CONTENT_W * 0.82, y, { width: 30, align: "right" });
      doc.font("mono").fontSize(8).fillColor(WHITE).text(String(ch.sessions), M + CONTENT_W * 0.9, y, { width: 40, align: "right" });
      doc.y = y + 14;
    }
  }

  doc.moveDown(0.5);

  // --- Time per Chapter ---
  if (timePerChapter.length > 0) {
    sectionTitle("Time per Chapter (median)");
    const barMaxW = CONTENT_W * 0.45;
    const maxMin = Math.max(1, ...timePerChapter.map(c => c.medianMinutes));
    for (const ch of timePerChapter) {
      ensureSpace(16);
      const y = doc.y;
      doc.font("text").fontSize(9).fillColor(MUTED).text(ch.chapterSlug, M, y, { width: CONTENT_W * 0.32 });
      drawBar(M + CONTENT_W * 0.34, y + 1, (ch.medianMinutes / maxMin) * barMaxW, barMaxW, BLUE);
      doc.font("mono").fontSize(8).fillColor(WHITE).text(`${ch.medianMinutes} min`, M + CONTENT_W * 0.85, y, { width: 50, align: "right" });
      doc.y = y + 14;
    }
    doc.moveDown(0.5);
  }

  // --- Audience Breakdown ---
  sectionTitle("Audience Breakdown");
  for (const a of audience.audiences) {
    statRow(a.audience, `${a.sessions} users`);
  }
  if (audience.completionByAudience.length > 0) {
    doc.font("text").fontSize(8).fillColor(MUTED).text("Completed workshop:", M, doc.y + 4);
    doc.moveDown(0.4);
    for (const a of audience.completionByAudience) {
      statRow(`  ${a.audience}`, a.completed);
    }
  }

  doc.moveDown(0.5);

  // --- Call Analytics ---
  sectionTitle("Call Analytics");
  statRow("Total calls", calls.totalCalls);
  statRow("Users who called", calls.sessionsWithCalls);
  statRow("Avg call duration", `${calls.avgCallDuration}s`);
  statRow("Median call duration", `${calls.medianCallDuration}s`);
  statRow("Longest call", `${calls.longestCall}s`);
  statRow("Handoffs triggered", calls.handoffs);
  statRow("Language switches", calls.langSwitches);
  if (calls.toolUsage.length > 0) {
    doc.font("text").fontSize(8).fillColor(MUTED).text("Tool usage:", M, doc.y + 4);
    doc.moveDown(0.4);
    for (const t of calls.toolUsage) {
      statRow(`  ${t.tool}`, t.c);
    }
  }

  doc.moveDown(0.5);

  // --- Agent Config ---
  sectionTitle("Agent Configuration");
  if (agentConfig.voices.length > 0) {
    doc.font("text").fontSize(8).fillColor(MUTED).text("Popular voices:", M);
    doc.moveDown(0.3);
    for (const v of agentConfig.voices) statRow(`  ${v.voice || "(default)"}`, v.c);
  }
  if (agentConfig.languages.length > 0) {
    doc.font("text").fontSize(8).fillColor(MUTED).text("Languages:", M, doc.y + 2);
    doc.moveDown(0.3);
    for (const l of agentConfig.languages) statRow(`  ${l.language}`, l.c);
  }
  if (agentConfig.names.length > 0) {
    doc.font("text").fontSize(8).fillColor(MUTED).text("Agent names:", M, doc.y + 2);
    doc.moveDown(0.3);
    for (const n of agentConfig.names.slice(0, 10)) statRow(`  ${n.name || "(unnamed)"}`, n.c);
  }

  doc.moveDown(0.5);

  // --- Pacing & Engagement ---
  sectionTitle("Pacing & Engagement");
  statRow("Median session", `${pacing.medianMinutes} min`);
  statRow("Average session", `${pacing.avgMinutes} min`);
  statRow("Fastest session", `${pacing.fastest} min`);
  statRow("Slowest session", `${pacing.slowest} min`);
  statRow("Avg events per user", engagement.avgEvents);
  statRow("Most active user", `${engagement.maxEvents} events`);
  statRow("Users with badges", engagement.sessionsWithBadges);
  statRow("Progress resets", engagement.totalResets);
  if (skipAhead.totalSkips > 0) {
    statRow("Skip-aheads", skipAhead.totalSkips);
    statRow("Users who skipped", skipAhead.sessionsSkipped);
  }

  // --- Hourly Activity ---
  if (hourlyActivity.length > 0) {
    doc.moveDown(0.5);
    sectionTitle("Hourly Activity");
    ensureSpace(90);
    const chartX = M;
    const chartY = doc.y;
    const chartW = CONTENT_W;
    const chartH = 60;
    const maxEvents = Math.max(1, ...hourlyActivity.map(h => h.events));
    const barW = chartW / 24 - 2;

    doc.rect(chartX, chartY, chartW, chartH).fill(SURFACE);
    for (let i = 0; i < 24; i++) {
      const match = hourlyActivity.find(h => h.hour === i);
      const val = match ? match.events : 0;
      const barH = val === 0 ? 0 : Math.max(2, (val / maxEvents) * (chartH - 4));
      const bx = chartX + i * (barW + 2) + 1;
      doc.rect(bx, chartY + chartH - barH - 2, barW, barH).fill(RED);
    }
    doc.y = chartY + chartH + 4;
    for (let i = 0; i < 24; i += 3) {
      doc.font("mono").fontSize(6).fillColor(MUTED)
        .text(String(i), chartX + i * (barW + 2), doc.y, { width: barW * 3, align: "left" });
    }
    doc.y += 12;
  }

  // --- Footer on every page ---
  const totalPages = doc.bufferedPageRange().count;
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    doc.font("text").fontSize(8).fillColor(MUTED)
      .text(
        `Voice AI Workshop Analytics — Page ${i + 1} of ${totalPages}`,
        M, doc.page.height - 32,
        { width: CONTENT_W, align: "center" }
      );
  }

  doc.end();
  return doc;
}
