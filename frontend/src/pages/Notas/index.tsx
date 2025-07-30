import './styles.css';
import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';
import { 
  getClientes, 
  getProdutos, 
  getNotas, 
  postNota, 
  deleteNota, 
  putNota, 
  getProdutosID, 
  alterStatusNota, 
  alterNotaImpressa, 
  getNotaID,
  changeDescProduto
} from '../../services/APIService';
import { format, subMonths } from 'date-fns';
import { gerarNotaPDF } from '../../components/notaPdfGenerator'
import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString, removerAcentosTexto } from '../../components/utils/utils';
import { gerarPedidoPDF } from '../../components/pedidoPdfGenerator';
import ModalUploadImagens from '../../components/utils/modalImagens';
import Toast from '../../components/Toasts/toasts';
import Header from '../../components/Header';
import { MdApps } from 'react-icons/md';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';
// import ModalPagamentos from './modalPagamentos';


interface Cliente {
  id: number;
  nome: string;
}

interface ProdutosDaNota {
  nome: string;
  quantidade: number;
  preco_unitario: string;
  preco_total: string;
}

interface Produto {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  tipo: string;
  foto?: string;
}

interface NotaItem {
  produto_id: number;
  quantidade: number | null;
  preco_unitario: number;
  centavos?: number | null;
  descricaoChange?: string | ""
}

interface Nota {
  id: number;
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: '' | 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga' | 'Orcamento' | 'Entregue';
  itens: NotaItem[];
  cliente?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  totalNota?: string;
  totalNotaSemDesconto?: string;
  desconto?: number;
  desconto_obs?: string;
  nota_impressa? : boolean;
  cidade?: string;
  cep?: string;
  contato?: string;
  tel_contato?: string
}

