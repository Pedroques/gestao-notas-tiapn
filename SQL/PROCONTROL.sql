CREATE DATABASE ProControl;
USE ProControl;

CREATE TABLE Vendedores (
    codVendedor INT(3) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nomeVendedor VARCHAR(100)
);

CREATE TABLE Clientes(
    codCliente INT(3) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nomeCliente VARCHAR(100),
    CPF VARCHAR(11),
    celular VARCHAR(15),
    rua VARCHAR(100),
    numCasa VARCHAR(10),
    compCasa VARCHAR(50),
    bairro VARCHAR(50),
    cidade VARCHAR(50),
    UF VARCHAR(2),
    CEP VARCHAR(8),
    codVendedor INT(3) NOT NULL,
    FOREIGN KEY (codVendedor) REFERENCES Vendedores (codVendedor)
);

CREATE TABLE Produtos (
    codProduto INT(3) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    nomeProduto VARCHAR(100),
    valorCompra DECIMAL(10, 2),
    valorVenda DECIMAL(10, 2),
    quantidade INT,
    vendedorRelacionado INT(3) NOT NULL,
    qntEstoque INT,
    FOREIGN KEY (vendedorRelacionado) REFERENCES Vendedores (codVendedor)
);

CREATE TABLE Promissoria (
    codPromissoria INT(3) AUTO_INCREMENT PRIMARY KEY NOT NULL,
    codCliente INT(3) NOT NULL,
    codVendedor INT(3) NOT NULL,
    dataVenda DATE,
    FOREIGN KEY (codCliente) REFERENCES Clientes (codCliente),
    FOREIGN KEY (codVendedor) REFERENCES Vendedores (codVendedor)
);

CREATE TABLE ProdutosPromissoria (
    codPromissoria INT(3),
    codProduto INT(3),
    qntProdutos INT,
    valorVenda DECIMAL(10, 2),
    PRIMARY KEY (codPromissoria, codProduto),
    FOREIGN KEY (codPromissoria) REFERENCES Promissoria (codPromissoria),
    FOREIGN KEY (codProduto) REFERENCES Produtos (codProduto)
);
CREATE TABLE ContasAberto (
    codPromissoria INT(3),
    valorParcela DECIMAL(10, 2),
    dataVencimento DATE,
    valorAberto DECIMAL(10, 2),
    numParcela INT,
    status VARCHAR(20),
    PRIMARY KEY (codPromissoria, numParcela),
    FOREIGN KEY (codPromissoria) REFERENCES Promissoria (codPromissoria)
);