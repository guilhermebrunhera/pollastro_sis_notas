import axios from 'axios';

interface Cliente {
    id?: number;
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    cpf_cnpj: string;
    cidade: string;
    cep: string;
    contato: string;
    tel_contato: string
  }

interface Produto {
    id?: number;
    nome: string;
    descricao: string;
    preco: string;
    tipo: string;
  }

  interface Acompanhamentos {
    id: number;
    produto_id: number;
    local: string;
    data_saida: string;
    quantidade: number;
    produto: Produto
  }

const API_URL = "http://localhost:3000";

// ____________________________________________________ CLIENTES ______________________________________//

export async function getClientes() {
    const response = await axios.get(`${API_URL}/clientes`);
    return response.data;
}

export async function postNewCliente(cliente: Cliente){
    const response = await axios.post(`${API_URL}/clientes`, cliente)
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

export async function postNewProduto(produto: Produto, foto: File | null){
    produto.preco = produto.preco.replace(".", ``).replace(",", ".");

    const formData = new FormData()
    formData.append(`nome`, produto.nome)
    formData.append(`descricao`, produto.descricao)
    formData.append(`preco`, produto.preco)
    formData.append(`tipo`, produto.tipo)
    if(foto) formData.append(`foto`, foto)

    const response = await axios.post(`${API_URL}/produtos`, formData, {headers: {
        'Content-Type': 'multipart/form-data',
      }})
    return response.data
}

export async function putProduto(id: number, produto: Produto, foto: File | null) {
    try {
      produto.preco = produto.preco.replace(".", ``).replace(",", ".");

      const formData = new FormData()
      formData.append(`nome`, produto.nome)
      formData.append(`descricao`, produto.descricao)
      formData.append(`preco`, produto.preco)
      formData.append(`tipo`, produto.tipo)
      if(foto) formData.append(`foto`, foto)

      const response = await axios.put(`${API_URL}/produtos/${id}`, formData, {headers: {
        'Content-Type': 'multipart/form-data',
      }});
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

export async function changeDescProduto(id: number, descricao: string) {
    try {
      const response = await axios.put(`${API_URL}/produtos/changeDesc/${id}`, {descricao : descricao});
      return response.data;
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      throw error;
    }
}

export async function removeFotoProd(id: number) {
    try {
      const response = await axios.delete(`${API_URL}/produtos/removeFoto/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      throw error;
    }
}

// ____________________________________________________ NOTAS ______________________________________//

export const getNotas = async (mes: string | null | undefined) => {
    const res = await axios.get(`${API_URL}/notas/${mes}`);
    return res.data;
};

export async function getNotaID(id: number) {
  const response = await axios.get(`${API_URL}/notas/id/${id}`);
  return response.data;
}

export async function getNotasItemID(id: number) {
  const response = await axios.get(`${API_URL}/notasitem/${id}`);
  return response.data;
}

export const postNota = async (nota: {
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: string;
  desconto?: number;
  desconto_obs?: string;
  itens: {
    produto_id: number;
    quantidade: number | null;
    preco_unitario: number;
  }[];
}) => {
  console.log(nota.itens[0].preco_unitario)
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
  desconto?: number;
  desconto_obs?: string;
  status: string;
  itens: {
    produto_id: number;
    quantidade: number | null;
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

export const alterNotaImpressa = async (id: number) => {
  const res = await axios.put(`${API_URL}/notasAlterImpressa/${id}`);
  return res.data;
}

export const salvarImagensNota = async (id: number, imagens : FormData) => {
  const res = await axios.post(`${API_URL}/notas/${id}/imagens`, imagens);
  return res.data;
}

export const getImagensNota = async (id: number) => {
  const res = await axios.get(`${API_URL}/notas/${id}/imagens`);
  return res.data;
}

export const deleteImageNota = async (id: number) => {
  await axios.delete(`${API_URL}/notas/${id}/imagens`);
};

// ____________________________________________________ HOME ______________________________________//

export const getDadosHome = async () => {
  const res = await axios.get(`${API_URL}/home`);
  return res.data;
};

// __________________________________________________  ACOMPANHAMENTOS ______________________________//

export async function getAcompanhamentos() {
  const response = await axios.get(`${API_URL}/acompanhamentos`);
  return response.data;
}

export async function getAcompanhamentosPorID(id: number) {
  const response = await axios.get(`${API_URL}/acompanhamentos/${id}`);
  return response.data;
}

export async function postNewAcompanhamento(acompanhamento: Acompanhamentos){
  const response = await axios.post(`${API_URL}/acompanhamentos`, acompanhamento)
  return response.data
}

// export async function putAcompanhamento(id: number, acompanhamento: Acompanhamentos) {
//   try {
//     const response = await axios.put(`${API_URL}/acompanhamentos/${id}`, acompanhamento);
//     return response.data;
//   } catch (error) {
//     console.error("Erro ao editar acompanhamento:", error);
//     throw error;
//   }
// }

export async function deleteAcompanhamento(id: number) {
  try {
    const response = await axios.delete(`${API_URL}/acompanhamentos/${id}`);
    return response.data;
  } catch (error) {
    console.error("Erro ao excluir acompanhamento:", error);
    throw error;
  }
}
// _____________________________________________ LOGIN ________________________________//
export async function loginSistem (nickname: string, senha: string){
  const res = await axios.post(`${API_URL}/`, {nickname, senha});
  return res.data;
};
