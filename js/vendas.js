let clientes = [];
let vendedores = [];
let produtosDisponiveis = [];
let vendasHistorico = [];

let produtosVenda = [];
let parcelasVenda = [];

const formVenda = document.getElementById("formVenda");

const codigoPromissoria = document.getElementById("codigoPromissoria");
const dataVenda = document.getElementById("dataVenda");

const codigoCliente = document.getElementById("codigoCliente");
const nomeCliente = document.getElementById("nomeCliente");
const codigoVendedor = document.getElementById("codigoVendedor");
const nomeVendedor = document.getElementById("nomeVendedor");

const listaClientes = document.getElementById("listaClientes");
const listaVendedores = document.getElementById("listaVendedores");
const listaProdutos = document.getElementById("listaProdutos");

const codigoProduto = document.getElementById("codigoProduto");
const descricaoProduto = document.getElementById("descricaoProduto");
const quantidadeProduto = document.getElementById("quantidadeProduto");
const valorUnitario = document.getElementById("valorUnitario");
const btnAdicionarProduto = document.getElementById("btnAdicionarProduto");
const corpoTabelaProdutos = document.getElementById("corpoTabelaProdutos");

const tipoPagamento = document.getElementById("tipoPagamento");
const formaPagamento = document.getElementById("formaPagamento");
const dataPrimeiroPagamento = document.getElementById("dataPrimeiroPagamento");
const tipoVencimento = document.getElementById("tipoVencimento");
const valorPagoEntrada = document.getElementById("valorPagoEntrada");
const valorRestante = document.getElementById("valorRestante");
const quantidadeParcelas = document.getElementById("quantidadeParcelas");
const btnGerarParcelas = document.getElementById("btnGerarParcelas");
const areaParcelasPersonalizadas = document.getElementById("areaParcelasPersonalizadas");
const corpoTabelaParcelas = document.getElementById("corpoTabelaParcelas");

const valorProdutos = document.getElementById("valorProdutos");
const valorPagoResumo = document.getElementById("valorPagoResumo");
const valorRestanteResumo = document.getElementById("valorRestanteResumo");
const valorTotalVenda = document.getElementById("valorTotalVenda");
const quantidadeParcelasResumo = document.getElementById("quantidadeParcelasResumo");
const somaParcelasResumo = document.getElementById("somaParcelasResumo");
const statusResumo = document.getElementById("statusResumo");

const btnCancelarVenda = document.getElementById("btnCancelarVenda");
const btnLimparVenda = document.getElementById("btnLimparVenda");

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

function dataHojeFormatoInput() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function criarDataLocal(valorData) {
    const partes = valorData.split("-");
    const ano = Number(partes[0]);
    const mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    return new Date(ano, mes, dia);
}

function formatarDataInput(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

async function carregarDbJson() {
    try {
        const resposta = await fetch("../db.JSON");

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar o db.JSON.");
        }

        const dados = await resposta.json();

        clientes = dados.clientes || [];
        vendedores = dados.vendedor || [];
        produtosDisponiveis = dados.produtos || [];
        vendasHistorico = dados.vendas || [];

        preencherDatalists();
        gerarCodigoPromissoria();

        console.log("Clientes carregados:", clientes);
        console.log("Vendedores carregados:", vendedores);
        console.log("Produtos carregados:", produtosDisponiveis);
        console.log("Vendas carregadas:", vendasHistorico);
    } catch (erro) {
        console.error("Erro ao carregar db.JSON:", erro);
        alert("Não foi possível carregar os dados do db.JSON. Verifique se a página está aberta pelo Live Server.");
    }
}

function preencherDatalists() {
    renderizarListaBusca("cliente", clientes, "");
    renderizarListaBusca("vendedor", vendedores, "");
    renderizarListaBusca("produto", produtosDisponiveis, "");
}

