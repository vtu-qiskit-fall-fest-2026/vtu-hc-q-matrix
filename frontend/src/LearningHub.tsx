import { useEffect, useMemo, useState } from 'react'
import {
  Atom, Bell, BookOpen, Bot, BrainCircuit, Check, ChevronRight, CircleUserRound,
  Clock3, Code2, Compass, Cpu, Flame, FlaskConical, Gem, Home, LockKeyhole, Menu,
  Orbit, Play, Search, ShieldCheck, Sparkles, Star, Swords, Target, Trophy,
  Users, Zap,
} from 'lucide-react'
import { DOMAINS, LEARNING_PATHS, TOPICS } from './content/topics.generated'
import HardwareLab from './HardwareLab'
import './hub.css'

export type HubPage = 'home' | 'galaxy' | 'quests' | 'paths' | 'hardware'

interface Props {
  page: HubPage
  onNavigate: (page: HubPage) => void
  onOpenLab: () => void
}

const nav = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'galaxy' as const, label: 'Quantum Galaxy', icon: Orbit },
  { id: 'paths' as const, label: 'Learning paths', icon: Compass },
  { id: 'quests' as const, label: 'Quests', icon: Swords },
  { id: 'hardware' as const, label: 'Machine anatomy', icon: Cpu },
]

const domainColors = ['#8b6cff', '#35d4c7', '#ffb85c', '#ff6e9f', '#5d9dff', '#bb73ff', '#5dd486']

export default function LearningHub({ page, onNavigate, onOpenLab }: Props) {
  const [completed, setCompleted] = useState<string[]>(['warmup'])
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [apiOnline, setApiOnline] = useState(false)
  const visibleTopics = useMemo(() => TOPICS.filter(t => `${t.title} ${t.domainName}`.toLowerCase().includes(query.toLowerCase())).slice(0, 18), [query])
  useEffect(() => { fetch('/api/dashboard').then(r => setApiOnline(r.ok)).catch(() => setApiOnline(false)) }, [])
  const recordAction = async (action:string,itemId?:string) => {
    try { await fetch('/api/progress/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,item_id:itemId})}); setNotice(`${action.replaceAll('_',' ')} synced`) }
    catch { setNotice(`${action.replaceAll('_',' ')} saved locally`) }
    window.setTimeout(()=>setNotice(''),1800)
  }

  return <main className="hub-shell">
    <div className="hub-stars" />
    <aside className="hub-sidebar">
      <button className="hub-logo" onClick={() => onNavigate('home')}><span><Atom size={23} /></span><b>Quantum<span>Quest</span></b></button>
      <nav aria-label="Learning navigation">{nav.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => onNavigate(item.id)}><item.icon size={19} /><span>{item.label}</span>{item.id === 'quests' && <i>3</i>}</button>)}</nav>
      <div className="sidebar-lab"><span><FlaskConical size={21} /></span><div><b>Quantum Lab</b><small>Build & simulate</small></div><button aria-label="Open Quantum Lab" onClick={onOpenLab}><Play size={14} fill="currentColor" /></button></div>
      <div className="sidebar-bottom"><button onClick={()=>recordAction('open_community')}><Users size={18} /> Community</button><button onClick={()=>recordAction('open_profile')}><CircleUserRound size={18} /> My profile</button></div>
    </aside>

    <section className="hub-main">
      <header className="hub-topbar"><button className="mobile-menu" aria-label="Open navigation" onClick={()=>onNavigate('home')}><Menu /></button><div className="hub-search"><Search size={17} /><input value={query} onFocus={()=>onNavigate('galaxy')} onChange={e => {setQuery(e.target.value);onNavigate('galaxy')}} placeholder="Search 180+ quantum topics…" /></div><div className={`api-status ${apiOnline?'online':''}`}><i/>{apiOnline?'API LIVE':'LOCAL MODE'}</div><div className="energy"><Zap size={16} fill="currentColor" /><b>5</b><span>/ 5 energy</span></div><button className="notification" aria-label="Notifications" onClick={()=>recordAction('read_notifications')}><Bell size={19} /><i /></button><button className="hub-avatar" onClick={()=>recordAction('open_profile')}>CM</button></header>

      {page === 'home' && <Dashboard onOpenLab={onOpenLab} completed={completed} setCompleted={setCompleted} onNavigate={onNavigate} />}
      {page === 'galaxy' && <Galaxy topics={visibleTopics} query={query} onOpenLab={onOpenLab} />}
      {page === 'paths' && <Paths onOpenLab={onOpenLab} />}
      {page === 'quests' && <Quests completed={completed} setCompleted={setCompleted} onOpenLab={onOpenLab} />}
      {page === 'hardware' && <HardwareLab onOpenLab={onOpenLab} />}
      {notice && <div className="hub-toast"><Check/> {notice}</div>}
    </section>
  </main>
}

