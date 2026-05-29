// Variável global para armazenar as vendas
let vendas = [];

// Elementos da DOM
const corpoTabelaContas = document.getElementById("corpoTabelaContas");
const buscaCliente = document.getElementById("buscaCliente");
const filtroMes = document.getElementById("filtroMes");
const filtroAno = document.getElementById("filtroAno");
const btnBuscar = document.getElementById("btnBuscar");

// Instância do Modal do Bootstrap
let modalParcelasInstance = null;

// Formata valores monetários
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Converte YYYY-MM-DD para DD/MM/YYYY
function formatarDataBR(dataString) {
    if (!dataString) return "";
    const partes = dataString.split("T")[0].split("-");
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

// Analisa as parcelas de uma venda para definir o status geral
function obterStatusVenda(venda) {
    if (!venda.parcelasDetalhadas || venda.parcelasDetalhadas.length === 0) {
        // Se pagou tudo à vista ou não tem parcela pendente
        return { texto: "Concluído", classe: "text-success" };
    }

    const todasPagas = venda.parcelasDetalhadas.every(p => p.status === "Pago");
    if (todasPagas) {
        return { texto: "Concluído", classe: "text-success" };
    }

    const algumaAtrasada = venda.parcelasDetalhadas.some(p => {
        if (p.status === "Pago") return false;
        // Lógica simples de atraso: se a data prevista for menor que hoje
        const dataVencimento = new Date(p.dataPrevista + "T00:00:00");
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        return dataVencimento < hoje;
    });

    if (algumaAtrasada) {
        return { texto: "Em atraso", classe: "text-danger fw-bold" };
    }

    return { texto: "Em andamento", classe: "text-warning" };
}

// Carrega os dados do json-server
async function carregarVendas() {
    try {
        const resposta = await fetch("http://localhost:3000/vendas");
        
        if (!resposta.ok) {
            throw new Error("Falha ao buscar no json-server");
        }
        
        vendas = await resposta.json();
        renderizarTabela(vendas);
        
    } catch (erro) {
        console.error("Erro ao carregar vendas da API, tentando fallback db.JSON:", erro);
        // Tenta ler do arquivo local se o server não estiver rodando (somente leitura)
        try {
            const respostaDb = await fetch("db.JSON");
            const dados = await respostaDb.json();
            vendas = dados.vendas || [];
            renderizarTabela(vendas);
        } catch(e) {
            corpoTabelaContas.innerHTML = `<tr><td colspan="7" class="text-danger">Erro ao carregar as contas. Verifique se o json-server está rodando.</td></tr>`;
        }
    }
}

// Renderiza a tabela principal
function renderizarTabela(dadosParaRenderizar) {
    corpoTabelaContas.innerHTML = "";

    if (dadosParaRenderizar.length === 0) {
        corpoTabelaContas.innerHTML = `<tr><td colspan="7">Nenhuma venda encontrada para os filtros aplicados.</td></tr>`;
        return;
    }

    dadosParaRenderizar.forEach(venda => {
        const status = obterStatusVenda(venda);
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td class="fw-semibold">${venda.cliente}</td>
            <td>${venda.produto}</td>
            <td>${formatarMoeda(venda.valorTotal)}</td>
            <td>${venda.parcelas}</td>
            <td>${formatarDataBR(venda.dataVenda)}</td>
            <td class="${status.classe}">${status.texto}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="abrirModalParcelas('${venda.id}')">
                    Ver parcelas
                </button>
            </td>
        `;

        corpoTabelaContas.appendChild(linha);
    });
}

// Aplica os filtros de Nome, Mês e Ano
function filtrarVendas() {
    const textoBusca = buscaCliente.value.toLowerCase().trim();
    const mesSelecionado = filtroMes.value;
    const anoSelecionado = filtroAno.value;

    const vendasFiltradas = vendas.filter(venda => {
        // Filtro Cliente
        const bateNome = venda.cliente.toLowerCase().includes(textoBusca);

        // Filtro Data (YYYY-MM-DD)
        let bateMes = true;
        let bateAno = true;
        
        if (venda.dataVenda) {
            const [anoVenda, mesVenda] = venda.dataVenda.split("-");
            if (mesSelecionado !== "") {
                bateMes = (mesVenda === mesSelecionado);
            }
            if (anoSelecionado !== "") {
                bateAno = (anoVenda === anoSelecionado);
            }
        }

        return bateNome && bateMes && bateAno;
    });

    renderizarTabela(vendasFiltradas);
}

// Função executada ao clicar no botão "Ver parcelas"
function abrirModalParcelas(vendaId) {
    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    // Atualiza cabeçalho do Modal
    const infoVendaModal = document.getElementById("infoVendaModal");
    infoVendaModal.innerHTML = `
        <strong>Cliente:</strong> ${venda.cliente} <br>
        <strong>Produto(s):</strong> ${venda.produto} <br>
        <strong>Valor Total:</strong> ${formatarMoeda(venda.valorTotal)} <br>
        <strong>Restante (no registro):</strong> ${formatarMoeda(venda.pagamento.valorRestante)}
    `;

    // Atualiza corpo da tabela do Modal
    const corpoTabelaModal = document.getElementById("corpoTabelaModal");
    corpoTabelaModal.innerHTML = "";

    if (!venda.parcelasDetalhadas || venda.parcelasDetalhadas.length === 0) {
        corpoTabelaModal.innerHTML = `<tr><td colspan="6">Esta venda foi à vista ou não possui parcelas registradas.</td></tr>`;
    } else {
        venda.parcelasDetalhadas.forEach((parcela, index) => {
            const isPago = parcela.status === "Pago";
            const btnClass = isPago ? "btn-outline-danger" : "btn-success";
            const btnTexto = isPago ? "Desmarcar Pgto" : "Marcar como Pago";
            const statusColor = isPago ? "text-success fw-bold" : "text-warning fw-bold";

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${parcela.numero}</td>
                <td>${formatarDataBR(parcela.dataPrevista)}</td>
                <td>${formatarMoeda(parcela.valor)}</td>
                <td class="text-capitalize">${parcela.formaPagamento}</td>
                <td class="${statusColor}">${parcela.status}</td>
                <td class="d-flex flex-column gap-1 align-items-center">
                    <button class="btn btn-sm ${btnClass} w-100" onclick="alternarStatusParcela('${venda.id}', ${index})">
                        ${btnTexto}
                    </button>
                    ${isPago ? `
                    <button class="btn btn-sm btn-outline-primary w-100" onclick="gerarRecibo('${venda.id}', ${index})">
                        Recibo PDF
                    </button>` : ''}
                </td>
            `;
            corpoTabelaModal.appendChild(tr);
        });
    }

    // Exibe o modal apenas se ele não estiver visível (evita que ele feche ao atualizar)
    const modalElement = document.getElementById('modalParcelas');
    if (!modalElement.classList.contains('show')) {
        if (!modalParcelasInstance) {
            modalParcelasInstance = new bootstrap.Modal(modalElement);
        }
        modalParcelasInstance.show();
    }
}

