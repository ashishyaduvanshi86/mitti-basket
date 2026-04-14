"""
Backend API tests for Mitti Basket - Waitlist API
Tests: POST /api/waitlist, GET /api/waitlist
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Mitti Basket API"
        print(f"✓ API root endpoint working: {data}")


class TestWaitlistAPI:
    """Waitlist endpoint tests"""
    
    def test_create_waitlist_entry_with_email_only(self):
        """Test creating waitlist entry with email only"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "waitlist_type": "subscription"
        }
        response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "id" in data
        assert "email" in data
        assert "waitlist_type" in data
        assert "created_at" in data
        
        # Validate values
        assert data["email"] == unique_email
        assert data["waitlist_type"] == "subscription"
        print(f"✓ Created waitlist entry: {data['email']}")
    
    def test_create_waitlist_entry_with_name(self):
        """Test creating waitlist entry with name and email"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "name": "Test User",
            "waitlist_type": "subscription"
        }
        response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == unique_email
        assert data["name"] == "Test User"
        assert data["waitlist_type"] == "subscription"
        print(f"✓ Created waitlist entry with name: {data['name']}, {data['email']}")
    
    def test_create_newsletter_waitlist_entry(self):
        """Test creating newsletter type waitlist entry"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "waitlist_type": "newsletter"
        }
        response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["email"] == unique_email
        assert data["waitlist_type"] == "newsletter"
        print(f"✓ Created newsletter entry: {data['email']}")
    
    def test_duplicate_email_returns_existing(self):
        """Test that duplicate email returns existing entry"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "waitlist_type": "subscription"
        }
        
        # First submission
        response1 = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Second submission with same email
        response2 = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        assert response2.status_code == 200
        data2 = response2.json()
        
        # Should return same entry
        assert data1["id"] == data2["id"]
        assert data1["email"] == data2["email"]
        print(f"✓ Duplicate email handled correctly: {data1['email']}")
    
    def test_get_waitlist_entries(self):
        """Test retrieving all waitlist entries"""
        response = requests.get(f"{BASE_URL}/api/waitlist")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be a list
        assert isinstance(data, list)
        
        # If entries exist, validate structure
        if len(data) > 0:
            entry = data[0]
            assert "id" in entry
            assert "email" in entry
            assert "waitlist_type" in entry
            assert "created_at" in entry
        
        print(f"✓ Retrieved {len(data)} waitlist entries")
    
    def test_create_and_verify_persistence(self):
        """Test that created entry persists in database"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "name": "Persistence Test",
            "waitlist_type": "subscription"
        }
        
        # Create entry
        create_response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        assert create_response.status_code == 200
        created = create_response.json()
        
        # Verify in GET list
        get_response = requests.get(f"{BASE_URL}/api/waitlist")
        assert get_response.status_code == 200
        entries = get_response.json()
        
        # Find our entry
        found = False
        for entry in entries:
            if entry["email"] == unique_email:
                found = True
                assert entry["name"] == "Persistence Test"
                assert entry["waitlist_type"] == "subscription"
                break
        
        assert found, f"Created entry {unique_email} not found in GET response"
        print(f"✓ Entry persisted and verified: {unique_email}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