function Dashboard({ onOpenLab, completed, setCompleted, onNavigate }: { onOpenLab: () => void; completed: string[]; setCompleted: (v: string[]) => void; onNavigate:(p:HubPage)=>void }) {
  return <div className="hub-content">
    <div className="welcome-row"><div><span className="overline">THURSDAY, OCTOBER 22</span><h1>Ready to bend reality, Chinmaya?</h1><p>Nova mapped the fastest route to your next breakthrough.</p></div><div className="streak-card"><span><Flame size={21} fill="currentColor" /></span><div><b>12 day streak</b><small>Longest: 18 days</small></div><div className="streak-week">{['M','T','W','T','F','S','S'].map((d,i)=><i className={i<4?'done':''} key={i}>{i<4?'✓':d}</i>)}</div></div></div>

    <section className="continue-card">
      <div className="lesson-planet"><div className="planet-ring" /><Atom size={58} /></div>
      <div className="continue-copy"><span className="mission-label"><Sparkles size={13} /> AI RECOMMENDED MISSION</span><h2>Entangle your first qubits</h2><p>Build a Bell state and discover why two particles can share one quantum fate.</p><div className="lesson-meta"><span><BookOpen size={14} /> Quantum information</span><span><Clock3 size={14} /> 12 min</span><span><Zap size={14} /> +120 XP</span></div><div className="mission-progress"><div><i /></div><span>3 of 5 steps</span></div></div>
      <button className="primary-cta" onClick={onOpenLab}><Play size={17} fill="currentColor" /> Continue mission</button>
    </section>

    <div className="dashboard-grid">
      <section className="dash-panel daily-quests"><div className="section-head"><div><span className="overline">TODAY'S MISSIONS</span><h3>Daily quests</h3></div><span className="reset"><Clock3 size={13} /> Resets in 8h 24m</span></div>
        {[
          { id:'warmup', icon:BrainCircuit, title:'Quantum warm-up', text:'Answer 3 concept questions', xp:40, progress:3, total:3 },
          { id:'builder', icon:Code2, title:'Circuit builder', text:'Run a circuit with 3+ gates', xp:60, progress:2, total:3 },
          { id:'explorer', icon:Orbit, title:'Galaxy explorer', text:'Discover a new topic node', xp:30, progress:0, total:1 },
        ].map(q => { const done=completed.includes(q.id); return <div className={`quest-row ${done?'complete':''}`} key={q.id}><span className="quest-icon"><q.icon size={19}/></span><div className="quest-info"><b>{q.title}</b><small>{q.text}</small><div><i style={{width:`${q.progress/q.total*100}%`}}/></div></div><span className="quest-count">{done?<Check size={16}/>:`${q.progress}/${q.total}`}</span><button onClick={() => {if(!done){setCompleted([...completed,q.id]);fetch('/api/progress/action',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'claim_quest',item_id:q.id})}).catch(()=>undefined)}}}>{done?'Claimed':`+${q.xp} XP`}</button></div>})}
      </section>

      <section className="dash-panel coach-panel"><div className="coach-title"><span><Bot size={23}/></span><div><small>NOVA · AI MENTOR</small><b>Your weekly insight</b></div><i>LIVE</i></div><div className="coach-bubble">You're strong with gates, but measurement probability is slowing you down. I made a 5-minute practice sprint just for you.</div><div className="skill-bars"><div><span>Gate intuition</span><b>84%</b><i><em style={{width:'84%'}}/></i></div><div><span>Measurement</span><b>61%</b><i><em style={{width:'61%'}}/></i></div><div><span>Quantum math</span><b>72%</b><i><em style={{width:'72%'}}/></i></div></div><button onClick={onOpenLab}><Target size={15}/> Start adaptive sprint <ChevronRight size={15}/></button></section>

      <section className="dash-panel path-preview"><div className="section-head"><div><span className="overline">YOUR JOURNEY</span><h3>Quantum Beginner</h3></div><button onClick={() => onNavigate('paths')}>View path <ChevronRight size={14}/></button></div><div className="path-map"><div className="map-line" />{[
        {icon:'ψ',title:'Qubit basics',done:true},{icon:'H',title:'Quantum gates',done:true},{icon:'∞',title:'Entanglement',active:true},{icon:'⌕',title:'Grover search'},{icon:'QFT',title:'QFT'}
      ].map((n,i)=><div className={`map-node ${n.done?'done':''} ${n.active?'active':''}`} key={n.title}><span>{n.done?<Check/>:n.active?<Atom/>:<LockKeyhole/>}</span><b>{n.title}</b><small>{n.done?'Mastered':n.active?'Current mission':i===3?'Unlock at Lv. 9':'Locked'}</small></div>)}</div></section>

      <section className="dash-panel league"><div className="section-head"><div><span className="overline">WEEKLY LEAGUE</span><h3><Gem size={18}/> Photon League</h3></div><span className="rank">#4</span></div>{[['1','AK','Aarav K.','2,840'],['2','ZS','Zoya S.','2,610'],['3','RM','Reyansh M.','2,480'],['4','CM','You','2,320']].map(row=><div className={`league-row ${row[0]==='4'?'you':''}`} key={row[0]}><b>{row[0]}</b><span>{row[1]}</span><strong>{row[2]}</strong><small>{row[3]} XP</small></div>)}<div className="promotion"><Trophy size={15}/> Top 5 advance to Qubit League</div></section>
    </div>
  </div>
}

