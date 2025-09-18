from flask import Flask, render_template, request, jsonify, redirect, url_for, make_response
import networkx as nx
import osmnx as ox
import random
from geopy.geocoders import Nominatim
from geopy.geocoders import OpenCage

app = Flask(__name__)

def get_coordinates(city):
    global latitude, longitude
    try:
        geolocator = Nominatim(user_agent="my_app")
        location = geolocator.geocode(city)
        if location:
            latitude, longitude = location.latitude, location.longitude
            return True  # Success

    except:
        try:
            geolocator = OpenCage(api_key="9a7dbb7f4ac84b0aa838239095bf3ce6")
            location = geolocator.geocode(city)
            if location:
                latitude, longitude = location.latitude, location.longitude
                return True  # Success
        except Exception as e:
            print(f"Error in get_coordinates: {e}")
    return False  # Failure

city = "La Plata, Buenos Aires, Argentina"
target_total_distance_km = 3
latitude, longitude = -34.9214, -57.9545
get_coordinates(city)
success = True

ox.settings.use_cache = False

def generate_route():
    graph = ox.graph_from_point((latitude, longitude), dist=target_total_distance_km*200+2000, network_type='drive')
    graph = ox.utils_graph.get_undirected(graph)

    # Find the nearest node
    start_node = ox.distance.nearest_nodes(graph, X=longitude, Y=latitude)

    # Initialize the existing path
    route = [start_node]

    traveled_distance_km = 0.0
    # Attempt to generate a closed circuit of 5 km without repeating nodes
    while traveled_distance_km < target_total_distance_km:
        current_node = route[-1]
        unvisited_nodes = set(graph.neighbors(current_node)) - set(route)

        if not unvisited_nodes:
            route = [start_node]
            traveled_distance_km = 0.0
            continue

        # Calculate probabilities for node selection
        max_y_node = max(unvisited_nodes, key=lambda node: graph.nodes[node]['y']*0.5-graph.nodes[node]['x']*0.5)
        probabilities = [0.8 if node == max_y_node else 0.2 for node in unvisited_nodes]

        # Choose the next node based on probabilities
        next_node = random.choices(list(unvisited_nodes), weights=probabilities)[0]

        distance_between_nodes_km = graph[current_node][next_node][0]['length'] / 1000.0
        route.append(next_node)
        traveled_distance_km += distance_between_nodes_km

    # Find the shortest path from the last node of the existing path back to the initial node
    final_node = route[-1]
    new_route = nx.shortest_path(graph, source=final_node, target=start_node, weight='length')[0:]
    new_route_length = nx.shortest_path_length(graph, source=final_node, target=start_node, weight='length')/1000.0

    coordinates_route_1 = [(graph.nodes[node]['y'], graph.nodes[node]['x']) for node in route]
    coordinates_route_2 = [(graph.nodes[node]['y'], graph.nodes[node]['x']) for node in new_route]
    return coordinates_route_1, coordinates_route_2, traveled_distance_km, new_route_length

@app.route('/')
def index():
    return render_template('index.html', latitude=latitude, longitude=longitude, success=success)

@app.route('/generate_route')
def generate_route_ajax():
    first_route, second_route, first_route_distance, second_route_distance = generate_route()
    return jsonify({'first_route': first_route,
                    'second_route': second_route,
                    'first_route_length': first_route_distance,
                    'second_route_length': second_route_distance})

# Route to handle the selected point from the client
@app.route('/handle_selected_point', methods=['POST'])
def handle_selected_point():
    global latitude, longitude

    data = request.get_json()
    selected_point = data['selectedPoint']
    
    # Update the coordinates with the selected point
    latitude = selected_point['latitude']
    longitude = selected_point['longitude']

    return jsonify()

@app.route('/change_city', methods=['POST'])
def change_city():
    global success, latitude, longitude, city
    new_city = request.form.get('new_city')
    if new_city:
        city = new_city
        success = get_coordinates(city)
        if success:
            return jsonify({'latitude': latitude, 'longitude': longitude, 'success': success})
    return jsonify({'success': False})

@app.route('/change_distance', methods=['POST'])
def change_distance():
    global target_total_distance_km
    new_distance = request.form.get('target_distance')
    
    if new_distance is not None:
        target_total_distance_km = float(new_distance)
        return '', 204
    else:
        return '', 400

@app.route('/initialize_distance', methods=['POST'])
def initialize_distance():
    global target_total_distance_km
    target_total_distance_km = 3
    return '', 204

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=7860)