from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

POSTGRES_USER = "POSTGRES_USER"
POSTGRES_PASSWORD = "POSTGRES_PASSWORD"
POSTGRES_HOST = "POSTGRES_HOST"
POSTGRES_PORT = "POSTGRES_PORT"
POSTGRES_DB = "POSTGRES_DB"

db = SQLAlchemy()

def init_db(app):
    user = os.getenv(POSTGRES_USER)
    password = os.getenv(POSTGRES_PASSWORD)
    host = os.getenv(POSTGRES_HOST)
    port = os.getenv(POSTGRES_PORT)
    database = os.getenv(POSTGRES_DB)
    
    if not all([user, password, host, port, database]):
        raise ValueError("Missing required database environment variables")
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{user}:{password}@{host}:{port}/{database}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)