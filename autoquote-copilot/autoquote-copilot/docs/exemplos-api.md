# Exemplos de uso da API

## POST /api/orcamentos

**Request**

```json
{
  "placa": "ABC1D23",
  "itens": [
    "disco de freio dianteiro",
    "pastilha de freio dianteira",
    "filtro de oleo"
  ]
}
```

**Response (200)**

```json
{
  "orcamentoId": 1,
  "veiculo": {
    "placa": "ABC1D23",
    "marca": "Volkswagen",
    "modelo": "Gol",
    "ano": 2015,
    "motorizacao": "1.6"
  },
  "contextoGerado": "Veiculo: Volkswagen Gol 2015 1.6 (placa ABC1D23)\nItem 1: Disco de freio dianteiro — Ref. OEM (Volkswagen): 5U0615301A | Ref. AFTERMARKET (Fras-le): FD1234 | Ref. AFTERMARKET (TRW): DF6098\n...",
  "itens": [
    {
      "descricaoSolicitada": "disco de freio dianteiro",
      "encontrado": true,
      "pecaNomeGenerico": "Disco de freio dianteiro",
      "referenciaOem": "5U0615301A",
      "referenciaFabricante": "FD1234",
      "fabricante": "Fras-le",
      "fornecedorCotado": "AutoPecas Norte",
      "preco": 289.40
    }
  ],
  "total": 289.40
}
```

## GET /api/veiculos

Lista os veículos cadastrados na PoC (dados mockados).

## GET /api/pecas

Lista o catálogo de peças genéricas disponíveis para matching.

## Placa não cadastrada

```bash
curl -X POST http://localhost:8080/api/orcamentos \
  -H "Content-Type: application/json" \
  -d '{"placa": "ZZZ9Z99", "itens": ["disco de freio dianteiro"]}'
```

```json
{
  "timestamp": "2026-09-23T12:00:00",
  "status": 404,
  "erro": "Veiculo nao encontrado para a placa: ZZZ9Z99 (nesta PoC apenas as placas cadastradas em data.sql sao reconhecidas)"
}
```
