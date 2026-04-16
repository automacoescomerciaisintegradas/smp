import logging
import os
from typing import Dict, Any
from skills.base import BaseSkill

logger = logging.getLogger(__name__)

class TelegramSkill(BaseSkill):
    """Skill de integração com Telegram."""
    
    def check_requirements(self) -> Dict[str, bool]:
        """Verifica se as variáveis de ambiente necessárias estão presentes."""
        return {
            "TELEGRAM_BOT_TOKEN": bool(os.environ.get("TELEGRAM_BOT_TOKEN")),
            "TELEGRAM_CHAT_ID": bool(os.environ.get("TELEGRAM_CHAT_ID"))
        }

    def execute(self, message: str, chat_id: str = None) -> Dict[Dict[str, Any], Any]:
        """Envia mensagem via Telegram."""
        return self.send_message(message, chat_id)

    def send_message(self, message: str, chat_id: str = None) -> Dict[str, Any]:
        """Envia mensagem via Telegram (Simulação com log por enquanto)."""
        target_chat = chat_id or os.environ.get("TELEGRAM_CHAT_ID", "default")
        
        # Simulação de envio
        logger.info(f"[TELEGRAM] Enviando para {target_chat}: {message[:100]}...")
        
        # Aqui no futuro entrará: requests.post(f"https://api.telegram.org/bot{token}/sendMessage", ...)
        
        return {
            "success": True,
            "message": "Mensagem enviada (simulado)",
            "chat_id": target_chat,
            "content": message
        }
