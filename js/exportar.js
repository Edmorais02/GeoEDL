
/* ======================================================
   GeoEDL — Exportação
   Painel, impressão PDF e exportação ZIP para QGIS
====================================================== */

(() => {
    "use strict";

    console.log("[GeoEDL Exportação] Inicializando módulo...");

    const $ = (id) => document.getElementById(id);

    const painel = $("painelExportacao");
    const btnPainel = $("btnImprimir");
    const btnFechar = $("btnFecharExportacao");
    const btnPDF = $("btnExportarPDF");
    const btnZIP = $("btnExportarGeoJSON");
    const chkTodas = $("expTodas");

    const checkboxes = () =>
        Array.from(document.querySelectorAll(".expCamada"));

    // Verificação dos elementos necessários
    if (!painel || !btnPainel || !btnFechar || !btnPDF || !btnZIP || !chkTodas) {
        console.error(
            "[GeoEDL Exportação] Faltam elementos no HTML.",
            {
                painel: !!painel,
                btnPainel: !!btnPainel,
                btnFechar: !!btnFechar,
                btnPDF: !!btnPDF,
                btnZIP: !!btnZIP,
                chkTodas: !!chkTodas
            }
        );
        return;
    }

    // Posicionamento explícito do painel
    Object.assign(painel.style, {
        position: "absolute",
        top: "68px",
        left: "14px",
        width: "320px",
        maxWidth: "92vw",
        maxHeight: "calc(100vh - 90px)",
        overflowY: "auto",
        zIndex: "3000"
    });

    if (window.innerWidth <= 768) {
        painel.style.left = "4%";
        painel.style.width = "92%";
    }

    // Camadas disponíveis no mapa
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

    function abrirPainel() {
        painel.classList.remove("painel-fechado");
        painel.classList.add("painel-aberto");
        painel.style.display = "block";

        console.log("[GeoEDL Exportação] Painel aberto.");
    }

    function fecharPainel() {
        painel.classList.remove("painel-aberto");
        painel.classList.add("painel-fechado");

        console.log("[GeoEDL Exportação] Painel fechado.");
    }

    function alternarPainel() {
        if (painel.classList.contains("painel-aberto")) {
            fecharPainel();
        } else {
            abrirPainel();
        }
    }

    // Seleção de camadas
    function sincronizarSelecao() {
        const itens = checkboxes();

        chkTodas.checked =
            itens.length > 0 && itens.every((item) => item.checked);

        chkTodas.indeterminate =
            itens.some((item) => item.checked) && !chkTodas.checked;
    }

    chkTodas.addEventListener("change", () => {
        checkboxes().forEach((item) => {
            item.checked = chkTodas.checked;
        });

        chkTodas.indeterminate = false;
    });

    checkboxes().forEach((item) => {
        item.addEventListener("change", sincronizarSelecao);
    });

    function obterSelecionadas() {
        return checkboxes()
            .filter((item) => item.checked)
            .map((item) => ({
                id: item.value,
                definicao: definicoes[item.value]
            }))
            .filter((item) => item.definicao);
    }

    function obterCamada(item) {
        try {
            return item.definicao.obter();
        } catch (erro) {
            console.error(
                "[GeoEDL Exportação] Erro ao acessar a camada:",
                item.id,
                erro
            );
            return null;
        }
    }

    function baixarArquivo(blob, nome) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = nome;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 3000);
    }

    // ==================================================
    // EXPORTAR CAMADAS PARA QGIS
    // ==================================================

    btnZIP.addEventListener("click", async (evento) => {
        evento.preventDefault();

        console.log("[GeoEDL Exportação] Clique em baixar ZIP.");

        const selecionadas = obterSelecionadas();

        if (selecionadas.length === 0) {
            alert("Selecione pelo menos uma camada para exportar.");
            return;
        }

        if (typeof JSZip === "undefined") {
            alert(
                "A biblioteca JSZip não foi carregada. " +
                "Verifique sua conexão e recarregue a página."
            );
            console.error("[GeoEDL Exportação] JSZip indisponível.");
            return;
        }

        const estadoOriginal = btnZIP.textContent;
        btnZIP.disabled = true;
        btnZIP.textContent = "Preparando arquivos...";

        try {
            const zip = new JSZip();
            const relatorio = [];
            let totalFeicoes = 0;
            let totalCamadas = 0;

            for (const item of selecionadas) {
                console.log(
                    "[GeoEDL Exportação] Processando camada:",
                    item.id
                );

                const camada = obterCamada(item);

                if (!camada) {
                    relatorio.push(
                        item.definicao.nome + ": camada indisponível."
                    );
                    console.warn(
                        "[GeoEDL Exportação] Camada indisponível:",
                        item.id
                    );
                    continue;
                }

                if (typeof camada.toGeoJSON !== "function") {
                    relatorio.push(
                        item.definicao.nome + ": formato não suportado."
                    );
                    console.warn(
                        "[GeoEDL Exportação] toGeoJSON indisponível:",
                        item.id
                    );
                    continue;
                }

                const geojson = camada.toGeoJSON();

                if (!geojson || !Array.isArray(geojson.features)) {
                    relatorio.push(
                        item.definicao.nome + ": GeoJSON inválido."
                    );
                    console.warn(
                        "[GeoEDL Exportação] GeoJSON inválido:",
                        item.id
                    );
                    continue;
                }

                const nomeArquivo = item.definicao.nome + ".geojson";

                zip.file(
                    nomeArquivo,
                    JSON.stringify(geojson, null, 2)
                );

                totalFeicoes += geojson.features.length;
                totalCamadas++;

                relatorio.push(
                    item.definicao.nome +
                    ": " + geojson.features.length + " feições."
                );
            }

            if (totalCamadas === 0) {
                throw new Error(
                    "Nenhuma camada selecionada pôde ser exportada. " +
                    "Consulte o Console para ver os detalhes."
                );
            }

            zip.file(
                "LEIA-ME.txt",
                [
                    "GeoEDL — Uberlândia, MG",
                    "Arquivos vetoriais para utilização no QGIS",
                    "",
                    "Formato: GeoJSON",
                    "Sistema de coordenadas: EPSG:4326 (WGS 84)",
                    "",
                    "Camadas exportadas:",
                    ...relatorio,
                    "",
                    "Total de camadas: " + totalCamadas,
                    "Total de feições: " + totalFeicoes
                ].join("\r\n")
            );

            console.log(
                "[GeoEDL Exportação] Gerando ZIP...",
                { totalCamadas, totalFeicoes }
            );

            const blob = await zip.generateAsync({
                type: "blob",
                compression: "DEFLATE",
                compressionOptions: { level: 6 }
            });

            if (!blob || blob.size === 0) {
                throw new Error("O arquivo ZIP foi gerado vazio.");
            }

            baixarArquivo(blob, "GeoEDL_Camadas_QGIS.zip");

            console.log(
                "[GeoEDL Exportação] ZIP gerado.",
                { bytes: blob.size, totalCamadas, totalFeicoes }
            );

            alert(
                "Arquivo ZIP preparado!\n\n" +
                "Camadas exportadas: " + totalCamadas + "\n" +
                "Feições exportadas: " + totalFeicoes + "\n\n" +
                "Se o download não começar, verifique se o navegador " +
                "bloqueou o download."
            );

        } catch (erro) {
            console.error(
                "[GeoEDL Exportação] Falha no download ZIP:",
                erro
            );

            alert(
                "Não foi possível exportar as camadas.\n\n" +
                erro.message +
                "\n\nAbra o Console do navegador (F12) para detalhes."
            );

        } finally {
            btnZIP.disabled = false;
            btnZIP.textContent = estadoOriginal;
        }
    });

    // ==================================================
    // IMPRIMIR MAPA / SALVAR COMO PDF
    // ==================================================

    btnPDF.addEventListener("click", (evento) => {
        evento.preventDefault();

        if (typeof map === "undefined") {
            alert("O mapa ainda não está disponível.");
            return;
        }

        const selecionadas = obterSelecionadas();

        if (selecionadas.length === 0) {
            alert("Selecione pelo menos uma camada para o PDF.");
            return;
        }

        const camadas = Object.keys(definicoes).map((id) => ({
            id,
            camada: obterCamada({ id, definicao: definicoes[id] })
        }));

        const indisponiveis = selecionadas.filter(
            (item) => !obterCamada(item)
        );

        if (indisponiveis.length > 0) {
            alert(
                "Uma ou mais camadas selecionadas ainda não estão disponíveis."
            );
            return;
        }

        const visibilidadeOriginal = new Map();

        camadas.forEach(({ camada }) => {
            if (camada) {
                visibilidadeOriginal.set(camada, map.hasLayer(camada));
            }
        });

        const idsSelecionados = new Set(
            selecionadas.map((item) => item.id)
        );

        camadas.forEach(({ id, camada }) => {
            if (!camada) return;

            if (idsSelecionados.has(id)) {
                map.addLayer(camada);
            } else {
                map.removeLayer(camada);
            }
        });

        let titulo = $("cabecalhoImpressao");

        if (!titulo) {
            titulo = document.createElement("div");
            titulo.id = "cabecalhoImpressao";
            document.body.appendChild(titulo);
        }

        titulo.innerHTML =
            "<h2>GeoEDL Uberlândia</h2>" +
            "<p>Mapa das camadas selecionadas</p>";

        let restaurado = false;

        function restaurarMapa() {
            if (restaurado) return;
            restaurado = true;

            visibilidadeOriginal.forEach((estavaVisivel, camada) => {
                if (estavaVisivel) {
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

        setTimeout(() => {
            window.print();
        }, 500);
    });

    // Eventos do painel
    btnPainel.addEventListener("click", (evento) => {
        evento.preventDefault();
        alternarPainel();
    });

    btnFechar.addEventListener("click", (evento) => {
        evento.preventDefault();
        fecharPainel();
    });

    // Inicialização: o painel começa fechado
    fecharPainel();
    sincronizarSelecao();

    console.log(
        "[GeoEDL Exportação] Módulo carregado. " +
        "Eventos registrados para painel, PDF e ZIP."
    );
})();
