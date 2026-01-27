import { useEffect, useState } from 'react';
import { deletePagamento, getPagamentos, postListaPagamentos } from '../../services/APIService';
import { formatarReaisSemSimboloString } from '../../components/utils/utils';
// import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString } from '../../components/utils/utils';

interface Pagamentos {
  id?: number,
  notaId: number,
  valorPago: number,
  observacao: string,
  dataPagamento: string,
  pago: boolean,
  changed: boolean
} 

export default function ModalPagamentos({notaId, notaValor, onClose}: {notaId: number, notaValor: string, onClose: (success: boolean) => void}) {
  const [modalAberto, setModalAberto] = useState(false)
  const [dataInicio, setDataInicio] = useState("")
  const [parcelas, setParcelas] = useState(0)
  const [valorRestante, setValorRestante] = useState("")
  const [editar, setEditar] = useState(false)
  const [listaPagamentos, setListaPagamentos] = useState<Pagamentos[]>([])

  useEffect(() => { CarregarListaPagamentos(); setValorRestante(notaValor) }, [modalAberto])

  const CarregarListaPagamentos = async () =>{
    await getPagamentos(notaId).then(data => { 
      if (data.length !== 0) {
        setListaPagamentos(data)
        setEditar(true)
      } else {
        setListaPagamentos([])
        setEditar(false)
      } 
     })
  }

  const DividirValorEmParcelas = (index: number | 0,firstDivided: boolean, valueInput: number) =>{
    if(!editar){
      let valorPorParcela = 0;
      let valorJaInserido = 0;
      let qtdInserido = 0;

      setValorRestante(parseFloat(notaValor).toFixed(2));

      if(firstDivided) {
        valorPorParcela = parseFloat(notaValor) / parcelas
      }else{
        setListaPagamentos(prev => 
          prev.map((pagamento, i) => 
            i === index ? { ...pagamento, changed: true } : pagamento
          )
        )

        listaPagamentos.map((pagamento, i) => {
          if(pagamento.changed && i !== index) {
            valorJaInserido += pagamento.valorPago;
            qtdInserido++;
          }
        })
        valorPorParcela = (parseFloat(notaValor) - parseFloat(valueInput.toFixed(2)) - parseFloat(valorJaInserido.toFixed(2))) / (parcelas - 1 - qtdInserido);
      }

      valorPorParcela = parseFloat(valorPorParcela.toFixed(2)); 

      setListaPagamentos(prev => prev.map((item, i) => {
          if(firstDivided){
            return { ...item, valorPago: parseFloat(valorPorParcela >= 0 ? valorPorParcela.toFixed(2) : "0.00") }
          } else {
            return i !== index && !item.changed ? { ...item, valorPago: parseFloat(valorPorParcela >= 0 ? valorPorParcela.toFixed(2) : "0.00") } : item;
          }
      }))
    }
  }

  const SalvarPagamentos = async (e: React.MouseEvent<HTMLButtonElement>) => {
    let dataVazia = 0;
    let valorVazio = 0;

    listaPagamentos.forEach(pagamento => {
      if(
        pagamento.valorPago === 0 ||
        pagamento.valorPago === 0.00 ||
        pagamento.valorPago.toString() === "0,00" ||
        pagamento.valorPago === null ||
        pagamento.valorPago === undefined
      ) {valorVazio++}

      if(
        pagamento.dataPagamento === "" ||
        pagamento.dataPagamento === null ||
        pagamento.dataPagamento === undefined
      ) {dataVazia++}
    })
    
    if(dataVazia === 0){
      if(valorVazio === 0){
        await postListaPagamentos(listaPagamentos, notaId).then(data => {
          if(data.success){
            setModalAberto(false)
            onClose(true)
            e.stopPropagation()
          }
        })
      } else {
        alert("Valor de Pagamento não pode estar vazio!")
      }
    } else {
      alert("Data de Pagamento não pode estar vazia!")
    }
    
  }

  const ExcluirParcela = async (index: number, id: number | undefined) => {
    if(id !== undefined){
      await deletePagamento(id).then((data) => {
        if(data.success){
          setListaPagamentos(listaPagamentos.filter((_, i) => i !== index));

          if(listaPagamentos.length === 0){
            setParcelas(0)
            setDataInicio("")
          }
        } else {
          alert(`Erro ao excluir a parcela!`)
        }
      })
    } else {
      setListaPagamentos(listaPagamentos.filter((_, i) => i !== index));

      if(listaPagamentos.length === 0){
        setParcelas(0)
        setDataInicio("")
      }
    }
  }

  const formatDateToYMD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // mês começa do zero
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const addMonths = (date: Date, months: number): Date  =>{
    const newDate = new Date(date); // cria cópia para não modificar o original
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
  }

  const AdicionarParcelasNota = () => {
    let i = 0;
    
    if(dataInicio === "" || parcelas === 0){
      alert("Data Início ou Parcelas não podem ficar vazio ou zerado!")
    } else {
      if(!editar){
        setListaPagamentos([])
      }

      let inicioDate = new Date(parseInt(dataInicio.split('-')[0]), parseInt(dataInicio.split('-')[1]) - 1, parseInt(dataInicio.split('-')[2]))

      for(i = 0; i < parcelas; i++){
        if(i === 0){
          let newPagamento:Pagamentos = {dataPagamento: formatDateToYMD(inicioDate), notaId: notaId, valorPago: 0, observacao: "", pago: false, changed: false}
          setListaPagamentos(prev => [...prev, newPagamento])
        } else {
          inicioDate = addMonths(inicioDate, 1)

          let newPagamento:Pagamentos = {dataPagamento: formatDateToYMD(inicioDate), notaId: notaId, valorPago: 0, observacao: "", pago: false, changed: false}
          setListaPagamentos(prev => [...prev, newPagamento])
        }
      }
    }
  }

  return (
    <div>
        <button className='botao-icone' onClick={() => setModalAberto(true)} type='button'>💵</button>
        {modalAberto ?
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
            }}>
                <div style={{
                  backgroundColor: 'rgba(58, 58, 58, 1)',
                  padding: '2px 20px 20px 20px',
                  borderRadius: '16px',
                  width: '100%',
                  maxWidth: '800px',
                  maxHeight: `500px`,
                  position: 'relative',
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                  color: `white`
                }}>

                  <div style={{width: `100%`, display: 'flex', justifyContent: `center`}}>
                    <h2>Pagamentos</h2>
                    <button onClick={(e) => {setModalAberto(false); onClose(false); e.stopPropagation()}} style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      fontSize: '18px',
                      cursor: 'pointer'
                    }}>
                    ❌
                    </button>
                      
                  </div>
                  {editar === false || listaPagamentos.length === 0 ?
                    <>
                      <div key={`Pagamentos Add`} style={{width: `100%`, display: `flex`, paddingTop: `2rem`, paddingBottom: `0.2rem`}}>
                        <div style={{width: `50%`, padding: `0px 3px 0px 3px`}}>
                          <label>Data Inicial</label>
                          <input className='default' type='date' placeholder='DD/MM/AAAA' disabled={editar} value={dataInicio} onChange={(e) => {setDataInicio(e.target.value)}} />
                        </div>
                        <div style={{width: `50%`, padding: `0px 3px 0px 3px`}}>
                          <label>Parcelas</label>
                          <input className='default' placeholder='0' disabled={editar} value={parcelas} onFocus={(e) => {e.currentTarget.select()}} onChange={(e) => {setParcelas(isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value))}}/>
                        </div>
                      </div>
                      <div key={`Botao Pagamentos`} style={{width: `100%`, display: `flex`, justifyContent: `center`, alignItems: `center`}}>
                        <button className='default' onClick={() => {AdicionarParcelasNota(); DividirValorEmParcelas(0, true, 0)}} type='button'>{listaPagamentos.length > 0 ? `Atualizar Parcelas`: `Adicionar Parcelas`}</button>
                      </div>
                    </>
                    :
                    <></>
                  }
                  
                  <div style={{color: 'white',overflowY: 'auto',
                scrollbarWidth: 'none'}}>
                    {
                      listaPagamentos.length > 0 ?
                        <>
                          <div style={{color: 'white', maxWidth: '100%', display: 'flex'}}>
                            <span style={{textAlign:`right`}}>Valor Do Pedido: R$ {formatarReaisSemSimboloString(valorRestante)}</span>
                          </div>
                          <br/>
                          <div style={{display: `flex`, width: `100%`, height: `2rem`}}>
                            <span style={{maxWidth: `5%`, fontWeight: `bolder`}}>#</span>
                            <span style={{maxWidth: `20%`, fontWeight: `bolder`}}>Data</span>
                            <span style={{maxWidth: `25%`, fontWeight: `bolder`}}>Valor Pagamento</span>
                            <span style={{maxWidth: `35%`, fontWeight: `bolder`}}>Observação</span>
                            <span style={{maxWidth: `15%`, fontWeight: `bolder`, paddingLeft: `0.7rem`}}>Pago?</span>
                          </div>
                          {listaPagamentos.map((pagamento, index) => (
                            <>
                              <div key={pagamento.id} style={{display: 'flex', width: `100%`, height: `3rem`, paddingTop: `1rem`}}>
                                <span style={{maxWidth: `5%`, paddingRight: `0.5rem`}}>{index + 1}</span>
                                <span style={{maxWidth: `20%`, paddingRight: `0.5rem` }}><input className='default' type='date' style={{backgroundColor: pagamento.pago ? `lightgreen` : `white`}} value={pagamento.dataPagamento} onChange={(e) => { setListaPagamentos(prev => prev.map((item, i) => i === index ? { ...item, dataPagamento: e.target.value } : item)) }} /></span>
                                <span style={{maxWidth: `25%`, paddingRight: `0.5rem`}}>
                                  {/* <input className='default' style={{textAlign: `right`, paddingRight: `0.3rem`, backgroundColor: pagamento.pago ? `lightgreen` : `white`}} value={formatarReaisSemSimboloFloat(pagamento.valorPago > 0 ? pagamento.valorPago : 0)} placeholder='0,00' step="0.01" onFocus={(e) => e.currentTarget.select()} onChange={(e) => { setListaPagamentos(prev => prev.map((item, i) => i === index ? { ...item, valorPago: parseFloat(e.target.value) } : item)) }} /> */}
                                  <input
                                    type="text"
                                    inputMode="numeric"
                                    className="default"
                                    style={{
                                      textAlign: 'right',
                                      paddingRight: '0.3rem',
                                      backgroundColor: pagamento.pago ? 'lightgreen' : 'white'
                                    }}
                                    value={(pagamento.valorPago ?? 0).toLocaleString('pt-BR', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                    onFocus={(e) => e.currentTarget.select()}
                                    onChange={(e) => {
                                      const onlyDigits = e.target.value.replace(/\D/g, ''); // remove não-dígitos
                                      const valorNumerico = parseFloat(onlyDigits) / 100; // transforma em centavos
                                      
                                      DividirValorEmParcelas(index, false, valorNumerico);
                                      setListaPagamentos(prev =>
                                        prev.map((item, i) =>
                                          i === index ? { ...item, valorPago: valorNumerico } : item
                                        )
                                      );
                                      
                                    }}
                                    placeholder="0,00"
                                  />
                                </span>
                                <span style={{maxWidth: `35%`, paddingRight: `0.5rem`}}><input className='default' type='text' style={{backgroundColor: pagamento.pago ? `lightgreen` : `white`}} value={pagamento.observacao} onChange={(e) => { setListaPagamentos(prev => prev.map((item, i) => i === index ? { ...item, observacao: e.target.value } : item)) }} /></span>
                                <span style={{maxWidth: `15%`, paddingRight: `0.5rem`, paddingTop: `0.7rem`}}>
                                  <div style={{display: `flex`, justifyContent: `center`, alignItems: `center`, gap: `0.2rem`}}>
                                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: `center`, gap: '8px', cursor: 'pointer' }}>
                                      {/* <span>{pagamento.pago ? 'Pago' : 'Não Pago'}</span> */}
                                      <div
                                        onClick={() => { setListaPagamentos(prev => prev.map((item, i) => i === index ? { ...item, pago: !item.pago } : item));
                                        }}
                                        style={{
                                          width: '40px',
                                          height: '20px',
                                          background: pagamento.pago ? '#4caf50' : '#ccc',
                                          borderRadius: '20px',
                                          position: 'relative',
                                          transition: 'background 0.3s'
                                        }}
                                      >
                                        <div
                                          style={{
                                            width: '18px',
                                            height: '18px',
                                            background: '#fff',
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: '1px',
                                            left: pagamento.pago ? '20px' : '1px',
                                            transition: 'left 0.3s'
                                          }}
                                        />
                                      </div>
                                      
                                    </label>
                                    {!pagamento.pago ?
                                      <div style={{cursor: `pointer`}} onClick={() => { ExcluirParcela(index, pagamento.id) }}>
                                          <button type='button' className='botao-icone'>🗑️</button>
                                      </div>
                                      : <></>
                                    }
                                  </div>
                                </span>
                              </div>
                            </>
                          ))}
                        </>
                      :
                      <></>
                    }
                  </div>
                  {listaPagamentos.length > 0 ?
                    <div style={{width: `100%`, display: `flex`, alignItems: `center`, justifyContent: `center`}}>
                      <button className="save" style={{width: `60%`}} type='button' onClick={(e) => {SalvarPagamentos(e)}}>Salvar Pagamentos</button>
                    </div>
                    : <></>
                  }
              </div>
            </div>
        :
        <></>
        }
    </div>
  );
}