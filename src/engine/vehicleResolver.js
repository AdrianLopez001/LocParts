const { query } = require('../config/database');

/**
 * Normaliza e sanitiza a placa veicular
 */
function normalizePlate(plate) {
  if (!plate || typeof plate !== 'string') return '';
  return plate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Valida se a placa segue padrão Mercosul (ex: ABC1D23) ou Antigo Brasileiro (ex: ABC1234)
 */
function isValidPlate(plate) {
  const clean = normalizePlate(plate);
  const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  const antigoRegex = /^[A-Z]{3}[0-9]{4}$/;
  return mercosulRegex.test(clean) || antigoRegex.test(clean);
}

/**
 * Resolve os dados do veículo a partir da placa
 */
async function resolveVehicle(plate) {
  const cleanPlate = normalizePlate(plate);

  if (!cleanPlate) {
    throw new Error('Placa não informada.');
  }

  const sql = `
    SELECT 
      id,
      placa,
      chassi,
      marca,
      modelo,
      ano_fabricacao,
      ano_modelo,
      motorizacao,
      versao,
      combustivel,
      cambio
    FROM veiculos 
    WHERE placa = ?
    LIMIT 1
  `;

  const rows = await query(sql, [cleanPlate]);

  if (!rows || rows.length === 0) {
    return null;
  }

  const v = rows[0];
  return {
    id: v.id,
    placa: v.placa,
    chassi: v.chassi,
    marca: v.marca,
    modelo: v.modelo,
    anoFabricacao: v.ano_fabricacao,
    anoModelo: v.ano_modelo,
    motorizacao: v.motorizacao,
    versao: v.versao,
    combustivel: v.combustivel,
    cambio: v.cambio,
    descricaoCompleta: `${v.marca} ${v.modelo} ${v.versao} ${v.ano_fabricacao}/${v.ano_modelo} ${v.motorizacao}`
  };
}

module.exports = {
  normalizePlate,
  isValidPlate,
  resolveVehicle
};
