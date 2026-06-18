import pytest


RESUME_PAYLOAD = {
    "title": "My Test Resume",
    "template": "modern",
    "personal_details": {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "location": "New York"
    },
    "summary": "Passionate software engineer with 3 years experience.",
    "skills": ["Python", "React", "Docker"],
    "education": [
        {
            "institution": "MIT",
            "degree": "B.Sc",
            "field": "Computer Science",
            "end_date": "2022"
        }
    ],
    "experience": [],
    "projects": []
}


def test_create_resume(client, auth_headers):
    res = client.post("/api/resumes/", json=RESUME_PAYLOAD, headers=auth_headers)
    assert res.status_code == 201
    data = res.json()
    assert data["title"] == "My Test Resume"
    assert data["template"] == "modern"
    return data["id"]


def test_list_resumes(client, auth_headers):
    res = client.get("/api/resumes/", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_get_resume(client, auth_headers):
    # Create first
    create_res = client.post("/api/resumes/", json=RESUME_PAYLOAD, headers=auth_headers)
    resume_id = create_res.json()["id"]

    # Get it
    res = client.get(f"/api/resumes/{resume_id}", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["id"] == resume_id


def test_update_resume(client, auth_headers):
    create_res = client.post("/api/resumes/", json=RESUME_PAYLOAD, headers=auth_headers)
    resume_id = create_res.json()["id"]

    res = client.put(f"/api/resumes/{resume_id}", json={"title": "Updated Resume"}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["title"] == "Updated Resume"


def test_delete_resume(client, auth_headers):
    create_res = client.post("/api/resumes/", json=RESUME_PAYLOAD, headers=auth_headers)
    resume_id = create_res.json()["id"]

    res = client.delete(f"/api/resumes/{resume_id}", headers=auth_headers)
    assert res.status_code == 200

    # Verify deleted
    get_res = client.get(f"/api/resumes/{resume_id}", headers=auth_headers)
    assert get_res.status_code == 404


def test_resume_not_found(client, auth_headers):
    res = client.get("/api/resumes/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert res.status_code == 404


def test_unauthorized_access(client):
    res = client.get("/api/resumes/")
    assert res.status_code == 401
