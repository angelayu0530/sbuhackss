from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from sqlalchemy import text
from db import init_db, db
from models import *
from auth.routes import auth_bp
from chat.routes import chat_bp
from patients.routes import patients_bp
from tasks.routes import tasks_bp
from resources.routes import resources_bp
from conditions.routes import conditions_bp
from medications.routes import medications_bp
from recommendations.routes import recommendations_bp

app = Flask(__name__)
from dotenv import load_dotenv
import os
load_dotenv()
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY')  
CORS(app)
init_db(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(chat_bp, url_prefix='/chat')
app.register_blueprint(patients_bp, url_prefix='/patients')
app.register_blueprint(tasks_bp, url_prefix='/tasks')
app.register_blueprint(resources_bp, url_prefix='/resources')
app.register_blueprint(conditions_bp, url_prefix='/conditions')
app.register_blueprint(medications_bp, url_prefix='/medications')
app.register_blueprint(recommendations_bp, url_prefix='/recommendations')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
