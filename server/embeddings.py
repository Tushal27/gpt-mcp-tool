from typing import Literal

import httpx

from .config import VOYAGE_API_KEY

MODEL = "voyage-3-lite"  # 512-dim, matches the "embedding vector(512)" column
EMBED_URL = "https://api.voyageai.com/v1/embeddings"


def embed(text: str, input_type: Literal["document", "query"]) -> list[float]:
    """Embed one piece of text via Voyage AI.

    input_type matters: Voyage tunes "document" (things you store) and
    "query" (things you search with) differently for asymmetric retrieval.
    """
    response = httpx.post(
        EMBED_URL,
        headers={"Authorization": f"Bearer {VOYAGE_API_KEY}"},
        json={"input": [text], "model": MODEL, "input_type": input_type},
        timeout=30,
    )
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]
