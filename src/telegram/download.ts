import { detectMime } from "../media/mime.js";
import { type SavedMedia, saveMediaBuffer } from "../media/store.js";
import { buildTelegramBotApiBase, buildTelegramFileUrl } from "./api-base.js";

export type TelegramFileInfo = {
  file_id: string;
  file_unique_id?: string;
  file_size?: number;
  file_path?: string;
};

export async function getTelegramFile(
  token: string,
  fileId: string,
  timeoutMs = 30_000,
  apiBaseUrl?: string,
): Promise<TelegramFileInfo> {
  const base = buildTelegramBotApiBase(token, apiBaseUrl);
  const res = await fetch(`${base}/getFile?file_id=${encodeURIComponent(fileId)}`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`getFile failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as { ok: boolean; result?: TelegramFileInfo };
  if (!json.ok || !json.result?.file_path) {
    throw new Error("getFile returned no file_path");
  }
  return json.result;
}

export async function downloadTelegramFile(
  token: string,
  info: TelegramFileInfo,
  maxBytes?: number,
  timeoutMs = 60_000,
  apiBaseUrl?: string,
): Promise<SavedMedia> {
  if (!info.file_path) {
    throw new Error("file_path missing");
  }
  const url = buildTelegramFileUrl({
    token,
    filePath: info.file_path,
    apiBaseUrl,
  });
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to download telegram file: HTTP ${res.status}`);
  }
  const array = Buffer.from(await res.arrayBuffer());
  const mime = await detectMime({
    buffer: array,
    headerMime: res.headers.get("content-type"),
    filePath: info.file_path,
  });
  // save with inbound subdir
  const saved = await saveMediaBuffer(array, mime, "inbound", maxBytes, info.file_path);
  // Ensure extension matches mime if possible
  if (!saved.contentType && mime) {
    saved.contentType = mime;
  }
  return saved;
}
