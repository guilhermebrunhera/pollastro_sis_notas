import './styles.css'
import { useState, useEffect } from 'react'
import { deleteCliente, getClientes, postNewCliente, putCliente } from '../../services/APIService'

interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

function Clientes() {

  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null);

  useEffect(() => {
    listarClientes();
  }, []);
  
  function listarClientes() {
    getClientes()
      .then(data => { setListaClientes(data); })
      .catch(err => { console.error(err)});
  }

  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    email: "",
    telefone: "",
    endereco: ""
  });

  
  const handleChangeCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitCliente = (e: React.FormEvent) => {
    e.preventDefault();
  
    if (modoEdicao && clienteEditandoId !== null) {
      putCliente(clienteEditandoId, cliente)
        .then(() => {
          listarClientes();
          setModoEdicao(false);
          setClienteEditandoId(null);
          setNovoClienteOpen(false);
          setCliente({
            nome: "",
            email: "",
            telefone: "",
            endereco: ""
          });
        })
        .catch(err => console.error(err));
    } else {
      // POST novo cliente
      postNewCliente(cliente)
        .then(data => {
          if (data) {
            listarClientes();
            setNovoClienteOpen(false);
            setCliente({
              nome: "",
              email: "",
              telefone: "",
              endereco: ""
            });
          } else {
            console.error("Erro ao cadastrar cliente:", data);
          }
        })
        .catch(err => console.error(err));
    }
  };

  const excluirCliente = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteCliente(id)
        .then(() => {
          // Atualiza a lista sem recarregar a página
          setListaClientes(listaClientes.filter(cliente => cliente.id !== id));
        })
        .catch(err => {
          console.error("Erro ao excluir cliente:", err);
        });
    }
  };

  return (
    <div className='content-clientes'>
      <center>
        <button 
          className='default' 
          onClick={
            () => {
              setNovoClienteOpen(!novoClienteOpen)
              setCliente(() => ({
                nome : "",
                email: "",
                endereco: "",
                telefone: ""
              }));
            }
          }
        >
          {novoClienteOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Cliente'}
        </button>
      </center>
      

      {novoClienteOpen ? 
        <div className='div-form-clientes' style={{ maxWidth: "80%", margin: "0 auto" }}>
          <h2>Cadastrar Novo Cliente</h2>
          <form onSubmit={handleSubmitCliente}>
            <div>
              <label>Nome do Cliente:</label>
              <input
                type="text"
                name="nome"
                value={cliente.nome}
                onChange={handleChangeCliente}
                required
              />
            </div>
            <div>
              <label>Email: (Opcional)</label>
              <input
                type="email"
                name="email"
                value={cliente.email}
                onChange={handleChangeCliente}
              />
            </div>
            <div>
              <label>Telefone:</label>
              <input
                type="text"
                name="telefone"
                value={cliente.telefone}
                onChange={handleChangeCliente}
                required
              />
            </div>
            <div>
              <label>Endereço/Cidade:</label>
              <input
                type="text"
                name="endereco"
                value={cliente.endereco}
                onChange={handleChangeCliente}
                required
              />
            </div>
            <button className='save' type="submit">
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Cliente'}
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto" }}>
        <h2>Lista de Clientes</h2>
        <ul>
          {listaClientes.map((cliente) => (
            <li key={cliente.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                {cliente.nome} 
              </span>
              <span>
                {cliente.endereco}
              </span>
              <div className='acoes'>
                <button
                  className="editar-cliente botao-icone"
                  style={{ marginLeft: "1rem", cursor: "pointer" }}
                  onClick={() => {
                    setCliente(cliente);
                    setModoEdicao(true);
                    setClienteEditandoId(cliente.id ?? null);
                    setNovoClienteOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button className="botao-icone" onClick={() => excluirCliente(cliente.id ? cliente.id : 0)}>
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      }
    </div>
  );
}

export default Clientes
