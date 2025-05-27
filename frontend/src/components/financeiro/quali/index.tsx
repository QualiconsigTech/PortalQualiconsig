import React, { useState, useEffect} from "react";
import * as XLSX from "xlsx";
import { api } from "@/services/api";

interface LinhaRelatorio {
  Categoria: string;
  Projeto: string;
  Valor: number;
}
const Quali: React.FC = () => {
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
  const [arquivosGerados, setArquivosGerados] = useState<{ [nome: string]: string } | null>(null);
  const [linhasRelatorio, setLinhasRelatorio] = useState<LinhaRelatorio[]>([]);
  const [categoriasRemovidas, setCategoriasRemovidas] = useState<string[]>([]);
  const [aprovado, setAprovado] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles: File[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file.name.endsWith(".xlsx")) {
          validFiles.push(file);
        }
      }
      if (validFiles.length === 0) {
              alert("Selecione apenas arquivos .xlsx válidos.");
              e.target.value = "";
              return;
            }
      
            const reader = new FileReader();
            reader.onload = (evt) => {
              const data = new Uint8Array(evt.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: "array" });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
      
              const header = json[1];
              const dataRows = json.slice(2);
      
              const linhas: LinhaRelatorio[] = dataRows
                .map((row: any[]) => ({
                Categoria: row[header.indexOf("Categoria")],
                Projeto: row[header.indexOf("Projeto")],
                Valor: Number(row[header.indexOf("Valor Pago")]) || 0,
              }))
              .filter((linha) => linha.Categoria && linha.Projeto);
      
              setLinhasRelatorio(linhas);
            };
      
            reader.readAsArrayBuffer(validFiles[0]);
      setArquivos(validFiles);
      setLinhasRelatorio([]);
      setAprovado(false);
      setToast(null);
      setArquivosGerados(null);
    }
  };

  const handleUpload = async () => {
    if (arquivos.length === 0) {
      alert("Selecione ao menos um arquivo.");
      return;
    }

    const formData = new FormData();
    arquivos.forEach((file) => formData.append("arquivos", file));

    const token = localStorage.getItem("token");
    setLoading(true);
    setToast(null);
    setArquivosGerados(null);

    try {
      const response = await api.post("/api/financeiro/relatorio-omie/upload/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data || response.status !== 200) {
        setToast({ tipo: "erro", texto: "Erro ao enviar os arquivos." });
        return;
      }

      setLinhasRelatorio(response.data.preview || []);
    } catch (error) {
      console.error("Erro geral:", error);
      setToast({ tipo: "erro", texto: "Erro na requisição." });
    } finally {
      setLoading(false);
    }
  };
  const handleRemoverCategoria = (categoria: string) => {
    if (!categoriasRemovidas.includes(categoria)) {
      setCategoriasRemovidas([...categoriasRemovidas, categoria]);
    }
  };

  const handleAprovar = async () => {
    const formData = new FormData();
    arquivos.forEach((file) => formData.append("arquivos", file));
    formData.append("removidas", JSON.stringify(categoriasRemovidas));

    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await api.post("/api/financeiro/relatorio-omie/upload/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const resultado = response.data;
      setArquivosGerados(resultado.arquivos_base64?.[0] || {});
      setToast({ tipo: "sucesso", texto: "Relatório aprovado e arquivos gerados." });
      setAprovado(true);
    } catch (error) {
      console.error("Erro ao aprovar:", error);
      setToast({ tipo: "erro", texto: "Erro ao salvar relatório." });
    } finally {
      setLoading(false);
    }
  };
  
  const baixarArquivos = () => {
    if (!arquivosGerados) return;

    Object.entries(arquivosGerados).forEach(([nome, base64]) => {
      const link = document.createElement("a");
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      link.download = nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };
    useEffect(() => {
      if (toast) {
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
      }
    }, [toast]);

    const linhasFiltradas = linhasRelatorio.filter(
      (linha) => !categoriasRemovidas.includes(linha.Categoria)
    );
  

    return (
      <div className="flex gap-6 p-6 items-start">
        {/* Tabela à esquerda */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#00247A] mb-4">Validação do Relatório</h2>
          {linhasFiltradas.length === 0 ? (
            <p className="text-gray-600">Nenhum dado carregado.</p>
          ) : (
            <div className="max-h-[550px] overflow-y-auto border rounded-md shadow scrollbar-hide">
              <table className="w-full text-sm text-gray-800">
                <thead className="bg-[#f0f4ff] sticky top-0">
                  <tr>
                    <th className="border p-2">Categoria</th>
                    <th className="border p-2">Projeto</th>
                    <th className="border p-2">Valor</th>
                    <th className="border p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {linhasFiltradas.map((linha, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="border p-2">{linha.Categoria}</td>
                      <td className="border p-2">{linha.Projeto}</td>
                      <td className="border p-2">R$ {linha.Valor.toFixed(2)}</td>
                      <td className="border p-2">
                        <button
                          onClick={() => handleRemoverCategoria(linha.Categoria)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
    
        {/* Botões à direita */}
        <div className="w-1/4 space-y-3">
          <input
            type="file"
            accept=".xlsx"
            multiple
            onChange={handleFileChange}
            disabled={loading}
            className="border border-gray-400 rounded-md p-2 text-black w-full"
          />
          <button
            onClick={handleUpload}
            disabled={loading || arquivos.length === 0}
            className="w-full text-sm bg-blue-700 text-white py-2 rounded-md hover:bg-blue-800 transition"
          >
            {loading ? "Enviando..." : "Visualizar relatório"}
          </button>
          {!aprovado && linhasFiltradas.length > 0 && (
            <button
              onClick={handleAprovar}
              className="w-full text-sm bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              Aprovar e salvar
            </button>
          )}
          {aprovado && arquivosGerados && (
            <button
              onClick={baixarArquivos}
              className="w-full text-sm bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              Baixar arquivos
            </button>
          )}
          {toast && (
          <div
            className={`text-sm p-2 rounded ${
              toast.tipo === "sucesso"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {toast.texto}
          </div>
        )}
      </div>
      </div>
    );
    
    
  };
  
  export default Quali;
