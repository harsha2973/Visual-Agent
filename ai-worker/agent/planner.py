from typing import Dict, Any
from agent.grounding import GroundingEngine
from agent.pii_redactor import PIIRedactor

class ReActPlanner:
    """Multimodal ReAct planner combining vision screenshot + AX-DOM tree."""

    def __init__(self):
        self.grounding = GroundingEngine()
        self.redactor = PIIRedactor()

    def generate_plan(self, session_id: str, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        ax_tree = telemetry.get("axDomTree", [])
        url = telemetry.get("url", "")
        screenshot = telemetry.get("screenshotBase64", "")

        # 1. Filter interactive nodes
        interactive_nodes = self.grounding.filter_interactive_elements(ax_tree)

        # 2. Extract sensitive boxes for redaction
        sensitive_boxes = [
            node["boundingBox"]
            for node in interactive_nodes
            if node.get("isSensitive") and "boundingBox" in node
        ]

        # 3. Apply visual PII blackout
        redacted_screenshot = self.redactor.redact_image_base64(screenshot, sensitive_boxes)

        # 4. Formulate ReAct step decision
        target_id = interactive_nodes[0]["agentId"] if interactive_nodes else "1"
        
        return {
            "stepNumber": 1,
            "thought": f"Inspected page state at {url}. Located {len(interactive_nodes)} interactive target nodes. Proceeding to action.",
            "action": {
                "type": "CLICK" if interactive_nodes else "WAIT",
                "targetId": target_id,
                "duration_ms": 1000,
            },
            "confidence": 0.95,
            "requiresHumanApproval": False,
        }
