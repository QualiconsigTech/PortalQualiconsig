import { useEffect, useState } from "react";
import { Pencil, BookOpen } from "lucide-react";
import { api } from "@/services/api";


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
interface Usuario {
  id: number;
  first_name: string;
  nome: string
}

interface Setor {
  id: number;
  nome: string;
  grupo: number;
}

export default function Inventario() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [gerentes, setGerentes] = useState<Usuario[]>([]);
  const [mostrarRede, setMostrarRede] = useState(false);
  const [mostrarPerifericos, setMostrarPerifericos] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo_local: "",pavimento: "", setor: "", posicao: "", gerente: "", consultor: "",
    marca: "", modelo: "", processador: "", memoria: "", armazenamento: "",
    hostname: "", ip: "", anydesk: "",
    impressora: "", headset: "",
    serial: "", status: "", ativo: true,
    observacao: "",
  });

  const handleChange = (field: string, value: string | boolean) => {
  setFormData((prev) => ({ ...prev, [field]: value }));

  if (field === "tipo_local" && typeof value === "string") {
    fetchSetores(value);
    setFormData((prev) => ({ ...prev, setor: "", gerente: "" })); 
    setGerentes([]); 
  }
};
  
  const handleSetorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selectedSetor = e.target.value;
  setFormData((prev) => ({ ...prev, setor: selectedSetor, gerente: "" }));

  const token = localStorage.getItem("token");
  try {
    const res = await api.get(`api/usuarios/gerentes/?setor_id=${selectedSetor}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setGerentes(res.data);
  } catch (err) {
    console.error("Erro ao buscar gerentes:", err);
    setGerentes([]);
  }
};


  const fetchSetores = async (tipoLocal: string) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("api/core/setores/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const setoresFiltrados = res.data.filter((setor: any) =>
      tipoLocal === "Comercial" ? setor.grupo === 3 : setor.grupo !== 3
    );

    setSetores(setoresFiltrados);
  } catch (err) {
    console.error("Erro ao buscar setores:", err);
  }
};


  const fetchInventario = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.get("api/chamados/inventario/", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProdutos(Array.isArray(res.data) ? res.data : [res.data]);
  } catch (err) {
    console.error("Erro ao buscar inventário:", err);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatusMsg(null);
  const token = localStorage.getItem("token");

  try {
    const res = await api.post("api/chamados/inventario/", formData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 200 || res.status === 201) {
      setStatusMsg("Produto cadastrado com sucesso!");
      setFormData({
        tipo_local: "",
        pavimento: "",
        setor: "",
        posicao: "",
        gerente: "",
        consultor: "",
        marca: "",
        modelo: "",
        processador: "",
        memoria: "",
        armazenamento: "",
        hostname: "",
        ip: "",
        anydesk: "",
        impressora: "",
        headset: "",
        serial: "",
        status: "",
        ativo: true,
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

  useEffect(() => {
    if (!modoCadastro) fetchInventario();
  }, [modoCadastro]);
return (<section className="p-6 pt-20">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-2xl font-bold text-[#041161] mb-0">
      {modoCadastro ? "Cadastrar Novo Produto" : "Produtos do Inventário"}
    </h1>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">
        {modoCadastro ? "Visualizar Inventário" : "Cadastrar Produto"}
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
  </div>

  {modoCadastro ? (
    <section className="bg-white p-6 rounded-xl shadow mt-4 max-h-[600px] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6 pr-2">
        
        {/* Responsáveis */}
        <div>
          <h3 className="text-lg font-medium mb-2 text-gray-700">Localização</h3>
          {/* Localização */}
            <div>
              {/* Switch Tipo de Local */}
                <div className="flex items-center gap-6 mb-4">
                  {/* Administrativo */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Administrativo</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tipo_local === "Administrativo"}
                        onChange={() => handleChange("tipo_local", "Administrativo")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-800 transition-all"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full shadow-md"></div>
                    </label>
                  </div>

                  {/* Comercial */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Comercial</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.tipo_local === "Comercial"}
                        onChange={() => handleChange("tipo_local", "Comercial")}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-800 transition-all"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full shadow-md"></div>
                    </label>
                  </div>
                </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  placeholder="Pavimento"
                  value={formData.pavimento}
                  onChange={(e) => handleChange("pavimento", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
                <select
                  value={formData.setor}
                  onChange={handleSetorChange}
                  className="border border-gray-300 rounded px-3 py-2 w-full text-gray-700"
                >
                  <option value="">Selecione o Setor</option>
                  {setores.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.nome}
                    </option>
                  ))}
                </select>

                <input
                  placeholder="Posição"
                  value={formData.posicao}
                  onChange={(e) => handleChange("posicao", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
                <select
                  value={formData.gerente}
                  onChange={(e) => handleChange("gerente", e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 w-full text-gray-700"
                >
                  <option value="">Selecione o Gerente</option>
                  {gerentes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>

                {formData.tipo_local !== "Comercial" && (
                  <input
                    placeholder="Consultor"
                    value={formData.consultor}
                    onChange={(e) => handleChange("consultor", e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                  />
                )}

              </div>
            </div>

        </div>

        {/* Hardware */}
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
         {/* Switches de controle */}
      <div className="flex flex-wrap gap-6 items-center mt-4">
        {/* Switch Rede */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Incluir Rede</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarRede}
              onChange={(e) => setMostrarRede(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-800 transition-all"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full shadow-md"></div>
          </label>
        </div>

        {/* Switch Periféricos */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Incluir Periféricos</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={mostrarPerifericos}
              onChange={(e) => setMostrarPerifericos(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-800 transition-all"></div>
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-full shadow-md"></div>
          </label>
        </div>
      </div>

        {/* Rede */}
        {mostrarRede && (
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
        )}

        {/* Periféricos e Identificação */}
        {mostrarPerifericos && (
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
        )}

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
    </section>
  ) : (
    <section className="bg-white p-6 rounded-xl shadow mt-4">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-600 border-b">
            <tr>
              {[
                "Pavimento", "Setor", "Posição", "Gerente", "Marca", "Modelo",
                "Anydesk", "Status", "Ativo", "Atualizado em"
              ].map((col) => (
                <th key={col} className="py-2 whitespace-nowrap">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id} className="hover:bg-gray-50">
                <td className="py-2 whitespace-nowrap">{produto.pavimento ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.setor ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.posicao ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.gerente ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.marca ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.modelo ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.anydesk ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.status ?? "—"}</td>
                <td className="py-2 whitespace-nowrap">{produto.ativo ? "Sim" : "Não"}</td>
                <td className="py-2 whitespace-nowrap">
                  {new Date(produto.atualizado_em).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {produtos.length === 0 && (
        <p className="text-center text-gray-500 py-6">Nenhum produto encontrado.</p>
      )}
    </section>
  )}
</section>
);
}
