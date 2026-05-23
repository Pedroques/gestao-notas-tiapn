USE PROCONTROL;
/* Tabela de contas em aberto de cada cliente, ou seja, as parcelas e valores que ainda se deve */
/* valor da parcela é o valor total de cada parcela, valor aberto é o valor restante a ser pago de cada parcela */
/* codPromissoria (FK,nn), valorParcela, dataVencimento, valorAberto, numParcela, status */

INSERT INTO
    ContasAberto (
        codPromissoria,
        valorParcela,
        dataVencimento,
        valorAberto,
        numParcela,
        status
    )
VALUES (
        1,
        22.50,
        '2023-02-01',
        22.50,
        1,
        'Em aberto'
    ),
    (
        1,
        22.50,
        '2023-03-01',
        22.50,
        2,
        'Em aberto'
    ),
    (
        2,
        42.00,
        '2023-02-15',
        42.00,
        1,
        'Em aberto'
    ),
    (
        2,
        42.00,
        '2023-03-15',
        42.00,
        2,
        'Em aberto'
    ),
    (
        3,
        78.00,
        '2023-02-20',
        78.00,
        1,
        'Em aberto'
    ),
    (
        3,
        78.00,
        '2023-03-20',
        78.00,
        2,
        'Em aberto'
    ),
    (
        4,
        60.00,
        '2023-02-25',
        60.00,
        1,
        'Em aberto'
    ),
    (
        4,
        60.00,
        '2023-03-25',
        60.00,
        2,
        'Em aberto'
    ),
    (
        5,
        48.00,
        '2023-02-28',
        48.00,
        1,
        'Em aberto'
    ),
    (
        5,
        48.00,
        '2023-03-28',
        48.00,
        2,
        'Em aberto'
    );