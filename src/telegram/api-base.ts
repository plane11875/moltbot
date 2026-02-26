export const TELEGRAM_DEFAULT_API_BASE = "https://api.telegram.org";

export function normalizeTelegramApiBaseUrl(apiBaseUrl?: string | null): string | undefined {
  const trimmed = apiBaseUrl?.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/\/+$/, "");
}

export function resolveTelegramApiBaseUrl(apiBaseUrl?: string | null): string {
  return normalizeTelegramApiBaseUrl(apiBaseUrl) ?? TELEGRAM_DEFAULT_API_BASE;
}

export function buildTelegramBotApiBase(token: string, apiBaseUrl?: string | null): string {
  return `${resolveTelegramApiBaseUrl(apiBaseUrl)}/bot${token}`;
}

export function buildTelegramFileUrl(params: {
  token: string;
  filePath: string;
  apiBaseUrl?: string | null;
}): string {
  return `${resolveTelegramApiBaseUrl(params.apiBaseUrl)}/file/bot${params.token}/${params.filePath}`;
}
