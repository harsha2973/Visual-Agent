import pytest

@pytest.mark.asyncio
async def test_register_and_login_flow(client):
    # 1. Test POST /api/v1/register
    reg_payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
        "full_name": "Test User",
    }
    response = await client.post("/api/v1/register", json=reg_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["full_name"] == "Test User"
    assert "id" in data

    # 2. Test duplicate email registration
    dup_response = await client.post("/api/v1/register", json=reg_payload)
    assert dup_response.status_code == 400
    assert dup_response.json()["detail"] == "User with this email already exists"

    # 3. Test POST /api/v1/login with valid credentials
    login_payload = {
        "email": "testuser@example.com",
        "password": "SecurePassword123!",
    }
    login_res = await client.post("/api/v1/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["email"] == "testuser@example.com"

    # 4. Test POST /api/v1/login with invalid password
    invalid_login = await client.post("/api/v1/login", json={
        "email": "testuser@example.com",
        "password": "WrongPassword",
    })
    assert invalid_login.status_code == 401
