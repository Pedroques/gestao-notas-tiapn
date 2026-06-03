// Variáveis globais para armazenar as vendas e o mapeamento plano de prestações
let vendas = [];
let todasParcelas = [];

// Estado temporário para o pagamento parcial
let vendaIdSelecionada = null;
let numeroParcelaSelecionada = null;

// Elementos da DOM mapeados para interações
const corpoTabelaContas = document.getElementById("corpoTabelaContas");
const buscaCliente = document.getElementById("buscaCliente");
const buscaVendedor = document.getElementById("buscaVendedor");
const filtroMes = document.getElementById("filtroMes");
const filtroAno = document.getElementById("filtroAno");
const btnBuscar = document.getElementById("btnBuscar");
const areaFeedback = document.getElementById("areaFeedback");

// Elementos do Modal de Pagamento Parcial
const modalCliente = document.getElementById("modalCliente");
const modalVendedor = document.getElementById("modalVendedor");
const modalCompra = document.getElementById("modalCompra");
const modalNumeroParcela = document.getElementById("modalNumeroParcela");
const modalValorAtual = document.getElementById("modalValorAtual");
const valorPagamentoParcial = document.getElementById("valorPagamentoParcial");
const btnConfirmarPagamentoParcial = document.getElementById("btnConfirmarPagamentoParcial");
const erroValorExcedente = document.getElementById("erroValorExcedente");
const erroValorInvalido = document.getElementById("erroValorInvalido");

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

// Mostra notificações na tela de forma visual e elegante (substitui os alerts do navegador)
function exibirMensagemFeedback(mensagem, tipo = "danger") {
    areaFeedback.className = `alert alert-${tipo} alert-dismissible fade show text-center`;
    areaFeedback.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    areaFeedback.style.display = "block";
    
    // Auto-oculta após 5 segundos
    setTimeout(() => {
        areaFeedback.style.display = "none";
    }, 5000);
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
            const respostaDb = await fetch("db.JSON");
            const dados = await respostaDb.json();
            vendas = dados.vendas || [];
            processarPrestacoes();
        } catch(e) {
            corpoTabelaContas.innerHTML = `<tr><td colspan="8" class="text-danger">Erro de carregamento. Verifique se o json-server está rodando adequadamente na porta 3000.</td></tr>`;
        }
    }
}

// Transforma a estrutura de vendas em uma lista de parcelas individuais prontas para a tabela
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

// Filtra as parcelas usando os inputs de busca e seletores salvos
function filtrarParcelas() {
    const textoBuscaCliente = buscaCliente.value.toLowerCase().trim();
    const textoBuscaVendedor = buscaVendedor.value.toLowerCase().trim();
    const mesSelecionado = filtroMes.value;
    const anoSelecionado = filtroAno.value;

    // Persiste os filtros no sessionStorage
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

    // Ordena as parcelas de forma cronológica (vencimentos mais antigos aparecem primeiro)
    parcelasFiltradas.sort((a, b) => new Date(a.dataPrevista) - new Date(b.dataPrevista));

    renderizarTabela(parcelasFiltradas);
}

