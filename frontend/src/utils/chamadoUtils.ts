export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  criado_em: string;
  status: string;
  encerrado_em: string | null;
  solucao?: string | null;
  comentarios?: string | null;
  categoria_nome: string;
  prioridade_nome: string;
  setor_nome: string;
  gravidade: string;
  arquivos: string;
  analista: {
    id: number;
    nome: string;
  } | null;
  usuario: {
    id: number;
    nome: string;
    setor_nome: string;
  };
}


export const getStatus = (chamado: { status: string }) => {
  switch (chamado.status) {
    case "Aberto":
      return { texto: "Aberto", cor: "text-green-600" };
    case "Em Atendimento":
      return { texto: "Em Atendimento", cor: "text-yellow-500" };
    case "Aguardando Resposta":
      return { texto: "Aguardando Resposta", cor: "text-orange-500" };
    case "Encerrado":
      return { texto: "Encerrado", cor: "text-black" };
    default:
      return { texto: "Desconhecido", cor: "text-gray-500" };
  }
};

  
  export const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  };
  
  export const base64ToBlob = (
    base64Data: string,
    contentType = "application/octet-stream"
  ): Blob => {
    const byteCharacters = atob(base64Data);
    const byteArrays = new Uint8Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([byteArrays], { type: contentType });
  };
  
  export function getNomeAnalista(chamado: Chamado): string {
    const status = getStatus(chamado);
  
    if (status.texto === "Aberto") {
      return "Não atribuído";
    }
  
    return chamado.analista?.nome || "Sem informação";
  }
  
  interface UsuarioInfo {
    tipo: string;
    is_admin: boolean;
  }
  
  export function getPerfilUsuario(usuario: UsuarioInfo): string {
    if (usuario.is_admin) {
      if (usuario.tipo === "analista") {
        return "analista_admin";
      } else if (usuario.tipo === "usuario") {
        return "usuario_admin";
      }
    } else {
      if (usuario.tipo === "analista") {
        return "analista";
      } else if (usuario.tipo === "usuario") {
        return "usuario";
      }
    }
  
    return "desconhecido";
  }
  