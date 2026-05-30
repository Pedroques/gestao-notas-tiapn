document.addEventListener('DOMContentLoaded', () => {

    const API_VENDEDOR =
        'http://localhost:3000/vendedor';

    const API_PRODUTOS =
        'http://localhost:3000/produtos';

    const form =
        document.getElementById(
            'formVendedor'
        );

    const titulo =
        document.getElementById(
            'tituloTela'
        );

    const listaProdutos =
        document.getElementById(
            'listaProdutos'
        );

    const pesquisaProduto =
        document.getElementById(
            'pesquisaProduto'
        );

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get('id');

    let produtosCache = [];

    inicializar();

    async function inicializar() {

        await carregarProdutos();

        if (id) {

            titulo.textContent =
                'Alterar Vendedor';

            await carregarModoEdicao();

        }

    }

    /* ---------- PRODUTOS ---------- */

    async function carregarProdutos() {

        try {

            const resposta =
                await fetch(
                    API_PRODUTOS
                );

            produtosCache =
                await resposta.json();

            renderizarProdutos(
                produtosCache
            );

        }

        catch (error) {

            console.error(error);

            alert(
                'Erro ao carregar produtos.'
            );

        }

    }

    function renderizarProdutos(
        lista
    ) {

        listaProdutos.innerHTML =

            lista.map(produto => `

            <div class="form-check">

                <input
                    class="form-check-input produtoCheck"
                    type="checkbox"
                    value="${produto.id}">

                <label class="form-check-label">

                    ${produto.id}
                    —
                    ${produto.nome}

                </label>

            </div>

        `).join('');

    }

    /* ---------- PESQUISA ---------- */

    pesquisaProduto.addEventListener(
        'input',

        () => {

            const selecionados = [

                ...document.querySelectorAll(
                    '.produtoCheck:checked'
                )

            ].map(
                p => p.value
            );

            const termo =

                pesquisaProduto
                    .value
                    .toLowerCase();

            const filtrados =

                produtosCache.filter(

                    produto =>

                        produto.nome
                            .toLowerCase()
                            .includes(termo)

                        ||

                        produto.id
                            .includes(termo)

                );

            renderizarProdutos(
                filtrados
            );

            marcarProdutos(
                selecionados
            );

        }

    );

    /* ---------- RESET ---------- */

    form.addEventListener(
        'reset',

        () => {

            setTimeout(() => {

                pesquisaProduto.value =
                    '';

                renderizarProdutos(
                    produtosCache
                );

            }, 0);

        }

    );

    /* ---------- EDIÇÃO ---------- */

    async function carregarModoEdicao() {

        try {

            const resposta =

                await fetch(

                    `${API_VENDEDOR}/${id}`

                );

            const vendedor =

                await resposta.json();

            preencherFormulario(
                vendedor
            );

        }

        catch (error) {

            console.error(error);

            alert(
                'Erro ao carregar vendedor.'
            );

        }

    }

    function preencherFormulario(
        vendedor
    ) {

        document
            .getElementById(
                'codigo'
            ).value =
            vendedor.codigo;

        document
            .getElementById(
                'nome'
            ).value =
            vendedor.nome;

        document
            .getElementById(
                'status'
            ).value =
            vendedor.status;

        marcarProdutos(

            vendedor
                .produtosResponsaveis || []

        );

    }

    function marcarProdutos(
        produtos = []
    ) {

        const checks =

            document.querySelectorAll(
                '.produtoCheck'
            );

        checks.forEach(

            check => {

                check.checked =

                    produtos.includes(
                        check.value
                    );

            }

        );

    }

    /* ---------- SUBMIT ---------- */

    form.addEventListener(
        'submit',
        salvarVendedor
    );

    async function salvarVendedor(
        event
    ) {

        event.preventDefault();

        try {

            const produtosSelecionados = [

                ...document.querySelectorAll(
                    '.produtoCheck:checked'
                )

            ].map(

                produto =>
                    produto.value

            );

            const codigoDigitado =

                document
                    .getElementById(
                        'codigo'
                    )
                    .value
                    .trim();

            const nomeDigitado =

                document
                    .getElementById(
                        'nome'
                    )
                    .value
                    .trim();

            const resposta =
                await fetch(
                    API_VENDEDOR
                );

            const vendedores =
                await resposta.json();

            const codigoExistente =

                vendedores.find(

                    vendedor =>

                        vendedor.codigo ===
                        codigoDigitado

                        &&

                        vendedor.id !== id

                );

            if (codigoExistente) {

                alert(

                    `Não foi possível salvar.\n\n` +

                    `O código "${codigoDigitado}" ` +

                    `já pertence ao vendedor ` +

                    `"${codigoExistente.nome}".`

                );

                return;

            }

            const payload = {

                codigo:
                    codigoDigitado,

                nome:
                    nomeDigitado,

                status:

                    document
                        .getElementById(
                            'status'
                        )
                        .value,

                produtosResponsaveis:

                    produtosSelecionados

            };

            if (id) {

                await fetch(

                    `${API_VENDEDOR}/${id}`,

                    {

                        method: 'PUT',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                            id,

                            ...payload

                        })

                    }

                );

            }

            else {

                await fetch(

                    API_VENDEDOR,

                    {

                        method: 'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body: JSON.stringify({

                            id:
                                Date.now()
                                    .toString(),

                            ...payload

                        })

                    }

                );

            }

            alert(

                id

                    ? 'Vendedor atualizado com sucesso.'

                    : 'Vendedor cadastrado com sucesso.'

            );

            window.location.href =
                '../html/vendedor.html';

        }

        catch (error) {

            console.error(error);

            alert(
                'Erro ao salvar vendedor.'
            );

        }

    }

});