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

// Each session's "current" audience = the `to` of its latest audience_changed,
// otherwise the `audience` from session_started. Computed once and reused so
// the overview numbers match the audience-breakdown panel (otherwise switching
// from builder to explorer left both counters stale/doubled).
const CURRENT_AUDIENCE_SQL = `
  WITH session_audience AS (
    SELECT
      session_id,
      COALESCE(
        (
          SELECT json_extract(payload, '$.to')
          FROM events e2
          WHERE e2.session_id = e1.session_id AND e2.event_type = 'audience_changed'
          ORDER BY e2.id DESC LIMIT 1
        ),
        (
          SELECT json_extract(payload, '$.audience')
          FROM events e3
          WHERE e3.session_id = e1.session_id AND e3.event_type = 'session_started'
          ORDER BY e3.id ASC LIMIT 1
        )
      ) AS audience
    FROM events e1
    GROUP BY session_id
  )
`;

export function getOverview() {
  const totalSessions = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events`).get().c;
  const sessionsToday = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE created_at >= datetime('now', 'start of day')`).get().c;
  const builders = stmt(`${CURRENT_AUDIENCE_SQL} SELECT COUNT(*) AS c FROM session_audience WHERE audience = 'builder'`).get().c;
  const explorers = stmt(`${CURRENT_AUDIENCE_SQL} SELECT COUNT(*) AS c FROM session_audience WHERE audience = 'explorer'`).get().c;
  const totalCalls = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'call_initiated'`).get().c;
  const totalCompleted = stmt(`
    SELECT COUNT(DISTINCT session_id) AS c FROM events
    WHERE event_type = 'badge_earned' AND json_extract(payload, '$.badgeId') = 'chapter-6'
  `).get().c;
  const totalStepCompleted = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'step_completed'`).get().c;
  const totalBadges = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'badge_earned'`).get().c;
  const firstEvent = stmt(`SELECT MIN(created_at) AS t FROM events`).get().t;
  const lastEvent = stmt(`SELECT MAX(created_at) AS t FROM events`).get().t;
  return { totalSessions, sessionsToday, builders, explorers, totalCalls, totalCompleted, totalStepCompleted, totalBadges, firstEvent, lastEvent };
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
  // All three of these now use each session's current audience (factoring in
  // audience_changed events). Previously these anchored on the original
  // session_started value and couldn't reflect users who switched modes.
  const audiences = stmt(`
    ${CURRENT_AUDIENCE_SQL}
    SELECT audience, COUNT(*) AS sessions
    FROM session_audience
    WHERE audience IS NOT NULL
    GROUP BY audience
  `).all();

  const completionByAudience = stmt(`
    ${CURRENT_AUDIENCE_SQL}
    SELECT sa.audience, COUNT(DISTINCT e2.session_id) AS completed
    FROM session_audience sa
    JOIN events e2 ON sa.session_id = e2.session_id
      AND e2.event_type = 'badge_earned'
      AND json_extract(e2.payload, '$.badgeId') = 'chapter-6'
    WHERE sa.audience IS NOT NULL
    GROUP BY sa.audience
  `).all();

  const stepsPerAudience = stmt(`
    ${CURRENT_AUDIENCE_SQL}
    SELECT sa.audience,
           COUNT(DISTINCT e2.session_id || ':' || json_extract(e2.payload, '$.chapterId') || ':' || json_extract(e2.payload, '$.stepId')) AS steps
    FROM session_audience sa
    JOIN events e2 ON sa.session_id = e2.session_id AND e2.event_type = 'step_completed'
    WHERE sa.audience IS NOT NULL
    GROUP BY sa.audience
  `).all();

  return { audiences, completionByAudience, stepsPerAudience };
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
  const langSwitches = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'language_switched'`).get().c;

  const callDurations = stmt(`
    SELECT json_extract(payload, '$.durationMs') AS ms
    FROM events WHERE event_type = 'call_ended' AND json_extract(payload, '$.durationMs') > 0
    ORDER BY ms
  `).all().map(r => r.ms);

  const avgCallDuration = callDurations.length > 0
    ? Math.round(callDurations.reduce((s, v) => s + v, 0) / callDurations.length / 1000)
    : 0;
  const n = callDurations.length;
  const medianCallDuration = n === 0 ? 0
    : n % 2 === 1 ? Math.round(callDurations[Math.floor(n / 2)] / 1000)
    : Math.round((callDurations[n / 2 - 1] + callDurations[n / 2]) / 2000);
  const longestCall = n > 0 ? Math.round(callDurations[n - 1] / 1000) : 0;

  return { totalCalls, sessionsWithCalls, toolUsage, handoffs, langSwitches, avgCallDuration, medianCallDuration, longestCall };
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
  const ttsProviders = stmt(`
    SELECT json_extract(payload, '$.value') AS provider, COUNT(*) AS c
    FROM events
    WHERE event_type = 'agent_configured' AND json_extract(payload, '$.field') = 'ttsProvider'
    GROUP BY provider ORDER BY c DESC LIMIT 10
  `).all();
  return { voices, languages, names, ttsProviders };
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
  const avgMinutes = n > 0
    ? Math.round(sessionDurations.reduce((s, r) => s + r.minutes, 0) / n)
    : 0;
  const fastest = n > 0 ? sessionDurations[0].minutes : 0;
  const slowest = n > 0 ? sessionDurations[n - 1].minutes : 0;

  return { medianMinutes, avgMinutes, fastest, slowest, totalSessions: n };
}

