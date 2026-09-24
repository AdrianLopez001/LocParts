import { useEffect, useState } from 'react';
import QuoteForm from './components/QuoteForm.jsx';
import QuoteResult from './components/QuoteResult.jsx';
import { gerarOrcamento, listarVeiculos } from './api.js';

export default function App() {
  const [orcamento, setOrcamento] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [veiculos, setVeiculos] = useState([]);

  useEffect(() => {
    listarVeiculos().then(setVeiculos).catch(() => setVeiculos([]));
  }, []);

  async function handleSubmit(placa, itensTexto) {
    setErro(null);
    setOrcamento(null);
    setCarregando(true);
    try {
      const resultado = await gerarOrcamento(placa, itensTexto);
      setOrcamento(resultado);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container">
      <header>
        <h1>🚗 AutoQuote Copilot</h1>
        <p className="subtitle">
          PoC de estudo: placa + itens em linguagem livre → referencias de fabricante e
          orcamento cotado (logica de IA simulada/mockada).
        </p>
      </header>

      <QuoteForm onSubmit={handleSubmit} carregando={carregando} veiculosDisponiveis={veiculos} />

      {erro && <p className="erro">{erro}</p>}

      <QuoteResult orcamento={orcamento} />
    </main>
  );
}
