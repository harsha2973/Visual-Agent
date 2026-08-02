import re
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timezone

class WorkflowEngine:
    PATTERNS: Dict[str, List[str]] = {
        "READING_DOCUMENTATION": [
            r"docs\.", r"mdn", r"developer\.", r"stackoverflow\.com",
            r"readthedocs", r"github\.com/.+/docs", r"api-ref"
        ],
        "CODING": [
            r"github\.com", r"gitlab\.com", r"leetcode\.com", r"vscode\.dev",
            r"replit\.com", r"codepen\.io", r"stackblitz\.com", r"localhost"
        ],
        "WATCHING_YOUTUBE": [
            r"youtube\.com", r"youtu\.be", r"netflix\.com", r"vimeo\.com", r"twitch\.tv"
        ],
        "WRITING_EMAIL": [
            r"mail\.google\.com", r"outlook\.", r"mailchimp\.com", r"superhuman\.com"
        ],
        "USING_JIRA": [
            r"atlassian\.net", r"jira", r"confluence", r"linear\.app", r"trello\.com"
        ],
        "UPDATING_NOTION": [
            r"notion\.so", r"coda\.io", r"obsidian\.md", r"docs\.google\.com"
        ],
        "SHOPPING": [
            r"amazon\.", r"ebay\.", r"flipkart\.", r"shopify\.", r"cart", r"checkout"
        ],
    }

    def classify_url_or_text(self, url: str, text_context: str = "") -> Tuple[str, float]:
        """Classifies a URL and text context into a workflow category with confidence score."""
        combined = f"{url} {text_context}".lower()

        for category, patterns in self.PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, combined, re.IGNORECASE):
                    return category, 0.92

        return "GENERAL_BROWSING", 0.70

    def process_session_workflows(
        self,
        events: List[Dict[str, Any]],
        ai_vision_results: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Analyzes sequence of browser telemetry events & AI vision results,
        detects workflows, flags interruptions, and constructs directed workflow graph.
        """
        if not events:
            return {
                "workflows": [],
                "graph": {"nodes": [], "edges": [], "interruption_count": 0, "total_duration_seconds": 0}
            }

        # 1. Aggregate AI context if available
        ai_summary = ""
        if ai_vision_results:
            ai_summary = " ".join([item.get("summary", "") + " " + item.get("current_task", "") for item in ai_vision_results])

        # 2. Extract URL telemetry event intervals
        segments: List[Dict[str, Any]] = []
        for evt in events:
            payload = evt.get("payload", {})
            url = payload.get("url") or payload.get("currentUrl") or ""
            ts_str = evt.get("timestamp")
            
            if url:
                category, confidence = self.classify_url_or_text(url, ai_summary)
                segments.append({
                    "timestamp": ts_str,
                    "url": url,
                    "category": category,
                    "confidence": confidence,
                    "event_type": evt.get("eventType", "URL_NAV")
                })

        if not segments:
            category, confidence = self.classify_url_or_text("", ai_summary)
            segments.append({
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "url": "N/A",
                "category": category,
                "confidence": confidence,
                "event_type": "SESSION_START"
            })

        # 3. Detect dominant primary workflow and identify interruptions
        category_counts: Dict[str, int] = {}
        for seg in segments:
            cat = seg["category"]
            category_counts[cat] = category_counts.get(cat, 0) + 1

        primary_category = max(category_counts, key=category_counts.get) if category_counts else "GENERAL_BROWSING"

        # Build workflows list & interruption flags
        workflows: List[Dict[str, Any]] = []
        nodes: List[Dict[str, Any]] = []
        edges: List[Dict[str, Any]] = []
        interruption_count = 0

        prev_cat = None
        for idx, seg in enumerate(segments):
            cat = seg["category"]
            is_interruption = (
                primary_category != "GENERAL_BROWSING"
                and cat != primary_category
                and cat in ["WATCHING_YOUTUBE", "SHOPPING"]
            )

            if is_interruption:
                interruption_count += 1

            title = f"{cat.replace('_', ' ').title()} - {seg['url'][:30]}"
            wf_item = {
                "id": f"wf_{idx + 1}",
                "category": cat,
                "title": title,
                "url": seg["url"],
                "timestamp": seg["timestamp"],
                "confidence": seg["confidence"],
                "is_interruption": is_interruption,
                "interruption_type": f"Context switch to {cat}" if is_interruption else None
            }
            workflows.append(wf_item)

            # Node for graph
            node_id = f"node_{cat.lower()}_{idx}"
            nodes.append({
                "id": node_id,
                "category": cat,
                "label": cat.replace("_", " ").title(),
                "is_interruption": is_interruption
            })

            # Edge for graph
            if prev_cat:
                edges.append({
                    "source": prev_cat["node_id"],
                    "target": node_id,
                    "transition": seg["event_type"],
                    "is_interruption": is_interruption
                })

            prev_cat = {"node_id": node_id, "category": cat}

        graph = {
            "nodes": nodes,
            "edges": edges,
            "primary_workflow": primary_category,
            "interruption_count": interruption_count,
            "total_segments": len(segments)
        }

        return {
            "primary_workflow": primary_category,
            "workflows": workflows,
            "graph": graph,
            "interruption_count": interruption_count,
        }

workflow_engine = WorkflowEngine()
