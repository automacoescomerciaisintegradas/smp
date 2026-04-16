import { describe, expect, it } from "vitest";
import {
  extractEvolutionQrCode,
  normalizeEvolutionInstance,
  normalizeEvolutionInstances,
  resolveEvolutionRuntime,
  sanitizeEvolutionInstanceName,
} from "@/lib/evolution-api";

describe("sanitizeEvolutionInstanceName", () => {
  it("normaliza o nome da instancia para um slug seguro", () => {
    expect(sanitizeEvolutionInstanceName("Loja Central 01")).toBe("loja-central-01");
  });
});

describe("resolveEvolutionRuntime", () => {
  it("aceita WHATSAPP_BASE_URL como fallback do endpoint Evolution", () => {
    expect(
      resolveEvolutionRuntime({
        WHATSAPP_BASE_URL: "https://evolution.example.com/",
        EVOLUTION_API_KEY: "secret",
      })
    ).toEqual({
      baseUrl: "https://evolution.example.com",
      apiKey: "secret",
    });
  });
});

describe("normalizeEvolutionInstance", () => {
  it("normaliza status e metadados de uma instancia", () => {
    const instance = normalizeEvolutionInstance({
      instance: {
        id: "abc123",
        instanceName: "loja-central",
        profileName: "Loja Central",
        clientName: "Chrome",
        osName: "Windows",
      },
      state: "open",
      qrcode: {
        base64: "data:image/png;base64,AAA",
      },
    });

    expect(instance).toEqual({
      id: "abc123",
      name: "loja-central",
      token: undefined,
      connected: true,
      connectionStatus: "open",
      qrCode: "data:image/png;base64,AAA",
      pairingCode: undefined,
      osName: "Windows",
      clientName: "Chrome",
      profileName: "Loja Central",
      ownerJid: undefined,
      createdAt: undefined,
    });
  });
});

describe("normalizeEvolutionInstances", () => {
  it("normaliza listas encapsuladas no campo data", () => {
    const instances = normalizeEvolutionInstances({
      data: [
        {
          name: "principal",
          connected: false,
          status: "close",
        },
      ],
    });

    expect(instances).toHaveLength(1);
    expect(instances[0]?.name).toBe("principal");
    expect(instances[0]?.connected).toBe(false);
  });
});

describe("extractEvolutionQrCode", () => {
  it("extrai qr code e pairing code de payloads aninhados", () => {
    expect(
      extractEvolutionQrCode({
        data: {
          qrcode: {
            Qrcode: "data:image/png;base64,BBB",
            Code: "ABCD1234",
          },
        },
      })
    ).toEqual({
      qrCode: "data:image/png;base64,BBB",
      pairingCode: "ABCD1234",
    });
  });
});
