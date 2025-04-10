// src/components/usuariosAdmin/AbrirChamadoModal.tsx

import { useState, useEffect } from "react";

interface AbrirChamadoModalProps {
  aberto: boolean;
  onClose: () => void;
  onSalvar: (dados: {
    titulo: string;
    prioridade: string;
    descricao: string;
    categoria: number;
    setor: number;
    anexos: FileList | null;
  }) => void;
  categorias: { id: number; nome: string }[];
  setores: { id: number; nome: string }[];
}

export const AbrirChamadoModal = ({
  aberto,
  onClose,
  onSalvar,
  categorias,
  setores,
}: AbrirChamadoModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number>(0);
  const [setorSelecionado, setSetorSelecionado] = useState<number>(0);
  const [anexos, setAnexos] = useState<FileList | null>(null);

  useEffect(() => {
    if (aberto) {
      // Sempre resetar os campos ao abrir
      setTitulo("");
      setPrioridade("");
      setDescricao("");
      setCategoriaSelecionada(0);
      setSetorSelecionado(0);
      setAnexos(null);
    }
  }, [aberto]);

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
          {/* Select de Categoria */}
          <select
            className="w-full border rounded p-2"
            value={categoriaSelecionada}
            onChange={(e) => setCategoriaSelecionada(Number(e.target.value))}
          >
            <option value={0}>Selecione a Categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          {/* Select de Setor */}
          <select
            className="w-full border rounded p-2"
            value={setorSelecionado}
            onChange={(e) => setSetorSelecionado(Number(e.target.value))}
          >
            <option value={0}>Selecione o Setor</option>
            {setores.map((setor) => (
              <option key={setor.id} value={setor.id}>
                {setor.nome}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Prioridade"
            className="w-full border rounded p-2"
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
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
            onClick={() =>
              onSalvar({
                titulo,
                prioridade,
                descricao,
                categoria: categoriaSelecionada,
                setor: setorSelecionado,
                anexos,
              })
            }
            disabled={categoriaSelecionada === 0 || setorSelecionado === 0}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Abrir Chamado
          </button>
        </div>
      </div>
    </div>
  );
};
