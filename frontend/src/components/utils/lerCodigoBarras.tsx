import { BrowserMultiFormatReader } from '@zxing/browser';

import {
  BarcodeFormat,
  DecodeHintType
} from '@zxing/library';

import { createWorker } from 'tesseract.js';

import * as pdfjsLib from 'pdfjs-dist';

import pdfWorkerUrl from
  'pdfjs-dist/build/pdf.worker.min.mjs?url';

/*
 * Configura o Web Worker usado pelo PDF.js.
 */
pdfjsLib.GlobalWorkerOptions.workerSrc =
  pdfWorkerUrl;


/* =========================================================
   FUNÇÕES DE FORMATAÇÃO E LOCALIZAÇÃO
========================================================= */

function somenteNumeros(valor: string): string {
  return valor.replace(/\D/g, '');
}

function extrairCodigoDoTexto(
  texto: string
): string | null {
  /*
   * Procura sequências com 44 a 48 números,
   * permitindo pontos, hífens e espaços.
   */
  const candidatos =
    texto.match(/(?:\d[\s.\-]*){44,48}/g) ?? [];

  const codigos = candidatos
    .map(somenteNumeros)
    .filter(codigo =>
      codigo.length === 44 ||
      codigo.length === 47 ||
      codigo.length === 48
    );

  /*
   * Prioriza uma linha digitável já completa.
   */
  const linha48 = codigos.find(
    codigo => codigo.length === 48
  );

  if (linha48) {
    return linha48;
  }

  const linha47 = codigos.find(
    codigo => codigo.length === 47
  );

  if (linha47) {
    return linha47;
  }

  const codigo44 = codigos.find(
    codigo => codigo.length === 44
  );

  return codigo44 ?? null;
}


/* =========================================================
   CONVERSÃO DO CÓDIGO BANCÁRIO DE 44 PARA 47 DÍGITOS
========================================================= */

function calcularModulo10(codigo: string): number {
  let soma = 0;
  let multiplicador = 2;

  for (let i = codigo.length - 1; i >= 0; i--) {
    let resultado =
      Number(codigo[i]) * multiplicador;

    if (resultado > 9) {
      resultado =
        Math.floor(resultado / 10) +
        (resultado % 10);
    }

    soma += resultado;

    multiplicador =
      multiplicador === 2 ? 1 : 2;
  }

  return (10 - (soma % 10)) % 10;
}

function converterCodigo44ParaLinha47(
  codigo: string
): string {
  if (codigo.length !== 44) {
    return codigo;
  }

  /*
   * Códigos iniciados por 8 geralmente são contas
   * de arrecadação/concessionárias. Eles possuem
   * outra regra e não devem usar esta conversão.
   */
  if (codigo.startsWith('8')) {
    return codigo;
  }

  const campo1Base =
    codigo.slice(0, 4) +
    codigo.slice(19, 24);

  const campo2Base =
    codigo.slice(24, 34);

  const campo3Base =
    codigo.slice(34, 44);

  const campo1 =
    campo1Base +
    calcularModulo10(campo1Base);

  const campo2 =
    campo2Base +
    calcularModulo10(campo2Base);

  const campo3 =
    campo3Base +
    calcularModulo10(campo3Base);

  const digitoGeral =
    codigo.slice(4, 5);

  const fatorEValor =
    codigo.slice(5, 19);

  return (
    campo1 +
    campo2 +
    campo3 +
    digitoGeral +
    fatorEValor
  );
}

function prepararCodigoEncontrado(
  codigoEncontrado: string
): string | null {
  const codigo =
    somenteNumeros(codigoEncontrado);

  if (
    codigo.length === 47 ||
    codigo.length === 48
  ) {
    return codigo;
  }

  if (codigo.length === 44) {
    return converterCodigo44ParaLinha47(codigo);
  }

  return null;
}


/* =========================================================
   CONFIGURAÇÃO DO ZXING
========================================================= */

