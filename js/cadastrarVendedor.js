document.addEventListener('DOMContentLoaded', () => {
    const form =
        document.getElementById('formVendedor');

    const titulo =
        document.getElementById('tituloTela');

    const listaProdutos =
        document.getElementById('listaProdutos');

    const pesquisaProduto =
        document.getElementById('pesquisaProduto');

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

            titulo.innerHTML = `

                <i class="fa-solid fa-pen"></i>

                Alterar Vendedor

            `;

            await carregarModoEdicao();
        }
    }

    /* ---------- PRODUTOS ---------- */
    async function carregarProdutos() {
        try {
            /*
            FUTURO BACKEND:

            fetch('/api/produtos')
            */

            produtosCache = [

                {
                    codigo: '1001',
                    nome: 'Camiseta Básica'
                },

                {
                    codigo: '1002',
                    nome: 'Camisa Polo Premium'
                },

                {
                    codigo: '1004',
                    nome: 'Slim Fit'
                },

                {
                    codigo: '1007',
                    nome: 'Manga Curta'
                }

            ];

            renderizarProdutos(
                produtosCache
            );

        }

        catch (error) {
            console.error(error);
        }

    }

    function renderizarProdutos(lista) {

        listaProdutos.innerHTML =
            lista.map(produto => `

            <div class="form-check">

                <input
                    class="form-check-input produtoCheck"
                    type="checkbox"
                    value="${produto.codigo}">

                <label class="form-check-label">

                    ${produto.codigo}
                    —
                    ${produto.nome}

                </label>

            </div>

        `).join('');

    }

    pesquisaProduto.addEventListener(
        'input',
        () => {
            const selecionados = [

                ...document.querySelectorAll(
                    '.produtoCheck:checked'
                )

            ].map(p => p.value);

            const termo =
                pesquisaProduto
                    .value
                    .toLowerCase();

            const filtrados =
                produtosCache.filter(p => {

                    return (

                        p.nome
                            .toLowerCase()
                            .includes(termo)

                        ||

                        p.codigo
                            .includes(termo)

                    );

                });

            renderizarProdutos(
                filtrados
            );

            marcarProdutos(
                selecionados
            );

        }
    );

    form.addEventListener(
        'reset',
        () => {

            setTimeout(() => {

                renderizarProdutos(
                    produtosCache
                );

            }, 0);

        });

    /* ---------- EDIÇÃO ---------- */
    async function carregarModoEdicao() {

        try {

            /*
            FUTURO:


            fetch(`/api/vendedor/${id}`)
            */

            const vendedor = {

                codigo: '001',

                nome: 'Ricardo Alves',

                status: 'ATIVO',

                produtos: [

                    '1001',
                    '1004'

                ]

            };

            preencherFormulario(
                vendedor
            );

        }

        catch (error) {
            console.error(error);

        }

    }

    function preencherFormulario(
        vendedor

    ) {

        document
            .getElementById('codigo')
            .value =
            vendedor.codigo;

        document
            .getElementById('nome')
            .value =
            vendedor.nome;

        document
            .getElementById('status')
            .value =
            vendedor.status;

        marcarProdutos(
            vendedor.produtos
        );

    }

    function marcarProdutos(

        produtos

    ) {

        const checks =
            document.querySelectorAll(
                '.produtoCheck'
            );

        checks.forEach(check => {

            if (

                produtos.includes(
                    check.value
                )

            ) {

                check.checked = true;

            }

        });
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

        const produtosSelecionados = [

            ...document.querySelectorAll(
                '.produtoCheck:checked'
            )

        ].map(

            p => p.value

        );

        const payload = {

            codigo:
                document
                    .getElementById('codigo')
                    .value
                    .trim(),

            nome:
                document
                    .getElementById('nome')
                    .value
                    .trim(),

            status:

                document
                    .getElementById('status')
                    .value,

            produtos:

                produtosSelecionados

        };

        try {

            if (id) {

                /*
                FUTURO UPDATE
                */

                console.log(

                    'UPDATE',

                    payload

                );

            }

            else {

                /*
                FUTURO INSERT
                */

                console.log(

                    'INSERT',

                    payload

                );

            }

            alert(
                'Vendedor salvo.'
            );
        }

        catch (error) {
            console.error(error);
        }
    }

    const btnAlterar =
        document.getElementById(
            'btnAlterar'
        );

    if (btnAlterar) {

        btnAlterar.addEventListener(

            'click',

            () => {

                const codigo = '001';

                window.location.href =
                    `cadastrarVendedor.html?id=${codigo}`;

            }

        );

    }

    const btnExcluir =
        document.getElementById(
            'btnExcluir'
        );

    if (btnExcluir) {

        btnExcluir.addEventListener(

            'click',

            () => {

                const confirmar =

                    confirm(
                        'Marcar vendedor como INATIVO?'
                    );

                if (!confirmar) return;

                alert(
                    'Vendedor alterado para INATIVO.'
                );

            }

        );

    }
});