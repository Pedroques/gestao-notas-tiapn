USE ProControl;
/* Cada vendedor possui produtos que vende, e estes estão associados a ele, assim como os clientes que ele atende */
/* codVendedor(PK, nn), nomeVendedor*/
INSERT INTO vendedores (

    codVendedor,
    nomeVendedor,
    status

)

VALUES

(
    1,
    'vendedor teste',
    'ATIVO'
),

(
    2,
    'vendedor teste 2',
    'ATIVO'
);