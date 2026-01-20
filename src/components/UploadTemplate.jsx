export function UploadTemplate({ onFile }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-xl space-y-3 text-slate-50">
      <div className="space-y-1">
        <p className="text-sm font-semibold">Template .docx com placeholders</p>
        <p className="text-xs text-slate-200">Envie o modelo que será preenchido.</p>
      </div>

      <input
        type="file"
        accept=".docx"
        className="block w-full text-sm text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-500/90 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-emerald-500 cursor-pointer"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />

      <p className="text-xs text-slate-200 leading-relaxed">
        Use placeholders como: &#123;&#123;razao_social&#125;&#125;, &#123;&#123;cnpj&#125;&#125;, &#123;&#123;valor&#125;&#125;, &#123;&#123;valor_extenso&#125;&#125;, &#123;&#123;data&#125;&#125; e (opcional) &#123;&#123;ata_texto&#125;&#125; se usar LLM.
      </p>
    </div>
  );
}