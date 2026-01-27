import React, { useEffect, useRef, useState } from 'react';
import { BuscarPedidosCliente } from '../../services/APIService';
import { format } from 'date-fns';
import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString } from '../../components/utils/utils';
import { printRelatorio } from './printRelatorio';
import Toast from '../../components/Toasts/toasts';

interface Cliente {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  cpf_cnpj: string;
  cidade: string;
  cep: string;
  contato: string;
  tel_contato: string;
}

interface RelatorioModalProps {
  relatorioPedidos: boolean;
  onClose: () => void;
  cliente: Cliente;
}

interface Pedidos {
  data: string;
  numeroPedido: number;
  valor: string;
  status: string;
  valorPago: number;
  check: boolean;
}

const RelatorioModal: React.FC<RelatorioModalProps> = ({ relatorioPedidos, onClose, cliente }) => {
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [filtrado, setFiltrado] = useState<boolean>(false);
  const [status, setStatus] = useState<"" | "Producao" | "Cancelada" | "Finalizada" | "Entregue" | "Paga" | "Orcamento">('');
  const [listaPedidos, setListaPedidos] = useState<Pedidos[]>([]);
  const [totalFiltrado, setTotalFiltrado] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [limiteExibicao, setLimiteExibicao] = useState(8);
  const pedidosExibidos = listaPedidos.slice(0, limiteExibicao);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
        setLimiteExibicao((prev) => Math.min(prev + 8, listaPedidos.length));
      }
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [listaPedidos]);

  useEffect(() => {
    let totalPedidos = 0;
    listaPedidos.forEach((pedido) => {
      totalPedidos += parseFloat(pedido.valor);
    });
    setTotalFiltrado(totalPedidos);
  }, [listaPedidos]);

  useEffect(() => {
  if (relatorioPedidos) {
      setDataInicio('');
      setDataFim('');
      setStatus('');
      setListaPedidos([]);
      setFiltrado(false);
      setTotalFiltrado(0);
      setLimiteExibicao(8);
    }
  }, [relatorioPedidos]);

  if (!relatorioPedidos) return null;

  const GerarRelatorio = () => {

    if (!dataInicio || !dataFim) {
      setToast({message:'Por favor, selecione a Data Inicial e a Data Final.', type: "Alerta"});
      return;
    }

    BuscarPedidosCliente(cliente.id ?? 0, dataFim, dataInicio, status).then((data) => {
      data = data.map((pedido: Pedidos) => ({ ...pedido, check: true }));
      setListaPedidos(data);
      setFiltrado(true);
      setLimiteExibicao(8); // resetar paginação ao buscar
    });
  };

  const ImprimirRelatorio = () => {
    const pedidosSelecionados = listaPedidos.filter(pedido => pedido.check);
    if (pedidosSelecionados.length === 0) {
      setToast({message:'Por favor, selecione ao menos um pedido para gerar o relatório.', type: "Alerta"});
      return;
    }
    printRelatorio(cliente, pedidosSelecionados, dataInicio, dataFim);
  };

  function handleCheck(numeroPedido: number): void {
    setListaPedidos((prevPedidos) =>
      prevPedidos.map((pedido) =>
        pedido.numeroPedido === numeroPedido
          ? { ...pedido, check: !pedido.check }
          : pedido
      )
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: '0',
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '6rem',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <div style={{}}>
        {toast && (
              <Toast
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(null)}
              />
            )}
      </div>
      <div
        style={{
          backgroundColor: 'rgba(70, 69, 69, 1)',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '800px',
          padding: '24px',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            color: '#6b7280',
            background: 'none',
            border: 'none',
            fontSize: '32px',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#1f2937')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
        >
          &times;
        </button>

        <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, textAlign: 'center' }}>
          Relatório de Pedidos - {cliente.nome}
        </h2>
        <hr />

        <form>
          <div style={{ width: `100%`, display: `flex`, gap: `0.5rem` }}>
            <div style={{ width: `25%` }}>
              <label>Data Inicial</label>
              <input
                max={dataFim || undefined}
                type='date'
                value={dataInicio}
                required
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div style={{ width: `25%` }}>
              <label>Data Final</label>
              <input
                min={dataInicio || undefined}
                type='date'
                value={dataFim}
                required
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div style={{ width: `25%` }}>
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value=''>Todos</option>
                <option value='Orcamento'>Orçamentos</option>
                <option value='Cancelada'>Cancelados</option>
                <option value='Producao'>Em Produção</option>
                <option value='Finalizada'>Finalizados</option>
                <option value='Paga'>Pagos</option>
                <option value='Entregue'>Entregues</option>
              </select>
            </div>
            <div style={{ width: `25%` }}>
              <button type='button' className='default save' onClick={GerarRelatorio}>
                Filtrar
              </button>
            </div>
          </div>
        </form>

        <hr />
        <br />

        <div style={{ width: `100%` }}>
          {!filtrado && listaPedidos.length === 0 ? (
            <div style={{ width: `100%`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <h3>Filtre para visualizar.</h3>
            </div>
          ) : listaPedidos.length === 0 ? (
            <div style={{ width: `100%`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <h3>Nenhum pedido encontrado para este filtro.</h3>
            </div>
          ) : (
            <>
              {/* Cabeçalho fixo */}
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  gap: '0.5rem',
                  paddingRight: '0.5rem',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #ccc',
                  paddingBottom: '0.25rem',
                }}
              >
                <div style={{ width: `5%` }}>#</div>
                <div style={{ width: `20%` }}>Data</div>
                <div style={{ width: `30%`, textAlign: `center` }}>Pedido</div>
                <div style={{ width: `20%`, textAlign: `center` }}>Status</div>
                <div style={{ width: `25%`, textAlign: `right` }}>Valor</div>
              </div>

              {/* Conteúdo rolável */}
              <div
                ref={scrollRef}
                style={{
                  width: '100%',
                  maxHeight: '190px',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}
              >
                {pedidosExibidos.map((pedido) => (
                  <div key={pedido.numeroPedido} style={{ width: `100%`, display: `flex`, gap: `0.5rem` }}>
                    <div style={{ width: `5%` }}><input style={{ cursor: 'pointer', width: '1.2rem' }} type='checkbox' checked={pedido.check} onChange={() => handleCheck(pedido.numeroPedido)} /></div>
                    <div style={{ width: `20%` }}>{format(new Date(pedido.data), 'dd/MM/yyyy')}</div>
                    <div style={{ width: `30%`, textAlign: 'center' }}>
                      Pedido Nº <b>{pedido.numeroPedido}</b>
                    </div>
                    <div style={{ width: `20%`, textAlign: 'center' }}>
                      <b>{pedido.status}</b>
                    </div>
                    <div style={{ width: `25%`, textAlign: `right` }}>
                      R$ {formatarReaisSemSimboloString(pedido.valor)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {listaPedidos.length > 0 && (
            <>
              <div style={{ width: `100%`, textAlign: `right` }}>
                <b>Total: R$ {formatarReaisSemSimboloFloat(totalFiltrado)}</b>
              </div>
              <div style={{ width: `100%`, alignContent: `center`, textAlign: `center` }}>
                <button type='button' className='default save' onClick={ImprimirRelatorio}>
                  Gerar Relatório
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatorioModal;