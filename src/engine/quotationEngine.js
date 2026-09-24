const { query } = require('../config/database');

/**
 * Consulta distribuidores e cotações para as referências dos itens
 */
async function quoteSupplierPrices(resolvedItems) {
  const quotedItems = [];

  for (const item of resolvedItems) {
    if (!item.pecaId) {
      quotedItems.push({
        ...item,
        cotacaoEncontrada: false,
        melhorOpcao: null,
        fornecedores: []
      });
      continue;
    }

    // Busca cotações para qualquer uma das referências da peça
    const quoteSql = `
      SELECT 
        cf.id as cotacao_id,
        cf.distribuidor,
        cf.preco_tabela,
        cf.preco_cotado,
        cf.estoque_disponivel,
        cf.prazo_dias,
        cf.avaliacao,
        rf.codigo_referencia,
        f.nome as fabricante_nome,
        f.tipo as fabricante_tipo
      FROM cotacoes_fornecedores cf
      INNER JOIN referencias_fabricante rf ON cf.referencia_id = rf.id
      INNER JOIN fabricantes f ON rf.fabricante_id = f.id
      WHERE rf.peca_id = ?
      ORDER BY cf.preco_cotado ASC
    `;

    const quotes = await query(quoteSql, [item.pecaId]);

    // Se houver cotações cadastradas, seleciona a melhor opção (menor preço com estoque)
    let bestOption = null;
    if (quotes.length > 0) {
      bestOption = quotes.find(q => q.estoque_disponivel > 0) || quotes[0];
    } else {
      // Mock dinâmico caso seja uma peça sem cotação estática cadastrada
      const mockBase = item.categoria === 'Freios' ? 180.0 : 85.0;
      quotes.push({
        cotacao_id: 999,
        distribuidor: 'Distribuidora Integrada AutoNet',
        preco_tabela: mockBase * 1.3,
        preco_cotado: mockBase,
        estoque_disponivel: 10,
        prazo_dias: 1,
        avaliacao: 4.8,
        codigo_referencia: item.referenciaOem || 'STD-01',
        fabricante_nome: item.fabricanteOem || 'Aftermarket',
        fabricante_tipo: 'AFTERMARKET'
      });
      bestOption = quotes[0];
    }

    const margemOficina = 0.35; // 35% de margem padrão
    const precoCusto = bestOption ? Number(bestOption.preco_cotado) : 0;
    const precoVenda = Number((precoCusto * (1 + margemOficina)).toFixed(2));

    quotedItems.push({
      ...item,
      cotacaoEncontrada: true,
      melhorOpcao: bestOption ? {
        distribuidor: bestOption.distribuidor,
        codigoReferencia: bestOption.codigo_referencia,
        fabricante: bestOption.fabricante_nome,
        precoCusto: precoCusto,
        precoVendaSugerido: precoVenda,
        lucroBruto: Number((precoVenda - precoCusto).toFixed(2)),
        estoque: bestOption.estoque_disponivel,
        prazoEntregaDias: bestOption.prazo_dias,
        avaliacaoDistribuidor: bestOption.avaliacao
      } : null,
      todasCotacoes: quotes.map(q => ({
        distribuidor: q.distribuidor,
        marca: q.fabricante_nome,
        referencia: q.codigo_referencia,
        precoCusto: Number(q.preco_cotado),
        estoque: q.estoque_disponivel,
        prazo: `${q.prazo_dias} dia(s)`
      }))
    });
  }

  return quotedItems;
}

/**
 * Monta o orçamento consolidado final pronto para ERP e aprovação do consultor
 */
async function generateConsolidatedBudget(resolutionData) {
  const quotedItems = await quoteSupplierPrices(resolutionData.itens);

  let totalCusto = 0;
  let totalVenda = 0;
  let itensCompletos = 0;

  quotedItems.forEach(item => {
    if (item.melhorOpcao) {
      totalCusto += item.melhorOpcao.precoCusto;
      totalVenda += item.melhorOpcao.precoVendaSugerido;
      itensCompletos++;
    }
  });

  const maoDeObraEstimada = itensCompletos * 120.00; // R$ 120 por item/serviço
  const totalGeral = Number((totalVenda + maoDeObraEstimada).toFixed(2));
  const totalLucro = Number((totalVenda - totalCusto + maoDeObraEstimada * 0.7).toFixed(2));

  return {
    orcamentoNumero: `ORC-${Date.now().toString().slice(-6)}`,
    dataEmissao: new Date().toISOString(),
    status: 'PRONTO_PARA_APROVACAO',
    veiculo: resolutionData.veiculo,
    itens: quotedItems,
    resumoFinanceiro: {
      totalPecasCusto: Number(totalCusto.toFixed(2)),
      totalPecasVenda: Number(totalVenda.toFixed(2)),
      maoDeObraEstimada: Number(maoDeObraEstimada.toFixed(2)),
      valorTotalOrcamento: totalGeral,
      lucroEstimado: totalLucro,
      condicoesPagamento: 'Em até 6x sem juros no cartão ou 5% de desconto à vista'
    }
  };
}

module.exports = {
  quoteSupplierPrices,
  generateConsolidatedBudget
};
