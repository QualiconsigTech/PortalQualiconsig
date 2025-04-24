import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Eye, EyeOff } from "lucide-react";


const schema = z.object({
  nome: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  setor: z.string().nonempty("Selecione um setor"),
  cargo: z.string().nonempty("Selecione um cargo"),
});

type FormData = z.infer<typeof schema>;

interface Setor {
  id: number;
  nome: string;
}

interface Cargo {
  id: number;
  nome: string;
}

export default function CadastroFuncionario() {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [mensagem, setMensagem] = useState("");
  const perfilUsuario = localStorage.getItem("perfil"); 

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchDados = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [setoresRes, cargosRes] = await Promise.all([
        api.get("/api/usuarios/setores/", { headers }),
        api.get("/api/usuarios/cargos/", { headers }),
      ]);

      setSetores(setoresRes.data);
      setCargos(cargosRes.data);
    };

    fetchDados();
  }, []);

  const onSubmit = async (data: FormData) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const payload = {
      nome: data.nome,
      email: data.email,
      password: data.senha,
      setor: parseInt(data.setor),
      cargo: parseInt(data.cargo),
      tipo: perfilUsuario === "usuario_admin" ? "usuario" : "analista",
      is_admin: false,
    };

    try {
      await api.post("/auth/cadastrar/usuario/", payload, { headers });
      setMensagem("Funcionário cadastrado com sucesso!");
      reset();
    } catch (error) {
      setMensagem("Erro ao cadastrar funcionário.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Cadastrar Novo Funcionário
      </h2>
  
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
          <input
            {...register("nome")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome completo"
          />
          {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome.message}</p>}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="nome@dominio.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
          <input
            type="password"
            {...register("senha")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mínimo 6 caracteres"
          />
          {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha.message}</p>}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Setor</label>
          <select
            {...register("setor")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            {setores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          {errors.setor && <p className="text-red-500 text-sm mt-1">{errors.setor.message}</p>}
        </div>
  
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cargo</label>
          <select
            {...register("cargo")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            {cargos.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {errors.cargo && <p className="text-red-500 text-sm mt-1">{errors.cargo.message}</p>}
        </div>
  
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </button>
  
        {mensagem && <p className="text-center mt-2 text-sm text-green-600">{mensagem}</p>}
      </form>
    </div>
  );
}
