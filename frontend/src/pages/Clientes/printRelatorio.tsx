import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { saveAs } from 'file-saver';
import { formatarReaisSemSimboloFloat, formatarReaisSemSimboloString } from '../../components/utils/utils';
import imagemRelatorio from "../../assets/BLOCO_RELATORIO_PEDIDOS.png"
import { format } from 'date-fns';

interface Pedidos {
    data: string,
    numeroPedido: number;
    valor: string;
    status: string;
    valorPago: number;
}

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
  tel_contato: string
}

export async function printRelatorio(cliente: Cliente, pedidos: Pedidos[], dataInicio: string, dataFim: string) {

    dataInicio = dataInicio.split('-')[2] + "/" + dataInicio.split('-')[1] + "/" + dataInicio.split('-')[0]
    dataFim = dataFim.split('-')[2] + "/" + dataFim.split('-')[1] + "/" + dataFim.split('-')[0]

    let DataHoraAtual = format(new Date(), "dd/MM/yyyy HH:mm")

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bgImageBytes = await fetch(imagemRelatorio).then(res => res.arrayBuffer());
    const bgImage = await pdfDoc.embedPng(bgImageBytes);

    page.drawImage(bgImage,{
        x: 0,
        y: 0,
        width: 595,
        height: 842,
      })

    const drawText = (text: string, x: number, y: number, size = 10) => {
        page.drawText(text, {
            x: x,
            y: y ,
            size: size ,
            font,
            color: rgb(0, 0, 0),
        });
    };

    const drawTextRight = (text: string, x: number, y: number, valorWidth: number, size = 10) => {
        page.drawText(text, {
          x: x - valorWidth,
          y: y,
          size: size,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
    };


    drawText("Gerado: Dia " + DataHoraAtual + " Horas", 34, 690, 8)
    drawText("Relatório de Pedidos - " + dataInicio + " até " + dataFim, 374, 690, 8)
    drawText(cliente.nome ?? "", 83, 656)
    drawText(cliente.cidade ?? "", 396, 656)

    let SomaValorNota = 0;
    let SomaValorPago = 0;
    let SomaValorNotaSemDesc = 0;
    let yNota = 594;

    const drawNotas = async () => {
        if ( pedidos.length > 0){
        
            pedidos.map(pedido => {
                drawText(format(new Date(pedido.data) ?? 0, 'dd/MM/yyyy'), 34, yNota, 9)
                drawText("Nº " + pedido.numeroPedido.toString() + " - " + pedido.status, 98, yNota, 9)

                let widthValor = font.widthOfTextAtSize(formatarReaisSemSimboloString(pedido.valor?? `0`), 10);
                drawTextRight(formatarReaisSemSimboloString(pedido.valor?? `0`), 332, yNota, widthValor)

                if(pedido.status === "Paga"){
                    let widthValor = font.widthOfTextAtSize(formatarReaisSemSimboloString(pedido.valor?? `0`), 10);
                    drawTextRight(formatarReaisSemSimboloString(pedido.valor?? `0`), 454, yNota, widthValor)  
                }else{
                    let widthValorPago = font.widthOfTextAtSize(formatarReaisSemSimboloString(pedido.valorPago.toString()), 10);
                    drawTextRight(formatarReaisSemSimboloString(pedido.valorPago.toString()), 454, yNota, widthValorPago)  
                }
                

                let valorRestante = "0,00";

                if(pedido.status !== "Paga"){
                    valorRestante = (parseFloat(pedido.valor?? `0`) - pedido.valorPago).toFixed(2).replace('.', ',')
                }

                let widthValorRestante = font.widthOfTextAtSize(formatarReaisSemSimboloString(valorRestante), 10);
                drawTextRight(formatarReaisSemSimboloString(valorRestante), 554, yNota, widthValorRestante)

                yNota -= 14

                if(pedido.status === "Paga"){
                    SomaValorNota += 0
                    SomaValorPago += parseFloat(pedido.valor?? `0`)
                }else{
                    SomaValorNota += parseFloat(pedido.valor?? `0`) - pedido.valorPago
                    SomaValorPago += parseFloat(pedido.valorPago.toString())
                }
                SomaValorNotaSemDesc += parseFloat(pedido.valor?? `0`)
            })
        } 
    }

    await drawNotas().then(() => {

        let widthSomaValorTotal = font.widthOfTextAtSize("TOTAL: " + formatarReaisSemSimboloFloat(SomaValorNota), 10);
        drawTextRight("TOTAL: " + formatarReaisSemSimboloFloat(SomaValorNota), 550, yNota, widthSomaValorTotal)

        let widthSomaValorPago = font.widthOfTextAtSize("V. PAGO: " + formatarReaisSemSimboloFloat(SomaValorPago), 10);
        drawTextRight("V. PAGO: " + formatarReaisSemSimboloFloat(SomaValorPago), 450, yNota, widthSomaValorPago)

        let widthSomaValorTotalSemDesc = font.widthOfTextAtSize("S. TOTAL: " + formatarReaisSemSimboloFloat(SomaValorNotaSemDesc), 10);
        drawTextRight("S. TOTAL: " + formatarReaisSemSimboloFloat(SomaValorNotaSemDesc), 340, yNota, widthSomaValorTotalSemDesc + 14)
    })

  

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    window.open(pdfUrl, `_blank`)
}