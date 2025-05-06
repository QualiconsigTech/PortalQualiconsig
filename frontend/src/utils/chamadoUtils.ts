export interface Chamado {
  id: number;
  titulo: string;
  descricao: string;
  criado_em: string;
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
    setor_nome?: string;
  } | null;
  usuario: {
    id: number;
    nome: string;
    setor_nome: string;
  };
}





export const getStatus = (chamado: {
    analista: any;
    encerrado_em: string | null;
  }) => {
    if (!chamado.analista) {
      return { texto: "Aberto", cor: "text-green-600" };
    }
    if (chamado.analista && !chamado.encerrado_em) {
      return { texto: "Em Atendimento", cor: "text-yellow-500" };
    }
    if (chamado.analista && chamado.encerrado_em) {
      return { texto: "Encerrado", cor: "text-black" };
    }
    return { texto: "Desconhecido", cor: "text-gray-500" };
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
  