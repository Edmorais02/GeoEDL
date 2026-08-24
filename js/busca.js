// =======================================================
// GeoEDL Uberlândia
// BUSCA
// Versão 3.0
// =======================================================

console.log("Busca v3.0 carregada");

// =======================================================
// COMPONENTES
// =======================================================

const txtBuscaEDL = document.getElementById("txtBuscaEDL");
const btnBuscarEDL = document.getElementById("btnBuscarEDL");

// =======================================================
// ESTADO DA PESQUISA
// =======================================================

// Lista com todos os resultados encontrados
let resultadosPesquisa = [];

// Índice do resultado atualmente exibido
let indiceResultado = 0;

// Guarda a última pesquisa executada
let ultimaPesquisa = "";

// Guarda o último tipo de pesquisa
let ultimoTipoPesquisa = "";

// =======================================================
// EVENTOS
// =======================================================

btnBuscarEDL.addEventListener("click", pesquisar);

txtBuscaEDL.addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        pesquisar();

    }

});

// Sempre que alterar o texto,
// uma nova pesquisa será iniciada.

txtBuscaEDL.addEventListener("input", function(){

    limparPesquisa();

});

// =======================================================
// OBTÉM O TIPO DE PESQUISA
// =======================================================

function obterTipoBusca(){

    const radio = document.querySelector(
        'input[name="tipoBusca"]:checked'
    );

    if(!radio){

        return "codigo";

    }

    return radio.value;

}

// =======================================================
// NORMALIZA O CÓDIGO
// =======================================================

function normalizarCodigo(valor){

    valor = valor.trim().toUpperCase();

    if(valor === "") return "";

    // Ex.: EL184, EO015, ES201...

    if(/^[A-Z]{2}\d+$/.test(valor)){

        return valor;

    }

    // Ex.: 184

    if(/^\d+$/.test(valor)){

        return "EL" + valor;

    }

    return valor;

}

// ========================================
// NORMALIZA TEXTO
// Remove acentos e diferenças de maiúsculas
// ========================================

function normalizarTexto(texto){

    return (texto || "")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim()
        .toUpperCase();

}

// =======================================================
// LIMPA A PESQUISA
// =======================================================

function limparPesquisa(){

    resultadosPesquisa = [];

    indiceResultado = 0;

    ultimaPesquisa = "";

    ultimoTipoPesquisa = "";

    btnBuscarEDL.textContent = "Localizar";

    const contador =
    document.getElementById("contadorResultados");

if(contador){

    contador.style.display = "none";

}

}

// =======================================================
// PARTE 2
// =======================================================

// =======================================================
// PESQUISAR
// =======================================================

function pesquisar(){

    const tipo = obterTipoBusca();

    let valor = txtBuscaEDL.value.trim();

    if(valor === ""){

        alert("Digite uma pesquisa.");

        txtBuscaEDL.focus();

        return;

    }

    // Código sempre normalizado
    if(tipo === "codigo"){

        valor = normalizarCodigo(valor);

    }

    // Se clicou novamente na mesma pesquisa,
    // apenas avança para o próximo resultado.

    if(
        valor === ultimaPesquisa &&
        tipo === ultimoTipoPesquisa &&
        resultadosPesquisa.length > 0
    ){

        proximoResultado();

        return;

    }

    // Nova pesquisa

    resultadosPesquisa = [];

    indiceResultado = 0;

    camadaEDLs.eachLayer(function(layer){

        const props = layer.feature.properties;

        const codigo =
            (props["Cód."] ||
             props["Cod"] ||
             props["Codigo"] ||
             "")
             .toString()
             .trim()
             .toUpperCase();

        const endereco =
    normalizarTexto(props["Endereço completo"]);

        const qt =
    normalizarTexto(props["QT"]);

        let encontrou = false;

        // ==========================
        // CÓDIGO
        // ==========================

        if(
            tipo === "codigo" &&
            codigo === valor
        ){

            encontrou = true;

        }

        // ==========================
        // ENDEREÇO
        // ==========================

if(
    tipo === "endereco" &&
    endereco.includes(
        normalizarTexto(valor)
    )
){

            encontrou = true;

        }

        // ==========================
        // QT
        // ==========================

        if(
    tipo === "qt" &&
    qt === normalizarTexto(valor)
){
    
            encontrou = true;

        }

        if(encontrou){

            resultadosPesquisa.push(layer);

        }

    });

    ultimaPesquisa = valor;

    ultimoTipoPesquisa = tipo;

    if(resultadosPesquisa.length === 0){

        alert("Nenhuma EDL encontrada.");

        limparPesquisa();

        return;

    }

    if(resultadosPesquisa.length > 1){

        btnBuscarEDL.textContent =
            "Próximo ▶";

    }

    mostrarResultado();

}

// =======================================================
// PRÓXIMO RESULTADO
// =======================================================

function proximoResultado(){

    indiceResultado++;

    if(indiceResultado >= resultadosPesquisa.length){

        indiceResultado = 0;

    }

    mostrarResultado();

}

// =======================================================
// MOSTRAR RESULTADO
// =======================================================

function mostrarResultado(){

    destacarEDL(
    resultadosPesquisa[indiceResultado]
);

atualizarContador();

}

// =======================================================
// ATUALIZA O PAINEL
// =======================================================

function atualizarPainelEDL(layer){

    const props = layer.feature.properties;
    const latlng = layer.getLatLng();

    document.getElementById("infoCodigo").textContent =
        props["Cód."] || "";

    document.getElementById("infoQT").textContent =
        props["QT"] || "";

    document.getElementById("infoImovel").textContent =
        props["Imóvel"] || "";

    document.getElementById("infoEndereco").textContent =
        props["Endereço completo"] || "";

    document.getElementById("infoLatitude").textContent =
        latlng.lat.toFixed(6);

    document.getElementById("infoLongitude").textContent =
        latlng.lng.toFixed(6);

}

// =======================================================
// DESTACA A EDL
// =======================================================

function destacarEDL(layer){

    map.flyTo(layer.getLatLng(),18,{

        animate:true,

        duration:1.5

    });

    atualizarPainelEDL(layer);

    layer.openPopup();

    const estiloOriginal={

        radius:6,
        color:"#c58f00",
        weight:2,
        fillColor:"#ffd000",
        fillOpacity:1

    };

    layer.setStyle({

        radius:12,
        color:"#ff0000",
        weight:4,
        fillColor:"#ffff00",
        fillOpacity:1

    });

    setTimeout(function(){

        layer.setStyle(estiloOriginal);

    },2500);

}

// =======================================================
// CONTADOR DE RESULTADOS
// =======================================================

function atualizarContador(){

    const contador =
        document.getElementById("contadorResultados");

    if(!contador){

        return;

    }

    if(resultadosPesquisa.length <= 1){

        contador.style.display = "none";

        return;

    }

    contador.style.display = "block";

    contador.textContent =
        "Resultado " +
        (indiceResultado + 1) +
        " de " +
        resultadosPesquisa.length;

}