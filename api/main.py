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


PUBLIC_DIR = Path(__file__).parent / "public"
DATA_DIR = Path(__file__).parent / "data"

CV_PATH = DATA_DIR / "Ruben_Salas_ML_Engineer_CV.pdf"

PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat_router)


@app.get("/cv")
def get_cv():
    return FileResponse(CV_PATH, media_type="application/pdf", filename=CV_PATH.name)


app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
