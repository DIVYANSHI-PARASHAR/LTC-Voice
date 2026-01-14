"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class OutboundCallRequest(BaseModel):
    """Request schema for creating an outbound call"""

    patient_phone: str = Field(
        ...,
        description="Patient's phone number in E.164 format (e.g., +15551234567)",
        pattern=r'^\+[1-9]\d{1,14}$'
    )
    patient_name: Optional[str] = Field(
        None,
        description="Patient's name"
    )
    assistant_overrides: Optional[dict] = Field(
        None,
        description="Override assistant configuration"
    )
    wait_for_completion: Optional[Literal["connected", "ended", "none"]] = Field(
        "none",
        description="Whether to wait for call to complete before returning. "
                    "'connected': Wait until patient answers or call fails. "
                    "'ended': Wait until call completely ends. "
                    "'none': Return immediately after initiating call (default)."
    )
    timeout: Optional[int] = Field(
        300,
        description="Maximum seconds to wait if wait_for_completion is set (default: 300)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "patient_phone": "+15551234567",
                "patient_name": "John Doe",
                "assistant_overrides": {
                    "first_message": "Hello John, this is VitalStream with an important update."
                }
            }
        }


class OutboundCallResponse(BaseModel):
    """Response schema for outbound call creation"""

    success: bool
    call_id: str
    message: str
    patient_phone: str
    patient_name: Optional[str] = None
    status: Optional[str] = Field(
        None,
        description="Final call status (only present if wait_for_completion was used)"
    )
    call_completed: Optional[bool] = Field(
        None,
        description="Whether the call completed (only present if wait_for_completion was used)"
    )
    structured_data: Optional[dict] = Field(
        None,
        description="Structured data extracted from the call (only present if wait_for_completion='ended')"
    )
    transcript: Optional[list] = Field(
        None,
        description="Full conversation transcript (only present if wait_for_completion='ended')"
    )
    recording_url: Optional[str] = Field(
        None,
        description="URL to call recording (only present if wait_for_completion='ended')"
    )
    cost: Optional[float] = Field(
        None,
        description="Cost of the call in USD (only present if wait_for_completion='ended')"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "call_id": "call_abc123xyz",
                "message": "Call initiated successfully to +15551234567",
                "patient_phone": "+15551234567",
                "patient_name": "John Doe"
            }
        }


class CallStatusResponse(BaseModel):
    """Response schema for call status"""

    call_id: str
    status: str
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    cost: Optional[float] = None


class ErrorResponse(BaseModel):
    """Error response schema"""

    success: bool = False
    error: str
    detail: Optional[str] = None
