import './styles.css'
import { useState, useEffect } from 'react'
import { deleteProduto, getProdutos, postNewProduto, putProduto, removeFotoProd } from '../../services/APIService'
// import { NumericFormat } from 'react-number-format';
import { formatarReaisSemSimboloString, removerAcentosTexto } from '../../components/utils/utils';
import Toast from '../../components/Toasts/toasts';
import { printProdutos } from './printProdutos';
import Header from '../../components/Header';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: string;
  tipo: string;
  foto?: string;
}

function Produtos() {

  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<Produto[]>([]);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [produtoEditandoId, setProdutoEditandoId] = useState<number | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<'S' | 'P'>('P');
  const [termoFiltro, setTermoFiltro] = useState('');
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [foto, setFoto] = useState<File | null>(null)
  const [openDropsFoto, setOpenDropsFoto] = useState<string | undefined>(undefined);
  const [scrolled, setScrolled] = useState(false);
  const [showHeaders, setShowHeaders] = useState(true);

  useEffect(() => {
    listarProdutos();
    setTipoSelecionado(`P`);
    
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

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFoto(file);
  };

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

    setProduto(prev => ({
      ...prev,
      nome: prev.nome.trim(),
      descricao: prev.descricao.trim()
    }));

    if(parseFloat(produto.preco.replace('.', '').replace(',', '.')) == 0){
      setToast({message: "Coloque um valor para o Produto.", type: "Alerta"}); return;
    } else {
      if (modoEdicao && produtoEditandoId !== null) {
        putProduto(produtoEditandoId, produto, foto)
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
        postNewProduto(produto, foto)
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

  const removerFotoProduto = (id: number) => {
    removeFotoProd(id).then(data => {
      if(data.removed){
        setProduto({...produto, foto: ""});
        setToast({message: "Foto excluida", type: "Sucesso"})
      }
    })
  }

  return (
    <>
    <Header />
    <div className='content-clientes'>
      <center>
        <div className={showHeaders ? scrolled ? "div-background-header scrolled show" : "div-background-header show" : "div-background-header hide" }>
          <button 
            className='default'
            style={{width: `100%`}}
            onClick={() => {
              setNovoProdutoOpen(!novoProdutoOpen);
              setProduto({ nome: '', descricao: '', preco: "0,00", tipo: "P", foto: "" });
              setFoto(null)
            }}
          >
            {novoProdutoOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Produto'}
          </button>
          {!novoProdutoOpen && !modoEdicao ? 
            <input
              type="text"
              className='input-filtro'
              placeholder="Filtrar produtos..."
              value={termoFiltro}
              onChange={(e) => setTermoFiltro(e.target.value)}
              style={{ width: '80%', padding: '0.5rem', marginBottom: '1rem' }}
            />  
            : <></>
        }
        </div>
        {scrolled && !novoProdutoOpen && !modoEdicao ? 
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

      {novoProdutoOpen ? 
        <div style={{ maxWidth: "80%", margin: "0 auto", paddingTop: `7rem` }}>
          <h2>Cadastrar Novo Produto</h2>
          <form onSubmit={handleSubmitProduto}>
            <div className='div-form-produtos'>
              <div style={{width: "100%"}}>
                <div style={{maxWidth: "100%"}}>
                  <label>Nome do Produto:</label>
                  <input
                    type="text"
                    name="nome"
                    maxLength={22}
                    value={produto.nome}
                    onChange={handleChangeProduto}
                    required
                  />
                </div>
                <div style={{maxWidth: "100%"}}>
                  <label>Descrição/Fabricante (Opcional):</label>
                  <input
                    type="text"
                    maxLength={22}
                    name="descricao"
                    value={produto.descricao}
                    onChange={handleChangeProduto}
                  />
                </div>
                <div style={{maxWidth: "100%"}}>
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
                <div style={{maxWidth: "100%"}}>
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
              </div>
              <div style={{width: "100%"}}>
                <div style={{maxWidth: "100%"}}>
                  <label>Foto do Produto: </label> <br />
                  {produto.foto !== "" ?
                    <>
                      <img 
                        style={{height: '200px', width: '200px', marginTop: "10px"}} 
                        src={`http://localhost:3000/uploads/`+produto.foto}
                        onClick={() => window.open(`http://localhost:3000/uploads/`+produto.foto, '_blank')}
                      >
                      </img>
                      <button type="button" className='botao-icone' onClick={() => {
                        removerFotoProduto(produto.id ? produto.id: 0);
                      }}>
                        🗑️
                      </button>
                    </>
                  :
                      <>
                        <input type="file" accept="image/*" onChange={handleFotoChange} />
                        {foto ? <><img 
                          style={{height: '200px', width: '200px', marginTop: "10px"}} 
                          src={URL.createObjectURL(foto)}
                        ></img> 
                        </>
                      : <></>}
                      </>
                  }
                </div>
              </div>
            </div>
            <button className='save' type="submit">
              {modoEdicao ? 'Salvar Alterações' : 'Salvar Novo Produto'}
            </button>
          </form>
        </div>
      :
      <div style={{ maxWidth: "80%", margin: "0 auto", paddingTop: `9rem` }}>
        
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Lista de Produtos</h2>
          <button style={{maxWidth: "4rem", width: '100%'}} className='default' title='Imprimir Lista Produtos' onClick={imprimirProdutos}>🖨️</button>
        </div>
        <ul>
          {
            produtosFiltrados.length === 0 ?
            <div style={{width: `100%`, textAlign: `center`}}>
              <h2>Nenhum Produto encontrado, tente outro filtro.</h2>
            </div>
            :
            <></>
          }
          {produtosFiltrados.map((produto) => (
            <li key={produto.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>{produto.nome}</span>
              <span>{produto.descricao}</span>
              <span>R$ {formatarReaisSemSimboloString(produto.preco)}</span>
              <div className='acoes'>
                {produto.foto !== "" && produto.foto !== undefined && produto.foto !== null ? 
                  <div style={{position: `relative`, alignSelf: 'center'}}>
                          <button className='botao-icone' type='button' onClick={() => setOpenDropsFoto(openDropsFoto === produto.foto ? "" : produto.foto)}>📷</button>
                          {openDropsFoto === produto.foto && ( 
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
                                <img style={{width: `250px`, height: `250px`}} src={`http://localhost:3000/uploads/`+produto.foto}></img>
                            </div>
                          )}
                        </div>
                : 
                  <></>
                }
                <button 
                  className='botao-icone'
                  onClick={
                    () => {
                      setNovoProdutoOpen(!novoProdutoOpen);
                      setProduto({ nome: produto.nome, descricao: produto.descricao, preco: formatarReaisSemSimboloString(produto.preco), tipo: produto.tipo, foto: "" });
                      setFoto(null)
                    }
                  }
                  title='Copiar Produto'
                >
                ➕
                </button>
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
                    setFoto(null)
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
    </>
  );
}

export default Produtos;
