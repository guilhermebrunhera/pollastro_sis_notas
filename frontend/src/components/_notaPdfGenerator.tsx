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
  const page = pdfDoc.addPage([595, 842]); // tamanho A4 em pontos

  const bgImageBytes = await fetch(backgroundImage).then(res => res.arrayBuffer());
  const bgImage = await pdfDoc.embedPng(bgImageBytes);
  page.drawImage(bgImage, {
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
  });

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text: string, x: number, y: number, size = 13) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Cabeçalho
    drawText(nota.data.split("/")[0], 78, 649, 12);               // Data no canto superior direito
    drawText(nota.data.split("/")[1], 103, 649, 12);               // Data no canto superior direito
    drawText(nota.data.split("/")[2], 127, 649, 12);               // Data no canto superior direito
    drawText(nota.telefone, 220, 651, 12);           // Telefone no centro superior
    drawText(nota.email, 376, 651, 12);              // Email mais à direita

    drawText(String(nota.nome), 85, 621);                // Nome
    drawText(nota.cidade, 92, 592);             // Cidade
    drawText(":" + nota.numero + " - Sistema", 330, 686, 20);         // Número da nota no canto superior direito

  // Produtos
  let y = 526;
  let total = 0;
nota.produtos.forEach((item) => {
  drawText(item.quantidade.toString(), 70, y);                            // Quantidade
  drawText(item.nome, 82, y);                                           // Descrição
  drawText(formatarReaisSemSimboloString(item.preco_unitario), 450, y);                      // Preço Unit.
  drawText(formatarReaisSemSimboloString(item.preco_total), 514, y); // Valor
  y -= 18;
  total += parseFloat(item.preco_total)
});

  // Total
    drawText(formatarReaisSemSimboloString(String(total.toFixed(2))), 514, 72);

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(blob);
  window.confirm("Deseja baixar este arquivo no seu computador? \n\nClique em 'Cancelar' para somente abrir o arquivo.") ? saveAs(blob, "Nota de Serviço - " + nota.nome + " " + nota.data + ".pdf") : null;
  window.open(pdfUrl, '_blank');
}