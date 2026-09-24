const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const MOCK_VEICULOS = [
  { placa: 'ABC1D23', marca: 'Volkswagen', modelo: 'Gol', ano: 2015, motorizacao: '1.6', versao: 'Trendline' },
  { placa: 'XYZ2E45', marca: 'Chevrolet', modelo: 'Onix', ano: 2019, motorizacao: '1.0', versao: 'LT' },
  { placa: 'JJK9B12', marca: 'Fiat', modelo: 'Argo', ano: 2021, motorizacao: '1.3', versao: 'Drive' },
];

const MOCK_ORCAMENTO_EXEMPLO = {
  orcamentoId: 1,
  veiculo: { placa: 'ABC1D23', marca: 'Volkswagen', modelo: 'Gol', ano: 2015, motorizacao: '1.6' },
  contextoGerado:
    'Veiculo: Volkswagen Gol 2015 1.6 (placa ABC1D23)\nItem 1: Disco de freio dianteiro — Ref. OEM (Volkswagen): 5U0615301A | Ref. AFTERMARKET (Fras-le): FD1234 | Ref. AFTERMARKET (TRW): DF6098\nItem 2: Pastilha de freio dianteira — Ref. OEM (Volkswagen): 5U0698151 | Ref. AFTERMARKET (Bosch): BP1234\nItem 3: Filtro de oleo — Ref. OEM (Volkswagen): 06A115561B | Ref. AFTERMARKET (Tecfil): PSL123',
  itens: [
    {
      descricaoSolicitada: 'disco de freio dianteiro',
      encontrado: true,
      pecaNomeGenerico: 'Disco de freio dianteiro',
      referenciaOem: '5U0615301A',
      referenciaFabricante: 'FD1234',
      fabricante: 'Fras-le',
      fornecedorCotado: 'AutoPecas Norte (Mock)',
      preco: 289.4,
    },
    {
      descricaoSolicitada: 'pastilha de freio dianteira',
      encontrado: true,
      pecaNomeGenerico: 'Pastilha de freio dianteira',
      referenciaOem: '5U0698151',
      referenciaFabricante: 'BP1234',
      fabricante: 'Bosch',
      fornecedorCotado: 'Distribuidora Central (Mock)',
      preco: 145.9,
    },
    {
      descricaoSolicitada: 'filtro de oleo',
      encontrado: true,
      pecaNomeGenerico: 'Filtro de oleo',
      referenciaOem: '06A115561B',
      referenciaFabricante: 'PSL123',
      fabricante: 'Tecfil',
      fornecedorCotado: 'AutoPecas Norte (Mock)',
      preco: 42.0,
    },
  ],
  total: 477.3,
};

export async function gerarOrcamento(placa, itensTexto) {
  const itens = itensTexto
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean);

  try {
    const response = await fetch(`${API_URL}/api/orcamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placa, itens }),
    });

    if (!response.ok) {
      const erro = await response.json().catch(() => ({}));
      throw new Error(erro.erro || `Erro ${response.status} ao gerar orcamento`);
    }

    return await response.json();
  } catch (err) {
    console.warn('Backend indisponível, utilizando dados mockados de demonstração didática:', err.message);
    const veiculo = MOCK_VEICULOS.find((v) => v.placa.toUpperCase() === placa.toUpperCase());
    if (!veiculo) {
      throw new Error(`Veículo não encontrado para a placa: ${placa} (Use ABC1D23, XYZ2E45 ou JJK9B12)`);
    }
    return {
      ...MOCK_ORCAMENTO_EXEMPLO,
      veiculo,
    };
  }
}

export async function listarVeiculos() {
  try {
    const response = await fetch(`${API_URL}/api/veiculos`);
    if (!response.ok) throw new Error('Erro ao listar veiculos');
    return await response.json();
  } catch (err) {
    console.warn('Backend indisponível, carregando veículos mockados didáticos.');
    return MOCK_VEICULOS;
  }
}
