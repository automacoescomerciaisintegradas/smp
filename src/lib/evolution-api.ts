type EvolutionEnvSource = Readonly<Record<string, string | undefined>>;

type EvolutionApiResponse<T> = {
  data?: T;
  message?: string;
  error?: string;
  response?: T;
};

type EvolutionInstancePayload = Record<string, unknown>;

type EvolutionQrPayload = {
  base64?: string;
  qrcode?: string;
  qrCode?: string;
  Qrcode?: string;
  code?: string;
  Code?: string;
};

export interface EvolutionInstance {
  id: string;
  name: string;
  token?: string;
  connected: boolean;
  connectionStatus: string;
  qrCode?: string;
  pairingCode?: string;
  osName?: string;
  clientName?: string;
  profileName?: string;
  ownerJid?: string;
  createdAt?: string;
}

type EvolutionRuntime = {
  baseUrl: string;
  apiKey: string;
};

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function getBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "open", "connected"].includes(normalized)) {
      return true;
    }

    if (["false", "0", "close", "closed", "disconnected"].includes(normalized)) {
      return false;
    }
  }

  return undefined;
}

function ensureTrailingSlashRemoved(value: string) {
  return value.replace(/\/+$/, "");
}

export function sanitizeEvolutionInstanceName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]/g, "")
    .replace(/-{2,}/g, "-");
}

export function resolveEvolutionRuntime(
  env: EvolutionEnvSource = process.env
): EvolutionRuntime | null {
  const baseUrl =
    getString(env.EVOLUTION_BASE_URL) ||
    getString(env.WHATSAPP_BASE_URL) ||
    getString(env.NEXT_PUBLIC_EVOLUTION_BASE_URL);
  const apiKey = getString(env.EVOLUTION_API_KEY);

  if (!baseUrl || !apiKey) {
    return null;
  }

  return {
    baseUrl: ensureTrailingSlashRemoved(baseUrl),
    apiKey,
  };
}

function extractConnectionStatus(payload: EvolutionInstancePayload) {
  const nestedInstance = getRecord(payload.instance);

  return (
    getString(payload.connectionStatus) ||
    getString(payload.status) ||
    getString(payload.state) ||
    getString(nestedInstance?.state) ||
    "unknown"
  );
}

function extractConnected(payload: EvolutionInstancePayload, connectionStatus: string) {
  const nestedInstance = getRecord(payload.instance);
  const directValue =
    getBoolean(payload.connected) ??
    getBoolean(payload.isConnected) ??
    getBoolean(nestedInstance?.connected) ??
    getBoolean(nestedInstance?.isConnected);

  if (typeof directValue === "boolean") {
    return directValue;
  }

  const normalizedStatus = connectionStatus.toLowerCase();
  return ["open", "connected"].includes(normalizedStatus);
}

export function extractEvolutionQrCode(payload: unknown) {
  const record = getRecord(payload);
  if (!record) {
    return null;
  }

  const data = getRecord(record.data);
  const response = getRecord(record.response);
  const nested = [record, data, response].find(Boolean) as Record<string, unknown> | undefined;

  if (!nested) {
    return null;
  }

  const qrNode =
    getRecord(nested.qrcode) ||
    getRecord(nested.qrCode) ||
    getRecord(nested.qrcodeData) ||
    nested;

  const base64 =
    getString(qrNode?.base64) ||
    getString(qrNode?.Qrcode) ||
    getString(qrNode?.qrCode) ||
    getString((nested as EvolutionQrPayload).base64) ||
    getString((nested as EvolutionQrPayload).Qrcode) ||
    getString((nested as EvolutionQrPayload).qrCode);
  const pairingCode =
    getString(qrNode?.code) ||
    getString(qrNode?.Code) ||
    getString((nested as EvolutionQrPayload).code) ||
    getString((nested as EvolutionQrPayload).Code);

  return {
    qrCode: base64 || null,
    pairingCode: pairingCode || null,
  };
}

