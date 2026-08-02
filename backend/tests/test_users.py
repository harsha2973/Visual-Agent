import pytest

@pytest.mark.asyncio
async def test_get_users_authenticated(client):
    # Register user
    reg_payload = {
        "email": "admin@example.com",
        "password": "Password123!",
        "full_name": "Admin User",
    }
    await client.post("/api/v1/register", json=reg_payload)

    # Login to get JWT Bearer token
    login_res = await client.post("/api/v1/login", json={
        "email": "admin@example.com",
        "password": "Password123!",
    })
    token = login_res.json()["access_token"]

    # Request GET /api/v1/users unauthenticated -> 401
    unauth_res = await client.get("/api/v1/users")
    assert unauth_res.status_code == 401

    # Request GET /api/v1/users with Bearer header -> 200
    headers = {"Authorization": f"Bearer {token}"}
    users_res = await client.get("/api/v1/users", headers=headers)
    assert users_res.status_code == 200
    users_list = users_res.json()
    assert len(users_list) == 1
    assert users_list[0]["email"] == "admin@example.com"
