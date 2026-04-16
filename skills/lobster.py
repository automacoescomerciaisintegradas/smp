"""
Lobster Workflow Engine - Sistema de automação customizada.
Permite criar workflows em YAML que combinam múltiplas skills.
"""

import yaml
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from jinja2 import Template

logger = logging.getLogger(__name__)


class LobsterWorkflow:
    """
    Motor de execução de workflows customizados.
    
    Features:
    - Definição de workflows em YAML
    - Interpolação de variáveis com Jinja2
    - Execução sequencial e paralela
    - Tratamento de erros e retry
    - Logs detalhados de execução
    """
    
    def __init__(self, skill_manager, workflows_dir: str = "skills/workflows"):
        """
        Args:
            skill_manager: Instância do SkillLoader ou objeto similar com .skills{}
            workflows_dir: Diretório com arquivos .lobster
        """
        self.skill_manager = skill_manager
        self.workflows_dir = Path(workflows_dir)
        self.workflows = {}
        
        # Registrar skills do Lobster (Tenta carregar os módulos físicos primeiro)
        self._register_lobster_skills()
        
        # Criar diretório se não existir
        self.workflows_dir.mkdir(parents=True, exist_ok=True)
        
        # Carregar workflows
        self.load_all_workflows()
    
    def _register_lobster_skills(self):
        """Registra skills fundamentais para o Lobster."""
        try:
            # Tenta importar via bridge criada
            from skills.lobster_skills import FilesystemSkill, ShellSkill, TelegramSkill
            
            # Garante que skill_manager tem o atributo skills
            if not hasattr(self.skill_manager, 'skills'):
                self.skill_manager.skills = {}

            # Instanciar e registrar se não existirem
            if 'filesystem' not in self.skill_manager.skills:
                self.skill_manager.skills['filesystem'] = FilesystemSkill()
                
            if 'shell' not in self.skill_manager.skills:
                self.skill_manager.skills['shell'] = ShellSkill()
                
            if 'telegram' not in self.skill_manager.skills:
                self.skill_manager.skills['telegram'] = TelegramSkill()
            
            logger.info("Skills base do Lobster registradas no manager")
        except ImportError as e:
            logger.warning(f"Não foi possível carregar skills do Lobster via bridge: {e}")
            logger.info("Tentando fallback para carregamento manual via loader...")
    
    def load_all_workflows(self):
        """Carrega todos os workflows do diretório."""
        if not self.workflows_dir.exists():
            logger.warning(f"Diretório de workflows não encontrado: {self.workflows_dir}")
            return
        
        count = 0
        for workflow_file in self.workflows_dir.glob("*.lobster"):
            try:
                self.load_workflow(str(workflow_file))
                count += 1
            except Exception as e:
                logger.error(f"Erro ao carregar workflow {workflow_file}: {e}")
        
        logger.info(f"{count} workflows carregados de {self.workflows_dir}")
    
    def load_workflow(self, filepath: str):
        """
        Carrega workflow de arquivo YAML.
        
        Args:
            filepath: Caminho do arquivo .lobster
        """
        with open(filepath, 'r', encoding='utf-8') as f:
            workflow = yaml.safe_load(f)
        
        # Validar estrutura
        self._validate_workflow(workflow)
        
        workflow_name = workflow['name']
        self.workflows[workflow_name] = workflow
        
        logger.info(f"Workflow carregado: {workflow_name}")
    
    def _validate_workflow(self, workflow: dict):
        """Valida estrutura do workflow."""
        required_fields = ['name', 'description', 'steps']
        for field in required_fields:
            if field not in workflow:
                raise ValueError(f"Campo obrigatório ausente: {field}")
        
        if not isinstance(workflow['steps'], list):
            raise ValueError("'steps' deve ser uma lista")
        
        for i, step in enumerate(workflow['steps']):
            if 'name' not in step:
                raise ValueError(f"Step {i} sem nome")
            if 'skill' not in step:
                raise ValueError(f"Step '{step['name']}' sem skill")
            if 'action' not in step:
                raise ValueError(f"Step '{step['name']}' sem action")
    
    def execute(
        self,
        workflow_name: str,
        variables: Optional[Dict[str, Any]] = None,
        async_mode: bool = False
    ) -> Dict[str, Any]:
        """
        Executa workflow.
        
        Args:
            workflow_name: Nome do workflow
            variables: Variáveis para interpolação
            async_mode: Se True, executa em background
            
        Returns:
            Dict com resultados da execução
        """
        if workflow_name not in self.workflows:
            # Tenta recarregar se não encontrou (hot-reload)
            self.load_all_workflows()
            if workflow_name not in self.workflows:
                return {
                    "success": False,
                    "error": f"Workflow '{workflow_name}' não encontrado"
                }
        
        workflow = self.workflows[workflow_name]
        
        # Preparar contexto de variáveis
        ctx_vars = workflow.get('variables', {}).copy()
        
        # Variáveis padrão
        ctx_vars.update({
            'date': datetime.now().strftime('%Y%m%d'),
            'datetime': datetime.now().strftime('%Y%m%d_%H%M%S'),
            'timestamp': datetime.now().isoformat(),
            'workflow_name': workflow_name
        })
        
        # User override
        if variables:
            ctx_vars.update(variables)
            
        # Interpolação das variáveis
        for _ in range(2):
            for key, value in ctx_vars.items():
                if isinstance(value, str) and "{{" in value:
                    try:
                        ctx_vars[key] = self._interpolate_variables(value, ctx_vars)
                    except:
                        pass
        
        variables = ctx_vars
        logger.info(f"Iniciando execução do workflow: {workflow_name}")
        
        if async_mode:
            # Nota: execução assíncrona requer loop de eventos configurado
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(self._execute_async(workflow, variables))
                else:
                    asyncio.run(self._execute_async(workflow, variables))
            except RuntimeError:
                asyncio.run(self._execute_async(workflow, variables))
                
            return {
                "success": True,
                "message": f"Workflow '{workflow_name}' disparado"
            }
        else:
            return self._execute_sync(workflow, variables)
    
    def _execute_sync(self, workflow: dict, variables: dict) -> Dict[str, Any]:
        """Executa workflow sincronamente."""
        results = []
        context = variables.copy()
        
        for i, step in enumerate(workflow['steps']):
            step_name = step['name']
            logger.info(f"Step {i+1}/{len(workflow['steps'])}: {step_name}")
            
            try:
                result = self._execute_step(step, context)
                results.append({
                    "step": step_name,
                    "success": result.get('success', False),
                    "result": result
                })
                
                # Adicionar resultado ao contexto para próximos steps
                context[f'step_{i}_result'] = result
                # Também adiciona pelo nome para facilitar referência
                context[step_name] = result
                
                # Parar se houver erro
                if not result.get('success', False) and not step.get('continue_on_error', False):
                    logger.error(f"Erro em '{step_name}'. Fluxo interrompido.")
                    break
                    
            except Exception as e:
                logger.error(f"Exceção em '{step_name}': {e}")
                results.append({
                    "step": step_name,
                    "success": False,
                    "error": str(e)
                })
                if not step.get('continue_on_error', False):
                    break
        
        all_success = all(r.get('success', False) for r in results)
        
        return {
            "success": all_success,
            "workflow": workflow['name'],
            "steps_executed": len(results),
            "results": results
        }
    
    async def _execute_async(self, workflow: dict, variables: dict):
        """Placeholder para execução assíncrona real."""
        return self._execute_sync(workflow, variables)
    
    def _execute_step(self, step: dict, context: dict) -> Dict[str, Any]:
        """Executa um step do workflow."""
        skill_name = step['skill']
        action = step['action']
        params = step.get('params', {})
        
        # Interpolar variáveis nos parâmetros
        params = self._interpolate_variables(params, context)
        
        max_retries = step.get('retry', 0)
        retry_delay = step.get('retry_delay', 1)
        
        for attempt in range(max_retries + 1):
            try:
                if skill_name not in self.skill_manager.skills:
                    # Tenta carregar se não encontrou (via loader dinâmico)
                    if hasattr(self.skill_manager, 'load_all'):
                        self.skill_manager.load_all()
                    
                    if skill_name not in self.skill_manager.skills:
                        return {"success": False, "error": f"Skill '{skill_name}' não encontrada"}
                
                skill = self.skill_manager.skills[skill_name]
                
                # Executar ação
                if hasattr(skill, action):
                    method = getattr(skill, action)
                    # No motor Lobster, espera-se que a skill receba os params expandidos
                    if isinstance(params, dict):
                        result = method(**params)
                    else:
                        result = method(params)
                else:
                    # Método genérico execute
                    result = skill.execute(action=action, **params) if isinstance(params, dict) else skill.execute(action=action, params=params)
                
                if not isinstance(result, dict):
                    result = {"success": True, "data": result}
                
                if result.get('success', False) or attempt == max_retries:
                    return result
                
                if attempt < max_retries:
                    import time
                    time.sleep(retry_delay)
                    
            except Exception as e:
                if attempt == max_retries:
                    return {"success": False, "error": str(e)}
                import time
                time.sleep(retry_delay)
        
        return {"success": False, "error": "Retries excedidos"}
    
    def _interpolate_variables(self, params: Any, context: dict) -> Any:
        """Interpola variáveis usando Jinja2."""
        if isinstance(params, dict):
            return {k: self._interpolate_variables(v, context) for k, v in params.items()}
        elif isinstance(params, list):
            return [self._interpolate_variables(item, context) for item in params]
        elif isinstance(params, str):
            if "{{" in params or "{%" in params:
                try:
                    template = Template(params)
                    return template.render(**context)
                except Exception as e:
                    logger.warning(f"Erro de interpolação em '{params}': {e}")
            return params
        return params

if __name__ == "__main__":
    # Teste rápido de carga
    from skills.loader import get_skill_loader
    logging.basicConfig(level=logging.INFO)
    
    loader = get_skill_loader()
    lobster = LobsterWorkflow(loader)
    
    print(f"Workflows ativos: {list(lobster.workflows.keys())}")