// Função para gerar o recibo em PDF
function gerarRecibo(vendaId, parcelaIndex) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;
    
    const parcela = venda.parcelasDetalhadas[parcelaIndex];

    // Margens e posições (eixo Y)
    let y = 20;

    // Título
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("RECIBO DE PAGAMENTO", 105, y, { align: "center" });
    
    y += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Sistema de Gestão de Vendas", 105, y, { align: "center" });
    
    y += 20;
    
    // Dados do Recebimento
    doc.setFontSize(12);
    doc.text(`Recebemos de: ${venda.cliente}`, 20, y);
    
    if (venda.clienteCompleto && venda.clienteCompleto.cpf) {
        y += 8;
        doc.text(`CPF: ${venda.clienteCompleto.cpf}`, 20, y);
    }

    y += 12;
    doc.text(`A quantia de: ${formatarMoeda(parcela.valor)}`, 20, y);
    
    y += 12;
    doc.text(`Referente a: Pagamento da parcela ${parcela.numero}/${venda.parcelas} - Produto(s): ${venda.produto}`, 20, y);
    
    y += 12;
    doc.text(`Forma de Pagamento: ${parcela.formaPagamento.toUpperCase()}`, 20, y);

    y += 25;
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data da Emissão: ${dataHoje}`, 20, y);

    y += 40;
    doc.text("____________________________________________________", 105, y, { align: "center" });
    y += 8;
    doc.text("Assinatura do Responsável / Loja", 105, y, { align: "center" });

    // Nome do arquivo gerado e Download automático
    const nomeArquivo = `Recibo_${venda.cliente.replace(/\s+/g, '_')}_Parcela_${parcela.numero}.pdf`;
    doc.save(nomeArquivo);
}

// Função para dar baixa ou reverter o pagamento da parcela
async function alternarStatusParcela(vendaId, parcelaIndex) {
    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    // Alterna o status localmente
    const parcela = venda.parcelasDetalhadas[parcelaIndex];
    if (parcela.status === "Pago") {
        parcela.status = "Pendente";
    } else {
        parcela.status = "Pago";
    }

    // Dispara a requisição PUT/PATCH para atualizar o banco (json-server)
    try {
        const resposta = await fetch(`http://localhost:3000/vendas/${vendaId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parcelasDetalhadas: venda.parcelasDetalhadas
            })
        });

        if (!resposta.ok) throw new Error("Erro ao salvar no banco.");

        // Atualiza as interfaces
        abrirModalParcelas(vendaId); // Atualiza modal
        filtrarVendas(); // Atualiza tabela principal (reflete se foi concluído)

    } catch (erro) {
        console.error("Falha na atualização:", erro);
        alert("Erro ao alterar o status da parcela. O JSON-Server está rodando na porta 3000?");
        
        // Reverte a alteração em caso de erro
        parcela.status = parcela.status === "Pago" ? "Pendente" : "Pago";
    }
}

// Eventos
btnBuscar.addEventListener("click", filtrarVendas);

// Buscar dinamicamente ao digitar o nome (opcional, melhora experiência)
buscaCliente.addEventListener("input", filtrarVendas);
filtroMes.addEventListener("change", filtrarVendas);
filtroAno.addEventListener("change", filtrarVendas);

// Inicialização da página
document.addEventListener("DOMContentLoaded", () => {
    // Traz o mês e ano atual para o filtro
    const hoje = new Date();
    filtroMes.value = String(hoje.getMonth() + 1).padStart(2, '0');
    filtroAno.value = String(hoje.getFullYear());
    
    carregarVendas();
});