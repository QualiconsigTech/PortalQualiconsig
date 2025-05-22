
import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { api } from "@/services/api";


interface LinhaRepasse {
  numeroContrato: string;
  valorRebate: number;
  impostos: number;
  valorLiquido: number;
}

interface LinhaFatura {
  contrato: string;
  movimento: string;
  dataFatura: string;
}

interface LinhaSeguro {
  nome: string;
  cpf: string;
  inicioVigencia: string | null; 
  plano: string;
  cedente: string;
  vendedor: string;
  valor: number;
  contrato: string;
  lote: string;
  obs: string;
}

const Relatorios: React.FC = () => {
    const [arquivos, setArquivos] = useState<File[]>([]);
    const [dadosCache, setDadosCache] = useState<{ [nome: string]: any[] }>({});
    const [arquivoSelecionado, setArquivoSelecionado] = useState<string | null>(null);
    const [aprovados, setAprovados] = useState<{ [nome: string]: boolean }>({});
    const [toast, setToast] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [gerando, setGerando] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const novos: File[] = Array.from(selectedFiles).filter(file =>
      file.name.endsWith(".xlsx")
    );

    const excelDateToJS = (serial: number): string => {
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
      return date.toLocaleDateString("pt-BR");
    };

    const excelDateToISO = (serial: number): string => {
      const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0]; 
    };

    novos.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(sheet, { header: 1 });
        const rawHeader = json[0];
        const header = rawHeader.map((col: any) => col?.toString().trim());
        const dataRows = json.slice(1);

        if (file.name.toLowerCase().includes("repasse")) {
          const linhas: LinhaRepasse[] = dataRows.map((row: any[]) => {
            const rebate = Number(row[header.indexOf("Valor do Rebate Bruto Total")]) || 0;
            const impostos = Number(row[header.indexOf("Impostos")]) || 0;
            return {
              numeroContrato: row[header.indexOf("Número de Contrato")] || "",
              valorRebate: rebate,
              impostos,
              valorLiquido: rebate - impostos,
            };
          }).filter((l) => l.numeroContrato);
          setDadosCache(prev => ({ ...prev, [file.name]: linhas }));
        } else if (file.name.toLowerCase().includes("fatura")) {
          const movimentoIndex = header.indexOf("MOVIMENTO");
          const metadadosIndex = header.indexOf("METADADOS");
          const dataFaturaIndex = header.indexOf("DATA_FATURA");

          const linhas: LinhaFatura[] = dataRows.map((row: any[]) => {
            let contrato = "";
            try {
              const meta = JSON.parse(row[metadadosIndex]);
              contrato = meta["numero-ccb"] || "";
            } catch {
              contrato = "";
            }
            return {
              contrato,
              movimento: row[movimentoIndex] || "",
              dataFatura: excelDateToJS(Number(row[dataFaturaIndex])),
            };
          }).filter((l) => l.contrato);

          setDadosCache(prev => ({ ...prev, [file.name]: linhas }));
        } else if (file.name.toLowerCase().includes("seguro")) {
          const linhas: LinhaSeguro[] = dataRows.map((row: any[], index: number) => {
            const rawData = {
              nome: row[header.indexOf("NOME")] || "",
              cpf: row[header.indexOf("CPF")] || "",
              dataBruta: row[header.indexOf("DT INICIO DE VIGENCIA")],
              plano: row[header.indexOf("Planos Seguros / Nomenclatura")] || "",
              cedente: row[header.indexOf("CEDENTE")] || "",
              vendedor: row[header.indexOf("VENDEDOR")] || "",
              valor: Number(String(row[header.indexOf("Valor do seguro")]).replace(",", ".").trim()) || 0,
              contrato: row[header.indexOf("Contrato")] || "",
              lote: row[header.indexOf("LOTE")] || "",
              obs: row[header.indexOf("OBS")] || "",
            };
            let inicioVigencia: string | null = null;
            const excelValue = Number(rawData.dataBruta);

            if (!isNaN(excelValue) && excelValue > 0) {
              try {
                inicioVigencia = excelDateToISO(excelValue);
              } catch (e) {
                console.warn(`Erro ao converter data na linha ${index + 1}:`, rawData.dataBruta, e);
              }
            } else {
              console.warn(`Data inválida na linha ${index + 1}:`, rawData.dataBruta);
            }

            const linhaConvertida = {
              nome: rawData.nome,
              cpf: rawData.cpf,
              inicioVigencia,
              plano: rawData.plano,
              cedente: rawData.cedente,
              vendedor: rawData.vendedor,
              valor: rawData.valor,
              contrato: rawData.contrato,
              lote: rawData.lote,
              obs: rawData.obs,
            };

            if (!inicioVigencia) {
              console.warn(`Data inválida detectada na linha ${index + 1}:`, rawData.dataBruta, rawData);
            }
            console.log(`Linha ${index + 1}:`, linhaConvertida);
            return linhaConvertida;
          }).filter((l) => l.nome && l.inicioVigencia);
          setDadosCache(prev => ({ ...prev, [file.name]: linhas }));
        }
        
        

        if (!arquivoSelecionado) setArquivoSelecionado(file.name);
      };
      reader.readAsArrayBuffer(file);
    });

    setArquivos(novos);
  };

  const handleSalvar = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    const token = localStorage.getItem("token");
    setLoading(true);
    try {
      const url = file.name.toLowerCase().includes("repasse")
        ? "/api/financeiro/upload-repasse-cessao/"
        : file.name.toLowerCase().includes("fatura")
        ? "/api/financeiro/upload-fatura-comissao/"
        : file.name.toLowerCase().includes("seguro")
        ? "/api/financeiro/upload-seguro-cartao/"
        : "";


    if (!url) throw new Error("Tipo de arquivo não suportado");

      await api.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setToast({ tipo: "sucesso", texto: "Arquivo salvo com sucesso!" });
      setAprovados(prev => ({ ...prev, [file.name]: true }));
    } catch (error) {
      console.error(error);
      setToast({ tipo: "erro", texto: "Erro ao salvar arquivo." });
    } finally {
      setLoading(false);
    }
  };

  const handleGerarRelatorioFinal = async () => {
    setGerando(true);
    try {
      await api.post("/api/financeiro/gerar-relatorio-final/");

      const response = await api.get("/api/financeiro/download-relatorio-final/", {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "relatorio_repasse_qualibanking_final.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToast({ tipo: "sucesso", texto: "Relatório final gerado e baixado com sucesso!" });
    } catch (error) {
      console.error(error);
      setToast({ tipo: "erro", texto: "Erro ao gerar ou baixar o relatório final." });
    } finally {
      setGerando(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const linhasSelecionadas = arquivoSelecionado ? dadosCache[arquivoSelecionado] || [] : [];
  const isFatura = arquivoSelecionado?.toLowerCase().includes("fatura");
  const isSeguro = arquivoSelecionado?.toLowerCase().includes("seguro");
  const repasseAprovado = Object.keys(aprovados).some(name => name.toLowerCase().includes("repasse") && aprovados[name]);
  const faturaAprovada = Object.keys(aprovados).some(name => name.toLowerCase().includes("fatura") && aprovados[name]);


  return (
    <div className="flex gap-6 p-6 items-start">
      {/* Tabela à esquerda */}
      <div className="flex-1">
        <h2 className="text-xl font-bold text-[#00247A] mb-4">Validação do Relatório</h2>
        {linhasSelecionadas.length === 0 ? (
          <p className="text-gray-600">Nenhum dado carregado.</p>
        ) : (
          <div className="max-h-[550px] overflow-y-auto border rounded-md shadow scrollbar-hide">
            <div className={`${isSeguro ? "overflow-x-auto" : ""}`}>
            <table className="min-w-full text-sm text-gray-800">
              <thead className="bg-[#f0f4ff] sticky top-0">
              <tr>
                  {isFatura ? (
                    <>
                      <th className="border p-2">Número do Contrato</th>
                      <th className="border p-2">Movimento</th>
                      <th className="border p-2">Data da Fatura</th>
                    </>
                    ) : isSeguro ? (
                      <>
                        <th className="border p-2">Nome</th>
                        <th className="border p-2">Início Vigência</th>
                        <th className="border p-2">Plano</th>
                        <th className="border p-2">Valor</th>
                        <th className="border p-2">Contrato</th>
                      </>
                   ) : (
                    <>
                      <th className="border p-2">Número de Contrato</th>
                      <th className="border p-2">Rebate Bruto Total</th>
                      <th className="border p-2">Impostos</th>
                      <th className="border p-2">Valor Líquido</th>
                    </>
                   )}
              </tr>
              </thead>
              <tbody>
              {linhasSelecionadas.map((linha: any, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    {isFatura ? (
                      <>
                        <td className="border p-2">{linha.contrato}</td>
                        <td className="border p-2">{linha.movimento}</td>
                        <td className="border p-2">{linha.dataFatura}</td>
                      </>
                      ) : isSeguro ? (
                        <>
                          <td className="border p-2">{linha.nome}</td>
                          <td className="border p-2">{linha.inicioVigencia}</td>
                          <td className="border p-2">{linha.plano}</td>
                          <td className="border p-2">R$ {linha.valor.toFixed(2)}</td>
                          <td className="border p-2">{linha.contrato}</td>
                        </>
                     ) : (
                      <>
                        <td className="border p-2">{linha.numeroContrato}</td>
                        <td className="border p-2">R$ {linha.valorRebate.toFixed(2)}</td>
                        <td className="border p-2">R$ {linha.impostos.toFixed(2)}</td>
                        <td className="border p-2 font-semibold text-green-700">R$ {linha.valorLiquido.toFixed(2)}</td>
                      </>
                    )}
                    </tr>
                ))}
              </tbody>
            </table>
            </div>
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
          className="border border-gray-400 rounded-md p-2 text-black w-full"
        />
        {arquivos.map((file) => (
          <div key={file.name} className="space-y-1">
          <button
            onClick={() => setArquivoSelecionado(file.name)}
            className={`w-full text-white text-sm font-medium py-3 px-4 rounded-md bg-blue-600 hover:bg-blue-700 transition text-center whitespace-normal break-words ${
              arquivoSelecionado === file.name ? "bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {file.name}
          </button>
          {arquivoSelecionado === file.name && dadosCache[file.name] && !aprovados[file.name] && (
            <button
              onClick={() => handleSalvar(file)}
              className="w-full text-sm py-2 rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Aprovar e salvar
            </button>
          )}
        </div>
      ))}
      {repasseAprovado && faturaAprovada && (
          <button
            onClick={handleGerarRelatorioFinal}
            disabled={gerando}
            className="w-full text-white text-sm py-3 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700"
          >
            {gerando ? "Gerando relatório..." : "Gerar Relatório Final"}
          </button>
        )}

      {toast && (
        <div
          className={`text-sm p-2 rounded ${
            toast.tipo === "sucesso" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {toast.texto}
        </div>
      )}
    </div>
  </div>
  );
};

export default Relatorios;
