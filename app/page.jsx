'use client';

import { useEffect, useMemo, useState } from 'react';

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function generateHashtags(topic, audience, goal) {
  const base = topic.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  const tags = new Set();
  const seeds = [
    'shorts', 'youtubeshorts', 'viral', 'fyp', 'foryou', 'trending',
    ...base.slice(0, 3), audience.toLowerCase().replace(/\s+/g, ''), goal
  ].filter(Boolean);
  seeds.forEach(t => tags.add('#' + t.replace(/[^a-z0-9]/gi, '')));
  while (tags.size < 12) tags.add('#' + randChoice(['lifehacks','howto','tips','motivation','daily','quick','fast','wow','learn','today']));
  return Array.from(tags).slice(0, 15);
}

function durationToBeats(duration) {
  const d = parseInt(duration, 10) || 30;
  const total = clamp(d, 15, 60);
  const hook = clamp(Math.round(total * 0.18), 3, 8);
  const value = clamp(Math.round(total * 0.64), 8, 40);
  const cta = clamp(total - hook - value, 3, 10);
  return { total, hook, value, cta };
}

function time(mm) {
  return mm.toString().padStart(2, '0');
}

function timestampSegments({ hook, value, cta }) {
  let t = 0;
  const segs = [];
  segs.push({ label: 'Hook', start: 0, end: hook }); t += hook;
  const valueSegs = 3;
  const per = Math.floor(value / valueSegs);
  for (let i = 0; i < valueSegs; i++) {
    const len = i === valueSegs - 1 ? (value - per * (valueSegs - 1)) : per;
    segs.push({ label: `Beat ${i+1}`, start: t, end: t + len });
    t += len;
  }
  segs.push({ label: 'CTA', start: t, end: t + cta });
  return segs;
}

function titleOptions(topic, outcome, tone) {
  const frames = [
    `I Tried ${topic} So You Don't Have To`,
    `${outcome} in 30 Seconds (${topic})`,
    `You're Doing ${topic} Wrong (Do This Instead)`,
    `${topic} Mistakes Everyone Makes`,
    `${topic} Cheatcode Nobody Talks About`,
    `The FASTEST ${topic} Trick You'll See Today`,
    `${topic} in 3 Steps (Works)`,
    `${tone} ${topic}: Watch This Before You Start`,
  ];
  return shuffle(frames).slice(0, 5);
}

function hookOptions(topic, tone, audience) {
  const hooks = [
    `Stop scrolling. If you ${audience.toLowerCase()}, this will save you hours?`,
    `You won't believe this ${topic.toLowerCase()} trick (but it works).`,
    `${tone} truth: You're doing ${topic.toLowerCase()} the slow way. Try this.`,
    `If ${topic.toLowerCase()} feels hard, you're one step away?`,
    `Here's how I 10x'd my ${topic.toLowerCase()} in 30 seconds.`,
    `You're losing views doing ${topic.toLowerCase()} like this ? fix it.`,
  ];
  return shuffle(hooks).slice(0, 6);
}

function brollIdeas(topic) {
  return [
    `Close-up of hands demonstrating ${topic.toLowerCase()}`,
    'Fast screen captures with zooms and highlights',
    'Quick before/after split-screen reveal',
    'Overhead top-shot with minimal props',
    'Text-on-screen kinetic typography for key words',
    'Reaction face cutaways for emphasis',
  ];
}

function ctaOptions(goal) {
  const map = {
    views: ['Follow for part 2', 'Like + save if helpful', 'Comment "MORE" for a full guide'],
    subscribers: ['Subscribe for daily 30s tips', 'Hit + to not miss part 2'],
    sales: ['Grab the free checklist in bio', 'Type "GUIDE" and I?ll DM it']
  };
  return map[goal] || map.views;
}

