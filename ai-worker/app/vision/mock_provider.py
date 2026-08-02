from typing import Optional, Dict, Any
from app.vision.base import BaseVisionProvider

class MockVisionProvider(BaseVisionProvider):
    @property
    def provider_name(self) -> str:
        return "mock"

    async def analyze_screenshot(
        self,
        image_bytes: bytes,
        goal_context: Optional[str] = None
    ) -> Dict[str, Any]:
        return {
            "current_application": "Visual Agent Control Center",
            "current_task": goal_context or "Automated Browser Control",
            "visible_components": [
                "Header Bar",
                "Goal Prompt Field",
                "Launch Agent Button",
                "Activity Log Box",
                "Tab Capture Controls"
            ],
            "workflow_step": "Awaiting User Action / Session Initialization",
            "confidence": 0.98,
            "summary": f"Detected active Visual Agent dashboard interface with input form and control panel. Context: {goal_context or 'Idle State'}",
            "important_entities": [
                {"name": "Application", "type": "Dashboard", "value": "Visual AI Browser Agent"},
                {"name": "Status", "type": "State", "value": "Ready"},
            ],
            "provider_used": self.provider_name,
        }
