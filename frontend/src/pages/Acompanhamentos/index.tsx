import './styles.css'
import { useState, useEffect } from 'react'
import { deleteAcompanhamento, getAcompanhamentos, getProdutos, postNewAcompanhamento } from '../../services/APIService'
import { format } from 'date-fns';
import Select, { SingleValue } from 'react-select';
import Toast from '../../components/Toasts/toasts';
import Header from '../../components/Header';

interface Acompanhamentos {
  id: number;
  produto_id: number;
  local: string;
  data_saida: string;
  quantidade: number;
  produto: Produto;
  acomID?: number;
  prodID?: number;
  nome?: string;
  descricao?: string;
  preco?: string;
  tipo?: string;
}

interface Produto {
    id: number;
    nome: string;
    descricao: string;
    preco: string;
    tipo: string;
  }

function Acompanhamentos() {

  const [novoAcompanhamentoOpen, setNovoAcompanhamentoOpen] = useState(false);
  const [listaAcompanhamentos, setListaAcompanhamentos] = useState<Acompanhamentos[]>([]);
//   const [modoEdicao, setModoEdicao] = useState(false);
//   const [clienteEditandoId, setClienteEditandoId] = useState<number | null>(null);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([])
  const [termoFiltro, setTermoFiltro] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);

  type OptionType = { value: number; label: string };

  const options: OptionType[] = listaProdutos.map(c => ({
    value: c.id,
    label: c.nome + " - " + c.descricao
  }));

  useEffect(() => {
    listarAcompanhamentos();
    listarProdutos();
  }, []);
  
  function listarProdutos() {
    getProdutos()
      .then(data => { setListaProdutos(data); })
      .catch(err => { console.error(err)});
  }

  function listarAcompanhamentos() {
    getAcompanhamentos()
        .then(data => { 
            setListaAcompanhamentos(data)
        })
        .catch(err => { console.error(err)});
  }

  const acompanhamentoFiltrado = listaAcompanhamentos;

  const [acompanhamento, setAcompanhamento] = useState<Acompanhamentos>({
    id: 0,
    local: "",
    produto_id: 0,
    quantidade: 0,
    data_saida: format(Date.now(), "yyyy-MM-dd"),
    produto: {
        id: 0,
        nome: "",
        descricao: '',
        preco: '0',
        tipo: 'P'
    }
  });

  const handleChangeAcompanhamento = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setAcompanhamento((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeAcompanhamentoSelect = (value: number) => {
    
    setAcompanhamento((prev) => ({
      ...prev,
      produto_id: value,
    }));
  };

  const handleSubmitAcompanhamento = (e: React.FormEvent) => {
    e.preventDefault();
  
      // POST novo cliente
      postNewAcompanhamento(acompanhamento)
        .then(data => {
          if (data) {
            setAcompanhamento({
                id: 0,
                local: "",
                produto_id: 0,
                quantidade: 0,
                data_saida: format(Date.now(), "yyyy-MM-dd"),
                produto: {
                    id: 0,
                    nome: "",
                    descricao: '',
                    preco: '0',
                    tipo: 'P'
                }
            });
            setNovoAcompanhamentoOpen(!novoAcompanhamentoOpen);
            listarAcompanhamentos();
            setToast({message: "Acompanhamento salvo", type: "Sucesso"})
          } else {
            setToast({message: "Erro ao criar o acompanhamento:", type: "Erro"})
          }
        })
        .catch(err => setToast({message: "Erro ao criar o acompanhamento:" + err, type: "Erro"}));
  };

  const excluirAcompanhamento = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente?")) {
      deleteAcompanhamento(id)
        .then(() => {
          // Atualiza a lista sem recarregar a página
          setListaAcompanhamentos(listaAcompanhamentos.filter(acompanhamento => acompanhamento.id !== id));
          setToast({message: "Acompanhamento excluido!", type: "Sucesso"})
        })
        .catch(err => {
          setToast({message: "Erro ao excluir o acompanhamento:" + err, type: "Erro"})
        });
    }
  };

  return (
    <>
    <Header />
    <div className='content-acompanhamentos'>
      <center>
        <button 
          className='default' 
          onClick={
            () => {
              setNovoAcompanhamentoOpen(!novoAcompanhamentoOpen)
              setAcompanhamento(() => ({
                id: 0,
                local: "",
                produto_id: 0,
                quantidade: 0,
                data_saida: format(Date.now(), "yyyy-MM-dd"),
                produto: {
                    id: 0,
                    nome: "",
                    descricao: '',
                    preco: '0',
                    tipo: 'P'
                }
              }));
            }
          }
        >
          {novoAcompanhamentoOpen ? 'Cancelar Acompanhamento' : '+ Acompanhamento'}
        </button>
      </center>
      

      {novoAcompanhamentoOpen ? 
        <div className='div-form-clientes' style={{ maxWidth: "80%", margin: "0 auto" }}>
          <h2>Cadastrar Novo Cliente</h2>
          <form onSubmit={handleSubmitAcompanhamento}>
            <div>
            <Select
                instanceId="produto_id"
                options={options}
                value={options.find(op => op.value === acompanhamento.produto.id)}
                onChange={(e: SingleValue<OptionType>) => {
                    handleChangeAcompanhamentoSelect(e ? e.value : 0);
                }}
                placeholder="Digite ou Selecione o Produto Desejado"
                styles={{
                    singleValue: (provided) => ({
                    ...provided,
                    color: 'black',
                    width: '25rem'
                    }),
                    option: (provided) => ({
                    ...provided,
                    color: 'black',
                    }),
                    control: (provided) => ({
                    ...provided,
                    backgroundColor: 'white',
                    }),
                    menu: (provided) => ({
                    ...provided,
                    width: '25rem',
                    }),
                }}
                />
            </div>
            <div>
              <label>Quantidade:</label>
              <input
                value={acompanhamento.quantidade}
                onChange={handleChangeAcompanhamento}
                name="quantidade"
                type='number'
                required
              />
            </div>
            <div>
              <label>Data de saída:</label>
              <input
                type="date"
                name="data_saida"
                value={acompanhamento.data_saida}
                onChange={handleChangeAcompanhamento}
              />
            </div>
            <div>
              <label>Local:</label>
              <select
                name='local'
                value={acompanhamento.local}
                onChange={(e) => {
                    handleChangeAcompanhamento(e)
                }}
              >
                <option value=''>-- Selecione --</option>
                <option value='Zincagem'>Zincagem</option>
              </select>
            </div>
            <button className='save' type="submit">
              {/* {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Cliente'} */}
              Salvar novo Acompanhamento
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto" }}>
        <h3>Filtro:</h3>
        <input
          type="text"
          placeholder="Filtrar acompanhamentos..."
          value={termoFiltro}
          onChange={(e) => setTermoFiltro(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <h2>Lista de Acompanhamentos</h2>
        <ul>
          {acompanhamentoFiltrado.map((acompanhamento) => (
            <li key={acompanhamento.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>
                {acompanhamento.nome} - {acompanhamento.descricao ? acompanhamento.descricao : ""}
              </span>
              <span>
                {acompanhamento.quantidade}
              </span>
              <span>
                {acompanhamento.local}
              </span>
              <div className='acoes'>
                <button className="botao-icone" onClick={() => excluirAcompanhamento(acompanhamento.id ? acompanhamento.id : 0)}>
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

export default Acompanhamentos
