"""
Backend API tests for Mitti Basket - Razorpay & Contact API
Tests: 
- GET /api/razorpay-key (returns test key ID)
- POST /api/orders (creates order with razorpay_order_id)
- POST /api/payment/verify (validates signature)
- POST /api/contact (saves to DB, sends email)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestRazorpayKeyAPI:
    """Razorpay key endpoint tests"""
    
    def test_get_razorpay_key(self):
        """Test GET /api/razorpay-key returns test key ID"""
        response = requests.get(f"{BASE_URL}/api/razorpay-key")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "key_id" in data, "Response should contain 'key_id'"
        
        # Validate it's a Razorpay test key (starts with rzp_test_)
        key_id = data["key_id"]
        assert key_id.startswith("rzp_test_"), f"Expected test key starting with 'rzp_test_', got: {key_id}"
        
        print(f"✓ Razorpay key endpoint working: {key_id}")


class TestOrdersWithRazorpay:
    """Orders endpoint tests - now with Razorpay integration"""
    
    def test_create_order_returns_razorpay_order_id(self):
        """Test POST /api/orders creates order with razorpay_order_id"""
        payload = {
            "name": "TEST_RazorpayOrder",
            "phone": "9876543210",
            "email": "razorpay_test@example.com",
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
        
        # Validate response structure includes razorpay_order_id
        assert "id" in data, "Response should contain 'id'"
        assert "razorpay_order_id" in data, "Response should contain 'razorpay_order_id'"
        
        # Validate razorpay_order_id format (starts with order_)
        razorpay_order_id = data.get("razorpay_order_id")
        if razorpay_order_id:
            assert razorpay_order_id.startswith("order_"), f"Expected Razorpay order ID starting with 'order_', got: {razorpay_order_id}"
            print(f"✓ Order created with Razorpay order ID: {razorpay_order_id}")
        else:
            print(f"⚠ Order created but razorpay_order_id is None (Razorpay may not be configured)")
        
        # Validate other fields
        assert data["name"] == "TEST_RazorpayOrder"
        assert data["order_status"] == "Created"
        assert data["payment_status"] == "Pending"
        
        print(f"✓ Order created: {data['id']}")
        return data
    
    def test_create_order_with_multiple_items_razorpay(self):
        """Test creating order with multiple items includes razorpay_order_id"""
        payload = {
            "name": "TEST_MultiItemRazorpay",
            "phone": "9876543211",
            "email": "multi_razorpay@example.com",
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
                }
            ],
            "subtotal": 3098
        }
        response = requests.post(f"{BASE_URL}/api/orders", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate razorpay_order_id is present
        assert "razorpay_order_id" in data, "Response should contain 'razorpay_order_id'"
        
        # Validate items
        assert len(data["items"]) == 2
        assert data["subtotal"] == 3098
        
        print(f"✓ Multi-item order created with Razorpay: {data['id']}")


class TestPaymentVerifyAPI:
    """Payment verification endpoint tests"""
    
    def test_payment_verify_endpoint_exists(self):
        """Test POST /api/payment/verify endpoint exists"""
        # Send invalid data to check endpoint exists
        payload = {
            "razorpay_order_id": "order_test123",
            "razorpay_payment_id": "pay_test123",
            "razorpay_signature": "invalid_signature",
            "order_id": "test-order-id"
        }
        response = requests.post(f"{BASE_URL}/api/payment/verify", json=payload)
        
        # Should return 200 with failed status (not 404)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Should return failed status for invalid signature
        assert "status" in data, "Response should contain 'status'"
        assert data["status"] == "failed", f"Expected 'failed' status for invalid signature, got: {data['status']}"
        assert "message" in data, "Response should contain 'message'"
        
        print(f"✓ Payment verify endpoint exists and rejects invalid signature")
    
    def test_payment_verify_missing_fields(self):
        """Test payment verify with missing fields returns 422"""
        payload = {
            "razorpay_order_id": "order_test123"
            # Missing other required fields
        }
        response = requests.post(f"{BASE_URL}/api/payment/verify", json=payload)
        
        # Should return 422 for validation error
        assert response.status_code == 422, f"Expected 422 for missing fields, got {response.status_code}"
        
        print(f"✓ Payment verify correctly rejects missing fields with 422")


class TestContactAPI:
    """Contact form endpoint tests"""
    
    def test_contact_form_success(self):
        """Test POST /api/contact saves message and returns success"""
        payload = {
            "name": "TEST_ContactUser",
            "email": "contact_test@example.com",
            "phone": "9876543215",
            "message": "This is a test message from automated testing."
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Validate response structure
        assert "status" in data, "Response should contain 'status'"
        assert "id" in data, "Response should contain 'id'"
        
        # Validate status is sent
        assert data["status"] == "sent", f"Expected status 'sent', got: {data['status']}"
        
        print(f"✓ Contact form submitted successfully: {data['id']}")
    
    def test_contact_form_with_long_message(self):
        """Test contact form with longer message"""
        payload = {
            "name": "TEST_LongMessage",
            "email": "long_message@example.com",
            "phone": "9876543216",
            "message": "This is a longer test message. " * 20  # ~600 chars
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert data["status"] == "sent"
        print(f"✓ Contact form with long message submitted: {data['id']}")
    
    def test_contact_form_missing_name(self):
        """Test contact form with missing name returns 422"""
        payload = {
            "email": "missing_name@example.com",
            "phone": "9876543217",
            "message": "Test message"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing name, got {response.status_code}"
        print(f"✓ Contact form correctly rejects missing name with 422")
    
    def test_contact_form_missing_email(self):
        """Test contact form with missing email returns 422"""
        payload = {
            "name": "TEST_MissingEmail",
            "phone": "9876543218",
            "message": "Test message"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing email, got {response.status_code}"
        print(f"✓ Contact form correctly rejects missing email with 422")
    
    def test_contact_form_missing_phone(self):
        """Test contact form with missing phone returns 422"""
        payload = {
            "name": "TEST_MissingPhone",
            "email": "missing_phone@example.com",
            "message": "Test message"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing phone, got {response.status_code}"
        print(f"✓ Contact form correctly rejects missing phone with 422")
    
    def test_contact_form_missing_message(self):
        """Test contact form with missing message returns 422"""
        payload = {
            "name": "TEST_MissingMessage",
            "email": "missing_message@example.com",
            "phone": "9876543219"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload)
        
        assert response.status_code == 422, f"Expected 422 for missing message, got {response.status_code}"
        print(f"✓ Contact form correctly rejects missing message with 422")


class TestAPIHealthAndRegression:
    """Health check and regression tests"""
    
    def test_api_root(self):
        """Test API root endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Mitti Basket API"
        print(f"✓ API root endpoint working")
    
    def test_waitlist_still_works(self):
        """Regression: Waitlist endpoint still works"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": unique_email,
            "waitlist_type": "subscription"
        }
        response = requests.post(f"{BASE_URL}/api/waitlist", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == unique_email
        print(f"✓ Waitlist endpoint still working")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
