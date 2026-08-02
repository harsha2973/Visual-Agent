import os
from typing import Optional, Dict
from app.vision.base import BaseVisionProvider
from app.vision.openai_provider import OpenAIVisionProvider
from app.vision.gemini_provider import GoogleGeminiVisionProvider
from app.vision.mock_provider import MockVisionProvider

class VisionFactory:
    @staticmethod
    def get_provider(
        provider_name: Optional[str] = None,
        api_key: Optional[str] = None,
    ) -> BaseVisionProvider:
        """
        Instantiates vision provider based on provider_name or AI_PROVIDER environment variable.
        Supported values: 'openai', 'gemini', 'mock'.
        """
        selected_provider = (provider_name or os.getenv("AI_PROVIDER", "mock")).lower()

        if selected_provider == "openai":
            key = api_key or os.getenv("OPENAI_API_KEY")
            if not key:
                print("[VisionFactory] OPENAI_API_KEY is not set. Falling back to MockVisionProvider.")
                return MockVisionProvider()
            return OpenAIVisionProvider(api_key=key)

        elif selected_provider == "gemini":
            key = api_key or os.getenv("GEMINI_API_KEY")
            return GoogleGeminiVisionProvider(api_key=key)

        elif selected_provider == "mock":
            return MockVisionProvider()

        else:
            print(f"[VisionFactory] Unknown provider '{selected_provider}'. Defaulting to MockVisionProvider.")
            return MockVisionProvider()

vision_factory = VisionFactory()