export function normalizeEvolutionInstance(raw: unknown): EvolutionInstance | null {
  const payload = getRecord(raw);
  if (!payload) {
    return null;
  }

  const nestedInstance = getRecord(payload.instance);
  const source = nestedInstance || payload;
  const name =
    getString(source.name) ||
    getString(source.instanceName) ||
    getString(payload.name) ||
    getString(payload.instanceName);

  if (!name) {
    return null;
  }

  const connectionStatus = extractConnectionStatus(payload);
  const qrPayload = extractEvolutionQrCode(payload);

  return {
    id:
      getString(source.id) ||
      getString(source.instanceId) ||
      getString(payload.id) ||
      getString(payload.instanceId) ||
      name,
    name,
    token:
      getString(source.token) ||
      getString(payload.token),
    connected: extractConnected(payload, connectionStatus),
    connectionStatus,
    qrCode: qrPayload?.qrCode || undefined,
    pairingCode: qrPayload?.pairingCode || undefined,
    osName:
      getString(source.os) ||
      getString(source.osName) ||
      getString(payload.os_name),
    clientName:
      getString(source.clientName) ||
      getString(source.browserName) ||
      getString(payload.client_name),
    profileName:
      getString(source.profileName) ||
      getString(source.pushName),
    ownerJid:
      getString(source.ownerJid) ||
      getString(source.owner),
    createdAt:
      getString(source.createdAt) ||
      getString(source.created_at) ||
      getString(payload.createdAt),
  };
}

export function normalizeEvolutionInstances(raw: unknown) {
  const payload = getRecord(raw);

  const candidates = Array.isArray(raw)
    ? raw
    : Array.isArray(payload?.data)
      ? payload?.data
      : Array.isArray(payload?.response)
        ? payload?.response
        : Array.isArray(payload?.instances)
          ? payload?.instances
          : [];

  return candidates
    .map((instance) => normalizeEvolutionInstance(instance))
    .filter((instance): instance is EvolutionInstance => Boolean(instance));
}

export class EvolutionAPI {
  private static getRuntime() {
    const runtime = resolveEvolutionRuntime();

    if (!runtime) {
      throw new Error(
        "Evolution API não configurada. Defina EVOLUTION_BASE_URL ou WHATSAPP_BASE_URL e EVOLUTION_API_KEY."
      );
    }

    return runtime;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const runtime = this.getRuntime();
    const response = await fetch(`${runtime.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        apikey: runtime.apiKey,
        ...options.headers,
      },
      cache: "no-store",
    });

    let payload: EvolutionApiResponse<T> | null = null;

    try {
      payload = (await response.json()) as EvolutionApiResponse<T>;
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload?.message ||
        payload?.error ||
        `Erro ${response.status} ao acessar Evolution API`;
      throw new Error(message);
    }

    return ((payload?.data ?? payload?.response ?? payload) as T) || ({} as T);
  }

  static async getAllInstances(): Promise<EvolutionInstance[]> {
    const response = await this.request<unknown>("/instance/all");
    return normalizeEvolutionInstances(response);
  }

  static async getInstance(name: string) {
    const normalizedName = sanitizeEvolutionInstanceName(name);
    const instances = await this.getAllInstances();

    return instances.find((instance) => instance.name === normalizedName) || null;
  }

  static async createInstance(name: string): Promise<EvolutionInstance | null> {
    const normalizedName = sanitizeEvolutionInstanceName(name);
    const response = await this.request<unknown>("/instance/create", {
      method: "POST",
      body: JSON.stringify({
        instanceName: normalizedName,
        qrcode: true,
      }),
    });

    return normalizeEvolutionInstance(response);
  }

  static async connectInstance(name: string) {
    const normalizedName = sanitizeEvolutionInstanceName(name);
    const response = await this.request<unknown>(`/instance/connect/${normalizedName}`, {
      method: "GET",
    });

    return extractEvolutionQrCode(response);
  }

  static async deleteInstance(name: string): Promise<{ message?: string }> {
    const normalizedName = sanitizeEvolutionInstanceName(name);
    return this.request<{ message?: string }>(`/instance/delete/${normalizedName}`, {
      method: "DELETE",
    });
  }

  static async logoutInstance(name: string): Promise<{ message?: string }> {
    const normalizedName = sanitizeEvolutionInstanceName(name);
    return this.request<{ message?: string }>(`/instance/logout/${normalizedName}`, {
      method: "DELETE",
    });
  }
}
