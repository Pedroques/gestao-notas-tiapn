let produtosVenda = [];
let parcelasVenda = [];

const formVenda = document.getElementById("formVenda");

const codigoProduto = document.getElementById("codigoProduto");
const descricaoProduto = document.getElementById("descricaoProduto");
const quantidadeProduto = document.getElementById("quantidadeProduto");
const valorUnitario = document.getElementById("valorUnitario");
const btnAdicionarProduto = document.getElementById("btnAdicionarProduto");
const corpoTabelaProdutos = document.getElementById("corpoTabelaProdutos");

const valorProdutos = document.getElementById("valorProdutos");
const descontoVenda = document.getElementById("descontoVenda");
const acrescimoVenda = document.getElementById("acrescimoVenda");
const valorTotalVenda = document.getElementById("valorTotalVenda");
const valorPagoEntrada = document.getElementById("valorPagoEntrada");
const valorRestante = document.getElementById("valorRestante");

const tipoPagamento = document.getElementById("tipoPagamento");
const formaPagamento = document.getElementById("formaPagamento");
const dataPrimeiroPagamento = document.getElementById("dataPrimeiroPagamento");
const tipoVencimento = document.getElementById("tipoVencimento");
const diaPagamento = document.getElementById("diaPagamento");
const quantidadeParcelas = document.getElementById("quantidadeParcelas");
const valorParcela = document.getElementById("valorParcela");
const intervaloParcelas = document.getElementById("intervaloParcelas");
const observacaoPagamento = document.getElementById("observacaoPagamento");
const btnGerarParcelas = document.getElementById("btnGerarParcelas");
const corpoTabelaParcelas = document.getElementById("corpoTabelaParcelas");

const btnCancelarVenda = document.getElementById("btnCancelarVenda");

function converterParaNumero(valor) {
    const numero = Number(valor);

    if (isNaN(numero)) {
        return 0;
    }

    return numero;
}

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function formatarData(data) {
    return data.toLocaleDateString("pt-BR");
}

function criarDataLocal(valorData) {
    const partes = valorData.split("-");
    const ano = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    return new Date(ano, mes, dia);
}

function atualizarTotais() {
    const totalProdutos = produtosVenda.reduce((total, produto) => {
        return total + produto.subtotal;
    }, 0);

    const desconto = converterParaNumero(descontoVenda.value);
    const acrescimo = converterParaNumero(acrescimoVenda.value);

    let totalVenda = totalProdutos - desconto + acrescimo;

    if (totalVenda < 0) {
        totalVenda = 0;
    }

    valorProdutos.value = totalProdutos.toFixed(2);
    valorTotalVenda.value = totalVenda.toFixed(2);

    atualizarValorParcelaAutomatico();
}

function atualizarValorParcelaAutomatico() {
    const total = converterParaNumero(valorTotalVenda.value);
    const qtdParcelas = converterParaNumero(quantidadeParcelas.value);

    if (total > 0 && qtdParcelas > 0) {
        valorParcela.value = (total / qtdParcelas).toFixed(2);
    }
}

function adicionarProduto() {
    const codigo = codigoProduto.value.trim();
    const descricao = descricaoProduto.value.trim();
    const quantidade = converterParaNumero(quantidadeProduto.value);
    const valor = converterParaNumero(valorUnitario.value);

    if (descricao === "") {
        alert("Informe a descrição do produto.");
        descricaoProduto.focus();
        return;
    }

    if (quantidade <= 0) {
        alert("Informe uma quantidade válida.");
        quantidadeProduto.focus();
        return;
    }

    if (valor <= 0) {
        alert("Informe um valor unitário válido.");
        valorUnitario.focus();
        return;
    }

    const produto = {
        idTemporario: Date.now(),
        codigo: codigo,
        descricao: descricao,
        quantidade: quantidade,
        valorUnitario: valor,
        subtotal: quantidade * valor
    };

    produtosVenda.push(produto);

    limparCamposProduto();
    renderizarProdutos();
    atualizarTotais();
}

