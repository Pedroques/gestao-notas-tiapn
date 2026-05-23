use PROCONTROL;
/* Tabela de clientes */
/* codCliente(PK, nn), nomeCliente, CPF, celular, rua, numCasa, compCasa, bairro, cidade, UF, CEP, codVendedor (FK,nn)  */
/* Cada cliente é relacionado a um único vendedor */
INSERT INTO
    clientes
VALUES (
        1,
        'cliente teste',
        '12345678900',
        '40028922',
        'rua teste',
        '123',
        'casa teste',
        'bairro teste',
        'cidade teste',
        'UF',
        '12345678',
        1
    ),
    (
        2,
        'cliente teste 2',
        '12345678901',
        '40028923',
        'rua teste 2',
        '125',
        'casa teste 2',
        'bairro teste 2',
        'cidade teste 2',
        'UF',
        '01234567',
        2
    );