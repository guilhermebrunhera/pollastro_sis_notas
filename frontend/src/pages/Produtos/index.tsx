import './styles.css'
import { useState, useEffect } from 'react'
import { deleteProduto, getProdutos, postNewProduto, putProduto } from '../../services/APIService'
// import { NumericFormat } from 'react-number-format';
import { formatarReaisSemSimboloString, removerAcentosTexto } from '../../components/utils/utils';
import Toast from '../../components/Toasts/toasts';
import { printProdutos } from './printProdutos';

interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: string;
  tipo: string;
}

function Produtos() {

  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<'S' | 'P'>('P');
  const [termoFiltro, setTermoFiltro] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);

  useEffect(() => {
    listarProdutos();
    setTipoSelecionado(`P`)
  }, []);

  function listarProdutos() {
    getProdutos()
      .then(data => { setListaProdutos(data);})
      .catch(err => { console.error(err)});
  }

  const produtosFiltrados = listaProdutos.filter(produto =>
    removerAcentosTexto(produto.nome).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase()) ||
    removerAcentosTexto(produto.descricao).toLowerCase().includes(removerAcentosTexto(termoFiltro).toLowerCase())
  );

  const [produto, setProduto] = useState<Produto>({
    nome: "",
    descricao: "",
    preco: "0,00",
    tipo: "P"
  });

  const handleChangeValorProduto = (e: string) => {
    const raw = e.replace(/\D/g, ''); // só números
    const cents = parseInt(raw || '0', 10);

    const formatted = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatted;
  };
  
  const handleChangeProduto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProduto((prev) => ({
      ...prev,
      [name]: name === "preco" ? parseFloat(value) : value,
    }));
  };

  const handleSubmitProduto = (e: React.FormEvent) => {
    e.preventDefault();

    produto.nome = produto.nome.trim();
    produto.descricao = produto.descricao.trim();

    if(parseFloat(produto.preco.replace('.', '').replace(',', '.')) == 0){
      setToast({message: "Coloque um valor para o Produto.", type: "Alerta"}); return;
    } else {
      if (modoEdicao && produtoEditandoId !== null) {
        putProduto(produtoEditandoId, produto)
          .then(() => {
            setToast({message: "Produto salvo!", type: "Sucesso"})
            listarProdutos();
            setModoEdicao(false);
            setProdutoEditandoId(null);
            setNovoProdutoOpen(false);
            setTipoSelecionado('P');
            setProduto({ nome: '', descricao: '', preco: "0,00", tipo: "P" });
          })
          .catch(err => console.error(err));
      } else {
        postNewProduto(produto)
          .then(data => {
            if (data) {
              setToast({message: "Produto adicionado!", type: "Sucesso"})
              listarProdutos();
              setNovoProdutoOpen(false);
              setTipoSelecionado('P');
              setProduto({ nome: '', descricao: '', preco: "0,00", tipo: "P" });
            } else {
              setToast({message: "Erro ao cadastrar produto: " + data, type: "Erro"})
            }
          })
          .catch(err => setToast({message: "Erro ao cadastrar produto: " + err, type: "Erro"}));
      }
    }
  };

  const excluirProduto = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduto(id)
        .then(() => {
          setToast({message: "Produto excluido!", type: "Sucesso"})
          setListaProdutos(listaProdutos.filter(produto => produto.id !== id));
        })
        .catch(err => {
          setToast({message: "Erro ao excluir produto, este produto já está sendo utilizado em um pedido! " + err, type: "Erro"})
        });
    }
  };

  const imprimirProdutos = () => {
    printProdutos(produtosFiltrados);
  }

  return (
    <div className='content-clientes'>
      <div style={{ maxWidth: "80%", alignItems: "center", justifyContent: "space-between", margin: "0 auto", display: "flex" }}>
        <button 
          className='default'
          style={{width: '100%', margin: 0, padding: 0}} 
          onClick={() => {
            setNovoProdutoOpen(!novoProdutoOpen);
            setProduto({ nome: '', descricao: '', preco: "0,00", tipo: "P" });
          }}
        >
          {novoProdutoOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Produto'}
        </button>
        <button style={{maxWidth: "4rem", width: '100%'}} className='default' title='Imprimir Lista Produtos' onClick={imprimirProdutos}>🖨️</button>
      </div>

      {novoProdutoOpen ? 
        <div className='div-form-clientes' style={{ maxWidth: "80%", margin: "0 auto" }}>
          <h2>Cadastrar Novo Produto</h2>
          <form onSubmit={handleSubmitProduto}>
            <div>
              <label>Nome do Produto:</label>
              <input
                type="text"
                name="nome"
                value={produto.nome}
                onChange={handleChangeProduto}
                required
              />
            </div>
            <div>
              <label>Descrição/Fabricante:</label>
              <input
                type="text"
                name="descricao"
                value={produto.descricao}
                onChange={handleChangeProduto}
              />
            </div>
            <div>
              <label>Preço:</label>
              <input
                type="text"
                inputMode="numeric"
                value={produto.preco}
                onChange={(input) => {
                  let valor = handleChangeValorProduto(input.target.value);
                  setProduto((prev) => ({
                    ...prev,
                    preco: valor || "0,00",
                  }));
                }}
              />
            </div>
            <div>
              <label>Tipo de Produto:</label>
              <select
                name='tipo'
                value={tipoSelecionado}
                onChange={(e) => {
                  setTipoSelecionado(e.target.value as 'S' | 'P')
                  setProduto((prev) => ({
                    ...prev,
                    tipo: e.target.value || "P",
                  }));
                }}
                
              >
                <option value="P">Produto</option>
                <option value="S">Serviço</option>
              </select>
            </div>
            <button className='save' type="submit">
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Produto'}
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto" }}>
        <h3>Filtro:</h3>
        <input
          type="text"
          placeholder="Filtrar produtos..."
          value={termoFiltro}
          onChange={(e) => setTermoFiltro(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <h2>Lista de Produtos</h2>
        <ul>
          {produtosFiltrados.map((produto) => (
            <li key={produto.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{produto.nome}</span>
              <span>{produto.descricao}</span>
              <span>R$ {formatarReaisSemSimboloString(produto.preco)}</span>
              <div className='acoes'>
                <button
                  className="editar-cliente botao-icone"
                  style={{ marginLeft: "1rem", cursor: "pointer" }}
                  onClick={() => {
                    produto.preco = handleChangeValorProduto(produto.preco)
                    setProduto(produto);
                    setTipoSelecionado(produto.tipo as `S`|`P`)
                    setModoEdicao(true);
                    setProdutoEditandoId(produto.id ?? null);
                    setNovoProdutoOpen(true);
                  }}
                >
                  ✏️
                </button>
                <button className="botao-icone" onClick={() => excluirProduto(produto.id ?? 0)}>
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
  );
}

export default Produtos;
