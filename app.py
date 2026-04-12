from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from connection.db import init_db, get_available_slots, seed_slots, book_slot

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Initialize DB
    init_db()
    seed_slots()

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/appointments', methods=['GET'])
    def get_appointments():
        open_appointments = get_available_slots()
        return jsonify(open_appointments), 200

    @app.route("/book/<int:slot_id>", methods=["POST"])
    def book(slot_id):
        success = book_slot(slot_id)

        if success:
            return jsonify({"message": "Slot booked successfully"}), 200
        else:
            return jsonify({"message": "Slot already booked or invalid"}), 400

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)