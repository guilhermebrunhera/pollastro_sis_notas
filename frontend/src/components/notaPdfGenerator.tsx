import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

function formatarReaisSemSimbolo(valor: string): string {
    return parseFloat(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
  const drawText = (text: string, x: number, y: number, size = 15) => {
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  };

  // Cabeçalho
    drawText(nota.data.split("/")[0], 53, 669, 20);               // Data no canto superior direito
    drawText(nota.data.split("/")[1], 80, 669, 20);               // Data no canto superior direito
    drawText(nota.data.split("/")[2], 107, 669, 20);               // Data no canto superior direito
    drawText(nota.telefone, 215, 669);           // Telefone no centro superior
    drawText(nota.email, 390, 669, 12);              // Email mais à direita

    drawText(String(nota.nome), 65, 640);                // Nome
    drawText(nota.cidade, 72, 610);             // Cidade
    drawText(":" + nota.numero + " - Sistema", 330, 708, 20);         // Número da nota no canto superior direito

  // Produtos
  let y = 537;
  let total = 0;
nota.produtos.forEach((item) => {
  drawText(item.quantidade.toString(), 8, y);                            // Quantidade
  drawText(item.nome, 60, y);                                           // Descrição
  drawText(formatarReaisSemSimbolo(item.preco_unitario), 422, y);                      // Preço Unit.
  drawText(formatarReaisSemSimbolo(item.preco_total), 510, y); // Valor
  y -= 18;
  total += parseFloat(item.preco_total)
});

  // Total
    drawText(formatarReaisSemSimbolo(String(total.toFixed(2))), 510, 60, 15);

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const pdfUrl = URL.createObjectURL(blob);
  window.confirm("Deseja baixar este arquivo no seu computador?") ? saveAs(blob, "Nota de Serviço - " + nota.nome + " " + nota.data + ".pdf") : null;
  window.open(pdfUrl, '_blank');
}