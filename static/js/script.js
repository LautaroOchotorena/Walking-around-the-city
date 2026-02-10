// ===== Translations =====
var translations_data = {
    'es': {
        appTitle: 'Caminando por la ciudad',
        generateRoute: '🗺️ Generar recorrido',
        distance: 'Distancia de ida (km)',
        city: 'Ciudad',
        change: 'Cambiar',
        blueRoute: 'Recorrido azul',
        redRoute: 'Recorrido rojo',
        total: 'Total',
        errorDistance: 'Error: La distancia debe estar entre 0 y 10.',
        errorCity: 'No se pudo cargar la ciudad, intente de nuevo.',
        placeholder: 'Ingrese una ciudad...',
        generating: 'Generando...',
        startSet: 'Punto de inicio establecido',
        routeGenerated: '¡Recorrido generado exitosamente!',
        cityChanged: '¡Ciudad actualizada!',
        mapHint: 'Toque el mapa para establecer el punto de inicio',
        howItWorks: 'Cómo funciona',
        step1: 'Elegí una ciudad o usá la predeterminada. Podés cambiarla en cualquier momento.',
        step2: 'Tocá en el mapa para establecer tu punto de partida.',
        step3: 'Configurá la distancia de ida que querés caminar (0–10 km).',
        step4: 'Presioná "Generar recorrido" para obtener un circuito. La ruta azul es la ida y la ruta roja es la vuelta.'
    },
    'en': {
        appTitle: 'Walking Around the City',
        generateRoute: '🗺️ Generate route',
        distance: 'One-way distance (km)',
        city: 'City',
        change: 'Change',
        blueRoute: 'Blue route',
        redRoute: 'Red route',
        total: 'Total',
        errorDistance: 'Error: The target distance must be between 0 and 10.',
        errorCity: 'Failed to load the city, please try again.',
        placeholder: 'Enter a city...',
        generating: 'Generating...',
        startSet: 'Starting point set',
        routeGenerated: 'Route generated successfully!',
        cityChanged: 'City updated!',
        mapHint: 'Tap on the map to set starting point',
        howItWorks: 'How it works',
        step1: 'Choose a city or use the default one. You can change it anytime.',
        step2: 'Tap on the map to set your starting point.',
        step3: 'Set the one-way distance you want to walk (0–10 km).',
        step4: 'Press "Generate route" to get a walking loop. The blue route goes out, and the red route brings you back.'
    }
};

var currentLanguage = 'en';

