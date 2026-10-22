import { useMemo, useState } from 'react'
import {
  Atom, BookOpen, Bot, Box, ChevronRight, CircleHelp, Code2, Flame,
  GraduationCap, LayoutGrid, Lightbulb, Maximize2, MessageCircle, MoreHorizontal,
  Pause, Play, Plus, RotateCcw, Share2, Sparkles, StepForward, Trophy, X,
} from 'lucide-react'
import { Gate, GateType, probability, simulate, toQasm } from './quantum'
import LearningHub, { HubPage } from './LearningHub'

const starter: Gate[] = [
  { id: 'h-0', type: 'H', qubit: 0 },
  { id: 'cx-0', type: 'CNOT', qubit: 0, target: 1 },
  { id: 'm-0', type: 'M', qubit: 0 },
  { id: 'm-1', type: 'M', qubit: 1 },
]

const palette: { type: GateType; name: string; tone: string }[] = [
  { type: 'H', name: 'Hadamard', tone: 'violet' },
  { type: 'X', name: 'Pauli X', tone: 'cyan' },
  { type: 'Y', name: 'Pauli Y', tone: 'cyan' },
  { type: 'Z', name: 'Pauli Z', tone: 'cyan' },
  { type: 'S', name: 'Phase S', tone: 'amber' },
  { type: 'T', name: 'Phase T', tone: 'amber' },
  { type: 'CNOT', name: 'Controlled X', tone: 'pink' },
  { type: 'M', name: 'Measure', tone: 'green' },
]

const paths = [
  { label: 'Quantum basics', done: true },
  { label: 'Single-qubit gates', done: true },
  { label: 'Entanglement', active: true },
  { label: 'Quantum algorithms' },
]

const labStages = [
  { name: 'Aim', note: 'Create and verify a maximally entangled two-qubit Bell state.' },
  { name: 'Theory', note: 'Learn how superposition and controlled operations create non-classical correlations.' },
  { name: 'Pretest', note: 'Check your understanding before entering the simulation.' },
  { name: 'Procedure', note: 'Apply H to q₀, connect q₀ → q₁ with CNOT, then measure both qubits.' },
  { name: 'Simulation', note: 'Build, run, and inspect the statevector and measurement distribution.' },
  { name: 'Posttest', note: 'Test what you learned and earn mastery XP.' },
  { name: 'References', note: 'Review trusted resources and continue exploring.' },
]

