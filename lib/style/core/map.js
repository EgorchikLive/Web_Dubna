document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const map = L.map('map', {
        center: [55.7558, 37.6173],
        zoom: 4,
        attributionControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);

    L.control.attribution({
        position: 'bottomright',
        prefix: false
    }).addAttribution('© OpenStreetMap contributors').addTo(map);

    const regionsData = {
        'rus': [
            { lat: 55.7558, lng: 37.6173, title: 'Москва, Центральное', address: 'ул. Тверская, д. 1' },
            { lat: 59.9343, lng: 30.3351, title: 'Санкт-Петербург', address: 'Невский проспект, д. 10' },
            { lat: 56.8389, lng: 60.6057, title: 'Екатеринбург', address: 'ул. Ленина, д. 5' },
            { lat: 55.0084, lng: 82.9357, title: 'Новосибирск', address: 'Красный проспект, д. 15' },
            { lat: 43.1155, lng: 131.8855, title: 'Владивосток', address: 'ул. Светланская, д. 20' }
        ],
        'sng': [
            { lat: 53.9006, lng: 27.5590, title: 'Минск (Беларусь)', address: 'пр-т Независимости, д. 1' },
            { lat: 43.2220, lng: 76.8512, title: 'Алматы (Казахстан)', address: 'ул. Абая, д. 10' },
            { lat: 40.1872, lng: 44.5152, title: 'Ереван (Армения)', address: 'ул. Маштоца, д. 5' },
            { lat: 41.3111, lng: 69.2797, title: 'Ташкент (Узбекистан)', address: 'ул. Амира Темура, д. 15' }
        ],
        'europ': [
            { lat: 48.8566, lng: 2.3522, title: 'Париж (Франция)', address: 'Rue de Rivoli, 10' },
            { lat: 52.5200, lng: 13.4050, title: 'Берлин (Германия)', address: 'Unter den Linden, 5' },
            { lat: 51.5074, lng: -0.1278, title: 'Лондон (Великобритания)', address: 'Oxford Street, 20' },
            { lat: 41.9028, lng: 12.4964, title: 'Рим (Италия)', address: 'Via del Corso, 15' }
        ]
    };

    const layerGroups = {
        'rus': L.layerGroup(),
        'sng': L.layerGroup(),
        'europ': L.layerGroup()
    };

    Object.keys(regionsData).forEach(regionKey => {
        regionsData[regionKey].forEach(loc => {
            const marker = L.marker([loc.lat, loc.lng]);
            marker.bindPopup(`<b>${loc.title}</b><br>${loc.address}`);
            marker.addTo(layerGroups[regionKey]);
        });
    });

    const checkboxes = {
        'rus': document.getElementById('check_rus'),
        'sng': document.getElementById('check_sng'),
        'europ': document.getElementById('check_europe')
    };

    function updateMapLayers() {
        Object.keys(checkboxes).forEach(regionKey => {
            const checkbox = checkboxes[regionKey];
            const layerGroup = layerGroups[regionKey];

            if (checkbox.checked) {
                if (!map.hasLayer(layerGroup)) map.addLayer(layerGroup);
            } else {
                if (map.hasLayer(layerGroup)) map.removeLayer(layerGroup);
            }
        });
    }

    Object.values(checkboxes).forEach(checkbox => {
        if (checkbox) checkbox.addEventListener('change', updateMapLayers);
    });

    if (checkboxes['rus']) checkboxes['rus'].checked = true;
    updateMapLayers();

    setTimeout(() => map.invalidateSize(), 100);
});