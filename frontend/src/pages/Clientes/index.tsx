import './styles.css'
import { useState } from 'react'
import { getClientes, postNewCliente } from '../../services/APIService'

interface Cliente {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

function Clientes() {

  function listarClientes() {
    getClientes()
      .then(data => { console.log(data) })
      .catch(err => { console.error(err)});
  }

  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    email: "",
    telefone: "",
    endereco: ""
  });

  const [novoClienteOpen, setNovoClienteOpen] = useState(false)

  const handleChangeCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitCliente = (e: React.FormEvent) => {
    e.preventDefault();
    postNewCliente(cliente)
      .then(data => { console.log(data) })
      .catch(err => { console.error(err)});
    console.log("Cliente cadastrado:", cliente);
     
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
              <label>Endereço:</label>
              <input
                type="text"
                name="endereco"
                value={cliente.endereco}
                onChange={handleChangeCliente}
                required
              />
            </div>
            <button className='save' type="submit">Salvar Novo Cliente</button>
          </form>
        </div>
      :
        <button onClick={listarClientes}></button> // mostrar Lista de clientes
      }
    </div>
  );
}

export default Clientes