// Desenha a lista de prestações diretamente na tabela (Removido botão manual do recibo)
function renderizarTabela(parcelasParaRenderizar) {
    corpoTabelaContas.innerHTML = "";

    if (parcelasParaRenderizar.length === 0) {
        corpoTabelaContas.innerHTML = `<tr><td colspan="8">Nenhuma prestação encontrada para os filtros aplicados.</td></tr>`;
        return;
    }

    parcelasParaRenderizar.forEach(parcela => {
        const isPago = parcela.status === "Pago";
        const statusColor = isPago ? "text-success fw-bold" : "text-warning fw-bold";

        // Criação dos botões baseados no estado atual da prestação (Sem o botão Recibo manual)
        let acoesHtml = "";
        
        if (isPago) {
            acoesHtml = `
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="alternarStatusParcela(event, '${parcela.vendaId}', ${parcela.numero})">Desfazer</button>
            `;
        } else {
            acoesHtml = `
                <button type="button" class="btn btn-sm btn-success" onclick="alternarStatusParcela(event, '${parcela.vendaId}', ${parcela.numero})">Marcar Pago</button>
                <button type="button" class="btn btn-sm btn-warning ms-1" onclick="abrirModalPagamentoParcial(event, '${parcela.vendaId}', ${parcela.numero})">Pagar Parcial</button>
            `;
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

// Altera o status geral (Quitação Total de uma Parcela ou estorno)
async function alternarStatusParcela(event, vendaId, numeroParcela) {
    if (event) event.preventDefault();

    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    const parcela = venda.parcelasDetalhadas.find(p => p.numero === numeroParcela);
    if (!parcela) return;

    const valorAnterior = parcela.valor;
    let emitirReciboImediato = false;

    if (parcela.status === "Pago") {
        parcela.status = "Pendente";
        // Atualiza os resumos da venda de volta ao estado de pendente
        venda.pagamento.valorRestante = parseFloat((venda.pagamento.valorRestante + valorAnterior).toFixed(2));
        if (venda.resumo) {
            venda.resumo.valorRestante = parseFloat((venda.resumo.valorRestante + valorAnterior).toFixed(2));
            venda.resumo.somaParcelas = parseFloat((venda.resumo.somaParcelas + valorAnterior).toFixed(2));
        }
    } else {
        parcela.status = "Pago";
        emitirReciboImediato = true; // Sinaliza que devemos imprimir o recibo deste pagamento integral
        // Zera o saldo pendente restante desta parcela nos totais
        venda.pagamento.valorRestante = parseFloat(Math.max(0, venda.pagamento.valorRestante - valorAnterior).toFixed(2));
        if (venda.resumo) {
            venda.resumo.valorRestante = parseFloat(Math.max(0, venda.resumo.valorRestante - valorAnterior).toFixed(2));
            venda.resumo.somaParcelas = parseFloat(Math.max(0, venda.resumo.somaParcelas - valorAnterior).toFixed(2));
        }
    }

    try {
        const resposta = await fetch(`http://localhost:3000/vendas/${vendaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parcelasDetalhadas: venda.parcelasDetalhadas,
                pagamento: venda.pagamento,
                resumo: venda.resumo
            })
        });

        if (!resposta.ok) throw new Error("Não foi possível salvar no banco de dados.");

        exibirMensagemFeedback("Status da parcela atualizado com sucesso!", "success");
        
        // Se foi efetuada uma quitação total, gera o recibo automaticamente do valor pago
        if (emitirReciboImediato) {
            gerarReciboPDF(null, vendaId, numeroParcela, valorAnterior);
        }

        processarPrestacoes();

    } catch (erro) {
        console.error("Erro ao alternar status da parcela:", erro);
        exibirMensagemFeedback("Erro ao atualizar o status da prestação. Verifique o servidor.");
        // Desfaz a alteração local
        parcela.status = parcela.status === "Pago" ? "Pendente" : "Pago";
    }
}

// Configura e exibe o modal para registrar um pagamento parcial
function abrirModalPagamentoParcial(event, vendaId, numeroParcela) {
    if (event) event.preventDefault();

    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    const parcela = venda.parcelasDetalhadas.find(p => p.numero === numeroParcela);
    if (!parcela) return;

    // Guarda referências globais
    vendaIdSelecionada = vendaId;
    numeroParcelaSelecionada = numeroParcela;

    // Limpa alertas do modal
    erroValorExcedente.style.display = "none";
    erroValorInvalido.style.display = "none";

    // Insere os dados informativos do cliente no modal
    modalCliente.textContent = venda.cliente;
    modalVendedor.textContent = venda.nomeVendedor || (venda.vendedor && venda.vendedor.nome) || "Não Informado";
    modalCompra.textContent = venda.codigoPromissoria || venda.id;
    modalNumeroParcela.textContent = `${parcela.numero} / ${venda.parcelas}`;
    modalValorAtual.textContent = formatarMoeda(parcela.valor);

    // Configura o campo numérico de entrada
    valorPagamentoParcial.value = "";
    valorPagamentoParcial.max = parcela.valor;
    valorPagamentoParcial.placeholder = `Máx: ${parcela.valor.toFixed(2)}`;

    // Abre o modal de pagamento do Bootstrap
    const modalEl = document.getElementById("modalPagamentoParcial");
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
}

// Trata a confirmação e faz a subtração da parcela correspondente no banco de dados
async function submeterPagamentoParcial() {
    erroValorExcedente.style.display = "none";
    erroValorInvalido.style.display = "none";

    const venda = vendas.find(v => String(v.id) === String(vendaIdSelecionada));
    if (!venda) return;

    const parcela = venda.parcelasDetalhadas.find(p => p.numero === numeroParcelaSelecionada);
    if (!parcela) return;

    const valorPago = parseFloat(valorPagamentoParcial.value);

    // Validações de inserção
    if (isNaN(valorPago) || valorPago <= 0) {
        erroValorInvalido.style.display = "block";
        return;
    }

    if (valorPago > parcela.valor) {
        erroValorExcedente.style.display = "block";
        return;
    }

    // Processamento financeiro da subtração
    const valorOriginal = parcela.valor;
    const novoValorParcela = parseFloat((valorOriginal - valorPago).toFixed(2));

    if (novoValorParcela === 0) {
        parcela.status = "Pago";
    } else {
        parcela.valor = novoValorParcela;
    }

    // Ajusta o resumo financeiro de venda correspondente
    venda.pagamento.valorRestante = parseFloat(Math.max(0, venda.pagamento.valorRestante - valorPago).toFixed(2));
    if (venda.resumo) {
        venda.resumo.valorRestante = parseFloat(Math.max(0, venda.resumo.valorRestante - valorPago).toFixed(2));
        venda.resumo.somaParcelas = parseFloat(Math.max(0, venda.resumo.somaParcelas - valorPago).toFixed(2));
    }

    try {
        const resposta = await fetch(`http://localhost:3000/vendas/${vendaIdSelecionada}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                parcelasDetalhadas: venda.parcelasDetalhadas,
                pagamento: venda.pagamento,
                resumo: venda.resumo
            })
        });

        if (!resposta.ok) throw new Error("Não foi possível enviar a atualização ao servidor");

        // Fecha o modal e exibe feedback de sucesso
        const modalEl = document.getElementById("modalPagamentoParcial");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();

        exibirMensagemFeedback(`Pagamento parcial de ${formatarMoeda(valorPago)} registrado com sucesso!`, "success");
        
        // Gera o recibo da transação parcial instantaneamente
        gerarReciboPDF(null, vendaIdSelecionada, numeroParcelaSelecionada, valorPago);

        // Recarrega todos os dados
        await carregarVendas();

    } catch (erro) {
        console.error("Erro ao registrar pagamento parcial:", erro);
        exibirMensagemFeedback("Ocorreu uma falha ao tentar registar o pagamento parcial no servidor.");
    }
}

// Gera o recibo de pagamento em formato PDF via jsPDF com o valor exato da transação
function gerarReciboPDF(event, vendaId, numeroParcela, valorRecebido) {
    if (event) event.preventDefault();

    const venda = vendas.find(v => String(v.id) === String(vendaId));
    if (!venda) return;

    const parcela = venda.parcelasDetalhadas.find(p => p.numero === numeroParcela);
    if (!parcela) return;

    const vendedorNome = venda.nomeVendedor || (venda.vendedor && venda.vendedor.nome) || "Não Informado";
    const codigoPromissoria = venda.codigoPromissoria || venda.id;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("RECIBO DE PAGAMENTO PROVISÓRIO", 105, 20, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    doc.text(`Nº do Recibo: ${codigoPromissoria}-${parcela.numero}`, 20, 40);
    
    doc.setFont("helvetica", "bold");
    doc.text("Dados do Cliente", 20, 55);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome do Pagador: ${venda.cliente}`, 20, 65);
    if (venda.clienteCompleto && venda.clienteCompleto.cpf) {
        doc.text(`CPF: ${venda.clienteCompleto.cpf}`, 20, 75);
    }
    
    doc.setFont("helvetica", "bold");
    doc.text("Especificações da Prestação Quitada", 20, 95);
    doc.setFont("helvetica", "normal");
    doc.text(`Produto(s): ${venda.produto}`, 20, 105);
    doc.text(`Vendedor Responsável: ${vendedorNome}`, 20, 115);
    doc.text(`Identificação da Parcela: ${parcela.numero} de ${venda.parcelas}`, 20, 125);
    
    // Mostra especificamente o valor pago nesta transação (Seja integral ou parcial)
    doc.setFont("helvetica", "bold");
    doc.text(`Valor Recebido: ${formatarMoeda(valorRecebido)}`, 20, 135);
    
    // Mostra o saldo restante na parcela (se ainda houver)
    doc.setFont("helvetica", "normal");
    const saldoRestanteParcela = parcela.status === "Pago" ? 0 : parcela.valor;
    doc.text(`Saldo Restante da Parcela: ${formatarMoeda(saldoRestanteParcela)}`, 20, 145);
    doc.text(`Forma de Pagamento: ${(parcela.formaPagamento || 'Dinheiro').toUpperCase()}`, 20, 155);

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Data de Recebimento do Valor: ${dataAtual}`, 20, 175);

    doc.text("_____________________________________________________", 105, 215, { align: "center" });
    doc.text("Assinatura do Recebedor (Gestão de Vendas)", 105, 225, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Este documento constitui um recibo provisório que atesta a quitação física do valor acima mencionado.", 105, 280, { align: "center" });

    const nomeArquivo = `Recibo_${venda.cliente.replace(/\s+/g, '_')}_Parcela_${parcela.numero}.pdf`;
    doc.save(nomeArquivo);
}

// Associação dos gatilhos de eventos e submissão
btnBuscar.addEventListener("click", filtrarParcelas);
buscaCliente.addEventListener("input", filtrarParcelas);
buscaVendedor.addEventListener("input", filtrarParcelas);
filtroMes.addEventListener("change", filtrarParcelas);
filtroAno.addEventListener("change", filtrarParcelas);
btnConfirmarPagamentoParcial.addEventListener("click", submeterPagamentoParcial);

// Executado imediatamente ao inicializar o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
    const buscaSalva = sessionStorage.getItem("filtro_buscaCliente");
    const vendedorSalvo = sessionStorage.getItem("filtro_buscaVendedor");
    const mesSalvo = sessionStorage.getItem("filtro_mes");
    const anoSalvo = sessionStorage.getItem("filtro_ano");

    if (buscaSalva !== null) buscaCliente.value = buscaSalva;
    if (vendedorSalvo !== null) buscaVendedor.value = vendedorSalvo;

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