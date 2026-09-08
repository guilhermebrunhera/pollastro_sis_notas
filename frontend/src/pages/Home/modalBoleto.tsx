import { useState } from 'react';

import { postBoleto } from '../../services/APIService';
import Toast from '../../components/Toasts/toasts';
import { lerCodigoImagem } from '../../components/utils/lerCodigoBarras';


type StatusBoleto = 'Em Aberto' | 'Pago';

interface NovoBoleto {
  nome_boleto: string;
  valor_boleto: string;
  data_vencimento: string;
  status: StatusBoleto;
  linha_digitavel?: string;
}

interface ModalBoletosProps {
  onClose: (success: boolean, toast: boolean) => void;
}

export default function ModalBoletos({ onClose }: ModalBoletosProps) {

  const [boleto, setBoleto] = useState<NovoBoleto>({
    nome_boleto: '',
    valor_boleto: '',
    data_vencimento: '',
    status: 'Em Aberto',
    linha_digitavel: ''
  });

  const [foto, setFoto] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'Sucesso' | 'Erro' | 'Alerta' | '' } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [valorBoletoCentavos, setValorBoletoCentavos] = useState(0);
  const [linhaDigitavel, setLinhaDigitavel] = useState('');


  const limparCampos = () => {
    setBoleto({
      nome_boleto: '',
      valor_boleto: '',
      data_vencimento: '',
      status: 'Em Aberto',
      linha_digitavel: ''
    });

    setValorBoletoCentavos(0);
    setFoto(null);
    setLinhaDigitavel('');
  };


  const fecharModal = () => {
    limparCampos();
    
    onClose(false, false);
  };

  const formatarCentavosParaBRL = (centavos: number) => {
  const reais = centavos / 100;

  return reais.toLocaleString('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

  const salvarBoleto = async () => {

    if (boleto.nome_boleto.trim() === '') {
      setToast({message: "Adicione um nome para o Boleto!", type: "Alerta"});
      return;
    }

    if (valorBoletoCentavos <= 0) {
        setToast({message: "Informe o valor do boleto!", type: "Alerta"});
        return;
    }

    if (boleto.data_vencimento === '') {
      setToast({message: "Informe a data de vencimento!", type: "Alerta"});
      return;
    }

    try {

      setSalvando(true);

      const formData = new FormData();

      formData.append('nome_boleto', boleto.nome_boleto);
      formData.append(
        'valor_boleto',
        (valorBoletoCentavos / 100).toFixed(2)
    );
      formData.append('data_vencimento', boleto.data_vencimento);
      formData.append('status', boleto.status);
      formData.append('linha_digitavel', boleto.linha_digitavel || linhaDigitavel);

      if (foto) {
        formData.append('foto', foto);
      } else{
        formData.append('foto', "");
      }

      const data = await postBoleto(formData);

      if (data.success) {

        setToast({message: "Boleto cadastrado com sucesso!", type: "Sucesso"})

        limparCampos();

        onClose(true, true);

      } else {

        setToast({message: "Erro ao cadastrar boleto!", type: "Erro"});

      }

    } catch (error) {


      setToast({message: "Erro ao cadastrar boleto!", type: "Erro"});

    } finally {

      setSalvando(false);

    }

  };

  const handleArquivoBoleto = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const arquivo = e.target.files?.[0];

    if (!arquivo) {
      setFoto(null);
      setLinhaDigitavel('');
      return;
    }

    setFoto(arquivo);

    if (arquivo.type.startsWith('image/')) {
      const codigoEncontrado = await lerCodigoImagem(arquivo);

      if (codigoEncontrado) {
        setLinhaDigitavel(codigoEncontrado);
      } else {
        setToast({
          message: 'Não foi possível identificar o código de barras.',
          type: 'Alerta'
        });
      }
    }
  };

  return (

    /* FUNDO DO MODAL */
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        backgroundColor: 'rgba(0, 0, 0, 0.5)',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        zIndex: 9999
      }}
    >

      {/* MODAL */}
      <div
        style={{
          backgroundColor: '#949494',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '10px',

          borderRadius: '10px',

          width: '100%',
          maxWidth: '600px',

          position: 'relative',

          boxShadow: '0 0 10px rgba(0,0,0,0.2)',

          color: 'black'
        }}
      >

        {/* CABEÇALHO */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >

          <h2>Novo Boleto</h2>

          <button
            type="button"
            onClick={fecharModal}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',

              background: 'none',
              border: 'none',

              fontSize: '18px',

              cursor: 'pointer'
            }}
          >
            ❌
          </button>

        </div>


        {/* FORMULÁRIO */}
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            marginTop: '1rem'
          }}
        >

          {/* NOME */}
          <div>

            <label>Nome do Boleto</label>

            <input
              className="default"
              type="text"

              placeholder="Nome do boleto"

              value={boleto.nome_boleto}

              onChange={(e) =>
                setBoleto(prev => ({
                  ...prev,
                  nome_boleto: e.target.value
                }))
              }
            />

          </div>


          {/* VALOR */}
          <div>

            <label>Valor</label>

            <input
                className="default"
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={formatarCentavosParaBRL(valorBoletoCentavos)}
                onFocus={(e) => e.currentTarget.select()}
                onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, '');

                    // Limita a quantidade de dígitos
                    const valorLimpo = apenasNumeros.slice(0, 9);

                    const novoValor = parseInt(valorLimpo || '0', 10);

                    setValorBoletoCentavos(novoValor);
                }}
                />

          </div>


          {/* DATA VENCIMENTO */}
          <div>

            <label>Data de Vencimento</label>

            <input
              className="default"
              type="date"

              value={boleto.data_vencimento}

              onChange={(e) =>
                setBoleto(prev => ({
                  ...prev,
                  data_vencimento: e.target.value
                }))
              }
            />

          </div>


          {/* STATUS */}
          <div>

            <label>Status</label>

            <select
              className="default"

              value={boleto.status}

              onChange={(e) =>
                setBoleto(prev => ({
                  ...prev,
                  status: e.target.value as StatusBoleto
                }))
              }
            >

              <option value="Em Aberto">
                Em Aberto
              </option>

              <option value="Pago">
                Pago
              </option>

            </select>

          </div>


          {/* FOTO */}
          <div>

            <label>Foto do Boleto</label>

            <input
              className="default"
              type="file"

              accept="image/*,.pdf"
              onChange={handleArquivoBoleto}
            />

          </div>

          <div>
            <label>Linha digitável</label>

            <input
              className="default"
              type="text"
              value={linhaDigitavel}
              placeholder="Linha digitável do boleto"
              onChange={(e) =>
                setLinhaDigitavel(e.target.value.replace(/\D/g, ''))
              }
            />
          </div>

          {/* SALVAR */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '1rem'
            }}
          >

            <button
              className="save"
              type="button"

              disabled={salvando}

              style={{
                width: '60%'
              }}

              onClick={salvarBoleto}
            >

              {
                salvando
                  ? 'Salvando...'
                  : 'Adicionar Boleto'
              }

            </button>

          </div>

        </div>

      </div>
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