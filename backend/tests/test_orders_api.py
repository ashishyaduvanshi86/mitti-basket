"""
Backend API tests for Mitti Basket - Orders API
Tests: POST /api/orders (cart checkout flow)
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


class TestOrdersAPI:
    """Orders endpoint tests for cart checkout flow"""
    
    def test_create_order_success(self):
        """Test creating an order with valid data"""
        payload = {
            "name": "TEST_User",
            "phone": "9876543210",
            "email": "test@example.com",
            "address": "123 Test Street, Bangalore",
            "pincode": "560001",
            "items": [
                {
                    "name": "Langra Mango",
                    "quantity": "5 kg",
                    "unit_price": 1799,
                    "total_price": 1799
                }
            ],
            "subtotal": 1799
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "id" in data, "Response should contain 'id'"
        assert "name" in data, "Response should contain 'name'"
        assert "phone" in data, "Response should contain 'phone'"
        assert "email" in data, "Response should contain 'email'"
        assert "address" in data, "Response should contain 'address'"
        assert "pincode" in data, "Response should contain 'pincode'"
        assert "items" in data, "Response should contain 'items'"
        assert "subtotal" in data, "Response should contain 'subtotal'"
        assert "order_status" in data, "Response should contain 'order_status'"
        assert "payment_status" in data, "Response should contain 'payment_status'"
        assert "created_at" in data, "Response should contain 'created_at'"
        
        # Validate values
        assert data["name"] == "TEST_User"
        assert data["phone"] == "9876543210"
        assert data["email"] == "test@example.com"
        assert data["address"] == "123 Test Street, Bangalore"
        assert data["pincode"] == "560001"
        assert data["subtotal"] == 1799
        assert data["order_status"] == "Pending"
        assert data["payment_status"] == "Pending"
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Langra Mango"
        
        print(f"✓ Created order: {data['id']}")
    
    def test_create_order_multiple_items(self):
        """Test creating an order with multiple items"""
        payload = {
            "name": "TEST_MultiItem",
            "phone": "9876543211",
            "email": "multi@example.com",
            "address": "456 Test Avenue, Bangalore",
            "pincode": "560002",
            "items": [
                {
                    "name": "Langra Mango",
                    "quantity": "5 kg",
                    "unit_price": 1799,
                    "total_price": 1799
                },
                {
                    "name": "A2 Desi Ghee",
                    "quantity": "1 kg",
                    "unit_price": 1299,
                    "total_price": 1299
                },
                {
                    "name": "Premium Makhana",
                    "quantity": "500 gm",
                    "unit_price": 349,
                    "total_price": 698
                }
            ],
            "subtotal": 3796
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate multiple items
        assert len(data["items"]) == 3
        assert data["subtotal"] == 3796
        
        print(f"✓ Created order with {len(data['items'])} items: {data['id']}")
    
    def test_create_order_without_email(self):
        """Test creating an order without optional email"""
        payload = {
            "name": "TEST_NoEmail",
            "phone": "9876543212",
            "email": "",
            "address": "789 Test Road, Bangalore",
            "pincode": "560003",
            "items": [
                {
                    "name": "Shahi Litchi",
                    "quantity": "2 kg",
                    "unit_price": 699,
                    "total_price": 699
                }
            ],
            "subtotal": 699
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Email should be empty string
        assert data["email"] == ""
        
        print(f"✓ Created order without email: {data['id']}")
    
    def test_create_order_missing_required_fields(self):
        """Test that missing required fields return error"""
        # Missing phone
        payload = {
            "name": "TEST_MissingPhone",
            "email": "test@example.com",
            "address": "Test Address",
            "pincode": "560001",
            "items": [{"name": "Test", "quantity": "1 kg", "unit_price": 100, "total_price": 100}],
            "subtotal": 100
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing phone, got {response.status_code}"
        print(f"✓ Missing phone field correctly rejected with 422")
    
    def test_create_order_missing_name(self):
        """Test that missing name returns error"""
        payload = {
            "phone": "9876543213",
            "email": "test@example.com",
            "address": "Test Address",
            "pincode": "560001",
            "items": [{"name": "Test", "quantity": "1 kg", "unit_price": 100, "total_price": 100}],
            "subtotal": 100
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        print(f"✓ Missing name field correctly rejected with 422")
    
    def test_create_order_empty_items(self):
        """Test creating order with empty items array"""
        payload = {
            "name": "TEST_EmptyItems",
            "phone": "9876543214",
            "email": "test@example.com",
            "address": "Test Address",
            "pincode": "560001",
            "items": [],
            "subtotal": 0
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        # Empty items should still be accepted (business logic may vary)
        # The API currently accepts empty items
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert len(data["items"]) == 0
        print(f"✓ Order with empty items created: {data['id']}")


class TestWaitlistAPI:
    """Waitlist endpoint tests (regression)"""
    
    def test_create_waitlist_entry(self):
        """Test creating waitlist entry"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "waitlist_type": "subscription"
        }
        response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == unique_email
        print(f"✓ Created waitlist entry: {data['email']}")
    
    def test_get_waitlist_entries(self):
        """Test retrieving waitlist entries"""
        response = requests.get(f"{BASE_URL}/api/waitlist")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Retrieved {len(data)} waitlist entries")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
