import os
import logging
from pathlib import Path
from typing import Dict, Any
from skills.base import BaseSkill

logger = logging.getLogger(__name__)

class FilesystemSkill(BaseSkill):
    """Skill de operações de filesystem adaptada para o Cleudocode."""
    
    def execute(self, action: str, **kwargs) -> Dict[str, Any]:
        """Orquestra as ações de arquivo."""
        if action == "create_directory":
            return self.create_directory(kwargs.get("path"))
        elif action == "write_file":
            return self.write_file(kwargs.get("filepath"), kwargs.get("content"), kwargs.get("overwrite", False))
        elif action == "read_file":
            return self.read_file(kwargs.get("filepath"))
        else:
            return {"success": False, "error": f"Ação desconhecida: {action}"}

    def create_directory(self, path: str) -> Dict[str, Any]:
        """Cria um diretório."""
        try:
            os.makedirs(path, exist_ok=True)
            logger.info(f"Diretório criado: {path}")
            return {
                "success": True,
                "path": path,
                "message": f"Diretório '{path}' criado"
            }
        except Exception as e:
            logger.error(f"Erro ao criar diretório: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def write_file(self, filepath: str, content: str, overwrite: bool = False) -> Dict[str, Any]:
        """Escreve conteúdo em arquivo."""
        try:
            file_path = Path(filepath)
            
            # Verificar se arquivo existe
            if file_path.exists() and not overwrite:
                return {
                    "success": False,
                    "error": f"Arquivo '{filepath}' já existe. Use overwrite=true para sobrescrever."
                }
            
            # Criar diretórios se necessário
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Escrever arquivo
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logger.info(f"Arquivo escrito: {filepath}")
            return {
                "success": True,
                "filepath": str(file_path),
                "size": len(content),
                "message": f"Arquivo '{filepath}' escrito com {len(content)} caracteres"
            }
        except Exception as e:
            logger.error(f"Erro ao escrever arquivo: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def read_file(self, filepath: str) -> Dict[str, Any]:
        """Lê conteúdo de arquivo."""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "success": True,
                "filepath": filepath,
                "content": content,
                "size": len(content)
            }
        except FileNotFoundError:
            return {
                "success": False,
                "error": f"Arquivo '{filepath}' não encontrado"
            }
        except Exception as e:
            logger.error(f"Erro ao ler arquivo: {e}")
            return {
                "success": False,
                "error": str(e)
            }
