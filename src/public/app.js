// AutoQuote Copilot - Client Application Logic

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const plateInput = document.getElementById('plate-input');
  const itemsInput = document.getElementById('items-input');
  const btnResolve = document.getElementById('btn-resolve');
  const btnQuote = document.getElementById('btn-quote');
  const btnCopyContext = document.getElementById('btn-copy-context');
  const btnViewPrompt = document.getElementById('btn-view-prompt');
  const btnExportJson = document.getElementById('btn-export-json');

  const loadingState = document.getElementById('loading-state');
  const loadingMessage = document.getElementById('loading-message');
  const errorBanner = document.getElementById('error-banner');
  const errorMessage = document.getElementById('error-message');
  const resultsContainer = document.getElementById('results-container');
  const budgetSection = document.getElementById('budget-section');

  const promptModal = document.getElementById('prompt-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalPromptContent = document.getElementById('modal-prompt-content');
  const btnCopyModalPrompt = document.getElementById('btn-copy-modal-prompt');

  // State
  let currentResolutionData = null;
  let currentBudgetData = null;

  // Preset Handlers
  document.querySelectorAll('.plate-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      plateInput.value = chip.dataset.plate;
      itemsInput.value = chip.dataset.items;
      executeResolution();
    });
  });

  document.querySelectorAll('.item-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const appendText = tag.dataset.append;
      const current = itemsInput.value.trim();
      if (!current) {
        itemsInput.value = appendText;
      } else if (!current.toLowerCase().includes(appendText.toLowerCase())) {
        itemsInput.value = current + ', ' + appendText;
      }
    });
  });

  // Action listeners
  btnResolve.addEventListener('click', () => executeResolution());
  btnQuote.addEventListener('click', () => executeQuotation());

  btnCopyContext.addEventListener('click', () => {
    if (!currentResolutionData) return;
    navigator.clipboard.writeText(currentResolutionData.structuredContext);
    const copyText = document.getElementById('copy-text');
    const copyIcon = document.getElementById('copy-icon');
    copyText.innerText = 'Copiado!';
    copyIcon.innerText = '✅';
    setTimeout(() => {
      copyText.innerText = 'Copiar Contexto';
      copyIcon.innerText = '📋';
    }, 2000);
  });

  btnViewPrompt.addEventListener('click', () => {
    if (!currentResolutionData) return;
    modalPromptContent.value = currentResolutionData.agentPrompt;
    promptModal.classList.remove('hidden');
  });

  btnCloseModal.addEventListener('click', () => {
    promptModal.classList.add('hidden');
  });

  btnCopyModalPrompt.addEventListener('click', () => {
    navigator.clipboard.writeText(modalPromptContent.value);
    btnCopyModalPrompt.innerText = 'Copiado para Área de Transferência!';
    setTimeout(() => {
      btnCopyModalPrompt.innerText = 'Copiar Prompt Completo';
    }, 2000);
  });

  btnExportJson.addEventListener('click', () => {
    if (!currentBudgetData) return;
    navigator.clipboard.writeText(JSON.stringify(currentBudgetData, null, 2));
    btnExportJson.innerHTML = '<span>✅ JSON Copiado para Área de Transferência!</span>';
    setTimeout(() => {
      btnExportJson.innerHTML = '<span>📦 Copiar JSON para ERP</span>';
    }, 2500);
  });

  // Executa Resolução Veicular & Peças
  async function executeResolution() {
    const plate = plateInput.value.trim();
    const items = itemsInput.value.trim();

    if (!plate || !items) {
      showError('Por favor, informe a placa do veículo e ao menos uma peça.');
      return;
    }

    showLoading('Consultando base de dados relacional e mapeando referências cruzadas...');
    budgetSection.classList.add('hidden');

    try {
      const res = await fetch(`/api/resolve?placa=${encodeURIComponent(plate)}&itens=${encodeURIComponent(items)}`);
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Erro na resolução veicular.');
      }

      currentResolutionData = json.data;
      renderVehicle(json.data.veiculo);
      renderParts(json.data.itens);
      renderStructuredContext(json.data.structuredContext);

      hideLoading();
      resultsContainer.classList.remove('hidden');
    } catch (err) {
      showError(err.message);
    }
  }

  // Executa Cotação Externa Autônoma
  async function executeQuotation() {
    const plate = plateInput.value.trim();
    const items = itemsInput.value.trim();

    if (!plate || !items) {
      showError('Por favor, informe a placa do veículo e ao menos uma peça.');
      return;
    }

    showLoading('Agente autônomo cotando preços em distribuidores parceiros...');

    try {
      const res = await fetch('/api/cotar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: plate, itens: items })
      });
      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Erro na cotação.');
      }

      currentBudgetData = json.data;
      // Garante que os dados do veículo e contexto estejam atualizados
      if (!currentResolutionData || currentResolutionData.veiculo.placa !== plate) {
        await executeResolution();
      }

      renderBudget(json.data);
      hideLoading();
      budgetSection.classList.remove('hidden');
      budgetSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      showError(err.message);
    }
  }

  // Renderizadores
  function renderVehicle(v) {
    document.getElementById('veh-title').innerText = `${v.marca} ${v.modelo} ${v.versao || ''}`;
    document.getElementById('veh-plate-badge').innerText = v.placa;
    document.getElementById('veh-marca').innerText = v.marca;
    document.getElementById('veh-anos').innerText = `${v.anoFabricacao} / ${v.anoModelo}`;
    document.getElementById('veh-motor').innerText = v.motorizacao;
    document.getElementById('veh-cambio').innerText = `${v.cambio || 'Manual'} / ${v.combustivel || 'Flex'}`;
    document.getElementById('veh-chassi').innerText = v.chassi || 'NÃO CADASTRADO';
  }

  function renderParts(items) {
    const partsGrid = document.getElementById('parts-grid');
    const counterBadge = document.getElementById('parts-counter');
    partsGrid.innerHTML = '';
    counterBadge.innerText = `${items.length} ${items.length === 1 ? 'item identificado' : 'itens identificados'}`;

    items.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'part-card';

      let aftermarketHtml = '';
      if (item.referenciasAftermarket && item.referenciasAftermarket.length > 0) {
        aftermarketHtml = item.referenciasAftermarket.map(ref => {
          const fabSlug = ref.fabricante.toLowerCase().replace(/[^a-z]/g, '-');
          return `
            <div class="ref-row">
              <span class="badge badge-brand-aftermarket badge-${fabSlug}">${ref.fabricante}</span>
              <span class="code-font font-bold">${ref.codigo}</span>
            </div>
          `;
        }).join('');
      } else {
        aftermarketHtml = '<div class="ref-row"><span class="text-dim">Nenhuma referência cadastrada</span></div>';
      }

      card.innerHTML = `
        <div class="part-card-header">
          <div>
            <div class="part-query-term">Item Solicitado: "${item.termoSolicitado || item.nomePeca}"</div>
            <div class="part-name">${item.nomePeca}</div>
          </div>
          <span class="badge badge-${item.compativel ? 'success' : 'amber'}">
            ${item.compativel ? 'Compatível' : 'Requer Validação'}
          </span>
        </div>

        <div class="cross-ref-box">
          <div class="cross-ref-title">Montadora (OEM Original)</div>
          <div class="ref-row">
            <span class="badge badge-oem">${item.fabricanteOem || 'OEM'}</span>
            <span class="code-font font-bold">${item.referenciaOem || 'N/D'}</span>
          </div>
        </div>

        <div class="cross-ref-box">
          <div class="cross-ref-title">Peças de Reposição (Aftermarket)</div>
          ${aftermarketHtml}
        </div>

        ${item.notasInstalacao ? `
          <div class="spec-label" style="font-size: 0.75rem; color: #94a3b8;">
            ℹ️ ${item.notasInstalacao}
          </div>
        ` : ''}
      `;

      partsGrid.appendChild(card);
    });
  }

  function renderStructuredContext(contextText) {
    document.getElementById('structured-context-pre').innerText = contextText;
  }

  function renderBudget(budget) {
    document.getElementById('budget-number').innerText = budget.orcamentoNumero;
    const tbody = document.getElementById('budget-items-tbody');
    tbody.innerHTML = '';

    budget.itens.forEach(it => {
      const tr = document.createElement('tr');
      const opt = it.melhorOpcao;

      tr.innerHTML = `
        <td>
          <strong>${it.nomePeca}</strong><br>
          <small class="text-dim">${it.categoria || 'Autopeças'}</small>
        </td>
        <td>
          <span class="badge badge-oem">OEM: ${it.referenciaOem || 'N/D'}</span><br>
          <small class="code-font">${opt ? `${opt.fabricante}: ${opt.codigoReferencia}` : '-'}</small>
        </td>
        <td>
          ${opt ? `<span style="color: #60a5fa; font-weight: 500;">${opt.distribuidor}</span><br><small class="text-dim">★ ${opt.avaliacaoDistribuidor || '4.8'}</small>` : 'Não cotado'}
        </td>
        <td>
          ${opt ? `<span class="badge badge-success">${opt.estoque} un.</span> <small>${opt.prazoEntregaDias} dia(s)</small>` : '-'}
        </td>
        <td class="text-right code-font">
          ${opt ? `R$ ${opt.precoCusto.toFixed(2)}` : '-'}
        </td>
        <td class="text-right code-font font-bold" style="color: var(--accent-cyan);">
          ${opt ? `R$ ${opt.precoVendaSugerido.toFixed(2)}` : '-'}
        </td>
      `;

      tbody.appendChild(tr);
    });

    const f = budget.resumoFinanceiro;
    document.getElementById('sum-pecas-venda').innerText = `R$ ${f.totalPecasVenda.toFixed(2)}`;
    document.getElementById('sum-mao-obra').innerText = `R$ ${f.maoDeObraEstimada.toFixed(2)}`;
    document.getElementById('sum-total-orcamento').innerText = `R$ ${f.valorTotalOrcamento.toFixed(2)}`;
    document.getElementById('sum-lucro').innerText = `R$ ${f.lucroEstimado.toFixed(2)}`;
    document.getElementById('sum-condicoes').innerText = f.condicoesPagamento;
  }

  // Utilities
  function showLoading(msg) {
    loadingMessage.innerText = msg;
    loadingState.classList.remove('hidden');
    errorBanner.classList.add('hidden');
  }

  function hideLoading() {
    loadingState.classList.add('hidden');
  }

  function showError(msg) {
    errorMessage.innerText = msg;
    errorBanner.classList.remove('hidden');
    loadingState.classList.add('hidden');
  }

  // Execução inicial ao carregar a página
  executeResolution();
});
