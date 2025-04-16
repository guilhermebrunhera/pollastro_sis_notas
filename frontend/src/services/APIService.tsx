import axios from 'axios';

interface Cliente {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  }

const API_URL = "http://localhost:3000";

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