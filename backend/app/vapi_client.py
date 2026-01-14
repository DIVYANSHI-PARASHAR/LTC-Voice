"""
VAPI Python SDK Client for Outbound Phone Calls
"""

from typing import Optional, Literal
import time
import logging
from vapi import Vapi
from app.config import get_settings

logger = logging.getLogger(__name__)


class VapiClient:
    """VAPI client wrapper for making outbound phone calls"""

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.vapi_private_api_key
        self.phone_number_id = settings.vapi_phone_number_id
        self.assistant_id = settings.vapi_assistant_id

        # Only initialize client if API key is provided
        self.client: Optional[Vapi] = None
        if self.api_key:
            self.client = Vapi(token=self.api_key)

    def create_outbound_call(
        self,
        customer_phone: str,
        customer_name: str = None,
        assistant_overrides: dict = None,
    ):
        """
        Create an outbound phone call to a customer

        Args:
            customer_phone: Customer's phone number (E.164 format: +15551234567)
            customer_name: Customer's name (optional)
            assistant_overrides: Override assistant settings (optional)

        Returns:
            Call object from VAPI
        """
        # Validate credentials
        if not self.api_key:
            raise ValueError(
                "VAPI_PRIVATE_API_KEY not configured. "
                "Please add it to backend/.env file. "
                "Get your key from https://dashboard.vapi.ai"
            )

        if not self.phone_number_id:
            raise ValueError(
                "VAPI_PHONE_NUMBER_ID not configured. "
                "Please add it to backend/.env file. "
                "Buy a phone number at https://dashboard.vapi.ai/phone-numbers"
            )

        # Build call request
        call_request = {
            "phone_number_id": self.phone_number_id,
            "customer": {
                "number": customer_phone,
            },
        }

        # Add customer name if provided
        if customer_name:
            call_request["customer"]["name"] = customer_name

        # Use saved assistant or inline configuration
        if self.assistant_id:
            call_request["assistant_id"] = self.assistant_id

            # Add overrides if provided
            if assistant_overrides:
                call_request["assistant_overrides"] = assistant_overrides
        else:
            # Inline assistant configuration
            call_request["assistant"] = {
                "transcriber": {
                    "provider": "deepgram",
                    "model": "nova-2",
                    "language": "en-US",
                },
                "model": {
                    "provider": "openai",
                    "model": "gpt-4",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a healthcare intake specialist conducting a patient interview for Medicaid long-term care eligibility. Be professional, empathetic, and thorough.",
                        }
                    ],
                },
                "voice": {
                    "provider": "playht",
                    "voice_id": "jennifer",
                },
                "first_message": f"Hello{' ' + customer_name if customer_name else ''}, this is VitalStream calling to complete your healthcare intake assessment. Do you have a few minutes to talk?",
                "name": "Healthcare Intake Assistant",
            }

            # Merge overrides into inline assistant
            if assistant_overrides:
                call_request["assistant"].update(assistant_overrides)

        # Create the call (client is guaranteed to exist due to validation above)
        if not self.client:
            raise ValueError("VAPI client not initialized")

        call = self.client.calls.create(**call_request)
        return call

    def get_call(self, call_id: str):
        """Get call details by ID"""
        if not self.client:
            raise ValueError("VAPI client not initialized. Check your API credentials.")
        return self.client.calls.get(call_id)

    def list_calls(self, limit: int = 10):
        """List recent calls"""
        if not self.client:
            raise ValueError("VAPI client not initialized. Check your API credentials.")
        return self.client.calls.list(limit=limit)

    def wait_for_call_completion(
        self,
        call_id: str,
        poll_interval: int = 2,
        timeout: int = 600,
        wait_for: Literal["connected", "ended"] = "ended",
    ):
        """
        Poll VAPI API until call reaches a specific status.

        This is a BLOCKING operation that will poll the VAPI API repeatedly
        until the call reaches the desired state or times out.

        Args:
            call_id: The VAPI call ID to monitor
            poll_interval: Seconds between status checks (default: 2)
            timeout: Maximum seconds to wait before giving up (default: 300 = 5 minutes)
            wait_for: What to wait for:
                - "connected": Wait until call is answered (in-progress) or fails
                - "ended": Wait until call completely ends

        Returns:
            Final call object with status, transcript, recording, etc.

        Raises:
            TimeoutError: If call doesn't reach desired state within timeout
            ValueError: If VAPI client not initialized

        Example:
            # Wait for patient to answer (or call to fail)
            call = vapi_client.wait_for_call_completion(
                call_id="abc123",
                wait_for="connected",
                timeout=60
            )

            # Wait for entire call to finish
            call = vapi_client.wait_for_call_completion(
                call_id="abc123",
                wait_for="ended",
                timeout=300
            )
        """
        if not self.client:
            raise ValueError("VAPI client not initialized. Check your API credentials.")

        logger.info(
            f"Waiting for call {call_id} to reach '{wait_for}' state "
            f"(poll interval: {poll_interval}s, timeout: {timeout}s)"
        )

        start_time = time.time()
        last_status = None

        while True:
            # Check timeout
            elapsed = time.time() - start_time
            if elapsed > timeout:
                raise TimeoutError(
                    f"Call {call_id} did not reach '{wait_for}' state within {timeout} seconds. "
                    f"Last status: {last_status}"
                )

            # Get current call status
            call = self.get_call(call_id)
            current_status = call.status

            # Log status changes
            if current_status != last_status:
                logger.info(f"Call {call_id} status: {current_status}")
                last_status = current_status

            # Check if we've reached the desired state
            if wait_for == "connected":
                # Waiting for call to connect (or fail to connect)
                if current_status in ["in-progress"]:
                    logger.info(f"Call {call_id} connected (status: {current_status})")
                    return call
                elif current_status in [
                    "ended",
                    "busy",
                    "no-answer",
                    "failed",
                    "canceled",
                ]:
                    logger.info(
                        f"Call {call_id} finished without connecting (status: {current_status})"
                    )
                    return call

            elif wait_for == "ended":
                # Waiting for call to completely end
                if current_status in [
                    "ended",
                    "busy",
                    "no-answer",
                    "failed",
                    "canceled",
                ]:
                    logger.info(f"Call {call_id} ended (status: {current_status})")
                    return call

            # Still waiting, sleep before next poll
            time.sleep(poll_interval)


# Global client instance
vapi_client = VapiClient()
