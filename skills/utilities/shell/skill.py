import logging
import subprocess
from typing import Dict, Any
from skills.base import BaseSkill

logger = logging.getLogger(__name__)

class ShellSkill(BaseSkill):
    """Skill de execução de comandos shell."""
    
    def execute(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """Executa comando shell."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            return {
                "success": result.returncode == 0,
                "command": command,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Comando excedeu timeout de {timeout}s"
            }
        except Exception as e:
            logger.error(f"Erro ao executar comando: {e}")
            return {
                "success": False,
                "error": str(e)
            }