function normalizarTexto(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function renderizarListaBusca(tipo, lista, termoBusca) {
    let container;

    if (tipo === "cliente") {
        container = listaClientes;
    }

    if (tipo === "vendedor") {
        container = listaVendedores;
    }

    if (tipo === "produto") {
        container = listaProdutos;
    }

    if (!container) {
        return;
    }

    container.innerHTML = "";

    const termo = normalizarTexto(termoBusca);

    const resultados = lista.filter(item => {
        const id = normalizarTexto(item.id);
        const nome = normalizarTexto(item.nome);

        return id.includes(termo) || nome.includes(termo);
    });

    if (resultados.length === 0) {
        container.innerHTML = `
            <div class="item-busca">
                Nenhum resultado encontrado
            </div>
        `;
        return;
    }

    resultados.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("item-busca");

        if (tipo === "produto") {
            div.innerHTML = `
                <strong>${item.id}</strong> - ${item.nome}
                <span>${formatarMoeda(converterParaNumero(item.preco))}</span>
            `;
        } else {
            div.innerHTML = `
                <strong>${item.id}</strong> - ${item.nome}
            `;
        }

        div.addEventListener("mousedown", function () {
            selecionarItemBusca(tipo, item);
        });

        container.appendChild(div);
    });
}

function abrirListaBusca(tipo) {
    if (tipo === "cliente") {
        renderizarListaBusca("cliente", clientes, codigoCliente.value);
        listaClientes.style.display = "block";
    }

    if (tipo === "vendedor") {
        renderizarListaBusca("vendedor", vendedores, codigoVendedor.value);
        listaVendedores.style.display = "block";
    }

    if (tipo === "produto") {
        renderizarListaBusca("produto", produtosDisponiveis, codigoProduto.value);
        listaProdutos.style.display = "block";
    }
}

function fecharListasBusca() {
    listaClientes.style.display = "none";
    listaVendedores.style.display = "none";
    listaProdutos.style.display = "none";
}

function selecionarItemBusca(tipo, item) {
    if (tipo === "cliente") {
        codigoCliente.value = item.id;
        nomeCliente.value = item.nome;
        listaClientes.style.display = "none";
    }

    if (tipo === "vendedor") {
        codigoVendedor.value = item.id;
        nomeVendedor.value = item.nome;
        listaVendedores.style.display = "none";
    }

    if (tipo === "produto") {
        codigoProduto.value = item.id;
        descricaoProduto.value = item.nome;
        valorUnitario.value = converterParaNumero(item.preco).toFixed(2);
        listaProdutos.style.display = "none";
    }
}

function selecionarPrimeiroResultado(tipo) {
    let lista;
    let termo;

    if (tipo === "cliente") {
        lista = clientes;
        termo = codigoCliente.value;
    }

    if (tipo === "vendedor") {
        lista = vendedores;
        termo = codigoVendedor.value;
    }

    if (tipo === "produto") {
        lista = produtosDisponiveis;
        termo = codigoProduto.value;
    }

    const termoNormalizado = normalizarTexto(termo);

    const resultado = lista.find(item => {
        const id = normalizarTexto(item.id);
        const nome = normalizarTexto(item.nome);

        return id.includes(termoNormalizado) || nome.includes(termoNormalizado);
    });

    if (resultado) {
        selecionarItemBusca(tipo, resultado);
    }
}

function gerarCodigoPromissoria() {
    let maiorCodigo = 0;

    vendasHistorico.forEach(venda => {
        const codigo = String(venda.codigoPromissoria || venda.id || "0");
        const numero = parseInt(codigo.replace(/\D/g, ""), 10);

        if (!isNaN(numero) && numero > maiorCodigo) {
            maiorCodigo = numero;
        }
    });

    const proximoCodigo = maiorCodigo + 1;
    codigoPromissoria.value = String(proximoCodigo).padStart(4, "0");
}

function buscarClientePorCodigo(codigo) {
    return clientes.find(cliente => String(cliente.id) === String(codigo).trim());
}

function buscarVendedorPorCodigo(codigo) {
    return vendedores.find(vendedor => String(vendedor.id) === String(codigo).trim());
}

function buscarProdutoPorCodigo(codigo) {
    return produtosDisponiveis.find(produto => String(produto.id) === String(codigo).trim());
}

function preencherClientePorCodigo() {
    const cliente = buscarClientePorCodigo(codigoCliente.value);

    if (!cliente) {
        nomeCliente.value = "";
        return;
    }

    codigoCliente.value = cliente.id;
    nomeCliente.value = cliente.nome;
}

function preencherVendedorPorCodigo() {
    const vendedor = buscarVendedorPorCodigo(codigoVendedor.value);

    if (!vendedor) {
        nomeVendedor.value = "";
        return;
    }

    codigoVendedor.value = vendedor.id;
    nomeVendedor.value = vendedor.nome;
}

