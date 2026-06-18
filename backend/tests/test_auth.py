import pytest


def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "fullname": "Alice Smith",
        "email": "alice@test.com",
        "password": "SecurePass1"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "alice@test.com"


def test_register_duplicate_email(client):
    payload = {"fullname": "Bob", "email": "bob@test.com", "password": "Password1"}
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400


def test_login_success(client):
    client.post("/api/auth/register", json={
        "fullname": "Carol", "email": "carol@test.com", "password": "Password1"
    })
    res = client.post("/api/auth/login", json={
        "email": "carol@test.com", "password": "Password1"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    res = client.post("/api/auth/login", json={
        "email": "carol@test.com", "password": "wrongpass"
    })
    assert res.status_code == 401


def test_get_me(client, auth_headers):
    res = client.get("/api/users/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@careerforge.ai"


def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


def test_forgot_password(client):
    res = client.post("/api/auth/forgot-password", json={"email": "nonexistent@test.com"})
    assert res.status_code == 200  # Always returns 200 to prevent enumeration