const formatarCentavosParaBRL = (centavos: number) => {
  const reais = centavos / 100;
  return reais.toLocaleString("pt-BR", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

function Notas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [novaNotaOpen, setNovaNotaOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [notaEditandoId, setNotaEditandoId] = useState<number | null>(null);
  // const [centavos, setCentavos] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const buttonSubmitRef = useRef<HTMLButtonElement>(null);
  const selectClienteRef = useRef<any>(null);
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [termoFiltro, setTermoFiltro] = useState('');
  const [openDrops, setOpenDrops] = useState<number | null>(null);
  const [openDropsFoto, setOpenDropsFoto] = useState<string | undefined>(undefined);
  const [mes, setMes] = useState<string | null>(format(new Date(), `yyyy-MM`));
  const [valorTotalNota, setValorTotalNota] = useState<number>();
  const dropsRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [showHeaders, setShowHeaders] = useState(true);
  const [modalAberto, setModalAberto] = useState(false)

  const [nota, setNota] = useState<Nota>({
    id: 0,
    cliente_id: 0,
    data_emissao: new Date().toISOString().split('T')[0], // Data do dia
    observacoes: '',
    status: '', // Status padrão
    itens: [],
    desconto: 0
  });

  const clientesFiltrados = notas.filter(notas =>
      removerAcentosTexto(String(notas.cliente)).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase()) ||
      removerAcentosTexto(String(notas.id)).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase()) ||
      removerAcentosTexto(format(notas.data_emissao, "ddMMyyyy")).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase()) ||
      removerAcentosTexto(format(notas.data_emissao, "dd/MM/yyyy")).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropsRef.current && !(dropsRef.current as any).contains(event.target)) {
        // setOpenDrops(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
  }, [scrolled, showHeaders]);

  useEffect(() => {
    carregarDados();
  }, [mes]);

  useEffect(() => {
    const notaSalva = localStorage.getItem('notaFormulario');
    const modoEdicaoSalvo = localStorage.getItem('notaModoEdicao');
    const notaEditandoIdSalvo = localStorage.getItem('notaEditandoId');

    if (notaSalva) {
      setNota(JSON.parse(notaSalva));
      setNovaNotaOpen(true);
    }
    if (modoEdicaoSalvo) {
      setModoEdicao(JSON.parse(modoEdicaoSalvo));
    }
    if (notaEditandoIdSalvo) {
      setNotaEditandoId(JSON.parse(notaEditandoIdSalvo));
    }

    setMes(format(new Date(), `yyyy-MM`))
    carregarDados();
    setDesconto(0);
  }, []);

  useEffect(() => {
    if(novaNotaOpen && !modoEdicao){
      selectClienteRef.current?.focus()
      const notaSalva = localStorage.getItem('notaFormulario');
      if(notaSalva){}else{
        setNota(prev => ({...prev, status: ''}))
      }
    }
  }, [novaNotaOpen])

  useEffect(() => {
    if(nota.cliente_id !== 0){
      localStorage.setItem('notaFormulario', JSON.stringify(nota));
      localStorage.setItem('notaModoEdicao', JSON.stringify(modoEdicao));
      localStorage.setItem('notaEditandoId', JSON.stringify(notaEditandoId));
    }

  }, [nota, modoEdicao, notaEditandoId]);

  useEffect(() => {
    verifyValorNotaTotal();
  }, [nota.itens, desconto])

  const verifyValorNotaTotal = () => {
    let valorTotal = 0;
    if(nota.itens.length != 0){
      nota.itens.map(prod => {
        valorTotal += (prod.quantidade === null ? 0 : prod.quantidade * prod.preco_unitario)
      })
    }

    if(desconto != 0){
      valorTotal -= (desconto / 100);
    }

    setValorTotalNota(valorTotal);
  }

  const carregarDados = async () => {
    try {
      const [clientesData, produtosData, notasData] = await Promise.all([
        getClientes(),
        getProdutos(),
        getNotas(mes)
      ]);
      setClientes(clientesData);
      setProdutos(produtosData);
      setNotas(notasData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleHasDesconto = (e : React.ChangeEvent<HTMLInputElement>) => {
    const valorDesconto = e.target.value.replace(/\D/g, "");

    const valorDescontoLimpo = valorDesconto.slice(0, 9);

    const novoValor = parseInt(valorDescontoLimpo || "0", 10);

    if (novoValor > 0){
      nota.desconto = parseFloat(formatarCentavosParaBRL(novoValor).replace(".", "").replace(",", "."));
    } else {
      nota.desconto = 0;
    }
  }

  const handleItemChange = (index: number, field: keyof NotaItem, value: string | number) => {
    const novosItens = [...nota.itens];
    
    if (field === 'quantidade') {
      novosItens[index][field] = typeof value === 'string' ? parseFloat(value) : value;
    } else if (field === 'produto_id') {
      // Encontrar o produto selecionado e atualizar o preco_unitario
      const produtoSelecionado = produtos.find(p => p.id === value);
      if (produtoSelecionado) {
        novosItens[index] = { 
          ...novosItens[index], 
          produto_id: value as number,
          preco_unitario: produtoSelecionado.preco,
          descricaoChange: produtoSelecionado.descricao,
          centavos: produtoSelecionado.preco
        };
        
      }
    } else if (field === 'preco_unitario') {
      let valorNumerico = typeof value === 'string'
      ? parseFloat(value.replace('.', '').replace(',', '.'))
      : value;

      valorNumerico = valorNumerico / 10;

      novosItens[index][field] = isNaN(valorNumerico) ? 0 : valorNumerico;
    }
    
    setNota(prev => ({ ...prev, itens: novosItens }));
  };

  const adicionarItem = () => {
    setNota(prev => ({
      ...prev,
      itens: [...prev.itens, { produto_id: 0, quantidade: null, preco_unitario: 0, descricaoChange: "" }]
    }));
  };

  const removerItem = (index: number) => {
    const novosItens = [...nota.itens];
    novosItens.splice(index, 1);
    setNota(prev => ({ ...prev, itens: novosItens }));
  };

  const handleSubmitNota = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (modoEdicao && notaEditandoId !== null) {
        await putNota(notaEditandoId, nota);
      } else {
        await postNota(nota);
      }
      localStorage.removeItem('notaFormulario');
      localStorage.removeItem('notaModoEdicao');
      localStorage.removeItem('notaEditandoId');

      setNota({
        id:0,
        cliente_id: 0,
        data_emissao: new Date().toISOString().split('T')[0], // Data do dia
        observacoes: '',
        status: 'Producao', // Status padrão
        itens: [],
        desconto: 0
      });
      setNovaNotaOpen(false);
      setModoEdicao(false);
      setNotaEditandoId(null);
      carregarDados();
      setToast({message: "Pedido salvo!", type: "Sucesso"})
    } catch (err) {
      setToast({ message: String(err), type: "Erro"})
    }
  };

  const handleChangeValorProduto = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

    // Limita o valor a no máximo 9 dígitos (R$ 99.999.999,99)
    const valorLimpo = apenasNumeros.slice(0, 9);

    const novoValor = parseInt(valorLimpo || "0", 10); // se vazio, volta pra 0
    nota.itens[index].centavos = novoValor

    
    
  };

  const handleChangeDesconto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ""); 

    // Limita o valor a no máximo 9 dígitos (R$ 99.999.999,99)
    const valorLimpo = apenasNumeros.slice(0, 9);

    const novoValor = parseInt(valorLimpo || "0", 10); 
    setDesconto(novoValor);
    
  };

  const handleOnlyNumberQtd = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.value = e.target.value.replace(/\D/g, ""); 
  }

  const iniciarEdicao = (id: number) => {
    getNotaID(id).then((data) => {
      let notaData = data.nota;
      let notaItens = data.itens;
      
      console.log(notaData.desconto)

      setNota({
        id: id,
        cliente_id: notaData.cliente_id,
        data_emissao: format(notaData.data_emissao, "yyyy-MM-dd"),
        observacoes: notaData.observacoes,
        desconto: notaData.desconto,
        desconto_obs: notaData.desconto_obs,
        status: notaData.status,
        itens: notaItens || []
      });
      setDesconto(notaData.desconto * 100)
      setModoEdicao(true);
      setNotaEditandoId(id);
      setNovaNotaOpen(true);
      setOpenDrops(null);
    })
    
  };

  const handleHasQtdProdutos = (newProduct: boolean) => {
    let hasQtdNULL = false;
    let hasValorZerado = false;

    if(nota.cliente_id === 0 && !newProduct){
      setToast({ message: "Selecione um Cliente para o pedido!", type: "Alerta"})
      return;
    }

    if(nota.itens.length > 0){
      nota.itens.map(item => {
        if(item.quantidade === null || item.quantidade === 0){
          hasQtdNULL = true
        }
        if(item.preco_unitario < 0.01){
          hasValorZerado = true
        }
      })
      if(hasQtdNULL){
        setToast({ message: "Existe Produto(s) com a QUANTIDADE ZERADA, por favor coloque uma quantidade!", type: "Alerta"})
        return;
      }else{
        if(hasValorZerado){
          setToast({ message: "Existe Produto(s) com o VALOR ZERADO, por favor coloque um valor!", type: "Alerta"})
          return;
        }else{
          if(nota.status === "" && !newProduct){
            setToast({ message: "Selecione um STATUS para o pedido!", type: "Alerta"})
            return;
          }else if(!newProduct){
            buttonSubmitRef.current?.click()
          } else{
            adicionarItem();
          }
        }
      }
    } else {
      if(!newProduct){
        setToast({ message: "Adicione produtos para o Pedido!", type: "Alerta"})
        return;
      }else{
        adicionarItem();
      }
    }
  }

  const excluirNota = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await deleteNota(id);
        setNotas(notas.filter(n => n.id !== id));
        setOpenDrops(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleChangeDescProdutoServico = async (id: number, index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    
    const novaNota = { ...nota };
        novaNota.itens = [...nota.itens]; // copia os itens
        novaNota.itens[index] = { ...novaNota.itens[index], descricaoChange: e.target.value };

        setNota(novaNota);


    try{
      changeDescProduto(id, e.target.value).then( () => {
      }).catch(err => {
        alert(err)
      })
    }catch(err){
      alert(err)
    }
  }

  function carregarNotaParaPDF(id: number, nota: Nota, download: boolean) {
    getProdutosID(id)
      .then((data: ProdutosDaNota[]) => {
        gerarNotaPDF(
          {
            nome : nota.cliente ? nota.cliente : "",
            numero: String(nota.id),
            data: format(nota.data_emissao, "dd/MM/yy"),
            cidade: String(nota.cidade),
            telefone: String(nota.telefone) ,
            email: String(nota.email),
            endereco: String(nota.endereco),
            observacao: String(nota.observacoes),
            desconto: nota.desconto !== undefined? nota.desconto : 0,
            desconto_obs: nota.desconto_obs !== undefined? nota.desconto_obs : "",
            download,
            produtos: data,
            contato: String(nota.contato ? nota.contato : ""),
            cep: String(nota.cep ? nota.cep : ""),
            tel_contato: String(nota.tel_contato ? nota.tel_contato : ""),
            nota_status: nota.status
          }
        )
        if (!download){
          alterNotaImpressa(id).catch((e) => { console.error(e) }).then(() => {
            setNotas(prev =>
              prev.map(n => n.id === nota.id ? { ...n, nota_impressa: true } : n)
            );
          })
        }
        setOpenDrops(null);
      })
      .catch(err => { console.error(err)})
  }

  function carregarPedidoParaPDF(id: number, nota: Nota) {
    getProdutosID(id)
      .then((data: ProdutosDaNota[]) => {
        gerarPedidoPDF(
          {
            nome : nota.cliente ? nota.cliente : "",
            numero: String(nota.id),
            data: format(nota.data_emissao, "dd/MM/yy"),
            cidade: String(nota.cidade),
            telefone: String(nota.telefone) ,
            email: String(nota.email),
            endereco: String(nota.endereco),
            observacao: String(nota.observacoes),
            desconto: nota.desconto !== undefined? nota.desconto : 0,
            desconto_obs: nota.desconto_obs !== undefined? nota.desconto_obs : "",
            produtos: data
          }
        )
        setOpenDrops(null);
      })
      .catch(err => { console.error(err)})
  }

  async function handleMesFiltro(filtroMes: string){
    const dataAtual = new Date();
    const mesAtual = format(dataAtual, "yyyy-MM");
    const mesAnterior = format(subMonths(dataAtual, 1), "yyyy-MM");

    switch (filtroMes) {
      case "EM":
        setMes(mesAtual);
        break;
      case "MP":
        setMes(mesAnterior);
        break;
      case "LT":
        setMes(null);
        break;
    }
  }

  return (
    <>
    <Header />
    <div className="content-clientes">
      <center>
        <div className={showHeaders ? scrolled ? "div-background-header scrolled show" : "div-background-header show" : "div-background-header hide" }>
          <button className="default bt-header" onClick={() => {
            setNovaNotaOpen(!novaNotaOpen);
            setModoEdicao(false);
            setDesconto(0);
            setNota({
              id:0,
              cliente_id: 0,
              data_emissao: new Date().toISOString().split('T')[0], // Data do dia
              observacoes: '',
              status: 'Producao', // Status padrão
              itens: [{produto_id: 0, quantidade: 0, preco_unitario: 0}],
              desconto: 0,
              desconto_obs: ""
            });
            localStorage.removeItem('notaFormulario');
            localStorage.removeItem('notaModoEdicao');
            localStorage.removeItem('notaEditandoId');
          }}>
            {novaNotaOpen ? modoEdicao? "Cancelar Edição" :'Cancelar Pedido' : '+ Novo Pedido'}
          </button>
          {!novaNotaOpen && !modoEdicao ?

            <div style={{width: `80%`, display: "flex", gap: `10px`, alignItems: 'center', justifyContent: "center"}}>
            <div style={{width: `80%`}}>
              <input
                type="text"
                placeholder="Filtrar clientes, nº nota, data..."
                value={termoFiltro}
                onChange={(e) => setTermoFiltro(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{width: `20%`}}>
              <select style={{textAlign: `center`}} onChange={(e) => handleMesFiltro(e.target.value)}>
                <option value={`EM`}>Este Mês</option>
                <option value={`MP`}>Mês Passado</option>
                <option value={`LT`}>Listar Todos</option>
              </select>
            </div>
          </div>
          :<></>

          }
        </div>
        {scrolled && !novaNotaOpen && !modoEdicao ? 
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

      {novaNotaOpen ? (
        <div className="div-form-clientes" style={{ maxWidth: '80%', margin: '0 auto', paddingTop: `7rem` }}>
          <h2>{modoEdicao ? 'Editar Pedido' : 'Novo Pedido'}</h2>
          <form onSubmit={handleSubmitNota}>
            <div style={{width: `100%`, display: `flex`, gap: `0.5rem`, alignItems: `center`}}>
              {/* <div style={{display: 'flex', width: `100%`}}><ModalPagamentos notaId={notaEditandoId ? notaEditandoId : 0} onClose={() => {console.log("fumegou")}}></ModalPagamentos></div> */}
              <div style={{width: `70%`}}>
                <label>Cliente:</label>
                <Select
                  ref={selectClienteRef}
                  name="cliente_id" 
                  options={clientes.map(c => ({ value: c.id, label: c.nome }))}
                  value={clientes.map(c => ({ value: c.id, label: c.nome })).find(op => op.value === nota.cliente_id)}
                  onChange={(op) => {
                    if (op) {
                      setNota(prev => ({ ...prev, cliente_id: op.value }));
                    }
                  }}
                  placeholder="Selecione o cliente"
                  styles={{
                    singleValue: (provided) => ({
                      ...provided,
                      color: 'black',
                    }),
                    option: (provided) => ({
                      ...provided,
                      color: 'black',
                    }),
                    control: (provided) => ({
                      ...provided,
                      backgroundColor: 'white',
                    }),
                  }}
                />
              </div>
              <div style={{width: `30%`}}>
                <label>Data de Emissão:</label>
                <input
                  type="date"
                  value={nota.data_emissao}
                  onChange={(e) => setNota(prev => ({ ...prev, data_emissao: e.target.value }))}
                  required
                />
              </div>
            </div>

            <label>Observações:</label>
            <input
              type="text"
              value={nota.observacoes}
              onChange={(e) => setNota(prev => ({ ...prev, observacoes: e.target.value }))}
            />

            <label>Status:</label>
            <select
              value={nota.status}
              onChange={(e) => setNota(prev => ({ ...prev, status: e.target.value as '' | 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga' | 'Orcamento' | 'Entregue' }))}
            >
              <option value="">-- Selecione --</option>
              <option value="Orcamento">Orçamento</option>
              <option value="Producao">Em Produçao</option>
              <option value="Cancelada">Cancelado</option>
              <option value="Finalizada">Finalizado</option>
              <option value="Entregue">Entregue</option>
              <option value="Paga">Pago</option>
            </select>
            <br/>
            <hr></hr>
            <h3>Produtos</h3>
            {nota.itens.map((item, index) => (

              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                {item.produto_id !== 0 
                && produtos.find(p => p.id === item.produto_id)
                && produtos.find(p => p.id === item.produto_id)?.tipo === 'S' ? (
                  <>
                    <h3>{produtos.find(p => p.id === item.produto_id)?.nome}</h3>
                    <input 
                      style={{width: `24.8rem`}}
                      placeholder='Descrição do serviço'
                      onChange={(e) => handleChangeDescProdutoServico(item.produto_id, index, e)} 
                      value={item.descricaoChange}
                      maxLength={35}
                    />
                  </>
                ) : (
                  (() => {
                    // Lista de IDs de produtos já usados, exceto o atual
                    const produtosSelecionadosIds = nota.itens
                      .map((i, idx) => idx !== index ? i.produto_id : null)
                      .filter(id => {
                        return id !== null
                      });

                    // Filtrar opções disponíveis
                    const opcoesDisponiveis = produtos
                      .filter(p =>  !produtosSelecionadosIds.includes(p.id))
                      .map(p => ({
                        value: p.id,
                        label: `${p.nome} - ${p.descricao}`
                      }));

                    return (
                      <div style={{maxWidth: `30rem`, width:`30rem`}}>
                        <Select
                          name="produto_id"
                          options={opcoesDisponiveis}
                          value={opcoesDisponiveis.find(op => op.value === item.produto_id) || null}
                          onChange={(op) => {
                            handleItemChange(index, 'produto_id', op ? op.value : 0);
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
                    );
                  })()
                )}
                
                
                <input
                style={{maxWidth: '20%'}}
                  type="text"
                  placeholder="Qtd"
                  value={item.quantidade || 0}
                  min={1}
                  required
                  onChange={(e) => {
                    handleOnlyNumberQtd(e);
                    handleItemChange(index, 'quantidade', e.target.value);
                  }}
                />
                
                {(() => {
                  const produtoSelecionado = produtos.find(p => p.id === item.produto_id);
                  const isServico = produtoSelecionado?.tipo === 'S';

                  if (isServico) {
                    return (
                      <input
                        type="text"
                        value={formatarCentavosParaBRL(item.centavos ? item.centavos : 0)}
                        onChange={(e) => {
                          handleChangeValorProduto(e, index);
                          handleItemChange(index, `preco_unitario`, (item.centavos ? item.centavos : 0) / 10)
                        }}
                        style={{ maxWidth: "22.5rem", fontSize: "16px", padding: "4px", textAlign: `end`, paddingRight: `0.5rem` }}
                      />
                    );
                  } else {
                    return (
                      <input
                        style={{ maxWidth: '30%',textAlign: `end`, paddingRight: `0.5rem` }}
                        type="text"
                        placeholder="Preço (Produto)"
                        value={
                          formatarReaisSemSimboloFloat(item.preco_unitario)
                        }
                        onChange={(e) => handleItemChange(index, 'preco_unitario', e.target.value)}
                        disabled={true}
                      />
                    );
                  }
                })()}
                <button type="button" onClick={() => removerItem(index)}>❌</button>
                {(() => {
                  
                  if(item.produto_id !== 0 && item.produto_id !== undefined && item.produto_id !== null){
                    let produtoFilter = produtos.filter(prod => prod.id === item.produto_id)

                    if(produtoFilter[0] && produtoFilter[0].foto && produtoFilter[0].foto != "" && produtoFilter[0].foto != null && produtoFilter[0].foto != undefined){
                      return(
                        <div style={{position: `relative`, alignSelf: 'center'}}>
                          <button className='botao-icone' type='button' onClick={() => setOpenDropsFoto(openDropsFoto === produtoFilter[0].foto ? "" : produtoFilter[0].foto)}>📷</button>
                          {openDropsFoto === produtoFilter[0].foto && ( 
                            <div className='dropdownFunc' style={{
                              position: `absolute`,
                              top: `100%`,
                              right: '15px',
                              backgroundColor: `#131313`,
                              boxShadow: `0 2px 8px rgba(49, 49, 49, 0.1)`,
                              padding: `8px`,
                              borderRadius: `4px`,
                              zIndex: `10`,
                            }}>
                                <img style={{width: `200px`, height: `200px`}} src={`http://localhost:3000/uploads/`+produtoFilter[0].foto}></img>
                            </div>
                          )}
                        </div>
                        
                      )
                    }
                  }else{
                    return(<></>)
                  }
                })()}
              </div>
            ))}
            <div style={{display: `flex`, gap: `0.5rem`, width: `100%`, paddingLeft: `49.5%`, alignItems: `center`}}>
              <label>Total do Pedido:</label>
              <div>
                <input 
                  style={{width: `22.6rem`, textAlign: `end`, paddingRight: `0.5rem`}}
                  value={formatarReaisSemSimboloFloat(valorTotalNota ?? 0)}
                  disabled
                />
              </div>
            </div>
            <br></br>
            <div style={{display: 'flex', width: `100%`, alignItems: 'center', paddingLeft: `61.5%`, paddingRight: `8.3%`}}>
              <button type="button" className='default-form' onClick={() => handleHasQtdProdutos(true)}>+ Produto</button>
            </div>
            <br />
            <hr /> 
            <br />
            {(() => {
                const hasProduto = nota.itens.length > 0;
                if(hasProduto){
                  return(
                    <>
                      
                      {/* <br/>
                      <hr></hr>
                      <br/> */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label>Desconto?</label>
                        <input
                          type="text"
                          value={formatarCentavosParaBRL(desconto)}
                          onChange={(e) => {
                            handleChangeDesconto(e);
                            handleHasDesconto(e);
                          }}
                          style={{ maxWidth: "200px", fontSize: "16px", padding: "4px" }}
                        />
                        {(() => {
                          if(desconto !== undefined && desconto > 0)
                            return(
                              <>
                              <label>Observação do Desconto</label>
                              <input
                                type="text"
                                value={nota.desconto_obs}
                                onChange={(e) => setNota(prev => ({ ...prev, desconto_obs: e.target.value }))}
                                style={{ fontSize: "16px", padding: "4px" }}
                              />
                              </>
                            )
                        })()}
                      </div>
                      
                    </>
                  )
                }
            })()}
            

            <button className="save" type='button' onClick={() => handleHasQtdProdutos(false)}>{modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Pedido'}</button>
            <button className="save" hidden ref={buttonSubmitRef} type="submit"></button>
            <br />
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '80%', margin: '0 auto', paddingTop: `8rem` }}>
          
          <br />
          <h2>Pedidos:</h2>
          <ul>
            {
              clientesFiltrados.length === 0 ?
              <div style={{width: `100%`, textAlign: `center`}}>
                <h2>Nenhum Pedido encontrado, tente outro filtro.</h2>
              </div>
              :
              <></>
            }
            {clientesFiltrados.map(nota => (
              <li key={nota.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{maxWidth: "8%"}}>Pedido {nota.id}</span>
                <span style={{width: "32%"}}>{nota.cliente}</span>
                <span style={{width: "10%"}}>{format(nota.data_emissao, "dd/MM/yyyy")}</span>
                <span>{nota.totalNota ? "R$ " + formatarReaisSemSimboloString(nota.totalNota) : ""}</span>
                <span style={{width: "5%"}}>
                  {nota.status === "Paga" ? 
                    nota.status
                  :
                  <select
                    value={nota.status}
                    onChange={async (e) => {
                      const novoStatus = e.target.value as 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga' | 'Orcamento' | 'Entregue';
                      try {
                        await alterStatusNota(nota.id!, novoStatus);
                        setToast({message: "Status da nota atualizado com Sucesso!", type: "Sucesso"})
                        setNotas(prev =>
                          prev.map(n => n.id === nota.id ? { ...n, status: novoStatus } : n)
                        );
                      } catch (err) {
                        setToast({message: "Erro ao atualizar status: " + err, type: "Erro"})
                      }
                    }}
                  >
                    <option value="Orcamento">Orçamento</option>
                    <option value="Producao">Em Produção</option>
                    <option value="Cancelada">Cancelado</option>
                    <option value="Finalizada">Finalizado</option>
                    <option value="Paga">Pago</option>
                  </select>
                  }
                </span>
                <div className="acoes" style={{width: "5%", position: `relative`, alignSelf: 'center'}} ref={dropsRef}>
                  <div className='dropdsown-container' style={{}}>
                    <MdApps size={30} className='botao-icone' onClick={() => setOpenDrops(openDrops === nota.id ? null : nota.id)}/>
                    {openDrops === nota.id && (
                      <div className='dropdown-funcs' style={{
                        position: `absolute`,
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)', // 3 colunas
                        gap: '8px',
                        top: `100%`,
                        left: '18px',
                        backgroundColor: `#131313`,
                        boxShadow: `0 2px 8px rgba(49, 49, 49, 0.1)`,
                        padding: `8px`,
                        borderRadius: `4px`,
                        zIndex: `10`,
                      }}>
                          {nota.status === "Producao" ? <button title='Imprimir Serviço' className='botao-icone' onClick={() => carregarPedidoParaPDF(nota.id!, nota)}>📋</button> : <></>}
                          <button title='Imprimir' className='botao-icone' onClick={() => carregarNotaParaPDF(nota.id!, nota, false)}>📑</button>
                          <button title='Download' className='botao-icone' onClick={() => carregarNotaParaPDF(nota.id!, nota, true)}>📥</button>
                          <span onClick={() => {  }}>
                              <ModalUploadImagens notaId={nota.id} aberto={modalAberto} onFechar={() => {
                                setModalAberto(false);
                                
                            }} />
                          </span>
                          {nota.status !== "Paga" ? <button title='Editar' className='botao-icone' onClick={() => iniciarEdicao(nota.id!)}>✏️</button> : <></>}
                          {nota.status !== "Finalizada" && nota.status !== "Paga" && (!nota.nota_impressa || nota.status === `Cancelada`) ? <button title='Excluir' className='botao-icone' onClick={() => excluirNota(nota.id!)}>🗑️</button> : <></>} 
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
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

export default Notas;