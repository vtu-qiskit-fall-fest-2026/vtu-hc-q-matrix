from __future__ import annotations

import importlib.util
import os


def status() -> dict[str, object]:
    """Report capabilities without importing heavy SDKs at API startup."""
    qiskit_installed = importlib.util.find_spec("qiskit") is not None
    aer_installed = importlib.util.find_spec("qiskit_aer") is not None
    runtime_installed = importlib.util.find_spec("qiskit_ibm_runtime") is not None
    return {
        "id": "qiskit",
        "name": "Qiskit / IBM Quantum",
        "sdk_installed": qiskit_installed,
        "local_aer_available": aer_installed,
        "ibm_runtime_available": runtime_installed and bool(os.getenv("IBM_QUANTUM_TOKEN")),
        "credentials_source": "server environment only",
    }
