const { query } = require('../config/database');

/**
 * Remove acentos e normaliza texto
 */
function cleanText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Dicionário de sinônimos e termos automotivos comuns
 */
const AUTOMOTIVE_SYNONYMS = {
  'pastilha': ['pastilha', 'pastilhas', 'jogo de pastilha', 'pastilha de freio'],
  'disco': ['disco', 'discos', 'disco de freio', 'disco ventilado'],
  'amortecedor': ['amortecedor', 'amortecedores', 'suspensao', 'pressurizado'],
  'filtro de oleo': ['filtro de oleo', 'filtro oleo', 'oleo filtro'],
  'filtro de ar': ['filtro de ar', 'filtro ar', 'elemento de ar'],
  'vela': ['vela', 'velas', 'vela de ignicao', 'velas de ignicao', 'ignicao'],
  'correia': ['correia', 'correia dentada', 'distribuicao', 'correia de comando']
};

/**
 * Separa a lista informal de itens (por vírgula, ponto e vírgula, quebra de linha ou ' e ')
 */
function parseRawItems(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return [];

  // Divide por vírgula, ';' ou quebra de linha
  let tokens = rawInput.split(/[,;\n\r]+/);

  const items = [];
  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    // Se houver " e " ligando termos diferentes, opcionalmente separa se não for composto
    if (token.includes(' e ') && !token.toLowerCase().includes('disco e pastilha')) {
      const sub = token.split(/\se\s/i);
      sub.forEach(s => {
        const cleaned = s.trim();
        if (cleaned) items.push(cleaned);
      });
    } else {
      items.push(token);
    }
  }

  return items;
}

/**
 * Busca peças no catálogo correspondentes ao termo informal informado
 */
async function matchItemToCatalog(term) {
  const normTerm = cleanText(term);
  const catalogParts = await query('SELECT id, codigo_interno, nome, categoria, posicao, descricao FROM pecas');

  let bestMatch = null;
  let highestScore = 0;

  for (const part of catalogParts) {
    const normPartName = cleanText(part.nome);
    const normPartCat = cleanText(part.categoria);
    const normPartPos = cleanText(part.posicao || '');
    const normPartDesc = cleanText(part.descricao || '');

    let score = 0;

    // Correspondência exata ou substring
    if (normPartName.includes(normTerm)) {
      score += 100;
    } else if (normTerm.includes(normPartName)) {
      score += 80;
    }

    // Match de palavras-chave individuais
    const termWords = normTerm.split(/\s+/).filter(w => w.length > 2 && !['para', 'com', 'que', 'dos', 'das'].includes(w));
    let matchedWords = 0;
    for (const word of termWords) {
      if (normPartName.includes(word) || normPartCat.includes(word) || normPartPos.includes(word) || normPartDesc.includes(word)) {
        matchedWords++;
      }
    }

    if (termWords.length > 0) {
      score += (matchedWords / termWords.length) * 60;
    }

    // Avaliação de sinônimos conhecidos
    for (const [key, synonyms] of Object.entries(AUTOMOTIVE_SYNONYMS)) {
      const termHasSyn = synonyms.some(syn => normTerm.includes(syn));
      const partHasSyn = synonyms.some(syn => normPartName.includes(syn));
      if (termHasSyn && partHasSyn) {
        score += 50;
      }
    }

    if (score > highestScore && score >= 40) {
      highestScore = score;
      bestMatch = {
        ...part,
        termoOriginal: term,
        scoreConfianca: Math.min(100, Math.round(score))
      };
    }
  }

  return bestMatch;
}

/**
 * Resolve múltiplos itens informais contra o catálogo mestre
 */
async function matchInformalItems(rawInput) {
  const terms = parseRawItems(rawInput);
  const results = [];

  for (const term of terms) {
    const matched = await matchItemToCatalog(term);
    if (matched) {
      results.push(matched);
    } else {
      results.push({
        id: null,
        termoOriginal: term,
        nome: term,
        categoria: 'Não identificada',
        naoLocalizado: true,
        scoreConfianca: 0
      });
    }
  }

  return results;
}

module.exports = {
  cleanText,
  parseRawItems,
  matchItemToCatalog,
  matchInformalItems
};
