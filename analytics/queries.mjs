import { getDb } from "./db.mjs";

const stmtCache = new Map();

function stmt(sql) {
  let s = stmtCache.get(sql);
  if (!s) {
    s = getDb().prepare(sql);
    stmtCache.set(sql, s);
  }
  return s;
}

export function getOverview() {
  const totalSessions = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events`).get().c;
  const sessionsToday = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE created_at >= datetime('now', 'start of day')`).get().c;
  const builders = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'session_started' AND json_extract(payload, '$.audience') = 'builder'`).get().c;
  const explorers = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'session_started' AND json_extract(payload, '$.audience') = 'explorer'`).get().c;
  const totalCalls = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'call_initiated'`).get().c;
  const totalCompleted = stmt(`
    SELECT COUNT(DISTINCT session_id) AS c FROM events
    WHERE event_type = 'badge_earned' AND json_extract(payload, '$.badgeId') = 'chapter-6'
  `).get().c;
  return { totalSessions, sessionsToday, builders, explorers, totalCalls, totalCompleted };
}

export function getCompletionFunnel() {
  return stmt(`
    SELECT json_extract(payload, '$.chapterSlug') AS chapter,
           json_extract(payload, '$.stepSlug') AS step,
           json_extract(payload, '$.chapterId') AS chapterId,
           json_extract(payload, '$.stepId') AS stepId,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE event_type = 'step_completed'
    GROUP BY chapterId, stepId
    ORDER BY CAST(chapterId AS INTEGER), CAST(stepId AS INTEGER)
  `).all();
}

export function getChapterCompletion() {
  return stmt(`
    SELECT json_extract(payload, '$.badgeId') AS badgeId,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE event_type = 'badge_earned'
    GROUP BY badgeId
    ORDER BY badgeId
  `).all();
}

export function getAudienceBreakdown() {
  const audiences = stmt(`
    SELECT json_extract(payload, '$.audience') AS audience,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE event_type = 'session_started'
    GROUP BY audience
  `).all();

  const completionByAudience = stmt(`
    SELECT e1.audience, COUNT(DISTINCT e2.session_id) AS completed
    FROM (
      SELECT session_id, json_extract(payload, '$.audience') AS audience
      FROM events WHERE event_type = 'session_started'
    ) e1
    JOIN events e2 ON e1.session_id = e2.session_id
      AND e2.event_type = 'badge_earned'
      AND json_extract(e2.payload, '$.badgeId') = 'chapter-6'
    GROUP BY e1.audience
  `).all();

  return { audiences, completionByAudience };
}

export function getCallStats() {
  const totalCalls = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'call_initiated'`).get().c;
  const sessionsWithCalls = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'call_initiated'`).get().c;
  const toolUsage = stmt(`
    SELECT json_extract(payload, '$.toolName') AS tool, COUNT(*) AS c
    FROM events WHERE event_type = 'tool_used'
    GROUP BY tool ORDER BY c DESC
  `).all();
  const handoffs = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'handoff_triggered'`).get().c;
  return { totalCalls, sessionsWithCalls, toolUsage, handoffs };
}

export function getAgentConfig() {
  const voices = stmt(`
    SELECT json_extract(payload, '$.value') AS voice, COUNT(*) AS c
    FROM events
    WHERE event_type = 'agent_configured' AND json_extract(payload, '$.field') = 'voiceLabel'
    GROUP BY voice ORDER BY c DESC LIMIT 10
  `).all();
  const languages = stmt(`
    SELECT json_extract(payload, '$.value') AS language, COUNT(*) AS c
    FROM events
    WHERE event_type = 'agent_configured' AND json_extract(payload, '$.field') = 'language'
    GROUP BY language ORDER BY c DESC LIMIT 10
  `).all();
  const names = stmt(`
    SELECT json_extract(payload, '$.value') AS name, COUNT(*) AS c
    FROM events
    WHERE event_type = 'agent_configured' AND json_extract(payload, '$.field') = 'agentName'
    GROUP BY name ORDER BY c DESC LIMIT 20
  `).all();
  return { voices, languages, names };
}

export function getPacing() {
  const sessionDurations = stmt(`
    SELECT session_id,
           MIN(created_at) AS first_event,
           MAX(created_at) AS last_event,
           CAST((julianday(MAX(created_at)) - julianday(MIN(created_at))) * 1440 AS INTEGER) AS minutes
    FROM events
    GROUP BY session_id
    HAVING COUNT(*) > 1
    ORDER BY minutes
  `).all();

  const n = sessionDurations.length;
  const medianMinutes = n === 0 ? 0
    : n % 2 === 1 ? sessionDurations[Math.floor(n / 2)].minutes
    : Math.round((sessionDurations[n / 2 - 1].minutes + sessionDurations[n / 2].minutes) / 2);
  const avgMinutes = sessionDurations.length > 0
    ? Math.round(sessionDurations.reduce((s, r) => s + r.minutes, 0) / sessionDurations.length)
    : 0;

  return { medianMinutes, avgMinutes, totalSessions: sessionDurations.length };
}

export function getSkipAheadStats() {
  const skips = stmt(`
    SELECT json_extract(payload, '$.toStep') AS toStep, COUNT(*) AS c
    FROM events WHERE event_type = 'skip_ahead'
    GROUP BY toStep ORDER BY c DESC
  `).all();
  const totalSkips = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'skip_ahead'`).get().c;
  const sessionsSkipped = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'skip_ahead'`).get().c;
  return { skips, totalSkips, sessionsSkipped };
}

export function getRecentActivity() {
  return stmt(`
    SELECT session_id, event_type, payload, created_at
    FROM events ORDER BY id DESC LIMIT 50
  `).all();
}

export function getAllMetrics() {
  return {
    overview: getOverview(),
    funnel: getCompletionFunnel(),
    chapters: getChapterCompletion(),
    audience: getAudienceBreakdown(),
    calls: getCallStats(),
    agentConfig: getAgentConfig(),
    pacing: getPacing(),
    skipAhead: getSkipAheadStats(),
    recent: getRecentActivity(),
  };
}
