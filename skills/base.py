import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class BaseSkill:
    """Classe base para todas as skills do Cleudocode."""
    
    def __init__(self):
        self.name = ""
        self.description = ""
        self.metadata = None
        
    def check_requirements(self) -> Dict[str, bool]:
        """Verifica se os requisitos (env vars, dependências) estão satisfeitos."""
        return {}
        
    def execute(self, **kwargs) -> Any:
        """Executa a lógica principal da skill."""
        raise NotImplementedError("As skills devem implementar o método execute()")
        
    def get_definition(self) -> str:
        """Retorna uma definição formatada para o System Prompt do LLM."""
        return f"### {self.name}\n{self.description}"
