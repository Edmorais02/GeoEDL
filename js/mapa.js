// =======================================================
// GeoEDL Uberlândia — Mapa
// =======================================================

const map = L.map("map", { zoomControl: true }).setView([-18.9186, -48.2772], 12);

let camadaLimite = null;
let camadaBairros = null;
let camadaAreas = null;
let camadaEDLs = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

function alternarCamada(camada, visivel) {
    if (!camada) return;
    if (visivel) map.addLayer(camada);
    else map.removeLayer(camada);
}

function valorPropriedade(props, nomes) {
    for (const nome of nomes) {
        if (props && props[nome] !== undefined && props[nome] !== null && props[nome] !== "") {
            return props[nome];
        }
    }
    return "";
}

function escaparHTML(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function popupEDL(feature) {
    const props = feature.properties || {};
    const codigo = valorPropriedade(props, ["codigo", "Cód.", "Cod", "Codigo"]);
    const endereco = valorPropriedade(props, ["endereco", "Endereço", "Endereço completo"]);
    const qt = valorPropriedade(props, ["qtld", "QTLD", "QT"]);
    const imovel = valorPropriedade(props, ["imovel", "Imóvel"]);

    return `<div style="min-width:230px">
        <h3 style="margin:0;color:#0b5394">${escaparHTML(codigo)}</h3>
        <hr>
        <b>QTLD:</b> ${escaparHTML(qt)}<br>
        <b>Imóvel:</b> ${escaparHTML(imovel)}<br><br>
        <b>Endereço:</b><br>${escaparHTML(endereco)}
    </div>`;
}

function criarCamadaEDLs(data) {
    if (camadaEDLs) map.removeLayer(camadaEDLs);

    camadaEDLs = L.geoJSON(data, {
        pointToLayer: (_, latlng) => L.circleMarker(latlng, {
            radius: 6, color: "#c58f00", weight: 2,
            fillColor: "#ffd000", fillOpacity: 1
        }),
        onEachFeature: (feature, layer) => {
            layer.on({
                mouseover: e => e.target.setStyle({ radius: 9, color: "#ff0000", weight: 3 }),
                mouseout: e => e.target.setStyle({ radius: 6, color: "#c58f00", weight: 2 }),
                click: e => destacarEDL(e.target)
            });
            layer.bindPopup(popupEDL(feature));
        }
    }).addTo(map);

    console.log(`EDLs carregadas: ${data.features ? data.features.length : 0}`);
}

function carregarGeoJSON(url, opcoes, adicionar = true) {
    return fetch(url)
        .then(resposta => {
            if (!resposta.ok) throw new Error(`Falha ao carregar ${url}: ${resposta.status}`);
            return resposta.json();
        })
        .then(data => {
            const camada = L.geoJSON(data, opcoes);
            if (adicionar) camada.addTo(map);
            return camada;
        });
}

carregarGeoJSON("data/Uberlandia.geojson", {
    style: { color: "#ff0000", weight: 3, fillOpacity: 0 }
}).then(camada => { camadaLimite = camada; console.log("Limite carregado"); })
  .catch(console.error);

carregarGeoJSON("data/Novos_bairros.geojson", {
    style: { color: "#1b8a2f", weight: 2, fillColor: "#3cb44b", fillOpacity: 0.35 }
}).then(camada => {
    camadaBairros = camada;
    if (camada.getBounds().isValid()) map.fitBounds(camada.getBounds());
    console.log("Bairros carregados");
}).catch(console.error);

carregarGeoJSON("data/Areas_implantadas.geojson", {
    style: { color: "#005eff", weight: 2, fillColor: "#4da3ff", fillOpacity: 0.35 }
}).then(camada => { camadaAreas = camada; console.log("Áreas implantadas carregadas"); })
  .catch(console.error);

fetch("EDLs.geojson")
    .then(resposta => {
        if (!resposta.ok) throw new Error(`Falha ao carregar EDLs: ${resposta.status}`);
        return resposta.json();
    })
    .then(criarCamadaEDLs)
    .catch(console.error);

[
    ["chkLimite", () => camadaLimite],
    ["chkBairros", () => camadaBairros],
    ["chkAreas", () => camadaAreas],
    ["chkEDLs", () => camadaEDLs]
].forEach(([id, obterCamada]) => {
    const controle = document.getElementById(id);
    if (!controle) return;
    controle.addEventListener("change", () => alternarCamada(obterCamada(), controle.checked));
});

console.log("Mapa GeoEDL iniciado");
