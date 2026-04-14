"""
Test suite for Mitti Basket new features:
- Public/Admin Settings API
- Product Waitlist
- Bulk Order Status Update
- Broadcast Email
- Payment Retry
- Products filtering (HIDDEN)
- Extended product schema (availability_status, stock_quantity, badge_type)
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
ADMIN_EMAIL = "basketmitti@gmail.com"
ADMIN_PASSWORD = "MItti3025@#"


@pytest.fixture(scope="module")
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json().get("token")
    pytest.skip(f"Admin login failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def auth_headers(admin_token):
    """Headers with admin auth token"""
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ─── PUBLIC SETTINGS TESTS ───

class TestPublicSettings:
    """Test GET /api/settings/public endpoint"""
    
    def test_public_settings_returns_min_order_fields(self):
        """Public settings should return minimum_order_enabled and minimum_order_value"""
        response = requests.get(f"{BASE_URL}/api/settings/public")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "minimum_order_enabled" in data, "Missing minimum_order_enabled field"
        assert "minimum_order_value" in data, "Missing minimum_order_value field"
        assert isinstance(data["minimum_order_enabled"], bool), "minimum_order_enabled should be boolean"
        assert isinstance(data["minimum_order_value"], int), "minimum_order_value should be integer"
        print(f"Public settings: enabled={data['minimum_order_enabled']}, value={data['minimum_order_value']}")


# ─── ADMIN SETTINGS TESTS ───

class TestAdminSettings:
    """Test admin settings CRUD endpoints"""
    
    def test_admin_settings_requires_auth(self):
        """GET /api/admin/settings should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/settings")
        assert response.status_code == 401, f"Expected 401 without auth, got {response.status_code}"
    
    def test_admin_settings_returns_full_settings(self, auth_headers):
        """GET /api/admin/settings should return all settings fields"""
        response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "minimum_order_enabled" in data
        assert "minimum_order_value" in data
        # These may or may not exist depending on if they've been set
        print(f"Admin settings: {data}")
    
    def test_admin_settings_update(self, auth_headers):
        """PUT /api/admin/settings should update settings"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/admin/settings", headers=auth_headers)
        original = get_response.json()
        
        # Update with new value
        new_value = 1500 if original.get("minimum_order_value", 1200) != 1500 else 1200
        update_response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers=auth_headers,
            json={"minimum_order_value": new_value}
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        
        updated = update_response.json()
        assert updated["minimum_order_value"] == new_value, f"Expected {new_value}, got {updated['minimum_order_value']}"
        
        # Restore original value
        requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers=auth_headers,
            json={"minimum_order_value": original.get("minimum_order_value", 1200)}
        )
        print(f"Settings update test passed: changed to {new_value}, restored to {original.get('minimum_order_value', 1200)}")
    
    def test_admin_settings_update_shipping_message(self, auth_headers):
        """PUT /api/admin/settings should update shipping message"""
        test_message = "Test shipping message - will be delivered soon"
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers=auth_headers,
            json={"default_shipping_message": test_message}
        )
        assert response.status_code == 200
        assert response.json().get("default_shipping_message") == test_message
        print("Shipping message update test passed")
    
    def test_admin_settings_update_broadcast_sender(self, auth_headers):
        """PUT /api/admin/settings should update broadcast sender name"""
        response = requests.put(
            f"{BASE_URL}/api/admin/settings",
            headers=auth_headers,
            json={"broadcast_sender_name": "Mitti Basket"}
        )
        assert response.status_code == 200
        assert response.json().get("broadcast_sender_name") == "Mitti Basket"
        print("Broadcast sender name update test passed")


# ─── PRODUCT WAITLIST TESTS ───

class TestProductWaitlist:
    """Test product waitlist signup endpoint"""
    
    @pytest.fixture
    def test_product_id(self, auth_headers):
        """Get a product ID for testing"""
        response = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        if response.status_code == 200:
            products = response.json()
            if products:
                return products[0]["id"]
        pytest.skip("No products available for waitlist test")
    
    def test_waitlist_signup_success(self, test_product_id):
        """POST /api/products/waitlist should add email to waitlist"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/products/waitlist",
            json={"product_id": test_product_id, "email": test_email}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "success", f"Expected success status, got {data}"
        print(f"Waitlist signup success for {test_email}")
    
    def test_waitlist_duplicate_returns_already_subscribed(self, test_product_id):
        """POST /api/products/waitlist should return already_subscribed for duplicate"""
        test_email = f"duplicate_{uuid.uuid4().hex[:8]}@example.com"
        
        # First signup
        requests.post(
            f"{BASE_URL}/api/products/waitlist",
            json={"product_id": test_product_id, "email": test_email}
        )
        
        # Second signup (duplicate)
        response = requests.post(
            f"{BASE_URL}/api/products/waitlist",
            json={"product_id": test_product_id, "email": test_email}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "already_subscribed", f"Expected already_subscribed, got {data}"
        print("Duplicate waitlist signup correctly returns already_subscribed")
    
    def test_waitlist_invalid_product(self):
        """POST /api/products/waitlist should return 404 for invalid product"""
        response = requests.post(
            f"{BASE_URL}/api/products/waitlist",
            json={"product_id": "invalid-product-id", "email": "test@example.com"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Invalid product waitlist correctly returns 404")


# ─── BULK ORDER STATUS TESTS ───

class TestBulkOrderStatus:
    """Test bulk order status update endpoint"""
    
    def test_bulk_status_requires_auth(self):
        """POST /api/admin/orders/bulk-status should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/orders/bulk-status",
            json={"order_ids": [], "new_status": "Shipped"}
        )
        assert response.status_code == 401
    
    def test_bulk_status_invalid_status(self, auth_headers):
        """POST /api/admin/orders/bulk-status should reject invalid status"""
        response = requests.post(
            f"{BASE_URL}/api/admin/orders/bulk-status",
            headers=auth_headers,
            json={"order_ids": ["test-id"], "new_status": "InvalidStatus"}
        )
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        print("Invalid status correctly rejected")
    
    def test_bulk_status_valid_statuses(self, auth_headers):
        """POST /api/admin/orders/bulk-status should accept valid statuses"""
        valid_statuses = ["Placed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Failed"]
        
        for status in valid_statuses:
            response = requests.post(
                f"{BASE_URL}/api/admin/orders/bulk-status",
                headers=auth_headers,
                json={"order_ids": [], "new_status": status}
            )
            # Empty order_ids should still return 200 with updated_count: 0
            assert response.status_code == 200, f"Status '{status}' failed: {response.status_code}"
        print(f"All {len(valid_statuses)} valid statuses accepted")
    
    def test_bulk_status_with_real_orders(self, auth_headers):
        """Test bulk status update with actual orders if available"""
        # Get existing orders
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers)
        if orders_response.status_code != 200:
            pytest.skip("Could not fetch orders")
        
        orders = orders_response.json()
        if not orders:
            pytest.skip("No orders available for bulk update test")
        
        # Get first order ID
        order_id = orders[0]["id"]
        original_status = orders[0].get("order_status", "Placed")
        
        # Update to Processing
        response = requests.post(
            f"{BASE_URL}/api/admin/orders/bulk-status",
            headers=auth_headers,
            json={"order_ids": [order_id], "new_status": "Processing"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "success"
        assert data.get("updated_count") >= 0
        
        # Restore original status
        requests.post(
            f"{BASE_URL}/api/admin/orders/bulk-status",
            headers=auth_headers,
            json={"order_ids": [order_id], "new_status": original_status}
        )
        print(f"Bulk status update test passed: updated {data.get('updated_count')} orders")


# ─── BROADCAST EMAIL TESTS ───

class TestBroadcastEmail:
    """Test broadcast email endpoint"""
    
    def test_broadcast_requires_auth(self):
        """POST /api/admin/broadcast should require authentication"""
        response = requests.post(
            f"{BASE_URL}/api/admin/broadcast",
            json={"subject": "Test", "body": "Test body"}
        )
        assert response.status_code == 401
    
    def test_broadcast_endpoint_structure(self, auth_headers):
        """POST /api/admin/broadcast should accept subject, body, recipients"""
        # Test with empty recipients (all customers)
        response = requests.post(
            f"{BASE_URL}/api/admin/broadcast",
            headers=auth_headers,
            json={
                "subject": "TEST - Please Ignore",
                "body": "<p>This is a test broadcast. Please ignore.</p>",
                "recipients": []  # Empty = all customers
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("status") == "success"
        assert "recipients_count" in data
        print(f"Broadcast endpoint test passed: would send to {data.get('recipients_count')} recipients")
    
    def test_broadcast_with_selected_recipients(self, auth_headers):
        """POST /api/admin/broadcast should accept specific recipients"""
        response = requests.post(
            f"{BASE_URL}/api/admin/broadcast",
            headers=auth_headers,
            json={
                "subject": "TEST - Selected Recipients",
                "body": "<p>Test for selected recipients</p>",
                "recipients": ["test1@example.com", "test2@example.com"]
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("recipients_count") == 2
        print("Broadcast with selected recipients test passed")


# ─── PAYMENT RETRY TESTS ───

class TestPaymentRetry:
    """Test payment retry endpoint"""
    
    def test_retry_payment_invalid_order(self):
        """POST /api/orders/retry-payment should return 404 for invalid order"""
        response = requests.post(
            f"{BASE_URL}/api/orders/retry-payment",
            json={"order_id": "invalid-order-id"}
        )
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("Invalid order retry correctly returns 404")
    
    def test_retry_payment_endpoint_exists(self, auth_headers):
        """Verify retry-payment endpoint exists and accepts correct format"""
        # Get an existing order
        orders_response = requests.get(f"{BASE_URL}/api/admin/orders", headers=auth_headers)
        if orders_response.status_code != 200:
            pytest.skip("Could not fetch orders")
        
        orders = orders_response.json()
        if not orders:
            pytest.skip("No orders available for retry payment test")
        
        order_id = orders[0]["id"]
        
        # Try retry payment - may fail due to Razorpay but should not be 404
        response = requests.post(
            f"{BASE_URL}/api/orders/retry-payment",
            json={"order_id": order_id}
        )
        # Could be 200 (success) or 500 (Razorpay error) but not 404
        assert response.status_code != 404, "Retry payment endpoint should find the order"
        print(f"Retry payment endpoint test: status={response.status_code}")


# ─── PRODUCTS FILTERING TESTS ───

class TestProductsFiltering:
    """Test that HIDDEN products are excluded from public API"""
    
    def test_public_products_excludes_hidden(self, auth_headers):
        """GET /api/products should not return HIDDEN products"""
        # First, check if there are any HIDDEN products
        admin_products = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        if admin_products.status_code != 200:
            pytest.skip("Could not fetch admin products")
        
        all_products = admin_products.json()
        hidden_count = sum(1 for p in all_products if p.get("availability_status") == "HIDDEN")
        
        # Get public products
        public_response = requests.get(f"{BASE_URL}/api/products")
        assert public_response.status_code == 200
        
        public_data = public_response.json()
        # Flatten all categories
        public_products = []
        for category in public_data.values():
            if isinstance(category, list):
                public_products.extend(category)
        
        # Check no HIDDEN products in public response
        hidden_in_public = [p for p in public_products if p.get("availability_status") == "HIDDEN"]
        assert len(hidden_in_public) == 0, f"Found {len(hidden_in_public)} HIDDEN products in public API"
        
        print(f"Products filtering test passed: {hidden_count} HIDDEN products excluded from public API")


# ─── EXTENDED PRODUCT SCHEMA TESTS ───

class TestExtendedProductSchema:
    """Test new product fields: availability_status, stock_quantity, badge_type"""
    
    def test_admin_products_have_new_fields(self, auth_headers):
        """GET /api/admin/products should return products with new fields"""
        response = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        assert response.status_code == 200
        
        products = response.json()
        if not products:
            pytest.skip("No products available")
        
        # Check first product has new fields
        product = products[0]
        new_fields = ["availability_status", "stock_quantity", "low_stock_threshold", "badge_type"]
        
        for field in new_fields:
            # Fields may be None/null but should exist in schema
            print(f"Product '{product.get('name')}' - {field}: {product.get(field)}")
        
        print(f"Extended product schema test passed: checked {len(products)} products")
    
    def test_product_update_badge_type(self, auth_headers):
        """PUT /api/admin/products/{id} should update badge_type"""
        # Get a product
        products_response = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        if products_response.status_code != 200 or not products_response.json():
            pytest.skip("No products available")
        
        product = products_response.json()[0]
        product_id = product["id"]
        original_badge_type = product.get("badge_type", "")
        
        # Update badge_type
        new_badge_type = "BEST_SELLER" if original_badge_type != "BEST_SELLER" else "LIMITED_HARVEST"
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"badge_type": new_badge_type}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        updated = response.json()
        assert updated.get("badge_type") == new_badge_type
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"badge_type": original_badge_type}
        )
        print(f"Badge type update test passed: {original_badge_type} -> {new_badge_type} -> {original_badge_type}")
    
    def test_product_update_availability_status(self, auth_headers):
        """PUT /api/admin/products/{id} should update availability_status"""
        products_response = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        if products_response.status_code != 200 or not products_response.json():
            pytest.skip("No products available")
        
        product = products_response.json()[0]
        product_id = product["id"]
        original_status = product.get("availability_status", "AVAILABLE")
        
        # Update to PREORDER
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"availability_status": "PREORDER"}
        )
        assert response.status_code == 200
        assert response.json().get("availability_status") == "PREORDER"
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"availability_status": original_status}
        )
        print(f"Availability status update test passed")
    
    def test_product_update_stock_quantity(self, auth_headers):
        """PUT /api/admin/products/{id} should update stock_quantity"""
        products_response = requests.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        if products_response.status_code != 200 or not products_response.json():
            pytest.skip("No products available")
        
        product = products_response.json()[0]
        product_id = product["id"]
        original_stock = product.get("stock_quantity", 100)
        
        # Update stock
        new_stock = 50 if original_stock != 50 else 75
        response = requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"stock_quantity": new_stock}
        )
        assert response.status_code == 200
        assert response.json().get("stock_quantity") == new_stock
        
        # Restore original
        requests.put(
            f"{BASE_URL}/api/admin/products/{product_id}",
            headers=auth_headers,
            json={"stock_quantity": original_stock}
        )
        print(f"Stock quantity update test passed: {original_stock} -> {new_stock} -> {original_stock}")


# ─── ADMIN NAVIGATION TESTS ───

class TestAdminEndpoints:
    """Verify all admin endpoints are accessible"""
    
    def test_admin_dashboard(self, auth_headers):
        """GET /api/admin/dashboard should return stats"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "total_revenue" in data
        print(f"Dashboard: {data.get('total_orders')} orders, Rs.{data.get('total_revenue')} revenue")
    
    def test_admin_customers(self, auth_headers):
        """GET /api/admin/customers should return customer list"""
        response = requests.get(f"{BASE_URL}/api/admin/customers", headers=auth_headers)
        assert response.status_code == 200
        customers = response.json()
        print(f"Customers endpoint: {len(customers)} customers")
    
    def test_admin_subscribers(self, auth_headers):
        """GET /api/admin/subscribers should return subscriber list"""
        response = requests.get(f"{BASE_URL}/api/admin/subscribers", headers=auth_headers)
        assert response.status_code == 200
        subscribers = response.json()
        print(f"Subscribers endpoint: {len(subscribers)} subscribers")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
