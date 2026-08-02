import base64
import json
from typing import Optional, Dict, Any
from app.vision.base import BaseVisionProvider

try:
    import openai
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

class OpenAIVisionProvider(BaseVisionProvider):
    def __init__(self, api_key: Optional[str] = None, model: str = "gpt-4o"):
        self.api_key = api_key
        self.model = model
        self.client = AsyncOpenAI(api_key=api_key) if HAS_OPENAI and api_key else None

    @property
    def provider_name(self) -> str:
        return "openai"

    async def analyze_screenshot(
        self,
        image_bytes: bytes,
        goal_context: Optional[str] = None
    ) -> Dict[str, Any]:
        if not self.client:
            raise ValueError("[OpenAIVisionProvider] OpenAI API key is missing or client not initialized.")

        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:image/jpeg;base64,{base64_image}"

        prompt = (
            "Analyze the attached active browser screenshot in detail and return a JSON object with the following fields:\n"
            "- current_application: (string) name of active web application or site\n"
            "- current_task: (string) user's active task or goal\n"
            "- visible_components: (array of strings) key visible UI components\n"
            "- workflow_step: (string) current step in user workflow\n"
            "- confidence: (float 0.0-1.0) analysis confidence\n"
            "- summary: (string) concise natural language summary of screen state\n"
            "- important_entities: (array of objects with 'name', 'type', 'value') key labels, inputs, or IDs\n"
        )
        if goal_context:
            prompt += f"\nContext Goal: {goal_context}"

        response = await self.client.chat.completions.create(
            model=self.model,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {"url": data_url, "detail": "high"},
                        },
                    ],
                }
            ],
            temperature=0.2,
        )

        content = response.choices[0].message.content
        parsed = json.loads(content or "{}")

        return {
            "current_application": parsed.get("current_application", "Unknown Application"),
            "current_task": parsed.get("current_task", goal_context or "Browser Automation"),
            "visible_components": parsed.get("visible_components", []),
            "workflow_step": parsed.get("workflow_step", "Active Viewing"),
            "confidence": float(parsed.get("confidence", 0.95)),
            "summary": parsed.get("summary", "Screen state analyzed via OpenAI Vision API"),
            "important_entities": parsed.get("important_entities", []),
            "provider_used": self.provider_name,
        }
