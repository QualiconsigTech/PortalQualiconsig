import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Pergunta {
  id: number;
  pergunta: string;
  resposta: string;
}

export default function PerguntasFrequentes() {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState<number | null>(null); // mesmo padrão da 'ajuda'

  useEffect(() => {
    async function fetchPerguntas() {
      try {
        const { data } = await api.get("/api/chamados/faq/");
        setPerguntas(data);
      } catch (error) {
        console.error("Erro ao buscar perguntas frequentes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPerguntas();
  }, []);

  const toggle = (index: number) => {
    setAberto(aberto === index ? null : index);
  };

  if (loading) {
    return <p>Carregando perguntas...</p>;
  }

  if (perguntas.length === 0) {
    return <p>Nenhuma pergunta frequente encontrada.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-[#041161]">Perguntas Frequentes</h2>
      <p className="mb-6 text-gray-600">
        Clique em uma seção para expandir e assistir ao vídeo:
      </p>

      <div className="space-y-2">
        {perguntas.map((item, index) => (
          <div key={item.id} className="border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => toggle(index)}
              className="w-full px-4 py-3 text-left font-semibold text-[#041161] bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
            >
              {item.pergunta}
            </button>
            {aberto === index && (
              <div className="px-4 py-2 bg-white text-gray-700 border-t">
                {item.resposta}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
