-- Dados 100% sinteticos para fins de estudo/portfolio.
-- TRUNCATE no inicio torna o seed idempotente entre reinicios da aplicacao.

TRUNCATE TABLE orcamento_itens, orcamentos, compatibilidade, referencias_fabricante, pecas, veiculos
    RESTART IDENTITY CASCADE;

-- ===================== VEICULOS =====================
INSERT INTO veiculos (placa, marca, modelo, ano, motorizacao, versao) VALUES
('ABC1D23', 'Volkswagen', 'Gol', 2015, '1.6', 'Trendline'),
('XYZ2E45', 'Chevrolet', 'Onix', 2019, '1.0', 'LT'),
('JJK9B12', 'Fiat', 'Argo', 2021, '1.3', 'Drive');

-- ===================== PECAS (catalogo generico) =====================
INSERT INTO pecas (nome_generico, categoria, sinonimos) VALUES
('Disco de freio dianteiro', 'Freios', 'disco de freio dianteiro;disco dianteiro;disco freio diant'),
('Pastilha de freio dianteira', 'Freios', 'pastilha de freio dianteira;pastilha dianteira;pastilha freio diant'),
('Filtro de oleo', 'Motor', 'filtro de oleo;filtro oleo;filtro de óleo'),
('Correia dentada', 'Motor', 'correia dentada;correia do motor'),
('Amortecedor dianteiro', 'Suspensao', 'amortecedor dianteiro;amortecedor diant');

-- ===================== REFERENCIAS DE FABRICANTE =====================
-- Disco de freio dianteiro (peca_id = 1)
INSERT INTO referencias_fabricante (peca_id, tipo, fabricante, codigo) VALUES
(1, 'OEM', 'Volkswagen', '5U0615301A'),          -- id 1
(1, 'OEM', 'Chevrolet', '52099943'),              -- id 2
(1, 'AFTERMARKET', 'Fras-le', 'FD1234'),          -- id 3
(1, 'AFTERMARKET', 'TRW', 'DF6098');               -- id 4

-- Pastilha de freio dianteira (peca_id = 2)
INSERT INTO referencias_fabricante (peca_id, tipo, fabricante, codigo) VALUES
(2, 'OEM', 'Volkswagen', '5U0698151'),            -- id 5
(2, 'OEM', 'Chevrolet', '13502447'),              -- id 6
(2, 'AFTERMARKET', 'Bosch', 'BP1234'),            -- id 7
(2, 'AFTERMARKET', 'Fras-le', 'PD5678');           -- id 8

-- Filtro de oleo (peca_id = 3)
INSERT INTO referencias_fabricante (peca_id, tipo, fabricante, codigo) VALUES
(3, 'OEM', 'Volkswagen', '06A115561B'),           -- id 9
(3, 'OEM', 'Fiat', '55206728'),                    -- id 10
(3, 'AFTERMARKET', 'Tecfil', 'PSL123');            -- id 11

-- Correia dentada (peca_id = 4)
INSERT INTO referencias_fabricante (peca_id, tipo, fabricante, codigo) VALUES
(4, 'OEM', 'Chevrolet', '55568385'),               -- id 12
(4, 'AFTERMARKET', 'Gates', 'GT456');               -- id 13

-- Amortecedor dianteiro (peca_id = 5)
INSERT INTO referencias_fabricante (peca_id, tipo, fabricante, codigo) VALUES
(5, 'OEM', 'Volkswagen', '5U0413031Q'),            -- id 14
(5, 'AFTERMARKET', 'Cofap', 'AM789');               -- id 15

-- ===================== COMPATIBILIDADE =====================
-- Disco dianteiro: OEM restrito a marca/modelo; aftermarket serve as 3 (qualquer motorizacao)
INSERT INTO compatibilidade (referencia_id, marca, modelo, ano_inicio, ano_fim, motorizacao) VALUES
(1, 'Volkswagen', 'Gol', 2013, 2019, NULL),
(2, 'Chevrolet', 'Onix', 2017, 2022, NULL),
(3, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(3, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(3, 'Fiat', 'Argo', 2018, 2023, NULL),
(4, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(4, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(4, 'Fiat', 'Argo', 2018, 2023, NULL);

-- Pastilha dianteira
INSERT INTO compatibilidade (referencia_id, marca, modelo, ano_inicio, ano_fim, motorizacao) VALUES
(5, 'Volkswagen', 'Gol', 2013, 2019, NULL),
(6, 'Chevrolet', 'Onix', 2017, 2022, NULL),
(7, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(7, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(7, 'Fiat', 'Argo', 2018, 2023, NULL),
(8, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(8, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(8, 'Fiat', 'Argo', 2018, 2023, NULL);

-- Filtro de oleo
INSERT INTO compatibilidade (referencia_id, marca, modelo, ano_inicio, ano_fim, motorizacao) VALUES
(9, 'Volkswagen', 'Gol', 2013, 2019, '1.6'),
(10, 'Fiat', 'Argo', 2018, 2023, NULL),
(11, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(11, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(11, 'Fiat', 'Argo', 2018, 2023, NULL);

-- Correia dentada
INSERT INTO compatibilidade (referencia_id, marca, modelo, ano_inicio, ano_fim, motorizacao) VALUES
(12, 'Chevrolet', 'Onix', 2017, 2022, '1.0'),
(13, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(13, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(13, 'Fiat', 'Argo', 2018, 2023, NULL);

-- Amortecedor dianteiro
INSERT INTO compatibilidade (referencia_id, marca, modelo, ano_inicio, ano_fim, motorizacao) VALUES
(14, 'Volkswagen', 'Gol', 2013, 2019, NULL),
(15, 'Volkswagen', 'Gol', 2013, 2023, NULL),
(15, 'Chevrolet', 'Onix', 2017, 2023, NULL),
(15, 'Fiat', 'Argo', 2018, 2023, NULL);
