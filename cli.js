#!/usr/bin/env node
const { resolveVehicle } = require('./src/engine/vehicleResolver');
const { matchInformalItems } = require('./src/engine/partsMatcher');
const { resolveCompatibilityAndReferences } = require('./src/engine/compatibilityEngine');
const { generateStructuredContext, generateAgentPrompt } = require('./src/engine/contextGenerator');
const { generateConsolidatedBudget } = require('./src/engine/quotationEngine');

function parseArgs(args) {
  const parsed = {
    placa: null,
    itens: null,
    json: false,
    cotar: false,
    prompt: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--placa' || arg === '-p') {
      parsed.placa = args[++i];
    } else if (arg === '--itens' || arg === '-i') {
      parsed.itens = args[++i];
    } else if (arg === '--json' || arg === '-j') {
      parsed.json = true;
    } else if (arg === '--cotar' || arg === '-c') {
      parsed.cotar = true;
    } else if (arg === '--prompt') {
      parsed.prompt = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
🚗 AutoQuote Copilot | Automotive Parts Matcher & AI Quotation Engine
====================================================================

Uso:
  node cli.js --placa <PLACA> --itens "<ITENS>" [opções]

Exemplo:
  node cli.js --placa ABC1D23 --itens "disco de freio dianteiro, pastilha"

Opções:
  --placa, -p     Placa do veículo (padrão Mercosul ex: ABC1D23 ou antigo ex: ABC1234)
  --itens, -i     Lista de peças solicitadas em linguagem informal (separadas por vírgula)
  --cotar, -c     Executa simulação de cotação externa em distribuidores e orçamentação
  --prompt        Exibe o prompt instrucional completo para o agente de IA
  --json, -j      Gera a saída estruturada em formato JSON
  --help, -h      Exibe esta tela de ajuda
`);
}

async function main() {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (options.help || (!options.placa && !options.itens)) {
    printHelp();
    process.exit(0);
  }

  if (!options.placa) {
    console.error('❌ Erro: O parâmetro --placa é obrigatório.');
    process.exit(1);
  }

  if (!options.itens) {
    console.error('❌ Erro: O parâmetro --itens é obrigatório.');
    process.exit(1);
  }

  try {
    // 1. Resolução veicular por placa
    const vehicle = await resolveVehicle(options.placa);
    if (!vehicle) {
      console.error(`❌ Veículo com a placa '${options.placa}' não foi localizado no cadastro.`);
      process.exit(1);
    }

    // 2. Matching de peças informais
    const matchedParts = await matchInformalItems(options.itens);

    // 3. Cruzamento de compatibilidade e referências de fabricante
    const resolution = await resolveCompatibilityAndReferences(vehicle, matchedParts);

    // 4. Se solicitado modo cotação completa
    if (options.cotar) {
      const budget = await generateConsolidatedBudget(resolution);
      if (options.json) {
        console.log(JSON.stringify(budget, null, 2));
      } else {
        console.log('\n======================================================');
        console.log(`📋 ORÇAMENTO CONSOLIDADO: ${budget.orcamentoNumero}`);
        console.log(`🚗 Veículo: ${vehicle.descricaoCompleta}`);
        console.log('======================================================\n');
        budget.itens.forEach((it, idx) => {
          console.log(`Item ${idx + 1}: ${it.nomePeca}`);
          console.log(`  - Ref. OEM: ${it.referenciaOem}`);
          if (it.melhorOpcao) {
            console.log(`  - Melhor Fornecedor: ${it.melhorOpcao.distribuidor}`);
            console.log(`  - Ref. Fornecedor: ${it.melhorOpcao.fabricante} (${it.melhorOpcao.codigoReferencia})`);
            console.log(`  - Custo: R$ ${it.melhorOpcao.precoCusto.toFixed(2)} | Venda Sugerida: R$ ${it.melhorOpcao.precoVendaSugerido.toFixed(2)}`);
            console.log(`  - Estoque: ${it.melhorOpcao.estoque} un. | Prazo: ${it.melhorOpcao.prazoEntregaDias} dia(s)`);
          }
          console.log('');
        });
        console.log('------------------------------------------------------');
        console.log(`Total Peças (Venda): R$ ${budget.resumoFinanceiro.totalPecasVenda.toFixed(2)}`);
        console.log(`Mão de Obra Estimada: R$ ${budget.resumoFinanceiro.maoDeObraEstimada.toFixed(2)}`);
        console.log(`VALOR TOTAL: R$ ${budget.resumoFinanceiro.valorTotalOrcamento.toFixed(2)}`);
        console.log(`Lucro Bruto Estimado: R$ ${budget.resumoFinanceiro.lucroEstimado.toFixed(2)}`);
        console.log(`Condições: ${budget.resumoFinanceiro.condicoesPagamento}`);
        console.log('======================================================\n');
      }
      return;
    }

    // 5. Se solicitado JSON
    if (options.json) {
      console.log(JSON.stringify(resolution, null, 2));
      return;
    }

    // 6. Se solicitado prompt completo
    if (options.prompt) {
      console.log(generateAgentPrompt(resolution));
      return;
    }

    // 7. Saída padrão (Contexto estruturado determinístico especificado no README)
    const context = generateStructuredContext(resolution);
    console.log(context);

  } catch (err) {
    console.error('❌ Falha ao processar solicitação:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
