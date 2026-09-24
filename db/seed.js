const { getSqliteDb } = require('../src/config/database');

function seedDatabase() {
  console.log('[DB Seed] Inicializando banco de dados local SQLite...');
  const db = getSqliteDb();

  // Criação das tabelas no SQLite
  db.exec(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      placa TEXT NOT NULL UNIQUE,
      chassi TEXT,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      ano_fabricacao INTEGER NOT NULL,
      ano_modelo INTEGER NOT NULL,
      motorizacao TEXT NOT NULL,
      versao TEXT,
      combustivel TEXT DEFAULT 'Flex',
      cambio TEXT DEFAULT 'Manual',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fabricantes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL,
      origem TEXT
    );

    CREATE TABLE IF NOT EXISTS pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo_interno TEXT NOT NULL UNIQUE,
      nome TEXT NOT NULL,
      categoria TEXT NOT NULL,
      posicao TEXT,
      descricao TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS referencias_fabricante (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      peca_id INTEGER NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
      fabricante_id INTEGER NOT NULL REFERENCES fabricantes(id) ON DELETE CASCADE,
      codigo_referencia TEXT NOT NULL,
      tipo_referencia TEXT DEFAULT 'PADRAO',
      UNIQUE(peca_id, fabricante_id, codigo_referencia)
    );

    CREATE TABLE IF NOT EXISTS compatibilidade (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      peca_id INTEGER NOT NULL REFERENCES pecas(id) ON DELETE CASCADE,
      veiculo_id INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
      ano_inicio INTEGER,
      ano_fim INTEGER,
      notas_instalacao TEXT,
      UNIQUE(peca_id, veiculo_id)
    );

    CREATE TABLE IF NOT EXISTS cotacoes_fornecedores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referencia_id INTEGER NOT NULL REFERENCES referencias_fabricante(id) ON DELETE CASCADE,
      distribuidor TEXT NOT NULL,
      preco_tabela REAL NOT NULL,
      preco_cotado REAL NOT NULL,
      estoque_disponivel INTEGER DEFAULT 0,
      prazo_dias INTEGER DEFAULT 1,
      avaliacao REAL DEFAULT 4.8,
      atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Fabricantes
  const fabricantes = [
    { id: 1, nome: 'Volkswagen OEM', tipo: 'OEM', origem: 'Alemanha' },
    { id: 2, nome: 'General Motors OEM', tipo: 'OEM', origem: 'EUA' },
    { id: 3, nome: 'Toyota OEM', tipo: 'OEM', origem: 'Japão' },
    { id: 4, nome: 'Hyundai OEM', tipo: 'OEM', origem: 'Coreia do Sul' },
    { id: 5, nome: 'Stellantis OEM', tipo: 'OEM', origem: 'Holanda' },
    { id: 6, nome: 'Bosch', tipo: 'AFTERMARKET', origem: 'Alemanha' },
    { id: 7, nome: 'TRW', tipo: 'AFTERMARKET', origem: 'EUA' },
    { id: 8, nome: 'Fras-le', tipo: 'AFTERMARKET', origem: 'Brasil' },
    { id: 9, nome: 'Nakata', tipo: 'AFTERMARKET', origem: 'Japão' },
    { id: 10, nome: 'Cofap', tipo: 'AFTERMARKET', origem: 'Brasil' },
    { id: 11, nome: 'Mahle', tipo: 'AFTERMARKET', origem: 'Alemanha' },
    { id: 12, nome: 'Tecfil', tipo: 'AFTERMARKET', origem: 'Brasil' },
    { id: 13, nome: 'NGK', tipo: 'AFTERMARKET', origem: 'Japão' },
    { id: 14, nome: 'Dayco', tipo: 'AFTERMARKET', origem: 'EUA' }
  ];

  const insertFab = db.prepare(`
    INSERT OR IGNORE INTO fabricantes (id, nome, tipo, origem)
    VALUES (?, ?, ?, ?)
  `);
  fabricantes.forEach(f => insertFab.run(f.id, f.nome, f.tipo, f.origem));

  // Veículos
  const veiculos = [
    {
      id: 1,
      placa: 'ABC1D23',
      chassi: '9BWAA05U9NP012345',
      marca: 'Volkswagen',
      modelo: 'Gol',
      ano_fab: 2021,
      ano_mod: 2022,
      motor: '1.0 12V MPI',
      versao: 'Trendline Flex',
      comb: 'Flex',
      cambio: 'Manual'
    },
    {
      id: 2,
      placa: 'BRA2E19',
      chassi: '9BGKS48V0PG543210',
      marca: 'Chevrolet',
      modelo: 'Onix Plus',
      ano_fab: 2023,
      ano_mod: 2023,
      motor: '1.0 12V Turbo',
      versao: 'Premier Automático',
      comb: 'Flex',
      cambio: 'Automático'
    },
    {
      id: 3,
      placa: 'XYZ9A88',
      chassi: '9BRBD3HE4PP987654',
      marca: 'Toyota',
      modelo: 'Corolla',
      ano_fab: 2022,
      ano_mod: 2023,
      motor: '2.0 16V VVT-iE',
      versao: 'Altis Premium Dynamic Force',
      comb: 'Flex',
      cambio: 'CVT 10 marchas'
    },
    {
      id: 4,
      placa: 'RIO2A18',
      chassi: '9BHBG51BABR112233',
      marca: 'Hyundai',
      modelo: 'HB20',
      ano_fab: 2020,
      ano_mod: 2021,
      motor: '1.0 12V Kappa',
      versao: 'Sense Flex',
      comb: 'Flex',
      cambio: 'Manual'
    },
    {
      id: 5,
      placa: 'SPX4B99',
      chassi: '988611P97PK998877',
      marca: 'Jeep',
      modelo: 'Renegade',
      ano_fab: 2023,
      ano_mod: 2024,
      motor: '1.3 16V T270 Turbo',
      versao: 'Longitude Automático',
      comb: 'Flex',
      cambio: 'Automático 6 marchas'
    },
    {
      id: 6,
      placa: 'KMT7788',
      chassi: '9BD281432N8765432',
      marca: 'Fiat',
      modelo: 'Strada',
      ano_fab: 2021,
      ano_mod: 2022,
      motor: '1.3 8V Firefly',
      versao: 'Volcano Cabine Dupla',
      comb: 'Flex',
      cambio: 'Manual'
    }
  ];

  const insertVeic = db.prepare(`
    INSERT OR IGNORE INTO veiculos (id, placa, chassi, marca, modelo, ano_fabricacao, ano_modelo, motorizacao, versao, combustivel, cambio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  veiculos.forEach(v => insertVeic.run(v.id, v.placa, v.chassi, v.marca, v.modelo, v.ano_fab, v.ano_mod, v.motor, v.versao, v.comb, v.cambio));

  // Peças
  const pecas = [
    { id: 1, cod: 'BRK-DISC-001', nome: 'Disco de freio dianteiro ventilado', cat: 'Freios', pos: 'Dianteira', desc: 'Disco de freio ventilado para eixo dianteiro, 256mm' },
    { id: 2, cod: 'BRK-PAD-001', nome: 'Pastilha de freio dianteira', cat: 'Freios', pos: 'Dianteira', desc: 'Jogo de pastilhas de freio dianteiras' },
    { id: 3, cod: 'SUS-SHK-001', nome: 'Amortecedor dianteiro pressurizado', cat: 'Suspensão', pos: 'Dianteira', desc: 'Amortecedor dianteiro pressurizado a gás' },
    { id: 4, cod: 'FLT-OIL-001', nome: 'Filtro de óleo do motor', cat: 'Filtros', pos: 'Motor', desc: 'Filtro de óleo blindado de alta retenção' },
    { id: 5, cod: 'FLT-AIR-001', nome: 'Filtro de ar do motor', cat: 'Filtros', pos: 'Motor', desc: 'Elemento filtrante de ar do motor' },
    { id: 6, cod: 'ENG-SPK-001', nome: 'Vela de ignição Green/Iridium', cat: 'Ignição', pos: 'Motor', desc: 'Jogo com 3 velas de ignição' },
    { id: 7, cod: 'ENG-BELT-001', nome: 'Correia dentada de distribuição', cat: 'Motor', pos: 'Motor', desc: 'Correia sincronizadora reforçada' },
    { id: 8, cod: 'BRK-DISC-002', nome: 'Disco de freio dianteiro ventilado Onix', cat: 'Freios', pos: 'Dianteira', desc: 'Disco dianteiro ventilado 262mm' },
    { id: 9, cod: 'BRK-PAD-002', nome: 'Pastilha de freio dianteira Onix', cat: 'Freios', pos: 'Dianteira', desc: 'Jogo de pastilhas dianteiras sem amianto' },
    { id: 10, cod: 'FLT-OIL-002', nome: 'Filtro de óleo Onix Turbo', cat: 'Filtros', pos: 'Motor', desc: 'Elemento de filtro de óleo ecológico' }
  ];

  const insertPeca = db.prepare(`
    INSERT OR IGNORE INTO pecas (id, codigo_interno, nome, categoria, posicao, descricao)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  pecas.forEach(p => insertPeca.run(p.id, p.cod, p.nome, p.cat, p.pos, p.desc));

  // Referências Fabricante
  const refs = [
    // VW Gol Disco (Peca 1)
    { peca_id: 1, fab_id: 1, cod: '5U0615301', tipo: 'OEM' },
    { peca_id: 1, fab_id: 6, cod: '0 986 BB4 043', tipo: 'BOSCH' },
    { peca_id: 1, fab_id: 7, cod: 'RPDI02880', tipo: 'TRW' },
    { peca_id: 1, fab_id: 8, cod: 'RCDI00870', tipo: 'FRAS-LE' },
    { peca_id: 1, fab_id: 9, cod: 'NKF 6043', tipo: 'NAKATA' },

    // VW Gol Pastilha (Peca 2)
    { peca_id: 2, fab_id: 1, cod: '5U0698151A', tipo: 'OEM' },
    { peca_id: 2, fab_id: 6, cod: '0 986 BB0 735', tipo: 'BOSCH' },
    { peca_id: 2, fab_id: 7, cod: 'RCPT02840', tipo: 'TRW' },
    { peca_id: 2, fab_id: 8, cod: 'PD/58', tipo: 'FRAS-LE' },

    // VW Gol Amortecedor (Peca 3)
    { peca_id: 3, fab_id: 1, cod: '5U0413031F', tipo: 'OEM' },
    { peca_id: 3, fab_id: 10, cod: 'GP32985', tipo: 'COFAP' },
    { peca_id: 3, fab_id: 9, cod: 'HG 33027', tipo: 'NAKATA' },

    // VW Gol Filtro Óleo (Peca 4)
    { peca_id: 4, fab_id: 1, cod: '04E115561H', tipo: 'OEM' },
    { peca_id: 4, fab_id: 11, cod: 'OC 540', tipo: 'MAHLE' },
    { peca_id: 4, fab_id: 12, cod: 'PSL 545', tipo: 'TECFIL' },
    { peca_id: 4, fab_id: 6, cod: '0 986 B00 025', tipo: 'BOSCH' },

    // VW Gol Filtro Ar (Peca 5)
    { peca_id: 5, fab_id: 1, cod: '04E129620A', tipo: 'OEM' },
    { peca_id: 5, fab_id: 12, cod: 'ARL 6075', tipo: 'TECFIL' },
    { peca_id: 5, fab_id: 11, cod: 'LX 3141', tipo: 'MAHLE' },

    // VW Gol Velas (Peca 6)
    { peca_id: 6, fab_id: 1, cod: '04E905612C', tipo: 'OEM' },
    { peca_id: 6, fab_id: 13, cod: 'ZKER6A-10EG', tipo: 'NGK' },
    { peca_id: 6, fab_id: 6, cod: '0 241 145 523', tipo: 'BOSCH' },

    // VW Gol Correia (Peca 7)
    { peca_id: 7, fab_id: 1, cod: '04E109119F', tipo: 'OEM' },
    { peca_id: 7, fab_id: 14, cod: '941072', tipo: 'DAYCO' },
    { peca_id: 7, fab_id: 6, cod: '1987948250', tipo: 'BOSCH' },

    // GM Onix Disco (Peca 8)
    { peca_id: 8, fab_id: 2, cod: '26274004', tipo: 'OEM' },
    { peca_id: 8, fab_id: 8, cod: 'RCDI09120', tipo: 'FRAS-LE' },
    { peca_id: 8, fab_id: 7, cod: 'RPDI03990', tipo: 'TRW' },
    { peca_id: 8, fab_id: 9, cod: 'NKF 6112', tipo: 'NAKATA' },

    // GM Onix Pastilha (Peca 9)
    { peca_id: 9, fab_id: 2, cod: '26274005', tipo: 'OEM' },
    { peca_id: 9, fab_id: 8, cod: 'PD/1520', tipo: 'FRAS-LE' },
    { peca_id: 9, fab_id: 6, cod: '0 986 BB1 102', tipo: 'BOSCH' },

    // GM Onix Filtro Óleo (Peca 10)
    { peca_id: 10, fab_id: 2, cod: '55594651', tipo: 'OEM' },
    { peca_id: 10, fab_id: 11, cod: 'OX 1145D', tipo: 'MAHLE' },
    { peca_id: 10, fab_id: 12, cod: 'PEL 727', tipo: 'TECFIL' }
  ];

  const insertRef = db.prepare(`
    INSERT OR IGNORE INTO referencias_fabricante (peca_id, fabricante_id, codigo_referencia, tipo_referencia)
    VALUES (?, ?, ?, ?)
  `);
  refs.forEach(r => insertRef.run(r.peca_id, r.fab_id, r.cod, r.tipo));

  // Compatibilidade
  const compats = [
    { veic_id: 1, peca_id: 1, ini: 2017, fim: 2023, notas: 'Aplica-se às versões com rodas aro 14 e 15' },
    { veic_id: 1, peca_id: 2, ini: 2017, fim: 2023, notas: 'Sistema de freio Teves' },
    { veic_id: 1, peca_id: 3, ini: 2017, fim: 2023, notas: 'Lado direito e esquerdo idênticos' },
    { veic_id: 1, peca_id: 4, ini: 2016, fim: 2023, notas: 'Motores EA211 1.0 3 cilindros' },
    { veic_id: 1, peca_id: 5, ini: 2016, fim: 2023, notas: 'Caixa de ar padrão' },
    { veic_id: 1, peca_id: 6, ini: 2016, fim: 2023, notas: 'Kit com 3 velas' },
    { veic_id: 1, peca_id: 7, ini: 2016, fim: 2023, notas: 'Substituir a cada 60.000 km ou 4 anos' },

    { veic_id: 2, peca_id: 8, ini: 2020, fim: 2024, notas: 'Compatível com modelos Onix Hatch e Plus equipados com motor Turbo' },
    { veic_id: 2, peca_id: 9, ini: 2020, fim: 2024, notas: 'Eixo dianteiro com sensor acústico de desgaste' },
    { veic_id: 2, peca_id: 10, ini: 2020, fim: 2024, notas: 'Elemento de papel refil com anel o-ring' }
  ];

  const insertCompat = db.prepare(`
    INSERT OR IGNORE INTO compatibilidade (veiculo_id, peca_id, ano_inicio, ano_fim, notas_instalacao)
    VALUES (?, ?, ?, ?, ?)
  `);
  compats.forEach(c => insertCompat.run(c.veic_id, c.peca_id, c.ini, c.fim, c.notas));

  // Cotações
  const cotacoes = [
    { ref_id: 1, dist: 'Distribuidora Nakata Express', tab: 320.00, cot: 245.50, est: 18, pz: 1, av: 4.9 },
    { ref_id: 2, dist: 'Dasa Autopeças Brasil', tab: 310.00, cot: 229.90, est: 8, pz: 2, av: 4.7 },
    { ref_id: 3, dist: 'RDP Distribuidora de Freios', tab: 295.00, cot: 215.00, est: 12, pz: 1, av: 4.8 },
    { ref_id: 4, dist: 'Bezerra Autopeças Online', tab: 280.00, cot: 199.90, est: 4, pz: 3, av: 4.6 },
    { ref_id: 6, dist: 'Distribuidora Nakata Express', tab: 145.00, cot: 110.00, est: 25, pz: 1, av: 4.9 },
    { ref_id: 7, dist: 'Dasa Autopeças Brasil', tab: 138.00, cot: 98.50, est: 15, pz: 2, av: 4.7 },
    { ref_id: 8, dist: 'RDP Distribuidora de Freios', tab: 130.00, cot: 89.90, est: 30, pz: 1, av: 4.8 },
    { ref_id: 11, dist: 'Connect Parts Atacado', tab: 48.00, cot: 32.50, est: 50, pz: 1, av: 4.9 },
    { ref_id: 12, dist: 'Dasa Autopeças Brasil', tab: 45.00, cot: 28.90, est: 40, pz: 1, av: 4.7 }
  ];

  const insertCot = db.prepare(`
    INSERT OR IGNORE INTO cotacoes_fornecedores (referencia_id, distribuidor, preco_tabela, preco_cotado, estoque_disponivel, prazo_dias, avaliacao)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  cotacoes.forEach(ct => insertCot.run(ct.ref_id, ct.dist, ct.tab, ct.cot, ct.est, ct.pz, ct.av));

  console.log('[DB Seed] Banco de dados populado com sucesso!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