// ===== Toast Notification =====
function showToast(message, isError) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    // Force reflow
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(function() {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Language =====
function changeLanguage(lang) {
    currentLanguage = lang;
    // Update active flag
    document.querySelectorAll('.flag-icon').forEach(function(el) {
        el.classList.remove('active');
    });
    var activeFlag = document.getElementById('flag-' + lang);
    if (activeFlag) activeFlag.classList.add('active');
    updateTranslations();
}

function t(key) {
    return translations_data[currentLanguage][key] || key;
}

function updateTranslations() {
    document.getElementById('appTitle').innerText = t('appTitle');
    document.getElementById('btnGenerateRoute').innerText = t('generateRoute');
    document.getElementById('OneWayDistance').innerText = t('distance');
    document.getElementById('City').innerText = t('city');
    document.getElementById('Change').innerText = t('change');
    document.getElementById('Blue_route_length').innerText = t('blueRoute');
    document.getElementById('Red_route_length').innerText = t('redRoute');
    document.getElementById('Total_route_length').innerText = t('total');
    document.getElementById('new_city').placeholder = t('placeholder');
    document.getElementById('mapHintText').innerText = t('mapHint');
    document.getElementById('howItWorksTitle').innerText = t('howItWorks');
    document.getElementById('step1').innerText = t('step1');
    document.getElementById('step2').innerText = t('step2');
    document.getElementById('step3').innerText = t('step3');
    document.getElementById('step4').innerText = t('step4');
}

// ===== Info Modal =====
function toggleInfo() {
    document.getElementById('infoOverlay').classList.toggle('open');
}

function closeInfoFromOverlay(e) {
    if (e.target === e.currentTarget) toggleInfo();
}

// ===== Distance =====
function updateTargetDistance() {
    var form = document.getElementById('distanceForm');
    var formData = new FormData(form);
    var distanceInput = document.getElementById('target_distance');
    var newDistance = distanceInput.value;

    if (isNaN(newDistance) || newDistance < 0 || newDistance > 10) {
        showToast(t('errorDistance'), true);
        return false;
    }

    fetch(form.action, {
        method: 'POST',
        body: formData
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {})
    .catch(function(error) {});
}

// ===== Change City =====
function changeCity() {
    var newCity = document.getElementById('new_city').value;
    var changeBtn = document.getElementById('Change');

    changeBtn.classList.add('loading');
    changeBtn.disabled = true;

    fetch('/change_city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'new_city=' + encodeURIComponent(newCity)
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        changeBtn.classList.remove('loading');
        changeBtn.disabled = false;

        if (data.success) {
            map.setView([data.latitude, data.longitude], 15);
            document.getElementById('new_city').placeholder = newCity;
            document.getElementById('new_city').value = '';

            var selectedPoint = {
                latitude: data.latitude,
                longitude: data.longitude
            };
            sendSelectedPointToServer(selectedPoint);
            showToast(t('cityChanged'), false);
        } else {
            showToast(t('errorCity'), true);
        }
    })
    .catch(function(error) {
        changeBtn.classList.remove('loading');
        changeBtn.disabled = false;
        showToast(t('errorCity'), true);
        console.error('Error changing the city:', error);
    });
}

// ===== Map Selection (always active) =====
function onMapClick(e) {
    var selectedPoint = {
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
    };
    sendSelectedPointToServer(selectedPoint);
}

function sendSelectedPointToServer(selectedPoint) {
    // Hide hint on first point placement
    var hint = document.getElementById('mapHint');
    if (hint) hint.classList.add('hidden');

    fetch('/handle_selected_point', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedPoint: selectedPoint })
    })
    .then(function(response) { return response.json(); })
    .then(function(data) {
        addStartMarker(selectedPoint.latitude, selectedPoint.longitude);
        showToast(t('startSet'), false);
    })
    .catch(function(error) {
        console.error('Error sending the selected point to the server:', error);
    });
}

// ===== Marker =====
var startMarker;

function addStartMarker(latitude, longitude) {
    if (startMarker) {
        map.removeLayer(startMarker);
    }
    startMarker = L.marker([latitude, longitude]).addTo(map);
}

// ===== Route Generation =====
var firstPolyline = null;
var secondPolyline = null;

function generateRoute() {
    var btn = document.getElementById('btnGenerateRoute');
    btn.classList.add('loading');
    btn.disabled = true;

    // Remove previous polylines
    if (firstPolyline) map.removeLayer(firstPolyline);
    if (secondPolyline) map.removeLayer(secondPolyline);

    fetch('/generate_route')
        .then(function(response) { return response.json(); })
        .then(function(data) {
            btn.classList.remove('loading');
            btn.disabled = false;

            var firstRoute = data.first_route;
            var secondRoute = data.second_route;
            var firstRouteLength = data.first_route_length;
            var secondRouteLength = data.second_route_length;

            firstPolyline = L.polyline(firstRoute, {
                color: '#3b82f6', weight: 5, opacity: 0.9, lineJoin: 'round'
            }).addTo(map);

            secondPolyline = L.polyline(secondRoute, {
                color: '#ef4444', weight: 5, opacity: 0.7, lineJoin: 'round', dashArray: '10 6'
            }).addTo(map);

            var bounds = firstPolyline.getBounds().extend(secondPolyline.getBounds());
            map.fitBounds(bounds, { padding: [30, 30] });

            // Animate stats update
            animateValue('first_route_length', firstRouteLength);
            animateValue('second_route_length', secondRouteLength);
            animateValue('total_length', firstRouteLength + secondRouteLength);

            showToast(t('routeGenerated'), false);
        })
        .catch(function(error) {
            btn.classList.remove('loading');
            btn.disabled = false;
            console.error('Error generating routes:', error);
        });
}

// ===== Animate number values =====
function animateValue(elementId, targetValue) {
    var el = document.getElementById(elementId);
    var start = parseFloat(el.innerText) || 0;
    var duration = 600;
    var startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var current = start + (targetValue - start) * eased;
        el.innerText = current.toFixed(2);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', function() {
    updateTranslations();

    // Always listen for map clicks to set starting point
    map.on('click', onMapClick);

    fetch('/initialize_distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(function(response) {})
    .catch(function(error) {
        console.error('Error initializing distance on the server:', error);
    });

    addStartMarker(latitude, longitude);
});