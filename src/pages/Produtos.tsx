import React, { useState, useEffect } from 'react';
import { Produto } from '../App';
import ProdutoList from '../components/produtos/ProdutoList';
import ProdutoForm from '../components/produtos/ProdutoForm';

interface ProdutosProps {
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
}

export default function Produtos({ produtos, setProdutos }: ProdutosProps) {
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  useEffect(() => {
    const loadProdutos = async () => {
      try {
        const response = await fetch('/api/produtos');
        if (response.ok) {
          const data = await response.json();
          setProdutos(data.map((p: any) => ({
            ...p,
            tipo: 'Produto',
            descricao: '',
            ativo: true,
            controlaEstoque: true,
            estoqueAtual: p.estoque,
            estoqueMinimo: 0,
            dataCadastro: new Date().toLocaleDateString(),
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    };
    loadProdutos();
  }, [setProdutos]);

  const handleCreate = async (data: any) => {
    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: data.nome,
          categoria: data.categoria || '',
          preco: Number(data.preco),
          estoque: Number(data.estoqueAtual || 0)
        }),
      });
      const dataResponse = await response.json();
      console.log('RESPOSTA_API_PRODUTOS', response.status, dataResponse);
      if (response.ok) {
        const novoProduto = dataResponse;
        setProdutos(prev => [...prev, {
          ...novoProduto,
          tipo: 'Produto',
          descricao: '',
          ativo: true,
          controlaEstoque: true,
          estoqueAtual: novoProduto.estoque,
          estoqueMinimo: 0,
          dataCadastro: new Date().toLocaleDateString(),
        }]);
        setIsFormVisible(false);
      } else {
        console.error('Erro ao criar produto');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    }
  };

  const handleUpdate = (data: any) => {
    if (!editingProduto) return;
    setProdutos(prev => prev.map(p => p.id === editingProduto.id ? {
      ...p,
      ...data,
      preco: Number(data.preco),
      estoqueAtual: Number(data.estoqueAtual || 0),
      estoqueMinimo: Number(data.estoqueMinimo || 0),
    } : p));
    setEditingProduto(null);
    setIsFormVisible(false);
  };

  const handleDelete = (id: number) => {
    setProdutos(prev => prev.filter(p => p.id !== id));
    if (editingProduto?.id === id) {
      setEditingProduto(null);
      setIsFormVisible(false);
    }
  };

  const startEdit = (produto: Produto) => {
    setEditingProduto(produto);
    setIsFormVisible(true);
    // Scroll to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const startCreate = () => {
    setEditingProduto(null);
    setIsFormVisible(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Produtos e Serviços</h1>
          <p className="text-sm text-gray-500">Gerencie seu catálogo de itens</p>
        </div>
        
        {!isFormVisible && (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 shadow-sm text-sm font-medium">
              Exportar
            </button>
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded hover:bg-gray-50 shadow-sm text-sm font-medium">
              Opções
            </button>
            <button 
              onClick={startCreate}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 shadow-sm flex items-center gap-2 text-sm font-medium"
            >
              <span>+</span> Adicionar Produto
            </button>
          </div>
        )}
      </div>

      {!isFormVisible ? (
        <ProdutoList 
          produtos={produtos} 
          onEdit={startEdit} 
          onDelete={handleDelete} 
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-1">
          <ProdutoForm 
            initialData={editingProduto} 
            onSubmit={editingProduto ? handleUpdate : handleCreate} 
            onCancel={() => { setIsFormVisible(false); setEditingProduto(null); }} 
          />
        </div>
      )}
    </div>
  );
}