function preencherProdutoPorCodigo() {
    const produto = buscarProdutoPorCodigo(codigoProduto.value);

    if (!produto) {
        descricaoProduto.value = "";
        valorUnitario.value = "0.00";
        return;
    }

    codigoProduto.value = produto.id;
    descricaoProduto.value = produto.nome;
    valorUnitario.value = converterParaNumero(produto.preco).toFixed(2);
}

function calcularTotalProdutos() {
    return produtosVenda.reduce((total, produto) => {
        return total + produto.subtotal;
    }, 0);
}

function calcularSomaParcelas() {
    return parcelasVenda.reduce((total, parcela) => {
        return total + parcela.valor;
    }, 0);
}

function calcularValorRestante() {
    const total = calcularTotalProdutos();
    const entrada = converterParaNumero(valorPagoEntrada.value);

    let restante = total - entrada;

    if (restante < 0) {
        restante = 0;
    }

    valorRestante.value = restante.toFixed(2);
    return restante;
}

function atualizarResumo() {
    const totalProdutos = calcularTotalProdutos();
    const entrada = converterParaNumero(valorPagoEntrada.value);
    const restante = calcularValorRestante();
    const somaParcelas = calcularSomaParcelas();

    valorProdutos.value = totalProdutos.toFixed(2);
    valorPagoResumo.value = entrada.toFixed(2);
    valorRestanteResumo.value = restante.toFixed(2);
    valorTotalVenda.value = totalProdutos.toFixed(2);
    quantidadeParcelasResumo.value = parcelasVenda.length;
    somaParcelasResumo.value = somaParcelas.toFixed(2);

    if (totalProdutos === 0) {
        statusResumo.value = "Aguardando produtos";
        return;
    }

    if (entrada > totalProdutos) {
        statusResumo.value = "Valor pago hoje maior que o total da venda";
        return;
    }

    if (tipoPagamento.value === "avista") {
        statusResumo.value = entrada === totalProdutos ? "Venda à vista fechada" : "À vista exige pagamento total";
        return;
    }

    if (tipoPagamento.value === "parcelado") {
        if (parcelasVenda.length === 0) {
            statusResumo.value = "Aguardando geração das parcelas";
            return;
        }

        if (Math.abs(somaParcelas - restante) <= 0.05) {
            statusResumo.value = "Parcelas fecham com o valor restante";
        } else {
            statusResumo.value = "Soma das parcelas diferente do valor restante";
        }

        return;
    }

    statusResumo.value = "Aguardando forma de pagamento";
}

function adicionarProduto() {
    const produtoEncontrado = buscarProdutoPorCodigo(codigoProduto.value);
    const quantidade = converterParaNumero(quantidadeProduto.value);
    const valor = converterParaNumero(valorUnitario.value);

    if (!produtoEncontrado) {
        alert("Informe um código de produto válido.");
        codigoProduto.focus();
        return;
    }

    if (quantidade <= 0) {
        alert("Informe uma quantidade válida.");
        quantidadeProduto.focus();
        return;
    }

    if (valor <= 0) {
        alert("O produto selecionado não possui preço válido.");
        return;
    }

    const produto = {
        idTemporario: Date.now(),
        codigo: produtoEncontrado.id,
        nome: produtoEncontrado.nome,
        quantidade: quantidade,
        valorUnitario: valor,
        subtotal: quantidade * valor
    };

    produtosVenda.push(produto);

    limparCamposProduto();
    renderizarProdutos();
    atualizarResumo();
}

function limparCamposProduto() {
    codigoProduto.value = "";
    descricaoProduto.value = "";
    quantidadeProduto.value = 1;
    valorUnitario.value = "0.00";
    codigoProduto.focus();
}

function removerProduto(idTemporario) {
    produtosVenda = produtosVenda.filter(produto => produto.idTemporario !== idTemporario);

    renderizarProdutos();
    atualizarResumo();
}

