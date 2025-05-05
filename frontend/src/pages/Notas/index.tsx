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
  getNotaID
} from '../../services/APIService';
import { format } from 'date-fns';
import { gerarNotaPDF } from '../../components/notaPdfGenerator'
import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString } from '../../components/utils/utils';
import { gerarPedidoPDF } from '../../components/pedidoPdfGenerator';
import ModalUploadImagens from '../../components/utils/modalImagens';

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
  tipo: string
}

interface NotaItem {
  produto_id: number;
  quantidade: number | null;
  preco_unitario: number;
}

interface Nota {
  id?: number;
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: '' | 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga';
  itens: NotaItem[];
  cliente?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
  totalNota?: string;
  totalNotaSemDesconto?: string;
  desconto?: number;
  desconto_obs?: string;
  nota_impressa? : boolean
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
  const [centavos, setCentavos] = useState(0);
  const [desconto, setDesconto] = useState(0);
  const buttonSubmitRef = useRef<HTMLButtonElement>(null);
  const selectClienteRef = useRef<any>(null);

  const [nota, setNota] = useState<Nota>({
    cliente_id: 0,
    data_emissao: new Date().toISOString().split('T')[0], // Data do dia
    observacoes: '',
    status: '', // Status padrão
    itens: [],
    desconto: 0
  });

  useEffect(() => {
    carregarDados();
    setDesconto(0);
    setCentavos(0);
  }, []);

  useEffect(() => {
    if(novaNotaOpen && !modoEdicao){
      selectClienteRef.current?.focus()
      setNota(prev => ({...prev, status: ''}))
    }
  }, [novaNotaOpen])

  const carregarDados = async () => {
    try {
      const [clientesData, produtosData, notasData] = await Promise.all([
        getClientes(),
        getProdutos(),
        getNotas()
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
          preco_unitario: produtoSelecionado.preco
        };
      }
    } else if (field === 'preco_unitario') {
      const valorNumerico = typeof value === 'string'
      ? parseFloat(value.replace(',', '.'))
      : value;
      novosItens[index][field] = isNaN(valorNumerico) ? 0 : valorNumerico;
    }
    
    setNota(prev => ({ ...prev, itens: novosItens }));
  };

