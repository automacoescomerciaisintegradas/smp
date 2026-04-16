"""
Skill Loader Universal para Cleudocode
======================================

Carrega skills da nova estrutura de diretórios, suportando:
- SKILL.md com YAML frontmatter
- Hot-reload
- Descoberta automática por categoria
- Validação de requisitos

Autor: Cleudocode Team
Data: 02/02/2026
"""

import os
import sys
import importlib.util
import logging
import re
from pathlib import Path
from typing import Dict, List, Optional, Type, Any

# Tenta importar yaml, fallback para parse manual se não disponível
try:
    import yaml
    HAS_YAML = True
except ImportError:
    HAS_YAML = False
    
from skills.base import BaseSkill

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Diretórios de skills
SKILLS_ROOT = Path(__file__).parent
CATEGORIES = ['builtin', 'productivity', 'ai_models', 'automation', 'media', 'utilities']


class SkillMetadata:
    """Metadados de uma skill extraídos do SKILL.md"""
    
    def __init__(self):
        self.name: str = ""
        self.description: str = ""
        self.emoji: str = "🔧"
        self.category: str = "builtin"
        self.homepage: str = ""
        self.requires: Dict[str, Any] = {}
        self.install: List[Dict] = []
    
    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "description": self.description,
            "emoji": self.emoji,
            "category": self.category,
            "homepage": self.homepage,
            "requires": self.requires,
            "install": self.install
        }


def parse_yaml_frontmatter(content: str) -> dict:
    """Parse do YAML frontmatter de um arquivo markdown."""
    match = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    
    yaml_content = match.group(1)
    
    if HAS_YAML:
        try:
            return yaml.safe_load(yaml_content) or {}
        except Exception as e:
            logger.warning(f"Erro ao parsear YAML: {e}")
            return {}
    else:
        # Parse manual básico para quando yaml não está disponível
        result = {}
        current_key = None
        for line in yaml_content.split('\n'):
            if ':' in line and not line.startswith(' '):
                parts = line.split(':', 1)
                if len(parts) == 2:
                    key, value = parts
                    key = key.strip()
                    value = value.strip().strip('"\'')
                    if value:
                        result[key] = value
                    else:
                        result[key] = {}
                    current_key = key
        return result


