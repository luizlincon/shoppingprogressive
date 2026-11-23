import "server-only";

/**
 * Leitura centralizada das variáveis de ambiente.
 * Nenhum valor é exposto à interface: só se cada integração está configurada.
 */
const has = (name: string) => Boolean(process.env[name]?.trim());

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  anthropicModel: process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5",
  imageProvider: process.env.IMAGE_PROVIDER ?? "",
  imageProviderApiKey: process.env.IMAGE_PROVIDER_API_KEY ?? "",
};

export type IntegrationStatus = {
  id: string;
  label: string;
  configured: boolean;
  detail: string;
};

export function integrationStatus(): IntegrationStatus[] {
  const supabase = has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const imageProvider = has("IMAGE_PROVIDER") && has("IMAGE_PROVIDER_API_KEY");
  return [
    {
      id: "supabase",
      label: "Supabase (banco)",
      configured: supabase,
      detail: supabase ? "URL e chave pública definidas" : "Faltam NEXT_PUBLIC_SUPABASE_URL e ANON_KEY",
    },
    {
      id: "supabase-service",
      label: "Supabase (serviço)",
      configured: has("SUPABASE_SERVICE_ROLE_KEY"),
      detail: has("SUPABASE_SERVICE_ROLE_KEY")
        ? "Chave de serviço definida (só no servidor)"
        : "Falta SUPABASE_SERVICE_ROLE_KEY",
    },
    {
      id: "claude",
      label: "Claude API",
      configured: has("ANTHROPIC_API_KEY"),
      detail: has("ANTHROPIC_API_KEY") ? `Modelo ${env.anthropicModel}` : "Falta ANTHROPIC_API_KEY",
    },
    {
      id: "images",
      label: "Provedor de imagens",
      configured: imageProvider,
      detail: imageProvider ? `Provedor: ${env.imageProvider}` : "Provedor ainda não escolhido",
    },
  ];
}

export const isSupabaseConfigured = () =>
  has("NEXT_PUBLIC_SUPABASE_URL") && has("NEXT_PUBLIC_SUPABASE_ANON_KEY");