function generateScript({ topic, audience, goal, tone, pacing, duration, trends }) {
  const beats = durationToBeats(duration);
  const segs = timestampSegments(beats);
  const emph = pacing === 'fast' ? ['QUICK', 'NOW', 'FAST'] : pacing === 'story' ? ['STORY', 'WHY', 'SECRET'] : ['TIP', 'DO THIS', 'EASY'];

  const hook = randChoice(hookOptions(topic, tone, audience));
  const valueBeats = [
    `Do this first: replace X with Y for instant ${topic.toLowerCase()} wins.`,
    `Then, use the 80/20: focus on the one action that drives results.`,
    `Finally, package it with a pattern interrupt: ${randChoice(['pop text', 'sound effect', 'jump cut', 'zoom in'])}.`
  ];
  const cta = randChoice(ctaOptions(goal));

  const script = [
    { t: `00:${time(segs[0].end)}`, label: segs[0].label, line: hook.toUpperCase() + ` (${randChoice(emph)})` },
    { t: `00:${time(segs[1].end)}`, label: segs[1].label, line: valueBeats[0] },
    { t: `00:${time(segs[2].end)}`, label: segs[2].label, line: valueBeats[1] },
    { t: `00:${time(segs[3].end)}`, label: segs[3].label, line: valueBeats[2] },
    { t: `00:${time(segs[4].end)}`, label: segs[4].label, line: cta }
  ];

  const captions = script.map(s => ({ at: s.t, text: s.line }));
  const thumb = [
    `Big word: "${randChoice(['STOP','WAIT','HOLD UP','SECRET'])}" + face + prop`,
    `Clean 2-word: "${topic.split(' ')[0]} HACK" + arrow`,
    `Before/After frames + bold outline text`
  ];

  return {
    beats,
    titles: titleOptions(topic, goal === 'sales' ? 'Sales' : 'Results', tone),
    hooks: hookOptions(topic, tone, audience),
    broll: brollIdeas(topic),
    script,
    captions,
    hashtags: generateHashtags(topic, audience, goal),
    thumbnail: thumb,
    trends: trends ? [`Use trending sound: ${trends}`, 'Add on-beat cuts every 0.4s'] : ['Use your best performer sound', 'Cut on beat every 0.5s']
  };
}