function Galaxy({ topics, query, onOpenLab }: { topics: typeof TOPICS; query: string; onOpenLab: () => void }) {
  const [selected, setSelected] = useState(topics[0])
  return <div className="hub-content galaxy-page"><div className="page-title"><div><span className="overline">KNOWLEDGE UNIVERSE</span><h1>Quantum Galaxy</h1><p>{TOPICS.length} topics · {DOMAINS.length} domains · one connected journey</p></div><div className="legend"><span><i className="beginner"/>Beginner</span><span><i className="intermediate"/>Intermediate</span><span><i className="advanced"/>Advanced</span><span><i className="frontier"/>Frontier</span></div></div>
    <section className="galaxy-stage"><div className="galaxy-orbit orbit-one"/><div className="galaxy-orbit orbit-two"/><div className="galaxy-core"><Atom/></div>{topics.map((topic,i)=>{const angle=(i/topics.length)*Math.PI*2;const radius=120+(i%3)*80;return <button aria-label={topic.title} title={topic.title} onClick={()=>setSelected(topic)} className={`galaxy-node level-${topic.level} ${selected?.id===topic.id?'selected':''}`} style={{left:`calc(50% + ${Math.cos(angle)*radius}px)`,top:`calc(50% + ${Math.sin(angle)*radius*.56}px)`}} key={topic.id}><i/>{i%4===0&&<span>{topic.title}</span>}</button>})}<div className="domain-chips">{DOMAINS.slice(0,7).map((d,i)=><span style={{'--domain-color':domainColors[i]} as React.CSSProperties} key={d.slug}>{d.name}</span>)}</div></section>
    <aside className="topic-inspector"><span className="topic-code">{selected?.id} · {selected?.levelName}</span><h2>{selected?.title || (query ? 'No match' : 'Choose a star')}</h2><p>{selected?.idea ? `Interactive lab: ${selected.idea}.` : 'Explore the concept through a guided lesson, visual model, and mastery challenge.'}</p><div className="topic-stats"><span><Clock3/> {selected?.estimatedMinutes} min</span><span><Zap/> +100 XP</span></div><b>Prerequisites</b><div className="prereqs">{selected?.prerequisites.length ? selected.prerequisites.map(p=><span key={p}>{p}</span>):<span>None — start here</span>}</div><button onClick={onOpenLab}><Play fill="currentColor"/> Launch mission</button></aside>
  </div>
}