function renderizarProdutos() {
    corpoTabelaProdutos.innerHTML = "";

    if (produtosVenda.length === 0) {
        corpoTabelaProdutos.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="6">Nenhum produto adicionado ainda.</td>
            </tr>
        `;
        return;
    }

    produtosVenda.forEach(produto => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.valorUnitario)}</td>
            <td>${formatarMoeda(produto.subtotal)}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm"
                    onclick="removerProduto(${produto.idTemporario})">
                    <i class="bi bi-trash"></i>Remover
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
    if (tipoVencimento.value === "quinto-dia-util") {
        let dataReferencia = somarMeses(dataBase, numeroParcela);
        let quintoDiaUtil = obterQuintoDiaUtil(dataReferencia.getFullYear(), dataReferencia.getMonth());

        if (numeroParcela === 0 && quintoDiaUtil < dataBase) {
            dataReferencia = somarMeses(dataBase, 1);
            quintoDiaUtil = obterQuintoDiaUtil(dataReferencia.getFullYear(), dataReferencia.getMonth());
        }

        if (numeroParcela > 0) {
            const primeiraData = calcularDataParcela(dataBase, 0);
            const dataDaParcela = somarMeses(primeiraData, numeroParcela);

            return obterQuintoDiaUtil(dataDaParcela.getFullYear(), dataDaParcela.getMonth());
        }

        return quintoDiaUtil;
    }

    return somarMeses(dataBase, numeroParcela);
}

function controlarPagamento() {
    if (tipoPagamento.value === "avista") {
        quantidadeParcelas.value = 1;
        quantidadeParcelas.disabled = true;
        btnGerarParcelas.disabled = true;
        areaParcelasPersonalizadas.style.display = "none";

        valorPagoEntrada.value = calcularTotalProdutos().toFixed(2);
        parcelasVenda = [];
        renderizarParcelas();
    }

    if (tipoPagamento.value === "parcelado") {
        quantidadeParcelas.disabled = false;
        btnGerarParcelas.disabled = false;
        areaParcelasPersonalizadas.style.display = "block";

        if (converterParaNumero(valorPagoEntrada.value) === calcularTotalProdutos()) {
            valorPagoEntrada.value = "0.00";
        }
    }

    atualizarResumo();
}

function gerarParcelas() {
    const restante = calcularValorRestante();
    const qtdParcelas = converterParaNumero(quantidadeParcelas.value);
    const dataInicial = dataPrimeiroPagamento.value;
    const forma = formaPagamento.value;

    if (produtosVenda.length === 0) {
        alert("Adicione pelo menos um produto antes de gerar parcelas.");
        return;
    }

    if (tipoPagamento.value !== "parcelado") {
        alert("As parcelas só podem ser geradas quando o tipo de pagamento for Parcelado.");
        return;
    }

    if (forma === "") {
        alert("Selecione a forma de pagamento antes de gerar as parcelas.");
        formaPagamento.focus();
        return;
    }

    if (restante <= 0) {
        alert("Não existe valor restante para parcelar.");
        return;
    }

    if (qtdParcelas <= 0) {
        alert("Informe uma quantidade válida de parcelas.");
        quantidadeParcelas.focus();
        return;
    }

    if (dataInicial === "") {
        alert("Informe a data do primeiro pagamento.");
        dataPrimeiroPagamento.focus();
        return;
    }

    parcelasVenda = [];

    const valorBase = restante / qtdParcelas;
    const dataBase = criarDataLocal(dataInicial);

    for (let i = 1; i <= qtdParcelas; i++) {
        const dataParcela = calcularDataParcela(dataBase, i - 1);

        parcelasVenda.push({
            numero: i,
            dataPrevista: formatarDataInput(dataParcela),
            valor: Number(valorBase.toFixed(2)),
            status: "Pendente",
            formaPagamento: formaPagamento.value
        });
    }

    ajustarDiferencaCentavos(restante);
    renderizarParcelas();
    atualizarResumo();
}

function ajustarDiferencaCentavos(totalEsperado) {
    const somaAtual = calcularSomaParcelas();
    const diferenca = Number((totalEsperado - somaAtual).toFixed(2));

    if (parcelasVenda.length > 0) {
        const ultimaParcela = parcelasVenda[parcelasVenda.length - 1];
        ultimaParcela.valor = Number((ultimaParcela.valor + diferenca).toFixed(2));
    }
}

function renderizarParcelas() {
    corpoTabelaParcelas.innerHTML = "";

    if (parcelasVenda.length === 0) {
        corpoTabelaParcelas.innerHTML = `
            <tr class="linha-vazia">
                <td colspan="6">Nenhuma parcela gerada ainda.</td>
            </tr>
        `;
        return;
    }

    parcelasVenda.forEach(parcela => {
        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${parcela.numero}</td>
            <td>
                <input type="date" class="form-control input-data-parcela" data-numero="${parcela.numero}" value="${parcela.dataPrevista}">
            </td>
            <td>
                <input type="number" class="form-control input-valor-parcela" data-numero="${parcela.numero}" min="0" step="0.01" value="${parcela.valor.toFixed(2)}">
            </td>
            <td>${parcela.status}</td>
            <td>${obterTextoFormaPagamento(parcela.formaPagamento)}</td>
            <td>
                <button type="button" class="btn btn-danger btn-sm"
                    onclick="removerParcela(${parcela.numero})">
                    <i class="bi bi-trash"></i>Remover
                </button>
            </td>
        `;

        corpoTabelaParcelas.appendChild(linha);
    });

    document.querySelectorAll(".input-data-parcela").forEach(input => {
        input.addEventListener("input", atualizarParcelasPelaTabela);
    });

    document.querySelectorAll(".input-valor-parcela").forEach(input => {
        input.addEventListener("change", atualizarParcelasPelaTabela);
    });
}

