"use client";

import React, { useState } from "react";

interface VideoAjuda {
  titulo: string;
  url: string;
}

const videos: VideoAjuda[] = [
  { titulo: "Abrir chamado", url: "/videos/abrir-chamado.mp4" },
  { titulo: "Status do chamado", url: "/videos/status-chamado.mp4" },
  { titulo: "Verificar notificações", url: "/videos/verificar-notificacoes.mp4" },
  { titulo: "Cadastro de usuários", url: "/videos/cadastro-usuarios.mp4" },
];

const Ajuda: React.FC = () => {
  const [aberto, setAberto] = useState<number | null>(null);

  const toggle = (index: number) => {
    setAberto(aberto === index ? null : index);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Central de Ajuda</h1>
      <p className="mb-6 text-gray-600">
        Clique em uma seção para expandir e assistir ao vídeo:
      </p>

      <div className="space-y-4">
        {videos.map((video, index) => (
          <div key={index} className="border rounded-lg shadow-sm">
            <button
              className="w-full text-left px-4 py-3 font-semibold bg-gray-100 hover:bg-gray-200 transition"
              onClick={() => toggle(index)}
            >
              {video.titulo}
            </button>
            {aberto === index && (
              <div className="p-4 flex justify-center">
                <video
                  controls
                  className="w-full max-w-xl h-80 rounded-md mx-auto"
                  src={video.url}
                >
                  Seu navegador não suporta a tag de vídeo.
                </video>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default Ajuda;
