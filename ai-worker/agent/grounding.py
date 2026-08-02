from typing import List, Dict, Any

class GroundingEngine:
    """Parses Accessibility DOM trees and grounds LLM intent to specific target element IDs."""

    def filter_interactive_elements(self, ax_tree: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filters out non-essential DOM nodes, keeping elements with valid agentIds."""
        return [node for node in ax_tree if node.get("agentId")]

    def find_target_by_name(self, ax_tree: List[Dict[str, Any]], target_name: str) -> str:
        """Locates element agentId matching target search string."""
        target_name_lower = target_name.lower()
        for node in ax_tree:
            node_name = str(node.get("name", "")).lower()
            if target_name_lower in node_name:
                return str(node.get("agentId"))
        return ""
