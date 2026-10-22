from __future__ import annotations

import math
import random
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from backend.quantum.qiskit_adapter import status as qiskit_status

app = FastAPI(title="QuantumSpace API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


class Gate(BaseModel):
    id: str
    type: Literal["H", "X", "Y", "Z", "S", "T", "CNOT", "M"]
    qubit: int = Field(ge=0, le=11)
    target: int | None = Field(default=None, ge=0, le=11)


class SimulationRequest(BaseModel):
    qubits: int = Field(default=2, ge=1, le=12)
    shots: int = Field(default=1024, ge=1, le=100_000)
    gates: list[Gate] = Field(max_length=256)


class ActionRequest(BaseModel):
    action: str = Field(min_length=1, max_length=80)
    item_id: str | None = Field(default=None, max_length=80)


class TutorRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    concept: str = Field(default="entanglement", max_length=80)
    circuit_summary: str | None = Field(default=None, max_length=2000)


EXPERIMENTS = [
    {"id": "measurement", "title": "Quantum measurement", "level": "Beginner"},
    {"id": "bell-state", "title": "Entanglement and Bell states", "level": "Beginner"},
    {"id": "linear-algebra", "title": "Quantum gates in action", "level": "Intermediate"},
    {"id": "shor", "title": "Factorization with Shor's algorithm", "level": "Advanced"},
    {"id": "vqe", "title": "Variational Quantum Eigensolver", "level": "Advanced"},
    {"id": "qsvm", "title": "Quantum support vector machines", "level": "Advanced"},
]

HARDWARE_COMPONENTS = [
    {"id": "runtime", "name": "Classical runtime", "temperature": "300 K", "role": "Coordinates hybrid workflows", "detail": "Runtime servers compile jobs, orchestrate classical computation, and return sampled results.", "signal": "Qiskit primitives"},
    {"id": "control", "name": "Control electronics", "temperature": "300 K", "role": "Shapes microwave pulses", "detail": "DACs, FPGAs, and microwave electronics translate calibrated instructions into precise control and readout pulses.", "signal": "GHz microwave pulses"},
    {"id": "amplifier", "name": "Cryogenic amplifier", "temperature": "4 K", "role": "Amplifies faint readout signals", "detail": "Low-noise amplifiers strengthen the tiny return signal while adding as little noise as possible.", "signal": "Readout return"},
    {"id": "plates", "name": "Thermal stages", "temperature": "50 K → 10 mK", "role": "Remove heat in stages", "detail": "A dilution refrigerator uses successively colder plates and a helium-3/helium-4 mixing chamber.", "signal": "Heat extraction"},
    {"id": "wiring", "name": "Cryogenic wiring", "temperature": "300 K → 10 mK", "role": "Carries signals to the chip", "detail": "Attenuated coax and high-density flex wiring carry control signals while limiting thermal noise.", "signal": "Control + readout"},
    {"id": "qpu", "name": "Superconducting QPU", "temperature": "~10–20 mK", "role": "Runs the quantum circuit", "detail": "Josephson-junction qubits, resonators, and couplers implement gates and measurement near absolute zero.", "signal": "Quantum state"},
]


def simulate_state(request: SimulationRequest) -> list[complex]:
    size = 2**request.qubits
    state = [0j] * size
    state[0] = 1 + 0j
    matrices = {
        "H": ((1 / math.sqrt(2), 1 / math.sqrt(2)), (1 / math.sqrt(2), -1 / math.sqrt(2))),
        "X": ((0, 1), (1, 0)),
        "Y": ((0, -1j), (1j, 0)),
        "Z": ((1, 0), (0, -1)),
        "S": ((1, 0), (0, 1j)),
        "T": ((1, 0), (0, complex(1 / math.sqrt(2), 1 / math.sqrt(2)))),
    }
    for gate in request.gates:
        if gate.qubit >= request.qubits or (gate.target is not None and gate.target >= request.qubits):
            raise HTTPException(422, "Gate references a qubit outside the circuit")
        if gate.type == "M":
            continue
        if gate.type == "CNOT":
            if gate.target is None or gate.target == gate.qubit:
                raise HTTPException(422, "CNOT needs a distinct target qubit")
            next_state = state.copy()
            for index, amplitude in enumerate(state):
                if (index >> gate.qubit) & 1:
                    next_state[index ^ (1 << gate.target)] = amplitude
            state = next_state
            continue
        matrix = matrices[gate.type]
        next_state = state.copy()
        for index in range(size):
            if ((index >> gate.qubit) & 1) == 0:
                paired = index | (1 << gate.qubit)
                next_state[index] = matrix[0][0] * state[index] + matrix[0][1] * state[paired]
                next_state[paired] = matrix[1][0] * state[index] + matrix[1][1] * state[paired]
        state = next_state
    return state


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "simulator": "statevector"}


