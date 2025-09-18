// Define translations directly in JavaScript
var translations_data = {
    'es': ['Seleccionar inicio', 'Generar recorrido', 'Distancia de ida (km):',
           'Ciudad:', 'Cambiar', 'Longitud recorrido azul: ', 'Longitud recorrido rojo: ',
           'Total: ', 'Error: La distancia objetivo debe estar entre 0 y 10.',
           'No se pudo cargar la ciudad, intente de nuevo.',
           'Cambiar ciudad'],
    'en': ['Select start', 'Generate route', 'One-way distance (km):',
            'City:', 'Change', 'Blue route length: ', 'Red route length: ',
            'Total: ', 'Error: The target distance must be between 0 and 10.',
            'Failed to load the city, please try again.',
            'Change City'],
};
// Initial language
var currentLanguage = 'en';
// Function to change the language
function changeLanguage(lang) {
    currentLanguage = lang;
    updateTranslations();
}
// Function to update the translations based on the current language
function updateTranslations() {
    document.getElementById('btnSelectStart').innerText = translations_data[currentLanguage][0];
    document.getElementById('btnGenerateRoute').innerText = translations_data[currentLanguage][1];
    document.getElementById('OneWayDistance').innerText = translations_data[currentLanguage][2];
    document.getElementById('City').innerText = translations_data[currentLanguage][3];
    document.getElementById('Change').innerText = translations_data[currentLanguage][4];
    document.getElementById('Blue_route_length').innerText = translations_data[currentLanguage][5];
    document.getElementById('Red_route_length').innerText = translations_data[currentLanguage][6];
    document.getElementById('Total_route_length').innerText = translations_data[currentLanguage][7];
    var inputElement = document.getElementById('new_city');
    var placeholderText = translations_data[currentLanguage][10];
    inputElement.placeholder = placeholderText;
}

// Initial call to update translations for the default language (e.g., 'es')
updateTranslations();
// Press distance
function updateTargetDistance() {
    var form = document.getElementById('distanceForm');
    var formData = new FormData(form);
    var distanceInput = document.getElementById('target_distance');

    var newDistance = distanceInput.value;

    // Check if the distance is in the desired range
    if (isNaN(newDistance) || newDistance < 0 || newDistance > 10) {
        alert(translations_data[currentLanguage][8]);
        return false;  // Prevent the form from being submitted
    }

    // Make an AJAX request to change the distance on the server
    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {})
    .catch(error => {});
}
// Change city
function changeCity() {
            var newCity = document.getElementById('new_city').value;

            fetch('/change_city', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'new_city=' + encodeURIComponent(newCity),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload the map
                    map.setView([data.latitude, data.longitude], 15);

                    // Update the placeholder with the new city
                    document.getElementById('new_city').placeholder = newCity;

                    // Optionally clear the input field if needed
                    document.getElementById('new_city').value = '';

                    var selectedPoint = {
                        latitude: data.latitude,
                        longitude: data.longitude
                    };
                    // Send the selected point to the server
                    sendSelectedPointToServer(selectedPoint);
                } else {
                    alert(translations_data[currentLanguage][9]);
                }
            })
            .catch(error => console.error('Error changing the city:', error));
        }

var selectionEnabled = false;

function enableSelection() {
    selectionEnabled = true;
    map.on('click', onMapClick);
    document.getElementById('map').style.cursor = 'default';
}
function onMapClick(e) {
    if (selectionEnabled) {
        selectionEnabled = false;
        map.off('click', onMapClick);
        var selectedPoint = {
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
        };

        // Send the selected point to the server
        sendSelectedPointToServer(selectedPoint);
    }
}
function sendSelectedPointToServer(selectedPoint) {
    // Restore the cursor to the default style
    document.getElementById('map').style.cursor = 'grab';
    // Make a request to the server to handle the selected point
    fetch('/handle_selected_point', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectedPoint: selectedPoint })
    })
    .then(response => response.json())
    .then(data => {
        // Update the map with the new route
        addStartMarker(selectedPoint.latitude, selectedPoint.longitude);
    })
    .catch(error => console.error('Error sending the selected point to the server:', error));
}

var startMarker;
function addStartMarker(latitude, longitude) {
    // Create the marker with the default icon and add it to the map
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    startMarker = L.marker([latitude, longitude]).addTo(map);
}
// Variables to store references to the polylines
var firstPolyline = null;
var secondPolyline = null;
// Function to generate routes
function generateRoute() {
    // Remove previous polylines if they exist
    if (firstPolyline) {
        map.removeLayer(firstPolyline);
    }
    if (secondPolyline) {
        map.removeLayer(secondPolyline);
    }

    // Make a request to the server to get the new routes
    fetch('/generate_route')
        .then(response => response.json())
        .then(data => {
            // Update the map with the new routes
            var firstRoute = data.first_route;
            var secondRoute = data.second_route;
            var firstRouteLength = data.first_route_length;
            var secondRouteLength = data.second_route_length;

            // Draw polylines for the new routes
            firstPolyline = L.polyline(firstRoute, { color: 'blue', weight: 5, opacity: 1 }).addTo(map);
            secondPolyline = L.polyline(secondRoute, { color: 'red', weight: 5, opacity: 0.5 }).addTo(map);

            // Combine the bounds of both polylines
            var bounds = firstPolyline.getBounds().extend(secondPolyline.getBounds());

            // Adjust the map to the combined bounds
            map.fitBounds(bounds);

            document.getElementById('first_route_length').innerText = firstRouteLength.toFixed(2);
            document.getElementById('second_route_length').innerText = secondRouteLength.toFixed(2);
            document.getElementById('total_length').innerText = (firstRouteLength + secondRouteLength).toFixed(2);

        })
        .catch(error => console.error('Error generating routes:', error));
}

document.addEventListener("DOMContentLoaded", function() {
    var inputElement = document.getElementById('new_city');
    var placeholderText = translations_data[currentLanguage][10]; // Default to the translation for 'City:'
    inputElement.placeholder = placeholderText;

    // Make a request to the server to execute the initialization function
    fetch('/initialize_distance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {})
    .catch(error => {
        console.error('Error initializing distance on the server:', error);
    });
    addStartMarker(latitude, longitude);
});