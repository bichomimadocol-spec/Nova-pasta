export function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  if (cleanCNPJ.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;

  // Valida DVs
  let tamanho = cleanCNPJ.length - 2;
  let numeros = cleanCNPJ.substring(0, tamanho);
  let digitos = cleanCNPJ.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cleanCNPJ.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}
