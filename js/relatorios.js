// =============================================
// CONFIGURACAO DO JSON SERVER
// Certifique-se de que o JSON Server esta rodando com:
// npx json-server --watch db.JSON --port 3000
// =============================================
const BASE_URL = 'http://localhost:3000';

// =============================================
// CARREGAMENTO INICIAL
// Popula os selects de Vendedor e Produto ao abrir a pagina
// =============================================

async function carregarVendedores() {
  try {
    const res = await fetch(`${BASE_URL}/vendedor`);
    const data = await res.json();

    // Popula select da aba Vendedores e da aba Parcelas
    const selVend = document.getElementById('sel-vendedor');
    const selParc = document.getElementById('sel-vendedor-parc');

    data.forEach(v => {
      [selVend, selParc].forEach(sel => {
        const opt = document.createElement('option');
        opt.value = v.id;
        opt.textContent = `${v.codigo} - ${v.nome}`;
        sel.appendChild(opt);
      });
    });
  } catch {
    console.warn('JSON Server indisponivel. Rode: npx json-server --watch db.JSON --port 3000');
  }
}

async function carregarProdutos() {
  try {
    const res = await fetch(`${BASE_URL}/produtos`);
    const data = await res.json();
    const sel = document.getElementById('sel-produto');
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.id} - ${p.nome}`;
      sel.appendChild(opt);
    });
  } catch {
    console.warn('Secao "produtos" ainda nao existe no db.JSON.');
  }
}

// =============================================
// ABA 1 — RELATORIO DE VENDEDORES
// Mostra dados cadastrais do vendedor + vendas no periodo
// Depende das secoes "vendedor" e "vendas" no db.JSON
// Estrutura esperada em "vendas":
// { id, idVendedor, dataVenda, cliente, produto, parcelas, valorTotal }
// =============================================

async function buscarVendedor() {
  const idVendedor = document.getElementById('sel-vendedor').value;
  const dataIni = document.getElementById('vend-data-ini').value;
  const dataFim = document.getElementById('vend-data-fim').value;

  if (!dataIni && !dataFim) {
    // Sem periodo: busca todas as vendas do vendedor
  } else if (!dataIni || !dataFim) {
    alert('Preencha as duas datas ou deixe ambas em branco.');
    return;
  }

  try {
    const urlVend = idVendedor ? `${BASE_URL}/vendedor/${idVendedor}` : `${BASE_URL}/vendedor`;
    const resVend = await fetch(urlVend);
    const vendData = await resVend.json();
    const vendedores = Array.isArray(vendData) ? vendData : [vendData];

    if (!vendedores.length) {
      document.getElementById('resultado-vendedor').style.display = 'none';
      document.getElementById('vazio-vendedor').style.display = 'block';
      return;
    }

    // Preenche tabela de informacoes cadastrais
    // Aproveita os campos codigo e status que agora existem no JSON
    const tbodyInfo = document.getElementById('tbody-info-vendedor');
    tbodyInfo.innerHTML = '';
    vendedores.forEach(v => {
      const badgeStatus = v.status === 'ATIVO'
        ? `<span class="badge-ok">Ativo</span>`
        : `<span class="badge-atrasado">Inativo</span>`;
      tbodyInfo.innerHTML += `
            <tr>
              <td>${v.codigo || v.id}</td>
              <td>${v.nome}</td>
              <td>${badgeStatus}</td>
            </tr>`;
    });

    // Busca vendas e filtra por vendedor e periodo
    // Se a secao "vendas" ainda nao existir no db.JSON, usa array vazio
    const resVendas = await fetch(`${BASE_URL}/vendas`);
    const todasVendas = resVendas.ok ? await resVendas.json() : [];

    const vendasFiltradas = todasVendas.filter(v => {
      const data = new Date(v.dataVenda);
      const noPeriodo = (!dataIni || data >= new Date(dataIni)) &&
        (!dataFim || data <= new Date(dataFim));
      const doVendedor = idVendedor ? v.idVendedor === idVendedor : true;
      return noPeriodo && doVendedor;
    });

    // Preenche tabela de vendas
    const tbody = document.getElementById('tbody-vendedor');
    tbody.innerHTML = '';

    if (!vendasFiltradas.length) {
      tbody.innerHTML = `
            <tr>
              <td colspan="6" class="text-center text-muted py-3">
                Nenhuma venda encontrada para este vendedor no periodo selecionado.
              </td>
            </tr>`;
      document.getElementById('resumo-vendedor').textContent = '0 venda(s) encontrada(s)';
    } else {
      let totalGeral = 0;
      vendasFiltradas.forEach(v => {
        totalGeral += v.valorTotal;
        // Produto pode ser string ou array de objetos
        const nomeProduto = Array.isArray(v.produtos)
          ? v.produtos.map(p => p.nome).join(', ')
          : (v.produto || '-');
        tbody.innerHTML += `
              <tr>
                <td>${v.codigoPromissoria || v.id}</td>
                <td>${formatarData(v.dataVenda)}</td>
                <td>${v.cliente}</td>
                <td>${nomeProduto}</td>
                <td>${v.parcelas}</td>
                <td>R$ ${v.valorTotal.toFixed(2)}</td>
              </tr>`;
      });
      document.getElementById('resumo-vendedor').textContent =
        `${vendasFiltradas.length} venda(s) — Total: R$ ${totalGeral.toFixed(2)}`;
    }

    document.getElementById('vazio-vendedor').style.display = 'none';
    document.getElementById('resultado-vendedor').style.display = 'block';

  } catch (err) {
    console.error(err);
    alert('Erro ao buscar dados. Verifique se o JSON Server esta rodando em ' + BASE_URL);
  }
}

// =============================================
// ABA 2 — RELATORIO DE PRODUTOS
// Depende da secao "produtos" no db.JSON
// Estrutura esperada: { id, nome, preco, qtdVendida, ultimaVenda, totalArrecadado }
// =============================================

async function buscarProdutos() {
  const produtoFiltro = document.getElementById('sel-produto').value;
  const dataIni = document.getElementById('prod-data-ini').value;
  const dataFim = document.getElementById('prod-data-fim').value;

  if (dataIni && !dataFim || !dataIni && dataFim) {
    alert('Preencha as duas datas ou deixe ambas em branco.');
    return;
  }

  try {
    // Busca produtos e vendas ao mesmo tempo
    const [resProd, resVendas] = await Promise.all([
      fetch(`${BASE_URL}/produtos`),
      fetch(`${BASE_URL}/vendas`)
    ]);
    const produtos = await resProd.json();
    const todasVendas = resVendas.ok ? await resVendas.json() : [];

    // Filtra vendas pelo periodo se informado
    const vendasNoPeriodo = todasVendas.filter(v => {
      const data = new Date(v.dataVenda);
      return (!dataIni || data >= new Date(dataIni)) &&
        (!dataFim || data <= new Date(dataFim));
    });

    // Calcula qtdVendida, ultimaVenda e totalArrecadado por produto
    const estatisticas = {};
    vendasNoPeriodo.forEach(venda => {
      const itens = Array.isArray(venda.produtos) ? venda.produtos : [];
      itens.forEach(item => {
        if (!estatisticas[item.codigo]) {
          estatisticas[item.codigo] = {
            qtdVendida: 0,
            totalArrecadado: 0,
            ultimaVenda: null
          };
        }
        estatisticas[item.codigo].qtdVendida += item.quantidade || 0;
        estatisticas[item.codigo].totalArrecadado += item.subtotal || 0;

        // Guarda a data mais recente de venda do produto
        const dataVenda = new Date(venda.dataVenda);
        if (!estatisticas[item.codigo].ultimaVenda ||
          dataVenda > estatisticas[item.codigo].ultimaVenda) {
          estatisticas[item.codigo].ultimaVenda = dataVenda;
        }
      });
    });

    // Filtra por produto selecionado se houver
    const filtrados = produtoFiltro
      ? produtos.filter(p => p.id === produtoFiltro)
      : produtos;

    const tbody = document.getElementById('tbody-produtos');
    tbody.innerHTML = '';

    if (!filtrados.length) {
      document.getElementById('resultado-produtos').style.display = 'none';
      document.getElementById('vazio-produtos').style.display = 'block';
      return;
    }

    let totalGeral = 0;
    filtrados.forEach(p => {
      const est = estatisticas[p.id] || { qtdVendida: 0, totalArrecadado: 0, ultimaVenda: null };
      const valorUnit = p.valorVenda || p.valorUnit || p.preco || 0;
      totalGeral += est.totalArrecadado;

      tbody.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.nome}</td>
          <td>${est.ultimaVenda ? formatarData(est.ultimaVenda.toISOString()) : '-'}</td>
          <td>${est.qtdVendida}</td>
          <td>R$ ${valorUnit.toFixed(2)}</td>
          <td>R$ ${est.totalArrecadado.toFixed(2)}</td>
        </tr>`;
    });

    document.getElementById('resumo-produtos').textContent =
      `${filtrados.length} produto(s) — Total arrecadado: R$ ${totalGeral.toFixed(2)}`;
    document.getElementById('vazio-produtos').style.display = 'none';
    document.getElementById('resultado-produtos').style.display = 'block';

  } catch (err) {
    console.error(err);
    alert('Erro ao buscar dados. Verifique se o JSON Server esta rodando em ' + BASE_URL);
  }
}

