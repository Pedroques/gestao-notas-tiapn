const form = document.getElementById("produto-form");

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

let produtoEditando = null;

function gerarCodigo() {
    return Date.now();
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

function obterProdutos() {

    return JSON.parse(localStorage.getItem("produtos")) || [];
}

function salvarProdutos(produtos) {

    localStorage.setItem("produtos", JSON.stringify(produtos));
}

btnCriar.addEventListener("click", () => {

    limparFormulario();

    codigo.value = gerarCodigo();
});

btnSalvar.addEventListener("click", () => {

    if (
        nome.value.trim() === "" ||
        valorCompra.value.trim() === "" ||
        valorVenda.value.trim() === ""
    ) {

        alert("Preencha os campos obrigatórios.");
        return;
    }

    let produtos = obterProdutos();

    const produto = {

        codigo: codigo.value,
        nome: nome.value,
        valorCompra: valorCompra.value,
        valorVenda: valorVenda.value,
        codigoVendedor: codigoVendedor.value,
        estoque: estoque.value
    };

    if (produtoEditando !== null) {

        produtos[produtoEditando] = produto;

        alert("Produto atualizado com sucesso!");

    } else {

        produtos.push(produto);

        alert("Produto salvo com sucesso!");
    }

    salvarProdutos(produtos);

    limparFormulario();
});

btnBuscar.addEventListener("click", () => {

    const produtos = obterProdutos();

    const tbody = document.getElementById("produtos-tbody");

    tbody.innerHTML = "";

    produtos.forEach((produto, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${produto.codigo}</td>
            <td>${produto.nome}</td>
            <td>Produto</td>
            <td>${produto.valorVenda}</td>
            <td>${produto.estoque}</td>
        `;

        tr.style.cursor = "pointer";

        tr.addEventListener("click", () => {

            codigo.value = produto.codigo;
            nome.value = produto.nome;
            valorCompra.value = produto.valorCompra;
            valorVenda.value = produto.valorVenda;
            codigoVendedor.value = produto.codigoVendedor;
            estoque.value = produto.estoque;

            produtoEditando = index;

            const modal =
                bootstrap.Modal.getInstance(
                    document.getElementById("modalBuscarProduto")
                );

            modal.hide();
        });

        tbody.appendChild(tr);
    });

    const modal = new bootstrap.Modal(
        document.getElementById("modalBuscarProduto")
    );

    modal.show();
});

btnEditar.addEventListener("click", () => {

    if (codigo.value === "") {

        alert("Busque um produto primeiro.");
        return;
    }

    alert("Modo edição ativado.");
});

btnCancelar.addEventListener("click", () => {

    limparFormulario();
});

document
    .getElementById("btn-remover")
    .addEventListener("click", () => {

        if (codigo.value === "") {

            alert("Selecione um produto.");
            return;
        }

        let produtos = obterProdutos();

        produtos = produtos.filter(
            p => p.codigo != codigo.value
        );

        salvarProdutos(produtos);

        alert("Produto removido.");

        limparFormulario();
    });

function formatarMoeda(input) {

    input.addEventListener("input", function () {

        let valor = input.value.replace(/\D/g, "");

        valor = (valor / 100).toFixed(2);

        valor = valor.replace(".", ",");

        valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        input.value = valor;
    });
}

formatarMoeda(valorCompra);
formatarMoeda(valorVenda);

