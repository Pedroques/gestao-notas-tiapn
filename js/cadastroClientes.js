const API_URL = "http://localhost:3000/clientes";
const VENDEDORES_URL = "http://localhost:3000/vendedor";
const modalBuscar = new bootstrap.Modal(document.getElementById('modalBuscarCliente'));

const inputs = {
    id: document.getElementById('txtId'),
    nome: document.getElementById('txtNome'),
    cpf: document.getElementById('txtCpf'),
    celular: document.getElementById('txtCelular'),
    rua: document.getElementById('txtRua'),
    numero: document.getElementById('txtNumero'),
    complemento: document.getElementById('txtComplemento'),
    bairro: document.getElementById('txtBairro'),
    cidade: document.getElementById('txtCidade'),
    uf: document.getElementById('txtUf'),
    cep: document.getElementById('txtCep'),
    codigoVendedor: document.getElementById('txtCodVendedor')
};

const btnBuscar = document.getElementById('btnBuscar');
const btnCriar = document.querySelector('.btnCriar');
const btnSalvar = document.querySelector('.btnSalvar');
const btnCancelar = document.querySelector('.btnCancelar');
const btnExcluir = document.querySelector('.btnExcluir');
const tabelaCorpo = document.getElementById('tabelaClientesCorpo');

document.addEventListener("DOMContentLoaded", () => {
    limparFormulario();
    bloquearCampos(true);
});
// procura pelo cod do cliente
inputs.id.addEventListener('change', async (e) => {
    const valor = e.target.value.trim();
    if (!valor) {
        limparFormulario();
        bloquearCampos(true);
        return;
    }

    const codigoPesquisa = parseInt(valor, 10);
    if (isNaN(codigoPesquisa)) {
        alert("Por favor, insira um código numérico válido.");
        limparFormulario();
        bloquearCampos(true);
        return;
    }

    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();
        const clienteEncontrado = clientes.find(c => parseInt(c.codigoExibicao || c.id, 10) === codigoPesquisa);

        if (clienteEncontrado) {
            preencherFormulario(clienteEncontrado);
            bloquearCampos(false);
        } else {
            alert(`Cliente com o código ${codigoPesquisa} não foi encontrado.`);
            limparFormulario();
            bloquearCampos(true);
        }
    } catch (error) {
        console.error("Erro ao buscar cliente:", error);
        alert("Ocorreu um erro ao buscar o cliente no servidor.");
    }
});

// Evento da Lupa
btnBuscar.addEventListener('click', async () => {
    await carregarClientesNoModal();
    modalBuscar.show();
});

// Botão Criar
btnCriar.addEventListener('click', () => {
    limparFormulario();
    bloquearCampos(false);
    inputs.nome.focus();
});

// Botão Cancelar
btnCancelar.addEventListener('click', () => {
    limparFormulario();
    bloquearCampos(true);
});

