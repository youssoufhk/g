"""Blob storage wrapper (M1)."""

from dataclasses import dataclass
from pathlib import Path
from typing import Protocol
import hashlib
import os


@dataclass
class BlobRef:
    key: str
    size_bytes: int
    sha256: str
    content_type: str | None


class BlobStorage(Protocol):
    async def put(
        self,
        *,
        key: str,
        content: bytes,
        content_type: str | None = None,
    ) -> BlobRef: ...

    async def get(self, *, key: str) -> bytes: ...

    async def delete(self, *, key: str) -> None: ...


class LocalFilesystemBlobStorage:
    """Dev stub: writes into ``settings.local_blob_root``."""

    def __init__(self, root: str) -> None:
        self._root = Path(root).resolve()
        self._root.mkdir(parents=True, exist_ok=True)

    def _path_for(self, key: str) -> Path:
        safe = key.replace("..", "").lstrip("/")
        return self._root / safe

    async def put(
        self,
        *,
        key: str,
        content: bytes,
        content_type: str | None = None,
    ) -> BlobRef:
        path = self._path_for(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return BlobRef(
            key=key,
            size_bytes=len(content),
            sha256=hashlib.sha256(content).hexdigest(),
            content_type=content_type,
        )

    async def get(self, *, key: str) -> bytes:
        return self._path_for(key).read_bytes()

    async def delete(self, *, key: str) -> None:
        path = self._path_for(key)
        if path.exists():
            os.remove(path)


def get_storage() -> BlobStorage:
    from app.core.config import settings

    if settings.blob_backend == "local":
        return LocalFilesystemBlobStorage(settings.local_blob_root)
    raise RuntimeError(
        f"real blob backend not wired yet (§3.11): {settings.blob_backend!r}"
    )
