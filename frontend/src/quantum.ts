export type GateType = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'CNOT' | 'M'
export interface Gate { id: string; type: GateType; qubit: number; target?: number }
export interface Complex { re: number; im: number }
const mul=(a:Complex,b:Complex):Complex=>({re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re})
const add=(a:Complex,b:Complex):Complex=>({re:a.re+b.re,im:a.im+b.im})
const s=Math.SQRT1_2
const matrices:Record<Exclude<GateType,'CNOT'|'M'>,[[Complex,Complex],[Complex,Complex]]>={
  H:[[{re:s,im:0},{re:s,im:0}],[{re:s,im:0},{re:-s,im:0}]],X:[[{re:0,im:0},{re:1,im:0}],[{re:1,im:0},{re:0,im:0}]],
  Y:[[{re:0,im:0},{re:0,im:-1}],[{re:0,im:1},{re:0,im:0}]],Z:[[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:-1,im:0}]],
  S:[[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:0,im:1}]],T:[[{re:1,im:0},{re:0,im:0}],[{re:0,im:0},{re:s,im:s}]],
}
export function simulate(gates:Gate[],qubits=2,through=gates.length):Complex[]{
  let state=Array.from({length:2**qubits},(_,i)=>({re:i===0?1:0,im:0}))
  for(const gate of gates.slice(0,through)){
    if(gate.type==='M')continue
    if(gate.type==='CNOT'){
      const next=state.map(v=>({...v}))
      state.forEach((amp,i)=>{if((i>>gate.qubit)&1)next[i^(1<<(gate.target??1))]=amp})
      state=next;continue
    }
    const m=matrices[gate.type],next=state.map(v=>({...v}))
    for(let i=0;i<state.length;i++)if(((i>>gate.qubit)&1)===0){const j=i|(1<<gate.qubit);next[i]=add(mul(m[0][0],state[i]),mul(m[0][1],state[j]));next[j]=add(mul(m[1][0],state[i]),mul(m[1][1],state[j]))}
    state=next
  }
  return state
}
export const probability=(v:Complex)=>v.re**2+v.im**2
export function toQasm(gates:Gate[]):string{const rows=['OPENQASM 2.0;','include "qelib1.inc";','qreg q[2];','creg c[2];'];gates.forEach(g=>rows.push(g.type==='CNOT'?`cx q[${g.qubit}],q[${g.target??1}];`:g.type==='M'?`measure q[${g.qubit}] -> c[${g.qubit}];`:`${g.type.toLowerCase()} q[${g.qubit}];`));return rows.join('\n')}
