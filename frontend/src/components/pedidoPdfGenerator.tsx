import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import backgroundImage from '../assets/BLOCO_PRODUCAO_POLLASTRO.png';

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
  produtos: Produto[];
}



export async function gerarPedidoPDF(nota: NotaData) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 horizontal
  
    const bgImageBytes = await fetch(backgroundImage).then(res => res.arrayBuffer());
    const bgImage = await pdfDoc.embedPng(bgImageBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
  
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
  
      const drawText = (text: string, x: number, y: number, size = 15) => {
        page.drawText(text, {
          x: offsetX + x * scale,
          y: y * scale,
          size: size * scale,
          font,
          color: rgb(0, 0, 0),
        });
      };

      const drawTextRight = (text: string, x: number, y: number, valorWidth: number) => {
        page.drawText(text, {
          x: offsetX + (x * scale) - valorWidth,
          y: y * scale,
          size: 15 * scale,
          font: font,
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
  
      // Produtos
      let y = 526;
      nota.produtos.forEach((item) => {

        const widthQtd = font.widthOfTextAtSize(item.quantidade.toString(), 15 * scale);
        drawTextRight(item.quantidade.toString(), 78, y, widthQtd);
        drawText(item.nome, 82, y);
        
        y -= 18;
      });
  
      if(nota.observacao.length > 0 && nota.observacao !== undefined && nota.observacao !== null){
        drawText('OBS: ' + nota.observacao, 82, 106, 10)
      }
    };
  
    // Duas cópias lado a lado com espaço proporcional
    drawNota(15); // primeira (esquerda)
    drawNota(428); // segunda (direita), considerando 595*0.7 + um espaçamento de ~10px
  
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    window.open(pdfUrl, '_blank');
  }