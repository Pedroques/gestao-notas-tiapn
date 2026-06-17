const codigo = document.getElementById("codigo");
const nome = document.getElementById("nome");
const valorCompra = document.getElementById("valorCompra");
const valorVenda = document.getElementById("valorVenda");
const codigoVendedor = document.getElementById("codigoVendedor");
const estoque = document.getElementById("estoque");

const btnCriar = document.getElementById("btn-criar");
const btnSalvar = document.getElementById("btn-salvar");
const btnEditar = document.getElementById("btn-editar");
const btnBuscar = document.getElementById("btn-buscar");
const btnCancelar = document.getElementById("btn-cancelar");
const btnRemover = document.getElementById("btn-remover");

const API_URL = "http://localhost:3000/produtos";

let produtoEditando = null;

async function gerarCodigo() {
    const produtos = await obterProdutos();

    if (produtos.length === 0) {
        return "0001";
    }

    const maiorCodigo = Math.max(
        ...produtos.map(produto =>
            parseInt(produto.codigo || produto.id)
        )
    );

    return String(maiorCodigo + 1).padStart(4, "0");
}

function limparFormulario() {
    codigo.value = "";
    nome.value = "";
    valorCompra.value = "";
    valorVenda.value = "";
    codigoVendedor.value = "";
    estoque.value = 0;

    produtoEditando = null;
}

async function obterProdutos() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Erro ao buscar produtos");
    }

    return await response.json();
}

async function criarProduto(produto) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(produto)
    });

    if (!response.ok) {
        throw new Error("Erro ao salvar produto");
    }

    return await response.json();
}

async function atualizarProduto(id, produto) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(produto)
    });

    if (!response.ok) {
        throw new Error("Erro ao atualizar produto");
    }
}

async function excluirProduto(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE"
    });

    if (!response.ok) {
        throw new Error("Erro ao excluir produto");
    }
}

btnCriar.addEventListener("click", async () => {
    limparFormulario();

    try {
        codigo.value = await gerarCodigo();
    } catch (erro) {
        console.error(erro);
        alert("Erro ao gerar código do produto.");
    }
});

btnSalvar.addEventListener("click", async () => {

    if (
        nome.value.trim() === "" ||
        valorCompra.value.trim() === "" ||
        valorVenda.value.trim() === ""
    ) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    const produto = {
        id: codigo.value,
        codigo: codigo.value,
        nome: nome.value,
        valorCompra: valorCompra.value,
        valorVenda: valorVenda.value,
        codigoVendedor: codigoVendedor.value,
        estoque: Number(estoque.value)
    };

    try {

        if (produtoEditando) {

            await atualizarProduto(produto.id, produto);

            alert("Produto atualizado com sucesso!");

        } else {

            await criarProduto(produto);

            alert("Produto salvo com sucesso!");
        }

        limparFormulario();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao salvar produto.");
    }
});

btnBuscar.addEventListener("click", async () => {

    try {

        const produtos = await obterProdutos();

        const tbody = document.getElementById("produtos-tbody");

        tbody.innerHTML = "";

        produtos.forEach((produto) => {

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${produto.codigo || produto.id}</td>
                <td>${produto.nome}</td>
                <td>Produto</td>
                <td>${produto.valorVenda}</td>
                <td>${produto.estoque}</td>
            `;

            tr.style.cursor = "pointer";

            tr.addEventListener("click", () => {

                codigo.value = produto.codigo || produto.id;
                nome.value = produto.nome;
                valorCompra.value = produto.valorCompra;
                valorVenda.value = produto.valorVenda;
                codigoVendedor.value = produto.codigoVendedor;
                estoque.value = produto.estoque;

                produtoEditando = produto.id;

                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("modalBuscarProduto")
                );

                if (modal) {
                    modal.hide();
                }
            });

            tbody.appendChild(tr);
        });

        const modal = new bootstrap.Modal(
            document.getElementById("modalBuscarProduto")
        );

        modal.show();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao buscar produtos.");
    }
});

btnEditar.addEventListener("click", () => {

    if (!codigo.value) {
        alert("Busque um produto primeiro.");
        return;
    }

    alert("Modo edição ativado.");
});

btnCancelar.addEventListener("click", () => {
    limparFormulario();
});

btnRemover.addEventListener("click", async () => {

    if (!codigo.value) {
        alert("Selecione um produto.");
        return;
    }

    try {

        await excluirProduto(codigo.value);

        alert("Produto removido com sucesso.");

        limparFormulario();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao remover produto.");
    }
});

function formatarMoeda(input) {

    input.addEventListener("input", function () {

        let valor = input.value.replace(/\D/g, "");

        valor = (valor / 100).toFixed(2);

        valor = valor.replace(".", ",");

        valor = valor.replace(
            /\B(?=(\d{3})+(?!\d))/g,
            "."
        );

        input.value = valor;
    });
}

formatarMoeda(valorCompra);
formatarMoeda(valorVenda);