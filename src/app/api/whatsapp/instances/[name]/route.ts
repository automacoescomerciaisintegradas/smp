import { NextRequest, NextResponse } from "next/server";
import { EvolutionAPI, sanitizeEvolutionInstanceName } from "@/lib/evolution-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const normalizedName = sanitizeEvolutionInstanceName(name);
    const instance = await EvolutionAPI.getInstance(normalizedName);

    if (!instance) {
      return NextResponse.json({ error: "Instância não encontrada" }, { status: 404 });
    }

    return NextResponse.json({ instance });
  } catch (error) {
    console.error("[EVOLUTION_GET_ONE]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar instância" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const normalizedName = sanitizeEvolutionInstanceName(name);
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    const action = body.action || "connect";

    if (action === "connect") {
      const qrPayload = await EvolutionAPI.connectInstance(normalizedName);
      const instance = await EvolutionAPI.getInstance(normalizedName);

      return NextResponse.json({
        action,
        instance,
        qrCode: qrPayload?.qrCode || null,
        pairingCode: qrPayload?.pairingCode || null,
      });
    }

    if (action === "logout") {
      await EvolutionAPI.logoutInstance(normalizedName);
      const instance = await EvolutionAPI.getInstance(normalizedName);

      return NextResponse.json({
        action,
        instance,
      });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("[EVOLUTION_ACTION]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao executar ação da instância" },
      { status: 500 }
    );
  }
}
