import { NextRequest, NextResponse } from "next/server";
import { EvolutionAPI, sanitizeEvolutionInstanceName } from "@/lib/evolution-api";

export async function GET() {
  try {
    const instances = await EvolutionAPI.getAllInstances();
    return NextResponse.json({ instances });
  } catch (error) {
    console.error("[EVOLUTION_GET_ALL]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao buscar instâncias" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Nome da instância é obrigatório" }, { status: 400 });

    const normalizedName = sanitizeEvolutionInstanceName(String(name));
    if (!normalizedName) {
      return NextResponse.json({ error: "Nome da instância inválido" }, { status: 400 });
    }

    const instance = await EvolutionAPI.createInstance(normalizedName);
    return NextResponse.json({
      instance,
      normalizedName,
    });
  } catch (error) {
    console.error("[EVOLUTION_CREATE]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao criar instância" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ error: "Nome da instância é obrigatório" }, { status: 400 });

    await EvolutionAPI.deleteInstance(name);
    return NextResponse.json({ success: true, name: sanitizeEvolutionInstanceName(name) });
  } catch (error) {
    console.error("[EVOLUTION_DELETE]", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao excluir instância" }, { status: 500 });
  }
}
