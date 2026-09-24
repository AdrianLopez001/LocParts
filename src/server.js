const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const { resolveVehicle } = require('./engine/vehicleResolver');
const { matchInformalItems } = require('./engine/partsMatcher');
const { resolveCompatibilityAndReferences } = require('./engine/compatibilityEngine');
const { generateStructuredContext, generateAgentPrompt } = require('./engine/contextGenerator');
const { generateConsolidatedBudget } = require('./engine/quotationEngine');
const { query } = require('./config/database');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- Rotas de API ---

  // GET /api/veiculos (Lista de veículos cadastrados na base)
  if (pathname === '/api/veiculos' && method === 'GET') {
    try {
      const veiculos = await query('SELECT id, placa, marca, modelo, ano_fabricacao, ano_modelo, motorizacao, versao FROM veiculos ORDER BY marca ASC');
      return sendJson(res, 200, { success: true, data: veiculos });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // GET /api/resolve (Resolução veicular + matching de peças + contexto)
  if (pathname === '/api/resolve' && method === 'GET') {
    try {
      const placa = parsedUrl.query.placa;
      const itensRaw = parsedUrl.query.itens;

      if (!placa || !itensRaw) {
        return sendJson(res, 400, { success: false, error: 'Parâmetros "placa" e "itens" são obrigatórios.' });
      }

      const veiculo = await resolveVehicle(placa);
      if (!veiculo) {
        return sendJson(res, 404, { success: false, error: `Veículo com a placa '${placa}' não encontrado.` });
      }

      const matchedParts = await matchInformalItems(itensRaw);
      const resolution = await resolveCompatibilityAndReferences(veiculo, matchedParts);
      const structuredContext = generateStructuredContext(resolution);
      const agentPrompt = generateAgentPrompt(resolution);

      return sendJson(res, 200, {
        success: true,
        data: {
          veiculo: resolution.veiculo,
          itens: resolution.itens,
          structuredContext,
          agentPrompt
        }
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, error: err.message });
    }
  }

  // POST /api/cotar (Simulação de cotação em fornecedores e orçamento ERP)
  if (pathname === '/api/cotar' && method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { placa, itens } = payload;

        if (!placa || !itens) {
          return sendJson(res, 400, { success: false, error: 'Campos "placa" e "itens" são obrigatórios.' });
        }

        const veiculo = await resolveVehicle(placa);
        if (!veiculo) {
          return sendJson(res, 404, { success: false, error: `Veículo com a placa '${placa}' não encontrado.` });
        }

        const matchedParts = await matchInformalItems(itens);
        const resolution = await resolveCompatibilityAndReferences(veiculo, matchedParts);
        const budget = await generateConsolidatedBudget(resolution);

        return sendJson(res, 200, { success: true, data: budget });
      } catch (err) {
        return sendJson(res, 500, { success: false, error: err.message });
      }
    });
    return;
  }

  // --- Servidor de Arquivos Estáticos (Frontend) ---
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);

  // Prevenção básica de Directory Traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Acesso Negado');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Arquivo Não Encontrado');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 AutoQuote Copilot rodando na porta ${PORT}`);
    console.log(`🌐 Acesse no navegador: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
  });
}

module.exports = { server };
