import { useState } from 'react';

export default function QuoteForm({ onSubmit, carregando, veiculosDisponiveis }) {
  const [placa, setPlaca] = useState('');
  const [itensTexto, setItensTexto] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(placa, itensTexto);
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <label>
        Placa do veiculo
        <input
          type="text"
          placeholder="Ex: ABC1D23"
          value={placa}
          onChange={(e) => setPlaca(e.target.value.toUpperCase())}
          maxLength={8}
          required
        />
      </label>

      {veiculosDisponiveis?.length > 0 && (
        <p className="hint">
          Placas cadastradas nesta PoC: {veiculosDisponiveis.map((v) => v.placa).join(', ')}
        </p>
      )}

      <label>
        Itens solicitados (um por linha)
        <textarea
          placeholder={'disco de freio dianteiro\npastilha de freio dianteira'}
          value={itensTexto}
          onChange={(e) => setItensTexto(e.target.value)}
          rows={5}
          required
        />
      </label>

      <button type="submit" disabled={carregando}>
        {carregando ? 'Gerando orcamento...' : 'Gerar orcamento'}
      </button>
    </form>
  );
}
