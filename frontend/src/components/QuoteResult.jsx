export default function QuoteResult({ orcamento }) {
  if (!orcamento) return null;

  const { veiculo, itens, total, contextoGerado } = orcamento;

  return (
    <div className="quote-result">
      <h2>
        {veiculo.marca} {veiculo.modelo} {veiculo.ano} · {veiculo.motorizacao} · {veiculo.placa}
      </h2>

      <table>
        <thead>
          <tr>
            <th>Item solicitado</th>
            <th>Peca</th>
            <th>Ref. OEM</th>
            <th>Ref. Fabricante</th>
            <th>Fornecedor cotado</th>
            <th>Preco</th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, idx) => (
            <tr key={idx} className={item.encontrado ? '' : 'nao-encontrado'}>
              <td>{item.descricaoSolicitada}</td>
              <td>{item.encontrado ? item.pecaNomeGenerico : '—'}</td>
              <td>{item.referenciaOem || '—'}</td>
              <td>
                {item.referenciaFabricante ? `${item.fabricante} · ${item.referenciaFabricante}` : '—'}
              </td>
              <td>{item.fornecedorCotado || '—'}</td>
              <td>{item.encontrado ? `R$ ${item.preco.toFixed(2)}` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="total">Total do orcamento: R$ {total.toFixed(2)}</p>

      <details>
        <summary>Contexto gerado para o agente de IA</summary>
        <pre>{contextoGerado}</pre>
      </details>
    </div>
  );
}
