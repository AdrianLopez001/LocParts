/**
 * Formata o contexto determinístico conforme a especificação do AutoQuote Copilot
 * para consumo direto por agentes autônomos (Claude Code, Anthropic API, etc.)
 */
function generateStructuredContext(resolutionData) {
  const { veiculo, itens } = resolutionData;

  const vehicleSummary = `${veiculo.marca} ${veiculo.modelo} ${veiculo.anoFabricacao}/${veiculo.anoModelo} ${veiculo.motorizacao}`;

  const lines = [];
  lines.push(`Veículo: ${vehicleSummary}`);

  itens.forEach((item, index) => {
    const itemNum = index + 1;
    const oemStr = `Ref. OEM: ${item.referenciaOem || 'N/D'}`;

    // Monta as principais referências aftermarket (Bosch, TRW, Fras-le, etc.)
    let aftermarketStr = '';
    if (item.referenciasAftermarket && item.referenciasAftermarket.length > 0) {
      const formattedRefs = item.referenciasAftermarket
        .slice(0, 3) // exibe até 3 referências principais
        .map(ref => `Ref. ${ref.fabricante}: ${ref.codigo}`)
        .join(' | ');
      aftermarketStr = ` | ${formattedRefs}`;
    }

    lines.push(`Item ${itemNum}: ${item.nomePeca} — ${oemStr}${aftermarketStr}`);
  });

  lines.push('Ação solicitada: montar orçamento e cotar os itens acima em fornecedores parceiros.');

  return lines.join('\n');
}

/**
 * Gera um prompt enriquecido com instruções de sistema para agentes de IA
 */
function generateAgentPrompt(resolutionData, instructions = '') {
  const context = generateStructuredContext(resolutionData);

  return `Você é o AutoQuote Copilot, um agente especialista em autopeças, cotações e orçamentos automotivos.

Abaixo estão os dados técnicos determinísticos decodificados para o veículo e peças solicitadas:

${context}

Instruções para o agente:
1. Verifique a compatibilidade exata de cada item para o veículo informado.
2. Identifique os melhores distribuidores parceiros com estoque imediato para as referências OEM e Aftermarket listadas.
3. Calcule o preço de venda sugerido com base na margem de oficina (30% sobre o custo) e mão de obra estimada.
4. Monte a resposta em formato de proposta comercial pronta para o cliente e código JSON estruturado para importação no ERP interno.

${instructions ? `Nota adicional do consultor: ${instructions}` : ''}
`;
}

module.exports = {
  generateStructuredContext,
  generateAgentPrompt
};