function App() {
  const [page, setPage] = useState<HubPage | 'lab'>('home')
  const [gates, setGates] = useState<Gate[]>(starter)
  const [running, setRunning] = useState(false)
  const [step, setStep] = useState(gates.length)
  const [view, setView] = useState<'3D' | '2D'>('3D')
  const [tab, setTab] = useState<'circuit' | 'code'>('circuit')
  const [selectedWire, setSelectedWire] = useState(0)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorText, setTutorText] = useState('')
  const [message, setMessage] = useState('')
  const [toast, setToast] = useState('')
  const [stage, setStage] = useState('Simulation')
  const [apiState, setApiState] = useState<'local' | 'verified'>('local')
  const state = useMemo(() => simulate(gates, 2, step), [gates, step])
  const probs = state.map(probability)
  const entangled = probs[0] > .45 && probs[3] > .45 && probs[1] < .05 && probs[2] < .05

  const addGate = (type: GateType, qubit = selectedWire) => {
    const gate: Gate = {
      id: `${type}-${Date.now()}`,
      type,
      qubit,
      ...(type === 'CNOT' ? { target: qubit === 0 ? 1 : 0 } : {}),
    }
    const next = [...gates.filter(g => g.type !== 'M'), gate, ...gates.filter(g => g.type === 'M')]
    setGates(next)
    setStep(next.length)
  }

  const run = async () => {
    setRunning(true)
    setStep(gates.length)
    try {
      const response = await fetch('/api/simulate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qubits: 2, shots: 1024, gates }),
      })
      if (response.ok) setApiState('verified')
    } catch { setApiState('local') }
    window.setTimeout(() => setRunning(false), 700)
  }

  const reset = () => { setGates([]); setStep(0) }
  const loadBell = () => { setGates(starter); setStep(starter.length); setToast('Bell template loaded') }
  const share = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setToast('Share link copied')
    window.setTimeout(() => setToast(''), 1800)
  }
  const notify = (text: string) => { setToast(text); window.setTimeout(() => setToast(''), 1800) }
  const askTutor = async () => {
    if (!message.trim()) return
    const fallback = entangled
      ? 'Great observation. The H gate gives q₀ two equal possibilities, then CNOT correlates q₁ with it. Neither qubit has a definite value alone—but together they always agree.'
      : 'Try placing an H gate on q₀, followed by a CNOT with q₀ as control. Watch which basis states keep non-zero amplitude.'
    try {
      const response = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message, concept: 'entanglement', circuit_summary: toQasm(gates) }) })
      const data = await response.json()
      setTutorText(data.answer || fallback)
    } catch { setTutorText(fallback) }
    setMessage('')
  }

  if (page !== 'lab') {
    return <LearningHub page={page} onNavigate={setPage} onOpenLab={() => setPage('lab')} />
  }

  return (
    <main className="app-shell">
      <div className="aurora a1" /><div className="aurora a2" /><div className="stars" />
      <header className="topbar">
        <button className="brand" onClick={() => setPage('home')} aria-label="QuantumQuest home"><span className="brand-mark"><Atom size={22} /></span><b>Quantum</b><span>Quest</span></button>
        <nav aria-label="Primary navigation">
          <button onClick={() => setPage('home')}><BookOpen size={17} /> Learn</button>
          <button className="active" onClick={() => notify('Sandbox ready')}><LayoutGrid size={17} /> Sandbox</button>
          <button onClick={() => setPage('quests')}><Trophy size={17} /> Challenges</button>
        </nav>
        <div className="header-actions">
          <div className="streak"><Flame size={17} fill="currentColor" /><b>12</b><span>day streak</span></div>
          <button className="icon-btn" aria-label="Help" onClick={() => setTutorOpen(true)}><CircleHelp size={19} /></button>
          <button className="avatar" onClick={() => setPage('home')}>CM</button>
        </div>
      </header>

      <section className="context-bar">
        <div className="crumb"><GraduationCap size={16} /> Quantum fundamentals <ChevronRight size={14} /> <b>Entanglement</b></div>
        <div className="lesson-progress"><span>Lesson 3 of 6</span><div><i /></div><b>50%</b></div>
      </section>

      <div className="workspace">
        <aside className="path-panel glass">
          <div className="panel-label">YOUR PATH</div>
          <div className="path-title">Quantum<br />Fundamentals</div>
          <div className="xp-pill"><Sparkles size={14} /> 620 XP</div>
          <ol className="path-list">
            {paths.map((item, i) => <li key={item.label} className={item.active ? 'active' : item.done ? 'done' : ''}>
              <span>{item.done ? '✓' : i + 1}</span><div><b>{item.label}</b><small>{item.active ? 'In progress · 3 of 6' : item.done ? 'Complete' : 'Locked'}</small></div>
            </li>)}
          </ol>
          <button className="outline-button" onClick={() => setPage('paths')}><BookOpen size={15} /> Course overview</button>
        </aside>

        <section className="main-column">
          <article className="lesson-intro glass">
            <div className="lesson-copy"><span className="eyebrow">EXPERIMENT 3.2 · {stage.toUpperCase()}</span><h1>Entangled states</h1><p>{labStages.find(item => item.name === stage)?.note}</p></div>
            <button className="explain-btn" onClick={() => setTutorOpen(true)}><Lightbulb size={17} /> Explain differently</button>
            <div className="experiment-nav" aria-label="Experiment stages">{labStages.map((item, i) => <button key={item.name} className={stage === item.name ? 'active' : ''} onClick={() => setStage(item.name)}><span>{i + 1}</span>{item.name}</button>)}</div>
          </article>

          <article className="composer glass">
            <div className="composer-head">
              <div className="segmented">
                <button className={tab === 'circuit' ? 'active' : ''} onClick={() => setTab('circuit')}><LayoutGrid size={15} /> Circuit</button>
                <button className={tab === 'code' ? 'active' : ''} onClick={() => setTab('code')}><Code2 size={15} /> Code</button>
              </div>
              <div className="composer-actions"><button onClick={loadBell}><Box size={15} /> Templates</button><button aria-label="Expand circuit" onClick={() => document.documentElement.requestFullscreen?.()}><Maximize2 size={15} /></button><button aria-label="More circuit options" onClick={() => setTab('code')}><MoreHorizontal size={17} /></button></div>
            </div>
            {tab === 'circuit' ? <>
              <div className="gate-palette" aria-label="Gate palette">
                {palette.map(g => <button key={g.type} draggable onDragStart={e => e.dataTransfer.setData('gate', g.type)} onClick={() => addGate(g.type)} title={g.name} className={g.tone}>{g.type === 'M' ? '⌁' : g.type}<small>{g.name}</small></button>)}
              </div>
              <div className="circuit-board">
                {[0, 1].map(q => <div className={`wire ${selectedWire === q ? 'selected' : ''}`} key={q} onClick={() => setSelectedWire(q)} onDragOver={e => e.preventDefault()} onDrop={e => addGate(e.dataTransfer.getData('gate') as GateType, q)}>
                  <span className="wire-label"><b>q{q}</b><small>|0〉</small></span><i />
                  <div className="placed-gates">
                    {gates.map((g, index) => g.qubit === q && <button key={g.id} aria-label={`Remove ${g.type} gate from qubit ${q}`} className={`placed ${g.type.toLowerCase()} ${index >= step ? 'pending' : ''}`} style={{ left: `${index * 72 + 24}px` }} onClick={e => { e.stopPropagation(); setGates(old => old.filter(x => x.id !== g.id)); setStep(s => Math.min(s, gates.length - 1)) }} title="Click to remove">{g.type === 'M' ? '⌁' : g.type}</button>)}
                    {gates.map((g, index) => g.type === 'CNOT' && g.target === q && <span key={`${g.id}-target`} className="target" style={{ left: `${index * 72 + 38}px` }}>⊕</span>)}
                  </div>
                </div>)}
                {gates.map((g, index) => g.type === 'CNOT' && <span key={`${g.id}-line`} className="control-line" style={{ left: `${index * 72 + 122}px` }} />)}
                {!gates.length && <div className="empty-hint"><Plus size={16} /> Drag or tap a gate to begin</div>}
              </div>
              <div className="board-foot"><span><i className="live-dot" /> {apiState === 'verified' ? 'API verified' : 'Local statevector'} · 2 qubits</span><span>Click a gate to remove it</span></div>
            </> : <div className="code-view"><div className="line-numbers">1<br />2<br />3<br />4<br />5<br />6<br />7<br />8</div><pre>{toQasm(gates)}</pre><button onClick={() => { navigator.clipboard?.writeText(toQasm(gates)); setToast('OpenQASM copied') }}>Copy QASM</button></div>}
          </article>
        </section>

        <aside className="viz-column">
          <article className="visualizer glass">
            <div className="viz-head"><div><span className="panel-label">STATE VISUALIZER</span><h3>{view === '3D' ? 'Q-sphere' : 'Probabilities'}</h3></div><div className="view-toggle"><button className={view === '2D' ? 'active' : ''} onClick={() => setView('2D')}>2D</button><button className={view === '3D' ? 'active' : ''} onClick={() => setView('3D')}>3D</button></div></div>
            <div className={`quantum-viz ${running ? 'running' : ''}`}>
              {view === '3D' ? <div className="q-sphere">
                <div className="orbit o1" /><div className="orbit o2" /><div className="sphere-glow" />
                <span className={`state-point p00 ${probs[0] > .1 ? 'on' : ''}`}><i />|00〉</span>
                <span className={`state-point p01 ${probs[1] > .1 ? 'on' : ''}`}><i />|01〉</span>
                <span className={`state-point p10 ${probs[2] > .1 ? 'on' : ''}`}><i />|10〉</span>
                <span className={`state-point p11 ${probs[3] > .1 ? 'on' : ''}`}><i />|11〉</span>
                <div className="axis horizontal" /><div className="axis vertical" />
              </div> : <div className="amplitude-bars">{probs.map((p, i) => <div key={i}><span style={{ height: `${Math.max(3, p * 170)}px` }} /><b>{Math.round(p * 100)}%</b><small>|{i.toString(2).padStart(2, '0')}〉</small></div>)}</div>}
            </div>
            <div className={`insight ${entangled ? 'success' : ''}`}><Sparkles size={16} /><div><b>{entangled ? 'Bell state created!' : 'Build an entangled pair'}</b><p>{entangled ? '|00〉 and |11〉 are perfectly correlated.' : 'Add H to q0, then connect the qubits with CNOT.'}</p></div></div>
          </article>
          <article className="results glass">
            <div className="results-head"><div><span className="panel-label">MEASUREMENT</span><h3>1,024 shots</h3></div><span className="backend">Local simulator</span></div>
            <div className="histogram">{probs.map((p, i) => <div className="hist-row" key={i}><b>{i.toString(2).padStart(2, '0')}</b><div><i style={{ width: `${p * 100}%` }} /></div><span>{Math.round(p * 1024)}</span></div>)}</div>
          </article>
        </aside>
      </div>

      <div className="ornament" role="toolbar" aria-label="Simulation controls">
        <button className="run-button" onClick={run} disabled={running}>{running ? <Pause size={18} /> : <Play size={18} fill="currentColor" />} {running ? 'Running' : 'Run'}</button>
        <button onClick={() => setStep(s => Math.min(gates.length, s + 1))}><StepForward size={19} /><span>Step</span></button>
        <button onClick={reset}><RotateCcw size={18} /><span>Reset</span></button><i />
        <div className="step-status">Step <b>{step}</b> / {gates.length}</div>
        <button onClick={share}><Share2 size={18} /><span>Share</span></button>
      </div>

      <button className="tutor-orb" onClick={() => setTutorOpen(!tutorOpen)} aria-label="Open AI tutor"><span><Bot size={25} /></span><div><b>Ask Nova</b><small>AI quantum tutor</small></div></button>
      {tutorOpen && <section className="tutor-card glass">
        <div className="tutor-head"><span><Bot size={19} /></span><div><b>Nova</b><small>Quantum tutor · API connected</small></div><button aria-label="Close tutor" onClick={() => setTutorOpen(false)}><X size={17} /></button></div>
        <div className="tutor-body"><div className="nova-message">{tutorText || <>Think of entanglement like two quantum coins with a shared secret. Want me to explain what your circuit is doing?</>}</div>{tutorText && <div className="user-message">Explain my circuit</div>}</div>
        <div className="suggestions"><button onClick={() => setMessage('Explain my circuit')}>Explain my circuit</button><button onClick={() => setMessage('Give me a hint')}>Give me a hint</button></div>
        <div className="chat-input"><input aria-label="Message Nova" value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && askTutor()} placeholder="Ask about this lesson…" /><button aria-label="Send message" onClick={askTutor}><MessageCircle size={17} /></button></div>
      </section>}
      {toast && <div className="toast">✓ {toast}</div>}
    </main>
  )
}

export default App