class SkillLoader:
    """
    Carregador universal de skills para Cleudocode.
    
    Suporta:
    - Descoberta automática de skills em todas as categorias
    - Parse de SKILL.md para metadados
    - Hot-reload de skills individuais
    - Validação de requisitos (bins, env vars)
    """
    
    def __init__(self, skills_root: Optional[Path] = None):
        self.skills_root = skills_root or SKILLS_ROOT
        self.skills: Dict[str, BaseSkill] = {}
        self.metadata_cache: Dict[str, SkillMetadata] = {}
        self._file_timestamps: Dict[str, float] = {}
    
    def discover_skills(self) -> List[Path]:
        """
        Descobre todas as skills disponíveis.
        
        Returns:
            Lista de caminhos para diretórios de skills
        """
        skill_paths = []
        
        for category in CATEGORIES:
            category_dir = self.skills_root / category
            if not category_dir.exists():
                continue
            
            for skill_dir in category_dir.iterdir():
                if skill_dir.is_dir():
                    # Verifica se tem SKILL.md ou arquivo de implementação
                    has_skill_md = (skill_dir / "SKILL.md").exists()
                    has_impl = any(
                        (skill_dir / f).exists() 
                        for f in [f"{skill_dir.name}_skill.py", "skill.py", "__init__.py"]
                    )
                    
                    if has_skill_md or has_impl:
                        skill_paths.append(skill_dir)
        
        return skill_paths
    
    def parse_skill_metadata(self, skill_dir: Path) -> SkillMetadata:
        """
        Parse do SKILL.md para extrair metadados.
        
        Args:
            skill_dir: Diretório da skill
            
        Returns:
            SkillMetadata com os dados extraídos
        """
        metadata = SkillMetadata()
        metadata.name = skill_dir.name
        
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.exists():
            return metadata
        
        try:
            content = skill_md.read_text(encoding='utf-8')
            frontmatter = parse_yaml_frontmatter(content)
            
            metadata.name = frontmatter.get('name', skill_dir.name)
            metadata.description = frontmatter.get('description', '')
            metadata.homepage = frontmatter.get('homepage', '')
            
            # Metadados específicos do Cleudocode
            cleudo_meta = frontmatter.get('metadata', {}).get('cleudocode', {})
            metadata.emoji = cleudo_meta.get('emoji', '🔧')
            metadata.category = cleudo_meta.get('category', 'builtin')
            metadata.requires = cleudo_meta.get('requires', {})
            metadata.install = cleudo_meta.get('install', [])
            
        except Exception as e:
            logger.warning(f"Erro ao parsear SKILL.md em {skill_dir}: {e}")
        
        return metadata
    
    def load_skill(self, skill_dir: Path) -> Optional[BaseSkill]:
        """
        Carrega uma skill específica.
        
        Args:
            skill_dir: Diretório da skill
            
        Returns:
            Instância de BaseSkill ou None se falhar
        """
        metadata = self.parse_skill_metadata(skill_dir)
        skill_name = metadata.name
        
        # Procura pelo arquivo de implementação
        skill_file = None
        for pattern in [f"{skill_dir.name}_skill.py", "skill.py", "__init__.py"]:
            candidate = skill_dir / pattern
            if candidate.exists() and not candidate.is_dir():
                skill_file = candidate
                break
        
        if not skill_file:
            logger.debug(f"Skill {skill_name} não tem implementação Python (apenas SKILL.md)")
            return None
        
        try:
            # Importa o módulo (ajusta o path para importação relativa se necessário)
            parent_dir = str(self.skills_root.parent)
            if parent_dir not in sys.path:
                sys.path.append(parent_dir)

            module_name = f"skills.{skill_dir.parent.name}.{skill_dir.name}"
            
            # Remove módulo antigo do cache se existir (para hot-reload)
            if module_name in sys.modules:
                del sys.modules[module_name]
            
            # Importa o módulo
            spec = importlib.util.spec_from_file_location(module_name, skill_file)
            if spec is None or spec.loader is None:
                raise ImportError(f"Não foi possível criar spec para {skill_file}")
            
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_name] = module
            spec.loader.exec_module(module)
            
            # Procura pela classe de skill
            skill_class = None
            for attr_name in dir(module):
                attr = getattr(module, attr_name)
                if (isinstance(attr, type) and 
                    issubclass(attr, BaseSkill) and 
                    attr != BaseSkill):
                    skill_class = attr
                    break
            
            if skill_class is None:
                raise ValueError(f"Classe de skill não encontrada em: {skill_file}")
            
            # Instancia a skill
            skill = skill_class()
            
            # Atualiza metadados
            skill.metadata = metadata
            skill.name = metadata.name
            skill.description = metadata.description
            
            # Registra timestamp para hot-reload
            self._file_timestamps[skill_name] = skill_file.stat().st_mtime
            
            return skill
            
        except Exception as e:
            logger.error(f"Erro ao carregar skill {skill_name}: {e}")
            return None
    
    def load_all(self) -> Dict[str, BaseSkill]:
        """
        Carrega todas as skills disponíveis.
        
        Returns:
            Dicionário de skills carregadas {nome: instância}
        """
        skill_dirs = self.discover_skills()
        loaded_count = 0
        skipped_count = 0
        
        for skill_dir in skill_dirs:
            metadata = self.parse_skill_metadata(skill_dir)
            self.metadata_cache[metadata.name] = metadata
            
            skill = self.load_skill(skill_dir)
            if skill:
                self.skills[skill.name] = skill
                logger.info(f"✅ Skill carregada: {metadata.emoji} {skill.name}")
                loaded_count += 1
            else:
                skipped_count += 1
        
        logger.info(f"📦 Skills carregadas: {loaded_count} | Apenas docs: {skipped_count}")
        return self.skills
    
    def reload_skill(self, skill_name: str) -> bool:
        """
        Recarrega uma skill específica (hot-reload).
        
        Args:
            skill_name: Nome da skill a recarregar
            
        Returns:
            True se recarregou com sucesso
        """
        for skill_dir in self.discover_skills():
            metadata = self.parse_skill_metadata(skill_dir)
            if metadata.name == skill_name:
                skill = self.load_skill(skill_dir)
                if skill:
                    self.skills[skill_name] = skill
                    self.metadata_cache[skill_name] = metadata
                    logger.info(f"🔄 Skill recarregada: {skill_name}")
                    return True
                break
        
        logger.warning(f"Skill não encontrada para reload: {skill_name}")
        return False
    
    def check_for_changes(self) -> List[str]:
        """
        Verifica se alguma skill foi modificada.
        
        Returns:
            Lista de nomes de skills que foram modificadas
        """
        changed = []
        for skill_name, old_timestamp in self._file_timestamps.items():
            if skill_name not in self.skills:
                continue
            
            skill_dir = None
            for sdir in self.discover_skills():
                if self.parse_skill_metadata(sdir).name == skill_name:
                    skill_dir = sdir
                    break
            
            if skill_dir:
                for pattern in [f"{skill_dir.name}_skill.py", "skill.py"]:
                    skill_file = skill_dir / pattern
                    if skill_file.exists():
                        new_timestamp = skill_file.stat().st_mtime
                        if new_timestamp > old_timestamp:
                            changed.append(skill_name)
                        break
        
        return changed
    
    def auto_reload_changed(self) -> int:
        """
        Recarrega automaticamente skills que foram modificadas.
        
        Returns:
            Número de skills recarregadas
        """
        changed = self.check_for_changes()
        for skill_name in changed:
            self.reload_skill(skill_name)
        return len(changed)
    
    def get_skill(self, name: str) -> Optional[BaseSkill]:
        """Obtém uma skill pelo nome."""
        return self.skills.get(name)
    
    def get_metadata(self, name: str) -> Optional[SkillMetadata]:
        """Obtém metadados de uma skill pelo nome."""
        return self.metadata_cache.get(name)
    
    def list_skills(self) -> List[dict]:
        """
        Lista todas as skills com metadados.
        
        Returns:
            Lista de dicionários com info das skills
        """
        result = []
        
        # Skills carregadas (com implementação)
        for name, skill in self.skills.items():
            reqs_met = True
            if hasattr(skill, 'check_requirements'):
                reqs_met = all(skill.check_requirements().values())
            
            result.append({
                "name": name,
                "description": skill.description,
                "emoji": skill.metadata.emoji if hasattr(skill, 'metadata') else "🔧",
                "category": skill.metadata.category if hasattr(skill, 'metadata') else "builtin",
                "has_implementation": True,
                "requirements_met": reqs_met
            })
        
        # Skills apenas com documentação
        for name, metadata in self.metadata_cache.items():
            if name not in self.skills:
                result.append({
                    "name": name,
                    "description": metadata.description,
                    "emoji": metadata.emoji,
                    "category": metadata.category,
                    "has_implementation": False,
                    "requirements_met": None
                })
        
        return sorted(result, key=lambda x: (x["category"], x["name"]))