  const adicionarItem = () => {
    setNota(prev => ({
      ...prev,
      itens: [...prev.itens, { produto_id: 0, quantidade: null, preco_unitario: 0 }]
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
      // Certifique-se de que cliente_id está correto antes de enviar
      if (nota.cliente_id === 0) {
        alert("Por favor, selecione um cliente.");
        return;
      }

      if (modoEdicao && notaEditandoId !== null) {
        await putNota(notaEditandoId, nota);
      } else {
        await postNota(nota);
      }
      setNota({
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeValorProduto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const apenasNumeros = e.target.value.replace(/\D/g, ""); // remove tudo que não for número

    // Limita o valor a no máximo 9 dígitos (R$ 99.999.999,99)
    const valorLimpo = apenasNumeros.slice(0, 9);

    const novoValor = parseInt(valorLimpo || "0", 10); // se vazio, volta pra 0
    setCentavos(novoValor);
    
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

      setNota({
        cliente_id: notaData.cliente_id,
        data_emissao: format(notaData.data_emissao, "yyyy-MM-dd"),
        observacoes: notaData.observacoes,
        desconto: notaData.desconto,
        desconto_obs: notaData.desconto_obs,
        status: notaData.status,
        itens: notaItens || []
      });
      setModoEdicao(true);
      setNotaEditandoId(id);
      setNovaNotaOpen(true);
    })
    
  };

  const handleHasQtdProdutos = () => {
    let hasQtdNULL = false;
    let hasValorZerado = false;

    if(nota.itens.length > 0){
      nota.itens.map(item => {
        if(item.quantidade === null || item.quantidade === 0){
          hasQtdNULL = true
        }
        if(item.preco_unitario < 0.01){
          hasValorZerado = true
        }
      })

      hasQtdNULL ?
        alert("Existe Produto(s) com a QUANTIDADE ZERADA, por favor coloque uma quantidade!")
      :
        hasValorZerado ? 
          alert("Existe Produto(s) com o VALOR ZERADO, por favor coloque um valor!")
        :
          nota.status === '' ?
            alert("Selecione um STATUS para a nota")
          :
            buttonSubmitRef.current?.click()
    } else {
      alert("Selecione produtos para adicionar ao pedido!")
    }
  }

  const excluirNota = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta nota?')) {
      try {
        await deleteNota(id);
        setNotas(notas.filter(n => n.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  function carregarNotaParaPDF(id: number, nota: Nota, download: boolean) {
    getProdutosID(id)
      .then((data: ProdutosDaNota[]) => {
        gerarNotaPDF(
          {
            nome : nota.cliente ? nota.cliente : "",
            numero: String(nota.id),
            data: format(nota.data_emissao, "dd/MM/yy"),
            cidade: String(nota.endereco),
            telefone: String(nota.telefone) ,
            email: String(nota.email),
            endereco: String(nota.endereco),
            observacao: String(nota.observacoes),
            desconto: nota.desconto !== undefined? nota.desconto : 0,
            desconto_obs: nota.desconto_obs !== undefined? nota.desconto_obs : "",
            download,
            produtos: data
          }
        )
        if (!download){
          alterNotaImpressa(id).catch((e) => { console.error(e) }).then(() => {
            setNotas(prev =>
              prev.map(n => n.id === nota.id ? { ...n, nota_impressa: true } : n)
            );
          })
        }
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
            cidade: String(nota.endereco),
            telefone: String(nota.telefone) ,
            email: String(nota.email),
            endereco: String(nota.endereco),
            observacao: String(nota.observacoes),
            desconto: nota.desconto !== undefined? nota.desconto : 0,
            desconto_obs: nota.desconto_obs !== undefined? nota.desconto_obs : "",
            produtos: data
          }
        )
      })
      .catch(err => { console.error(err)})
  }

  return (
    <div className="content-clientes">
      <center>
        <button className="default" onClick={() => {
          setNovaNotaOpen(!novaNotaOpen);
          setModoEdicao(false);
          setCentavos(0);
          setDesconto(0);
          setNota({
            cliente_id: 0,
            data_emissao: new Date().toISOString().split('T')[0], // Data do dia
            observacoes: '',
            status: 'Producao', // Status padrão
            itens: [],
            desconto: 0,
            desconto_obs: ""
          });
        }}>
          {novaNotaOpen ? modoEdicao? "Cancelar Edição" :'Cancelar Pedido' : '+ Novo Pedido'}
        </button>
      </center>

      {novaNotaOpen ? (
        <div className="div-form-clientes" style={{ maxWidth: '80%', margin: '0 auto' }}>
          <h2>{modoEdicao ? 'Editar Pedido' : 'Novo Pedido'}</h2>
          <form onSubmit={handleSubmitNota}>
            <label>Cliente:</label>
            <Select
              ref={selectClienteRef}
              name="cliente_id"  // Certificando que o name seja 'cliente_id'
              options={clientes.map(c => ({ value: c.id, label: c.nome }))}
              value={clientes.map(c => ({ value: c.id, label: c.nome })).find(op => op.value === nota.cliente_id)}
              onChange={(op) => {
                if (op) {
                  setNota(prev => ({ ...prev, cliente_id: op.value }));  // Atualizando corretamente o cliente_id
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

            <label>Data de Emissão:</label>
            <input
              type="date"
              value={nota.data_emissao}
              onChange={(e) => setNota(prev => ({ ...prev, data_emissao: e.target.value }))}
              required
            />

            <label>Observações:</label>
            <input
              type="text"
              value={nota.observacoes}
              onChange={(e) => setNota(prev => ({ ...prev, observacoes: e.target.value }))}
            />

            <label>Status:</label>
            <select
              value={nota.status}
              onChange={(e) => setNota(prev => ({ ...prev, status: e.target.value as '' | 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga' }))}
            >
              <option value="">-- Selecione --</option>
              <option value="Producao">Em Produçao</option>
              <option value="Cancelada">Cancelado</option>
              <option value="Finalizada">Finalizado</option>
              <option value="Paga">Pago</option>
            </select>

            <h3>Produtos</h3>
            {nota.itens.map((item, index) => (

              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Select
                  name="produto_id" 
                  options={produtos.map(c => ({ value: c.id, label: c.nome + " - " + c.descricao }))}
                  value={produtos.map(c => ({ value: c.id, label: c.nome + " - " + c.descricao })).find(op => op.value === item.produto_id)}
                  onChange={(op) => {
                    handleItemChange(index, 'produto_id', op ?  op.value : 0)
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
                
                {/* <select
                  value={item.produto_id}
                  onChange={(e) => handleItemChange(index, 'produto_id', parseInt(e.target.value))}
                >
                  <option value="0">Selecione</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select> */}
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
                        value={formatarCentavosParaBRL(centavos)}
                        onChange={(e) => {
                          handleChangeValorProduto(e);
                          handleItemChange(index, `preco_unitario`, centavos / 10)
                        }}
                        style={{ maxWidth: "200px", fontSize: "16px", padding: "4px" }}
                      />
                    );
                  } else {
                    return (
                      <input
                        style={{ maxWidth: '30%' }}
                        type="text"
                        placeholder="Preço (Produto)"
                        value={
                          formatarReaisSemSimboloFloat(item.quantidade === 0 ? 0 : item.preco_unitario)
                        }
                        onChange={(e) => handleItemChange(index, 'preco_unitario', e.target.value)}
                        disabled={true}
                      />
                    );
                  }
                })()}
                <button type="button" onClick={() => removerItem(index)}>❌</button>
              </div>
            ))}
            {(() => {
                const hasProduto = nota.itens.length > 0;
                if(hasProduto){
                  return(
                    <>
                      <br/>
                      <hr></hr>
                      <br/>
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
                                required
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
            <button type="button" className='default-form' onClick={adicionarItem}>+ Produto</button>

            <button className="save" type='button' onClick={handleHasQtdProdutos}>{modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Pedido'}</button>
            <button className="save" hidden ref={buttonSubmitRef} type="submit"></button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '80%', margin: '0 auto' }}>
          <h2>Pedidos:</h2>
          <ul>
            {notas.map(nota => (
              <li key={nota.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{maxWidth: "8%"}}>Pedido {nota.id}</span>
                <span style={{width: "32%"}}>{nota.cliente}</span>
                <span style={{width: "10%"}}>{format(nota.data_emissao, "dd/MM/yyyy")}</span>
                <span>{nota.totalNota ? "R$ " + formatarReaisSemSimboloString(nota.totalNota) : ""}</span>
                <span style={{width: "5%"}}>
                  {nota.status !== "Producao" ? 
                    nota.status
                  :
                  <select
                    value={nota.status}
                    onChange={async (e) => {
                      const novoStatus = e.target.value as 'Producao' | 'Cancelada' | 'Finalizada' | 'Paga';
                      try {
                        await alterStatusNota(nota.id!, novoStatus);
                        setNotas(prev =>
                          prev.map(n => n.id === nota.id ? { ...n, status: novoStatus } : n)
                        );
                      } catch (err) {
                        console.error('Erro ao atualizar status:', err);
                      }
                    }}
                  >
                    <option value="Producao">Em Produção</option>
                    <option value="Cancelada">Cancelado</option>
                    <option value="Finalizada">Finalizado</option>
                    <option value="Paga">Pago</option>
                  </select>
                  }
                </span>
                <div className="acoes" style={{width: "20%"}}>
                  {nota.status === "Producao" ? <button title='Imprimir Serviço' className='botao-icone' onClick={() => carregarPedidoParaPDF(nota.id!, nota)}>📋</button> : <></>}
                  <button title='Imprimir Pedido' className='botao-icone' onClick={() => carregarNotaParaPDF(nota.id!, nota, false)}>📑</button>
                  <button title='Download Pedido' className='botao-icone' onClick={() => carregarNotaParaPDF(nota.id!, nota, true)}>📥</button>
                  <ModalUploadImagens notaId={nota.id}/>
                  {!nota.nota_impressa ? <button title='Editar Pedido' className='botao-icone' onClick={() => iniciarEdicao(nota.id!)}>✏️</button> : <></>}
                  {nota.status !== "Finalizada" && nota.status !== "Paga" && !nota.nota_impressa ? <button title='Excluir' className='botao-icone' onClick={() => excluirNota(nota.id!)}>🗑️</button> : <></>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Notas;