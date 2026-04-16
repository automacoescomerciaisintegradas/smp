#!/usr/bin/env python3
"""
SAMA - Meta Ads Environment Validation Script
Tests tokens, permissions, and Meta Graph API connectivity
"""

import os
import sys
import json
import logging
import requests
from typing import Optional
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('logs/meta-env-check.log', mode='w')
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    test_name: str
    status: str  # PASS, FAIL, WARN
    message: str
    details: Optional[dict] = None


class MetaEnvValidator:
    """Validates Meta Ads API environment configuration"""

    def __init__(self):
        self.results: list[ValidationResult] = []
        self.access_token = os.getenv('META_ACCESS_TOKEN')
        self.ad_account_id = os.getenv('META_AD_ACCOUNT_ID')
        self.api_version = os.getenv('META_API_VERSION', 'v19.0')
        self.base_url = 'https://graph.facebook.com'

    def validate_all(self) -> bool:
        """Run all validation checks"""
        logger.info("Starting SAMA environment validation...")
        logger.info("=" * 60)

        self._check_required_vars()
        self._check_token_format()
        self._check_ad_account_id_format()

        # Skip API tests if basic validation failed
        if self._has_failures():
            logger.warning("Skipping API tests due to configuration errors")
            self._print_results()
            return False

        self._test_graph_api_connection()
        self._test_token_permissions()
        self._test_ad_account_access()
        self._test_ads_management_permissions()
        self._test_ads_read_permissions()

        self._print_results()
        return not self._has_failures()

    def _check_required_vars(self):
        """Check all required environment variables are present"""
        logger.info("Checking required environment variables...")

        required_vars = {
            'META_ACCESS_TOKEN': 'Meta Ads API access token',
            'META_AD_ACCOUNT_ID': 'Meta Ad Account ID (must start with "act_")',
        }

        for var, description in required_vars.items():
            if not os.getenv(var):
                self.results.append(ValidationResult(
                    test_name=f"Environment: {var}",
                    status="FAIL",
                    message=f"Missing required variable: {var}",
                    details={"description": description}
                ))
            else:
                self.results.append(ValidationResult(
                    test_name=f"Environment: {var}",
                    status="PASS",
                    message=f"✓ {var} is set"
                ))

        # Check optional vars
        optional_vars = {
            'META_BUSINESS_ID': 'Meta Business Manager ID',
            'META_APP_ID': 'Meta App ID (for OAuth)',
            'META_APP_SECRET': 'Meta App Secret (for OAuth)',
        }

        for var, description in optional_vars.items():
            if not os.getenv(var):
                self.results.append(ValidationResult(
                    test_name=f"Environment: {var}",
                    status="WARN",
                    message=f"Optional variable not set: {var}",
                    details={"description": description}
                ))

    def _check_token_format(self):
        """Validate access token format"""
        logger.info("Validating token format...")

        if not self.access_token:
            return

        # Meta tokens are typically long strings
        if len(self.access_token) < 50:
            self.results.append(ValidationResult(
                test_name="Token Format",
                status="FAIL",
                message="Access token appears to be too short",
                details={"length": len(self.access_token)}
            ))
        else:
            self.results.append(ValidationResult(
                test_name="Token Format",
                status="PASS",
                message=f"✓ Token length looks good ({len(self.access_token)} chars)"
            ))

    def _check_ad_account_id_format(self):
        """Validate ad account ID format"""
        logger.info("Validating ad account ID format...")

        if not self.ad_account_id:
            return

        if not self.ad_account_id.startswith('act_'):
            self.results.append(ValidationResult(
                test_name="Ad Account ID Format",
                status="FAIL",
                message="Ad Account ID must start with 'act_'",
                details={"example": "act_123456789"}
            ))
        else:
            self.results.append(ValidationResult(
                test_name="Ad Account ID Format",
                status="PASS",
                message=f"✓ Ad Account ID format is correct: {self.ad_account_id}"
            ))

    def _test_graph_api_connection(self):
        """Test basic Graph API connectivity"""
        logger.info("Testing Graph API connection...")

        try:
            url = f"{self.base_url}/{self.api_version}/me"
            params = {
                'access_token': self.access_token,
                'fields': 'id,name'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            self.results.append(ValidationResult(
                test_name="Graph API Connection",
                status="PASS",
                message="✓ Successfully connected to Graph API",
                details={"user_id": data.get('id'), "name": data.get('name')}
            ))

        except requests.exceptions.RequestException as e:
            self.results.append(ValidationResult(
                test_name="Graph API Connection",
                status="FAIL",
                message=f"Failed to connect to Graph API: {str(e)}",
                details={"url": url}
            ))

    def _test_token_permissions(self):
        """Test token has required permissions"""
        logger.info("Testing token permissions...")

        try:
            url = f"{self.base_url}/{self.api_version}/me/permissions"
            params = {'access_token': self.access_token}

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()
            permissions = {p['permission']: p['status'] for p in data.get('data', [])}

            required_permissions = ['ads_management', 'ads_read', 'business_management']

            for permission in required_permissions:
                status = permissions.get(permission, 'not_granted')
                if status == 'granted':
                    self.results.append(ValidationResult(
                        test_name=f"Permission: {permission}",
                        status="PASS",
                        message=f"✓ Permission '{permission}' is granted"
                    ))
                else:
                    self.results.append(ValidationResult(
                        test_name=f"Permission: {permission}",
                        status="FAIL",
                        message=f"Permission '{permission}' is {status}",
                        details={"required": True}
                    ))

        except Exception as e:
            self.results.append(ValidationResult(
                test_name="Token Permissions",
                status="FAIL",
                message=f"Failed to check permissions: {str(e)}"
            ))

    def _test_ad_account_access(self):
        """Test access to ad account"""
        logger.info(f"Testing ad account access: {self.ad_account_id}...")

        try:
            url = f"{self.base_url}/{self.api_version}/{self.ad_account_id}"
            params = {
                'access_token': self.access_token,
                'fields': 'id,name,account_status,currency'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            self.results.append(ValidationResult(
                test_name="Ad Account Access",
                status="PASS",
                message=f"✓ Successfully accessed ad account",
                details={
                    "account_id": data.get('id'),
                    "name": data.get('name'),
                    "status": data.get('account_status'),
                    "currency": data.get('currency')
                }
            ))

        except Exception as e:
            self.results.append(ValidationResult(
                test_name="Ad Account Access",
                status="FAIL",
                message=f"Failed to access ad account: {str(e)}",
                details={"ad_account_id": self.ad_account_id}
            ))

    def _test_ads_management_permissions(self):
        """Test ability to create/manage ads"""
        logger.info("Testing ads_management permissions...")

        try:
            # Try to list campaigns (read access)
            url = f"{self.base_url}/{self.api_version}/{self.ad_account_id}/campaigns"
            params = {
                'access_token': self.access_token,
                'limit': 1,
                'fields': 'id,name,status'
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            self.results.append(ValidationResult(
                test_name="Ads Management (Read)",
                status="PASS",
                message="✓ Can read campaigns",
                details={"campaigns_found": len(data.get('data', []))}
            ))

        except Exception as e:
            self.results.append(ValidationResult(
                test_name="Ads Management (Read)",
                status="FAIL",
                message=f"Cannot read campaigns: {str(e)}"
            ))

    def _test_ads_read_permissions(self):
        """Test ability to read insights"""
        logger.info("Testing ads_read permissions...")

        try:
            # Try to get account insights
            url = f"{self.base_url}/{self.api_version}/{self.ad_account_id}/insights"
            params = {
                'access_token': self.access_token,
                'level': 'account',
                'fields': 'impressions,clicks,spend',
                'time_range': json.dumps({'since': '2026-01-01', 'until': '2026-01-07'})
            }

            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            self.results.append(ValidationResult(
                test_name="Ads Read (Insights)",
                status="PASS",
                message="✓ Can read insights",
                details={"data_points": len(data.get('data', []))}
            ))

        except Exception as e:
            self.results.append(ValidationResult(
                test_name="Ads Read (Insights)",
                status="FAIL",
                message=f"Cannot read insights: {str(e)}"
            ))

    def _has_failures(self) -> bool:
        """Check if there are any failed tests"""
        return any(r.status == "FAIL" for r in self.results)

    def _print_results(self):
        """Print validation results"""
        logger.info("")
        logger.info("=" * 60)
        logger.info("VALIDATION RESULTS")
        logger.info("=" * 60)

        for result in self.results:
            status_icon = "✅" if result.status == "PASS" else "❌" if result.status == "FAIL" else "⚠️"
            logger.info(f"{status_icon} {result.test_name}: {result.message}")

            if result.details:
                logger.info(f"   Details: {json.dumps(result.details, indent=2)}")

        logger.info("")

        passed = sum(1 for r in self.results if r.status == "PASS")
        failed = sum(1 for r in self.results if r.status == "FAIL")
        warnings = sum(1 for r in self.results if r.status == "WARN")

        logger.info(f"Results: {passed} passed, {failed} failed, {warnings} warnings")
        logger.info("=" * 60)

        if failed > 0:
            logger.error("❌ VALIDATION FAILED - Please fix the errors above")
        elif warnings > 0:
            logger.warning("⚠️  VALIDATION PASSED WITH WARNINGS")
        else:
            logger.info("✅ VALIDATION PASSED - Environment is ready!")


def main():
    """Main entry point"""
    # Load .env file if exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        logger.warning("python-dotenv not installed, using environment variables only")

    # Create logs directory
    os.makedirs('logs', exist_ok=True)

    # Run validation
    validator = MetaEnvValidator()
    success = validator.validate_all()

    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()
