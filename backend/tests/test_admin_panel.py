"""
Admin Panel API Tests for Mitti Basket
Tests: Admin login, dashboard, products CRUD, orders management, customers
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://village-harvest-28.preview.emergentagent.com')

# Admin credentials from .env
ADMIN_EMAIL = "basketmitti@gmail.com"
ADMIN_PASSWORD = "MItti3025@#"
RAZORPAY_WEBHOOK_SECRET = "mittibasket_webhook_secret_2026_secure"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert data["email"] == ADMIN_EMAIL.lower()
        assert "name" in data
        print(f"✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Invalid credentials rejected correctly")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with correct email but wrong password"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "wrongpassword123"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Wrong password rejected correctly")
    
    def test_admin_me_with_token(self):
        """Test /me endpoint with valid token"""
        # First login
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_resp.json()["token"]
        
        # Test /me endpoint
        response = requests.get(f"{BASE_URL}/api/admin/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data["email"] == ADMIN_EMAIL.lower()
        assert data["role"] == "admin"
        print(f"✓ Admin /me endpoint works correctly")
    
    def test_admin_me_without_token(self):
        """Test /me endpoint without token"""
        response = requests.get(f"{BASE_URL}/api/admin/me")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print(f"✓ Unauthenticated request rejected correctly")
    
    def test_admin_logout(self):
        """Test admin logout endpoint"""
        response = requests.post(f"{BASE_URL}/api/admin/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged_out"
        print(f"✓ Admin logout works correctly")


class TestAdminDashboard:
    """Admin dashboard tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_dashboard_stats(self, auth_token):
        """Test dashboard returns all required stats"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        # Check all required fields
        required_fields = [
            "total_orders", "paid_orders", "pending_orders", "failed_orders",
            "total_revenue", "top_products", "recent_orders", "customer_count", "today_orders"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
        
        # Validate data types
        assert isinstance(data["total_orders"], int)
        assert isinstance(data["total_revenue"], (int, float))
        assert isinstance(data["top_products"], list)
        assert isinstance(data["recent_orders"], list)
        assert isinstance(data["customer_count"], int)
        
        print(f"✓ Dashboard stats: {data['total_orders']} orders, ₹{data['total_revenue']} revenue, {data['customer_count']} customers")
    
    def test_dashboard_unauthorized(self):
        """Test dashboard without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401
        print(f"✓ Dashboard unauthorized access rejected")


