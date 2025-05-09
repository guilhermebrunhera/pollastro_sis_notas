export function formatarReaisSemSimboloString(valor: string): string {
    return parseFloat(valor).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

export function formatarReaisSemSimboloFloat(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
}

export function removerAcentosTexto (texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};