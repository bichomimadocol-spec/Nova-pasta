import React, { useState, useEffect } from 'react';
import { Produto } from '../../App';

interface ProdutoFormProps {
  initialData?: Produto | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export default function ProdutoForm({ initialData, onSubmit, onCancel }: ProdutoFormProps) {
  const [formData, setFormData] = useState<any>({
    tipo: 'Produto',
    nome: '',
    descricao: '',
    categoria: '',
    preco: '',
    ativo: true,
    controlaEstoque: false,
    estoqueAtual: '',
    estoqueMinimo: '',
    // New fields defaults
    finalidade: '',
    centroResultado: '',
    agrupamento: '',
    perfilComissao: '',
    curva: '',
    detalhesProduto: '',
    unidade: '',
    ncm: '',
    diasOportVenda: '',
    cest: '',
    marca: '',
    codigoBarras: '',
    custo: '',
    margemPercent: '',
    margemValor: '',
    perfilDesconto: '',
    estoqueIdeal: '',
    permiteEstoqueNegativo: false,
    localizacao: '',
    fatorCompra: '',
    fornecedores: '',
    observacao: '',
    validade: '',
    // Service specific fields
    duracao: '',
    horas: '',
    minutos: '',
    situacaoTributaria: '',
    impostoIss: '',
    // Plan specific fields
    tipoPlano: 'MENSALIDADE',
    textoContrato: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        preco: initialData.preco.toString(),
        estoqueAtual: initialData.estoqueAtual.toString(),
        estoqueMinimo: initialData.estoqueMinimo.toString(),
        // Ensure optional fields are strings if undefined
        finalidade: initialData.finalidade || '',
        centroResultado: initialData.centroResultado || '',
        agrupamento: initialData.agrupamento || '',
        perfilComissao: initialData.perfilComissao || '',
        curva: initialData.curva || '',
        detalhesProduto: initialData.detalhesProduto || '',
        unidade: initialData.unidade || '',
        ncm: initialData.ncm || '',
        diasOportVenda: initialData.diasOportVenda || '',
        cest: initialData.cest || '',
        marca: initialData.marca || '',
        codigoBarras: initialData.codigoBarras || '',
        custo: initialData.custo || '',
        margemPercent: initialData.margemPercent || '',
        margemValor: initialData.margemValor || '',
        perfilDesconto: initialData.perfilDesconto || '',
        estoqueIdeal: initialData.estoqueIdeal || '',
        permiteEstoqueNegativo: initialData.permiteEstoqueNegativo || false,
        localizacao: initialData.localizacao || '',
        fatorCompra: initialData.fatorCompra || '',
        fornecedores: initialData.fornecedores || '',
        observacao: initialData.observacao || '',
        validade: initialData.validade || '',
        duracao: initialData.duracao || '',
        horas: initialData.horas || '',
        minutos: initialData.minutos || '',
        situacaoTributaria: initialData.situacaoTributaria || '',
        impostoIss: initialData.impostoIss || '',
        tipoPlano: initialData.tipoPlano || 'MENSALIDADE',
        textoContrato: initialData.textoContrato || ''
      });
    }
  }, [initialData]);

  // Calculation Logic
  useEffect(() => {
    // Logic handled in handleChange to avoid loops and know source of change
  }, [formData.custo, formData.margemPercent, formData.preco]); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev: any) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculation logic
      if (name === 'custo' || name === 'margemPercent') {
        const custo = parseFloat(name === 'custo' ? value : prev.custo) || 0;
        const margem = parseFloat(name === 'margemPercent' ? value : prev.margemPercent) || 0;
        
        if (custo > 0) {
          const valorVenda = custo * (1 + margem / 100);
          const valorMargem = valorVenda - custo;
          newData.preco = valorVenda.toFixed(2);
          newData.margemValor = valorMargem.toFixed(2);
        } else {
          // If cost is <= 0, avoid weird calculations, maybe just keep price as is or reset margin
          if (name === 'custo') {
             newData.margemPercent = '0';
             newData.margemValor = '0';
          }
        }
      } else if (name === 'preco') {
        const preco = parseFloat(value) || 0;
        const custo = parseFloat(prev.custo) || 0;
        
        if (custo > 0) {
          const valorMargem = preco - custo;
          const percentMargem = (valorMargem / custo) * 100;
          newData.margemValor = valorMargem.toFixed(2);
          newData.margemPercent = percentMargem.toFixed(2);
        } else {
           newData.margemValor = preco.toFixed(2);
           newData.margemPercent = '0';
        }
      }

      return newData;
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    if (!formData.nome || !formData.preco) {
      alert('Nome e preço são obrigatórios');
      return;
    }

    onSubmit(formData);
  };

  const isProduto = formData.tipo === 'Produto';
  const isServico = formData.tipo === 'Serviço';
  const isPlano = formData.tipo === 'Plano';

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">{initialData ? 'Editar Item' : 'Novo Item'}</h3>
        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">{formData.tipo}</span>
      </div>
      
      {/* BLOCO 1 — Informações Gerais */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
          Informações Gerais
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select name="tipo" value={formData.tipo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option value="Produto">Produto</option>
              <option value="Serviço">Serviço</option>
              <option value="Plano">Plano</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input type="text" name="nome" value={formData.nome} onChange={handleChange} required className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" rows={2} />
          </div>
          
          {(isProduto || isServico || isPlano) && (
            <>
              {isProduto || isServico ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Finalidade</label>
                  <input type="text" name="finalidade" value={formData.finalidade} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Resultado</label>
                <input type="text" name="centroResultado" value={formData.centroResultado} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agrupamento</label>
                <input type="text" name="agrupamento" value={formData.agrupamento} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Comissão</label>
                <input type="text" name="perfilComissao" value={formData.perfilComissao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Curva ABC</label>
                <input type="text" name="curva" value={formData.curva} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
            </>
          )}
        </div>
      </div>

      {/* BLOCO — Detalhes do Produto (Only for Produto) */}
      {isProduto && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Detalhes do Produto
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <input type="text" name="unidade" value={formData.unidade} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NCM</label>
              <input type="text" name="ncm" value={formData.ncm} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias Oport. Venda</label>
              <input type="number" name="diasOportVenda" value={formData.diasOportVenda} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CEST</label>
              <input type="text" name="cest" value={formData.cest} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input type="text" name="marca" value={formData.marca} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Barras</label>
              <input type="text" name="codigoBarras" value={formData.codigoBarras} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 2 — Detalhes do Plano (Only for Plano) */}
      {isPlano && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Detalhes do Plano
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo do Plano</label>
              <select name="tipoPlano" value={formData.tipoPlano} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="MENSALIDADE">MENSALIDADE</option>
                <option value="CONSUMO">CONSUMO</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 3 — Composição do Plano (Only for Plano) */}
      {isPlano && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Composição do Plano
          </h4>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-sm mb-4">Nenhum item adicionado à composição.</p>
            <button type="button" disabled className="px-4 py-2 border border-gray-300 rounded-md text-gray-400 bg-gray-100 cursor-not-allowed">
              Editar Composição
            </button>
          </div>
        </div>
      )}

      {/* BLOCO — Precificação (Produto, Serviço, Plano) */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
          Precificação
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
          {(isProduto || isServico || isPlano) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo (R$)</label>
                <input type="number" name="custo" value={formData.custo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">% Margem</label>
                <input type="number" name="margemPercent" value={formData.margemPercent} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">R$ Margem</label>
                <input type="number" name="margemValor" value={formData.margemValor} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 bg-gray-100" readOnly />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venda (R$)</label>
            <input type="number" name="preco" value={formData.preco} onChange={handleChange} required className="w-full border border-indigo-300 rounded-md p-2 font-bold text-indigo-700 text-lg" />
          </div>
          {(isProduto || isServico || isPlano) && (
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de Desconto</label>
              <input type="text" name="perfilDesconto" value={formData.perfilDesconto} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          )}
        </div>
      </div>

      {/* BLOCO 3 — Detalhes do Serviço (Only for Serviço) */}
      {isServico && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Detalhes do Serviço
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias Oport. Venda</label>
              <input type="number" name="diasOportVenda" value={formData.diasOportVenda} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
              <input type="text" name="duracao" value={formData.duracao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="Ex: 30 min" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
                <input type="number" name="horas" value={formData.horas} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Minutos</label>
                <input type="number" name="minutos" value={formData.minutos} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Situação Tributária ECF</label>
              <input type="text" name="situacaoTributaria" value={formData.situacaoTributaria} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imposto ISS</label>
              <input type="text" name="impostoIss" value={formData.impostoIss} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        </div>
      )}

      {/* BLOCO D — Estoque (Only for Produto) */}
      {isProduto && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Estoque
          </h4>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input type="checkbox" name="controlaEstoque" checked={formData.controlaEstoque} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
              <span className="ml-2 font-medium text-gray-700">Controlar Estoque</span>
            </label>
          </div>
          {formData.controlaEstoque && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                <input type="number" name="estoqueAtual" value={formData.estoqueAtual} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo</label>
                <input type="number" name="estoqueMinimo" value={formData.estoqueMinimo} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Ideal</label>
                <input type="number" name="estoqueIdeal" value={formData.estoqueIdeal} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                <input type="text" name="localizacao" value={formData.localizacao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div className="md:col-span-4">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="permiteEstoqueNegativo" checked={formData.permiteEstoqueNegativo} onChange={handleCheckboxChange} className="form-checkbox h-4 w-4 text-indigo-600 rounded" />
                  <span className="ml-2 text-sm text-gray-700">Permite Estoque Negativo</span>
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BLOCO E — Compras (Only for Produto) */}
      {isProduto && (
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
            Compras
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fator de Compra</label>
              <input type="text" name="fatorCompra" value={formData.fatorCompra} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedores</label>
              <input type="text" name="fornecedores" value={formData.fornecedores} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="Ex: Fornecedor A, Fornecedor B" />
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 4 — Formulários / Outros */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-indigo-700 mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
          {isPlano ? 'Texto do Contrato' : 'Formulários'}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isPlano ? (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Texto do Contrato</label>
              <textarea name="textoContrato" value={formData.textoContrato} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500" rows={6} />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <input type="text" name="observacao" value={formData.observacao} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
              </div>
              {isProduto && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validade</label>
                  <input type="date" name="validade" value={formData.validade} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" name="ativo" checked={formData.ativo} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-indigo-600 rounded" />
          <span className="ml-2 font-medium text-gray-800">Cadastro Ativo</span>
        </label>
      </div>

      <div className="flex justify-end gap-4 border-t pt-6">
        <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">
          Cancelar
        </button>
        <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm font-medium">
          Salvar
        </button>
      </div>
    </form>
  );
}