function useHashState(key, initial) {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    try {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const v = hash.get(key);
      if (v) setValue(JSON.parse(decodeURIComponent(v)));
    } catch {}
  }, [key]);
  useEffect(() => {
    try {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      hash.set(key, encodeURIComponent(JSON.stringify(value)));
      window.history.replaceState(null, '', '#' + hash.toString());
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

export default function Page() {
  const [topic, setTopic] = useHashState('topic', 'Content Creation');
  const [audience, setAudience] = useHashState('aud', 'Beginners');
  const [goal, setGoal] = useHashState('goal', 'views');
  const [tone, setTone] = useHashState('tone', 'Practical');
  const [pacing, setPacing] = useHashState('pace', 'fast');
  const [duration, setDuration] = useHashState('dur', 30);
  const [trend, setTrend] = useHashState('trend', '');

  const [out, setOut] = useState(null);
  const canGen = topic.trim().length >= 3;

  const onGenerate = () => {
    const res = generateScript({ topic, audience, goal, tone, pacing, duration, trends: trend });
    setOut(res);
  };

  useEffect(() => {
    if (!out && canGen) onGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        onGenerate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [topic, audience, goal, tone, pacing, duration, trend]);

  const copy = (text) => navigator.clipboard.writeText(text);
  const dl = (name, data) => {
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="row">
          <span className="badge">Agent</span>
          <div className="title">Viral YouTube Shorts Agent</div>
        </div>
        <div className="row subtle small">
          <span className="kb">ALT + G</span> Generate
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.1fr 1.4fr' }}>
        {/* Inputs */}
        <div className="card" style={{ padding: 16 }}>
          <div className="grid">
            <div>
              <label className="label">Topic / Niche</label>
              <input className="input" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g., Instagram Reels growth" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Audience</label>
                <select className="select" value={audience} onChange={e=>setAudience(e.target.value)}>
                  {['Beginners','Intermediate','Advanced','Busy Professionals','Students','Creators','Entrepreneurs'].map(x=> (
                    <option key={x} value={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Primary Goal</label>
                <select className="select" value={goal} onChange={e=>setGoal(e.target.value)}>
                  <option value="views">More Views</option>
                  <option value="subscribers">Subscribers</option>
                  <option value="sales">Sales/Leads</option>
                </select>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label className="label">Tone</label>
                <select className="select" value={tone} onChange={e=>setTone(e.target.value)}>
                  {['Practical','Entertaining','Bold','Motivational','Calm','Story'].map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Pacing</label>
                <select className="select" value={pacing} onChange={e=>setPacing(e.target.value)}>
                  <option value="fast">Fast</option>
                  <option value="balanced">Balanced</option>
                  <option value="story">Story</option>
                </select>
              </div>
              <div>
                <label className="label">Duration (s)</label>
                <input type="number" className="input" value={duration} onChange={e=>setDuration(e.target.value)} min={15} max={60} />
              </div>
            </div>

            <div>
              <label className="label">Trending Sound / Keyword (optional)</label>
              <input className="input" value={trend} onChange={e=>setTrend(e.target.value)} placeholder="e.g., Laxed (Siren Beat)" />
            </div>

            <div className="row" style={{ marginTop: 6 }}>
              <button className="btn" onClick={onGenerate} disabled={!canGen}>Generate</button>
              <button className="btn secondary" onClick={()=> setOut(o => ({...o, hooks: hookOptions(topic, tone, audience)}))} disabled={!out}>New Hook Ideas</button>
              <button className="btn secondary" onClick={()=> out && dl('shorts_plan.json', JSON.stringify({ topic, audience, goal, tone, pacing, duration, trend, output: out }, null, 2))} disabled={!out}>Export JSON</button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="card" style={{ padding: 16 }}>
          {!out ? (
            <div className="subtle">Fill inputs and click Generate to create titles, hooks, a beat-timed script, b-roll ideas, captions, hashtags, and a thumbnail concept.</div>
          ) : (
            <div className="grid">
              <section className="section">
                <div className="heading">
                  <div className="section-title">Titles</div>
                  <button className="copy" onClick={()=>copy(out.titles.join('\n'))}>Copy</button>
                </div>
                <ul>
                  {out.titles.map((t,i)=> <li key={i}>? {t}</li>)}
                </ul>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Hook Options</div>
                  <button className="copy" onClick={()=>copy(out.hooks.join('\n'))}>Copy</button>
                </div>
                <ul>
                  {out.hooks.map((t,i)=> <li key={i}>? {t}</li>)}
                </ul>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Beat-Timed Script</div>
                  <button className="copy" onClick={()=>copy(out.script.map(s=>`[${s.t}] ${s.label}: ${s.line}`).join('\n'))}>Copy</button>
                </div>
                <ol>
                  {out.script.map((s,i)=> (
                    <li key={i}>
                      <span className="badge" style={{ marginRight: 8 }}>{s.t}</span>
                      <strong style={{ marginRight: 6 }}>{s.label}:</strong>
                      <span>{s.line}</span>
                    </li>
                  ))}
                </ol>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">B-Roll & Visuals</div>
                  <button className="copy" onClick={()=>copy(out.broll.map(x=>'? '+x).join('\n'))}>Copy</button>
                </div>
                <ul>
                  {out.broll.map((t,i)=> <li key={i}>? {t}</li>)}
                </ul>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Captions (Timed)</div>
                  <button className="copy" onClick={()=>copy(out.captions.map(c=>`[${c.at}] ${c.text}`).join('\n'))}>Copy</button>
                </div>
                <ol>
                  {out.captions.map((c,i)=> <li key={i}>[{c.at}] {c.text}</li>)}
                </ol>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Hashtags</div>
                  <button className="copy" onClick={()=>copy(out.hashtags.join(' '))}>Copy</button>
                </div>
                <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  {out.hashtags.map((h,i)=> <span key={i} className="badge">{h}</span>)}
                </div>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Thumbnail Ideas</div>
                  <button className="copy" onClick={()=>copy(out.thumbnail.join('\n'))}>Copy</button>
                </div>
                <ul>
                  {out.thumbnail.map((t,i)=> <li key={i}>? {t}</li>)}
                </ul>
              </section>

              <hr className="sep" />

              <section className="section">
                <div className="heading">
                  <div className="section-title">Trends & Timing</div>
                  <button className="copy" onClick={()=>copy(out.trends.join('\n'))}>Copy</button>
                </div>
                <ul>
                  {out.trends.map((t,i)=> <li key={i}>? {t}</li>)}
                </ul>
              </section>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16 }} className="subtle small">Tip: Press <span className="kb">ALT + G</span> to regenerate quickly.</div>
    </div>
  );
}
