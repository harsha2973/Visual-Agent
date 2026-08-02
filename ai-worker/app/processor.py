import asyncio
import uuid
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.ocr_engine import ocr_engine
from app.structured_parser import structured_parser

class AsyncOCRProcessor:
    def __init__(self):
        # In-memory async task store (backed by Redis in production)
        self.tasks: Dict[str, Dict[str, Any]] = {}

    def create_task(self) -> str:
        task_id = f"ocr_{uuid.uuid4().hex[:12]}"
        self.tasks[task_id] = {
            "task_id": task_id,
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None,
            "result": None,
            "error": None,
        }
        return task_id

    async def process_ocr_task(self, task_id: str, image_bytes: bytes) -> Dict[str, Any]:
        """
        Asynchronously runs OCR token extraction and structured UI parsing,
        updating the task state.
        """
        if task_id not in self.tasks:
            return {}

        self.tasks[task_id]["status"] = "PROCESSING"

        try:
            # Run blocking OCR token extraction in thread pool
            loop = asyncio.get_running_loop()
            tokens = await loop.run_in_executor(None, ocr_engine.extract_text_data, image_bytes)

            # Parse tokens into structured JSON
            structured_data = structured_parser.parse_tokens(tokens)

            self.tasks[task_id]["status"] = "COMPLETED"
            self.tasks[task_id]["completed_at"] = datetime.now(timezone.utc).isoformat()
            self.tasks[task_id]["result"] = structured_data
            return self.tasks[task_id]
        except Exception as err:
            self.tasks[task_id]["status"] = "FAILED"
            self.tasks[task_id]["error"] = str(err)
            return self.tasks[task_id]

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        return self.tasks.get(task_id)

ocr_processor = AsyncOCRProcessor()
