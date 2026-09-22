// =======================================================
// GeoEDL Uberlândia
// MAPA
// =======================================================

const map = L.map("map", { zoomControl: true })
    .setView([-18.9186, -48.2772], 12);

let camadaLimite = null;
let camadaBairros = null;
let camadaAreas = null;
let camadaEDLs = null;
let camadaOvitrampas = null;


// =======================================================
// MAPA BASE
// =======================================================

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);


// =======================================================
// CONTROLE DE CAMADAS
// =======================================================

function alternarCamada(camada, visivel) {

    if (!camada) return;

    if (visivel) {
        map.addLayer(camada);
    } else {
        map.removeLayer(camada);
    }

}


// =======================================================
// OBTÉM PROPRIEDADE
// =======================================================

function valorPropriedade(props, nomes) {

    for (const nome of nomes) {

        if (
            props &&
            props[nome] !== undefined &&
            props[nome] !== null &&
            props[nome] !== ""
        ) {
            return props[nome];
        }

    }

    return "";

}


// =======================================================
// ESCAPA HTML
// =======================================================

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// =======================================================
// POPUP EDL
// =======================================================

function popupEDL(feature) {

    const props = feature.properties || {};

    const codigo = valorPropriedade(
        props,
        ["codigo", "Cód.", "Cod", "Codigo"]
    );

    const endereco = valorPropriedade(
        props,
        ["endereco", "Endereço", "Endereço completo"]
    );

    const qt = valorPropriedade(
        props,
        ["qtld", "QTLD", "QT"]
    );

    const imovel = valorPropriedade(
        props,
        ["imovel", "Imóvel"]
    );

    return `
        <div style="min-width:230px">

            <h3 style="margin:0;color:#0b5394">
                ${escaparHTML(codigo)}
            </h3>

            <hr>

            <b>QTLD:</b>
            ${escaparHTML(qt)}
            <br>

            <b>Imóvel:</b>
            ${escaparHTML(imovel)}
            <br><br>

            <b>Endereço:</b>
            <br>
            ${escaparHTML(endereco)}

        </div>
    `;

}


// =======================================================
// CAMADA EDLs
// =======================================================

function criarCamadaEDLs(data) {

    if (camadaEDLs) {
        map.removeLayer(camadaEDLs);
    }

    camadaEDLs = L.geoJSON(data, {

        pointToLayer: (_, latlng) => {

            return L.circleMarker(latlng, {

                radius: 6,
                color: "#e67e22",
                weight: 2,
                fillColor: "#f1c40f",
                fillOpacity: 1

            });

        },

        onEachFeature: (feature, layer) => {

            layer.on({

                mouseover: e => {

                    e.target.setStyle({
                        radius: 9,
                        color: "#ff8c00",
                        weight: 3
                    });

                },

                mouseout: e => {

                    e.target.setStyle({
                        radius: 6,
                        color: "#e67e22",
                        weight: 2
                    });

                },

                click: e => destacarEDL(e.target)

            });

            layer.bindPopup(
                popupEDL(feature)
            );

        }

    }).addTo(map);

    console.log(
        `EDLs carregadas: ${
            data.features ? data.features.length : 0
        }`
    );

}


// =======================================================
// POPUP OVITRAMPA
// =======================================================

function popupOvitrampa(feature) {

    const props = feature.properties || {};

    const codigo = valorPropriedade(
        props,
        ["codigo", "Cód.", "Cod", "Codigo"]
    );

    const endereco = valorPropriedade(
        props,
        ["endereco", "Endereço", "Endereço completo"]
    );

    const qtld = valorPropriedade(
        props,
        ["qtld", "QTLD", "QT"]
    );

    return `
        <div style="min-width:230px">

            <h3 style="margin:0;color:#38761d">
                Ovitrampa ${escaparHTML(codigo)}
            </h3>

            <hr>

            <b>QTLD:</b>
            ${escaparHTML(qtld)}
            <br><br>

            <b>Endereço:</b>
            <br>
            ${escaparHTML(endereco)}

        </div>
    `;

}


// =======================================================
// CAMADA OVITRAMPAS
// =======================================================