function limparCamposProduto() {
    codigoProduto.value = "";
    descricaoProduto.value = "";
    quantidadeProduto.value = 1;
    valorUnitario.value = "";
    codigoProduto.focus();
}

function removerProduto(idTemporario) {
    produtosVenda = produtosVenda.filter(produto => produto.idTemporario !== idTemporario);

    renderizarProdutos();
    atualizarTotais();
}

function renderizarProdutos() {
    corpoTabelaProdutos.innerHTML = "";

    if (produtosVenda.length === 0) {
        corpoTabelaProdutos.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="5">Nenhum produto adicionado ainda.</td>
            </tr>
        `;
        return;
    }

    produtosVenda.forEach(produto => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.descricao}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.valorUnitario)}</td>
            <td>${formatarMoeda(produto.subtotal)}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm" onclick="removerProduto(${produto.idTemporario})">
                    Remover
                </button>
            </td>
        `;

        corpoTabelaProdutos.appendChild(linha);
    });
}

function ehDiaUtil(data) {
    const diaSemana = data.getDay();

    return diaSemana !== 0 && diaSemana !== 6;
}

function ajustarParaProximoDiaUtil(data) {
    const dataAjustada = new Date(data);

    while (!ehDiaUtil(dataAjustada)) {
        dataAjustada.setDate(dataAjustada.getDate() + 1);
    }

    return dataAjustada;
}

function obterQuintoDiaUtil(ano, mes) {
    let contadorDiasUteis = 0;
    let data = new Date(ano, mes, 1);

    while (contadorDiasUteis < 5) {
        if (ehDiaUtil(data)) {
            contadorDiasUteis++;
        }

        if (contadorDiasUteis < 5) {
            data.setDate(data.getDate() + 1);
        }
    }

    return data;
}

function obterDataFixaDoMes(ano, mes, diaInformado) {
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
    const diaValido = Math.min(diaInformado, ultimoDiaDoMes);

    return new Date(ano, mes, diaValido);
}

function somarMeses(dataBase, quantidadeMeses) {
    const novaData = new Date(dataBase);
    const diaOriginal = novaData.getDate();

    novaData.setMonth(novaData.getMonth() + quantidadeMeses);

    if (novaData.getDate() !== diaOriginal) {
        novaData.setDate(0);
    }

    return novaData;
}

function calcularDataParcela(dataBase, numeroParcela) {
    const tipo = tipoVencimento.value;
    const intervalo = intervaloParcelas.value;
    const diaInformado = converterParaNumero(diaPagamento.value);

    let dataCalculada;

    if (tipo === "quinto-dia-util") {
        let dataMesReferencia = somarMeses(dataBase, numeroParcela - 1);
        let ano = dataMesReferencia.getFullYear();
        let mes = dataMesReferencia.getMonth();

        dataCalculada = obterQuintoDiaUtil(ano, mes);

        if (numeroParcela === 1 && dataCalculada < dataBase) {
            dataMesReferencia = somarMeses(dataBase, 1);
            ano = dataMesReferencia.getFullYear();
            mes = dataMesReferencia.getMonth();

            dataCalculada = obterQuintoDiaUtil(ano, mes);
        }

        return dataCalculada;
    }

    if (tipo === "data-fixa") {
        if (diaInformado <= 0) {
            alert("Informe o dia de pagamento para usar data fixa combinada.");
            diaPagamento.focus();
            return null;
        }

        const dataMesReferencia = somarMeses(dataBase, numeroParcela - 1);
        const ano = dataMesReferencia.getFullYear();
        const mes = dataMesReferencia.getMonth();

        dataCalculada = obterDataFixaDoMes(ano, mes, diaInformado);
        return dataCalculada;
    }

    if (intervalo === "mensal") {
        dataCalculada = somarMeses(dataBase, numeroParcela - 1);
    } else {
        const diasIntervalo = converterParaNumero(intervalo);
        dataCalculada = new Date(dataBase);
        dataCalculada.setDate(dataCalculada.getDate() + (diasIntervalo * (numeroParcela - 1)));
    }

    if (tipo === "dia-util") {
        dataCalculada = ajustarParaProximoDiaUtil(dataCalculada);
    }

    return dataCalculada;
}

