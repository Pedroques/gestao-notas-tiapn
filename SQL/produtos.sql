USE PROCONTROL;
/* Cada produto possui um vendedor relacionado, e este está associado a ele */
/* codProduto(PK, nn), nomeProduto, valorCompra, valorVenda, quantidade, vendedorRelacionado(FK,nn) */
INSERT INTO
    produtos
VALUES (
        1,
        'produto teste',
        10.00,
        15.00,
        100,
        1,
        100
    ),
    (
        2,
        'produto teste 2',
        20.00,
        30.00,
        50,
        15,
        50
    ),
    (
        3,
        'produto teste 3',
        5.00,
        7.50,
        200,
        1,
        200
    ),
    (
        4,
        'produto teste 4',
        8.00,
        12.00,
        150,
        15,
        150
    ),
    (
        5,
        'produto teste 5',
        12.00,
        18.00,
        80,
        1,
        80
    );