import * as XLSX from "xlsx";

export type Registro = {
  razao_social: string;
  cnpj: string;
  valor: number;
  codigo?: string;
};

export function parseXlsx(file: File): Promise<Registro[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: any[] = XLSX.utils.sheet_to_json(ws, { defval: "" });

        const rows = json.map((row, idx) => {
          const razao_social = row.razao_social || row.RAZAO_SOCIAL || row["Razão Social"];
          const cnpj = row.cnpj || row.CNPJ;
          const valorRaw = row.valor ?? row.VALOR;
          const codigo = row.codigo || row.CODIGO || row["codigo_empresa"] || row["CODIGO_EMPRESA"] || row["Código"];

          if (!razao_social || !cnpj || valorRaw === undefined) {
            throw new Error(`Linha ${idx + 2}: campos obrigatórios faltando (razao_social, cnpj, valor).`);
          }

          const valorNumParsed =
            typeof valorRaw === "number"
              ? valorRaw
              : Number(String(valorRaw).replace(/\./g, "").replace(",", "."));
          if (Number.isNaN(valorNumParsed)) throw new Error(`Linha ${idx + 2}: valor inválido.`);

          // Arredonda para 2 casas para evitar imprecisão binária que bagunça o extenso
          const valorNum = Math.round(valorNumParsed * 100) / 100;

          return { razao_social, cnpj, valor: valorNum, codigo } as Registro;
        });

        resolve(rows);
      } catch (e) {
        reject(e);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}