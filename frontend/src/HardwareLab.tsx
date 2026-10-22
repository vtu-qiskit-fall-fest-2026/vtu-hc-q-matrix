import { useEffect, useState } from 'react'
import { Box, ChevronLeft, ChevronRight, Cpu, Gauge, Info, Play, RotateCcw, Snowflake, Sparkles, Thermometer, Waves, Zap } from 'lucide-react'

type Part={id:string;name:string;temperature:string;role:string;detail:string;signal:string}
const fallback:Part[]=[
  {id:'runtime',name:'Classical runtime',temperature:'300 K',role:'Coordinates hybrid workflows',detail:'Runtime servers compile jobs, orchestrate classical computation, and return sampled results.',signal:'Qiskit primitives'},
  {id:'control',name:'Control electronics',temperature:'300 K',role:'Shapes microwave pulses',detail:'DACs, FPGAs, and microwave electronics translate calibrated instructions into precise control and readout pulses.',signal:'GHz microwave pulses'},
  {id:'amplifier',name:'Cryogenic amplifier',temperature:'4 K',role:'Amplifies faint readout signals',detail:'Low-noise amplifiers strengthen the tiny return signal while adding as little noise as possible.',signal:'Readout return'},
  {id:'plates',name:'Thermal stages',temperature:'50 K → 10 mK',role:'Remove heat in stages',detail:'A dilution refrigerator uses successively colder plates and a helium-3/helium-4 mixing chamber.',signal:'Heat extraction'},
  {id:'wiring',name:'Cryogenic wiring',temperature:'300 K → 10 mK',role:'Carries signals to the chip',detail:'Attenuated coax and high-density flex wiring carry control signals while limiting thermal noise.',signal:'Control + readout'},
  {id:'qpu',name:'Superconducting QPU',temperature:'~10–20 mK',role:'Runs the quantum circuit',detail:'Josephson-junction qubits, resonators, and couplers implement gates and measurement near absolute zero.',signal:'Quantum state'},
]

export default function HardwareLab({onOpenLab}:{onOpenLab:()=>void}){
  const [parts,setParts]=useState(fallback);const [selected,setSelected]=useState(5);const [exploded,setExploded]=useState(true);const [flow,setFlow]=useState(false);const [loading,setLoading]=useState(true)
  useEffect(()=>{fetch('/api/hardware/components').then(r=>r.ok?r.json():Promise.reject()).then(d=>setParts(d.items)).catch(()=>setParts(fallback)).finally(()=>setLoading(false))},[])
  const part=parts[selected]||fallback[5]
  return <div className="hardware-page hub-content"><div className="page-title"><div><span className="overline">INTERACTIVE MACHINE ANATOMY</span><h1>Inside a quantum computer</h1><p>Follow one circuit from Python code to a superconducting qubit—and back.</p></div><div className="hardware-actions"><button onClick={()=>setExploded(!exploded)}><Box/>{exploded?'Assemble':'Explode'} machine</button><button className={flow?'active':''} onClick={()=>setFlow(!flow)}><Play fill="currentColor"/>{flow?'Pause':'Trace'} signal</button></div></div>
    <section className="machine-layout"><div className={`machine-stage ${exploded?'exploded':''} ${flow?'flowing':''}`}>
      <div className="machine-caption"><span>FIG 01</span><b>SUPERCONDUCTING QUANTUM SYSTEM</b><small>Interactive cutaway · not to scale</small></div>
      <div className="runtime-rack machine-part" onClick={()=>setSelected(0)}><i/><i/><i/><span>CLASSICAL<br/>RUNTIME</span></div>
      <div className="control-rack machine-part" onClick={()=>setSelected(1)}><i/><i/><i/><span>CONTROL<br/>ELECTRONICS</span></div>
      <div className="signal-cable"><i/><i/><i/></div>
      <div className="cryostat">
        <div className="cryo-top"><span/><span/><span/><b>DILUTION<br/>REFRIGERATOR</b></div>
        <button className="thermal t50" onClick={()=>setSelected(3)}><span>50 K</span></button>
        <button className="thermal t4" onClick={()=>setSelected(2)}><span>4 K</span></button>
        <button className="thermal t1" onClick={()=>setSelected(3)}><span>1 K</span></button>
        <button className="thermal t100" onClick={()=>setSelected(3)}><span>100 mK</span></button>
        <button className="thermal tmix" onClick={()=>setSelected(5)}><span>10 mK</span></button>
        <div className="cold-wires" onClick={()=>setSelected(4)}>{Array.from({length:7},(_,i)=><i key={i}/>)}</div>
        <button className="qpu-chip" onClick={()=>setSelected(5)}><span>QPU</span><div>{Array.from({length:16},(_,i)=><i key={i}/>)}</div></button>
      </div>
      <div className="temp-scale"><Thermometer/><div><span>300 K · ROOM</span><span>4 K · DEEP SPACE</span><span>10 mK · QUBITS</span></div></div>
      <div className="signal-pulse p1"/><div className="signal-pulse p2"/><div className="signal-pulse p3"/>
      <div className="anatomy-hint"><Info/> Select any component to understand its role</div>
    </div>
    <aside className="machine-inspector"><div className="part-index">0{selected+1} / 0{parts.length}</div><span className="part-icon">{selected===5?<Cpu/>:selected===3?<Snowflake/>:selected===2?<Waves/>:<Zap/>}</span><div className="temp-badge"><Thermometer/>{part.temperature}</div><h2>{part.name}</h2><h3>{part.role}</h3><p>{part.detail}</p><div className="signal-readout"><small>SYSTEM SIGNAL</small><b><i/>{part.signal}</b></div><div className="fact-box"><Sparkles/><p>{selected===5?'A qubit is not a tiny classical switch. Microwave pulses rotate its state, while resonators let us infer the result without directly “seeing” it.':'Every layer solves a different engineering problem: isolation, cooling, control, readout, or hybrid computation.'}</p></div><div className="part-nav"><button onClick={()=>setSelected((selected-1+parts.length)%parts.length)}><ChevronLeft/></button><span>{loading?'Syncing model…':'Model synced with API'}</span><button onClick={()=>setSelected((selected+1)%parts.length)}><ChevronRight/></button></div><button className="hardware-quest" onClick={onOpenLab}><Gauge/> Run a circuit through this machine</button><button className="reset-machine" onClick={()=>{setSelected(5);setExploded(true);setFlow(false)}}><RotateCcw/> Reset view</button></aside>
  </section><div className="source-note">Hardware model based on public superconducting-system architecture. Current IBM-specific metrics should be verified against IBM Quantum documentation before publication.</div></div>
}