function criarCamadaOvitrampas(data) {

    if (camadaOvitrampas) {
        map.removeLayer(camadaOvitrampas);
    }

    camadaOvitrampas = L.geoJSON(data, {

        pointToLayer: (_, latlng) => {

            return L.circleMarker(latlng, {

                radius: 6,
                color: "#5b2c83",
                weight: 2,
                fillColor: "#7e57c2",
                fillOpacity: 1

            });

        },

        onEachFeature: (feature, layer) => {

            layer.on({

                mouseover: e => {

                    e.target.setStyle({
                        radius: 9,
                        color: "#3949ab",
                        weight: 3
                    });

                },

                mouseout: e => {

                    e.target.setStyle({
                        radius: 6,
                        color: "#5b2c83",
                        weight: 2
                    });

                }

            });

            layer.bindPopup(
                popupOvitrampa(feature)
            );

        }

    }).addTo(map);

    console.log(
        `Ovitrampas carregadas: ${
            data.features ? data.features.length : 0
        }`
    );

}


// =======================================================
// CARREGAMENTO DE GEOJSON
// =======================================================

function carregarGeoJSON(url, opcoes, adicionar = true) {

    return fetch(url)

        .then(resposta => {

            if (!resposta.ok) {

                throw new Error(
                    `Falha ao carregar ${url}: ${resposta.status}`
                );

            }

            return resposta.json();

        })

        .then(data => {

            const camada = L.geoJSON(
                data,
                opcoes
            );

            if (adicionar) {
                camada.addTo(map);
            }

            return camada;

        });

}


// =======================================================
// LIMITE DE UBERLÂNDIA
// =======================================================

carregarGeoJSON(
    "data/Uberlandia.geojson",
    {
        style: {
            color: "#ff0000",
            weight: 3,
            fillOpacity: 0
        }
    }
)

.then(camada => {

    camadaLimite = camada;

    console.log(
        "Limite carregado"
    );

})

.catch(console.error);


// =======================================================
// BAIRROS
// =======================================================

carregarGeoJSON(
    "data/Novos_bairros.geojson",
    {
        style: {
            color: "#1b8a2f",
            weight: 2,
            fillColor: "#3cb44b",
            fillOpacity: 0.35
        }
    }
)

.then(camada => {

    camadaBairros = camada;

    if (
        camada.getBounds().isValid()
    ) {

        map.fitBounds(
            camada.getBounds()
        );

    }

    console.log(
        "Bairros carregados"
    );

})

.catch(console.error);


// =======================================================
// ÁREAS IMPLANTADAS
// =======================================================

carregarGeoJSON(
    "data/Areas_implantadas.geojson",
    {
        style: {
            color: "#005eff",
            weight: 2,
            fillColor: "#4da3ff",
            fillOpacity: 0.35
        }
    }
)

.then(camada => {

    camadaAreas = camada;

    console.log(
        "Áreas implantadas carregadas"
    );

})

.catch(console.error);


// =======================================================
// EDLs
// =======================================================

fetch("EDLs.geojson")

    .then(resposta => {

        if (!resposta.ok) {

            throw new Error(
                `Falha ao carregar EDLs: ${resposta.status}`
            );

        }

        return resposta.json();

    })

    .then(criarCamadaEDLs)

    .catch(console.error);


// =======================================================
// OVITRAMPAS
// =======================================================

fetch("Ovitrampas.geojson")

    .then(resposta => {

        if (!resposta.ok) {

            throw new Error(
                `Falha ao carregar Ovitrampas: ${resposta.status}`
            );

        }

        return resposta.json();

    })

    .then(criarCamadaOvitrampas)

    .catch(console.error);


// =======================================================
// CONTROLES DAS CAMADAS
// =======================================================

[
    ["chkLimite", () => camadaLimite],
    ["chkBairros", () => camadaBairros],
    ["chkAreas", () => camadaAreas],
    ["chkEDLs", () => camadaEDLs],
    ["chkOvitrampas", () => camadaOvitrampas]

].forEach(([id, obterCamada]) => {

    const controle =
        document.getElementById(id);

    if (!controle) return;

    controle.addEventListener(
        "change",
        () => {

            alternarCamada(
                obterCamada(),
                controle.checked
            );

        }
    );

});


// =======================================================
// INICIALIZAÇÃO
// =======================================================

console.log(
    "Mapa GeoEDL iniciado"
);
