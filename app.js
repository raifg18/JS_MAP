// Crear el mapa centrado en Rupa Rupa
var map = L.map('map').setView([-9.2952, -76.0008], 13);

// Añadir capa base de OpenStreetMap
var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
baseLayer.addTo(map);

// Crear un objeto para almacenar las capas y el control de capas
var capas = {};
var controlCapas = L.control.layers(null, capas, { collapsed: false }).addTo(map);

// Función para cargar y añadir una capa GeoJSON al mapa con controles de capas
function cargarGeoJSON(url, estilo, nombreCapa, clasificar = false, mostrarEtiquetas = false, añadirAlMapa = true) {
  fetch(url)
    .then(response => response.json())
    .then(data => {
      var capa = L.geoJSON(data, {
        style: function (feature) {
          if (clasificar && feature.properties.COBERTURA) {
            // Clasificación por COBERTURA con bordes delgados y colores suaves
            var tipoCobertura = feature.properties.COBERTURA;
            if (tipoCobertura === 'Bosque 2022') {
              return { color: 'green', weight: 0.5, opacity: 0.7, fillOpacity: 0.3 };
            } else if (tipoCobertura === 'No Bosque') {
              return { color: 'red', weight: 0.5, opacity: 0.7, fillOpacity: 0.3 };
            } else if (tipoCobertura.startsWith('Pérdida')) {
              return { color: 'orange', weight: 0.5, opacity: 0.7, fillOpacity: 0.3 };
            } else if (tipoCobertura === 'Hidrografía') {
              return { color: 'blue', weight: 0.5, opacity: 0.7, fillOpacity: 0.3 };
            }
          } else {
            return estilo;
          }
        },
        onEachFeature: function (feature, layer) {
          if (feature.properties) {
            layer.bindPopup(`<b>${nombreCapa}</b><br>${JSON.stringify(feature.properties)}`);
          }
          // Añadir etiquetas centradas si se solicita
          if (mostrarEtiquetas && feature.properties.DISTRITO) {
            var centroide = turf.centroid(feature); // Calcular el centroide real del polígono
            var coords = centroide.geometry.coordinates;
            L.marker([coords[1], coords[0]], {
              icon: L.divIcon({
                className: 'etiqueta-distrito',
                html: feature.properties.DISTRITO,
                iconSize: [0, 0]
              })
            }).addTo(map);
          }
        }
      });

      if (añadirAlMapa) {
        capa.addTo(map);
      }

      capas[nombreCapa] = capa; // Añadir la capa al objeto de capas
      controlCapas.addOverlay(capa, nombreCapa); // Añadir la capa al control de capas
    })
    .catch(error => console.error(`Error cargando ${url}:`, error));
}

// Estilos para las capas GeoJSON
var estiloBRUNAS = { color: 'green', weight: 2, opacity: 0.9, fillOpacity: 0 };
var estiloBRUNAS_Queb = { color: 'navy', weight: 1, opacity: 0.9 };
var estiloBRUNAS_vias = { color: 'gray', weight: 1, opacity: 0.9 };
var estiloLP_Distritos = { color: 'black', weight: 1, opacity: 0.9, fillOpacity: 0 };
var estiloPNTM = { color: 'brown', weight: 2, opacity: 0.9, fillOpacity: 0.3 };

// Cargar capas GeoJSON
cargarGeoJSON('BRUNAS.geojson', estiloBRUNAS, 'BRUNAS');
cargarGeoJSON('BRUNAS_Queb.geojson', estiloBRUNAS_Queb, 'Quebradas BRUNAS');
cargarGeoJSON('BRUNAS_vias.geojson', estiloBRUNAS_vias, 'Vías BRUNAS');
cargarGeoJSON('LP_Distritos.geojson', estiloLP_Distritos, 'Distritos', false, true);
cargarGeoJSON('PNTM.geojson', estiloPNTM, 'PNTM');
cargarGeoJSON('Bosque_nobosque.geojson', null, 'Bosque y No Bosque', true, false, false); // Desactivado por defecto