import './styles.css'
import { useState, useEffect } from 'react'
import { deleteProduto, getProdutos, postNewProduto, putProduto } from '../../services/APIService'
// import { NumericFormat } from 'react-number-format';
import { formatarReaisSemSimboloString } from '../../components/utils/utils';

interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: string;
}

function Produtos() {

  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);

  useEffect(() => {
    listarProdutos();
  }, []);

  function listarProdutos() {
    getProdutos()
      .then(data => { setListaProdutos(data); })
      .catch(err => { console.error(err)});
  }

  const [produto, setProduto] = useState<Produto>({
    nome: "",
    descricao: "",
    preco: "0,00"
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

    if (modoEdicao && produtoEditandoId !== null) {
      putProduto(produtoEditandoId, produto)
        .then(() => {
          listarProdutos();
          setModoEdicao(false);
          setProdutoEditandoId(null);
          setNovoProdutoOpen(false);
          setProduto({ nome: '', descricao: '', preco: "0,00" });
        })
        .catch(err => console.error(err));
    } else {
      postNewProduto(produto)
        .then(data => {
          if (data) {
            listarProdutos();
            setNovoProdutoOpen(false);
            setProduto({ nome: '', descricao: '', preco: "0,00" });
          } else {
            console.error("Erro ao cadastrar produto:", data);
          }
        })
        .catch(err => console.error(err));
    }
  };

  const excluirProduto = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteProduto(id)
        .then(() => {
          setListaProdutos(listaProdutos.filter(produto => produto.id !== id));
        })
        .catch(err => {
          console.error("Erro ao excluir produto:", err);
        });
    }
  };

  return (
    <div className='content-clientes'>
      <center>
        <button 
          className='default' 
          onClick={() => {
            setNovoProdutoOpen(!novoProdutoOpen);
            setProduto({ nome: '', descricao: '', preco: "0,00" });
          }}
        >
          {novoProdutoOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Produto'}
        </button>
      </center>

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
                required
              />
            </div>
            <div>
              <label>Preço:</label>
              {/* <NumericFormat
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                fixedDecimalScale
                allowNegative={false}
                name="preco"
                value={produto.preco}
                onValueChange={(values) => {
                  const { floatValue } = values;
                  setProduto((prev) => ({
                    ...prev,
                    preco: floatValue || 0,
                  }));
                }}
                className="input"
                required
              /> */}
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
            <button className='save' type="submit">
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Produto'}
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto" }}>
        <h2>Lista de Produtos</h2>
        <ul>
          {listaProdutos.map((produto) => (
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
    </div>
  );
}

export default Produtos;
