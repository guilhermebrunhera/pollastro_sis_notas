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
  produtos: Produto[];
}



export async function gerarNotaPDF(nota: NotaData) {
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
  
      const drawText = (text: string, x: number, y: number, size = 13) => {
        page.drawText(text, {
          x: offsetX + x * scale,
          y: y * scale,
          size: size * scale,
          font,
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
      drawText(":" + nota.numero + " - Sistema", 330, 686, 20);
  
      // Produtos
      let y = 526;
      let total = 0;
      nota.produtos.forEach((item) => {
        drawText(item.quantidade.toString(), 70, y);
        drawText(item.nome, 82, y);
        drawText(formatarReaisSemSimboloString(item.preco_unitario), 450, y);
        drawText(formatarReaisSemSimboloString(item.preco_total), 514, y);
        y -= 18;
        total += parseFloat(item.preco_total);
      });
  
      // Total
      drawText(formatarReaisSemSimboloString(String(total.toFixed(2))), 514, 72);
    };
  
    // Duas cópias lado a lado com espaço proporcional
    drawNota(15); // primeira (esquerda)
    drawNota(428); // segunda (direita), considerando 595*0.7 + um espaçamento de ~10px
  
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfUrl = URL.createObjectURL(blob);
    window.confirm("Deseja baixar este arquivo no seu computador? \n\nClique em 'Cancelar' para somente abrir o arquivo.")
      ? saveAs(blob, `Nota de Serviço - ${nota.nome} ${nota.data}.pdf`)
      : null;
    window.open(pdfUrl, '_blank');
  }