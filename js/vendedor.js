document.addEventListener('DOMContentLoaded', () => {

    const API_VENDEDOR =
        'http://localhost:3000/vendedor';

    const API_VENDAS =
        'http://localhost:3000/vendas';

    const API_PRODUTOS =
        'http://localhost:3000/produtos';

    const btnBuscar =
        document.getElementById(
            'btnBuscar'
        );

    const btnVendas =
        document.getElementById(
            'btnVendas'
        );

    const infoVendedor =
        document.getElementById(
            'infoVendedor'
        );

    const infoCodigo =
        document.getElementById(
            'infoCodigo'
        );

    const infoNome =
        document.getElementById(
            'infoNome'
        );

    const infoStatus =
        document.getElementById(
            'infoStatus'
        );

    const listaProdutosVendedor =
        document.getElementById(
            'listaProdutosVendedor'
        );

    const secaoProdutos =
        document.getElementById(
            'secaoProdutos'
        );

    const dashboard =
        document.getElementById(
            'dashboardVendas'
        );

    const campoCodigo =
        document.getElementById(
            'codigoBusca'
        );

    const campoNome =
        document.getElementById(
            'nomeBusca'
        );

    const btnLimparBusca =
        document.getElementById(
            'btnLimparBusca'
        );

    const kpiTotalVendas =
        document.getElementById(
            'kpiTotalVendas'
        );

    const kpiFaturamento =
        document.getElementById(
            'kpiFaturamento'
        );

    const kpiProdutosAtivos =
        document.getElementById(
            'kpiProdutosAtivos'
        );

    let dashboardAberto = false;

    let grafico = null;

    let vendedorAtual = null;

    btnBuscar.addEventListener(
        'click',
        buscarVendedor
    );

    btnVendas.addEventListener(
        'click',
        alternarDashboard
    );

    function atualizarBotaoLimpar() {

        btnLimparBusca.style.display =

            campoNome.value.trim() ||
                campoCodigo.value.trim()

                ? 'block'
                : 'none';

    }

    campoNome.addEventListener(
        'input',
        atualizarBotaoLimpar
    );

    campoCodigo.addEventListener(
        'input',
        atualizarBotaoLimpar
    );

    btnLimparBusca.addEventListener(

        'click',

        () => {

            campoNome.value = '';

            campoCodigo.value = '';

            btnLimparBusca.style.display = 'none';

            infoVendedor.style.display = 'none';

            dashboard.style.display = 'none';

            vendedorAtual = null;

            campoNome.focus();

        }

    );

    async function buscarVendedor() {

        const codigo =
            campoCodigo.value.trim();

        const nome =
            campoNome.value.trim();

        if (!codigo && !nome) {

            alert(
                'Informe código ou nome.'
            );

            return;
        }

        try {

            btnBuscar.disabled = true;

            btnBuscar.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Buscando...
            `;

            const resposta =
                await fetch(
                    API_VENDEDOR
                );

            const vendedores =
                await resposta.json();

            await new Promise(

                resolve =>

                    setTimeout(
                        resolve,
                        900
                    )

            );

            vendedorAtual =
                vendedores.find(v => {

                    const codigoValido =

                        !codigo ||

                        v.codigo === codigo;

                    const nomeValido =

                        !nome ||

                        v.nome
                            .toLowerCase()
                            .includes(
                                nome.toLowerCase()
                            );

                    return (

                        codigoValido &&
                        nomeValido

                    );

                });

            if (!vendedorAtual) {

                if (codigo && !nome) {

                    alert(
                        'Código inválido.'
                    );

                }

                else if (!codigo && nome) {

                    alert(
                        'Vendedor não encontrado.'
                    );

                }

                else {

                    alert(
                        'Informações não encontradas.'
                    );

                }

                return;

            }

            campoCodigo.value =
                vendedorAtual.codigo;

            campoNome.value =
                vendedorAtual.nome;

            infoCodigo.textContent =
                vendedorAtual.codigo;

            infoNome.textContent =
                vendedorAtual.nome;

            infoStatus.textContent =
                vendedorAtual.status;

            if (
                vendedorAtual.status ===
                'INATIVO'
            ) {

                secaoProdutos.style.display =
                    'none';

                btnVendas.style.display =
                    'none';

            }

            else {

                secaoProdutos.style.display =
                    'block';

                btnVendas.style.display =
                    'inline-block';
            }

            await carregarProdutosResponsaveis();

            infoVendedor.style.display =
                'block';

            dashboard.style.display =
                'none';

            dashboardAberto = false;
        }

        catch (error) {

            console.error(error);

        }

        finally {

            btnBuscar.disabled = false;

            btnBuscar.innerHTML = `
                <i class="fa-solid fa-magnifying-glass"></i>
            `;

        }

    }

    async function carregarProdutosResponsaveis() {

        try {

            const resposta =
                await fetch(
                    API_PRODUTOS
                );

            const produtos =
                await resposta.json();

            listaProdutosVendedor.innerHTML =
                '';

            (vendedorAtual.produtosResponsaveis || [])
                .forEach(idProduto => {

                    console.log(idProduto);

                    const produto =
                        produtos.find(

                            p =>
                                String(p.id) === String(idProduto)

                        );

                    console.log(produto);

                    if (produto) {

                        listaProdutosVendedor
                            .innerHTML +=

                            `
                            <li class="produto-item">
                                <span>
                                    ${produto.id} — ${produto.nome}
                                </span>

                                <span class="badge bg-success">
                                    Estoque: ${produto.estoque}
                                </span>
                            </li>
                        `;

                    }

                });

        }

        catch (error) {

            console.error(error);

        }

    }

    async function alternarDashboard() {

        if (!vendedorAtual)
            return;

        dashboardAberto =
            !dashboardAberto;

        if (dashboardAberto) {

            dashboard.style.display =
                'block';

            dashboard.scrollIntoView({

                behavior: 'smooth'

            });

            await carregarGrafico();

        }

        else {

            dashboard.style.display =
                'none';

        }

    }

    async function carregarGrafico() {

        try {

            const resposta =
                await fetch(
                    API_VENDAS
                );

            const vendas =
                await resposta.json();

            const vendasVendedor =

                vendas.filter(

                    venda =>

                        venda.idVendedor ===
                        vendedorAtual.id

                );

            let totalVendas =
                vendasVendedor.length;

            let faturamento = 0;

            const produtos = {};

            vendasVendedor.forEach(

                venda => {

                    faturamento +=
                        venda.valorTotal;

                    venda.produtos
                        .forEach(

                            produto => {

                                if (

                                    !produtos[
                                    produto.nome
                                    ]

                                ) {

                                    produtos[
                                        produto.nome
                                    ] = 0;

                                }

                                produtos[
                                    produto.nome
                                ] +=

                                    produto
                                        .quantidade;

                            }

                        );

                }

            );

            kpiTotalVendas.textContent =
                totalVendas;

            kpiFaturamento.textContent =
                `R$ ${faturamento.toFixed(2)}`;

            kpiProdutosAtivos.textContent =

                Object.keys(
                    produtos
                ).length;

            construirGrafico(

                Object.entries(
                    produtos
                ).map(

                    ([nome, vendas]) => ({

                        nome,
                        vendas

                    })

                )

            );

        }

        catch (error) {

            console.error(error);

        }

    }

    function construirGrafico(
        produtos
    ) {

        const labels =
            produtos.map(
                p => p.nome
            );

        const valores =
            produtos.map(
                p => p.vendas
            );

        const ctx =
            document.getElementById(
                'graficoVendas'
            );

        if (grafico) {

            grafico.destroy();

        }

        grafico =
            new Chart(

                ctx,

                {

                    type: 'bar',

                    data: {

                        labels,

                        datasets: [

                            {

                                label:
                                    'Produtos vendidos',

                                data:
                                    valores,

                                backgroundColor:
                                    'rgba(25,135,84,.70)',

                                borderColor:
                                    '#198754',

                                borderWidth: 2

                            }

                        ]

                    },

                    options: {

                        responsive: true

                    }

                }

            );

    }

    document
        .getElementById(
            'btnAlterar'
        )
        .addEventListener(

            'click',

            () => {

                if (!vendedorAtual)
                    return;

                window.location.href =

                    `cadastrarVendedor.html?id=${vendedorAtual.id}`;

            }

        );

    document
        .getElementById(
            'btnExcluir'
        )
        .addEventListener(

            'click',

            excluirVendedor

        );

    async function excluirVendedor() {

        if (!vendedorAtual)
            return;

        const confirmar =

            confirm(
                'Marcar vendedor como INATIVO?'
            );

        if (!confirmar)
            return;

        vendedorAtual.status =
            'INATIVO';

        try {

            await fetch(

                `${API_VENDEDOR}/${vendedorAtual.id}`,

                {

                    method: 'PUT',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body: JSON.stringify(
                        vendedorAtual
                    )

                }

            );

            infoStatus.textContent =
                'INATIVO';

            secaoProdutos.style.display =
                'none';

            btnVendas.style.display = 'none';

            alert(
                'Vendedor atualizado.'
            );

        }

        catch (error) {

            console.error(error);

        }

    }

});