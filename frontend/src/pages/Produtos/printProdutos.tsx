import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { formatarReaisSemSimboloString } from '../../components/utils/utils';

interface Produto {
  id?: number;
  nome: string;
  descricao: string;
  preco: string;
  tipo: string;
}

export async function printProdutos(produtos: Produto[]) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const margemTopo = 50;
  const margemEsquerda = 50;
  const larguraPagina = 595 - 2 * margemEsquerda;
  const alturaPagina = 842 - 2 * margemTopo;

  const linhas = produtos.length;
  // Agora força a fonte a diminuir sempre que ultrapassar a altura disponível
  let tamanhoFonte = Math.min(8, (alturaPagina - 50) / (linhas + 2));
  let alturaLinha = tamanhoFonte + 4;

  let y = 842 - margemTopo;

  // Cabeçalho
  page.drawText('Nº', {
    x: margemEsquerda,
    y: y,
    size: tamanhoFonte,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText('Produto', {
    x: margemEsquerda + 40,
    y: y,
    size: tamanhoFonte,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText('Preço', {
    x: margemEsquerda + larguraPagina - 60,
    y: y,
    size: tamanhoFonte,
    font,
    color: rgb(0, 0, 0),
  });

  y -= alturaLinha;

  // Linha cabeçalho
  page.drawLine({
    start: { x: margemEsquerda, y },
    end: { x: margemEsquerda + larguraPagina, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  produtos.forEach((p, index) => {
    y -= alturaLinha;

    // Numero
    page.drawText(`${index + 1}`, {
      x: margemEsquerda,
      y,
      size: tamanhoFonte,
      font,
      color: rgb(0, 0, 0),
    });

    // Produto (nome + descrição)
    page.drawText(`${p.nome} - ${p.descricao}`, {
      x: margemEsquerda + 40,
      y,
      size: tamanhoFonte,
      font,
      color: rgb(0, 0, 0),
    });

    // Preço alinhado
    page.drawText(formatarReaisSemSimboloString(p.preco), {
      x: margemEsquerda + larguraPagina - 60,
      y,
      size: tamanhoFonte,
      font,
      color: rgb(0, 0, 0),
    });

    // Linha horizontal separando
    page.drawLine({
      start: { x: margemEsquerda, y: y - 2 },
      end: { x: margemEsquerda + larguraPagina, y: y - 2 },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.7),
    });
  });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, 'lista_produtos.pdf');
}