function atualizarParcelasPelaTabela(event) {
    document.querySelectorAll(".input-data-parcela").forEach(input => {
        const numero = Number(input.dataset.numero);
        const parcela = parcelasVenda.find(item => item.numero === numero);

        if (parcela) {
            parcela.dataPrevista = input.value;
        }
    });

    if (event && event.target.classList.contains("input-valor-parcela")) {
        const numeroParcelaAlterada = Number(event.target.dataset.numero);
        const novoValor = converterParaNumero(event.target.value);

        const parcelaAlterada = parcelasVenda.find(parcela => parcela.numero === numeroParcelaAlterada);

        if (parcelaAlterada) {
            parcelaAlterada.valor = novoValor;
            redistribuirParcelasRestantes(numeroParcelaAlterada);
            renderizarParcelas();
            atualizarResumo();
            return;
        }
    }

    document.querySelectorAll(".input-valor-parcela").forEach(input => {
        const numero = Number(input.dataset.numero);
        const parcela = parcelasVenda.find(item => item.numero === numero);

        if (parcela) {
            parcela.valor = converterParaNumero(input.value);
        }
    });

    atualizarResumo();
}

function redistribuirParcelasRestantes(numeroParcelaAlterada) {
    const valorRestanteTotal = calcularValorRestante();

    const parcelasJaDefinidas = parcelasVenda.filter(parcela => {
        return parcela.numero <= numeroParcelaAlterada;
    });

    const parcelasParaRecalcular = parcelasVenda.filter(parcela => {
        return parcela.numero > numeroParcelaAlterada;
    });

    const somaParcelasJaDefinidas = parcelasJaDefinidas.reduce((total, parcela) => {
        return total + parcela.valor;
    }, 0);

    let saldoParaDistribuir = valorRestanteTotal - somaParcelasJaDefinidas;

    if (saldoParaDistribuir < 0) {
        saldoParaDistribuir = 0;
    }

    if (parcelasParaRecalcular.length === 0) {
        return;
    }

    const valorBase = saldoParaDistribuir / parcelasParaRecalcular.length;

    parcelasParaRecalcular.forEach(parcela => {
        parcela.valor = Number(valorBase.toFixed(2));
    });

    const somaDepoisDaDistribuicao = parcelasParaRecalcular.reduce((total, parcela) => {
        return total + parcela.valor;
    }, 0);

    const diferencaCentavos = Number((saldoParaDistribuir - somaDepoisDaDistribuicao).toFixed(2));

    const ultimaParcela = parcelasParaRecalcular[parcelasParaRecalcular.length - 1];
    ultimaParcela.valor = Number((ultimaParcela.valor + diferencaCentavos).toFixed(2));
}

function removerParcela(numero) {
    parcelasVenda = parcelasVenda.filter(parcela => parcela.numero !== numero);

    parcelasVenda = parcelasVenda.map((parcela, index) => {
        return {
            ...parcela,
            numero: index + 1
        };
    });

    renderizarParcelas();
    atualizarResumo();
}

