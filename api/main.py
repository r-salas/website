#
#
#   Main
#
#

from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles


PUBLIC_DIR = Path(__file__).parent / "public"

app = FastAPI()

app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
