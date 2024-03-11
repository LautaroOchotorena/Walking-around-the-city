from flask import Flask, render_template, request, jsonify, redirect, url_for, make_response
import networkx as nx
import osmnx as ox
import random
from geopy.geocoders import Nominatim

app = Flask(__name__)

@app.route('/dynamic_route')
def dynamic_route():
    # Tu lógica para generar contenido dinámico
    response = make_response(render_template('dynamic_template.html'))

    # Establecer encabezado Cache-Control para cachear durante 1 hora
    response.headers['Cache-Control'] = 'public, max-age=3600'  # Cachear durante 1 hora

    return response

def obtener_coordenadas(ciudad):
    global latitud, longitud
    geolocator = Nominatim(user_agent="mi_app")
    try:
        location = geolocator.geocode(ciudad)
        if location:
            latitud, longitud = location.latitude, location.longitude
            return True  # Success
    except Exception as e:
        print(f"Error in obtener_coordenadas: {e}")
    return False  # Failure

ciudad = "La Plata"
distancia_total_objetivo_km = 2.5
obtener_coordenadas(ciudad)
success = True

def generar_recorrido():    
    graph = ox.graph_from_point((latitud, longitud), dist=distancia_total_objetivo_km*200+2000, network_type='drive')
    graph = ox.utils_graph.get_undirected(graph)

    # Encontrar el nodo más cercano
    nodo_inicio = ox.distance.nearest_nodes(graph, X=longitud, Y=latitud)

    # Initialize the existing path
    recorrido = [nodo_inicio]

    distancia_recorrida_km = 0.0
    # Attempt to generate a closed circuit of 5 km without repeating nodes
    while distancia_recorrida_km < distancia_total_objetivo_km:
        nodo_actual = recorrido[-1]
        nodos_no_visitados = set(graph.neighbors(nodo_actual)) - set(recorrido)

        if not nodos_no_visitados:
            recorrido = [nodo_inicio]
            distancia_recorrida_km = 0.0
            continue

        # Calculate probabilities for node selection
        max_y_node = max(nodos_no_visitados, key=lambda node: graph.nodes[node]['y']*0.5-graph.nodes[node]['x']*0.5)
        probabilities = [0.8 if node == max_y_node else 0.2 for node in nodos_no_visitados]

        # Choose the next node based on probabilities
        nodo_siguiente = random.choices(list(nodos_no_visitados), weights=probabilities)[0]

        distancia_entre_nodos_km = graph[nodo_actual][nodo_siguiente][0]['length'] / 1000.0
        recorrido.append(nodo_siguiente)
        distancia_recorrida_km += distancia_entre_nodos_km

    # Find the shortest path from the last node of the existing path back to the initial node
    nodo_final = recorrido[-1]
    nuevo_recorrido = nx.shortest_path(graph, source=nodo_final, target=nodo_inicio, weight='length')[0:]
    longitud_del_nuevo_recorrido = nx.shortest_path_length(graph, source=nodo_final, target=nodo_inicio, weight='length')/1000.0

    coordenadas_recorrido_1 = [(graph.nodes[nodo]['y'], graph.nodes[nodo]['x']) for nodo in recorrido]
    coordenadas_recorrido_2 = [(graph.nodes[nodo]['y'], graph.nodes[nodo]['x']) for nodo in nuevo_recorrido]
    return coordenadas_recorrido_1, coordenadas_recorrido_2, distancia_recorrida_km, longitud_del_nuevo_recorrido

@app.route('/')
def index():
    return render_template('index.html', latitud=latitud, longitud=longitud, success=success)

@app.route('/generar_recorrido')
def generar_recorrido_ajax():
    primer_recorrido, segundo_recorrido, distancia_primer_recorrido , distancia_segundo_recorrido = generar_recorrido()
    return jsonify({'primer_recorrido': primer_recorrido,
        'segundo_recorrido': segundo_recorrido,
        'longitud_primer_recorrido':distancia_primer_recorrido,
        'longitud_segundo_recorrido':distancia_segundo_recorrido})

# Ruta para manejar el punto seleccionado desde el cliente
@app.route('/manejar_punto_seleccionado', methods=['POST'])
def manejar_punto_seleccionado():
    global latitud, longitud

    data = request.get_json()
    punto_seleccionado = data['puntoSeleccionado']
    
    # Actualizar las coordenadas con el punto seleccionado
    latitud = punto_seleccionado['latitud']
    longitud = punto_seleccionado['longitud']

    return jsonify()

@app.route('/cambiar_ciudad', methods=['POST'])
def cambiar_ciudad():
    global success, latitud, longitud, ciudad
    nueva_ciudad = request.form.get('nueva_ciudad')
    if nueva_ciudad:
        ciudad = nueva_ciudad
        success = obtener_coordenadas(ciudad)
        if success:
            return jsonify({'latitud': latitud, 'longitud': longitud, 'success': success})
    return jsonify({'success': False})

@app.route('/cambiar_distancia', methods=['POST'])
def cambiar_distancia():
    global distancia_total_objetivo_km
    nueva_distancia = request.form.get('distancia_objetivo')
    
    if nueva_distancia is not None:
        distancia_total_objetivo_km = float(nueva_distancia)
        return '', 204
    else:
        return '', 400

if __name__ == '__main__':
    app.run(debug=True)
