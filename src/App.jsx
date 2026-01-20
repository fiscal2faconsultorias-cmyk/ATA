import { useMemo, useState } from "react";
import { UploadTemplate } from "./components/UploadTemplate";
import { UploadXlsx } from "./components/UploadXlsx";
import { valorPorExtenso, formatarBRL } from "./lib/format";
import { fillDocxAndDownload } from "./lib/fillDocx";
import { fillPdfAndDownload } from "./lib/fillPdf";
import { gerarAtaLLM } from "./lib/openrouter";

function App() {
  const [templateFile, setTemplateFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [modoTexto, setModoTexto] = useState("placeholder");
  const [formatoSaida, setFormatoSaida] = useState("docx");

  const pronto = useMemo(() => templateFile && rows.length > 0, [templateFile, rows]);

  const handleGerar = async () => {
    setError(null);
    if (!templateFile) {
      setError("Envie um template .docx primeiro.");
      return;
    }
    if (rows.length === 0) {
      setError("Carregue a planilha com os dados.");
      return;
    }

    setGerando(true);
    try {
      const dataAtual = new Date().toLocaleDateString("pt-BR");

      for (const row of rows) {
        const valorExtenso = valorPorExtenso(row.valor);
        let ataTexto = "";

        if (modoTexto === "openrouter") {
          ataTexto = await gerarAtaLLM({
            razaoSocial: row.razao_social,
            cnpj: row.cnpj,
            valor: row.valor,
            valorExtenso,
            data: dataAtual,
          });
        }

        const dadosDoc = {
          razao_social: row.razao_social,
          cnpj: row.cnpj,
          valor: `R$ ${formatarBRL(row.valor)}`,
          valor_extenso: valorExtenso,
          data: dataAtual,
          ata_texto: ataTexto,
        };

        const codigoLimpo = row.codigo ? String(row.codigo).trim().replace(/[^a-zA-Z0-9-_]+/g, "-") : "";
        const razaoLimpa = row.razao_social.trim().replace(/[^a-zA-Z0-9\s-_]+/g, "-").replace(/\s+/g, " ");
        const baseNome = codigoLimpo ? `${codigoLimpo} - ${razaoLimpa}` : `ata-${razaoLimpa}`;
        const nomeArquivo = baseNome.replace(/\s+/g, " ").trim();
        if (formatoSaida === "pdf") {
          await fillPdfAndDownload(nomeArquivo, dadosDoc);
        } else {
          await fillDocxAndDownload(templateFile, dadosDoc, nomeArquivo);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao gerar DOCX.");
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#0ea5e9_0,#0ea5e900_25%),radial-gradient(circle_at_80%_0%,#6366f1_0,#6366f100_25%),radial-gradient(circle_at_30%_80%,#22c55e_0,#22c55e00_25%)] opacity-40" aria-hidden />
      <div className="relative max-w-6xl mx-auto py-12 px-4 space-y-6">
        <header className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Fluxo completo</p>
            <h1 className="text-3xl font-semibold text-white">Gerador de ATA (DOCX/PDF)</h1>
            <p className="text-sm text-slate-200">
              Envie 1 template .docx e 1 planilha .xlsx: geramos um arquivo por cada linha da planilha.
              Tudo é feito em lote, não precisa acionar uma empresa por vez.
            </p>
          </div>
        </header>

        <div className="grid md:grid-cols-2 gap-4">
          <UploadTemplate onFile={setTemplateFile} />
          <UploadXlsx onData={setRows} onError={setError} />
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGerar}
              disabled={!pronto || gerando}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gerando ? "Gerando em lote..." : `Gerar ${formatoSaida.toUpperCase()} para todos`}
            </button>
            <span className="text-sm text-slate-200">Registros carregados: {rows.length}</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-200">Texto da ata:</span>
              <select
                value={modoTexto}
                onChange={(e) => setModoTexto(e.target.value)}
                className="border border-white/20 bg-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option className="text-slate-900" value="placeholder">Só placeholders (sem LLM)</option>
                <option className="text-slate-900" value="openrouter">Gerar via OpenRouter (usa {"{{ata_texto}}"})</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-200">Formato:</span>
              <select
                value={formatoSaida}
                onChange={(e) => setFormatoSaida(e.target.value)}
                className="border border-white/20 bg-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                <option className="text-slate-900" value="docx">DOCX</option>
                <option className="text-slate-900" value="pdf">PDF</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-400/40 bg-rose-400/10 text-rose-50 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-white">Pré-visualização dos dados</p>
              <span className="text-xs text-slate-300">Mostrando até 100 registros</span>
            </div>
            <div className="max-h-72 overflow-auto text-sm">
              <table className="min-w-full text-left">
                <thead className="text-slate-300 text-xs uppercase">
                  <tr className="border-b border-white/10">
                    <th className="py-2 pr-3">Código</th>
                    <th className="py-2 pr-3">Razão Social</th>
                    <th className="py-2 pr-3">CNPJ</th>
                    <th className="py-2 pr-3">Valor</th>
                  </tr>
                </thead>
                <tbody className="text-slate-100">
                  {rows.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-b border-white/5 last:border-0">
                      <td className="py-2 pr-3">{r.codigo || "-"}</td>
                      <td className="py-2 pr-3">{r.razao_social}</td>
                      <td className="py-2 pr-3">{r.cnpj}</td>
                      <td className="py-2 pr-3">R$ {formatarBRL(r.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <section className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl space-y-2">
          <p className="font-semibold text-white">Placeholders no template .docx</p>
          <ul className="list-disc list-inside text-sm text-slate-200 space-y-1">
            <li><code>&#123;&#123;razao_social&#125;&#125;</code></li>
            <li><code>&#123;&#123;cnpj&#125;&#125;</code></li>
            <li><code>&#123;&#123;valor&#125;&#125;</code> (formato R$ 0.000,00)</li>
            <li><code>&#123;&#123;valor_extenso&#125;&#125;</code> (por extenso em reais)</li>
            <li><code>&#123;&#123;data&#125;&#125;</code> (data atual dd/mm/aaaa)</li>
            <li><code>&#123;&#123;ata_texto&#125;&#125;</code> (se escolher “OpenRouter” no seletor)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default App;