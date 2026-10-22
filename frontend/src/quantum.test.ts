import { describe, expect, it } from 'vitest'
import { probability, simulate } from './quantum'
describe('MVP statevector',()=>{it('creates a Bell state',()=>{const s=simulate([{id:'h',type:'H',qubit:0},{id:'cx',type:'CNOT',qubit:0,target:1}]);expect(probability(s[0])).toBeCloseTo(.5);expect(probability(s[3])).toBeCloseTo(.5)})})
