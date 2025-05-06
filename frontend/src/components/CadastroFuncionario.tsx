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
  tipo: z.enum(["usuario", "analista"], {
    errorMap: () => ({ message: "Selecione o tipo de usuário" }),
  }),
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
 
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

      try {
        const [setoresRes, cargosRes] = await Promise.all([
          api.get("/api/usuarios/setores/", { headers }),
          api.get("/api/usuarios/cargos/", { headers }),
        ]);
        setSetores(setoresRes.data);
        setCargos(cargosRes.data);
      } catch (error) {
        console.error("Erro ao carregar setores ou cargos:", error);
      }
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
      tipo: data.tipo,
      is_admin: false,
    };

    try {
      await api.post("/api/auth/cadastrar/usuario/", payload, { headers });
      setMensagem("Funcionário cadastrado com sucesso!");
      reset();
    } catch (error) {
      setMensagem("Erro ao cadastrar funcionário.");
      console.error(error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-center text-gray-800">
    Cadastrar Novo Funcionário
  </h2>

  <div className="space-y-2">
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
      <div className="relative">
        <input
          type={mostrarSenha ? "text" : "password"}
          {...register("senha")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Mínimo 6 caracteres"
        />
        <button
          type="button"
          onClick={() => setMostrarSenha(!mostrarSenha)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
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
    <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Usuário</label>
          <select
            {...register("tipo")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione</option>
            <option value="usuario">Usuário</option>
            <option value="analista">Analista</option>
          </select>
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo.message}</p>}
        </div>

    <button
      onClick={handleSubmit(onSubmit)}
      disabled={isSubmitting}
      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      {isSubmitting ? "Cadastrando..." : "Cadastrar"}
    </button>

    {mensagem && (
      <p
        className={`text-center mt-2 text-sm ${
          mensagem.includes("sucesso") ? "text-green-600" : "text-red-600"
        }`}
      >
        {mensagem}
      </p>
    )}
  </div>
</div>

  );
}