@app.get("/health", include_in_schema=False)
def platform_health() -> dict[str, str]:
    """Conventional health-check path for hosts and container orchestrators."""
    return health()


@app.get("/api/experiments")
def experiments() -> dict[str, object]:
    stages = ["Aim", "Theory", "Pretest", "Procedure", "Simulation", "Posttest", "References"]
    return {"items": EXPERIMENTS, "stages": stages}


@app.get("/api/dashboard")
def dashboard() -> dict[str, object]:
    return {
        "profile": {"name": "Chinmaya", "level": 8, "xp": 2320, "streak": 12, "energy": 5},
        "mastery": {"gate_intuition": 84, "measurement": 61, "quantum_math": 72},
        "recommendation": {"topic_id": "QI-04", "title": "Entangle your first qubits", "reason": "Best next step from your gate mastery and measurement mistakes."},
    }


@app.get("/api/hardware/components")
def hardware_components() -> dict[str, object]:
    return {
        "items": HARDWARE_COMPONENTS,
        "source_note": "Architecture summary based on public superconducting quantum system documentation.",
    }


@app.get("/api/backends")
def available_backends() -> dict[str, object]:
    return {
        "items": [
            {"id": "browser-statevector", "name": "Browser statevector", "available": True},
            {"id": "api-statevector", "name": "FastAPI statevector", "available": True},
            qiskit_status(),
        ]
    }


@app.post("/api/progress/action")
def progress_action(request: ActionRequest) -> dict[str, object]:
    rewards = {"warmup": 40, "builder": 60, "explorer": 30, "bell": 180, "grover": 350, "noise": 800}
    xp = rewards.get(request.item_id or "", 0)
    return {"ok": True, "action": request.action, "item_id": request.item_id, "xp_awarded": xp}


@app.post("/api/ai/chat")
def tutor_chat(request: TutorRequest) -> dict[str, object]:
    lower = request.message.lower()
    if "hint" in lower:
        answer = "Start with superposition: place H on q0. Then ask which controlled gate can make q1 follow q0 without measuring either qubit."
    elif "hardware" in lower or "machine" in lower:
        answer = "Your circuit becomes calibrated microwave pulses. They travel through attenuated cryogenic wiring to a superconducting QPU near 10–20 mK; readout resonators return a tiny signal that is amplified and decoded classically."
    else:
        answer = "The H gate creates equal amplitudes for q0. CNOT then correlates q1 with q0, producing the Bell state (|00⟩ + |11⟩)/√2. Individual outcomes are random, but the pair always agrees."
    return {"answer": answer, "mode": "socratic", "grounded_in": request.concept}


@app.post("/api/simulate")
def simulate(request: SimulationRequest) -> dict[str, object]:
    state = simulate_state(request)
    probabilities = [abs(value) ** 2 for value in state]
    samples = random.choices(range(len(state)), weights=probabilities, k=request.shots)
    counts: dict[str, int] = {}
    for sample in samples:
        label = format(sample, f"0{request.qubits}b")
        counts[label] = counts.get(label, 0) + 1
    return {
        "backend": "quantumspace-statevector",
        "shots": request.shots,
        "statevector": [{"re": round(v.real, 10), "im": round(v.imag, 10)} for v in state],
        "probabilities": probabilities,
        "counts": counts,
    }


@app.post("/api/ai/debug")
def debug_circuit(request: SimulationRequest) -> dict[str, object]:
    measured = {gate.qubit for gate in request.gates if gate.type == "M"}
    issues = []
    if len(measured) < request.qubits:
        issues.append({
            "severity": "warning",
            "message": "Some qubits are not measured.",
            "hint": "Add a measurement gate after the final operation.",
        })
    return {"valid": not issues, "issues": issues}