// =============================================
// ABA 3 — PARCELAS (UNIFICADA)
// Combina "Parcelas a Vencer" e "Contas em Aberto"
// Filtra por periodo de vencimento, vendedor e status
// Depende das secoes "parcelas" e "vendedor" no db.JSON
// Estrutura esperada em "parcelas":
// { id, cliente, idVendedor, codPromissoria, numParcela,
//   valorParcela, dataVencimento, status }
// Status possivel: "Em dia" | "Vencendo" | "Atrasado"
// =============================================

async function buscarParcelas() {
  const idVendedor = document.getElementById('sel-vendedor-parc').value;
  const dataIni = document.getElementById('parc-data-ini').value;
  const dataFim = document.getElementById('parc-data-fim').value;
  const status = document.getElementById('sel-status-parc').value;

  try {

    const [resVendas, resVendedores] = await Promise.all([
      fetch(`${BASE_URL}/vendas`),
      fetch(`${BASE_URL}/vendedor`)
    ]);

    const vendas = await resVendas.json();
    const vendedores = await resVendedores.json();

    // Mapa de vendedores
    const mapaVendedor = {};
    vendedores.forEach(v => {
      mapaVendedor[v.id] = v.nome;
    });

    // Converte vendas + parcelasDetalhadas em uma lista única de parcelas
    const parcelas = [];

    vendas.forEach(venda => {

      if (!venda.parcelasDetalhadas || !Array.isArray(venda.parcelasDetalhadas)) {
        return;
      }

      venda.parcelasDetalhadas.forEach(parcela => {

        // Ignora parcelas já pagas
        if (parcela.status === 'Pago') {
          return;
        }

        parcelas.push({
          cliente: venda.cliente,
          idVendedor: venda.idVendedor,
          codPromissoria: venda.codigoPromissoria,
          numParcela: parcela.numero,
          valorParcela: parcela.valor,
          dataVencimento: parcela.dataPrevista,
          statusOriginal: parcela.status
        });

      });

    });

    // Aplicação dos filtros
    const filtradas = parcelas.filter(p => {

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);

      const diffDias =
        Math.ceil(
          (vencimento - hoje) /
          (1000 * 60 * 60 * 24)
        );

      const statusReal =
        diffDias < 0
          ? 'Atrasado'
          : diffDias <= 7
            ? 'Vencendo'
            : 'Em dia';

      const venc = new Date(p.dataVencimento);

      const noPeriodo =
        (!dataIni || venc >= new Date(dataIni)) &&
        (!dataFim || venc <= new Date(dataFim));

      const doVendedor =
        idVendedor
          ? p.idVendedor === idVendedor
          : true;

      const doStatus =
        status
          ? statusReal === status
          : true;

      return noPeriodo && doVendedor && doStatus;
    });

    const tbody = document.getElementById('tbody-parcelas');
    tbody.innerHTML = '';

    if (!filtradas.length) {
      document.getElementById('resultado-parcelas').style.display = 'none';
      document.getElementById('vazio-parcelas').style.display = 'block';
      return;
    }

    let totalValor = 0;

    filtradas.forEach(p => {

      totalValor += Number(p.valorParcela);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const vencimento = new Date(p.dataVencimento);
      vencimento.setHours(0, 0, 0, 0);

      const diffDias =
        Math.ceil(
          (vencimento - hoje) /
          (1000 * 60 * 60 * 24)
        );

      const statusReal =
        diffDias < 0
          ? 'Atrasado'
          : diffDias <= 7
            ? 'Vencendo'
            : 'Em dia';

      const badge =
        statusReal === 'Atrasado'
          ? '<span class="badge-atrasado">Atrasado</span>'
          : statusReal === 'Vencendo'
            ? '<span class="badge-vencendo">Vencendo</span>'
            : '<span class="badge-ok">Em dia</span>';

      tbody.innerHTML += `
    <tr>
      <td>${p.cliente}</td>
      <td>${mapaVendedor[p.idVendedor] || p.idVendedor}</td>
      <td>${p.codPromissoria}</td>
      <td>${p.numParcela}</td>
      <td>R$ ${Number(p.valorParcela).toFixed(2)}</td>
      <td>${formatarData(p.dataVencimento)}</td>
      <td>${badge}</td>
    </tr>
  `;
    });

    document.getElementById('resumo-parcelas').textContent =
      `${filtradas.length} parcela(s) encontrada(s) — Total: R$ ${totalValor.toFixed(2)}`;

    document.getElementById('vazio-parcelas').style.display = 'none';
    document.getElementById('resultado-parcelas').style.display = 'block';

  } catch (err) {
    console.error(err);
    alert('Erro ao buscar dados. Verifique se o JSON Server está rodando em ' + BASE_URL);
  }
}

