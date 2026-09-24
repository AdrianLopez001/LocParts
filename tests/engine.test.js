const assert = require('assert');
const { normalizePlate, isValidPlate, resolveVehicle } = require('../src/engine/vehicleResolver');
const { parseRawItems, matchInformalItems } = require('../src/engine/partsMatcher');
const { resolveCompatibilityAndReferences } = require('../src/engine/compatibilityEngine');
const { generateStructuredContext } = require('../src/engine/contextGenerator');
const { generateConsolidatedBudget } = require('../src/engine/quotationEngine');

async function runTests() {
  console.log('🧪 Iniciando suíte de testes do AutoQuote Copilot...\n');
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  async function testAsync(name, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // 1. Testes de Placa e Veículo
  test('Placa - Normalização e Sanitização', () => {
    assert.strictEqual(normalizePlate('abc-1d23'), 'ABC1D23');
    assert.strictEqual(normalizePlate(' abc 1234 '), 'ABC1234');
    assert.strictEqual(normalizePlate('bra-2e19'), 'BRA2E19');
  });

  test('Placa - Validação de Padrão Mercosul e Antigo', () => {
    assert.strictEqual(isValidPlate('ABC1D23'), true);
    assert.strictEqual(isValidPlate('BRA2E19'), true);
    assert.strictEqual(isValidPlate('ABC1234'), true);
    assert.strictEqual(isValidPlate('1234ABC'), false);
    assert.strictEqual(isValidPlate('ABCD123'), false);
  });

  await testAsync('Veículo - Resolução no banco de dados', async () => {
    const v = await resolveVehicle('ABC1D23');
    assert.ok(v, 'Veículo ABC1D23 deve ser encontrado');
    assert.strictEqual(v.marca, 'Volkswagen');
    assert.strictEqual(v.modelo, 'Gol');
    assert.strictEqual(v.motorizacao, '1.0 12V MPI');
  });

  // 2. Testes de Parser e Matching de Peças
  test('Parser - Extração de Itens Informais', () => {
    const raw = 'disco de freio dianteiro, pastilha; filtro de oleo';
    const items = parseRawItems(raw);
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0], 'disco de freio dianteiro');
    assert.strictEqual(items[1], 'pastilha');
    assert.strictEqual(items[2], 'filtro de oleo');
  });

  await testAsync('Matching - Mapeamento com catálogo mestre', async () => {
    const matched = await matchInformalItems('disco de freio dianteiro, pastilha');
    assert.strictEqual(matched.length, 2);
    assert.ok(matched[0].nome.includes('Disco de freio'));
    assert.ok(matched[1].nome.includes('Pastilha de freio'));
  });

  // 3. Testes de Compatibilidade e Referências Cruzadas
  await testAsync('Compatibilidade - Referências OEM e Aftermarket', async () => {
    const vehicle = await resolveVehicle('ABC1D23');
    const matched = await matchInformalItems('disco de freio dianteiro, pastilha');
    const res = await resolveCompatibilityAndReferences(vehicle, matched);

    assert.strictEqual(res.itens.length, 2);
    const disco = res.itens[0];
    assert.strictEqual(disco.referenciaOem, '5U0615301');
    assert.ok(disco.referenciasAftermarket.some(r => r.fabricante === 'Bosch'));
    assert.ok(disco.referenciasAftermarket.some(r => r.fabricante === 'Fras-le'));
  });

  // 4. Testes do Gerador de Contexto para Agente
  await testAsync('Contexto - Formato Determinístico do Prompt', async () => {
    const vehicle = await resolveVehicle('ABC1D23');
    const matched = await matchInformalItems('disco de freio dianteiro, pastilha');
    const res = await resolveCompatibilityAndReferences(vehicle, matched);
    const context = generateStructuredContext(res);

    assert.ok(context.includes('Veículo: Volkswagen Gol 2021/2022 1.0 12V MPI'));
    assert.ok(context.includes('Item 1: Disco de freio dianteiro ventilado — Ref. OEM: 5U0615301'));
    assert.ok(context.includes('Item 2: Pastilha de freio dianteira — Ref. OEM: 5U0698151A'));
    assert.ok(context.includes('Ação solicitada: montar orçamento e cotar os itens acima em fornecedores parceiros.'));
  });

  // 5. Testes do Motor de Cotação e Orçamento
  await testAsync('Cotação - Montagem do Orçamento Consolidado', async () => {
    const vehicle = await resolveVehicle('ABC1D23');
    const matched = await matchInformalItems('disco de freio dianteiro, pastilha');
    const res = await resolveCompatibilityAndReferences(vehicle, matched);
    const budget = await generateConsolidatedBudget(res);

    assert.ok(budget.orcamentoNumero.startsWith('ORC-'));
    assert.ok(budget.resumoFinanceiro.valorTotalOrcamento > 0);
    assert.ok(budget.resumoFinanceiro.totalPecasVenda > budget.resumoFinanceiro.totalPecasCusto);
    assert.strictEqual(budget.status, 'PRONTO_PARA_APROVACAO');
  });

  console.log(`\n------------------------------------------------------`);
  console.log(`📊 Resultado dos Testes: ${passed} passaram | ${failed} falharam.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 Todos os testes passaram com sucesso!');
  }
}

runTests();
