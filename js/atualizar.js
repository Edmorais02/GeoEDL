// =======================================================
// GeoEDL Uberlândia
// Atualização dinâmica das EDLs
// Versão 1.0
// =======================================================

const btnAtualizar = document.getElementById("btnAtualizar");
const inputGeoJSON = document.getElementById("inputGeoJSON");

// ----------------------------------------
// Abrir seleção de arquivo
// ----------------------------------------

btnAtualizar.addEventListener("click", function () {

    inputGeoJSON.click();

});

// ----------------------------------------
// Arquivo selecionado
// ----------------------------------------

inputGeoJSON.addEventListener("change", carregarNovoGeoJSON);

// ----------------------------------------
// Carregar novo arquivo
// ----------------------------------------

function carregarNovoGeoJSON(e){

    const arquivo = e.target.files[0];

    if(!arquivo){

        return;

    }

    const reader = new FileReader();

    reader.onload = function(event){

    try{

        const geojson = JSON.parse(event.target.result);

        // Remove a camada antiga
        if(camadaEDLs){

            map.removeLayer(camadaEDLs);

        }

        // Cria a nova camada
        criarCamadaEDLs(geojson);

        alert("EDLs atualizadas com sucesso!");

        // limpa o campo para permitir carregar
        // novamente o mesmo arquivo
        inputGeoJSON.value = "";

    }catch(err){

        alert("Arquivo GeoJSON inválido.");

        console.error(err);

    }

};

    reader.readAsText(arquivo);

