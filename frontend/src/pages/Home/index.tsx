import { useEffect, useState } from 'react';
import { getDadosHome, getPedidosVencidos, getDadosBoletos, updateStatusBoleto, deleteBoleto } from '../../services/APIService'
import './styles.css'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString } from '../../components/utils/utils';
import Header from '../../components/Header';
import {EyeIcon, EyeOffIcon} from '../../components/utils/eyesIcon';
import { format } from 'date-fns';
import ModalBoletos from './modalBoleto';
import Toast from '../../components/Toasts/toasts';
import { useSearchParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { FaBarcode } from 'react-icons/fa';

interface DadosHome {
  countProdutos: number;
  countClientes: number;
  countNotasEmAberto: number;
  precoEmProducao: string;
  precoFinalizada: string;
}

interface PedidosVencidos {
  id: number;
  dias_atraso: number;
  totalNota: number;
  clienteNome: string;
  data_emissao: Date;
  telefone: string;
}

interface Boletos {
  id: number;
  nome_boleto: string;
  valor_boleto: number;
  data_vencimento: string;
  status: string;
  local_foto?: string;
  linha_digitavel?: string;
}

function Home() {

  const [dadosHome, setDadosHome] = useState<DadosHome>()
  const [pedidosVencidos, setPedidosVencidos] = useState<PedidosVencidos[]>([])
  const [boletos, setBoletos] = useState<Boletos[]>([])
  const [modalBoletoAberto, setModalBoletoAberto] = useState(false);
  const [showValue, setShowValue] = useState<number | null>(null)
  const [showPedidosVencidos, setShowPedidosVencidos] = useState<boolean>(false)
  const [slideHome, setSlideHome] = useState(false);
  const [slideGraficos, setSlideGraficos] = useState(true);
  const [slideBoletos, setSlideBoletos] = useState(false);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  
  useEffect(() => {
    const parametros = new URLSearchParams(location.search);
    const aba = parametros.get('aba');

    setSlideHome(aba === 'home');
    setSlideGraficos(!aba || aba === 'graficos');
    setSlideBoletos(aba === 'boletos');
  }, [location.search]);

  useEffect(() => {
      carregarDadosHome();
      carregarPedidosVencidos();
      carregarBoletos();
  }, []);

  useEffect(() => {
    const aba = searchParams.get('aba');

    if (aba === 'boletos') {
      setSlideHome(false);
      setSlideGraficos(false);
      setSlideBoletos(true);
    }
  }, [searchParams]);

  const handleLinhaDigitavel = async (linhaDigitavel: string) => {
    await navigator.clipboard.writeText(
      linhaDigitavel
    );

    setToast({
      message: 'Linha digitável copiada!',
      type: 'Sucesso'
    });
  }

  const handleDeleteBoleto = async (id: number) => {
    try {
      await deleteBoleto(id);
      setBoletos(boletos.filter(b => b.id !== id));
      setToast({
        message: 'Boleto excluído com sucesso!',
        type: 'Sucesso'
      });
    } catch (error) {
      setToast({
        message: 'Erro ao excluir boleto!',
        type: 'Erro'
      });
      console.error("Erro ao excluir boleto:", error);
    }
  }

  const carregarDadosHome = async () => {
    await getDadosHome()
            .then(data => {
              const dados = data.reduce((acc: any, item: any) => ({ ...acc, ...item }), {});
              setDadosHome(dados)
            })
            .catch(err => { console.error(err)})
  }

  const carregarPedidosVencidos = async () => {
    await getPedidosVencidos().then(data => {setPedidosVencidos(data)})
  }

  const carregarBoletos = async () => {
    await getDadosBoletos()
      .then(data => {setBoletos(data); console.log(data)})
  }

  const alterarStatusBoleto = async (id: number, status: string) => {
    const boleto = boletos.find(b => b.id === id);
    if (!boleto) return;

    try {
      await updateStatusBoleto(id, status);
      setBoletos(boletos.map(b => b.id === id ? { ...b, status } : b));
    } catch (error) {
      console.error("Erro ao alterar status do boleto:", error);
    }
  };

  const data = [
    { name: 'Clientes: ' + dadosHome?.countClientes, value: dadosHome?.countClientes, pathName: "Clientes" },
    { name: 'Pedidos em Aberto: ' + dadosHome?.countNotasEmAberto, value: dadosHome?.countNotasEmAberto, pathName: "Notas" },
  ];

  const dataFinanceiro = [
    { name: 'Valor à Receber: ', valueBR: formatarReaisSemSimboloFloat(parseFloat(dadosHome?.precoEmProducao ? dadosHome.precoEmProducao : "0")) , value: parseFloat(dadosHome?.precoEmProducao ? dadosHome.precoEmProducao : "0") },
    { name: 'Valor Recebido: ', valueBR: formatarReaisSemSimboloFloat(parseFloat(dadosHome?.precoFinalizada ? dadosHome.precoFinalizada : "0")) , value: parseFloat(dadosHome?.precoFinalizada ? dadosHome.precoFinalizada : "0") },
  ];

  const barData = [
    { name: 'Produtos', value: dadosHome?.countProdutos, pathName: "Produtos" }
  ];

  return (
    <>
    <Header />
      
      <div className='content-home' style={{display: `flex`, alignItems: `center`, justifyContent: `center`}}>
        <button 
          className={slideGraficos ? "default ativo" : "default"}
          disabled={slideGraficos ? true : false}
          onClick={() => {
            setSlideHome(false)
            setSlideGraficos(true)
            setSlideBoletos(false)
          }}  
        >
          Gráficos
        </button>
        <button 
          className={slideHome ? "default ativo" : "default"}
          disabled={slideHome ? true : false}
          onClick={() => {
            setSlideHome(true)
            setSlideGraficos(false)
            setSlideBoletos(false)
          }}  
        >
          Pedidos Vencidos
        </button>
        <button 
          className={slideBoletos ? "default ativo" : "default"}
          disabled={slideBoletos ? true : false}
          onClick={() => {
            setSlideHome(false)
            setSlideGraficos(false)
            setSlideBoletos(true)
          }}  
        >
          Boletos
        </button>
      </div>

      {slideGraficos ? 
        <div className='content-home' style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem', padding: '2rem' }}>
          <div style={{height: 400}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} style={{cursor: "pointer"}} onClick={() => {window.location.href = `http://localhost:3010/${_.pathName}`}}/>
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{height: 200, width: 500, margin: 110, padding: 0}}>
            <ResponsiveContainer>
              <BarChart data={barData} layout='vertical' style={{cursor: "pointer"}} onClick={() => {window.location.href = `http://localhost:3010/${barData[0].pathName}`}} >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type='number' />
                <YAxis type='category' dataKey="name" hide />
                <Legend />
                <Bar dataKey="value" name={"Produtos Cadastrados: " + barData[0].value} fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{height: 400}}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataFinanceiro}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label={false}

                >
                  {dataFinanceiro.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{display: `grid`, gap:"0.5rem", alignItems: `center`, paddingTop: 0, marginTop: 0}}>
                  {dataFinanceiro.map((_, index) => (
                    
                    <div className="legend-box" style={{gap: `0.5rem`}}>
                      <div className='legend-dot' style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                      <span style={{color: COLORS[index % COLORS.length]}} >{_.name}{showValue === index ? `R$ `+_.valueBR : `R$ *******`} <button type='button' className='botao-icone' onClick={() => setShowValue(showValue === index ? null : index)}>{showValue === index ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}</button></span>
                    </div>
                  ))}
              </div>
          </div>
        </div>
        : slideHome ?
        <div className='content-home' style={{ paddingTop: `1rem`}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: `center`}}>
            <label>Pedidos Vencidos à mais de 30 Dias</label>
            <button className='botao-icone' onClick={() => setShowPedidosVencidos(!showPedidosVencidos)}>{showPedidosVencidos ? <EyeOffIcon size={35} title='Esconder Pedidos'></EyeOffIcon> : <EyeIcon size={35} title='Mostrar Pedidos'></EyeIcon>}</button>
          </div>

          {pedidosVencidos.length > 0 ?
            <div style={{width: `100%`, paddingTop: `2rem`}}>
              
              {pedidosVencidos.map((pedidos) => (
                <li key={pedidos.id} style={{ display: 'flex', width: `100%` }}>
                  <span style={{maxWidth: `5%`, filter: showPedidosVencidos ? `none` : `blur(4px)`}}>{pedidos.id}</span>
                  <span style={{maxWidth: `30%`, filter: showPedidosVencidos ? `none` : `blur(4px)`}}>{pedidos.clienteNome}</span>
                  <span style={{maxWidth: `20%`, textAlign: `right`, filter: showPedidosVencidos ? `none` : `blur(4px)`}}>R$ {formatarReaisSemSimboloString(String(pedidos.totalNota))}</span>
                  <span style={{maxWidth: `20%`, textAlign: `center`, filter: showPedidosVencidos ? `none` : `blur(4px)`}}>{format(pedidos.data_emissao, "dd/MM/yyyy")}</span>
                  <span style={{maxWidth: `5%`, filter: showPedidosVencidos ? `none` : `blur(4px)`}}>{pedidos.dias_atraso} dias</span>
                  <span style={{maxWidth: `20%`, textAlign: 'center', filter: showPedidosVencidos ? `none` : `blur(4px)`}}>{pedidos.telefone}</span>
                </li>
              ))}
            </div>
           :
            <div style={{width: `100%`, textAlign: 'center', paddingTop: `2rem`}}>
              <h2>Nenhum Pedido com Vencimento maior que 30 Dias encontrado!</h2>
            </div>
          }
        </div>
        : slideBoletos ? (

        // BOLETOS
        <div className='content-home' style={{ paddingTop: '1rem' }}>
          
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <label>Boletos À Pagar</label>
          </div>

          <button
            className="default bt-header"
            style={{ minWidth: '96%' }}
            onClick={() => setModalBoletoAberto(true)}
          >
            Adicionar Novo Boleto
          </button>

          {modalBoletoAberto && (
            <ModalBoletos
              onClose={(success, toast) => {
                setModalBoletoAberto(false);

                if (success) {
                  carregarBoletos();
                }
                if (toast) {
                  setToast({message: "Boleto cadastrado com sucesso!", type: "Sucesso"});
                }
              }}
            />
          )}

          <div style={{ width: '100%', paddingTop: '2rem' }}>
            {boletos.length > 0 ? (
              boletos.map((boleto) => (
                <li key={boleto.id} style={{ display: 'flex', width: '100%' }}>
                  <span style={{ maxWidth: '50%' }}>{boleto.nome_boleto}</span>
                  <span style={{ maxWidth: '25%' }}>R$ {formatarReaisSemSimboloString(String(boleto.valor_boleto))}</span>
                  <span style={{ maxWidth: '25%' }}>{boleto.data_vencimento}</span>
                  <span style={{ maxWidth: '25%' }}>
                    {boleto.linha_digitavel ? (
                      <FaBarcode
                        size={28}
                        title="Copiar Linha Digitável"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleLinhaDigitavel(boleto.linha_digitavel || '')}
                      />) : (
                      <></>
                    )}
                  </span>
                  <span style={{ maxWidth: '25%' }}>
                    {boleto.status === 'Pago' ? (
                      <span>Pago</span>
                    ) : (
                      <select
                        value={boleto.status}
                        onChange={(e) =>
                          alterarStatusBoleto(boleto.id, e.target.value)
                        }
                      >
                        <option value="Em Aberto">Em Aberto</option>
                        <option value="Pago">Pago</option>
                      </select>
                    )}
                  </span>
                  <span style={{ minWidth: '5%', maxWidth: '5%', textAlign: 'center', alignContent: 'center', justifyContent: 'center'   }}>
                    {boleto.local_foto ? (
                      <a href={`http://localhost:3000/uploads/`+boleto.local_foto} title="Visualizar boleto" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex' }}>
                        📷
                      </a>
                    ) : (
                      <>
                      </>
                    )}
                  </span>
                  <span style={{ minWidth: '5%', maxWidth: '5%', textAlign: 'center', alignContent: 'center', justifyContent: 'center'   }}>
                    {boleto.status === 'Pago' ? (
                      <></>
                    ) : (
                      <button title='Excluir' className='botao-icone' onClick={() => handleDeleteBoleto(boleto.id)}>🗑️</button>
                    )}
                  </span>
                </li>
              ))
            ) : (
              <h2>Nenhum Boleto encontrado!</h2>
            )}
          </div>
        </div>

) : null
      }
    {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
    </>
  )
}

export default Home
 