class TestAdminProducts:
    """Admin products CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_list_products(self, auth_token):
        """Test listing all products"""
        response = requests.get(f"{BASE_URL}/api/admin/products", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"List products failed: {response.text}"
        products = response.json()
        assert isinstance(products, list)
        assert len(products) >= 1, "Expected at least 1 product"
        
        # Check product structure
        if products:
            p = products[0]
            assert "id" in p
            assert "name" in p
            assert "basePrice" in p
            assert "category" in p
            assert "image" in p
        
        print(f"✓ Listed {len(products)} products")
        return products
    
    def test_create_product(self, auth_token):
        """Test creating a new product"""
        test_product = {
            "name": "TEST_Admin_Product",
            "tagline": "Test product for admin panel",
            "origin": "Test Origin",
            "basePrice": 999,
            "unit": "1 kg",
            "minQty": 1,
            "qtyStep": 1,
            "qtyUnit": "kg",
            "badge": "Test",
            "image": "https://example.com/test.jpg",
            "category": "village_pantry",
            "comingSoon": False,
            "inStock": True,
            "subscribable": False
        }
        
        response = requests.post(f"{BASE_URL}/api/admin/products", 
            headers={"Authorization": f"Bearer {auth_token}"},
            json=test_product
        )
        assert response.status_code == 200, f"Create product failed: {response.text}"
        data = response.json()
        assert data["name"] == test_product["name"]
        assert data["basePrice"] == test_product["basePrice"]
        assert "id" in data
        
        print(f"✓ Created product: {data['name']} (ID: {data['id'][:8]})")
        return data["id"]
    
    def test_update_product_price(self, auth_token):
        """Test updating product price"""
        # First create a product
        create_resp = requests.post(f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "name": "TEST_Update_Price_Product",
                "basePrice": 500,
                "category": "village_pantry"
            }
        )
        product_id = create_resp.json()["id"]
        
        # Update price
        response = requests.put(f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"basePrice": 750}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data["basePrice"] == 750
        
        # Verify with GET
        get_resp = requests.get(f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        products = get_resp.json()
        updated = next((p for p in products if p["id"] == product_id), None)
        assert updated is not None
        assert updated["basePrice"] == 750
        
        print(f"✓ Updated product price to ₹750")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_toggle_stock(self, auth_token):
        """Test toggling product stock on/off"""
        # Create a product
        create_resp = requests.post(f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "name": "TEST_Toggle_Stock_Product",
                "basePrice": 100,
                "category": "village_pantry",
                "inStock": True
            }
        )
        product_id = create_resp.json()["id"]
        
        # Toggle stock off
        response = requests.patch(f"{BASE_URL}/api/admin/products/{product_id}/stock",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Toggle stock failed: {response.text}"
        data = response.json()
        assert data["inStock"] == False
        
        # Toggle stock back on
        response = requests.patch(f"{BASE_URL}/api/admin/products/{product_id}/stock",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["inStock"] == True
        
        print(f"✓ Stock toggle works correctly")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {auth_token}"})
    
    def test_delete_product(self, auth_token):
        """Test deleting a product"""
        # Create a product
        create_resp = requests.post(f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "name": "TEST_Delete_Product",
                "basePrice": 100,
                "category": "village_pantry"
            }
        )
        product_id = create_resp.json()["id"]
        
        # Delete it
        response = requests.delete(f"{BASE_URL}/api/admin/products/{product_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200, f"Delete failed: {response.text}"
        data = response.json()
        assert data["status"] == "deleted"
        
        # Verify it's gone
        get_resp = requests.get(f"{BASE_URL}/api/admin/products",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        products = get_resp.json()
        deleted = next((p for p in products if p["id"] == product_id), None)
        assert deleted is None
        
        print(f"✓ Product deleted successfully")


class TestAdminOrders:
    """Admin orders management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_list_orders(self, auth_token):
        """Test listing all orders"""
        response = requests.get(f"{BASE_URL}/api/admin/orders", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"List orders failed: {response.text}"
        orders = response.json()
        assert isinstance(orders, list)
        
        if orders:
            o = orders[0]
            assert "id" in o
            assert "name" in o
            assert "email" in o
            assert "items" in o
            assert "subtotal" in o
            assert "payment_status" in o
            assert "order_status" in o
        
        print(f"✓ Listed {len(orders)} orders")
        return orders
    
    def test_filter_orders_by_payment_status(self, auth_token):
        """Test filtering orders by payment status"""
        response = requests.get(f"{BASE_URL}/api/admin/orders?payment=Paid", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        orders = response.json()
        for o in orders:
            assert o["payment_status"] == "Paid"
        print(f"✓ Filtered {len(orders)} paid orders")
    
    def test_filter_orders_by_order_status(self, auth_token):
        """Test filtering orders by order status"""
        response = requests.get(f"{BASE_URL}/api/admin/orders?status=Confirmed", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200
        orders = response.json()
        for o in orders:
            assert o["order_status"] == "Confirmed"
        print(f"✓ Filtered {len(orders)} confirmed orders")
    
    def test_update_order_status_to_shipped(self, auth_token):
        """Test updating order status to Shipped"""
        # Get an order
        orders_resp = requests.get(f"{BASE_URL}/api/admin/orders", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        orders = orders_resp.json()
        
        if not orders:
            pytest.skip("No orders to test status update")
        
        # Find a Confirmed order
        order = next((o for o in orders if o["order_status"] == "Confirmed"), orders[0])
        order_id = order["id"]
        
        # Update to Shipped
        response = requests.patch(f"{BASE_URL}/api/admin/orders/{order_id}/status",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"order_status": "Shipped"}
        )
        assert response.status_code == 200, f"Update status failed: {response.text}"
        data = response.json()
        assert data["order_status"] == "Shipped"
        assert "shipped_at" in data
        
        print(f"✓ Order status updated to Shipped")
    
    def test_update_order_status_to_delivered(self, auth_token):
        """Test updating order status to Delivered"""
        # Get an order
        orders_resp = requests.get(f"{BASE_URL}/api/admin/orders", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        orders = orders_resp.json()
        
        if not orders:
            pytest.skip("No orders to test status update")
        
        # Find a Shipped order or any order
        order = next((o for o in orders if o["order_status"] == "Shipped"), orders[0])
        order_id = order["id"]
        
        # Update to Delivered
        response = requests.patch(f"{BASE_URL}/api/admin/orders/{order_id}/status",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={"order_status": "Delivered"}
        )
        assert response.status_code == 200, f"Update status failed: {response.text}"
        data = response.json()
        assert data["order_status"] == "Delivered"
        assert "delivered_at" in data
        
        print(f"✓ Order status updated to Delivered")


class TestAdminCustomers:
    """Admin customers tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for tests"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["token"]
    
    def test_list_customers(self, auth_token):
        """Test listing all customers"""
        response = requests.get(f"{BASE_URL}/api/admin/customers", headers={
            "Authorization": f"Bearer {auth_token}"
        })
        assert response.status_code == 200, f"List customers failed: {response.text}"
        customers = response.json()
        assert isinstance(customers, list)
        
        if customers:
            c = customers[0]
            assert "email" in c
            assert "name" in c
            assert "total_orders" in c
            assert "total_spent" in c
            assert "last_order" in c
        
        print(f"✓ Listed {len(customers)} unique customers")
        return customers


class TestPublicProductsAPI:
    """Test public products API (customer-facing)"""
    
    def test_public_products_grouped_by_category(self):
        """Test /api/products returns products grouped by category"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Public products failed: {response.text}"
        data = response.json()
        
        # Check category groups exist
        expected_categories = ["season_harvest", "village_pantry", "festive", "secret_garden"]
        for cat in expected_categories:
            assert cat in data, f"Missing category: {cat}"
            assert isinstance(data[cat], list)
        
        total_products = sum(len(data[cat]) for cat in expected_categories)
        print(f"✓ Public products API returns {total_products} products in {len(expected_categories)} categories")


class TestRazorpayWebhook:
    """Test Razorpay webhook endpoint"""
    
    def test_webhook_rejects_unsigned_request(self):
        """Test webhook rejects requests without valid signature"""
        response = requests.post(f"{BASE_URL}/api/payment/webhook",
            headers={"Content-Type": "application/json"},
            json={"event": "payment.captured", "payload": {}}
        )
        # Should return invalid_signature status (not 401/403 since it's a webhook)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "invalid_signature"
        print(f"✓ Webhook rejects unsigned requests correctly")


class TestBruteForceProtection:
    """Test brute force protection on admin login"""
    
    def test_brute_force_lockout(self):
        """Test that 5 failed attempts locks account for 15 min"""
        # Use a unique email to avoid affecting other tests
        test_email = "bruteforce_test@example.com"
        
        # Make 5 failed attempts
        for i in range(5):
            response = requests.post(f"{BASE_URL}/api/admin/login", json={
                "email": test_email,
                "password": "wrongpassword"
            })
            assert response.status_code == 401, f"Attempt {i+1} should fail with 401"
        
        # 6th attempt should be rate limited
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": test_email,
            "password": "wrongpassword"
        })
        assert response.status_code == 429, f"Expected 429 (rate limited), got {response.status_code}"
        data = response.json()
        assert "15 minutes" in data.get("detail", "").lower() or "too many" in data.get("detail", "").lower()
        
        print(f"✓ Brute force protection works - account locked after 5 failed attempts")


# Cleanup test products after all tests
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_products():
    """Cleanup TEST_ prefixed products after all tests"""
    yield
    # Cleanup
    try:
        login_resp = requests.post(f"{BASE_URL}/api/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_resp.status_code == 200:
            token = login_resp.json()["token"]
            products_resp = requests.get(f"{BASE_URL}/api/admin/products",
                headers={"Authorization": f"Bearer {token}"}
            )
            if products_resp.status_code == 200:
                for p in products_resp.json():
                    if p["name"].startswith("TEST_"):
                        requests.delete(f"{BASE_URL}/api/admin/products/{p['id']}",
                            headers={"Authorization": f"Bearer {token}"})
                        print(f"Cleaned up test product: {p['name']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
