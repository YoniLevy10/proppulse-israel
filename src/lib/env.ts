export function getEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    ingestSecret: process.env.INGEST_API_SECRET ?? "dev-ingest-secret",
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    whatsappProvider: (process.env.WHATSAPP_PROVIDER ?? "mock") as
      | "mock"
      | "evolution",
    evolutionApiUrl: process.env.EVOLUTION_API_URL ?? "",
    evolutionApiKey: process.env.EVOLUTION_API_KEY ?? "",
    evolutionInstance: process.env.EVOLUTION_INSTANCE ?? "proppulse",
  };
}

export function hasSupabase(): boolean {
  const env = getEnv();
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}
