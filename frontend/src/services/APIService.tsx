import axios from 'axios';

interface Cliente {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  }

// const API_URL = process.env.REACT_APP_API_URL;

export async function getClientes() {
    const response = await axios.get(`http://localhost:3000/Clientes`);
    return response.data;
}

export async function postNewCliente(Cliente: Cliente){
    const response = await axios.post('http://localhost:3000/Clientes', {nome : Cliente.nome, endereco : Cliente.endereco, telefone : Cliente.telefone, email : Cliente.email})
    return response.data
}