from app.models.user import User
from app.services.auth import create_access_token, hash_password, verify_password, _jwt_decode


def test_password_round_trip():
    encoded = hash_password("StrongPass123!")
    assert verify_password("StrongPass123!", encoded)
    assert not verify_password("wrong-password", encoded)


def test_jwt_round_trip():
    user = User(id=7, name="Test Recruiter", email="test@example.com", password_hash="x", role="Recruiter")
    token = create_access_token(user)
    payload = _jwt_decode(token)
    assert payload["sub"] == "7"
    assert payload["email"] == "test@example.com"