function gerarParcelas() {
    const totalVenda = converterParaNumero(valorTotalVenda.value);
    const qtdParcelas = converterParaNumero(quantidadeParcelas.value);
    const valorInformadoParcela = converterParaNumero(valorParcela.value);
    const dataInicial = dataPrimeiroPagamento.value;
    const forma = formaPagamento.value;
    const tipoPag = tipoPagamento.value;

    if (produtosVenda.length === 0) {
        alert("Adicione pelo menos um produto antes de gerar parcelas.");
        return;
    }

    if (tipoPag === "") {
        alert("Selecione o tipo de pagamento.");
        tipoPagamento.focus();
        return;
    }

    if (forma === "") {
        alert("Selecione a forma de pagamento.");
        formaPagamento.focus();
        return;
    }

    if (dataInicial === "") {
        alert("Informe a data do primeiro pagamento.");
        dataPrimeiroPagamento.focus();
        return;
    }

    if (qtdParcelas <= 0) {
        alert("Informe a quantidade de parcelas.");
        quantidadeParcelas.focus();
        return;
    }

    if (valorInformadoParcela <= 0) {
        alert("Informe o valor da parcela.");
        valorParcela.focus();
        return;
    }

    const somaParcelas = valorInformadoParcela * qtdParcelas;

    if (Math.abs(somaParcelas - totalVenda) > 0.05) {
        const confirmar = confirm(
            `A soma das parcelas será ${formatarMoeda(somaParcelas)}, mas o total da venda é ${formatarMoeda(totalVenda)}. Deseja continuar mesmo assim?`
        );

        if (!confirmar) {
            return;
        }
    }

    parcelasVenda = [];

    const dataBase = criarDataLocal(dataInicial);

    for (let i = 1; i <= qtdParcelas; i++) {
        const dataPrevista = calcularDataParcela(dataBase, i);

        if (dataPrevista === null) {
            return;
        }

        const parcela = {
            numero: i,
            dataPrevista: dataPrevista,
            valor: valorInformadoParcela,
            status: "Pendente",
            formaPagamento: obterTextoFormaPagamento(forma)
        };

        parcelasVenda.push(parcela);
    }

    renderizarParcelas();
}

function obterTextoFormaPagamento(valor) {
    const formas = {
        "dinheiro": "Dinheiro",
        "pix": "Pix",
        "cartao-debito": "Cartão de débito",
        "cartao-credito": "Cartão de crédito",
        "boleto": "Boleto",
        "promissoria": "Nota promissória",
        "outro": "Outro"
    };

    return formas[valor] || valor;
}

function renderizarParcelas() {
    corpoTabelaParcelas.innerHTML = "";

    if (parcelasVenda.length === 0) {
        corpoTabelaParcelas.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="5">Nenhuma parcela gerada ainda.</td>
            </tr>
        `;
        return;
    }

    parcelasVenda.forEach(parcela => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${parcela.numero}</td>
            <td>${formatarData(parcela.dataPrevista)}</td>
            <td>${formatarMoeda(parcela.valor)}</td>
            <td>${parcela.status}</td>
            <td>${parcela.formaPagamento}</td>
        `;

        corpoTabelaParcelas.appendChild(linha);
    });
}

