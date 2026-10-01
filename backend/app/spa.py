"""Static file serving for the single-page frontend."""

from pathlib import PurePosixPath

from starlette.exceptions import HTTPException
from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.types import Scope


def is_page_route(path: str) -> bool:
    """Return True for paths the React router handles, not API calls or files."""
    return not path.startswith("api/") and not PurePosixPath(path).suffix


class SPAStaticFiles(StaticFiles):
    """Serve built frontend files, returning index.html for unknown page routes."""

    async def get_response(self, path: str, scope: Scope) -> Response:
        """Return the requested file, or index.html so client-side routes load."""
        try:
            return await super().get_response(path, scope)
        except HTTPException as exc:
            if exc.status_code != 404 or not is_page_route(path):
                raise
            return await super().get_response("index.html", scope)
