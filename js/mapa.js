// =======================================================
// GeoEDL Uberlândia
// Versão 1.0
// =======================================================

// ---------------- MAPA ----------------

const map = L.map("map", {
    zoomControl: true
}).setView([-18.9186, -48.2772], 12);

// ---------------- CAMADAS ----------------

let camadaLimite;
let camadaBairros;
let camadaAreas;
let camadaEDLs;

let controleCamadasCriado = false;

// ---------------- MAPA BASE ----------------

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);

console.log("Mapa iniciado");

// =======================================================
// Cria o painel de camadas somente quando todas existirem
// =======================================================

function criarControleCamadas(){

    if(
        !camadaLimite ||
        !camadaBairros ||
        !camadaAreas ||
        !camadaEDLs
    ){
        return;
    }

    console.log("Todas as camadas carregadas.");

}

// =======================================================
// LIMITE MUNICIPAL
// =======================================================

fetch("data/Uberlandia.geojson")
.then(r => r.json())
.then(data => {

    camadaLimite = L.geoJSON(data,{
        style:{
            color:"#ff0000",
            weight:3,
            fillOpacity:0
        }
    }).addTo(map);

    console.log("Limite carregado");

    criarControleCamadas();

})
.catch(console.error);

// =======================================================
// BAIRROS
// =======================================================

fetch("data/Novos_bairros.geojson")
.then(r => r.json())
.then(data => {

    camadaBairros = L.geoJSON(data,{

        style:{
            color:"#1b8a2f",
            weight:2,
            fillColor:"#3cb44b",
            fillOpacity:0.35
        }

    }).addTo(map);

    map.fitBounds(camadaBairros.getBounds());

    console.log("Bairros carregados");

    criarControleCamadas();

})
.catch(console.error);

// =======================================================
// ÁREAS IMPLANTADAS
// =======================================================

fetch("data/Areas_implantadas.geojson")
.then(r => r.json())
.then(data => {

    camadaAreas = L.geoJSON(data,{

        style:{
            color:"#005eff",
            weight:2,
            fillColor:"#4da3ff",
            fillOpacity:0.35
        }

    }).addTo(map);

    console.log("Áreas implantadas carregadas");

    criarControleCamadas();

})
.catch(console.error);

// =======================================================
// CRIA A CAMADA DAS EDLs
// =======================================================

function criarCamadaEDLs(data){

    if(camadaEDLs){

        map.removeLayer(camadaEDLs);

    }

    camadaEDLs = L.geoJSON(data,{

        pointToLayer: function(feature, latlng){

            return L.circleMarker(latlng,{

                radius:6,
                color:"#c58f00",
                weight:2,
                fillColor:"#ffd000",
                fillOpacity:1

            });

        },

        onEachFeature: function(feature, layer){

            layer.on({

                mouseover:function(e){

                    e.target.setStyle({

                        radius:9,
                        color:"#ff0000",
                        weight:3

                    });

                },

                mouseout:function(e){

                    e.target.setStyle({

                        radius:6,
                        color:"#c58f00",
                        weight:2

                    });

                },

                click:function(e){

                    destacarEDL(e.target);

                }

            });

            const codigo = feature.properties["Cód."] || "";
            const qt = feature.properties["QT"] || "";
            const imovel = feature.properties["Imóvel"] || "";
            const endereco = feature.properties["Endereço completo"] || "";

            layer.bindPopup(`
                <div style="min-width:230px">
                    <h3 style="margin:0;color:#0b5394;">
                        ${codigo}
                    </h3>
                    <hr>
                    <b>QT:</b> ${qt}<br>
                    <b>Imóvel:</b> ${imovel}<br><br>
                    <b>Endereço:</b><br>
                    ${endereco}
                </div>
            `);

        }

    }).addTo(map);

    console.log("EDLs carregadas.");

}

// =======================================================
// EDLs
// =======================================================

fetch("data/EDLs.geojson")
.then(r => r.json())
.then(data => {

    camadaEDLs = L.geoJSON(data,{

        pointToLayer: function(feature, latlng){

            return L.circleMarker(latlng,{

                radius:6,
                color:"#c58f00",
                weight:2,
                fillColor:"#ffd000",
                fillOpacity:1

            });

        },

        onEachFeature: function(feature, layer){

            layer.on({

    mouseover:function(e){

        e.target.setStyle({

            radius:9,
            color:"#ff0000",
            weight:3

        });

    },

    mouseout:function(e){

        e.target.setStyle({

            radius:6,
            color:"#c58f00",
            weight:2

        });

    },

    click:function(e){

        destacarEDL(e.target);

    }

});

            const codigo = feature.properties["Cód."] || "";
            const qt = feature.properties["QT"] || "";
            const imovel = feature.properties["Imóvel"] || "";
            const endereco = feature.properties["Endereço completo"] || "";

            layer.bindPopup(`
                <div style="min-width:230px">
                    <h3 style="margin:0;color:#0b5394;">
                        ${codigo}
                    </h3>
                    <hr>
                    <b>QT:</b> ${qt}<br>
                    <b>Imóvel:</b> ${imovel}<br><br>
                    <b>Endereço:</b><br>
                    ${endereco}
                </div>
            `);

        }

    }).addTo(map);

    console.log("EDLs carregadas");

    criarControleCamadas();

})
.catch(console.error);

// ======================================
// CHECKBOX - LIMITE MUNICIPAL
// ======================================

document
.getElementById("chkLimite")
.addEventListener("change", function () {

    if (this.checked) {

        map.addLayer(camadaLimite);

    } else {

        map.removeLayer(camadaLimite);

    }

});

// ======================================
// CHECKBOXES DO PAINEL
// ======================================

document.getElementById("chkLimite").addEventListener("change", function(){

    if(this.checked){
        map.addLayer(camadaLimite);
    }else{
        map.removeLayer(camadaLimite);
    }

});

document.getElementById("chkBairros").addEventListener("change", function(){

    if(this.checked){
        map.addLayer(camadaBairros);
    }else{
        map.removeLayer(camadaBairros);
    }

});

document.getElementById("chkAreas").addEventListener("change", function(){

    if(this.checked){
        map.addLayer(camadaAreas);
    }else{
        map.removeLayer(camadaAreas);
    }

});

document.getElementById("chkEDLs").addEventListener("change", function(){

    if(this.checked){
        map.addLayer(camadaEDLs);
    }else{
        map.removeLayer(camadaEDLs);
    }

});