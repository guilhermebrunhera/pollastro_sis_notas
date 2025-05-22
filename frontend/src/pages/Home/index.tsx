import { useEffect, useState } from 'react';
import { getDadosHome } from '../../services/APIService'
import './styles.css'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { formatarReaisSemSimboloFloat } from '../../components/utils/utils';
import Header from '../../components/Header';
import {EyeIcon, EyeOffIcon} from '../../components/utils/eyesIcon';

interface DadosHome {
  countProdutos: number;
  countClientes: number;
  countNotasEmAberto: number;
  precoEmProducao: string;
  precoFinalizada: string;
}

function Home() {

  const [dadosHome, setDadosHome] = useState<DadosHome>()
  const [showValue, setShowValue] = useState<number | null>(null)
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  useEffect(() => {
      carregarDadosHome();
  }, []);

  const carregarDadosHome = async () => {
    await getDadosHome()
            .then(data => {
              const dados = data.reduce((acc: any, item: any) => ({ ...acc, ...item }), {});
              setDadosHome(dados)
            })
            .catch(err => { console.error(err)})
  }

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
    </>
  )
}

export default Home
 