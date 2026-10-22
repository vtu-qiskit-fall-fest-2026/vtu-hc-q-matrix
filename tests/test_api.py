import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_bell_state_simulation():
    response = client.post("/api/simulate", json={
        "qubits": 2, "shots": 256,
        "gates": [
            {"id": "h", "type": "H", "qubit": 0},
            {"id": "cx", "type": "CNOT", "qubit": 0, "target": 1},
        ],
    })
    assert response.status_code == 200
    probs = response.json()["probabilities"]
    assert probs[0] == pytest.approx(0.5)
    assert probs[3] == pytest.approx(0.5)


def test_learning_and_hardware_endpoints():
    assert client.get("/api/dashboard").json()["profile"]["level"] == 8
    assert len(client.get("/api/hardware/components").json()["items"]) == 6
    reply = client.post("/api/ai/chat", json={"message": "Give me a hint"}).json()
    assert reply["mode"] == "socratic"
    assert client.get("/api/backends").status_code == 200
