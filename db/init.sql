-- =============================================================================
-- AUTOQUOTE COPILOT - MODELAGEM RELACIONAL DE DADOS (PostgreSQL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS veiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    chassi VARCHAR(17),
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    ano_fabricacao INT NOT NULL,
    ano_modelo INT NOT NULL,
    motorizacao VARCHAR(40) NOT NULL,
    versao VARCHAR(80),
    combustivel VARCHAR(30) DEFAULT 'Flex',
    cambio VARCHAR(30) DEFAULT 'Manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fabricantes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('OEM', 'AFTERMARKET')),
    origem VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS pecas (
    id SERIAL PRIMARY KEY,
    codigo_interno VARCHAR(40) NOT NULL UNIQUE,
    nome VARCHAR(120) NOT NULL,
    categoria VARCHAR(60) NOT NULL,
    posicao VARCHAR(40),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS referencias_fabricante (
    id SERIAL PRIMARY KEY,
    peca_id INT NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
    fabricante_id INT NOT NULL REFERENCES fabricantes(id) ON DELETE CASCADE,
    codigo_referencia VARCHAR(50) NOT NULL,
    tipo_referencia VARCHAR(30) DEFAULT 'PADRAO',
    CONSTRAINT unq_peca_fab_cod UNIQUE (peca_id, fabricante_id, codigo_referencia)
);

CREATE TABLE IF NOT EXISTS compatibilidade (
    id SERIAL PRIMARY KEY,
    peca_id INT NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
    veiculo_id INT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    ano_inicio INT,
    ano_fim INT,
    notas_instalacao TEXT,
    CONSTRAINT unq_peca_veiculo UNIQUE (peca_id, veiculo_id)
);

CREATE TABLE IF NOT EXISTS cotacoes_fornecedores (
    id SERIAL PRIMARY KEY,
    referencia_id INT NOT NULL REFERENCES referencias_fabricante(id) ON DELETE CASCADE,
    distribuidor VARCHAR(100) NOT NULL,
    preco_tabela NUMERIC(10, 2) NOT NULL,
    preco_cotado NUMERIC(10, 2) NOT NULL,
    estoque_disponivel INT DEFAULT 0,
    prazo_dias INT DEFAULT 1,
    avaliacao NUMERIC(3, 1) DEFAULT 4.8,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de busca rápida por placa e códigos
CREATE INDEX IF NOT EXISTS idx_veiculos_placa ON veiculos(placa);
CREATE INDEX IF NOT EXISTS idx_pecas_nome ON pecas(nome);
CREATE INDEX IF NOT EXISTS idx_referencias_codigo ON referencias_fabricante(codigo_referencia);
CREATE INDEX IF NOT EXISTS idx_compatibilidade_veiculo ON compatibilidade(veiculo_id);

-- =============================================================================
-- SEED DATA (Dados de Demonstração / PoC)
-- =============================================================================

-- Fabricantes
INSERT INTO fabricantes (nome, tipo, origem) VALUES
('Volkswagen OEM', 'OEM', 'Alemanha'),
('General Motors OEM', 'OEM', 'EUA'),
('Toyota OEM', 'OEM', 'Japão'),
('Hyundai OEM', 'OEM', 'Coreia do Sul'),
('Stellantis OEM', 'OEM', 'Holanda'),
('Bosch', 'AFTERMARKET', 'Alemanha'),
('TRW', 'AFTERMARKET', 'EUA'),
('Fras-le', 'AFTERMARKET', 'Brasil'),
('Nakata', 'AFTERMARKET', 'Japão'),
('Cofap', 'AFTERMARKET', 'Brasil'),
('Mahle', 'AFTERMARKET', 'Alemanha'),
('Tecfil', 'AFTERMARKET', 'Brasil'),
('NGK', 'AFTERMARKET', 'Japão'),
('Dayco', 'AFTERMARKET', 'EUA')
ON CONFLICT (nome) DO NOTHING;

-- Veículos de Teste (Placas padrão Mercosul e tradicional)
INSERT INTO veiculos (placa, chassi, marca, modelo, ano_fabricacao, ano_modelo, motorizacao, versao, combustivel, cambio) VALUES
('ABC1D23', '9BWAA05U9NP012345', 'Volkswagen', 'Gol', 2021, 2022, '1.0 12V MPI', 'Trendline Flex', 'Flex', 'Manual'),
('BRA2E19', '9BGKS48V0PG543210', 'Chevrolet', 'Onix Plus', 2023, 2023, '1.0 12V Turbo', 'Premier Automático', 'Flex', 'Automático'),
('XYZ9A88', '9BRBD3HE4PP987654', 'Toyota', 'Corolla', 2022, 2023, '2.0 16V VVT-iE', 'Altis Premium Dynamic Force', 'Flex', 'CVT 10 marchas'),
('RIO2A18', '9BHBG51BABR112233', 'Hyundai', 'HB20', 2020, 2021, '1.0 12V Kappa', 'Sense Flex', 'Flex', 'Manual'),
('SPX4B99', '988611P97PK998877', 'Jeep', 'Renegade', 2023, 2024, '1.3 16V T270 Turbo', 'Longitude Automático', 'Flex', 'Automático 6 marchas'),
('KMT7788', '9BD281432N8765432', 'Fiat', 'Strada', 2021, 2022, '1.3 8V Firefly', 'Volcano Cabine Dupla', 'Flex', 'Manual')
ON CONFLICT (placa) DO NOTHING;

-- Peças
INSERT INTO pecas (id, codigo_interno, nome, categoria, posicao, descricao) VALUES
(1, 'BRK-DISC-001', 'Disco de freio dianteiro ventilado', 'Freios', 'Dianteira', 'Disco de freio ventilado para eixo dianteiro, 256mm'),
(2, 'BRK-PAD-001', 'Pastilha de freio dianteira', 'Freios', 'Dianteira', 'Jogo de pastilhas de freio dianteiras cerâmicas/semi-metálicas'),
(3, 'SUS-SHK-001', 'Amortecedor dianteiro pressurizado', 'Suspensão', 'Dianteira', 'Amortecedor dianteiro pressurizado a gás (Turbogás)'),
(4, 'FLT-OIL-001', 'Filtro de óleo do motor', 'Filtros', 'Motor', 'Filtro de óleo blindado de alta retenção particulada'),
(5, 'FLT-AIR-001', 'Filtro de ar do motor', 'Filtros', 'Motor', 'Elemento filtrante de ar do motor em papel especial microporoso'),
(6, 'ENG-SPK-001', 'Vela de ignição Green/Iridium', 'Ignição', 'Motor', 'Jogo com 3 ou 4 velas de ignição de alta durabilidade e faísca rápida'),
(7, 'ENG-BELT-001', 'Correia dentada de distribuição', 'Motor', 'Motor', 'Correia sincronizadora em borracha nitrílica reforçada com fibra'),
(8, 'BRK-DISC-002', 'Disco de freio dianteiro sólido/ventilado Onix', 'Freios', 'Dianteira', 'Disco dianteiro ventilado 262mm para GM Onix Turbo'),
(9, 'BRK-PAD-002', 'Pastilha de freio dianteira Onix', 'Freios', 'Dianteira', 'Jogo de pastilhas de freio dianteiras sem amianto'),
(10, 'FLT-OIL-002', 'Filtro de óleo Onix Turbo', 'Filtros', 'Motor', 'Elemento de filtro de óleo ecológico para linha Onix Turbo')
ON CONFLICT (codigo_interno) DO NOTHING;

-- Referências de Fabricante (Cross-Reference OEM vs Aftermarket)
-- Para Peça 1 (Disco VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(1, 1, '5U0615301', 'OEM'),
(1, 6, '0 986 BB4 043', 'BOSCH'),
(1, 7, 'RPDI02880', 'TRW'),
(1, 8, 'RCDI00870', 'FRAS-LE'),
(1, 9, 'NKF 6043', 'NAKATA')
ON CONFLICT DO NOTHING;

-- Para Peça 2 (Pastilha VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(2, 1, '5U0698151A', 'OEM'),
(2, 6, '0 986 BB0 735', 'BOSCH'),
(2, 7, 'RCPT02840', 'TRW'),
(2, 8, 'PD/58', 'FRAS-LE')
ON CONFLICT DO NOTHING;

-- Para Peça 3 (Amortecedor VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(3, 1, '5U0413031F', 'OEM'),
(3, 10, 'GP32985', 'COFAP'),
(3, 9, 'HG 33027', 'NAKATA')
ON CONFLICT DO NOTHING;

-- Para Peça 4 (Filtro de Óleo VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(4, 1, '04E115561H', 'OEM'),
(4, 11, 'OC 540', 'MAHLE'),
(4, 12, 'PSL 545', 'TECFIL'),
(4, 6, '0 986 B00 025', 'BOSCH')
ON CONFLICT DO NOTHING;

-- Para Peça 5 (Filtro de Ar VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(5, 1, '04E129620A', 'OEM'),
(5, 12, 'ARL 6075', 'TECFIL'),
(5, 11, 'LX 3141', 'MAHLE')
ON CONFLICT DO NOTHING;

-- Para Peça 6 (Velas VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(6, 1, '04E905612C', 'OEM'),
(6, 13, 'ZKER6A-10EG', 'NGK'),
(6, 6, '0 241 145 523', 'BOSCH')
ON CONFLICT DO NOTHING;

-- Para Peça 7 (Correia Dentada VW Gol)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(7, 1, '04E109119F', 'OEM'),
(7, 14, '941072', 'DAYCO'),
(7, 6, '1987948250', 'BOSCH')
ON CONFLICT DO NOTHING;

-- Para Peça 8 (Disco GM Onix)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(8, 2, '26274004', 'OEM'),
(8, 8, 'RCDI09120', 'FRAS-LE'),
(8, 7, 'RPDI03990', 'TRW'),
(8, 9, 'NKF 6112', 'NAKATA')
ON CONFLICT DO NOTHING;

-- Para Peça 9 (Pastilha GM Onix)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(9, 2, '26274005', 'OEM'),
(9, 8, 'PD/1520', 'FRAS-LE'),
(9, 6, '0 986 BB1 102', 'BOSCH')
ON CONFLICT DO NOTHING;

-- Para Peça 10 (Filtro de Óleo GM Onix)
INSERT INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia) VALUES
(10, 2, '55594651', 'OEM'),
(10, 11, 'OX 1145D', 'MAHLE'),
(10, 12, 'PEL 727', 'TECFIL')
ON CONFLICT DO NOTHING;

-- Compatibilidade (veiculo_id x peca_id)
-- Gol (veiculo_id: 1)
INSERT INTO compatibilidade (veiculo_id, peca_id, ano_inicio, ano_fim, notas_instalacao) VALUES
(1, 1, 2017, 2023, 'Aplica-se às versões com rodas aro 14 e 15 sem ABS integrado ao cubo traseiro'),
(1, 2, 2017, 2023, 'Sistema de freio Teves'),
(1, 3, 2017, 2023, 'Lado direito e esquerdo idênticos'),
(1, 4, 2016, 2023, 'Motores EA211 1.0 3 cilindros'),
(1, 5, 2016, 2023, 'Caixa de ar padrão'),
(1, 6, 2016, 2023, 'Kit com 3 velas'),
(1, 7, 2016, 2023, 'Substituir a cada 60.000 km ou 4 anos')
ON CONFLICT DO NOTHING;

-- Onix (veiculo_id: 2)
INSERT INTO compatibilidade (veiculo_id, peca_id, ano_inicio, ano_fim, notas_instalacao) VALUES
(2, 8, 2020, 2024, 'Compatível com modelos Onix Hatch e Plus equipados com motor Turbo'),
(2, 9, 2020, 2024, 'Eixo dianteiro com sensor acústico de desgaste'),
(2, 10, 2020, 2024, 'Elemento de papel refil com anel o-ring de vedação')
ON CONFLICT DO NOTHING;

-- Cotações de Fornecedores Externos (Mock para simulação de cotações autônomas)
INSERT INTO cotacoes_fornecedores (referencia_id, distribuidor, preco_tabela, preco_cotado, estoque_disponivel, prazo_dias, avaliacao) VALUES
-- Referências do Disco Gol (Peca 1)
(1, 'Distribuidora Nakata Express', 320.00, 245.50, 18, 1, 4.9),
(2, 'Dasa Autopeças Brasil', 310.00, 229.90, 8, 2, 4.7),
(3, 'RDP Distribuidora de Freios', 295.00, 215.00, 12, 1, 4.8),
(4, 'Bezerra Autopeças Online', 280.00, 199.90, 4, 3, 4.6),
-- Referências da Pastilha Gol (Peca 2)
(6, 'Distribuidora Nakata Express', 145.00, 110.00, 25, 1, 4.9),
(7, 'Dasa Autopeças Brasil', 138.00, 98.50, 15, 2, 4.7),
(8, 'RDP Distribuidora de Freios', 130.00, 89.90, 30, 1, 4.8),
-- Referências Filtro de Óleo Gol (Peca 4)
(11, 'Connect Parts Atacado', 48.00, 32.50, 50, 1, 4.9),
(12, 'Dasa Autopeças Brasil', 45.00, 28.90, 40, 1, 4.7)
ON CONFLICT DO NOTHING;
