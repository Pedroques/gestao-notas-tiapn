USE PROCONTROL;
/* Tabela que associa produtos às promissórias, contendo o código da promissória, o código do produto e a quantidade de produtos de cada item, e o valor de venda de cada produto */
/* codPromissoria(FK,nn), codProduto(FK,nn), qntProdutos, valorVenda */
INSERT INTO
    produtosPromissoria
VALUES (1, 1, 2, 15.00),
    (1, 3, 1, 7.50),
    (2, 2, 3, 30.00),
    (2, 4, 2, 12.00),
    (3, 1, 1, 15.00),
    (3, 5, 4, 18.00),
    (4, 2, 2, 30.00),
    (4, 3, 3, 7.50),
    (5, 4, 1, 12.00),
    (5, 5, 2, 18.00);