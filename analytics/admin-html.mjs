export function renderAdminPage(data, adminKey) {
  const { overview, funnel, chapters, audience, calls, agentConfig, pacing, skipAhead, recent } = data;
  const completionRate = overview.totalSessions > 0
    ? Math.round((overview.totalCompleted / overview.totalSessions) * 100)
    : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Workshop Analytics</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0f1a; color: #e0e0e0; padding: 24px; }
  h1 { font-size: 24px; margin-bottom: 8px; color: #fff; }
  .subtitle { color: #888; font-size: 14px; margin-bottom: 24px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 32px; }
  .card { background: #141b2d; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; }
  .card-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .card-value { font-size: 32px; font-weight: 700; color: #fff; }
  .card-value.red { color: #f22f46; }
  .section { margin-bottom: 32px; }
  .section h2 { font-size: 18px; color: #fff; margin-bottom: 16px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
  .bar-row { display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; }
  .bar-label { width: 200px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .bar-track { flex: 1; height: 24px; background: #1e293b; border-radius: 4px; margin: 0 12px; position: relative; }
  .bar-fill { height: 100%; background: #f22f46; border-radius: 4px; min-width: 2px; transition: width 0.3s; }
  .bar-count { width: 50px; text-align: right; flex-shrink: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { text-align: left; padding: 8px 12px; border-bottom: 1px solid #1e293b; color: #888; font-weight: 500; }
  td { padding: 8px 12px; border-bottom: 1px solid #0f1629; }
  tr:hover td { background: #141b2d; }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
  .tag-builder { background: #1e3a5f; color: #60a5fa; }
  .tag-explorer { background: #3b1f4a; color: #c084fc; }
  .tag-event { background: #1e293b; color: #94a3b8; }
  .refresh-note { color: #555; font-size: 12px; margin-top: 8px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }
  .list-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 13px; }
  .list-item:last-child { border-bottom: none; }
</style>
</head>
<body>
<h1>Workshop Analytics</h1>
<p class="subtitle">Auto-refreshes every 30 seconds <span class="refresh-note" id="lastUpdate"></span></p>

<div class="grid">
  <div class="card">
    <div class="card-label">Total Users</div>
    <div class="card-value">${overview.totalSessions}</div>
  </div>
  <div class="card">
    <div class="card-label">Active Today</div>
    <div class="card-value">${overview.sessionsToday}</div>
  </div>
  <div class="card">
    <div class="card-label">Builders</div>
    <div class="card-value">${overview.builders}</div>
  </div>
  <div class="card">
    <div class="card-label">Explorers</div>
    <div class="card-value">${overview.explorers}</div>
  </div>
  <div class="card">
    <div class="card-label">Completion Rate</div>
    <div class="card-value red">${completionRate}%</div>
  </div>
  <div class="card">
    <div class="card-label">Total Calls</div>
    <div class="card-value">${overview.totalCalls}</div>
  </div>
</div>

<div class="section">
  <h2>Completion Funnel</h2>
  ${funnel.length === 0 ? '<p style="color:#555">No data yet</p>' : funnel.map(row => {
    const pct = overview.totalSessions > 0 ? Math.round((row.sessions / overview.totalSessions) * 100) : 0;
    return `<div class="bar-row">
      <span class="bar-label">${esc(row.chapter)}/${esc(row.step)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
      <span class="bar-count">${row.sessions}</span>
    </div>`;
  }).join('')}
</div>

<div class="two-col">
  <div class="section">
    <h2>Audience Breakdown</h2>
    ${audience.audiences.map(a => `<div class="list-item">
      <span><span class="tag tag-${cssClass(a.audience)}">${esc(a.audience)}</span></span>
      <span>${a.sessions} users</span>
    </div>`).join('')}
    ${audience.completionByAudience.length > 0 ? '<div style="margin-top:12px;color:#888;font-size:12px">Completed workshop:</div>' +
      audience.completionByAudience.map(a => `<div class="list-item">
        <span><span class="tag tag-${cssClass(a.audience)}">${esc(a.audience)}</span></span>
        <span>${a.completed}</span>
      </div>`).join('') : ''}
  </div>

  <div class="section">
    <h2>Call Stats</h2>
    <div class="list-item"><span>Total calls</span><span>${calls.totalCalls}</span></div>
    <div class="list-item"><span>Users who called</span><span>${calls.sessionsWithCalls}</span></div>
    <div class="list-item"><span>Handoffs triggered</span><span>${calls.handoffs}</span></div>
    ${calls.toolUsage.length > 0 ? '<div style="margin-top:12px;color:#888;font-size:12px">Tool usage:</div>' +
      calls.toolUsage.map(t => `<div class="list-item"><span>${esc(t.tool)}</span><span>${t.c}</span></div>`).join('') : ''}
  </div>
</div>

<div class="two-col">
  <div class="section">
    <h2>Agent Config</h2>
    ${agentConfig.voices.length > 0 ? '<div style="color:#888;font-size:12px;margin-bottom:8px">Popular voices:</div>' +
      agentConfig.voices.map(v => `<div class="list-item"><span>${esc(v.voice || '(default)')}</span><span>${v.c}</span></div>`).join('') : ''}
    ${agentConfig.languages.length > 0 ? '<div style="color:#888;font-size:12px;margin-top:12px;margin-bottom:8px">Languages:</div>' +
      agentConfig.languages.map(l => `<div class="list-item"><span>${esc(l.language)}</span><span>${l.c}</span></div>`).join('') : ''}
    ${agentConfig.names.length > 0 ? '<div style="color:#888;font-size:12px;margin-top:12px;margin-bottom:8px">Agent names:</div>' +
      agentConfig.names.slice(0, 10).map(n => `<div class="list-item"><span>${esc(n.name || '(unnamed)')}</span><span>${n.c}</span></div>`).join('') : ''}
  </div>

  <div class="section">
    <h2>Pacing</h2>
    <div class="list-item"><span>Median session</span><span>${pacing.medianMinutes} min</span></div>
    <div class="list-item"><span>Average session</span><span>${pacing.avgMinutes} min</span></div>
    <div class="list-item"><span>Sessions tracked</span><span>${pacing.totalSessions}</span></div>
    ${skipAhead.totalSkips > 0 ? `
      <div style="margin-top:16px;color:#888;font-size:12px">Skip-ahead:</div>
      <div class="list-item"><span>Total skips</span><span>${skipAhead.totalSkips}</span></div>
      <div class="list-item"><span>Users who skipped</span><span>${skipAhead.sessionsSkipped}</span></div>
    ` : ''}
  </div>
</div>

<div class="section">
  <h2>Recent Activity</h2>
  <table>
    <thead><tr><th>Time</th><th>Session</th><th>Event</th><th>Details</th></tr></thead>
    <tbody>
    ${recent.map(r => {
      const payload = r.payload ? tryParse(r.payload) : null;
      const detail = payload ? summarize(r.event_type, payload) : '';
      return `<tr>
        <td>${esc(r.created_at)}</td>
        <td style="font-family:monospace;font-size:11px">${esc(r.session_id.slice(0, 8))}</td>
        <td><span class="tag tag-event">${esc(r.event_type)}</span></td>
        <td>${esc(detail)}</td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
</div>

<script>
  document.getElementById('lastUpdate').textContent = 'Updated: ' + new Date().toLocaleTimeString();
  setInterval(() => location.reload(), 30000);
</script>
</body>
</html>`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cssClass(str) {
  return String(str || '').replace(/[^a-zA-Z0-9-]/g, '');
}

function tryParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

function summarize(type, p) {
  switch (type) {
    case 'step_completed': return `${p.chapterSlug}/${p.stepSlug}`;
    case 'step_viewed': return `${p.chapterSlug}/${p.stepSlug}`;
    case 'session_started': return p.audience;
    case 'audience_changed': return `${p.from} → ${p.to}`;
    case 'call_initiated': return p.agentName || p.callSid?.slice(0, 10) || '';
    case 'agent_configured': return `${p.field}: ${p.value}`;
    case 'badge_earned': return p.badgeId;
    case 'skip_ahead': return `→ ${p.toStep}`;
    case 'tool_used': return p.toolName;
    case 'call_connected': return p.callSid?.slice(0, 10) || '';
    case 'call_ended': return p.durationMs ? `${Math.round(p.durationMs / 1000)}s` : '';
    default: return '';
  }
}
