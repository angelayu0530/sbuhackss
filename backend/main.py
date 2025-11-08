from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from sqlalchemy import text
from db import init_db, db
from models import *  # Import all models

app = Flask(__name__)
CORS(app)
init_db(app)
migrate = Migrate(app, db)

@app.route('/')
def index():
    try:
        result = db.session.execute(text("SELECT NOW()"))
        current_time = result.fetchone()[0]
        return jsonify({"message": "Database connected!", "time": str(current_time)})
    except Exception as e:
        return jsonify({"error": "Database connection failed", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
