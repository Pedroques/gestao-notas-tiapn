USE PROCONTROL;
/* A promissória é a venda efetuada */
/* codPromissoria(PK, nn), codCliente(FK,nn), codVendedor(FK,nn), dataVenda */
INSERT INTO
    promissoria
VALUES (1, 1, 1, '2023-01-01'),
    (2, 2, 2, '2023-01-02'),
    (3, 1, 1, '2023-01-03'),
    (4, 2, 2, '2023-01-04'),
    (5, 1, 1, '2023-01-05');