export function getTimePerChapter() {
  const rows = stmt(`
    SELECT
      json_extract(e.payload, '$.chapterId') AS chapterId,
      json_extract(e.payload, '$.chapterSlug') AS chapterSlug,
      e.session_id,
      MIN(e.created_at) AS first_step,
      MAX(e.created_at) AS last_step,
      CAST((julianday(MAX(e.created_at)) - julianday(MIN(e.created_at))) * 1440 AS INTEGER) AS minutes
    FROM events e
    WHERE e.event_type IN ('step_completed', 'step_viewed')
    GROUP BY e.session_id, chapterId
    HAVING COUNT(DISTINCT json_extract(e.payload, '$.stepId')) > 1
    ORDER BY CAST(chapterId AS INTEGER)
  `).all();

  const byChapter = {};
  for (const r of rows) {
    const key = r.chapterId;
    if (!byChapter[key]) byChapter[key] = { chapterId: r.chapterId, chapterSlug: r.chapterSlug, durations: [] };
    byChapter[key].durations.push(r.minutes);
  }

  return Object.values(byChapter).map(ch => {
    const d = ch.durations.sort((a, b) => a - b);
    const n = d.length;
    const median = n === 0 ? 0
      : n % 2 === 1 ? d[Math.floor(n / 2)]
      : Math.round((d[n / 2 - 1] + d[n / 2]) / 2);
    return { chapterId: ch.chapterId, chapterSlug: ch.chapterSlug, medianMinutes: median, sessions: n };
  });
}

export function getHourlyActivity() {
  return stmt(`
    SELECT CAST(strftime('%H', created_at) AS INTEGER) AS hour, COUNT(*) AS events
    FROM events
    GROUP BY hour
    ORDER BY hour
  `).all();
}

export function getDropOffPoints() {
  return stmt(`
    SELECT json_extract(payload, '$.chapterSlug') AS chapter,
           json_extract(payload, '$.stepSlug') AS step,
           json_extract(payload, '$.chapterId') AS chapterId,
           json_extract(payload, '$.stepId') AS stepId,
           COUNT(DISTINCT session_id) AS viewed
    FROM events
    WHERE event_type = 'step_viewed'
    GROUP BY chapterId, stepId
    ORDER BY CAST(chapterId AS INTEGER), CAST(stepId AS INTEGER)
  `).all();
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

export function getShareStats() {
  const totalShares = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'share_clicked'`).get().c;
  const sessionsShared = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'share_clicked'`).get().c;

  const byPlatform = stmt(`
    SELECT json_extract(payload, '$.platform') AS platform,
           COUNT(*) AS clicks,
           COUNT(DISTINCT session_id) AS sessions
    FROM events
    WHERE event_type = 'share_clicked'
    GROUP BY platform
    ORDER BY clicks DESC
  `).all();

  const byAudience = stmt(`
    ${CURRENT_AUDIENCE_SQL}
    SELECT sa.audience,
           json_extract(e2.payload, '$.platform') AS platform,
           COUNT(*) AS clicks,
           COUNT(DISTINCT e2.session_id) AS sessions
    FROM session_audience sa
    JOIN events e2 ON sa.session_id = e2.session_id AND e2.event_type = 'share_clicked'
    WHERE sa.audience IS NOT NULL
    GROUP BY sa.audience, platform
    ORDER BY sa.audience, clicks DESC
  `).all();

  return { totalShares, sessionsShared, byPlatform, byAudience };
}

export function getEngagementStats() {
  const eventsPerSession = stmt(`
    SELECT session_id, COUNT(*) AS events
    FROM events
    GROUP BY session_id
    ORDER BY events DESC
  `).all();

  const n = eventsPerSession.length;
  const avgEvents = n > 0
    ? Math.round(eventsPerSession.reduce((s, r) => s + r.events, 0) / n)
    : 0;
  const maxEvents = n > 0 ? eventsPerSession[0].events : 0;
  const minEvents = n > 0 ? eventsPerSession[n - 1].events : 0;

  const sessionsWithConfig = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'agent_configured'`).get().c;
  const sessionsWithBadges = stmt(`SELECT COUNT(DISTINCT session_id) AS c FROM events WHERE event_type = 'badge_earned'`).get().c;
  const totalResets = stmt(`SELECT COUNT(*) AS c FROM events WHERE event_type = 'progress_reset'`).get().c;

  return { avgEvents, maxEvents, minEvents, sessionsWithConfig, sessionsWithBadges, totalResets };
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
    timePerChapter: getTimePerChapter(),
    hourlyActivity: getHourlyActivity(),
    dropOff: getDropOffPoints(),
    skipAhead: getSkipAheadStats(),
    engagement: getEngagementStats(),
    shares: getShareStats(),
    recent: getRecentActivity(),
  };
}
