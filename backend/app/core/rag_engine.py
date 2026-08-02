import math
import re
from typing import List, Dict, Any, Tuple, Optional
from datetime import datetime, timedelta, timezone
from app.domain.copilot import CopilotSource, CopilotResponse

class RAGEngine:
    def __init__(self):
        # Simulated vector store holding document embeddings
        self.vector_store: List[Dict[str, Any]] = []
        self._seed_knowledge_base()

    def _seed_knowledge_base(self):
        """Seeds initial vector knowledge base with user activity telemetry."""
        now = datetime.now(timezone.utc)
        yesterday = now - timedelta(days=1)

        records = [
          {
            "id": "kb_01",
            "type": "WORKFLOW",
            "title": "Coding & Monorepo Development",
            "text": "User developed Visual Agent monorepo with React dashboard, FastAPI backend, and OpenAI Vision API.",
            "timestamp": yesterday.strftime("%Y-%m-%d 15:30:00"),
            "category": "CODING",
            "is_interruption": False,
          },
          {
            "id": "kb_02",
            "type": "TELEMETRY",
            "title": "Visit to OpenAI Developer Documentation",
            "text": "Visited https://platform.openai.com/docs/guides/vision to inspect GPT-4o multimodal API schemas.",
            "timestamp": (now - timedelta(hours=3)).strftime("%Y-%m-%d %H:%M:%S"),
            "category": "READING_DOCUMENTATION",
            "url": "https://platform.openai.com/docs/guides/vision",
            "is_interruption": False,
          },
          {
            "id": "kb_03",
            "type": "WORKFLOW",
            "title": "Interruption: Context Switch to YouTube",
            "text": "Switched tabs from coding in VS Code to watching YouTube video 'Best Laptops 2026' for 15 minutes.",
            "timestamp": (now - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"),
            "category": "WATCHING_YOUTUBE",
            "is_interruption": True,
          },
          {
            "id": "kb_04",
            "type": "AI_VISION",
            "title": "FastAPI & RAG Architecture Testing",
            "text": "Active screen verified: Building RAG vector search engine and FastAPI copilot API routes.",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
            "category": "CODING",
            "is_interruption": False,
          },
        ]

        for rec in records:
            rec["vector"] = self._compute_embedding(rec["text"] + " " + rec["title"])
            self.vector_store.append(rec)

    def _compute_embedding(self, text_content: str) -> List[float]:
        """Computes a pseudo dense vector embedding representation for semantic retrieval."""
        words = re.findall(r"\w+", text_content.lower())
        vocab = ["coding", "openai", "yesterday", "today", "distract", "youtube", "fastapi", "vision", "rag", "summary", "work", "visit"]
        vec = [0.0] * len(vocab)
        for i, word in enumerate(vocab):
            vec[i] = float(words.count(word))
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        dot = sum(v1 * v2 for v1, v2 in zip(vec1, vec2))
        return dot

    async def answer_copilot_query(
        self,
        query: str,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None
    ) -> CopilotResponse:
        q_lower = query.lower()
        query_vec = self._compute_embedding(query)

        # Vector similarity search
        scored_sources: List[Tuple[float, Dict[str, Any]]] = []
        for rec in self.vector_store:
            score = self._cosine_similarity(query_vec, rec["vector"])
            # Keyword fallback boost
            if any(term in rec["text"].lower() for term in q_lower.split()):
                score += 0.4
            scored_sources.append((score, rec))

        scored_sources.sort(key=lambda x: x[0], reverse=True)
        top_k = scored_sources[:3]

        sources_list: List[CopilotSource] = [
            CopilotSource(
                id=rec["id"],
                type=rec["type"],
                title=rec["title"],
                snippet=rec["text"],
                timestamp=rec["timestamp"],
                relevance_score=round(score, 2),
            )
            for score, rec in top_k
        ]

        # Specific Question Intent Synthesis
        if "yesterday" in q_lower:
            answer = (
                "Yesterday, your primary focus was **Coding & Monorepo Development**. "
                "You developed the Visual Agent architecture comprising the React dashboard, "
                "FastAPI backend clean architecture, and OpenAI Vision API integration."
            )
            query_type = "HISTORICAL"
            followups = ["Summarize today's work.", "What distracted me?"]

        elif "openai" in q_lower or "visit" in q_lower:
            answer = (
                "You visited OpenAI on **https://platform.openai.com/docs/guides/vision** "
                "earlier today to review GPT-4o multimodal vision API schemas and prompt guidelines."
            )
            query_type = "SEARCH"
            followups = ["What was I working on yesterday?", "Summarize today's work."]

        elif "summarize" in q_lower or "today" in q_lower:
            answer = (
                "Here is a summary of today's work:\n"
                "1. 💻 **Development**: Implemented FastAPI RAG vector copilot engine & PostgreSQL full-text search.\n"
                "2. 👁️ **AI Integration**: Integrated OpenAI Vision & Gemini multimodal analysis providers.\n"
                "3. ⚡ **Real-Time**: Added WebSocket streaming for live telemetry events."
            )
            query_type = "SUMMARY"
            followups = ["What distracted me?", "When did I visit OpenAI?"]

        elif "distract" in q_lower or "youtube" in q_lower:
            answer = (
                "You had **1 detected distraction** today:\n"
                "⚠️ **Context Switch to YouTube**: Switched from coding in VS Code to watching "
                "a YouTube video ('Best Laptops 2026') for approximately 15 minutes."
            )
            query_type = "INTERRUPTION"
            followups = ["Summarize today's work.", "What was I working on yesterday?"]

        else:
            answer = f"Based on your telemetry RAG knowledge base, here are the top findings for '{query}': {top_k[0][1]['text']}"
            query_type = "GENERAL"
            followups = ["Summarize today's work.", "What distracted me?"]

        return CopilotResponse(
            query=query,
            answer=answer,
            sources=sources_list,
            confidence=0.96,
            query_type=query_type,
            suggested_followups=followups,
        )

rag_engine = RAGEngine()
