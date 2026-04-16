'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, Users, Edit, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Class {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  price: number;
  maxStudents?: number;
  status: string;
  blocks: any[];
  _count?: {
    enrollments: number;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    price: 0,
    maxStudents: null as number | null,
    blocks: [] as any[]
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar turmas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Turma criada com sucesso!');
        setShowForm(false);
        fetchClasses();
        setFormData({ name: '', description: '', startDate: '', endDate: '', price: 0, maxStudents: null, blocks: [] });
      } else {
        toast.error('Erro ao criar turma');
      }
    } catch (error) {
      toast.error('Erro ao criar turma');
    } finally {
      setIsLoading(false);
    }
  };

  const addBlock = () => {
    setFormData({
      ...formData,
      blocks: [...formData.blocks, { name: '', description: '', startDate: '', price: 0 }]
    });
  };

  const statusLabels: any = {
    draft: 'Rascunho',
    active: 'Ativa',
    completed: 'Concluída',
    cancelled: 'Cancelada'
  };

  const statusColors: any = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  if (isLoading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 size={48} className="animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Turmas e Blocos</h1>
          <p className="text-gray-600">Gerencie suas turmas, blocos e valores</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Nova Turma
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Nome da Turma *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Início *</label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Data de Término</label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Vagas Máximas</label>
              <input
                type="number"
                value={formData.maxStudents || ''}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Ilimitado"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Blocos</h3>
              <button
                type="button"
                onClick={addBlock}
                className="text-purple-600 hover:text-purple-700 text-sm font-semibold"
              >
                + Adicionar Bloco
              </button>
            </div>

            {formData.blocks.map((block, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nome do bloco"
                    value={block.name}
                    onChange={(e) => {
                      const newBlocks = [...formData.blocks];
                      newBlocks[index].name = e.target.value;
                      setFormData({ ...formData, blocks: newBlocks });
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Preço"
                    value={block.price}
                    onChange={(e) => {
                      const newBlocks = [...formData.blocks];
                      newBlocks[index].price = parseFloat(e.target.value);
                      setFormData({ ...formData, blocks: newBlocks });
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg"
                  />
                  <input
                    type="datetime-local"
                    value={block.startDate}
                    onChange={(e) => {
                      const newBlocks = [...formData.blocks];
                      newBlocks[index].startDate = e.target.value;
                      setFormData({ ...formData, blocks: newBlocks });
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Criar Turma'}
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {classes.map((classItem) => (
          <div key={classItem.id} className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold">{classItem.name}</h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[classItem.status]}`}>
                    {statusLabels[classItem.status]}
                  </span>
                </div>
                {classItem.description && (
                  <p className="text-gray-600 mb-3">{classItem.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Trash2 size={20} className="text-red-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Preço</div>
                <div className="text-xl font-bold text-purple-600">R$ {classItem.price.toFixed(2)}</div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Início</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date(classItem.startDate).toLocaleDateString('pt-BR')}
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Inscrições</div>
                <div className="text-lg font-semibold flex items-center gap-2">
                  <Users size={16} />
                  {classItem._count?.enrollments || 0}
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Vagas</div>
                <div className="text-lg font-semibold">
                  {classItem.maxStudents ? `${classItem.maxStudents}` : 'Ilimitado'}
                </div>
              </div>
            </div>

            {classItem.blocks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Blocos ({classItem.blocks.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {classItem.blocks.map((block) => (
                    <div key={block.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{block.name}</div>
                        <div className="text-green-600 font-bold">R$ {block.price.toFixed(2)}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Início: {new Date(block.startDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {classes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma turma cadastrada</h3>
            <p className="text-gray-600">Clique em "Nova Turma" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
}
