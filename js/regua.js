// =======================================================
// GeoEDL Uberlândia
// Ferramenta de Medição
// Versão 1.0
// =======================================================

// ---------------- ESTADO ----------------

let modoMedicao = false;

let pontosMedicao = [];

let marcadorInicio = null;
let marcadorFim = null;
let linhaMedicao = null;
let labelDistancia = null;

// ---------------- BOTÃO ----------------

const btnMedir = document.getElementById("btnMedir");

btnMedir.addEventListener("click", alternarRegua);

// =======================================================
// ATIVAR / DESATIVAR
// =======================================================

function alternarRegua(){

    modoMedicao = !modoMedicao;

    if(modoMedicao){

        btnMedir.classList.add("botao-ativo");

        map.getContainer().style.cursor = "crosshair";

        console.log("Modo medição ativado");

    }else{

        limparMedicao();

        btnMedir.classList.remove("botao-ativo");

        map.getContainer().style.cursor = "";

        console.log("Modo medição desativado");

    }

}

// =======================================================
// CLIQUES
// =======================================================

map.on("click", function(e){

    if(!modoMedicao) return;

    // Se já existiam dois pontos,
    // começa uma nova medição.

    if(pontosMedicao.length === 2){

        limparMedicao();

    }

    pontosMedicao.push(e.latlng);

    // ---------------- PRIMEIRO CLIQUE ----------------

    if(pontosMedicao.length === 1){

        marcadorInicio = L.circleMarker(e.latlng,{

            radius:7,
            color:"#0066ff",
            fillColor:"#0066ff",
            fillOpacity:1,
            weight:2

        }).addTo(map);

        return;

    }

    // ---------------- SEGUNDO CLIQUE ----------------

    marcadorFim = L.circleMarker(e.latlng,{

        radius:7,
        color:"#0066ff",
        fillColor:"#0066ff",
        fillOpacity:1,
        weight:2

    }).addTo(map);

    linhaMedicao = L.polyline(pontosMedicao,{

        color:"#0066ff",
        weight:3,
        dashArray:"8 6"

    }).addTo(map);

    // ---------------- DISTÂNCIA ----------------

    const distancia = map.distance(

        pontosMedicao[0],

        pontosMedicao[1]

    );

    let texto;

    if(distancia < 1000){

        texto = distancia.toFixed(0) + " m";

    }else{

        texto = (distancia/1000).toFixed(2) + " km";

    }

    // ---------------- CENTRO ----------------

    const centro = L.latLng(

        (pontosMedicao[0].lat + pontosMedicao[1].lat)/2,

        (pontosMedicao[0].lng + pontosMedicao[1].lng)/2

    );

    labelDistancia = L.marker(centro,{

        interactive:false,

        icon:L.divIcon({

            className:"",

            html:`
                <div class="distancia-box">
                    ${texto}
                </div>
            `

        })

    }).addTo(map);

});

// =======================================================
// LIMPAR
// =======================================================

function limparMedicao(){

    pontosMedicao = [];

    if(marcadorInicio){

        map.removeLayer(marcadorInicio);
        marcadorInicio = null;

    }

    if(marcadorFim){

        map.removeLayer(marcadorFim);
        marcadorFim = null;

    }

    if(linhaMedicao){

        map.removeLayer(linhaMedicao);
        linhaMedicao = null;

    }

    if(labelDistancia){

        map.removeLayer(labelDistancia);
        labelDistancia = null;

    }

}