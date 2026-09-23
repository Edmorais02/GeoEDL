// =======================================================
// GeoEDL Uberlândia
// BUSCA
// Versão 4.0
// =======================================================

console.log("Busca v4.0 carregada");


// =======================================================
// COMPONENTES
// =======================================================

const txtBuscaEDL =
    document.getElementById("txtBuscaEDL");

const btnBuscarEDL =
    document.getElementById("btnBuscarEDL");


// =======================================================
// ESTADO DA PESQUISA
// =======================================================

let resultadosPesquisa = [];

let indiceResultado = 0;

let ultimaPesquisa = "";

let ultimoTipoPesquisa = "";


// =======================================================
// EVENTOS
// =======================================================

btnBuscarEDL.addEventListener(
    "click",
    pesquisar
);

txtBuscaEDL.addEventListener(
    "keydown",
    function(e) {

        if (e.key === "Enter") {
            pesquisar();
        }

    }
);

txtBuscaEDL.addEventListener(
    "input",
    function() {
        limparPesquisa();
    }
);


// =======================================================
// OBTÉM O TIPO DE PESQUISA
// =======================================================

function obterTipoBusca() {

    const radio =
        document.querySelector(
            'input[name="tipoBusca"]:checked'
        );

    if (!radio) {
        return "edl";
    }

    return radio.value;

}


// =======================================================
// NORMALIZA CÓDIGO
// =======================================================

function normalizarCodigo(valor) {

    valor =
        valor
            .toString()
            .trim()
            .toUpperCase();

    if (valor === "") {
        return "";
    }

    // Código numérico de EDL
    // Exemplo: 486 → EL486

    if (/^\d+$/.test(valor)) {
        return "EL" + valor;
    }

    return valor;

}


// =======================================================
// NORMALIZA TEXTO
// =======================================================

function normalizarTexto(texto) {

    return (texto || "")
        .toString()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .trim()
        .toUpperCase();

}


// =======================================================
// OBTÉM PROPRIEDADE
// =======================================================

