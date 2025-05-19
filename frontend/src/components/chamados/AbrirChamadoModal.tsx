import { useState, useEffect } from "react";

interface AbrirChamadoModalProps {
  aberto: boolean;
  onClose: () => void;
  onSalvar: (dados: {
    titulo: string;
    prioridade: number;
    descricao: string;
    categoria: number;
    setor: number;
    anexos: FileList | null;
  }) => void;
  categorias: { id: number; nome: string }[];
  setores: { id: number; nome: string; area_id: number }[];
  prioridades: { id: number; nome: string }[];
}

export const AbrirChamadoModal = ({
  aberto,
  onClose,
  onSalvar,
  categorias,
  setores,
  prioridades = [],
}: AbrirChamadoModalProps) => {
  const [titulo, setTitulo] = useState("");
  const [prioridadeSelecionada, setPrioridadeSelecionada] = useState<number>(0);
  const [descricao, setDescricao] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<number>(0);
  const [setorSelecionado, setSetorSelecionado] = useState<number>(0);
  const [anexos, setAnexos] = useState<FileList | null>(null);
  const [erros, setErros] = useState<{ [key: string]: string }>({});

  const validar = () => {
    const novosErros: { [key: string]: string } = {};
    if (!titulo.trim()) novosErros.titulo = "Campo obrigatório";
    if (categoriaSelecionada === 0) novosErros.categoria = "Campo obrigatório";
    if (setorSelecionado === 0) novosErros.setor = "Campo obrigatório";
    if (prioridadeSelecionada === 0) novosErros.prioridade = "Campo obrigatório";
    if (!descricao.trim()) novosErros.descricao = "Campo obrigatório";
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = () => {
    if (!validar()) return;
    onSalvar({
      titulo,
      prioridade: prioridadeSelecionada,
      descricao,
      categoria: categoriaSelecionada,
      setor: setorSelecionado,
      anexos,
    });
  };

  useEffect(() => {
    if (aberto) {
      setTitulo("");
      setPrioridadeSelecionada(0);
      setDescricao("");
      setCategoriaSelecionada(0);
      setSetorSelecionado(0);
      setAnexos(null);
      setErros({});
    }
  }, [aberto]);

  if (!aberto) return null;

  const inputBase = "w-full border rounded p-2";
  const errorText = "text-red-500 text-sm";

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Abrir Novo Chamado</h2>

        <div className="space-y-3 mb-4">
          <div>
            <input
              type="text"
              placeholder="Título"
              className={`${inputBase} ${erros.titulo ? "border-red-500" : ""}`}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {erros.titulo && <p className={errorText}>{erros.titulo}</p>}
          </div>

          <div>
            <select
              className={`${inputBase} ${erros.categoria ? "border-red-500" : ""}`}
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
            {erros.categoria && <p className={errorText}>{erros.categoria}</p>}
          </div>

          <div>
            <select
              className={`${inputBase} ${erros.setor ? "border-red-500" : ""}`}
              value={setorSelecionado}
              onChange={(e) => setSetorSelecionado(Number(e.target.value))}
            >
              <option value={0}>Selecione o Setor</option>
              {setores
                .filter((setor) => setor.area_id === 1)
                .map((setor) => (
                  <option key={setor.id} value={setor.id}>
                    {setor.nome}
                  </option>
                ))}
            </select>
            {erros.setor && <p className={errorText}>{erros.setor}</p>}
          </div>

          <div>
            <select
              className={`${inputBase} ${erros.prioridade ? "border-red-500" : ""}`}
              value={prioridadeSelecionada}
              onChange={(e) => setPrioridadeSelecionada(Number(e.target.value))}
            >
              <option value={0}>Selecione a Prioridade</option>
              {prioridades.map((prioridade) => (
                <option key={prioridade.id} value={prioridade.id}>
                  {prioridade.nome}
                </option>
              ))}
            </select>
            {erros.prioridade && <p className={errorText}>{erros.prioridade}</p>}
          </div>

          <div>
            <textarea
              placeholder="Descrição"
              className={`${inputBase} ${erros.descricao ? "border-red-500" : ""}`}
              rows={3}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
            {erros.descricao && <p className={errorText}>{erros.descricao}</p>}
          </div>

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
            onClick={handleSalvar}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Abrir Chamado
          </button>
        </div>
      </div>
    </div>
  );
};
