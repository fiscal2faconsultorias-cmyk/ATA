import { parseXlsx } from "../lib/parseXlsx";

export function UploadXlsx({ onData, onError }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl space-y-3 text-slate-50">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Planilha XLSX</p>
        <p className="text-xs text-slate-200">Carregue a planilha com os registros.</p>
      </div>
      <input
        type="file"
        accept=".xlsx"
        className="block w-full text-sm text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500/90 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-cyan-500 cursor-pointer"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const rows = await parseXlsx(file);
            onData(rows);
          } catch (err) {
            onError(err.message || "Erro ao ler planilha");
          }
        }}
      />
      <p className="text-xs text-slate-200">Colunas esperadas: razao_social, cnpj, valor (opcional: codigo)</p>
    </div>
  );
}