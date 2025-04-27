import axios from 'axios';

interface Cliente {
    id?: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  }

interface Produto {
    id?: number;
    nome: string;
    descricao: string;
    preco: string;
    tipo: string
  }

const API_URL = "http://localhost:3000";

// ____________________________________________________ CLIENTES ______________________________________//

export async function getClientes() {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
}

export async function postNewCliente(cliente: Cliente){
    const response = await axios.post(`${API_URL}/clientes`, {nome : cliente.nome, endereco : cliente.endereco, telefone : cliente.telefone, email : cliente.email})
    return response.data
}

export async function putCliente(id: number, cliente: Cliente) {
    try {
      const response = await axios.put(`${API_URL}/clientes/${id}`, cliente);
      return response.data;
    } catch (error) {
      console.error("Erro ao editar cliente:", error);
      throw error;
    }
}

export async function deleteCliente(id: number) {
    try {
      const response = await axios.delete(`${API_URL}/clientes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      throw error;
    }
}

// ____________________________________________________ PRODUTOS ______________________________________//

export async function getProdutos() {
    const response = await axios.get(`${API_URL}/produtos`);
    return response.data;
}

export async function getProdutosID(id: number) {
    const response = await axios.get(`${API_URL}/produtos/${id}`);
    return response.data;
}

export async function postNewProduto(produto: Produto){
    produto.preco = produto.preco.replace(".", ``).replace(",", ".");
    const response = await axios.post(`${API_URL}/produtos`, {nome : produto.nome, preco : produto.preco, descricao : produto.descricao, tipo : produto.tipo})
    return response.data
}

export async function putProduto(id: number, produto: Produto) {
    try {
      produto.preco = produto.preco.replace(".", ``).replace(",", ".");
      const response = await axios.put(`${API_URL}/produtos/${id}`, produto);
      return response.data;
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      throw error;
    }
}

export async function deleteProduto(id: number) {
    try {
      const response = await axios.delete(`${API_URL}/produtos/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      throw error;
    }
}

// ____________________________________________________ NOTAS ______________________________________//

export const getNotas = async () => {
    const res = await axios.get(`${API_URL}/notas`);
    return res.data;
};

export async function getNotasItemID(id: number) {
  const response = await axios.get(`${API_URL}/notasitem/${id}`);
  return response.data;
}

export const postNota = async (nota: {
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: string;
  itens: {
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
  }[];
}) => {
  const res = await axios.post(`${API_URL}/notas`, nota);  // Corrigido aqui
  return res.data;
};

export const deleteNota = async (id: number) => {
  await axios.delete(`${API_URL}/notas/${id}`);
};

export const putNota = async (id: number, nota: {
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: string;
  itens: {
    produto_id: number;
    quantidade: number;
    preco_unitario: number;
  }[];
}) => {
  const res = await axios.put(`${API_URL}/notas/${id}`, nota);  // Corrigido aqui
  return res.data;
};

export const alterStatusNota = async (id: number, status: string) => {
  const res = await axios.put(`${API_URL}/notasAlterStatus/${id}/${status}`, status);
  return res.data;
}

// ____________________________________________________ HOME ______________________________________//

export const getDadosHome = async () => {
  const res = await axios.get(`${API_URL}/`);
  return res.data;
};