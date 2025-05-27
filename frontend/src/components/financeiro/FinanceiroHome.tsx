import { useState } from "react";
import Quali from "./quali";
import Qualibank from "./qualibank";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function FinanceiroHome() {
  const [setorSelecionado, setSetorSelecionado] = useState<"quali" | "qualibank" | null>(null);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-[#041161]">Área Financeira</h1>

      {setorSelecionado && (
        <button
          onClick={() => setSetorSelecionado(null)}
          className="flex items-center text-[#041161] hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline text-sm font-medium">Voltar</span>
        </button>
      )}
    </div>

 {!setorSelecionado && (
  <div className="flex w-full h-[70vh] gap-6">
    <button
      onClick={() => setSetorSelecionado("quali")}
      className="w-1/2  aspect-[1/1] bg-white rounded-2xl shadow-md flex flex-col items-center justify-center hover:bg-gray-50 transition"
    >
      <Image
        src="/images/Qualiconsig-Logo.png"
        alt="Qualiconsig"
        width={250}
        height={130}
        className="object-contain max-w-[60%]"
      />
    </button>

    <button
      onClick={() => setSetorSelecionado("qualibank")}
      className="w-1/2 aspect-[1/1] bg-white rounded-2xl shadow-md flex flex-col items-center justify-center hover:bg-gray-50 transition"
    >
      <Image
        src="/images/Qualibank.png"
        alt="Qualibank"
        width={250}
        height={130}
        className="object-contain max-w-[60%]"
      />
    </button>
  </div>
)}


  {setorSelecionado === "quali" && <Quali />}
  {setorSelecionado === "qualibank" && <Qualibank />}
</div>

  );
}