function obterTextoFormaPagamento(valor) {
    const formas = {
        dinheiro: "Dinheiro",
        pix: "Pix",
        debito: "Débito",
        credito: "Crédito"
    };

    return formas[valor] || valor;
}

function validarVendaAntesDeSalvar() {
    const cliente = buscarClientePorCodigo(codigoCliente.value);
    const vendedor = buscarVendedorPorCodigo(codigoVendedor.value);

    if (dataVenda.value === "") {
        alert("Informe a data da venda.");
        dataVenda.focus();
        return false;
    }

    if (!cliente) {
        alert("Informe um código de cliente válido.");
        codigoCliente.focus();
        return false;
    }

    if (!vendedor) {
        alert("Informe um código de vendedor válido.");
        codigoVendedor.focus();
        return false;
    }

    if (produtosVenda.length === 0) {
        alert("Adicione pelo menos um produto na venda.");
        return false;
    }

    if (tipoPagamento.value === "") {
        alert("Selecione o tipo de pagamento.");
        tipoPagamento.focus();
        return false;
    }

    if (formaPagamento.value === "") {
        alert("Selecione a forma de pagamento.");
        formaPagamento.focus();
        return false;
    }

    const total = calcularTotalProdutos();
    const entrada = converterParaNumero(valorPagoEntrada.value);
    const restante = calcularValorRestante();

    if (entrada > total) {
        alert("O valor pago hoje não pode ser maior que o total da venda.");
        valorPagoEntrada.focus();
        return false;
    }

    if (tipoPagamento.value === "avista") {
        if (entrada !== total) {
            alert("Para pagamento à vista, o valor pago hoje precisa ser igual ao total da venda.");
            valorPagoEntrada.focus();
            return false;
        }
    }

    if (tipoPagamento.value === "parcelado") {
        if (parcelasVenda.length === 0) {
            alert("Gere as parcelas antes de salvar uma venda parcelada.");
            return false;
        }

        atualizarParcelasPelaTabela();

        const somaParcelas = calcularSomaParcelas();

        if (Math.abs(somaParcelas - restante) > 0.05) {
            alert(`A soma das parcelas precisa fechar com o valor restante. Restante: ${formatarMoeda(restante)}. Soma das parcelas: ${formatarMoeda(somaParcelas)}.`);
            return false;
        }
    }

    return true;
}

function montarObjetoVenda() {
    const cliente = buscarClientePorCodigo(codigoCliente.value);
    const vendedor = buscarVendedorPorCodigo(codigoVendedor.value);

    const total = calcularTotalProdutos();
    const entrada = converterParaNumero(valorPagoEntrada.value);
    const restante = calcularValorRestante();

    let parcelas = [];

    if (tipoPagamento.value === "avista") {
        parcelas = [
            {
                numero: 1,
                dataPrevista: dataPrimeiroPagamento.value,
                valor: total,
                status: "Pago",
                formaPagamento: formaPagamento.value
            }
        ];
    } else {
        parcelas = parcelasVenda.map(parcela => {
            return {
                numero: parcela.numero,
                dataPrevista: parcela.dataPrevista,
                valor: parcela.valor,
                status: parcela.status,
                formaPagamento: parcela.formaPagamento
            };
        });
    }

    return {
        codigoPromissoria: codigoPromissoria.value,
        dataVenda: dataVenda.value,

        idVendedor: vendedor.id,
        nomeVendedor: vendedor.nome,
        idCliente: cliente.id,
        cliente: cliente.nome,
        produto: produtosVenda.map(produto => produto.nome).join(", "),
        parcelas: parcelas.length,
        valorTotal: total,

        clienteCompleto: {
            id: cliente.id,
            nome: cliente.nome,
            cpf: cliente.cpf || "",
            celular: cliente.celular || ""
        },

        vendedor: {
            id: vendedor.id,
            nome: vendedor.nome
        },

        produtos: produtosVenda.map(produto => {
            return {
                codigo: produto.codigo,
                nome: produto.nome,
                quantidade: produto.quantidade,
                valorUnitario: produto.valorUnitario,
                subtotal: produto.subtotal
            };
        }),

        pagamento: {
            tipoPagamento: tipoPagamento.value,
            formaPagamento: formaPagamento.value,
            dataPrimeiroPagamento: dataPrimeiroPagamento.value,
            tipoVencimento: tipoVencimento.value,
            valorPagoHoje: entrada,
            valorRestante: restante
        },

        parcelasDetalhadas: parcelas,

        resumo: {
            valorProdutos: total,
            valorPagoHoje: entrada,
            valorRestante: restante,
            valorTotal: total,
            quantidadeParcelas: parcelas.length,
            somaParcelas: parcelas.reduce((totalParcelas, parcela) => totalParcelas + parcela.valor, 0)
        },

        dataCadastro: new Date().toISOString()
    };
}

