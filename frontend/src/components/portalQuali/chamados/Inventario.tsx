import { useEffect, useState } from "react";
import { Pencil, BookOpen } from "lucide-react";

interface Produto {
  id: number;
  pavimento: string | null;
  setor: string | null;
  posicao: string | null;
  gerente: string | null;
  consultor: string | null;
  marca: string | null;
  modelo: string | null;
  processador: string | null;
  memoria: string | null;
  armazenamento: string | null;
  hostname: string | null;
  ip: string | null;
  anydesk: string | null;
  impressora: string | null;
  headset: string | null;
  serial: string | null;
  status: string | null;
  ativo: boolean;
  observacao: string | null;
  criado_em: string;
  atualizado_em: string;
}

export default function Inventario() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [formData, setFormData] = useState({
    pavimento: "", setor: "", posicao: "", gerente: "", consultor: "",
    marca: "", modelo: "", processador: "", memoria: "", armazenamento: "",
    hostname: "", ip: "", anydesk: "",
    impressora: "", headset: "",
    serial: "", status: "", ativo: true,
    observacao: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/chamados/inventario/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatusMsg("Produto cadastrado com sucesso!");
        setFormData({
          pavimento: "", setor: "", posicao: "", gerente: "", consultor: "",
          marca: "", modelo: "", processador: "", memoria: "", armazenamento: "",
          hostname: "", ip: "", anydesk: "",
          impressora: "", headset: "",
          serial: "", status: "", ativo: true,
          observacao: "",
        });
        fetchInventario();
        setModoCadastro(false);
      } else {
        setStatusMsg("Erro ao cadastrar produto.");
      }
    } catch (err) {
      console.error(err);
      setStatusMsg("Erro de conexão com o servidor.");
    }
  };

  const fetchInventario = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/chamados/inventario/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProdutos(Array.isArray(data) ? data : [data]);
      }
    } catch (error) {
      console.error("Erro ao buscar inventário:", error);
    }
  };

  useEffect(() => {
    if (!modoCadastro) fetchInventario();
  }, [modoCadastro]);
  return (
    <div className="p-6 relative">
      {/* Toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {modoCadastro ? "Cadastrar Produto" : "Visualizar Inventário"}
        </span>
        <button
          onClick={() => setModoCadastro(!modoCadastro)}
          className={`w-20 h-10 rounded-full flex items-center px-1 transition ${
            modoCadastro ? "bg-blue-800" : "bg-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transform transition-transform ${
              modoCadastro ? "translate-x-10" : "translate-x-0"
            }`}
          >
            {modoCadastro ? <Pencil size={18} className="text-blue-800" /> : <BookOpen size={18} />}
          </div>
        </button>
      </div>

        <div className="mt-20 flex justify-center px-4 lg:px-12">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-md px-4 py-4 overflow-hidden">
          {modoCadastro ? (
            <>
              <h2 className="text-xl font-semibold mb-6">Cadastrar Novo Produto</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seção: Responsáveis */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Responsáveis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["pavimento", "setor", "posicao", "gerente", "consultor"].map((field) => (
                      <input
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(formData as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Seção: Hardware */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Hardware</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["marca", "modelo", "processador", "memoria", "armazenamento"].map((field) => (
                      <input
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(formData as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Seção: Rede */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Rede</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["hostname", "ip", "anydesk"].map((field) => (
                      <input
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(formData as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Seção: Periféricos e Identificação */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Periféricos & Identificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {["impressora", "headset", "serial", "status"].map((field) => (
                      <input
                        key={field}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        value={(formData as any)[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 w-full"
                      />
                    ))}
                    <label className="flex items-center gap-2 mt-1">
                      <input
                        type="checkbox"
                        checked={formData.ativo}
                        onChange={(e) => handleChange("ativo", e.target.checked)}
                      />
                      <span>Ativo</span>
                    </label>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">Outros</h3>
                  <textarea
                    placeholder="Observações"
                    value={formData.observacao}
                    onChange={(e) => handleChange("observacao", e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                {/* Botão */}
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded">
                    Cadastrar Produto
                  </button>
                </div>

                {statusMsg && (
                  <p className="text-center text-sm text-blue-800 mt-2">{statusMsg}</p>
                )}
              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-6 text-center">Produtos do Inventário</h2>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[1400px]">
                    <table className="w-full border border-gray-200 text-sm">
                       <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                        <tr>
                          {[
                            "Pavimento", "Setor", "Posição", "Gerente", "Marca", "Modelo",
                            "Anydesk", "Status", "Ativo", "Atualizado em"
                          ].map((col) => (
                            <th key={col} className="px-4 py-3 border-b text-left whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {produtos.map((produto) => (
                          <tr key={produto.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 border-b">{produto.pavimento ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.setor ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.posicao ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.gerente ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.marca ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.modelo ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.anydesk ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.status ?? "—"}</td>
                            <td className="px-4 py-2 border-b">{produto.ativo ? "Sim" : "Não"}</td>
                            <td className="px-4 py-2 border-b">
                              {new Date(produto.atualizado_em).toLocaleDateString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>

                    </table>
                  </div>
                </div>
                {produtos.length === 0 && (
                  <p className="text-center text-gray-500 py-6">Nenhum produto encontrado.</p>
                )}
              
            </>


          )}
        </div>
      </div>
    </div>
  );
}