function criarLeitorCodigoBarras() {
  const hints = new Map<
    DecodeHintType,
    BarcodeFormat[] | boolean
  >();

  hints.set(
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.ITF,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODABAR
    ]
  );

  hints.set(
    DecodeHintType.TRY_HARDER,
    true
  );

  return new BrowserMultiFormatReader(hints);
}


/* =========================================================
   OCR COM TESSERACT
========================================================= */

async function lerLinhaDigitavelOCR(
  origem: File | HTMLCanvasElement
): Promise<string | null> {
  const worker = await createWorker('eng');

  try {
    /*
     * Limita o reconhecimento aos caracteres que podem
     * fazer parte da linha digitável.
     */
    await worker.setParameters({
      tessedit_char_whitelist:
        '0123456789.- ',

      preserve_interword_spaces: '1',

      user_defined_dpi: '300'
    });

    const resultado =
      await worker.recognize(origem);

    const codigoEncontrado =
      extrairCodigoDoTexto(
        resultado.data.text
      );

    if (!codigoEncontrado) {
      return null;
    }

    return prepararCodigoEncontrado(
      codigoEncontrado
    );
  } catch (error) {
    console.warn(
      'OCR não encontrou a linha digitável:',
      error
    );

    return null;
  } finally {
    await worker.terminate();
  }
}


/* =========================================================
   LEITURA DO CÓDIGO EM UM CANVAS
========================================================= */

async function lerCodigoCanvas(
  canvas: HTMLCanvasElement
): Promise<string | null> {
  const leitor = criarLeitorCodigoBarras();

  const imagemUrl =
    canvas.toDataURL('image/png');

  try {
    const resultado =
      await leitor.decodeFromImageUrl(imagemUrl);

    return prepararCodigoEncontrado(
      resultado.getText()
    );
  } catch {
    return null;
  }
}


/* =========================================================
   RECORTE DA PARTE INFERIOR

   Em boletos, o código de barras normalmente fica
   na região inferior. O recorte ajuda o ZXing porque
   elimina textos e outros elementos da página.
========================================================= */

function criarRecorteInferior(
  canvasOriginal: HTMLCanvasElement
): HTMLCanvasElement | null {
  const alturaRecorte =
    Math.floor(canvasOriginal.height * 0.55);

  const inicioRecorte =
    canvasOriginal.height - alturaRecorte;

  const canvasRecorte =
    document.createElement('canvas');

  canvasRecorte.width =
    canvasOriginal.width;

  canvasRecorte.height =
    alturaRecorte;

  const contexto =
    canvasRecorte.getContext('2d');

  if (!contexto) {
    return null;
  }

  /*
   * Aumenta contraste e remove cores, facilitando
   * a leitura das barras.
   */
  contexto.filter =
    'grayscale(100%) contrast(180%)';

  contexto.drawImage(
    canvasOriginal,

    0,
    inicioRecorte,
    canvasOriginal.width,
    alturaRecorte,

    0,
    0,
    canvasRecorte.width,
    canvasRecorte.height
  );

  return canvasRecorte;
}


/* =========================================================
   LEITURA DE IMAGEM
========================================================= */

export async function lerCodigoImagem(
  arquivo: File
): Promise<string | null> {
  const leitor = criarLeitorCodigoBarras();

  const imagemUrl =
    URL.createObjectURL(arquivo);

  try {
    /*
     * Primeira tentativa: código de barras diretamente
     * na imagem original.
     */
    const resultado =
      await leitor.decodeFromImageUrl(imagemUrl);

    const codigo =
      prepararCodigoEncontrado(
        resultado.getText()
      );

    if (codigo) {
      return codigo;
    }
  } catch {
    /*
     * NotFoundException é normal quando o ZXing
     * não consegue identificar o código.
     */
  } finally {
    URL.revokeObjectURL(imagemUrl);
  }

  /*
   * Segunda tentativa: OCR da linha digitável impressa.
   */
  return lerLinhaDigitavelOCR(arquivo);
}


/* =========================================================
   EXTRAÇÃO DE TEXTO DO PDF
========================================================= */

