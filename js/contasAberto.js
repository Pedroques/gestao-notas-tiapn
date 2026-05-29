// Variáveis globais para armazenar as vendas e o mapeamento plano de prestações
let vendas = [];
let todasParcelas = [];

// Elementos da DOM mapeados para interações
const corpoTabelaContas = document.getElementById("corpoTabelaContas");
const buscaCliente = document.getElementById("buscaCliente");
const buscaVendedor = document.getElementById("buscaVendedor");
const filtroMes = document.getElementById("filtroMes");
const filtroAno = document.getElementById("filtroAno");
const btnBuscar = document.getElementById("btnBuscar");

// Formata valores numéricos para formato de moeda corrente brasileira (R$)
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte datas no formato YYYY-MM-DD para o formato nacional legível DD/MM/YYYY
function formatarDataBR(dataString) {
    if (!dataString) return "";
    const partes = dataString.split("T")[0].split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

// Procura e carrega os dados de vendas contidos no json-server local
async function carregarVendas() {
    try {
        const resposta = await fetch("http://localhost:3000/vendas");
        
        if (!resposta.ok) throw new Error("Erro de comunicação com o json-server");
        
        vendas = await resposta.json();
        processarPrestacoes();
        
    } catch (erro) {
        console.error("Erro ao carregar dados do servidor. Tentando recuperar dados estáticos locais do db.JSON:", erro);
        try {
            // Caso o json-server não esteja online, realiza fallback de leitura simples no db.JSON
            const respostaDb = await fetch("db.JSON");
            const dados = await respostaDb.json();
            vendas = dados.vendas || [];
            processarPrestacoes();
        } catch(e) {
            corpoTabelaContas.innerHTML = `<tr><td colspan="8" class="text-danger">Erro de carregamento. Verifique se o json-server está rodando adequadamente na porta 3000.</td></tr>`;
        }
    }
}

// Transforma a estrutura hierárquica de vendas numa lista plana onde cada linha é uma prestação independente
function processarPrestacoes() {
    todasParcelas = [];
    
    vendas.forEach(venda => {
        if (venda.parcelasDetalhadas && venda.parcelasDetalhadas.length > 0) {
            venda.parcelasDetalhadas.forEach(parcela => {
                todasParcelas.push({
                    ...parcela,
                    vendaId: venda.id,
                    cliente: venda.cliente,
                    vendedorNome: venda.nomeVendedor || (venda.vendedor && venda.vendedor.nome) || "Não Informado",
                    codigoPromissoria: venda.codigoPromissoria || venda.id,
                    produto: venda.produto,
                    clienteCompleto: venda.clienteCompleto,
                    totalVenda: venda.valorTotal,
                    qtdParcelas: venda.parcelas
                });
            });
        }
    });

    filtrarParcelas();
}

// Filtra as parcelas usando as informações inseridas na busca e nos seletores de data
function filtrarParcelas() {
    const textoBuscaCliente = buscaCliente.value.toLowerCase().trim();
    const textoBuscaVendedor = buscaVendedor.value.toLowerCase().trim();
    const mesSelecionado = filtroMes.value;
    const anoSelecionado = filtroAno.value;

    // Persiste os filtros no sessionStorage para mantê-los aplicados após o auto-reload do Live Server
    sessionStorage.setItem("filtro_buscaCliente", buscaCliente.value);
    sessionStorage.setItem("filtro_buscaVendedor", buscaVendedor.value);
    sessionStorage.setItem("filtro_mes", mesSelecionado);
    sessionStorage.setItem("filtro_ano", anoSelecionado);

    const parcelasFiltradas = todasParcelas.filter(parcela => {
        const bateCliente = parcela.cliente.toLowerCase().includes(textoBuscaCliente);
        const bateVendedor = parcela.vendedorNome.toLowerCase().includes(textoBuscaVendedor);
        let bateMes = true;
        let bateAno = true;
        
        if (parcela.dataPrevista) {
            const [anoVenc, mesVenc] = parcela.dataPrevista.split("-");
            if (mesSelecionado !== "") bateMes = (mesVenc === mesSelecionado);
            if (anoSelecionado !== "") bateAno = (anoVenc === anoSelecionado);
        }

        return bateCliente && bateVendedor && bateMes && bateAno;
    });

    // Ordena as prestações pela data de vencimento (das mais antigas às mais recentes)
    parcelasFiltradas.sort((a, b) => new Date(a.dataPrevista) - new Date(b.dataPrevista));

    renderizarTabela(parcelasFiltradas);
}

// Renderiza as linhas na tabela de prestações
function renderizarTabela(parcelasParaRenderizar) {
    corpoTabelaContas.innerHTML = "";

    if (parcelasParaRenderizar.length === 0) {
        corpoTabelaContas.innerHTML = `<tr><td colspan="8">Nenhuma prestação encontrada para os filtros aplicados.</td></tr>`;
        return;
    }

    parcelasParaRenderizar.forEach(parcela => {
        const isPago = parcela.status === "Pago";
        const btnClass = isPago ? "btn-outline-danger" : "btn-success";
        const btnTexto = isPago ? "Desfazer" : "Marcar Pago";
        const statusColor = isPago ? "text-success fw-bold" : "text-warning fw-bold";

        // Criação dos botões de controle na linha de cada prestação
        let acoesHtml = `<button type="button" class="btn btn-sm ${btnClass}" onclick="alternarStatusParcela(event, '${parcela.vendaId}', ${parcela.numero})">${btnTexto}</button>`;
        
        if (isPago) {
            acoesHtml += ` <button type="button" class="btn btn-sm btn-secondary ms-1 mt-1 mt-md-0" onclick="gerarReciboPDF(event, '${parcela.vendaId}', ${parcela.numero})">Recibo</button>`;
        }

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td class="fw-semibold">${parcela.cliente}</td>
            <td>${parcela.vendedorNome}</td>
            <td class="text-muted fw-bold">#${parcela.codigoPromissoria}</td>
            <td>${parcela.numero} / ${parcela.qtdParcelas}</td>
            <td>${formatarDataBR(parcela.dataPrevista)}</td>
            <td>${formatarMoeda(parcela.valor)}</td>
            <td class="${statusColor}">${parcela.status}</td>
            <td>${acoesHtml}</td>
        `;

        corpoTabelaContas.appendChild(linha);
    });
}

// Altera o status da parcela específica no banco de dados e atualiza a interface
async function alternarStatusParcela(event, vendaId, numeroParcela) {
    if (event) event.preventDefault();

    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    // Encontra a parcela de referência dentro da lista detalhada de parcelas da venda original
    const parcela = venda.parcelasDetalhadas.find(p => p.numero === numeroParcela);
    if (!parcela) return;

    // Altera o estado local da parcela
    parcela.status = parcela.status === "Pago" ? "Pendente" : "Pago";

    try {
        const resposta = await fetch(`http://localhost:3000/vendas/${vendaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parcelasDetalhadas: venda.parcelasDetalhadas })
        });

        if (!resposta.ok) throw new Error("Não foi possível enviar a atualização ao servidor");

        // Atualiza as parcelas locais e recarrega os filtros
        processarPrestacoes();

    } catch (erro) {
        console.error("Erro durante a atualização do status:", erro);
        alert("Ocorreu um erro ao modificar o estado de pagamento desta prestação. Verifique se o JSON-Server está executando.");
        // Reverte as alterações em caso de erro na comunicação externa
        parcela.status = parcela.status === "Pago" ? "Pendente" : "Pago";
    }
}

