// src/components/usuariosAdmin/AbrirChamadoModal.tsx

import { useState } from "react";

interface AbrirChamadoModalProps {
  aberto: boolean;
  onClose: () => void;
  onSalvar: (dados: {
    titulo: string;
    categoria: string;
    prioridade: string;
    gravidade: string;
    descricao: string;
    anexos: FileList | null;
  }) => void;
}

export const AbrirChamadoModal = ({ aberto, onClose, onSalvar }: AbrirChamadoModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [gravidade, setGravidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anexos, setAnexos] = useState<FileList | null>(null);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Abrir Novo Chamado</h2>

        <div className="space-y-3 mb-4">
          <input
            type="text"
            placeholder="Título"
            className="w-full border rounded p-2"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Categoria"
            className="w-full border rounded p-2"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prioridade"
            className="w-full border rounded p-2"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          />
          <input
            type="text"
            placeholder="Gravidade"
            className="w-full border rounded p-2"
            value={gravidade}
            onChange={(e) => setGravidade(e.target.value)}
          />
          <textarea
            placeholder="Descrição"
            className="w-full border rounded p-2"
            rows={3}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <input
            type="file"
            multiple
            className="w-full"
            onChange={(e) => setAnexos(e.target.files)}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSalvar({ titulo, categoria, prioridade, gravidade, descricao, anexos })}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Abrir Chamado
          </button>
        </div>
      </div>
    </div>
  );
};
