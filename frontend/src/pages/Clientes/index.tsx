import './styles.css'
import { useState, useEffect } from 'react'
import { deleteCliente, getClientes, postNewCliente, putCliente } from '../../services/APIService'
import { removerAcentosTexto } from '../../components/utils/utils';
import Toast from '../../components/Toasts/toasts';
import Header from '../../components/Header';
import RelatorioModal from './relatorioPedidos';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

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

function Clientes() {

  const [novoClienteOpen, setNovoClienteOpen] = useState(false);
  const [listaClientes, setListaClientes] = useState<Cliente[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null);
  const [termoFiltro, setTermoFiltro] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [relatorioPedidos, setOpenRelatorioPedidos] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showHeaders, setShowHeaders] = useState(true);

  useEffect(() => {
    listarClientes();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setScrolled(true);
      } else {
        setScrolled(false)
        setShowHeaders(true)
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  function listarClientes() {
    getClientes()
      .then(data => { setListaClientes(data); })
      .catch(err => { console.error(err)});
  }

  const clientesFiltrados = listaClientes.filter(cliente =>
    removerAcentosTexto(cliente.nome).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase()) ||
    removerAcentosTexto(cliente.endereco).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase())
  );

  const [cliente, setCliente] = useState<Cliente>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cpf_cnpj: "",
    cidade: "",
    cep: "",
    contato: "",
    tel_contato: ""
  });

  function formatarTelefone(valor: string): string {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, '');

    if (numeros.length === 0) return '';

    if (numeros.length <= 2) {
      return `(${numeros}`;
    }

    if (numeros.length <= 6) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }

    if (numeros.length <= 10) {
      // Telefone fixo: (99) 1234-5678
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    }

    // Celular com 9 dígitos: (99) 91234-5678
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
  }

  function formatarCpfCnpj(valor: string) {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, '');
  
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`;
    if (numeros.length <= 11) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
    if (numeros.length <= 14) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
  
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
  }

  function formatarCep(valor: string) {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, '');
  
    if (numeros.length <= 5) return numeros;
    if (numeros.length <= 8) return `${numeros.slice(0, 5)}-${numeros.slice(5)}`;
    
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  }

  const handleChangeCliente = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const novoValor = name === 'telefone' || name === "tel_contato"
    ? formatarTelefone(value)
    : 
    name === 'cpf_cnpj' ? formatarCpfCnpj(value) 
    : 
    name === 'cep'? formatarCep(value) :
    value;

    setCliente((prev) => ({
      ...prev,
      [name]: novoValor,
    }));
  };

  const handleSubmitCliente = (e: React.FormEvent) => {
    e.preventDefault();
  

    if (modoEdicao && clienteEditandoId !== null && cliente.id !== undefined && cliente.id !== 0) {
      putCliente(clienteEditandoId, cliente)
        .then(() => {
          setToast({message: "Cliente editado!", type: "Sucesso"})
          listarClientes();
          setModoEdicao(false);
          setClienteEditandoId(null);
          setNovoClienteOpen(false);
          setCliente({
            nome: "",
            email: "",
            telefone: "",
            endereco: "",
            cpf_cnpj: "",
            cidade: "",
            cep: "",
            contato: "",
            tel_contato: ""
          });
        })
        .catch(err => setToast({message: "Erro ao editar Cliente: " + err, type: "Erro"}));
    } else {
      // POST novo cliente
      postNewCliente(cliente)
        .then(data => {
          if (data) {
            setToast({message: "Cliente adicionado!", type: "Sucesso"})
            listarClientes();
            setNovoClienteOpen(false);
            setCliente({
              nome: "",
              email: "",
              telefone: "",
              endereco: "",
              cpf_cnpj: "",
              cidade: "",
              cep: "",
              contato: "",
              tel_contato: ""
            });
          } else {
            setToast({message: "Erro ao adicionar Cliente" + data, type: "Erro"})
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
          setToast({message: "Cliente excluido!", type: "Sucesso"})
          setListaClientes(listaClientes.filter(cliente => cliente.id !== id));
        })
        .catch(err => {
          setToast({message: "Erro ao excluir cliente: " + err, type: "Erro"})
        });
    }
  };

  return (
    <>
    <Header />
    <div className='content-clientes'>
      <center >
        <div className={showHeaders ? scrolled ? "div-background-header scrolled show" : "div-background-header show" : "div-background-header hide" }>
          <button 
            className='default' 
            onClick={
              () => {
                setNovoClienteOpen(!novoClienteOpen)
                setCliente(() => ({
                  nome : "",
                  email: "",
                  endereco: "",
                  telefone: "",
                  cpf_cnpj: "",
                  cidade: "",
                  cep: "",
                  contato: "",
                  tel_contato: ""
                }));
              }
            }
          >
            {novoClienteOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Cliente'}
          </button>
          {!novoClienteOpen && !modoEdicao ?
            <input
              type="text"
              className='input-filtro'
              placeholder="Filtrar clientes..."
              value={termoFiltro}
              onChange={(e) => setTermoFiltro(e.target.value)}
              style={{ padding: '0.5rem', marginBottom: '1rem' }}
            />
            : <></>
          }
          
        </div>
        {scrolled && !novoClienteOpen && !modoEdicao ? 
          <button 
            className={showHeaders ? "buttonShowHeaders" : "buttonShowHeadersTop"} 
            onClick={() => setShowHeaders(!showHeaders)}
          >            
            {showHeaders ? <FaAngleUp></FaAngleUp> : <FaAngleDown></FaAngleDown>}
          </button>
        :
          <></>
        }
      </center>
      
      <RelatorioModal 
          relatorioPedidos={relatorioPedidos}
          onClose={() =>setOpenRelatorioPedidos(false)}
          cliente={cliente}
      ></RelatorioModal>

      {novoClienteOpen ? 
        <div className='div-form-clientes' style={{ maxWidth: "80%", margin: "0 auto", paddingTop: `7rem` }}>
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
            <div style={{width: `100%`, display: `flex`}}>
              <div style={{width: `50%`, paddingRight: `10px`}}>
                <label>CPF/CNPJ: (Opcional)</label>
                <input
                  type="text"
                  name="cpf_cnpj"
                  value={cliente.cpf_cnpj}
                  onChange={handleChangeCliente}
                  placeholder='CPF/CNPJ'
                />
              </div>
              <div style={{width: `50%`}}>
                <label>Telefone:</label>
                <input
                  value={cliente.telefone}
                  onChange={handleChangeCliente}
                  name="telefone"
                  type='text'
                  placeholder='(00) 00000-0000'
                  required
                />
              </div>
            </div>
            <br />
            <h3>Endereço do Cliente</h3>
            <hr />
            <div style={{width: `100%`, display: `flex`}}>
              <div style={{width: `50%`, paddingRight: `10px`}}>
                <label>Cidade:</label>
                <input
                  type="text"
                  name="cidade"
                  value={cliente.cidade}
                  onChange={handleChangeCliente}
                  required
                />
              </div>
              <div style={{width: `50%`}}>
                <label>CEP (Opcional):</label>
                <input
                  type="text"
                  name="cep"
                  value={cliente.cep}
                  onChange={handleChangeCliente}
                  placeholder='00000-000'
                />
              </div>
            </div>
            <div>
              <label>Endereço (Opcional):</label>
              <input
                type="text"
                name="endereco"
                value={cliente.endereco}
                onChange={handleChangeCliente}
              />
            </div>
            <br />
            <h3>Contato</h3>
            <hr />
            <div style={{width: `100%`, display: `flex`}}>
              <div style={{width: `50%`, paddingRight: `10px`}}>
                <label>Nome Contato (Opcional):</label>
                <input
                  type="text"
                  name="contato"
                  value={cliente.contato}
                  onChange={handleChangeCliente}
                />
              </div>
              <div style={{width: `50%`}}>
                <label>Tel. Contato (Opcional):</label>
                <input
                  type="text"
                  name="tel_contato"
                  value={cliente.tel_contato}
                  onChange={handleChangeCliente}
                  placeholder='(00) 00000-0000'
                />
              </div>
            </div>
            <button className='save' type="submit">
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Cliente'}
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto", paddingTop: `11rem` }}>
        <h2>Lista de Clientes</h2>
        <ul>
          {
            clientesFiltrados.length === 0 ?
            <div style={{width: `100%`, textAlign: `center`}}>
              <h2>Nenhum Cliente encontrado, tente outro filtro.</h2>
            </div>
            :
            <></>
          }
          {clientesFiltrados.map((cliente) => (
            <li key={cliente.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                {cliente.nome} 
              </span>
              <span>
                {cliente.cidade}
              </span>
              <div className='acoes'>
                <button className="botao-icone" title='Relatório de Pedidos' onClick={() => {
                  setOpenRelatorioPedidos(!relatorioPedidos)
                  setCliente(cliente)
                }}>
                  📋
                </button>
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
      {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
    </div>
    </>
  );
}

export default Clientes