function montarObjetoVenda() {
    const venda = {
        codigoPromissoria: document.getElementById("codigoPromissoria").value.trim(),
        dataVenda: document.getElementById("dataVenda").value,
        statusVenda: document.getElementById("statusVenda").value,
        tipoVenda: document.getElementById("tipoVenda").value,

        cliente: {
            codigo: document.getElementById("codigoCliente").value.trim(),
            nome: document.getElementById("nomeCliente").value.trim(),
            telefone: document.getElementById("telefoneCliente").value.trim(),
            cpf: document.getElementById("cpfCliente").value.trim()
        },

        vendedor: {
            codigo: document.getElementById("codigoVendedor").value.trim(),
            nome: document.getElementById("nomeVendedor").value.trim()
        },

        observacaoVenda: document.getElementById("observacaoVenda").value.trim(),

        produtos: produtosVenda,

        pagamento: {
            tipoPagamento: tipoPagamento.value,
            formaPagamento: formaPagamento.value,
            dataPrimeiroPagamento: dataPrimeiroPagamento.value,
            tipoVencimento: tipoVencimento.value,
            diaPagamento: diaPagamento.value,
            quantidadeParcelas: quantidadeParcelas.value,
            valorParcela: valorParcela.value,
            intervaloParcelas: intervaloParcelas.value,
            observacaoPagamento: observacaoPagamento.value.trim()
        },

        parcelas: parcelasVenda.map(parcela => {
            return {
                numero: parcela.numero,
                dataPrevista: parcela.dataPrevista.toISOString().split("T")[0],
                valor: parcela.valor,
                status: parcela.status,
                formaPagamento: parcela.formaPagamento
            };
        }),

        resumo: {
            valorProdutos: converterParaNumero(valorProdutos.value),
            desconto: converterParaNumero(descontoVenda.value),
            acrescimo: converterParaNumero(acrescimoVenda.value),
            valorTotal: converterParaNumero(valorTotalVenda.value)
        },

        dataCadastro: new Date().toISOString()
    };

    return venda;
}

function validarVendaAntesDeSalvar() {
    const nomeCliente = document.getElementById("nomeCliente").value.trim();
    const nomeVendedor = document.getElementById("nomeVendedor").value.trim();
    const dataVenda = document.getElementById("dataVenda").value;

    if (dataVenda === "") {
        alert("Informe a data da venda.");
        document.getElementById("dataVenda").focus();
        return false;
    }

    if (nomeCliente === "") {
        alert("Informe o nome do cliente.");
        document.getElementById("nomeCliente").focus();
        return false;
    }

    if (nomeVendedor === "") {
        alert("Informe o nome do vendedor.");
        document.getElementById("nomeVendedor").focus();
        return false;
    }

    if (produtosVenda.length === 0) {
        alert("Adicione pelo menos um produto na venda.");
        return false;
    }

    if (parcelasVenda.length === 0) {
        alert("Gere as parcelas antes de salvar a venda.");
        return false;
    }

    return true;
}

function salvarVenda(event) {
    event.preventDefault();

    if (!validarVendaAntesDeSalvar()) {
        return;
    }

    const venda = montarObjetoVenda();

    const vendasSalvas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendasSalvas.push(venda);

    localStorage.setItem("vendas", JSON.stringify(vendasSalvas));

    console.log("Venda salva:", venda);

    alert("Venda salva com sucesso!");

    limparVendaCompleta();
}

function limparVendaCompleta() {
    formVenda.reset();

    produtosVenda = [];
    parcelasVenda = [];

    renderizarProdutos();
    renderizarParcelas();
    atualizarTotais();
}

function configurarTipoPagamento() {
    if (tipoPagamento.value === "avista") {
        quantidadeParcelas.value = 1;
        intervaloParcelas.value = "30";
        valorParcela.value = converterParaNumero(valorTotalVenda.value).toFixed(2);
    }

    if (tipoPagamento.value === "mensal-fixo") {
        intervaloParcelas.value = "mensal";
        tipoVencimento.value = "data-fixa";
    }
}

btnAdicionarProduto.addEventListener("click", adicionarProduto);
btnGerarParcelas.addEventListener("click", gerarParcelas);
formVenda.addEventListener("submit", salvarVenda);

descontoVenda.addEventListener("input", atualizarTotais);
acrescimoVenda.addEventListener("input", atualizarTotais);
quantidadeParcelas.addEventListener("input", atualizarValorParcelaAutomatico);
tipoPagamento.addEventListener("change", configurarTipoPagamento);

btnCancelarVenda.addEventListener("click", function () {
    const confirmar = confirm("Deseja cancelar esta venda e limpar os dados preenchidos?");

    if (confirmar) {
        limparVendaCompleta();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    document.getElementById("dataVenda").value = `${ano}-${mes}-${dia}`;

    renderizarProdutos();
    renderizarParcelas();
    atualizarTotais();
});