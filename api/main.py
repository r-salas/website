#
#
#   Main
#
#

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from chat import router as chat_router
from config import settings
from voice import router as voice_router


PUBLIC_DIR = Path(__file__).parent / "public"
DATA_DIR = Path(__file__).parent / "data"

CV_PATH = DATA_DIR / "Ruben_Salas_ML_Engineer_CV.pdf"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat_router)
app.include_router(voice_router)


@app.get("/cv")
def get_cv():
    return FileResponse(CV_PATH, media_type="application/pdf", filename=CV_PATH.name)


if PUBLIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
