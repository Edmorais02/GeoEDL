
/* ======================================================
   GeoEDL — Exportação
   PDF para impressão e GeoJSON para QGIS
====================================================== */

(function () {
    "use strict";

    const btnExportar = document.getElementById("btnImprimir");
    const painel = document.getElementById("painelExportacao");
    const btnFechar = document.getElementById("btnFecharExportacao");
    const btnPDF = document.getElementById("btnExportarPDF");
    const btnGeoJSON = document.getElementById("btnExportarGeoJSON");
    const chkTodas = document.getElementById("expTodas");

    if (!btnExportar || !painel) {
        console.error("Painel de exportação não encontrado.");
        return;
    }

    const definicoes = {
        limite: {
            nome: "Limite_Municipal",
            obter: () => camadaLimite
        },
        bairros: {
            nome: "Novos_Bairros_Wolbachia",
            obter: () => camadaBairros
        },
        areas: {
            nome: "Bairros_com_Wolbachia",
            obter: () => camadaAreas
        },
        edls: {
            nome: "EDLs",
            obter: () => camadaEDLs
        },
        ovitrampas: {
            nome: "Ovitrampas",
            obter: () => camadaOvitrampas
        }
    };

    function abrirPainelExportacao() {
        if (typeof fecharTodos === "function") {
            fecharTodos();
        }

        painel.classList.remove("painel-fechado");
        painel.classList.add("painel-aberto");
    }

    function fecharPainelExportacao() {
        painel.classList.remove("painel-aberto");
        painel.classList.add("painel-fechado");
    }

    btnExportar.addEventListener("click", abrirPainelExportacao);

    btnFechar.addEventListener("click", fecharPainelExportacao);

    chkTodas.addEventListener("change", function () {
        document.querySelectorAll(".expCamada").forEach(function (item) {
            item.checked = chkTodas.checked;
        });
    });

    document.querySelectorAll(".expCamada").forEach(function (item) {
        item.addEventListener("change", function () {
            const todos = Array.from(
                document.querySelectorAll(".expCamada")
            );

            chkTodas.checked = todos.every(function (c) {
                return c.checked;
            });
        });
    });

    function obterCamadasSelecionadas() {
        const selecionadas = Array.from(
            document.querySelectorAll(".expCamada:checked")
        );

        return selecionadas.map(function (checkbox) {
            return {
                id: checkbox.value,
                definicao: definicoes[checkbox.value]
            };
        }).filter(function (item) {
            return Boolean(item.definicao);
        });
    }

    function converterCamadaParaGeoJSON(camada) {
        if (!camada) {
            return null;
        }

        const geojson = camada.toGeoJSON();

        if (!geojson || !Array.isArray(geojson.features)) {
            return null;
        }

        return geojson;
    }

    function baixarBlob(blob, nomeArquivo) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = nomeArquivo;

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(function () {
            URL.revokeObjectURL(url);
        }, 1500);
    }

    // ==================================================
    // EXPORTAÇÃO GEOJSON EM ZIP
    // ==================================================

    btnGeoJSON.addEventListener("click", async function () {
        const selecionadas = obterCamadasSelecionadas();

        if (selecionadas.length === 0) {
            alert("Selecione pelo menos uma camada.");
            return;
        }

        if (typeof JSZip === "undefined") {
            alert("A biblioteca de compactação não foi carregada.");
            return;
        }

        btnGeoJSON.disabled = true;
        btnGeoJSON.textContent = "Preparando arquivos...";

        try {
            const zip = new JSZip();
            const manifesto = [];
            let totalFeatures = 0;
            let camadasExportadas = 0;

            for (const item of selecionadas) {
                const camada = item.definicao.obter();

                if (!camada) {
                    manifesto.push(
                        item.definicao.nome +
                        ": camada ainda não carregada."
                    );
                    continue;
                }

                const geojson = converterCamadaParaGeoJSON(camada);

                if (!geojson) {
                    manifesto.push(
                        item.definicao.nome +
                        ": não foi possível converter."
                    );
                    continue;
                }

                const nome = item.definicao.nome + ".geojson";

                zip.file(
                    nome,
                    JSON.stringify(geojson, null, 2)
                );

                totalFeatures += geojson.features.length;
                camadasExportadas++;

                manifesto.push(
                    item.definicao.nome +
                    ": " + geojson.features.length + " feições."
                );
            }

            if (camadasExportadas === 0) {
                throw new Error(
                    "Nenhuma das camadas selecionadas está disponível."
                );
            }

            zip.file(
                "LEIA-ME.txt",
                [
                    "GeoEDL Uberlândia",
                    "Exportação de dados vetoriais para QGIS",
                    "",
                    "Sistema de coordenadas: EPSG:4326",
                    "Formato: GeoJSON",
                    "",
                    "Camadas incluídas:",
                    ...manifesto,
                    "",
                    "Total de feições exportadas: " + totalFeatures,
                    "",
                    "Nota: os arquivos contêm as feições e atributos",
                    "disponíveis nas camadas carregadas no mapa."
                ].join("\n")
            );

            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            baixarBlob(blob, "GeoEDL_Camadas_QGIS.zip");

            alert(
                "Exportação concluída.\n\n" +
                "Camadas: " + camadasExportadas + "\n" +
                "Feições: " + totalFeatures
            );

        } catch (erro) {
            console.error("Erro ao exportar GeoJSON:", erro);
            alert("Falha na exportação: " + erro.message);

        } finally {
            btnGeoJSON.disabled = false;
            btnGeoJSON.textContent = "Baixar camadas para QGIS (.zip)";
        }
    });

    // ==================================================
    // IMPRESSÃO DO MAPA / SALVAR COMO PDF
    // ==================================================

    btnPDF.addEventListener("click", function () {
        const selecionadas = obterCamadasSelecionadas();

        if (selecionadas.length === 0) {
            alert("Selecione pelo menos uma camada para o PDF.");
            return;
        }

        const camadasIndisponiveis = selecionadas.filter(function (item) {
            return !item.definicao.obter();
        });

        if (camadasIndisponiveis.length > 0) {
            alert(
                "Algumas camadas ainda não foram carregadas. " +
                "Aguarde o carregamento e tente novamente."
            );
            return;
        }

        const visibilidadeOriginal = {};

        Object.keys(definicoes).forEach(function (id) {
            const camada = definicoes[id].obter();

            if (camada) {
                visibilidadeOriginal[id] = map.hasLayer(camada);
            }
        });

        const selecionadasIds = selecionadas.map(function (item) {
            return item.id;
        });

        Object.keys(definicoes).forEach(function (id) {
            const camada = definicoes[id].obter();

            if (!camada) return;

            const deveMostrar = selecionadasIds.includes(id);

            if (deveMostrar) {
                map.addLayer(camada);
            } else {
                map.removeLayer(camada);
            }
        });

        const titulo = document.createElement("div");
        titulo.id = "cabecalhoImpressao";
        titulo.innerHTML =
            "<h2>GeoEDL Uberlândia</h2>" +
            "<p>Mapa de áreas e pontos selecionados</p>";

        document.body.appendChild(titulo);

        function restaurarMapa() {
            Object.keys(definicoes).forEach(function (id) {
                const camada = definicoes[id].obter();

                if (!camada) return;

                if (visibilidadeOriginal[id]) {
                    map.addLayer(camada);
                } else {
                    map.removeLayer(camada);
                }
            });

            titulo.remove();
            window.removeEventListener("afterprint", restaurarMapa);

            map.invalidateSize();
        }

        window.addEventListener("afterprint", restaurarMapa);

        map.invalidateSize();

        setTimeout(function () {
            window.print();
        }, 400);
    });

})();
