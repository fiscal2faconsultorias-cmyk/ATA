const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function gerarAtaLLM(dados: {
  razaoSocial: string;
  cnpj: string;
  valor: number;
  valorExtenso: string;
  data: string;
}) {
  if (!OPENROUTER_API_KEY) throw new Error("Defina VITE_OPENROUTER_API_KEY");
  const prompt = `
Você é um assistente jurídico. Gere uma ata formal de distribuição de lucros em português, concisa e estruturada.
Inclua razão social, CNPJ, data, valor (R$) e valor por extenso. Parágrafos curtos.

Dados:
- Razão Social: ${dados.razaoSocial}
- CNPJ: ${dados.cnpj}
- Data: ${dados.data}
- Valor: R$ ${dados.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
- Valor por extenso: ${dados.valorExtenso}
`.trim();

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-3.5-turbo",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`OpenRouter erro: ${res.status} - ${await res.text()}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content as string;
}