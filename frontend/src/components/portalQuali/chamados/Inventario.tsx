import { useState } from "react";
import { Pencil, BookOpen } from "lucide-react";

export default function Inventario() {
  const [modoCadastro, setModoCadastro] = useState(false);

  return (
    <div className="p-6 relative">
      {/* Toggle no canto superior direito */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          {modoCadastro ? "Cadastrar Produto" : "Visualizar Inventário"}
        </span>

        <button
          onClick={() => setModoCadastro(!modoCadastro)}
          className={`w-20 h-10 bg-gray-300 rounded-full flex items-center px-1 transition-colors duration-300 ${
            modoCadastro ? "bg-blue-600" : "bg-gray-400"
          }`}
        >
          <div
            className={`w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 transform ${
              modoCadastro ? "translate-x-10" : "translate-x-0"
            }`}
          >
            {modoCadastro ? (
              <Pencil size={18} className="text-blue-600" />
            ) : (
              <BookOpen size={18} className="text-gray-700" />
            )}
          </div>
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="mt-20">
      {!modoCadastro ? (
            <div className="bg-white p-4 rounded shadow text-sm text-gray-700">
                <h2 className="text-xl font-semibold mb-4">Produtos do Inventário</h2>

                <div className="overflow-x-auto">
                <table className="min-w-full text-left border border-gray-300 rounded">
                    <thead className="bg-gray-100 text-gray-700">
                    <tr>
                        <th className="py-2 px-4 border-b">Produto</th>
                        <th className="py-2 px-4 border-b">Quantidade</th>
                        <th className="py-2 px-4 border-b">Consultor</th>
                    </tr>
                    </thead>
                    <tbody>
                    {/* Dados simulados */}
                    <tr className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">Notebook Dell</td>
                        <td className="py-2 px-4 border-b">3</td>
                        <td className="py-2 px-4 border-b">Carlos</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">Monitor Samsung</td>
                        <td className="py-2 px-4 border-b">5</td>
                        <td className="py-2 px-4 border-b">Juliana</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b">Headset Logitech</td>
                        <td className="py-2 px-4 border-b">10</td>
                        <td className="py-2 px-4 border-b">Fernanda</td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </div>
            ) : (
                <div className="bg-white p-6 rounded shadow text-sm text-gray-700 max-w-xl">
                <h2 className="text-xl font-semibold mb-4">Cadastrar Novo Produto</h2>
              
                <form className="space-y-4">
                  {/* Nome do Produto */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Notebook Lenovo"
                    />
                  </div>
              
                  {/* Quantidade */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantidade</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 5"
                    />
                  </div>
              
                  {/* Consultor */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Consultor</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Fernanda Silva"
                    />
                  </div>
              
                  {/* Botão de envio */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                    >
                      Cadastrar
                    </button>
                  </div>
                </form>
              </div>
            
        )}
      </div>
    </div>
  );
}