async function extrairCodigoTextoPdf(
  documento: pdfjsLib.PDFDocumentProxy
): Promise<string | null> {
  const limitePaginas =
    Math.min(documento.numPages, 3);

  for (
    let numeroPagina = 1;
    numeroPagina <= limitePaginas;
    numeroPagina++
  ) {
    const pagina =
      await documento.getPage(numeroPagina);

    const conteudo =
      await pagina.getTextContent();

    const texto = conteudo.items
      .map(item => {
        if ('str' in item) {
          return item.str;
        }

        return '';
      })
      .join(' ');

    const codigo =
      extrairCodigoDoTexto(texto);

    if (codigo) {
      return prepararCodigoEncontrado(codigo);
    }
  }

  return null;
}


/* =========================================================
   RENDERIZAÇÃO DE UMA PÁGINA DO PDF
========================================================= */

async function renderizarPaginaPdf(
  pagina: pdfjsLib.PDFPageProxy
): Promise<HTMLCanvasElement | null> {
  const viewport =
    pagina.getViewport({
      scale: 3
    });

  const canvas =
    document.createElement('canvas');

  const contexto =
    canvas.getContext('2d');

  if (!contexto) {
    return null;
  }

  canvas.width =
    Math.ceil(viewport.width);

  canvas.height =
    Math.ceil(viewport.height);

  await pagina.render({
    canvas,
    canvasContext: contexto,
    viewport
  }).promise;

  return canvas;
}


/* =========================================================
   LEITURA DE PDF
========================================================= */

export async function lerCodigoPdf(
  arquivo: File
): Promise<string | null> {
  const dadosPdf =
    await arquivo.arrayBuffer();

  const documento =
    await pdfjsLib.getDocument({
      data: new Uint8Array(dadosPdf)
    }).promise;

  try {
    /*
     * Primeira tentativa:
     * extrair a linha digitável diretamente do texto.
     */
    const codigoDoTexto =
      await extrairCodigoTextoPdf(documento);

    if (codigoDoTexto) {
      return codigoDoTexto;
    }

    /*
     * Segunda tentativa:
     * transformar as páginas em imagem e tentar ZXing/OCR.
     */
    const limitePaginas =
      Math.min(documento.numPages, 3);

    for (
      let numeroPagina = 1;
      numeroPagina <= limitePaginas;
      numeroPagina++
    ) {
      const pagina =
        await documento.getPage(numeroPagina);

      const canvas =
        await renderizarPaginaPdf(pagina);

      if (!canvas) {
        continue;
      }

      /*
       * Tenta a página inteira.
       */
      const codigoPagina =
        await lerCodigoCanvas(canvas);

      if (codigoPagina) {
        return codigoPagina;
      }

      /*
       * Tenta somente a parte inferior da página.
       */
      const recorteInferior =
        criarRecorteInferior(canvas);

      if (recorteInferior) {
        const codigoRecorte =
          await lerCodigoCanvas(recorteInferior);

        if (codigoRecorte) {
          return codigoRecorte;
        }
      }

      /*
       * Se o código de barras não funcionar,
       * tenta reconhecer a linha digitável por OCR.
       */
      const codigoOCR =
        await lerLinhaDigitavelOCR(canvas);

      if (codigoOCR) {
        return codigoOCR;
      }
    }

    return null;
  } catch (error) {
    console.error(
      'Erro ao analisar o PDF:',
      error
    );

    return null;
  } finally {
    await documento.cleanup();
  }
}


/* =========================================================
   FUNÇÃO PRINCIPAL

   Essa é a única função que você precisa chamar
   no modalBoleto.tsx.
========================================================= */

export async function lerCodigoArquivo(
  arquivo: File
): Promise<string | null> {
  if (arquivo.type === 'application/pdf') {
    return lerCodigoPdf(arquivo);
  }

  if (arquivo.type.startsWith('image/')) {
    return lerCodigoImagem(arquivo);
  }

  return null;
}