// =============================================
// GERAR PDF
// Abre janela de impressao com a tabela da aba ativa
// Obs: tags HTML dentro da string usam \/ para nao
//      quebrar o script no navegador
// =============================================

function gerarPDF(aba) {
  const titulos = {
    vendedor: 'Relatorio de Vendas por Vendedor',
    produtos: 'Relatorio de Produtos Vendidos',
    parcelas: 'Relatorio de Parcelas'
  };

  const tabelas = {
    vendedor: document.getElementById('tabela-vendedor'),
    produtos: document.getElementById('tabela-produtos'),
    parcelas: document.getElementById('tabela-parcelas')
  };

  const resumos = {
    vendedor: document.getElementById('resumo-vendedor').textContent,
    produtos: document.getElementById('resumo-produtos').textContent,
    parcelas: document.getElementById('resumo-parcelas').textContent
  };

  const win = window.open('', '_blank');
  win.document.write(
    '<!DOCTYPE html><html><head>' +
    '<meta charset="UTF-8">' +
    '<title>' + titulos[aba] + '<\/title>' +
    '<style>' +
    'body { font-family: Arial, sans-serif; padding: 30px; font-size: 13px; }' +
    'h2 { color: #1a2e1a; margin-bottom: 4px; }' +
    '.sub { color: #555; font-size: 11px; margin-bottom: 20px; }' +
    'table { width: 100%; border-collapse: collapse; }' +
    'th { background-color: #2d5a27; color: #fff; padding: 8px 10px; text-align: left; font-size: 12px; }' +
    'td { padding: 7px 10px; border-bottom: 1px solid #ddd; }' +
    'tr:nth-child(even) { background-color: #f4f7f4; }' +
    '.resumo { margin-top: 16px; font-weight: bold; color: #1a2e1a; }' +
    '.rodape { margin-top: 30px; font-size: 11px; color: #888; text-align: center; }' +
    '<\/style><\/head><body>' +
    '<h2>' + titulos[aba] + '<\/h2>' +
    '<div class="sub">Gerado em ' + new Date().toLocaleDateString('pt-BR') + ' as ' + new Date().toLocaleTimeString('pt-BR') + '<\/div>' +
    tabelas[aba].outerHTML +
    '<div class="resumo">' + resumos[aba] + '<\/div>' +
    '<div class="rodape">Sistema de Gestao de Vendas - &copy; 2026<\/div>' +
    '<\/body><\/html>'
  );
  win.document.close();
  win.print();
}

// =============================================
// UTILITARIOS
// =============================================

// Formata data ISO (yyyy-mm-dd) para o padrao brasileiro (dd/mm/aaaa)
function formatarData(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR');
}

// Converte objeto Date para string no formato ISO (yyyy-mm-dd)
function formatarISO(d) {
  return d.toISOString().split('T')[0];
}

// =============================================
// INICIALIZACAO
// Executa ao carregar a pagina
// =============================================
carregarVendedores();
carregarProdutos();

