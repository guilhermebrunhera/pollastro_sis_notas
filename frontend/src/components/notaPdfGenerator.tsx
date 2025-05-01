import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatarReaisSemSimboloString } from "./utils/utils"
import backgroundImage from '../assets/BLOCO_PEDIDO_POLLASTRO_CUT_NEW.png'; // use a imagem limpa sem escrita
import { saveAs } from 'file-saver';

interface Produto {
  nome: string;
  quantidade: number;
  preco_unitario: string;
  preco_total: string;
}

interface NotaData {
  numero: string;
  data: string;
  nome?: string;
  cidade: string;
  telefone: string;
  email: string;
  endereco: string;
  observacao: string;
  desconto: number;
  desconto_obs: string;
  download: boolean,
  produtos: Produto[];
}



export async function gerarNotaPDF(nota: NotaData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 horizontal
  
    const bgImageBytes = await fetch(backgroundImage).then(res => res.arrayBuffer());
    const bgImage = await pdfDoc.embedPng(bgImageBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
  
    const scale = 0.7; // escala de redução
    const imageWidth = 595 * scale;
    const imageHeight = 842 * scale;
  
    const drawNota = (offsetX: number) => {
      // Fundo
      page.drawImage(bgImage, {
        x: offsetX,
        y: 0,
        width: imageWidth,
        height: imageHeight,
      });
  
      const drawText = (text: string, x: number, y: number, size = 13) => {
        page.drawText(text, {
          x: offsetX + x * scale,
          y: y * scale,
          size: size * scale,
          font,
          color: rgb(0, 0, 0),
        });
      };

      const drawTextRight = (text: string, x: number, y: number, valorWidth: number, bold = false) => {
        page.drawText(text, {
          x: offsetX + (x * scale) - valorWidth,
          y: y * scale,
          size: 13 * scale,
          font: bold ? fontBold : font,
          color: rgb(0, 0, 0),
        });
      };

      const drawTextBold = (text: string, x: number, y: number, size = 13) => {
        page.drawText(text, {
          x: offsetX + x * scale,
          y: y * scale,
          size: size * scale,
          font: fontBold,
          color: rgb(0, 0, 0),
        });
      };
  
      // Cabeçalho
      drawText(nota.data.split("/")[0], 78, 649, 12);
      drawText(nota.data.split("/")[1], 103, 649, 12);
      drawText(nota.data.split("/")[2], 127, 649, 12);
      drawText(nota.telefone, 220, 651, 12);
      drawText(nota.email, 376, 651, 12);
      drawText(String(nota.nome), 85, 621);
      drawText(nota.cidade, 92, 592);

      switch(nota.numero.length){
        case 1: 
          drawText(": 000" + nota.numero + " - Sistema", 330, 686, 20); break;
        case 2: 
          drawText(": 00" + nota.numero + " - Sistema", 330, 686, 20);break;
        case 3: 
          drawText(": 0" + nota.numero + " - Sistema", 330, 686, 20);break;
        case 4: 
          drawText(": " + nota.numero + " - Sistema", 330, 686, 20);break;
        default:
          
      }

      // drawText(": " + nota.numero + " - Sistema", 330, 686, 20);
  
      // Produtos
      let y = 526;
      let total = 0;
      nota.produtos.forEach((item) => {


        const precoUnit = formatarReaisSemSimboloString(item.preco_unitario);
        const precoTotal = formatarReaisSemSimboloString(item.preco_total);
        const precoUnitWidth = font.widthOfTextAtSize(precoUnit, 13 * scale);
        const precoTotalWidth = font.widthOfTextAtSize(precoTotal, 13 * scale);


        drawText(item.quantidade.toString(), 70, y);
        drawText(item.nome, 82, y);
        drawTextRight(formatarReaisSemSimboloString(item.preco_unitario), 482, y, precoUnitWidth);
        drawTextRight(formatarReaisSemSimboloString(item.preco_total), 554, y, precoTotalWidth);
        

        y -= 18;
        total += parseFloat(item.preco_total);
      });
  
      

      if(nota.observacao.length > 0 && nota.observacao !== undefined && nota.observacao !== null){
        drawText('OBS: ' + nota.observacao, 82, 106, 10)
      }

      if(nota.desconto > 0){
        drawText('Desconto: ' + nota.desconto_obs, 82, 92, 10)

        const precoSubTotalWidht = font.widthOfTextAtSize(formatarReaisSemSimboloString(String(total.toFixed(2))), 13 * scale);
        drawTextRight(formatarReaisSemSimboloString(String(total.toFixed(2))), 554, 108, precoSubTotalWidht);
        drawTextBold("SUBTOTAL", 417, 106, 12)

        const precoDescontoWidht = font.widthOfTextAtSize(formatarReaisSemSimboloString(String(nota.desconto)), 13 * scale);
        drawTextRight("- " + formatarReaisSemSimboloString(String((nota.desconto))), 546, 90, precoDescontoWidht);
        drawTextBold("DESCONTO", 415, 88, 12)

        // Total
        const precoTotalWidht = font.widthOfTextAtSize(formatarReaisSemSimboloString(String((total - nota.desconto).toFixed(2))), 13 * scale);
        drawTextRight(formatarReaisSemSimboloString(String((total - nota.desconto).toFixed(2))), 554, 72, precoTotalWidht, true);
        drawTextBold("TOTAL", 441, 72, 12)
      } else {
        // Total
        const precoTotalWidht = font.widthOfTextAtSize(formatarReaisSemSimboloString(String(total.toFixed(2))), 13 * scale);
        drawTextRight(formatarReaisSemSimboloString(String(total.toFixed(2))), 554, 72, precoTotalWidht, true);
        drawTextBold("TOTAL", 441, 72, 12)
      }
    };
  
    // Duas cópias lado a lado com espaço proporcional
    drawNota(15); // primeira (esquerda)
    drawNota(428); // segunda (direita), considerando 595*0.7 + um espaçamento de ~10px
  
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    if(nota.download){
      saveAs(blob, `Nota de Serviço - ${nota.nome} ${nota.data}.pdf`)
    } else {
      window.open(pdfUrl, '_blank');
    }
    
  }