import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import os
from dotenv import load_dotenv

class TestUIWorkflows(unittest.TestCase):
    def setUp(self):
        """Set up test environment before each test."""
        # Load test environment variables
        load_dotenv('.env.test')
        
        # Initialize Chrome WebDriver with options
        chrome_options = webdriver.ChromeOptions()
        if os.getenv('HEADLESS', 'true').lower() == 'true':
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.implicitly_wait(10)
        self.base_url = os.getenv('TEST_APP_URL', 'http://localhost:3000')
        
        # Test user credentials
        self.test_user = {
            'email': 'test@example.com',
            'password': 'test_password',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def tearDown(self):
        """Clean up after each test."""
        if self.driver:
            self.driver.quit()

    def wait_for_element(self, by, value, timeout=10):
        """Wait for element to be present and visible."""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return element
        except TimeoutException:
            self.fail(f"Element {value} not found within {timeout} seconds")

    def login(self):
        """Helper method to perform login."""
        self.driver.get(f"{self.base_url}/login")
        
        # Fill in login form
        email_input = self.wait_for_element(By.NAME, "email")
        email_input.send_keys(self.test_user['email'])
        
        password_input = self.wait_for_element(By.NAME, "password")
        password_input.send_keys(self.test_user['password'])
        
        # Submit login form
        submit_button = self.wait_for_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Wait for dashboard to load
        self.wait_for_element(By.ID, "dashboard")

    def test_complete_signup_flow(self):
        """Test the complete signup process."""
        self.driver.get(f"{self.base_url}/signup")
        
        # Fill in signup form
        self.wait_for_element(By.NAME, "email").send_keys(self.test_user['email'])
        self.wait_for_element(By.NAME, "password").send_keys(self.test_user['password'])
        self.wait_for_element(By.NAME, "firstName").send_keys(self.test_user['first_name'])
        self.wait_for_element(By.NAME, "lastName").send_keys(self.test_user['last_name'])
        
        # Submit form
        submit_button = self.wait_for_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_button.click()
        
        # Verify successful signup
        success_message = self.wait_for_element(By.CLASS_NAME, "success-message")
        self.assertIn("successfully", success_message.text.lower())

    def test_gmail_connection_flow(self):
        """Test connecting Gmail account."""
        self.login()
        
        # Navigate to Gmail connection page
        self.driver.get(f"{self.base_url}/connect-gmail")
        
        # Click connect button
        connect_button = self.wait_for_element(By.ID, "connect-gmail-button")
        connect_button.click()
        
        # Switch to Google OAuth window
        self.driver.switch_to.window(self.driver.window_handles[-1])
        
        # Verify Google OAuth page loaded
        self.assertIn("accounts.google.com", self.driver.current_url)

    def test_subscription_purchase_flow(self):
        """Test the premium subscription purchase process."""
        self.login()
        
        # Navigate to pricing page
        self.driver.get(f"{self.base_url}/pricing")
        
        # Click upgrade button
        upgrade_button = self.wait_for_element(By.ID, "upgrade-premium-button")
        upgrade_button.click()
        
        # Wait for Stripe Elements iframe
        stripe_frame = self.wait_for_element(By.CSS_SELECTOR, "iframe[name^='__privateStripeFrame']")
        self.driver.switch_to.frame(stripe_frame)
        
        # Fill in card details
        card_number = self.wait_for_element(By.NAME, "cardnumber")
        card_number.send_keys("4242424242424242")
        
        card_exp = self.wait_for_element(By.NAME, "exp-date")
        card_exp.send_keys("1234")
        
        card_cvc = self.wait_for_element(By.NAME, "cvc")
        card_cvc.send_keys("123")
        
        # Switch back to main content
        self.driver.switch_to.default_content()
        
        # Submit payment
        submit_button = self.wait_for_element(By.ID, "submit-payment-button")
        submit_button.click()
        
        # Verify successful subscription
        success_message = self.wait_for_element(By.CLASS_NAME, "payment-success")
        self.assertIn("successful", success_message.text.lower())

    def test_email_drafts_workflow(self):
        """Test the email drafts management workflow."""
        self.login()
        
        # Navigate to drafts page
        self.driver.get(f"{self.base_url}/drafts")
        
        # Wait for drafts to load
        drafts_container = self.wait_for_element(By.ID, "drafts-container")
        
        # Click first draft
        first_draft = self.wait_for_element(By.CSS_SELECTOR, ".draft-item")
        first_draft.click()
        
        # Edit draft
        edit_button = self.wait_for_element(By.ID, "edit-draft-button")
        edit_button.click()
        
        # Modify draft content
        draft_body = self.wait_for_element(By.ID, "draft-body")
        draft_body.clear()
        draft_body.send_keys("Updated draft content")
        
        # Save changes
        save_button = self.wait_for_element(By.ID, "save-draft-button")
        save_button.click()
        
        # Verify changes saved
        success_toast = self.wait_for_element(By.CLASS_NAME, "success-toast")
        self.assertIn("saved", success_toast.text.lower())

if __name__ == '__main__':
    unittest.main() 