// Botão Salvar
btnSalvar.addEventListener('click', async () => {
    if (!inputs.nome.value.trim()) {
        alert("O nome do cliente é obrigatório!");
        return;
    }

    const codVendedor = inputs.codigoVendedor.value.trim();

    if (!codVendedor) {
        alert("O código do vendedor é obrigatório!");
        return;
    }

    try {
        const respostaVendedor = await fetch(`${VENDEDORES_URL}/${codVendedor}`);
        if (!respostaVendedor.ok) {
            alert(`Erro: O vendedor com código "${codVendedor}" não está cadastrado no sistema!`);
            inputs.codigoVendedor.focus();
            return;
        }

        const clienteData = obterDadosDoFormulario();
        const idReal = inputs.id.getAttribute('data-id-real');

        if (idReal) {
            clienteData.codigoExibicao = parseInt(inputs.id.value);

            await fetch(`${API_URL}/${idReal}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
            alert("Cliente atualizado com sucesso!");
        } else {
            const respostaClientes = await fetch(API_URL);
            const clientesAtuais = await respostaClientes.json();

            let proximoCodigo = 1;
            if (clientesAtuais.length > 0) {
                const codigosAtuais = clientesAtuais
                    .map(c => parseInt(c.codigoExibicao))
                    .filter(num => !isNaN(num));

                if (codigosAtuais.length > 0) {
                    proximoCodigo = Math.max(...codigosAtuais) + 1;
                }
            }

            clienteData.codigoExibicao = proximoCodigo;

            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clienteData)
            });
            alert(`Cliente cadastrado com sucesso! Código sequencial gerado: ${proximoCodigo}`);
        }

        limparFormulario();
        bloquearCampos(true);
    } catch (error) {
        console.error("Erro no processo de salvamento:", error);
        alert("Ocorreu um erro ao processar os dados com o servidor.");
    }
});

// Botão Excluir
btnExcluir.addEventListener('click', async () => {
    const idReal = inputs.id.getAttribute('data-id-real');

    if (!idReal) {
        alert("Por favor, selecione um cliente através da busca (lupa) antes de excluir!");
        return;
    }

    const nomeCliente = inputs.nome.value;

    if (confirm(`Tem certeza que deseja excluir o cliente "${nomeCliente}"?`)) {
        try {
            await fetch(`${API_URL}/${idReal}`, {
                method: 'DELETE'
            });

            alert("Cliente excluído com sucesso!");
            limparFormulario();
            bloquearCampos(true);
        } catch (error) {
            console.error("Erro ao excluir cliente:", error);
            alert("Ocorreu um erro técnico ao tentar excluir o cliente.");
        }
    }
});

// --- FUNÇÕES DE APOIO E REQUISIÇÕES ---
async function carregarClientesNoModal() {
    try {
        const response = await fetch(API_URL);
        const clientes = await response.json();

        tabelaCorpo.innerHTML = "";

        clientes.forEach(cliente => {
            const tr = document.createElement('tr');
            const codigoParaMostrar = cliente.codigoExibicao || cliente.id;

            tr.innerHTML = `
                <td>${codigoParaMostrar}</td>
                <td>${cliente.nome}</td>
                <td>${cliente.cpf}</td>
                <td>${cliente.cidade}/${cliente.uf}</td>
            `;

            tr.addEventListener('click', () => {
                preencherFormulario(cliente);
                bloquearCampos(false);
                modalBuscar.hide();
            });

            tabelaCorpo.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao buscar dados do db.json:", error);
        tabelaCorpo.innerHTML = "<tr><td colspan='4' class='text-danger text-center'>Erro ao carregar dados.</td></tr>";
    }
}

function preencherFormulario(cliente) {
    inputs.id.value = cliente.codigoExibicao || cliente.id;
    inputs.id.setAttribute('data-id-real', cliente.id);

    inputs.nome.value = cliente.nome || '';
    inputs.cpf.value = cliente.cpf || '';
    inputs.celular.value = cliente.celular || '';
    inputs.rua.value = cliente.rua || '';
    inputs.numero.value = cliente.numero || '';
    inputs.complemento.value = cliente.complemento || '';
    inputs.bairro.value = cliente.bairro || '';
    inputs.cidade.value = cliente.cidade || '';
    inputs.uf.value = cliente.uf || '';
    inputs.cep.value = cliente.cep || '';
    inputs.codigoVendedor.value = cliente.codigoVendedor || '';
}

function obterDadosDoFormulario() {
    return {
        nome: inputs.nome.value,
        cpf: inputs.cpf.value,
        celular: inputs.celular.value,
        rua: inputs.rua.value,
        numero: inputs.numero.value,
        complemento: inputs.complemento.value,
        bairro: inputs.bairro.value,
        cidade: inputs.cidade.value,
        uf: inputs.uf.value,
        cep: inputs.cep.value,
        codigoVendedor: inputs.codigoVendedor.value
    };
}

function limparFormulario() {
    Object.values(inputs).forEach(input => input.value = "");
    inputs.id.removeAttribute('data-id-real');
}

function bloquearCampos(status) {
    Object.entries(inputs).forEach(([key, input]) => {
        if (key !== 'id') {
            input.disabled = status;
        }
    });
}

/* Formata corretamente o campo de CPF */
inputs.cpf.addEventListener('input', (e) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, "");
    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
    valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = valor;
});

/* Formata corretamente o campo de Celular */
inputs.celular.addEventListener('input', (e) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, "");
    if (valor.length > 11) {
        valor = valor.slice(0, 11);
    }
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    e.target.value = valor;
});

/* Formata corretamente o campo de CEP */
inputs.cep.addEventListener('input', (e) => {
    let valor = e.target.value;
    valor = valor.replace(/\D/g, "");
    if (valor.length > 8) {
        valor = valor.slice(0, 8);
    }
    valor = valor.replace(/^(\d{5})(\d)/, "$1-$2");
    e.target.value = valor;
});