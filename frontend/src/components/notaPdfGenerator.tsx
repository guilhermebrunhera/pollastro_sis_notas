import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { formatarReaisSemSimboloString } from "./utils/utils"
import backgroundImage from '../assets/BLOCO_PEDIDO_POLLASTRO_CUT_NEW.png';
import backgroundImagePaga from '../assets/BLOCO_PEDIDO_POLLASTRO_CUT_NEW_PAGO.png';
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
  cep: string;
  contato: string;
  tel_contato: string;
  nota_status: string;
}



export async function gerarNotaPDF(nota: NotaData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 horizontal

    let bgImageBytes = null;
    let bgImage = null;

    if(nota.nota_status === "Paga"){
      bgImageBytes = await fetch(backgroundImagePaga).then(res => res.arrayBuffer());
      bgImage = await pdfDoc.embedPng(bgImageBytes);
    }else{
      bgImageBytes = await fetch(backgroundImage).then(res => res.arrayBuffer());
      bgImage = await pdfDoc.embedPng(bgImageBytes);
    }
    
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
      drawText(nota.data.split("/")[0], 78, 652, 12);
      drawText(nota.data.split("/")[1], 103, 652, 12);
      drawText(nota.data.split("/")[2], 127, 652, 12);
      drawText(nota.telefone, 220, 652, 12);
      drawText(nota.email, 376, 651, 12);
      drawText(String(nota.nome), 85, 622, 10);

      if(nota.contato !== "" || nota.tel_contato !== ""){
        drawText(String(nota.contato) + " - " + String(nota.tel_contato), 368, 623, 10);
      }
      
      drawText(nota.cidade, 92, 593);

      if(nota.endereco !== ""){
        drawText(nota.endereco, 113, 570);
      }

      if(nota.cep !== ""){
        drawText(nota.cep, 351, 594);
      }

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
      let y = 527;
      let total = 0;
      nota.produtos.forEach((item) => {


        const precoUnit = formatarReaisSemSimboloString(item.preco_unitario);
        const precoTotal = formatarReaisSemSimboloString(item.preco_total);
        const precoUnitWidth = font.widthOfTextAtSize(precoUnit, 13 * scale);
        const precoTotalWidth = font.widthOfTextAtSize(precoTotal, 13 * scale);
        const qtdWidth = font.widthOfTextAtSize(item.quantidade.toString(), 13 * scale);


        drawTextRight(item.quantidade.toString(), 78, y, qtdWidth);
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
        if(nota.desconto_obs !== "" && nota.desconto_obs !== null && nota.desconto_obs !== undefined){
          drawText('Desconto: ' + nota.desconto_obs, 82, 92, 10)
        }
        

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
  
    if(nota.download){
      drawNota(15);
    } else {
      // Duas cópias lado a lado com espaço proporcional
      drawNota(15); // primeira (esquerda)
      drawNota(428); // segunda (direita), considerando 595*0.7 + um espaçamento de ~10px
    }
  
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    if(nota.download){
      saveAs(blob, `Nota de Serviço - ${nota.nome} ${nota.data}.pdf`)
    } else {
      window.open(pdfUrl, '_blank');
    }
    
  }