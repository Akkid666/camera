from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)

# In-memory storage for detected humans
registered_people = []
next_id_counter = 1
MATCH_THRESHOLD = 0.45  # Feature distance threshold

def calculate_distance(vec1, vec2):
    """Calculates Euclidean distance between two feature vectors."""
    min_len = min(len(vec1), len(vec2))
    return math.sqrt(sum((vec1[i] - vec2[i]) ** 2 for i in range(min_len)))

@app.route('/api/identify', methods=['POST'])
def identify_person():
    global next_id_counter
    data = request.get_json() or {}
    features = data.get('features', [])

    if not features or len(features) < 5:
        return jsonify({'error': 'Invalid landmark features'}), 400

    best_match = None
    min_dist = float('inf')

    for person in registered_people:
        dist = calculate_distance(features, person['features'])
        if dist < MATCH_THRESHOLD and dist < min_dist:
            min_dist = dist
            best_match = person

    if best_match:
        return jsonify({
            'status': 'REGISTERED',
            'person_id': best_match['id'],
            'is_new': False
        })
    else:
        new_id = f"HUMAN-{str(next_id_counter).zfill(4)}"
        next_id_counter += 1
        new_person = {
            'id': new_id,
            'features': features,
            'timestamp': 'Registered'
        }
        registered_people.append(new_person)
        return jsonify({
            'status': 'NEWLY_REGISTERED',
            'person_id': new_id,
            'is_new': True
        })

@app.route('/api/people', methods=['GET'])
def list_people():
    people_list = [{'id': p['id'], 'timestamp': p['timestamp']} for p in registered_people]
    return jsonify({
        'count': len(people_list),
        'people': people_list
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
