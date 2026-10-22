# Quantum Machine Anatomy — research notes

The hardware lesson is an educational cutaway, not a dimensionally exact model of a specific commercial system. It follows the signal path common to superconducting quantum systems:

1. A classical runtime compiles and coordinates a hybrid workload.
2. Control electronics synthesize calibrated microwave pulses.
3. Attenuated cryogenic wiring carries those pulses through successively colder stages.
4. A dilution refrigerator cools the QPU to roughly 10–20 millikelvin.
5. Josephson-junction qubits, resonators, and couplers execute operations.
6. Readout signals return through cryogenic low-noise amplification and classical decoding.

## IBM context researched in October 2026

- IBM describes System Two as combining scalable cryogenic infrastructure, modular qubit-control electronics, and classical runtime servers.
- IBM's public hardware pages list Heron systems with 133/156 programmable qubits and tunable couplers, and Nighthawk with 120 programmable qubits and four-degree square-lattice connectivity.
- IBM Quantum Compute exposes workload execution through Qiskit primitives such as Sampler and Estimator. Actual hardware access requires an IBM account, credentials, quota, and queue availability; this repository does not embed credentials.
- Current hardware claims change quickly. Verify all metrics against the linked official pages before a public demo.

## Interaction reference

The machine cutaway applies the explanatory principles demonstrated by the MIT-licensed [Anatomy](https://github.com/wheresryan22/anatomy) project: a coherent physical object, selectable parts, an exploded state, a live signal trace, and values driven by one model. No Anatomy source or branding is copied into Q-matrix.

## Primary sources

- [IBM Quantum hardware and roadmap](https://www.ibm.com/quantum/hardware)
- [IBM Quantum documentation](https://quantum.cloud.ibm.com/docs/)
- [Introduction to Qiskit](https://quantum.cloud.ibm.com/docs/en/guides/tools-intro)
- [Qiskit IBM Runtime API](https://quantum.cloud.ibm.com/docs/api/qiskit-ibm-runtime/runtime-service)
- [Anatomy repository](https://github.com/wheresryan22/anatomy)
