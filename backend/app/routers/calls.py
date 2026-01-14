"""
API Routes for VAPI Call Management
"""

from fastapi import APIRouter, HTTPException, status
from app.schemas import (
    OutboundCallRequest,
    OutboundCallResponse,
    CallStatusResponse,
    ErrorResponse,
)
from app.vapi_client import vapi_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/calls", tags=["calls"])


@router.post(
    "/outbound",
    response_model=OutboundCallResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
    summary="Create Outbound Phone Call",
    description="Initiate an outbound phone call to a patient using VAPI",
)
async def create_outbound_call(request: OutboundCallRequest):
    """
    Create an outbound phone call to a patient.

    This endpoint uses VAPI's Python SDK to make an actual phone call
    to the patient's phone number. The patient will receive a call from
    your configured VAPI phone number.

    - **patient_phone**: Phone number in E.164 format (+15551234567)
    - **patient_name**: Patient's name (optional)
    - **assistant_overrides**: Custom assistant configuration (optional)
    - **wait_for_completion**: Whether to wait for call to complete ('connected', 'ended', or 'none')
    - **timeout**: Maximum seconds to wait if wait_for_completion is set
    """
    try:
        logger.info(
            f"Creating outbound call to {request.patient_phone} "
            f"(Patient: {request.patient_name or 'Unknown'}, "
            f"Wait for: {request.wait_for_completion})"
        )

        # Create outbound call via VAPI
        call = vapi_client.create_outbound_call(
            customer_phone=request.patient_phone,
            customer_name=request.patient_name,
            assistant_overrides=request.assistant_overrides,
        )

        logger.info(f"Call created successfully. Call ID: {call.id}")

        # If wait_for_completion is set, poll until call reaches desired state
        final_status = None
        call_completed = None
        structured_data = None
        transcript = None
        recording_url = None
        cost = None

        if request.wait_for_completion and request.wait_for_completion != "none":
            logger.info(
                f"Waiting for call to reach '{request.wait_for_completion}' state..."
            )

            try:
                final_call = vapi_client.wait_for_call_completion(
                    call_id=call.id,
                    wait_for=request.wait_for_completion,
                    timeout=request.timeout,
                )
                final_status = final_call.status
                call_completed = final_status in ["ended", "in-progress"]

                # Extract additional data if call ended
                if request.wait_for_completion == "ended" and final_status == "ended":
                    # Get raw data from VAPI
                    raw_analysis = getattr(final_call, "analysis", None) or getattr(
                        final_call, "structured_data", None
                    )
                    raw_transcript = getattr(final_call, "transcript", None)
                    recording_url = getattr(
                        final_call, "recording_url", None
                    ) or getattr(final_call, "recordingUrl", None)
                    cost = getattr(final_call, "cost", None)

                    # Convert VAPI Analysis object to dict for JSON serialization
                    if raw_analysis:
                        try:
                            if hasattr(raw_analysis, 'model_dump'):
                                structured_data = raw_analysis.model_dump()
                            elif hasattr(raw_analysis, 'dict'):
                                structured_data = raw_analysis.dict()
                            elif hasattr(raw_analysis, '__dict__'):
                                structured_data = {k: v for k, v in raw_analysis.__dict__.items() if not k.startswith('_')}
                            else:
                                structured_data = dict(raw_analysis) if isinstance(raw_analysis, dict) else None
                        except Exception as e:
                            logger.warning(f"Failed to serialize structured_data: {e}")
                            structured_data = None

                    # Convert transcript to list for JSON serialization
                    if raw_transcript:
                        try:
                            if isinstance(raw_transcript, str):
                                # Transcript is a string - wrap it in a list
                                transcript = [{"role": "conversation", "content": raw_transcript}]
                            elif isinstance(raw_transcript, list):
                                # Already a list - ensure each item is serializable
                                transcript = []
                                for item in raw_transcript:
                                    if hasattr(item, 'model_dump'):
                                        transcript.append(item.model_dump())
                                    elif hasattr(item, 'dict'):
                                        transcript.append(item.dict())
                                    elif hasattr(item, '__dict__'):
                                        transcript.append({k: v for k, v in item.__dict__.items() if not k.startswith('_')})
                                    elif isinstance(item, dict):
                                        transcript.append(item)
                                    else:
                                        transcript.append({"content": str(item)})
                            else:
                                transcript = None
                        except Exception as e:
                            logger.warning(f"Failed to serialize transcript: {e}")
                            transcript = None

                    logger.info(
                        f"Call {call.id} ended. "
                        f"Has structured data: {structured_data is not None}, "
                        f"Has transcript: {transcript is not None}, "
                        f"Has recording: {recording_url is not None}, "
                        f"Cost: ${cost}"
                    )

                logger.info(
                    f"Call {call.id} reached final state: {final_status} "
                    f"(completed: {call_completed})"
                )

            except TimeoutError as te:
                logger.warning(f"Timeout waiting for call completion: {str(te)}")
                # Still return success, but include timeout info
                final_status = "timeout"
                call_completed = False

        # Build response
        response_message = f"Call initiated successfully to {request.patient_phone}"
        if final_status:
            response_message += f" (Status: {final_status})"

        return OutboundCallResponse(
            success=True,
            call_id=call.id,
            message=response_message,
            patient_phone=request.patient_phone,
            patient_name=request.patient_name,
            status=final_status,
            call_completed=call_completed,
            structured_data=structured_data,
            transcript=transcript,
            recording_url=recording_url,
            cost=cost,
        )

    except Exception as e:
        logger.error(f"Error creating outbound call: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create outbound call: {str(e)}",
        )


@router.get(
    "/{call_id}",
    response_model=CallStatusResponse,
    responses={404: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get Call Status",
    description="Retrieve the status and details of a call by ID",
)
async def get_call_status(call_id: str):
    """
    Get the status of a specific call.

    Returns call details including status, timestamps, and cost information.
    """
    try:
        logger.info(f"Fetching status for call ID: {call_id}")

        call = vapi_client.get_call(call_id)

        return CallStatusResponse(
            call_id=call.id,
            status=call.status,
            created_at=call.created_at if hasattr(call, "created_at") else None,
            started_at=call.started_at if hasattr(call, "started_at") else None,
            ended_at=call.ended_at if hasattr(call, "ended_at") else None,
            cost=call.cost if hasattr(call, "cost") else None,
        )

    except Exception as e:
        logger.error(f"Error fetching call status: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Call not found: {str(e)}",
        )


@router.get(
    "/",
    summary="List Recent Calls",
    description="Get a list of recent calls",
)
async def list_calls(limit: int = 10):
    """
    List recent calls.

    - **limit**: Maximum number of calls to return (default: 10)
    """
    try:
        logger.info(f"Listing recent calls (limit: {limit})")

        calls = vapi_client.list_calls(limit=limit)

        return {
            "success": True,
            "count": len(calls) if isinstance(calls, list) else 0,
            "calls": calls,
        }

    except Exception as e:
        logger.error(f"Error listing calls: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list calls: {str(e)}",
        )