function Paths({ onOpenLab }: { onOpenLab: () => void }) {
  const icons=[Atom,Code2,FlaskConical,BrainCircuit,ShieldCheck,Orbit,Target,Star]
  return <div className="hub-content"><div className="page-title"><div><span className="overline">CHOOSE YOUR DESTINATION</span><h1>Career learning paths</h1><p>AI-adaptive routes built from the complete quantum curriculum.</p></div></div><div className="paths-grid">{LEARNING_PATHS.map((path,i)=>{const Icon=icons[i%icons.length];return <article className="career-card" key={path.id}><div className="career-top"><span style={{'--path-color':domainColors[i%domainColors.length]} as React.CSSProperties}><Icon/></span><i>{i===0?'IN PROGRESS':i===3?'POPULAR':'PATH'}</i></div><h2>{path.name}</h2><p>{path.topics.length} connected missions · hands-on labs · skill certificate</p><div className="career-progress"><span><i style={{width:i===0?'38%':'0%'}}/></span><b>{i===0?'38% complete':'Not started'}</b></div><button onClick={onOpenLab}>{i===0?'Continue path':'Explore path'} <ChevronRight/></button></article>})}</div></div>
}

function Quests({ completed, setCompleted, onOpenLab }: { completed:string[];setCompleted:(v:string[])=>void;onOpenLab:()=>void }) {
  const challenges=[
    {id:'bell',type:'CIRCUIT',title:'Bell State Speedrun',desc:'Create an entangled pair using only two quantum gates.',reward:'180 XP',difficulty:'Easy',color:'#8c70ff'},
    {id:'grover',type:'ALGORITHM',title:'Find the Hidden State',desc:'Use Grover amplification to find |101〉 in two iterations.',reward:'350 XP',difficulty:'Medium',color:'#35d4c7'},
    {id:'noise',type:'BOSS BATTLE',title:'Defeat Decoherence',desc:'Protect a logical qubit from bit-flip noise.',reward:'800 XP',difficulty:'Hard',color:'#ff6e9f'},
  ]
  return <div className="hub-content"><div className="page-title"><div><span className="overline">TEST YOUR QUANTUM INSTINCTS</span><h1>Quest arena</h1><p>Solve circuits, battle noise, and climb the weekly league.</p></div><div className="arena-score"><Trophy/><div><b>2,320</b><small>Season XP</small></div></div></div><div className="quest-grid">{challenges.map((c,i)=><article className="challenge-card" key={c.id} style={{'--challenge':c.color} as React.CSSProperties}><div className="challenge-visual"><div className="challenge-ring r1"/><div className="challenge-ring r2"/><span>{i===0?<Atom/>:i===1?<Search/>:<ShieldCheck/>}</span></div><div className="challenge-copy"><span>{c.type}</span><h2>{c.title}</h2><p>{c.desc}</p><div><small>{c.difficulty}</small><b><Zap/> {c.reward}</b></div><button onClick={()=>{if(!completed.includes(c.id))setCompleted([...completed,c.id]);onOpenLab()}}>Accept quest <ChevronRight/></button></div></article>)}</div><section className="achievement-strip"><div><span><Trophy/></span><b>Quantum achievements</b><small>7 of 42 unlocked</small></div>{['First Superposition','Gate Keeper','Bell Ringer','Code Breaker','Noise Tamer'].map((a,i)=><div className={i<3?'unlocked':''} key={a}><span>{i<3?<Star fill="currentColor"/>:<LockKeyhole/>}</span><b>{a}</b></div>)}</section></div>
}