// Gera um documento de recibo de pagamento em formato PDF via jsPDF
function gerarReciboPDF(event, vendaId, numeroParcela) {
    if (event) event.preventDefault();

    const parcelaFlat = todasParcelas.find(p => String(p.vendaId) === String(vendaId) && p.numero === numeroParcela);
    if (!parcelaFlat) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título Centralizado do documento de Recibo Provisório
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RECIBO DE PAGAMENTO PROVISÓRIO", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Nº do Recibo: ${parcelaFlat.codigoPromissoria}-${parcelaFlat.numero}`, 20, 40);
    
    // Seção dos dados cadastrais do cliente
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Cliente", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome do Pagador: ${parcelaFlat.cliente}`, 20, 65);
    if (parcelaFlat.clienteCompleto && parcelaFlat.clienteCompleto.cpf) {
        doc.text(`CPF: ${parcelaFlat.clienteCompleto.cpf}`, 20, 75);
    }
    
    // Seção contendo os dados detalhados da prestação que está sendo quitada
    doc.setFont("helvetica", "bold");
    doc.text("Especificações da Prestação Quitada", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.text(`Produto(s): ${parcelaFlat.produto}`, 20, 105);
    doc.text(`Vendedor Responsável: ${parcelaFlat.vendedorNome}`, 20, 115);
    doc.text(`Identificação da Parcela: ${parcelaFlat.numero} de ${parcelaFlat.qtdParcelas}`, 20, 125);
    doc.text(`Valor Recebido: ${formatarMoeda(parcelaFlat.valor)}`, 20, 135);
    doc.text(`Forma de Pagamento: ${parcelaFlat.formaPagamento.toUpperCase()}`, 20, 145);

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data de Recebimento do Valor: ${dataAtual}`, 20, 165);

    // Linha e espaço reservado para preenchimento de assinatura física
    doc.text("_____________________________________________________", 105, 205, { align: "center" });
    doc.text("Assinatura do Recebedor (Gestão de Vendas)", 105, 215, { align: "center" });

    // Informação de rodapé para fins burocráticos
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Este documento constitui um recibo provisório que atesta a quitação física da prestação.", 105, 280, { align: "center" });

    // Inicia o processo de download do recibo PDF no navegador
    const nomeArquivo = `Recibo_${parcelaFlat.cliente.replace(/\s+/g, '_')}_Parcela_${parcelaFlat.numero}.pdf`;
    doc.save(nomeArquivo);
}

// Adiciona os eventos de escuta aos campos de controle e filtro
btnBuscar.addEventListener("click", filtrarParcelas);
buscaCliente.addEventListener("input", filtrarParcelas);
buscaVendedor.addEventListener("input", filtrarParcelas);
filtroMes.addEventListener("change", filtrarParcelas);
filtroAno.addEventListener("change", filtrarParcelas);

// Executado imediatamente ao inicializar o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    // Restaura filtros de busca salvos na sessão (evita que a pesquisa se desfaça ao alterar status)
    const buscaSalva = sessionStorage.getItem("filtro_buscaCliente");
    const vendedorSalvo = sessionStorage.getItem("filtro_buscaVendedor");
    const mesSalvo = sessionStorage.getItem("filtro_mes");
    const anoSalvo = sessionStorage.getItem("filtro_ano");

    if (buscaSalva !== null) {
        buscaCliente.value = buscaSalva;
    }
    
    if (vendedorSalvo !== null) {
        buscaVendedor.value = vendedorSalvo;
    }

    if (mesSalvo !== null) {
        filtroMes.value = mesSalvo;
    } else {
        const hoje = new Date();
        filtroMes.value = String(hoje.getMonth() + 1).padStart(2, '0');
    }

    if (anoSalvo !== null) {
        filtroAno.value = anoSalvo;
    } else {
        const hoje = new Date();
        filtroAno.value = String(hoje.getFullYear());
    }

    carregarVendas();
});