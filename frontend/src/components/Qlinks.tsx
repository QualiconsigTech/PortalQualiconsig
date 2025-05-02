"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/services/api";

interface LinkItem {
  titulo: string;
  url: string;
  tipo: string;
  logo?: string; 
  
}

const Qlinks: React.FC = () => {
  const [abertoBancos, setAbertoBancos] = useState<boolean>(true);
  const [abertoForaBancos, setAbertoForaBancos] = useState<boolean>(true);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [todosLinks, setTodosLinks] = useState([]);
  const [linksSistemas, setLinksSistemas] = useState<LinkItem[]>([]);
  const [linksBancos, setLinksBancos] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
  
      try {
        const response = await api.get("/api/usuarios/links/", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data: LinkItem[] = response.data;
  
        const sistemas = data.filter((link) => link.tipo === "sistema");
        const bancos = data.filter((link) => link.tipo === "banco");
  
        setLinksSistemas(sistemas);
        setLinksBancos(bancos);
      } catch (error) {
        console.error("Erro ao buscar links:", error);
      } finally {
        setLoading(false);
      }
    };
    
    
  
    fetchLinks();
  }, []); 
  
  useEffect(() => {
    console.log("linksBancos atualizados:", linksBancos);
  }, [linksBancos]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">QLinks</h1>
      <p className="mb-6 text-gray-600">Acesse rapidamente os sistemas:</p>

      {/* Seção Sistemas Gerais */}
      <div className="border rounded-lg shadow-sm mb-4">
        <button
          className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition flex justify-between items-center"
          onClick={() => setAbertoForaBancos((prev) => !prev)}
        >
          <span>Sistemas Gerais</span>
          <span>{abertoForaBancos ? "▲" : "▼"}</span>
        </button>
        {abertoForaBancos && (
         <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
         {loading ? (
           <p>Carregando...</p>
         ) : (
           linksSistemas.map((link, index) => (
            <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center text-center px-4 py-6 border rounded-lg bg-gray-50 hover:bg-gray-100 transition font-medium text-[#041161]"
          >
            {link.logo && (
              <img
                src={`/images/${link.logo}`}
                alt={link.titulo}
                className="max-h-12 mb-2 object-contain"
              />
            )}
            <span className="text-sm">{link.titulo}</span>
          </a>
          
           ))
         )}
       </div>
     )}
   </div>

      {/* Seção Bancos */}
      <div className="border rounded-lg shadow-sm mb-4">
        <button
          className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition flex justify-between items-center"
          onClick={() => setAbertoBancos((prev) => !prev)}
        >
          <span>Bancos</span>
          <span>{abertoBancos ? "▲" : "▼"}</span>
        </button>
        {abertoBancos && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white">
          {loading ? (
            <p>Carregando...</p>
          ) : (
            linksBancos.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-center px-4 py-6 border rounded-lg bg-gray-50 hover:bg-gray-100 transition font-medium text-[#041161]"
              >
                {link.logo && (
                  <img
                  src={`/images/${link.logo}`}
                  alt={link.titulo}
                  className={`object-contain mr-2 ${
                    link.titulo === 'QualiBanking' ? 'h-10 max-w-[80px]' : 'max-h-12'
                  }`}
                />       
                )}
                {link.titulo}
              </a>
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Qlinks;