# Instância global (singleton)
_global_loader: Optional[SkillLoader] = None


def get_skill_loader() -> SkillLoader:
    """Obtém a instância global do SkillLoader."""
    global _global_loader
    if _global_loader is None:
        _global_loader = SkillLoader()
        _global_loader.load_all()
    return _global_loader


def reset_skill_loader():
    """Reseta o loader global (útil para testes)."""
    global _global_loader
    _global_loader = None


# Funções de conveniência
def load_all_skills() -> Dict[str, BaseSkill]:
    """Carrega todas as skills."""
    return get_skill_loader().load_all()


def get_skill(name: str) -> Optional[BaseSkill]:
    """Obtém uma skill pelo nome."""
    return get_skill_loader().get_skill(name)


def list_skills() -> List[dict]:
    """Lista todas as skills."""
    return get_skill_loader().list_skills()


def reload_skill(name: str) -> bool:
    """Recarrega uma skill específica."""
    return get_skill_loader().reload_skill(name)


# Para testes diretos
if __name__ == "__main__":
    import sys
    # Tenta configurar stdout para utf-8 no Windows
    try:
        if sys.platform == "win32":
            import os
            os.system('chcp 65001 > nul')
    except:
        pass

    print("\n=== Testando SkillLoader Universal ===\n")
    
    loader = SkillLoader()
    
    # Descobrir skills
    print("Listing skills...")
    skill_dirs = loader.discover_skills()
    print(f"   Found: {len(skill_dirs)} skills\n")
    
    for sd in skill_dirs:
        meta = loader.parse_skill_metadata(sd)
        print(f"   [{meta.emoji}] {meta.name}: {meta.description[:50]}...")
    
    print("\nLoading skills...")
    skills = loader.load_all()
    
    print(f"\nActive Skills: {len(skills)}")
    for info in loader.list_skills():
        status = "LOADED" if info["has_implementation"] else "DOCS"
        print(f"   [{status}] {info['emoji']} {info['name']} ({info['category']})")
    
    print("\nLoader Ready!")
