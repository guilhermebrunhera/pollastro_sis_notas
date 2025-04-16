import './styles.css'
import { useState } from 'react'

interface Produto {
  nome: string;
  descricao: string;
  preco: number;
}

function Produtos() {
  const [produto, setProduto] = useState<Produto>({
      nome: "",
      descricao: "",
      preco: 0
    });
  
    const [novoProdutoOpen, setNovoProdutoOpen] = useState(false)
  
    const handleChangeProduto = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setProduto((prev) => ({
        ...prev,
        [name]: value,
      }));
    };
  
    const handleSubmitProduto = (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Produto cadastrado:", produto);
      // Aqui você pode usar axios para enviar ao backend
    };
  
    return (
      <div className='content-produtos'>
        <center>
          <button 
            className='default' 
            onClick={
              () => {
                setNovoProdutoOpen(!novoProdutoOpen)
                setProduto(() => ({
                  nome : "",
                  preco: 0,
                  descricao: ""
                }));
              }
            }
          >
            {novoProdutoOpen ? 'Cancelar Cadastro' : '+ Cadastrar novo Produto'}
          </button>
        </center>
        
  
        {novoProdutoOpen ? 
          <div className='div-form-produtos' style={{ maxWidth: "80%", margin: "0 auto" }}>
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
                <label>Descrição/Fabricante do Produto</label>
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
                  type="number"
                  name="preco"
                  value={produto.preco}
                  onChange={handleChangeProduto}
                  required
                />
              </div>
              <button className='save' type="submit">Salvar Novo Produto</button>
            </form>
          </div>
        :
          <div></div> // mostrar Lista de produtos
        }
      </div>
    );
}

export default Produtos
