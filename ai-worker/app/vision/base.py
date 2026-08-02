from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from app.vision.models import MultimodalAnalysisResult

class BaseVisionProvider(ABC):
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Returns provider identifier name."""
        pass

    @abstractmethod
    async def analyze_screenshot(
        self,
        image_bytes: bytes,
        goal_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyzes a screenshot image and optional task context,
        returning a structured dictionary containing:
        - current_application
        - current_task
        - visible_components
        - workflow_step
        - confidence
        - summary
        - important_entities
        """
        pass
