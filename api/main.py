#
#
#   Main
#
#

from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from chat import router as chat_router
from enums import ResumeLanguage
from voice import router as voice_router


PUBLIC_DIR = Path(__file__).parent / "public"
DATA_DIR = Path(__file__).parent / "data"

ENGLISH_CV_PATH = DATA_DIR / "Ruben_Salas_ML_Engineer_CV_EN.pdf"
SPANISH_CV_PATH = DATA_DIR / "Ruben_Salas_ML_Engineer_CV_ES.pdf"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(chat_router)
app.include_router(voice_router)


@app.get("/cv")
def get_cv(language: ResumeLanguage = Query(ResumeLanguage.ENGLISH, alias="lang")):
    if language == ResumeLanguage.ENGLISH:
        cv_path = ENGLISH_CV_PATH
    elif language == ResumeLanguage.SPANISH:
        cv_path = SPANISH_CV_PATH
    else:
        raise NotImplementedError(f"Language {language} is not supported for CV download.")

    return FileResponse(cv_path, media_type="application/pdf", filename="Ruben_Salas_ML_Engineer_CV.pdf")


if PUBLIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="public")
