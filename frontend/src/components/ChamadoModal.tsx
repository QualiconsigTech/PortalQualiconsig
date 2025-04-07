import { format } from "date-fns";
import { base64ToBlob, getStatus } from "@/utils/chamadoUtils";
import { Chamado } from "@/types/Chamado"; 

interface ChamadoModalProps {
  chamado: Chamado;
  aberto: boolean;
  onClose: () => void;
  onAtender: () => void;
  onEncerrar: () => void;
  podeAtender: boolean;
  podeEncerrar: boolean;
  solucao: string;
  comentarios: string;
  setSolucao: (value: string) => void;
  setComentarios: (value: string) => void;
  anexos: FileList | null;
  setAnexos: (value: FileList | null) => void;
  isAtendendo: boolean;
  isEncerrando: boolean;
  modoAdmin?: boolean;
}

export const ChamadoModal = ({
  chamado,
  aberto,
  onClose,
  onAtender,
  onEncerrar,
  podeAtender,
  podeEncerrar,
  solucao,
  comentarios,
  setSolucao,
  setComentarios,
  anexos,
  setAnexos,
  isAtendendo,
  isEncerrando,
  modoAdmin = false,
}: ChamadoModalProps) => {
  if (!aberto) return null;

  const status = getStatus(chamado);

  let arquivosAnexados: { nome: string; conteudo: string }[] = [];

  try {
    arquivosAnexados = chamado.arquivos
      ? typeof chamado.arquivos === "string"
        ? JSON.parse(chamado.arquivos)
        : chamado.arquivos
      : [];
  } catch (e) {
    console.error("Erro ao interpretar arquivos:", e);
  }

  return (
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do Chamado</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-red-600">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div><strong>Título:</strong> {chamado.titulo}</div>
          <div><strong>Nº Chamado:</strong> #{chamado.id}</div>
          <div><strong>Categoria:</strong> {chamado.categoria_nome}</div>
          <div><strong>Data de abertura:</strong> {format(new Date(chamado.criado_em), "dd/MM/yyyy")}</div>
          <div><strong>Status:</strong> {status.texto}</div>
          <div><strong>Usuário:</strong> {chamado.usuario.nome || "não informado"}</div>
          <div><strong>Prioridade:</strong> {chamado.prioridade}</div>
          <div><strong>Gravidade:</strong> {chamado.gravidade}</div>
          {/* SOMENTE SE FOR ADMIN MOSTRAR */}
          {modoAdmin && (
            <>
              <div><strong>Analista Atribuído:</strong> {chamado.analista?.nome || "Não informado"}</div>
              <div><strong>Usuário Atribuído:</strong> {chamado.usuario?.nome || "Não informado"}</div>
            </>
          )}
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Descrição:</label>
          <textarea value={chamado.descricao} readOnly className="w-full border rounded p-2 bg-gray-100" rows={3} />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Solução:</label>
          <textarea value={solucao} onChange={(e) => setSolucao(e.target.value)} readOnly={status.texto === "Encerrado"} className="w-full border rounded p-2 bg-gray-100" />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Comentários:</label>
          <textarea value={comentarios} onChange={(e) => setComentarios(e.target.value)} readOnly={status.texto === "Encerrado"} className="w-full border rounded p-2 bg-gray-100" />
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1">Arquivos Anexados:</label>
          {arquivosAnexados.length > 0 ? (
            <div className="text-sm text-gray-600 mb-2">
              {arquivosAnexados.map((arquivo, idx) => (
                <a
                  key={idx}
                  href="#"
                  onClick={() => {
                    const [meta, base64Content] = arquivo.conteudo.split(",");
                    const mime = meta.split(":")[1].split(";")[0];
                    const blob = base64ToBlob(base64Content, mime);
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = arquivo.nome;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-blue-600 hover:underline block"
                >
                  📎 Baixar {arquivo.nome}
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum arquivo anexado.</p>
          )}

          <input
            type="file"
            multiple
            className="w-full mt-2"
            onChange={(e) => setAnexos(e.target.files)}
            disabled={status.texto === "Encerrado"}
          />
        </div>

        <div className="flex justify-end gap-2">
          {podeAtender && (
            <button
              onClick={onAtender}
              disabled={isAtendendo || isEncerrando}
              className={`px-6 py-2 rounded text-white ${isAtendendo ? "bg-blue-400" : "bg-blue-800 hover:bg-blue-900"}`}
            >
              {isAtendendo ? "Atendendo..." : "Atender"}
            </button>
          )}
          {podeEncerrar && (
            <button
              onClick={onEncerrar}
              disabled={isEncerrando || isAtendendo}
              className={`px-6 py-2 rounded text-white ${isEncerrando ? "bg-red-400" : "bg-red-600 hover:bg-red-700"}`}
            >
              {isEncerrando ? "Encerrando..." : "Encerrar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
