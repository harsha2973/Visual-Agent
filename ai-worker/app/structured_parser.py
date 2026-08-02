import re
from typing import List, Dict, Any

class StructuredOCRParser:
    BUTTON_KEYWORDS = {
        "submit", "button", "click", "sign in", "login", "register", "buy now",
        "save", "cancel", "ok", "confirm", "send", "apply", "search", "download", "launch agent"
    }

    FORM_KEYWORDS = {
        "enter", "input", "email", "password", "username", "address", "phone",
        "search...", "first name", "last name", "credit card", "field"
    }

    NAV_KEYWORDS = {
        "home", "about", "contact", "pricing", "docs", "settings", "profile",
        "dashboard", "logout", "help", "faq", "menu"
    }

    def parse_tokens(self, tokens: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Categorizes extracted OCR tokens into structured categories:
        - visible_text
        - buttons
        - forms
        - navigation
        - headings
        """
        visible_text: List[str] = []
        buttons: List[Dict[str, Any]] = []
        forms: List[Dict[str, Any]] = []
        navigation: List[Dict[str, Any]] = []
        headings: List[Dict[str, Any]] = []

        for idx, token in enumerate(tokens):
            text = token["text"].strip()
            if not text:
                continue

            visible_text.append(text)
            text_lower = text.lower()

            bbox = {
                "left": token.get("left", 0),
                "top": token.get("top", 0),
                "width": token.get("width", 0),
                "height": token.get("height", 0),
            }

            # 1. Heading check: top element or large height / title casing
            if token.get("top", 0) < 100 and (len(text) > 3 or token.get("height", 0) > 30):
                if any(kw in text_lower for kw in ["welcome", "dashboard", "control", "title", "panel", "agent", "assistant"]):
                    headings.append({"text": text, "bbox": bbox})

            # 2. Button check
            if any(kw in text_lower for kw in self.BUTTON_KEYWORDS):
                buttons.append({"text": text, "bbox": bbox})
            # 3. Form check
            elif any(kw in text_lower for kw in self.FORM_KEYWORDS):
                forms.append({"text": text, "bbox": bbox, "type": "input"})
            # 4. Navigation check
            elif any(kw in text_lower for kw in self.NAV_KEYWORDS):
                navigation.append({"text": text, "bbox": bbox})
            elif idx == 0 and not headings:
                headings.append({"text": text, "bbox": bbox})

        return {
          "visible_text": visible_text,
          "buttons": buttons,
          "forms": forms,
          "navigation": navigation,
          "headings": headings,
        }

structured_parser = StructuredOCRParser()
