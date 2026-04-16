"""
publish.py — ACI Instagram Publisher
Publica posts, carrosséis, reels e stories via Meta Graph API oficial.
"""
import argparse, os, sys, time, requests
from pathlib import Path
from dotenv import load_dotenv

# Localizar .env subindo até 3 níveis
script_dir = Path(__file__).parent
for i in range(4):
    candidate = (script_dir / ("../" * i) / ".env").resolve()
    if candidate.exists():
        load_dotenv(candidate)
        break

IG_ID      = os.getenv("INSTAGRAM_BUSINESS_ID")
PAGE_TOKEN = os.getenv("INSTAGRAM_ACCESS_TOKEN")
API_VER    = os.getenv("META_API_VERSION", "v19.0")
BASE       = f"https://graph.facebook.com/{API_VER}"


def check_credentials():
    if not IG_ID or not PAGE_TOKEN:
        print("ERRO: Credenciais não encontradas. Configure o .env primeiro.")
        sys.exit(1)


def host_file(path: str) -> str:
    """Faz upload de arquivo local para catbox.moe e retorna URL pública."""
    print(f"  Fazendo upload: {Path(path).name}...")
    with open(path, "rb") as f:
        r = requests.post(
            "https://catbox.moe/user/api.php",
            data={"reqtype": "fileupload"},
            files={"fileToUpload": (Path(path).name, f)},
            timeout=120,
        )
    url = r.text.strip()
    if not url.startswith("https://"):
        raise RuntimeError(f"Falha no upload: {url}")
    print(f"  URL pública: {url}")
    return url


def create_container(params: dict) -> str:
    r = requests.post(f"{BASE}/{IG_ID}/media",
        data={"access_token": PAGE_TOKEN, **params}, timeout=60)
    result = r.json()
    if "id" not in result:
        raise RuntimeError(f"Erro ao criar container: {result}")
    return result["id"]


def wait_ready(container_id: str, timeout=300) -> bool:
    print("  Aguardando processamento", end="", flush=True)
    for _ in range(timeout // 5):
        r = requests.get(f"{BASE}/{container_id}",
            params={"fields": "status_code", "access_token": PAGE_TOKEN}, timeout=15)
        status = r.json().get("status_code", "")
        if status == "FINISHED":
            print(" OK")
            return True
        if status == "ERROR":
            raise RuntimeError(f"Erro no container: {r.json()}")
        print(".", end="", flush=True)
        time.sleep(5)
    return False


def publish_container(container_id: str) -> str:
    r = requests.post(f"{BASE}/{IG_ID}/media_publish",
        data={"access_token": PAGE_TOKEN, "creation_id": container_id}, timeout=30)
    result = r.json()
    if "id" not in result:
        raise RuntimeError(f"Erro ao publicar: {result}")
    return result["id"]


def publish_image(files, caption):
    url = host_file(files[0])
    cid = create_container({"image_url": url, "caption": caption})
    if not wait_ready(cid):
        raise RuntimeError("Timeout no processamento.")
    return publish_container(cid)


def publish_carousel(files, caption):
    children = []
    for f in files:
        url = host_file(f)
        cid = create_container({"image_url": url, "is_carousel_item": "true"})
        children.append(cid)
    carousel_id = create_container({
        "media_type": "CAROUSEL",
        "children": ",".join(children),
        "caption": caption,
    })
    if not wait_ready(carousel_id):
        raise RuntimeError("Timeout no processamento.")
    return publish_container(carousel_id)


def publish_reel(files, caption, cover_url=None):
    url = host_file(files[0])
    params = {"media_type": "REELS", "video_url": url, "caption": caption}
    if cover_url:
        params["cover_url"] = cover_url
    cid = create_container(params)
    if not wait_ready(cid, timeout=300):
        raise RuntimeError("Timeout no processamento do vídeo.")
    return publish_container(cid)


def publish_story(files):
    url = host_file(files[0])
    ext = Path(files[0]).suffix.lower()
    media_type = "STORIES"
    params = {"media_type": media_type}
    if ext in [".mp4", ".mov"]:
        params["video_url"] = url
    else:
        params["image_url"] = url
    cid = create_container(params)
    if not wait_ready(cid):
        raise RuntimeError("Timeout no processamento.")
    return publish_container(cid)


def run():
    check_credentials()
    parser = argparse.ArgumentParser(description="ACI Instagram Publisher")
    parser.add_argument("--type", required=True,
        choices=["image", "carousel", "reel", "story"])
    parser.add_argument("--files", nargs="+", required=True)
    parser.add_argument("--caption", default="")
    parser.add_argument("--cover_url", default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    # Validações
    for f in args.files:
        if not Path(f).exists():
            print(f"ERRO: Arquivo não encontrado: {f}")
            sys.exit(1)

    if args.type == "carousel" and not (2 <= len(args.files) <= 10):
        print("ERRO: Carrossel precisa de 2 a 10 imagens.")
        sys.exit(1)

    if args.dry_run:
        print(f"[DRY RUN] Tudo OK. Tipo: {args.type}, Arquivos: {args.files}")
        print("Remova --dry-run para publicar de verdade.")
        return

    print(f"\nPublicando {args.type} no Instagram (@ACI)...")

    if args.type == "image":
        post_id = publish_image(args.files, args.caption)
    elif args.type == "carousel":
        post_id = publish_carousel(args.files, args.caption)
    elif args.type == "reel":
        post_id = publish_reel(args.files, args.caption, args.cover_url)
    elif args.type == "story":
        post_id = publish_story(args.files)

    print(f"\nPublicado com sucesso!")
    print(f"Post ID: {post_id}")


if __name__ == "__main__":
    run()
