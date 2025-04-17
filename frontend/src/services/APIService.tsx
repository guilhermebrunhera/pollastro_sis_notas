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
    preco: number;
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
    const response = await axios.post(`${API_URL}/produtos`, {nome : produto.nome, preco : produto.preco, descricao : produto.descricao})
    return response.data
}

export async function putProduto(id: number, produto: Produto) {
    try {
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