import requests
import sys
import json
from datetime import datetime

class MittiBasketAPITester:
    def __init__(self, base_url="https://village-harvest-28.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text

            self.test_results.append(result)
            return success, result.get("response_data", {})

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, {}

    def test_api_root(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root",
            "GET",
            "",
            200
        )
        return success

    def test_create_waitlist_entry(self, email, name=None, waitlist_type="subscription"):
        """Test creating a waitlist entry"""
        data = {
            "email": email,
            "waitlist_type": waitlist_type
        }
        if name:
            data["name"] = name

        success, response = self.run_test(
            f"Create Waitlist Entry ({waitlist_type})",
            "POST",
            "waitlist",
            200,
            data=data
        )
        return success, response

    def test_get_waitlist_entries(self):
        """Test getting all waitlist entries"""
        success, response = self.run_test(
            "Get Waitlist Entries",
            "GET",
            "waitlist",
            200
        )
        return success, response

    def test_duplicate_waitlist_entry(self, email, waitlist_type="subscription"):
        """Test creating duplicate waitlist entry (should return existing)"""
        data = {
            "email": email,
            "waitlist_type": waitlist_type
        }

        success, response = self.run_test(
            "Duplicate Waitlist Entry",
            "POST",
            "waitlist",
            200,
            data=data
        )
        return success, response

def main():
    print("🚀 Starting Mitti Basket API Tests...")
    tester = MittiBasketAPITester()
    
    # Test API root
    if not tester.test_api_root():
        print("❌ API root failed, stopping tests")
        return 1

    # Test waitlist functionality
    test_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
    test_name = "Test User"

    # Test creating waitlist entry with name
    success, entry1 = tester.test_create_waitlist_entry(test_email, test_name, "subscription")
    if not success:
        print("❌ Waitlist creation failed")
        return 1

    # Test creating waitlist entry without name
    test_email2 = f"test2_{datetime.now().strftime('%H%M%S')}@example.com"
    success, entry2 = tester.test_create_waitlist_entry(test_email2, None, "founding-member")
    if not success:
        print("❌ Waitlist creation without name failed")

    # Test duplicate entry (should return existing)
    success, duplicate = tester.test_duplicate_waitlist_entry(test_email, "subscription")
    if success and duplicate.get("id") == entry1.get("id"):
        print("✅ Duplicate handling works correctly")
    else:
        print("⚠️ Duplicate handling may have issues")

    # Test getting all waitlist entries
    success, entries = tester.test_get_waitlist_entries()
    if success and isinstance(entries, list) and len(entries) >= 2:
        print(f"✅ Retrieved {len(entries)} waitlist entries")
    else:
        print("⚠️ Waitlist retrieval may have issues")

    # Print final results
    print(f"\n📊 Test Results:")
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "total_tests": tester.tests_run,
                "passed_tests": tester.tests_passed,
                "success_rate": f"{(tester.tests_passed/tester.tests_run)*100:.1f}%"
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    print("📄 Detailed results saved to /app/backend_test_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())