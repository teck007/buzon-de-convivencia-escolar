from flask import Flask
from pathlib import Path

app = Flask(__name__, template_folder=str(Path(__file__).parent / 'templates'))
app.config['SECRET_KEY'] = 'B2KX9tGHMQGZwcsQDVCHKHP4pAcR5pmejuCUE0jxgqGXWle2G9yQ6v92EmXamA0x'

from app.controllers import reportesController