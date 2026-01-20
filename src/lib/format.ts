import extenso from "extenso";

function capitalizeFirst(texto: string) {
  return texto ? texto[0].toUpperCase() + texto.slice(1) : texto;
}

function pontuarNumeroExtenso(texto: string) {
  return texto.replace(/\b(milhoes|mil\u00f5es|bilhoes|bil\u00f5es|trilhoes|tril\u00f5es|quatrilhoes|quatril\u00f5es|mil) e /g, "$1, ");
}

export function valorPorExtenso(valor: number) {
  // Gera texto pt-BR em reais com pontuação mais legível
  const arredondado = Math.round(Number(valor) * 100) / 100;

  let inteiro = Math.floor(arredondado);
  let centavos = Math.round((arredondado - inteiro) * 100);

  if (centavos === 100) {
    inteiro += 1;
    centavos = 0;
  }

  const partes: string[] = [];

  if (inteiro > 0) {
    const extensoInteiro = pontuarNumeroExtenso(extenso(inteiro, { mode: "number" }));
    partes.push(`${capitalizeFirst(extensoInteiro)} ${inteiro === 1 ? "real" : "reais"}`);
  }

  if (centavos > 0) {
    const extensoCentavos = pontuarNumeroExtenso(extenso(centavos, { mode: "number" }));
    const textoCentavos = `${inteiro === 0 ? capitalizeFirst(extensoCentavos) : extensoCentavos} ${centavos === 1 ? "centavo" : "centavos"}`;
    partes.push(textoCentavos);
  }

  if (partes.length === 0) {
    return "Zero real";
  }

  return partes.length === 2 ? `${partes[0]}, e ${partes[1]}` : partes[0];
}

export function formatarBRL(valor: number) {
  return valor.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}