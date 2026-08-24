// =======================================================
// GeoEDL Uberlândia
// Controle dos Painéis
// Versão 2.0
// =======================================================

// ===========================================
// BOTÕES
// ===========================================

const btnCamadas = document.getElementById("btnCamadas");
const btnBuscar = document.getElementById("btnBuscar");

// ===========================================
// PAINÉIS
// ===========================================

const painelCamadas = document.getElementById("painelLateral");
const painelBusca = document.getElementById("painelBusca");

// ===========================================
// ABRIR / FECHAR
// ===========================================

function abrirPainel(painel){

    fecharTodos();

    painel.classList.remove("painel-fechado");
    painel.classList.add("painel-aberto");

}

function fecharPainel(painel){

    painel.classList.remove("painel-aberto");
    painel.classList.add("painel-fechado");

}

function painelAberto(painel){

    return painel.classList.contains("painel-aberto");

}

function fecharTodos(){

    fecharPainel(painelCamadas);
    fecharPainel(painelBusca);

}

// ===========================================
// CAMADAS
// ===========================================

btnCamadas.addEventListener("click",function(){

    if(painelAberto(painelCamadas)){

        fecharPainel(painelCamadas);

    }else{

        abrirPainel(painelCamadas);

    }

});

// ===========================================
// BUSCA
// ===========================================

btnBuscar.addEventListener("click", function () {

    if (painelAberto(painelBusca)) {

        fecharPainel(painelBusca);

    } else {

        abrirPainel(painelBusca);

        txtBuscaEDL.focus();

    }

});