import './styles.css';
import { useState, useEffect } from 'react';
import Select from 'react-select';
import { getClientes, getProdutos, getNotas, postNota, deleteNota, putNota, getProdutosID } from '../../services/APIService';
import { format } from 'date-fns';
import { gerarNotaPDF } from '../../components/notaPdfGenerator'
import { formatarReaisSemSimboloFloat } from '../../components/utils/utils';

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
  descricao: string
}

interface NotaItem {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

interface Nota {
  id?: number;
  cliente_id: number;
  data_emissao: string;
  observacoes: string;
  status: 'Producao' | 'Cancelada' | 'Finalizada';
  itens: NotaItem[];
  cliente?: string;
  endereco?: string;
  telefone?: string;
  email?: string;
}

function Notas() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [novaNotaOpen, setNovaNotaOpen] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [notaEditandoId, setNotaEditandoId] = useState<number | null>(null);

  const [nota, setNota] = useState<Nota>({
    cliente_id: 0,
    data_emissao: new Date().toISOString().split('T')[0], // Data do dia
    observacoes: '',
    status: 'Producao', // Status padrão
    itens: []
  });

  useEffect(() => {
    carregarDados();
  }, []);

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
    } else {
      novosItens[index][field] = typeof value === 'string' ? parseFloat(value) : value;
    }
    
    setNota(prev => ({ ...prev, itens: novosItens }));
  };

  const adicionarItem = () => {
    setNota(prev => ({
      ...prev,
      itens: [...prev.itens, { produto_id: 0, quantidade: 1, preco_unitario: 0 }]
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
        itens: []
      });
      setNovaNotaOpen(false);
      setModoEdicao(false);
      setNotaEditandoId(null);
      carregarDados();
    } catch (err) {
      console.error(err);
    }
  };

  // const iniciarEdicao = (id: number) => {
  //   const notaSelecionada = notas.find(n => n.id === id);
  //   if (!notaSelecionada) return;

  //   setNota({
  //     cliente_id: notaSelecionada.cliente_id,
  //     data_emissao: notaSelecionada.data_emissao,
  //     observacoes: notaSelecionada.observacoes,
  //     status: notaSelecionada.status,
  //     itens: notaSelecionada.itens || []
  //   });
  //   setModoEdicao(true);
  //   setNotaEditandoId(id);
  //   setNovaNotaOpen(true);
  // };

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

  function carregarNotaParaPDF(id: number, nota: Nota) {
    getProdutosID(id)
      .then((data: ProdutosDaNota[]) => {
        console.log(data)
        gerarNotaPDF(
          {
            nome : nota.cliente ? nota.cliente : "",
            numero: String(nota.id),
            data: format(nota.data_emissao, "dd/MM/yy"),
            cidade: String(nota.endereco),
            telefone: String(nota.telefone) ,
            email: String(nota.email),
            endereco: String(nota.endereco),
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
          setNota({
            cliente_id: 0,
            data_emissao: new Date().toISOString().split('T')[0], // Data do dia
            observacoes: '',
            status: 'Producao', // Status padrão
            itens: []
          });
        }}>
          {novaNotaOpen ? 'Cancelar Cadastro' : '+ Nova Nota'}
        </button>
      </center>

      {novaNotaOpen ? (
        <div className="div-form-clientes" style={{ maxWidth: '80%', margin: '0 auto' }}>
          <h2>{modoEdicao ? 'Editar Nota' : 'Nova Nota'}</h2>
          <form onSubmit={handleSubmitNota}>
            <label>Cliente:</label>
            <Select
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
              onChange={(e) => setNota(prev => ({ ...prev, status: e.target.value as 'Producao' | 'Cancelada' | 'Finalizada' }))}
            >
              <option value="Producao">Em Produçao</option>
              <option value="Cancelada">Cancelada</option>
              <option value="Finalizada">Finalizada</option>
            </select>

            <h3>Produtos</h3>
            {nota.itens.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <Select
                  name="produto_id"  // Certificando que o name seja 'cliente_id'
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
                  type="number"
                  placeholder="Qtd"
                  value={item.quantidade}
                  min="1"
                  onChange={(e) => handleItemChange(index, 'quantidade', e.target.value)}
                />
                <input
                style={{maxWidth: '30%'}}
                  type="text"
                  placeholder="Preço"
                  value={item.quantidade > 1 ? formatarReaisSemSimboloFloat(item.preco_unitario * item.quantidade) : formatarReaisSemSimboloFloat(item.preco_unitario)}
                  onChange={(e) => handleItemChange(index, 'preco_unitario', e.target.value)}
                  disabled
                />
                <button type="button" onClick={() => removerItem(index)}>❌</button>
              </div>
            ))}
            <button type="button" className='default-form' onClick={adicionarItem}>+ Produto</button>

            <button className="save" type="submit">{modoEdicao ? 'Salvar Alterações' : 'Criar Nota'}</button>
          </form>
        </div>
      ) : (
        <div style={{ maxWidth: '80%', margin: '0 auto' }}>
          <h2>Notas Emitidas</h2>
          <ul>
            {notas.map(nota => (
              <li key={nota.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Nota {nota.cliente} #{nota.id}</span>
                <span>{format(nota.data_emissao, "dd/MM/yyyy")}</span>
                <span>{nota.status === 'Producao' ?  'Em Produção' : nota.status === 'Cancelada' ? 'Cancelada' : 'Finalizada'}</span>
                <div className="acoes">
                  <button className='botao-icone' onClick={() => carregarNotaParaPDF(nota.id!, nota)}>📑</button>
                  <button className='botao-icone' onClick={() => excluirNota(nota.id!)}>🗑️</button>
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