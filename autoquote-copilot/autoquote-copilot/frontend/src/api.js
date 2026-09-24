const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function gerarOrcamento(placa, itensTexto) {
  const itens = itensTexto
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean);

  const response = await fetch(`${API_URL}/api/orcamentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placa, itens }),
  });

  if (!response.ok) {
    const erro = await response.json().catch(() => ({}));
    throw new Error(erro.erro || `Erro ${response.status} ao gerar orcamento`);
  }

  return response.json();
}

export async function listarVeiculos() {
  const response = await fetch(`${API_URL}/api/veiculos`);
  if (!response.ok) throw new Error('Erro ao listar veiculos');
  return response.json();
}
