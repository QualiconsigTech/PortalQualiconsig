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

  if (loading) {
    return <p>Carregando perguntas...</p>;
  }

  if (perguntas.length === 0) {
    return <p>Nenhuma pergunta frequente encontrada.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-[#041161]">Perguntas Frequentes</h2>

      <div className="space-y-4">
        {perguntas.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.pergunta}</h3>
            <p className="text-gray-600">{item.resposta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
