"""Tests for serving the built frontend with an index.html fallback."""

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.spa import SPAStaticFiles


@pytest.fixture
def client(tmp_path):
    (tmp_path / "index.html").write_text("<p>index</p>")
    (tmp_path / "assets").mkdir()
    (tmp_path / "assets" / "app.js").write_text("console.log('app')")

    app = FastAPI()
    app.mount("/", SPAStaticFiles(directory=tmp_path, html=True))
    return TestClient(app)


def test_root_serves_index(client):
    response = client.get("/")

    assert response.status_code == 200
    assert response.text == "<p>index</p>"


def test_deep_link_falls_back_to_index(client):
    response = client.get("/career")

    assert response.status_code == 200
    assert response.text == "<p>index</p>"


def test_asset_is_served(client):
    response = client.get("/assets/app.js")

    assert response.status_code == 200
    assert response.text == "console.log('app')"


def test_missing_file_returns_404(client):
    response = client.get("/assets/missing.js")

    assert response.status_code == 404


def test_unknown_api_path_returns_404(client):
    response = client.get("/api/unknown")

    assert response.status_code == 404
