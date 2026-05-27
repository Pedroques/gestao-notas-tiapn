document.addEventListener('DOMContentLoaded', () => {

    const btnBuscar =
        document.getElementById('btnBuscar');

    const btnVendas =
        document.getElementById('btnVendas');

    const infoVendedor =
        document.getElementById('infoVendedor');

    const dashboard =
        document.getElementById('dashboardVendas');

    const campoCodigo =
        document.querySelector(
            'input[placeholder="Ex: 001"]'
        );

    const campoNome =
        document.querySelector(
            'input[placeholder="Digite o nome do vendedor"]'
        );

    let dashboardAberto = false;

    let grafico = null;

    btnBuscar.addEventListener(
        'click',
        buscarVendedor
    );

    btnVendas.addEventListener(
        'click',
        alternarDashboard
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

            /*
            FUTURA CONSULTA SQL
            */

            await simularConsulta();

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

    async function alternarDashboard() {

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

        /*
        FUTURA CONSULTA SQL:
    
        fetch('/api/vendas-vendedor')
        */

        const produtos = [

            {
                codigo: '1001',
                nome: 'Camiseta Básica',
                vendas: 12
            },

            {
                codigo: '1002',
                nome: 'Camisa Polo Premium',
                vendas: 8
            },

            {
                codigo: '1004',
                nome: 'Camisa Manga Curta',
                vendas: 6
            },

            {
                codigo: '1005',
                nome: 'Camisa Slim Fit',
                vendas: 19
            }

        ];

        construirGrafico(produtos);
    }

    function construirGrafico(
        produtos
    ) {

        const labels = produtos.map(p => p.nome);
        const valores = produtos.map(p => p.vendas);

        const ctx =
            document
                .getElementById(
                    'graficoVendas'
                );

        if (grafico) {

            grafico.destroy();
        }

        grafico = new Chart(

            ctx,
            {
                type: 'bar',

                data: {

                    labels: labels,

                    datasets: [{

                        label: 'Produtos vendidos',

                        data: valores,

                        backgroundColor: 'rgba(25,135,84,.70)',

                        borderColor: '#198754',

                        borderWidth: 2,

                        hoverBackgroundColor: 'rgba(76,175,80,.90)'
                    }]
                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            labels: {

                                color: "#172112"

                            }
                        }
                    },

                    scales: {

                        x: {

                            ticks: {

                                color: "#172112"

                            },

                            grid: {

                                color: "rgba(0,0,0,.10)"

                            }
                        },

                        y: {

                            ticks: {

                                color: "#172112"

                            },

                            grid: {

                                color: "rgba(0,0,0,.10)"

                            }
                        }
                    }
                }
            }
        );
    }

    async function simularConsulta() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }
});