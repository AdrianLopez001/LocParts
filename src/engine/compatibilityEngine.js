const { query } = require('../config/database');

/**
 * Cruza o veículo identificado e as peças para obter compatibilidade e referências de fabricante
 */
async function resolveCompatibilityAndReferences(vehicle, matchedParts) {
  if (!vehicle || !vehicle.id) {
    throw new Error('Veículo inválido ou não especificado.');
  }

  const resolvedItems = [];

  for (const item of matchedParts) {
    if (item.naoLocalizado || !item.id) {
      resolvedItems.push({
        ...item,
        compativel: false,
        motivoIncompatibilidade: 'Peça não localizada no catálogo mestre',
        referencias: { oem: null, aftermarket: [] }
      });
      continue;
    }

    // 1. Verifica compatibilidade com o veículo específico
    const compatSql = `
      SELECT 
        ano_inicio,
        ano_fim,
        notas_instalacao
      FROM compatibilidade
      WHERE veiculo_id = ? AND peca_id = ?
      LIMIT 1
    `;
    const compatRows = await query(compatSql, [vehicle.id, item.id]);
    const compatData = compatRows.length > 0 ? compatRows[0] : null;

    let isCompatible = true;
    let compatNotes = '';

    if (compatData) {
      compatNotes = compatData.notas_instalacao || '';
      // Checa faixa de ano se especificada
      const anoVeiculo = vehicle.anoModelo || vehicle.anoFabricacao;
      if (compatData.ano_inicio && anoVeiculo < compatData.ano_inicio) {
        isCompatible = false;
      }
      if (compatData.ano_fim && anoVeiculo > compatData.ano_fim) {
        isCompatible = false;
      }
    } else {
      // Se não há vínculo direto registrado na PoC, marcamos para revisão
      isCompatible = false;
      compatNotes = 'Sem compatibilidade direta homologada para este chassi/modelo';
    }

    // 2. Busca todas as referências de fabricante (OEM e Aftermarket)
    const refSql = `
      SELECT 
        rf.id as referencia_id,
        rf.codigo_referencia,
        rf.tipo_referencia,
        f.nome as fabricante_nome,
        f.tipo as fabricante_tipo,
        f.origem as fabricante_origem
      FROM referencias_fabricante rf
      INNER JOIN fabricantes f ON rf.fabricante_id = f.id
      WHERE rf.peca_id = ?
      ORDER BY f.tipo DESC, f.nome ASC
    `;
    const refRows = await query(refSql, [item.id]);

    let oemRef = null;
    const aftermarketRefs = [];

    for (const r of refRows) {
      const refObj = {
        referenciaId: r.referencia_id,
        codigo: r.codigo_referencia,
        fabricante: r.fabricante_nome,
        tipo: r.fabricante_tipo,
        tipoReferencia: r.tipo_referencia
      };

      if (r.fabricante_tipo === 'OEM' && !oemRef) {
        oemRef = refObj;
      } else {
        aftermarketRefs.push(refObj);
      }
    }

    resolvedItems.push({
      pecaId: item.id,
      codigoInterno: item.codigo_interno,
      termoSolicitado: item.termoOriginal,
      nomePeca: item.nome,
      categoria: item.categoria,
      posicao: item.posicao,
      descricao: item.descricao,
      compativel: isCompatible,
      notasInstalacao: compatNotes,
      referenciaOem: oemRef ? oemRef.codigo : 'N/D',
      fabricanteOem: oemRef ? oemRef.fabricante : 'Montadora',
      referenciasAftermarket: aftermarketRefs,
      referenciasFormatadas: {
        oem: oemRef ? oemRef.codigo : 'N/D',
        aftermarket: aftermarketRefs.map(a => `${a.fabricante}: ${a.codigo}`).join(' | ')
      }
    });
  }

  return {
    veiculo: vehicle,
    itens: resolvedItems
  };
}

module.exports = {
  resolveCompatibilityAndReferences
};
