# Implemented solution architecture

```text
React + TypeScript
├── gamified dashboard, quests, XP, league and adaptive mastery
├── Quantum Galaxy generated from the curriculum prerequisite graph
├── visual circuit lab + local statevector fallback
└── interactive quantum-machine anatomy
              │ /api
FastAPI
├── simulation and validation
├── dashboard, progress and recommendation data
├── grounded tutor response contract
└── hardware component model
```

The browser simulator keeps the demo responsive when the API is unavailable. When FastAPI is running, the UI displays **API LIVE**, synchronizes user actions, obtains hardware data, uses the tutor endpoint, and verifies simulations server-side.

The current simulator is intentionally bounded to 12 qubits and 256 gates. It does not execute arbitrary user Python. A production Qiskit worker should run in a network-disabled, resource-limited container and accept a validated circuit IR rather than raw code.