async function salvarVenda(event) {
    event.preventDefault();

    if (!validarVendaAntesDeSalvar()) {
        return;
    }

    const venda = montarObjetoVenda();

    try {
        const resposta = await fetch("http://localhost:3000/vendas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(venda)
        });

        if (!resposta.ok) {
            throw new Error("Erro ao salvar venda.");
        }

        const vendaSalva = await resposta.json();

        console.log("Venda salva no db.JSON:", vendaSalva);

        alert("Venda salva com sucesso!");

        vendasHistorico.push(vendaSalva);

        limparVendaCompleta();
    } catch (erro) {
        console.error("Erro ao salvar venda:", erro);
        alert("Não foi possível salvar a venda. Verifique se o JSON Server estão rodando corretamente.");
    }
}

function limparVendaCompleta() {
    formVenda.reset();

    produtosVenda = [];
    parcelasVenda = [];

    dataVenda.value = dataHojeFormatoInput();
    dataPrimeiroPagamento.value = dataHojeFormatoInput();

    gerarCodigoPromissoria();

    quantidadeParcelas.disabled = false;
    btnGerarParcelas.disabled = false;
    areaParcelasPersonalizadas.style.display = "block";

    renderizarProdutos();
    renderizarParcelas();
    atualizarResumo();
}

codigoCliente.addEventListener("focus", function () {
    abrirListaBusca("cliente");
});

codigoCliente.addEventListener("input", function () {
    renderizarListaBusca("cliente", clientes, codigoCliente.value);
    listaClientes.style.display = "block";
    preencherClientePorCodigo();
});

codigoCliente.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        selecionarPrimeiroResultado("cliente");
    }
});

codigoVendedor.addEventListener("focus", function () {
    abrirListaBusca("vendedor");
});

codigoVendedor.addEventListener("input", function () {
    renderizarListaBusca("vendedor", vendedores, codigoVendedor.value);
    listaVendedores.style.display = "block";
    preencherVendedorPorCodigo();
});

codigoVendedor.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        selecionarPrimeiroResultado("vendedor");
    }
});

codigoProduto.addEventListener("focus", function () {
    abrirListaBusca("produto");
});

codigoProduto.addEventListener("input", function () {
    renderizarListaBusca("produto", produtosDisponiveis, codigoProduto.value);
    listaProdutos.style.display = "block";
    preencherProdutoPorCodigo();
});

codigoProduto.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        selecionarPrimeiroResultado("produto");
    }
});

document.addEventListener("click", function (event) {
    if (!event.target.closest(".campo-busca")) {
        fecharListasBusca();
    }
});

btnAdicionarProduto.addEventListener("click", adicionarProduto);
btnGerarParcelas.addEventListener("click", gerarParcelas);

tipoPagamento.addEventListener("change", controlarPagamento);
valorPagoEntrada.addEventListener("input", atualizarResumo);
formaPagamento.addEventListener("change", renderizarParcelas);
quantidadeParcelas.addEventListener("input", atualizarResumo);

formVenda.addEventListener("submit", salvarVenda);

btnLimparVenda.addEventListener("click", function () {
    setTimeout(limparVendaCompleta, 0);
});

btnCancelarVenda.addEventListener("click", function () {
    const confirmar = confirm("Deseja cancelar esta venda e limpar os dados preenchidos?");

    if (confirmar) {
        limparVendaCompleta();
    }
});

document.addEventListener("DOMContentLoaded", async function () {
    dataVenda.value = dataHojeFormatoInput();
    dataPrimeiroPagamento.value = dataHojeFormatoInput();

    await carregarDbJson();

    renderizarProdutos();
    renderizarParcelas();
    atualizarResumo();
});