function obterPropriedade(
    props,
    nomes
) {

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
// LIMPA PESQUISA
// =======================================================

function limparPesquisa() {

    resultadosPesquisa = [];

    indiceResultado = 0;

    ultimaPesquisa = "";

    ultimoTipoPesquisa = "";

    btnBuscarEDL.textContent =
        "Localizar";

    const contador =
        document.getElementById(
            "contadorResultados"
        );

    if (contador) {
        contador.style.display = "none";
    }

}


// =======================================================
// PESQUISAR
// =======================================================

function pesquisar() {

    const tipo =
        obterTipoBusca();

    let valor =
        txtBuscaEDL.value.trim();

    if (valor === "") {

        alert(
            "Digite uma pesquisa."
        );

        txtBuscaEDL.focus();

        return;

    }


    const valorOriginal =
        valor;


    // ---------------------------------------------------
    // EVITA NOVA PESQUISA
    // E AVANÇA PARA O PRÓXIMO RESULTADO
    // ---------------------------------------------------

    if (
        valor === ultimaPesquisa &&
        tipo === ultimoTipoPesquisa &&
        resultadosPesquisa.length > 0
    ) {

        proximoResultado();

        return;

    }


    resultadosPesquisa = [];

    indiceResultado = 0;


    // ---------------------------------------------------
    // EDL
    // ---------------------------------------------------

    if (tipo === "edl") {

        pesquisarEDLs(
            normalizarCodigo(valor)
        );

    }


    // ---------------------------------------------------
    // OVITRAMPA
    // ---------------------------------------------------

    if (tipo === "ovitrampa") {

        pesquisarOvitrampas(
            valor
        );

    }


    // ---------------------------------------------------
    // ENDEREÇO
    // ---------------------------------------------------

    if (tipo === "endereco") {

        pesquisarPorEndereco(
            valor
        );

    }


    // ---------------------------------------------------
    // QT
    // ---------------------------------------------------

    if (tipo === "qt") {

        pesquisarPorQT(
            valor
        );

    }


    ultimaPesquisa =
        valor;

    ultimoTipoPesquisa =
        tipo;


    if (
        resultadosPesquisa.length === 0
    ) {

        alert(
            "Nenhum resultado encontrado para: " +
            valorOriginal
        );

        limparPesquisa();

        return;

    }


    if (
        resultadosPesquisa.length > 1
    ) {

        btnBuscarEDL.textContent =
            "Próximo ▶";

    }


    mostrarResultado();

}


// =======================================================
// PESQUISA DE EDL
// =======================================================

function pesquisarEDLs(
    codigoPesquisado
) {

    if (!camadaEDLs) {

        alert(
            "A camada de EDLs ainda não foi carregada."
        );

        return;

    }


    camadaEDLs.eachLayer(
        function(layer) {

            const props =
                layer.feature &&
                layer.feature.properties
                    ? layer.feature.properties
                    : {};


            const codigo =
                normalizarTexto(
                    obterPropriedade(
                        props,
                        [
                            "codigo",
                            "Cód.",
                            "Cod",
                            "Codigo"
                        ]
                    )
                );


            if (
                codigo ===
                normalizarTexto(
                    codigoPesquisado
                )
            ) {

                resultadosPesquisa.push({
                    tipo: "edl",
                    layer: layer
                });

            }

        }
    );

}


// =======================================================
// PESQUISA DE OVITRAMPAS
// =======================================================

function pesquisarOvitrampas(
    codigoPesquisado
) {

    if (!camadaOvitrampas) {

        alert(
            "A camada de Ovitrampas ainda não foi carregada."
        );

        return;

    }


    const codigoBusca =
        normalizarTexto(
            codigoPesquisado
        );


    camadaOvitrampas.eachLayer(
        function(layer) {

            const props =
                layer.feature &&
                layer.feature.properties
                    ? layer.feature.properties
                    : {};


            const codigo =
                normalizarTexto(
                    obterPropriedade(
                        props,
                        [
                            "codigo",
                            "Cód.",
                            "Cod",
                            "Codigo"
                        ]
                    )
                );


            if (
                codigo === codigoBusca
            ) {

                resultadosPesquisa.push({
                    tipo: "ovitrampa",
                    layer: layer
                });

            }

        }
    );

}


// =======================================================
// PESQUISA POR ENDEREÇO
// EDLs + OVITRAMPAS
// =======================================================

function pesquisarPorEndereco(
    enderecoPesquisado
) {

    const enderecoBusca =
        normalizarTexto(
            enderecoPesquisado
        );


    // ---------------------------------------------------
    // EDLs
    // ---------------------------------------------------

    if (camadaEDLs) {

        camadaEDLs.eachLayer(
            function(layer) {

                const props =
                    layer.feature &&
                    layer.feature.properties
                        ? layer.feature.properties
                        : {};


                const endereco =
                    normalizarTexto(
                        obterPropriedade(
                            props,
                            [
                                "endereco",
                                "Endereço",
                                "Endereço completo"
                            ]
                        )
                    );


                if (
                    endereco.includes(
                        enderecoBusca
                    )
                ) {

                    resultadosPesquisa.push({
                        tipo: "edl",
                        layer: layer
                    });

                }

            }
        );

    }


    // ---------------------------------------------------
    // OVITRAMPAS
    // ---------------------------------------------------

    if (camadaOvitrampas) {

        camadaOvitrampas.eachLayer(
            function(layer) {

                const props =
                    layer.feature &&
                    layer.feature.properties
                        ? layer.feature.properties
                        : {};


                const endereco =
                    normalizarTexto(
                        obterPropriedade(
                            props,
                            [
                                "endereco",
                                "Endereço",
                                "Endereço completo"
                            ]
                        )
                    );


                if (
                    endereco.includes(
                        enderecoBusca
                    )
                ) {

                    resultadosPesquisa.push({
                        tipo: "ovitrampa",
                        layer: layer
                    });

                }

            }
        );

    }

}


// =======================================================
// PESQUISA POR QT
// EDLs + OVITRAMPAS
// =======================================================

function pesquisarPorQT(
    qtPesquisado
) {

    const qtBusca =
        normalizarTexto(
            qtPesquisado
        );


    // ---------------------------------------------------
    // EDLs
    // ---------------------------------------------------

    if (camadaEDLs) {

        camadaEDLs.eachLayer(
            function(layer) {

                const props =
                    layer.feature &&
                    layer.feature.properties
                        ? layer.feature.properties
                        : {};


                const qt =
                    normalizarTexto(
                        obterPropriedade(
                            props,
                            [
                                "qtld",
                                "QTLD",
                                "QT"
                            ]
                        )
                    );


                if (
                    qt.startsWith(
                        qtBusca
                    )
                ) {

                    resultadosPesquisa.push({
                        tipo: "edl",
                        layer: layer
                    });

                }

            }
        );

    }


    // ---------------------------------------------------
    // OVITRAMPAS
    // ---------------------------------------------------

    if (camadaOvitrampas) {

        camadaOvitrampas.eachLayer(
            function(layer) {

                const props =
                    layer.feature &&
                    layer.feature.properties
                        ? layer.feature.properties
                        : {};


                const qt =
                    normalizarTexto(
                        obterPropriedade(
                            props,
                            [
                                "qtld",
                                "QTLD",
                                "QT"
                            ]
                        )
                    );


                if (
                    qt.startsWith(
                        qtBusca
                    )
                ) {

                    resultadosPesquisa.push({
                        tipo: "ovitrampa",
                        layer: layer
                    });

                }

            }
        );

    }

}


// =======================================================
// PRÓXIMO RESULTADO
// =======================================================

function proximoResultado() {

    indiceResultado++;

    if (
        indiceResultado >=
        resultadosPesquisa.length
    ) {

        indiceResultado = 0;

    }

    mostrarResultado();

}


// =======================================================
// MOSTRAR RESULTADO
// =======================================================

function mostrarResultado() {

    const resultado =
        resultadosPesquisa[
            indiceResultado
        ];

    if (!resultado) {
        return;
    }


    if (
        resultado.tipo === "edl"
    ) {

        destacarEDL(
            resultado.layer
        );

    }


    if (
        resultado.tipo === "ovitrampa"
    ) {

        destacarOvitrampa(
            resultado.layer
        );

    }


    atualizarContador();

}


// =======================================================
// ATUALIZA PAINEL
// =======================================================

function atualizarPainelResultado(
    layer,
    tipo
) {

    const props =
        layer.feature &&
        layer.feature.properties
            ? layer.feature.properties
            : {};


    const latlng =
        layer.getLatLng();


    const codigo =
        obterPropriedade(
            props,
            [
                "codigo",
                "Cód.",
                "Cod",
                "Codigo"
            ]
        );


    const qt =
        obterPropriedade(
            props,
            [
                "qtld",
                "QTLD",
                "QT"
            ]
        );


    const endereco =
        obterPropriedade(
            props,
            [
                "endereco",
                "Endereço",
                "Endereço completo"
            ]
        );


    const elementoCodigo =
        document.getElementById(
            "infoCodigo"
        );

    const elementoQT =
        document.getElementById(
            "infoQT"
        );

    const elementoImovel =
        document.getElementById(
            "infoImovel"
        );

    const elementoEndereco =
        document.getElementById(
            "infoEndereco"
        );

    const elementoLatitude =
        document.getElementById(
            "infoLatitude"
        );

    const elementoLongitude =
        document.getElementById(
            "infoLongitude"
        );


    if (elementoCodigo) {

        elementoCodigo.textContent =
            codigo;

    }


    if (elementoQT) {

        elementoQT.textContent =
            qt;

    }


    if (elementoImovel) {

        if (tipo === "edl") {

            elementoImovel.textContent =
                obterPropriedade(
                    props,
                    [
                        "imovel",
                        "Imóvel"
                    ]
                );

        } else {

            elementoImovel.textContent =
                "";

        }

    }


    if (elementoEndereco) {

        elementoEndereco.textContent =
            endereco;

    }


    if (elementoLatitude) {

        elementoLatitude.textContent =
            latlng.lat.toFixed(6);

    }


    if (elementoLongitude) {

        elementoLongitude.textContent =
            latlng.lng.toFixed(6);

    }

}


// =======================================================
// DESTACA EDL
// =======================================================

function destacarEDL(layer) {

    map.flyTo(
        layer.getLatLng(),
        18,
        {
            animate: true,
            duration: 1.5
        }
    );


    atualizarPainelResultado(
        layer,
        "edl"
    );


    layer.openPopup();


    const estiloOriginal = {

        radius: 6,

        color: "#e67e22",

        weight: 2,

        fillColor: "#f1c40f",

        fillOpacity: 1

    };


    layer.setStyle({

        radius: 12,

        color: "#ff8c00",

        weight: 4,

        fillColor: "#ffff00",

        fillOpacity: 1

    });


    setTimeout(
        function() {

            layer.setStyle(
                estiloOriginal
            );

        },
        2500
    );

}


// =======================================================
// DESTACA OVITRAMPA
// =======================================================

function destacarOvitrampa(
    layer
) {

    map.flyTo(
        layer.getLatLng(),
        18,
        {
            animate: true,
            duration: 1.5
        }
    );


    atualizarPainelResultado(
        layer,
        "ovitrampa"
    );


    layer.openPopup();


    const estiloOriginal = {

        radius: 6,

        color: "#5b2c83",

        weight: 2,

        fillColor: "#7e57c2",

        fillOpacity: 1

    };


    layer.setStyle({

        radius: 12,

        color: "#3949ab",

        weight: 4,

        fillColor: "#b39ddb",

        fillOpacity: 1

    });


    setTimeout(
        function() {

            layer.setStyle(
                estiloOriginal
            );

        },
        2500
    );

}


// =======================================================
// CONTADOR DE RESULTADOS
// =======================================================

function atualizarContador() {

    const contador =
        document.getElementById(
            "contadorResultados"
        );


    if (!contador) {
        return;
    }


    if (
        resultadosPesquisa.length <= 1
    ) {

        contador.style.display =
            "none";

        return;

    }


    contador.style.display =
        "block";


    contador.textContent =
        "Resultado " +
        (indiceResultado + 1) +
        " de " +
        resultadosPesquisa.length;

}
