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
        FUTURA CONSULTA BANCO:

        fetch('/api/vendas-vendedor')
        */

        const labels = [

            'Camiseta Básica',
            'Camisa Polo',
            'Slim Fit',
            'Manga Curta'

        ];

        const valores = [
            12,
            8,
            19,
            6
        ];

        construirGrafico(
            labels,
            valores
        );
    }

    function construirGrafico(
        labels,
        valores
    ) {


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

                        label:
                            'Produtos vendidos',

                        data: valores,

                        borderWidth: 1

                    }]
                },

                options: {
                    responsive: true,

                    plugins: {

                        legend: {

                            labels: {

                                color: 'white'

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                color: 'white'

                            }
                        },

                        x: {

                            ticks: {
                                color: 'white'
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