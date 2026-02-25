import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PaymentMethodSelector from '../components/pagamentos/PaymentMethodSelector';
import { Agendamento, Cliente, Pet, Contrato, Produto, OperadoraCartao } from '../App';

export interface ItemAtendimento {
  id: string;
  tipo: 'SERVICO' | 'PRODUTO';
  servicoId?: number;
  produtoId?: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  totalLinha: number;
  observacao?: string;
}

export interface ItemPagamento {
  id: string;
  forma: 'DINHEIRO' | 'PIX' | 'DEBITO' | 'CREDITO' | 'HAVER' | 'CREDIARIO';
  valor: number;
  observacao?: string;
  dataHora?: string;
}

// --- AGENDA DAY VIEW COMPONENT ---
interface AgendaDayViewProps {
  date: Date;
  filteredAgendamentos: Agendamento[];
  pets: Pet[];
  clientes: Cliente[];
  selectedIds: number[];
  onSlotClick: (date: Date, time: string) => void;
  onEditClick: (agendamento: Agendamento, e: React.MouseEvent) => void;
  onCheckboxChange: (id: number, checked: boolean) => void;
  onStatusChange: (id: number, status: string) => void;
  onStatusCycle: (agendamento: Agendamento, e: React.MouseEvent) => void;
  onStatusCancel: (agendamento: Agendamento, e: React.MouseEvent) => void;
  onBatchAction: (action: 'CANCELAR' | 'REAGENDAR' | 'COMANDA') => void;
  onSelectAll: (ids: number[], checked: boolean) => void;
}

const AgendaDayView: React.FC<AgendaDayViewProps> = ({
  date,
  filteredAgendamentos,
  pets,
  clientes,
  selectedIds,
  onSlotClick,
  onEditClick,
  onCheckboxChange,
  onStatusChange,
  onStatusCycle,
  onStatusCancel,
  onBatchAction,
  onSelectAll
}) => {
  const [showActionMenu, setShowActionMenu] = useState(false);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const dayAgendamentos = useMemo(() => {
    const dateStr = formatDate(date);
    return filteredAgendamentos.filter(a => a.dataInicio.startsWith(dateStr));
  }, [filteredAgendamentos, date]);

  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${h < 10 ? '0' + h : h}:00`);
    if (h < 18) slots.push(`${h < 10 ? '0' + h : h}:30`);
  }

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-sm overflow-hidden relative min-h-[400px]">
      {/* Floating Action Button for Selection */}
      {selectedIds.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30">
            <div className="relative">
                <button 
                    onClick={() => setShowActionMenu(!showActionMenu)}
                    className="w-12 h-12 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                {showActionMenu && (
                    <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border w-48 py-2 z-30">
                        <button onClick={() => { onBatchAction('REAGENDAR'); setShowActionMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">Reagendamento</button>
                        <button onClick={() => { onBatchAction('COMANDA'); setShowActionMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">Comanda de Atendimento</button>
                        <button onClick={() => { onBatchAction('CANCELAR'); setShowActionMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-red-600">Cancelamento</button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Header Row */}
      <div className="flex bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase py-3">
        <div className="w-12 text-center">
          <input 
              type="checkbox" 
              onChange={(e) => {
                  const ids = dayAgendamentos.map(a => a.id);
                  onSelectAll(ids, e.target.checked);
              }}
          />
        </div>
        <div className="w-20 pl-2">Horário</div>
        <div className="flex-1 pl-2">Pet | Cliente</div>
        <div className="flex-1 pl-2">Detalhes</div>
        <div className="w-32 pl-2">Profissional</div>
        <div className="w-24 text-right pr-4">Valor</div>
        <div className="w-24 text-center">Financeiro</div>
        <div className="w-40 text-center pr-2">Situação</div>
      </div>

      {/* Slots */}
      {slots.map(time => {
        const appsInSlot = dayAgendamentos.filter(a => {
          const d = new Date(a.dataInicio);
          const h = d.getHours();
          const m = d.getMinutes();
          const timeStr = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
          return timeStr === time;
        });

        // Empty slot
        if (appsInSlot.length === 0) {
          return (
            <div 
              key={time} 
              className="flex items-center py-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer text-sm text-gray-400"
              onClick={() => onSlotClick(date, time)}
            >
              <div className="w-12 text-center"><input type="checkbox" disabled /></div>
              <div className="w-20 pl-2 font-mono">{time}</div>
              <div className="flex-1 pl-2 opacity-30">—</div>
              <div className="flex-1 pl-2 opacity-30">—</div>
              <div className="w-32 pl-2 opacity-30">—</div>
              <div className="w-24 text-right pr-4 opacity-30">—</div>
              <div className="w-24 text-center opacity-30">—</div>
              <div className="w-40 text-center pr-2 opacity-30">—</div>
            </div>
          );
        }

        // Occupied slot(s)
        return appsInSlot.map(app => (
          <div 
            key={app.id} 
            className={`flex items-center py-3 border-b last:border-b-0 hover:bg-indigo-50 cursor-pointer text-sm ${selectedIds.includes(app.id) ? 'bg-indigo-50' : ''}`}
            onClick={(e) => onEditClick(app, e)}
          >
            <div className="w-12 text-center" onClick={(e) => e.stopPropagation()}>
              <input 
                  type="checkbox" 
                  checked={selectedIds.includes(app.id)}
                  onChange={(e) => onCheckboxChange(app.id, e.target.checked)}
              />
            </div>
            <div className="w-20 pl-2 font-mono font-bold text-indigo-700">{time}</div>
            <div className="flex-1 pl-2 font-medium text-gray-900">
              {pets.find(p => p.id === app.petId)?.nome || 'Pet?'} <span className="text-gray-500 font-normal">| {clientes.find(c => c.id === app.clienteId)?.nome || 'Cliente?'}</span>
            </div>
            <div className="flex-1 pl-2 text-gray-600 truncate">
              {app.origemServico === 'PLANO' ? <span className="text-purple-600 font-bold mr-1">[P]</span> : ''}
              {app.servico}
            </div>
            <div className="w-32 pl-2 text-gray-500 truncate">—</div>
            <div className="w-24 text-right pr-4 font-mono text-gray-700">R$ {app.valor?.toFixed(2)}</div>
            <div className="w-24 text-center">
              <span className={`w-3 h-3 rounded-full inline-block ${app.status === 'CHECKOUT' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            </div>
            <div className="w-40 text-center pr-2" onClick={(e) => e.stopPropagation()}>
              <select 
                  value={app.status}
                  onChange={(e) => onStatusChange(app.id, e.target.value)}
                  className={`text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer border-0 ${
                      app.status === 'AGENDADO' ? 'bg-blue-100 text-blue-800' :
                      app.status === 'CHECKIN' ? 'bg-yellow-100 text-yellow-800' :
                      app.status === 'PRONTO' ? 'bg-purple-100 text-purple-800' :
                      app.status === 'CHECKOUT' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                  }`}
              >
                  <option value="AGENDADO">AGENDADO</option>
                  <option value="CHECKIN">CHECKIN</option>
                  <option value="PRONTO">PRONTO</option>
                  <option value="CHECKOUT">CHECKOUT</option>
                  <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
          </div>
        ));
      })}
    </div>
  );
};

interface AgendaProps {
  agendamentos: Agendamento[];
  setAgendamentos: React.Dispatch<React.SetStateAction<Agendamento[]>>;
  clientes: Cliente[];
  pets: Pet[];
  contratos?: Contrato[];
  produtos?: Produto[];
  operadorasCartao?: OperadoraCartao[];
  onIntegrarFinanceiro?: (agendamento: Agendamento, operadoraId?: number) => void;
}

type ViewType = 'DIA' | 'SEMANA' | 'MES';

export default function Agenda({ 
  agendamentos: propAgendamentos, 
  setAgendamentos: propSetAgendamentos, 
  clientes, 
  pets, 
  contratos = [], 
  produtos = [], 
  operadorasCartao = [], 
  onIntegrarFinanceiro 
}: AgendaProps) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('DIA');
  const [filterStatus, setFilterStatus] = useState<string>('TODAS');
  const [selectedDayInMonth, setSelectedDayInMonth] = useState<Date | null>(null);
  
  // Sync local state with props
  useEffect(() => {
    setAgendamentos(propAgendamentos);
  }, [propAgendamentos]);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Carregar agendamentos da API
  useEffect(() => {
    const loadAgendamentos = async () => {
      try {
        const response = await fetch('/api/agendamentos');
        if (response.ok) {
          const data = await response.json();
          setAgendamentos(data);
        } else {
          console.error('Erro ao carregar agendamentos:', response.statusText);
        }
      } catch (error) {
        console.error('Erro de conexão ao carregar agendamentos:', error);
      }
    };
    loadAgendamentos();
  }, []);

  // Estados para serviços e planos
  const [servicos, setServicos] = useState<any[]>([]);
  const [planos, setPlanos] = useState<any[]>([]);

  // Carregar serviços
  useEffect(() => {
    const loadServicos = async () => {
      const response = await fetch('/api/produtos'); // rota correta de produtos/serviços
      const data = await response.json();
      console.log('SERVICOS_API', data);

      const servicosFiltrados = data.filter((item: any) => {
        // ajuste esse filtro de acordo com seu modelo
        return item.tipo === 'Serviço';
      });

      setServicos(servicosFiltrados);
    };

    loadServicos();
  }, []);

  // Carregar planos
  useEffect(() => {
    const loadPlanos = async () => {
      try {
        const response = await fetch('/api/produtos');
        if (response.ok) {
          const data = await response.json();
          const planosFiltrados = data.filter((item: any) => item.tipo === 'Plano');
          setPlanos(planosFiltrados);
        } else {
          console.error('Erro ao carregar planos:', response.statusText);
        }
      } catch (error) {
        console.error('Erro de conexão ao carregar planos:', error);
      }
    };
    loadPlanos();
  }, []);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Modal/Panel State
  const [showModal, setShowModal] = useState(false);
  const [showCheckoutPanel, setShowCheckoutPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'EDIT' | 'CHECKOUT'>('EDIT');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<Partial<Agendamento>>({
    clienteId: 0,
    petId: 0,
    servico: '',
    dataInicio: '',
    dataFim: '',
    status: 'AGENDADO',
    observacao: '',
    valor: 0,
    origemServico: 'AVULSO',
    planoId: undefined,
    planoItemId: undefined,
    servicoId: undefined,
    servicoNome: '',
    planoConsumoPendente: false
  });

  const [checkoutData, setCheckoutData] = useState({
    formaPagamento: 'DINHEIRO',
    operadoraId: 0,
    desconto: 0,
    valorRecebido: 0,
    observacoesFinanceiro: ''
  });

  // NEW CHECKOUT STATE
  const [checkoutSession, setCheckoutSession] = useState<{
    itens: ItemAtendimento[];
    pagamentos: ItemPagamento[];
    desconto: number;
    observacoes: string;
    error?: string;
    success?: string;
  }>({ itens: [], pagamentos: [], desconto: 0, observacoes: '' });

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [addItemForm, setAddItemForm] = useState<{
    tipo: 'SERVICO' | 'PRODUTO';
    itemId: string;
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    observacao: string;
  }>({ tipo: 'SERVICO', itemId: '', descricao: '', quantidade: 1, valorUnitario: 0, observacao: '' });

  const [usarServicoManual, setUsarServicoManual] = useState(false);

  // --- SCROLL TO TOP REFS ---
  const modalRef = useRef<HTMLDivElement>(null);
  const checkoutLeftRef = useRef<HTMLDivElement>(null);
  const checkoutRightRef = useRef<HTMLDivElement>(null);
  const addItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showModal && modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [showModal]);

  useEffect(() => {
    if (showCheckoutPanel) {
      if (checkoutLeftRef.current) checkoutLeftRef.current.scrollTop = 0;
      if (checkoutRightRef.current) checkoutRightRef.current.scrollTop = 0;
    }
  }, [showCheckoutPanel]);

  useEffect(() => {
    if (showAddItemModal && addItemRef.current) {
      addItemRef.current.scrollTop = 0;
    }
  }, [showAddItemModal]);

  // --- HELPERS ---

  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${h < 10 ? '0' + h : h}:00`);
    if (h < 18) slots.push(`${h < 10 ? '0' + h : h}:30`);
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const getStartOfWeek = (date: Date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day; // Sunday start
    result.setDate(diff);
    return result;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getStartOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  // --- HANDLERS ---

  const handlePrev = () => {
    if (view === 'DIA') setCurrentDate(addDays(currentDate, -1));
    else if (view === 'SEMANA') setCurrentDate(addDays(currentDate, -7));
    else if (view === 'MES') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNext = () => {
    if (view === 'DIA') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'SEMANA') setCurrentDate(addDays(currentDate, 7));
    else if (view === 'MES') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    if (view === 'MES') setSelectedDayInMonth(today);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const [year, month, day] = e.target.value.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      setCurrentDate(newDate);
      if (view === 'MES') setSelectedDayInMonth(newDate);
    }
  };

  const handleSlotClick = (date: Date, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const start = new Date(date);
    start.setHours(hours, minutes, 0, 0);
    
    const toLocalISO = (d: Date) => {
      const pad = (n: number) => n < 10 ? '0' + n : n;
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const end = new Date(start);
    if (hours === 18 && minutes === 0) {
        // Default end same as start for 18:00 slot (or user adjusts)
    } else {
        end.setMinutes(end.getMinutes() + 30);
    }

    setFormData({
      clienteId: 0,
      petId: 0,
      servico: '',
      dataInicio: toLocalISO(start),
      dataFim: toLocalISO(end),
      status: 'AGENDADO',
      observacao: '',
      valor: 0,
      origemServico: 'AVULSO',
      planoId: undefined,
      planoItemId: undefined,
      servicoId: undefined,
      servicoNome: '',
      planoConsumoPendente: false
    });
    setEditingId(null);
    setUsarServicoManual(false);
    setShowModal(true);
  };

  const handleEditClick = (agendamento: Agendamento, e: React.MouseEvent) => {
    setFormData({
      ...agendamento,
      origemServico: agendamento.origemServico || 'AVULSO'
    });
    setEditingId(agendamento.id);

    // Initialize Checkout Session
    const agendamentoAny = agendamento as any;
    const itens = agendamentoAny.itensAtendimento && agendamentoAny.itensAtendimento.length > 0 
        ? agendamentoAny.itensAtendimento 
        : [{
            id: Date.now().toString(),
            tipo: 'SERVICO',
            servicoId: agendamento.servicoId,
            descricao: agendamento.servico,
            quantidade: 1,
            valorUnitario: agendamento.valor || 0,
            totalLinha: agendamento.valor || 0
        }];
    
    const pagamentos = agendamentoAny.pagamentos || [];

    setCheckoutSession({
      itens,
      pagamentos,
      desconto: agendamento.desconto || 0,
      observacoes: agendamento.observacoesFinanceiro || '',
      error: undefined
    });

    setCheckoutData({
      formaPagamento: agendamento.formaPagamento || 'DINHEIRO',
      operadoraId: 0,
      desconto: agendamento.desconto || 0,
      valorRecebido: agendamento.valorTotal || agendamento.valor || 0,
      observacoesFinanceiro: agendamento.observacoesFinanceiro || ''
    });

    // Determine mode based on status
    if (agendamento.status === 'CHECKOUT' || agendamento.status === 'CANCELADO') {
        setPanelMode('EDIT');
    } else {
        setPanelMode('CHECKOUT');
    }

    setShowCheckoutPanel(true);
  };

  const handlePaymentComplete = (transacao: any) => {
      if (!editingId) return;

      const novoPagamento = {
          id: transacao.id,
          tipo: transacao.tipo,
          valor: transacao.valor,
          data: new Date().toISOString()
      };
      
      // Update local state
      const updatedPagamentos = [...checkoutSession.pagamentos, novoPagamento];
      
      const updatedAgendamento = {
        ...formData,
        id: editingId,
        status: 'CHECKOUT', // Mark as finished/paid
        itensAtendimento: checkoutSession.itens,
        pagamentos: updatedPagamentos,
        desconto: checkoutSession.desconto,
        valorTotal: calculateTotals().total,
        observacoesFinanceiro: checkoutSession.observacoes,
        checkoutFinalizadoEm: new Date().toISOString()
      } as any;

      setAgendamentos(prev => prev.map(a => a.id === editingId ? updatedAgendamento : a));
      
      // Call integration
      if (onIntegrarFinanceiro) {
          onIntegrarFinanceiro(updatedAgendamento, transacao.operadora_id);
      }
      
      setShowCheckoutPanel(false);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
    setAgendamentos(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
  };

  const handleStatusCycle = (agendamento: Agendamento, e: React.MouseEvent) => {
    e.stopPropagation();
    const cycleOrder: Agendamento['status'][] = ['AGENDADO', 'CHECKIN', 'PRONTO', 'CHECKOUT', 'AGENDADO'];
    const currentIndex = cycleOrder.indexOf(agendamento.status);
    let nextStatus = cycleOrder[0];
    
    if (currentIndex !== -1 && currentIndex < cycleOrder.length - 1) {
      nextStatus = cycleOrder[currentIndex + 1];
    }
    
    if (agendamento.status === 'CANCELADO') nextStatus = 'AGENDADO';

    setAgendamentos(prev => prev.map(a => a.id === agendamento.id ? { ...a, status: nextStatus } : a));
  };

  const handleStatusCancel = (agendamento: Agendamento, e: React.MouseEvent) => {
    e.stopPropagation();
    setAgendamentos(prev => prev.map(a => a.id === agendamento.id ? { ...a, status: 'CANCELADO' } : a));
  };

  const handleCheckboxChange = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleSelectAll = (ids: number[], checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    } else {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || formData.clienteId === 0) {
      alert('Selecione um cliente válido.');
      return;
    }

    if (!formData.petId || formData.petId === 0) {
      // Pet é opcional, mas se origem PLANO, talvez obrigatório? Por enquanto, permitir null
      // alert('Selecione um pet válido.');
      // return;
    }

    if (!formData.servico) {
      alert('Digite o serviço.');
      return;
    }

    if (!formData.dataInicio || !formData.dataFim) {
      alert('Selecione uma data e hora.');
      return;
    }
    
    if (new Date(formData.dataInicio!) > new Date(formData.dataFim!)) {
      alert('Data de início não pode ser maior que data de fim.');
      return;
    }

    if (formData.origemServico === 'PLANO' && !formData.planoId) {
      alert('Selecione um plano quando a origem for PLANO');
      return;
    }

    const finalData = {
        ...formData,
        planoConsumoPendente: formData.origemServico === 'PLANO' ? true : false,
        // If PLANO, ensure value is 0 or handled by plan logic (usually 0 for consumption)
        // But we keep user input or default
    };

    // Filter out undefined values to avoid sending null/undefined to API
    const cleanData = Object.fromEntries(
        Object.entries(finalData).filter(([_, value]) => value !== undefined && value !== null && value !== 0)
    );

    if (editingId) {
      // Update existing agendamento
      // TODO: Implement API update
      setAgendamentos(prev => prev.map(a => a.id === editingId ? { ...a, ...finalData } as Agendamento : a));
      setShowModal(false);
    } else {
      // Create new agendamento
      (async () => {
        try {
          console.log('ENVIANDO AGENDAMENTO:', cleanData);
          const response = await fetch('/api/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cleanData),
          });

          console.log('STATUS_AGENDAMENTO:', response.status, 'OK:', response.ok);
          const raw = await response.text();
          console.log('BODY_AGENDAMENTO_RAW:', raw);
          let result;
          try {
            result = raw ? JSON.parse(raw) : null;
          } catch (e) {
            result = null;
          }
          console.log('RESPOSTA_AGENDAMENTO_PARSED:', result);

          if (!response.ok) {
            alert(`Erro ao salvar agendamento: ${result?.error || result?.details || response.statusText}`);
            return;
          }

          setAgendamentos(prev => [...prev, result]);
          propSetAgendamentos(prev => [...prev, result]); // Update global state
          setShowModal(false);
        } catch (error) {
          console.error('Erro ao salvar agendamento:', error);
          alert(`Erro de conexão ao salvar agendamento: ${error.message}`);
        }
      })();
    }
  };

  // --- CHECKOUT HANDLERS ---

  const handleAddItem = () => {
      if (!addItemForm.descricao && !addItemForm.itemId) return;

      const newItem: ItemAtendimento = {
          id: Date.now().toString(),
          tipo: addItemForm.tipo,
          servicoId: addItemForm.tipo === 'SERVICO' ? Number(addItemForm.itemId) : undefined,
          produtoId: addItemForm.tipo === 'PRODUTO' ? Number(addItemForm.itemId) : undefined,
          descricao: addItemForm.descricao,
          quantidade: addItemForm.quantidade,
          valorUnitario: addItemForm.valorUnitario,
          totalLinha: addItemForm.quantidade * addItemForm.valorUnitario,
          observacao: addItemForm.observacao
      };

      setCheckoutSession(prev => ({
          ...prev,
          itens: [...prev.itens, newItem]
      }));
      setShowAddItemModal(false);
  };

  const handleRemoveItem = (id: string) => {
      setCheckoutSession(prev => ({
          ...prev,
          itens: prev.itens.filter(i => i.id !== id)
      }));
  };

  const handleAddPayment = () => {
      const newPayment: ItemPagamento = {
          id: Date.now().toString(),
          forma: 'DINHEIRO',
          valor: 0,
          dataHora: new Date().toISOString()
      };
      setCheckoutSession(prev => ({
          ...prev,
          pagamentos: [...prev.pagamentos, newPayment]
      }));
  };

  const handleAddPaymentMethod = (forma: string) => {
      const newPayment: ItemPagamento = {
          id: Date.now().toString(),
          forma: forma as any,
          valor: 0, // Start with 0 so user types
          dataHora: new Date().toISOString()
      };
      setCheckoutSession(prev => ({
          ...prev,
          pagamentos: [...prev.pagamentos, newPayment]
      }));
  };

  const handleUpdatePayment = (id: string, field: keyof ItemPagamento, value: any) => {
      setCheckoutSession(prev => ({
          ...prev,
          pagamentos: prev.pagamentos.map(p => p.id === id ? { ...p, [field]: value } : p)
      }));
  };

  const handleRemovePayment = (id: string) => {
      setCheckoutSession(prev => ({
          ...prev,
          pagamentos: prev.pagamentos.filter(p => p.id !== id)
      }));
  };

  const calculateTotals = () => {
      const subtotal = checkoutSession.itens.reduce((acc, item) => acc + item.totalLinha, 0);
      const total = Math.max(0, subtotal - checkoutSession.desconto);
      const pago = checkoutSession.pagamentos.reduce((acc, p) => acc + p.valor, 0);
      const saldo = Math.max(0, total - pago);
      return { subtotal, total, pago, saldo };
  };

  const handleSaveAndClose = () => {
      if (!editingId) return;
      const { total } = calculateTotals();

      const updatedAgendamento = {
        ...formData,
        id: editingId,
        itensAtendimento: checkoutSession.itens,
        pagamentos: checkoutSession.pagamentos,
        desconto: checkoutSession.desconto,
        valorTotal: total,
        observacoesFinanceiro: checkoutSession.observacoes,
        recebimentoAtualizadoEm: new Date().toISOString()
      } as any;

      setAgendamentos(prev => prev.map(a => a.id === editingId ? updatedAgendamento : a));
      setShowCheckoutPanel(false);
  };

  const handleSaveRecebimento = () => {
      if (!editingId) return;
      const { total } = calculateTotals();

      const updatedAgendamento = {
        ...formData,
        id: editingId,
        itensAtendimento: checkoutSession.itens,
        pagamentos: checkoutSession.pagamentos,
        desconto: checkoutSession.desconto,
        valorTotal: total,
        observacoesFinanceiro: checkoutSession.observacoes,
        recebimentoAtualizadoEm: new Date().toISOString()
      } as any;

      setAgendamentos(prev => prev.map(a => a.id === editingId ? updatedAgendamento : a));
      setCheckoutSession(prev => ({ ...prev, error: undefined, success: 'Recebimento registrado!' }));
      
      setTimeout(() => {
          setCheckoutSession(prev => ({ ...prev, success: undefined }));
      }, 3000);
  };

  const handleFinalizarAtendimento = () => {
    if (!editingId) return;
    const { saldo, total } = calculateTotals();

    if (saldo > 0.01) {
        setCheckoutSession(prev => ({ ...prev, error: 'Existe saldo pendente. Registre os pagamentos para concluir.' }));
        return;
    }

    const updatedAgendamento = {
      ...formData,
      id: editingId,
      status: 'CHECKOUT',
      itensAtendimento: checkoutSession.itens,
      pagamentos: checkoutSession.pagamentos,
      desconto: checkoutSession.desconto,
      valorTotal: total,
      observacoesFinanceiro: checkoutSession.observacoes,
      checkoutFinalizadoEm: new Date().toISOString()
    } as any;

    setAgendamentos(prev => prev.map(a => a.id === editingId ? updatedAgendamento : a));
    
    // INTEGRATION CALL
    if (onIntegrarFinanceiro) {
      // Pass the first payment method as legacy or handle in service if updated
      // For now, we pass the updated object which has the arrays
      onIntegrarFinanceiro(updatedAgendamento, 0); 
    }

    setShowCheckoutPanel(false);
  };

  const handleCheckoutSave = () => {
     // Legacy handler - replaced by handleFinalizarAtendimento
     handleFinalizarAtendimento();
  };

  const handleDelete = () => {
    if (editingId) {
      setAgendamentos(prev => prev.filter(a => a.id !== editingId));
      setShowModal(false);
      setShowCheckoutPanel(false);
    }
  };

  const handleBatchAction = (action: 'CANCELAR' | 'REAGENDAR' | 'COMANDA') => {
    if (action === 'CANCELAR') {
      setAgendamentos(prev => prev.map(a => selectedIds.includes(a.id) ? { ...a, status: 'CANCELADO' } : a));
      setSelectedIds([]);
      setShowActionMenu(false);
    } else if (action === 'REAGENDAR') {
      setSelectedIds([]);
      setShowActionMenu(false);
    } else if (action === 'COMANDA') {
        setShowActionMenu(false);
    }
  };

  // --- PLAN LOGIC ---
  const eligiblePlans = useMemo(() => {
    if (!formData.clienteId) return [];
    return contratos.filter(c => c.clienteId === Number(formData.clienteId) && c.ativo);
  }, [formData.clienteId, contratos]);

  const planServices = useMemo(() => {
    if (!formData.planoId) return [];
    const contrato = contratos.find(c => c.id === Number(formData.planoId));
    if (!contrato) return [];
    const produtoPlano = produtos.find(p => p.id === contrato.planoId);
    if (!produtoPlano) return [];
    
    // Return included items or empty if not defined
    return produtoPlano.itensInclusos || [];
  }, [formData.planoId, contratos, produtos]);


  // --- DATA PREPARATION ---

  const filteredAgendamentos = useMemo(() => {
    return agendamentos.filter(a => {
      if (filterStatus !== 'TODAS' && a.status !== filterStatus) return false;
      return true;
    });
  }, [agendamentos, filterStatus]);

  const getAgendamentosForDay = (date: Date) => {
    const dateStr = formatDate(date);
    const result = filteredAgendamentos.filter(a => a.dataInicio.startsWith(dateStr));
    console.log('getAgendamentosForDay:', dateStr, 'filteredAgendamentos length:', filteredAgendamentos.length, 'result length:', result.length);
    console.log('Sample dataInicio:', filteredAgendamentos.slice(0, 3).map(a => a.dataInicio));
    return result;
  };

  // --- INDICATORS ---
  const indicators = useMemo(() => {
    let pago = 0;
    let pendente = 0;
    let atendimentos = 0;
    let planos = 0;

    const start = view === 'DIA' ? currentDate : view === 'SEMANA' ? getStartOfWeek(currentDate) : getStartOfMonth(currentDate);
    const end = view === 'DIA' ? currentDate : view === 'SEMANA' ? addDays(start, 6) : new Date(start.getFullYear(), start.getMonth() + 1, 0);

    const inRange = agendamentos.filter(a => {
      const d = new Date(a.dataInicio);
      return d >= start && d <= end;
    });

    inRange.forEach(a => {
      atendimentos++;
      if (a.status === 'CHECKOUT') pago += (a.valor || 0);
      else if (a.status === 'AGENDADO' || a.status === 'CHECKIN' || a.status === 'PRONTO') pendente += (a.valor || 0);
      
      if (a.origemServico === 'PLANO') planos++;
    });

    return { pago, pendente, atendimentos, planos };
  }, [agendamentos, currentDate, view]);


  // --- RENDER HELPERS ---

  const renderMonthView = () => {
    const start = getStartOfMonth(currentDate);
    const daysInMonth = getDaysInMonth(currentDate);
    const startDayOfWeek = start.getDay();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="text-center text-sm font-bold text-gray-500 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="h-24 bg-gray-50 rounded-md opacity-50"></div>;
              
              const isSelected = selectedDayInMonth && formatDate(day) === formatDate(selectedDayInMonth);
              const isToday = formatDate(day) === formatDate(new Date());
              const dayApps = getAgendamentosForDay(day);

              return (
                <div 
                  key={idx} 
                  className={`h-24 border rounded-md p-2 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50' : 'bg-white'
                  } ${isToday ? 'border-indigo-300' : 'border-gray-200'}`}
                  onClick={() => {
                    console.log('Day clicked:', day, 'formatted:', formatDate(day));
                    setSelectedDayInMonth(day);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : 'text-gray-700'}`}>{day.getDate()}</span>
                    {dayApps.length > 0 && (
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-1.5 py-0.5 rounded-full">
                        {dayApps.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 overflow-hidden">
                    {dayApps.slice(0, 2).map(app => (
                      <div key={app.id} className="text-[10px] truncate bg-gray-100 rounded px-1 text-gray-600">
                        {pets.find(p => p.id === app.petId)?.nome}
                      </div>
                    ))}
                    {dayApps.length > 2 && (
                      <div className="text-[10px] text-gray-400 pl-1">+{dayApps.length - 2} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full flex flex-col relative">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border">
          
          {/* A1. View Segments */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleToday}
              className="px-4 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
            >
              HOJE
            </button>
            <div className="w-px bg-gray-300 mx-1 my-1"></div>
            {(['DIA', 'SEMANA', 'MES'] as ViewType[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v === 'MES' ? 'MÊS' : v}
              </button>
            ))}
          </div>

          {/* A2. Navigation + Date */}
          <div className="flex items-center gap-3">
            <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              &lt;
            </button>
            <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
              &gt;
            </button>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-gray-800 capitalize">
                {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <input 
                type="date" 
                value={formatDate(currentDate)} 
                onChange={handleDateChange}
                className="text-xs text-gray-400 outline-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* A3. Summary */}
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-green-50 border border-green-100 rounded flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] text-green-600 font-bold uppercase">Pago</span>
              <span className="text-xs font-bold text-green-700">R$ {indicators.pago.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1 bg-yellow-50 border border-yellow-100 rounded flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] text-yellow-600 font-bold uppercase">Pend.</span>
              <span className="text-xs font-bold text-yellow-700">R$ {indicators.pendente.toFixed(2)}</span>
            </div>
            <div className="px-3 py-1 bg-blue-50 border border-blue-100 rounded flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] text-blue-600 font-bold uppercase">Atend.</span>
              <span className="text-xs font-bold text-blue-700">{indicators.atendimentos}</span>
            </div>
            <div className="px-3 py-1 bg-purple-50 border border-purple-100 rounded flex flex-col items-center min-w-[70px]">
              <span className="text-[10px] text-purple-600 font-bold uppercase">Plano</span>
              <span className="text-xs font-bold text-purple-700">{indicators.planos}</span>
            </div>
          </div>

          {/* A4. Status Filter */}
          <div>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="TODAS">Todos Status</option>
              <option value="AGENDADO">Agendado</option>
              <option value="CHECKIN">Checkin</option>
              <option value="PRONTO">Pronto</option>
              <option value="CHECKOUT">Checkout</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {view === 'DIA' && (
          <AgendaDayView 
            date={currentDate} 
            filteredAgendamentos={filteredAgendamentos}
            pets={pets}
            clientes={clientes}
            selectedIds={selectedIds}
            onSlotClick={handleSlotClick}
            onEditClick={handleEditClick}
            onCheckboxChange={handleCheckboxChange}
            onStatusChange={handleStatusChange}
            onStatusCycle={handleStatusCycle}
            onStatusCancel={handleStatusCancel}
            onBatchAction={handleBatchAction}
            onSelectAll={handleSelectAll}
          />
        )}
        {view === 'SEMANA' && (
            // Reusing logic for week view but simpler rendering
            <div className="flex overflow-x-auto border rounded-lg bg-white shadow-sm">
                <div className="flex flex-col min-w-[80px] border-r bg-gray-50 sticky left-0 z-10">
                <div className="h-12 border-b flex items-center justify-center font-bold text-gray-400 bg-gray-100">Hora</div>
                {slots.map(time => (
                    <div key={time} className="h-[60px] border-b last:border-b-0 flex items-center justify-center text-xs text-gray-500 font-mono">
                    {time}
                    </div>
                ))}
                </div>

                {Array.from({ length: 7 }).map((_, i) => {
                    const day = addDays(getStartOfWeek(currentDate), i);
                    const dayAgendamentos = getAgendamentosForDay(day);
                    const isToday = formatDate(day) === formatDate(new Date());

                    return (
                        <div key={day.toISOString()} className="flex-1 min-w-[150px] border-r last:border-r-0 flex flex-col">
                        <div className={`h-12 border-b flex flex-col items-center justify-center ${isToday ? 'bg-indigo-50 text-indigo-700' : 'bg-white'}`}>
                            <span className="text-xs font-bold uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                            <span className="text-sm">{day.getDate()}/{day.getMonth() + 1}</span>
                        </div>
                        
                        {slots.map(time => {
                            const appsInSlot = dayAgendamentos.filter(a => {
                                const d = new Date(a.dataInicio);
                                const h = d.getHours();
                                const m = d.getMinutes();
                                const timeStr = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
                                return timeStr === time;
                            });

                            return (
                            <div 
                                key={time} 
                                className="h-[60px] border-b last:border-b-0 p-1 hover:bg-gray-50 cursor-pointer relative group"
                                onClick={() => handleSlotClick(day, time)}
                            >
                                {appsInSlot.map(app => (
                                <div 
                                    key={app.id}
                                    className={`p-1 mb-1 rounded-[2px] text-[10px] border-l-2 cursor-pointer truncate ${
                                    app.status === 'CHECKOUT' ? 'bg-green-100 border-green-500 text-green-800' :
                                    app.status === 'CANCELADO' ? 'bg-red-100 border-red-500 text-red-800' :
                                    'bg-blue-100 border-blue-500 text-blue-800'
                                    }`}
                                    onClick={(e) => handleEditClick(app, e)}
                                    title={`${app.servico} - ${pets.find(p => p.id === app.petId)?.nome}`}
                                >
                                    {pets.find(p => p.id === app.petId)?.nome}
                                </div>
                                ))}
                            </div>
                            );
                        })}
                        </div>
                    );
                })}
            </div>
        )}
        {view === 'MES' && renderMonthView()}
      </div>

      {/* MONTH VIEW OVERLAY (Portal) */}
      {view === 'MES' && selectedDayInMonth && (() => {
        console.log('Rendering month overlay for:', selectedDayInMonth, formatDate(selectedDayInMonth));
        return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDayInMonth(null)}>
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-4xl max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800">
                {selectedDayInMonth.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h2>
              <button onClick={() => setSelectedDayInMonth(null)} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <AgendaDayView 
                date={selectedDayInMonth} 
                filteredAgendamentos={filteredAgendamentos}
                pets={pets}
                clientes={clientes}
                selectedIds={selectedIds}
                onSlotClick={handleSlotClick}
                onEditClick={handleEditClick}
                onCheckboxChange={handleCheckboxChange}
                onStatusChange={handleStatusChange}
                onStatusCycle={handleStatusCycle}
                onStatusCancel={handleStatusCancel}
                onBatchAction={handleBatchAction}
                onSelectAll={handleSelectAll}
              />
            </div>
          </div>
        </div>,
        document.body
      );
      })()}

      {/* NEW APPOINTMENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                  <input 
                    type="date" 
                    value={formData.dataInicio?.split('T')[0]} 
                    onChange={(e) => {
                        const newDate = e.target.value;
                        const time = formData.dataInicio?.split('T')[1] || '08:00';
                        const endTime = formData.dataFim?.split('T')[1] || '08:30';
                        setFormData({
                            ...formData,
                            dataInicio: `${newDate}T${time}`,
                            dataFim: `${newDate}T${endTime}`
                        });
                    }}
                    className="w-full border rounded p-2"
                    required
                  />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                        <input 
                            type="time" 
                            value={formData.dataInicio?.split('T')[1]?.substring(0, 5)} 
                            onChange={(e) => {
                                const date = formData.dataInicio?.split('T')[0] || new Date().toISOString().split('T')[0];
                                setFormData({...formData, dataInicio: `${date}T${e.target.value}`});
                            }}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                        <input 
                            type="time" 
                            value={formData.dataFim?.split('T')[1]?.substring(0, 5)} 
                            onChange={(e) => {
                                const date = formData.dataFim?.split('T')[0] || new Date().toISOString().split('T')[0];
                                setFormData({...formData, dataFim: `${date}T${e.target.value}`});
                            }}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                <select 
                  value={formData.clienteId} 
                  onChange={(e) => setFormData({...formData, clienteId: Number(e.target.value), petId: 0, planoId: undefined})}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value={0}>Selecione...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pet</label>
                <select 
                  value={formData.petId} 
                  onChange={(e) => setFormData({...formData, petId: Number(e.target.value)})}
                  className="w-full border rounded p-2"
                  required
                  disabled={!formData.clienteId}
                >
                  <option value={0}>Selecione...</option>
                  {pets.filter(p => p.clienteId === formData.clienteId).map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>

              {/* ORIGEM DO SERVIÇO */}
              <div className="bg-gray-50 p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">Origem do Serviço</label>
                <div className="flex gap-4 mb-3">
                    <label className="inline-flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="origemServico" 
                            value="AVULSO"
                            checked={formData.origemServico === 'AVULSO'}
                            onChange={() => setFormData({...formData, origemServico: 'AVULSO', valor: 0, servico: ''})}
                            className="form-radio text-indigo-600"
                        />
                        <span className="ml-2 text-sm">Serviço Avulso</span>
                    </label>
                    <label className="inline-flex items-center cursor-pointer">
                        <input 
                            type="radio" 
                            name="origemServico" 
                            value="PLANO"
                            checked={formData.origemServico === 'PLANO'}
                            onChange={() => setFormData({...formData, origemServico: 'PLANO', valor: 0, servico: ''})}
                            className="form-radio text-indigo-600"
                        />
                        <span className="ml-2 text-sm">Item do Plano</span>
                    </label>
                </div>

                {formData.origemServico === 'AVULSO' ? (
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="block text-sm font-medium text-gray-700">Serviço</label>
                            {servicos.length > 0 && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setUsarServicoManual(!usarServicoManual);
                                        if (!usarServicoManual) {
                                            // Switching to manual: clear ID but keep name if user wants to edit
                                            setFormData(prev => ({...prev, servicoId: undefined}));
                                        } else {
                                            // Switching to list: clear name to force selection
                                            setFormData(prev => ({...prev, servico: '', valor: 0}));
                                        }
                                    }}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    {usarServicoManual ? 'Selecionar da lista' : 'Digitar manualmente'}
                                </button>
                            )}
                        </div>

                        {servicos.length > 0 && !usarServicoManual ? (
                            <select 
                                value={formData.servicoId || ''} 
                                onChange={(e) => {
                                    const selectedId = Number(e.target.value);
                                    const servico = servicos.find(s => s.id === selectedId);
                                    if (servico) {
                                        setFormData({
                                            ...formData, 
                                            servicoId: servico.id, 
                                            servico: servico.nome, 
                                            servicoNome: servico.nome,
                                            valor: servico.preco
                                        });
                                    } else {
                                        setFormData({
                                            ...formData, 
                                            servicoId: undefined, 
                                            servico: '', 
                                            servicoNome: '',
                                            valor: 0
                                        });
                                    }
                                }}
                                className="w-full border rounded p-2"
                                required={!usarServicoManual}
                            >
                                <option value="">Selecione um serviço...</option>
                                {servicos.map(s => (
                                    <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco.toFixed(2)}</option>
                                ))}
                            </select>
                        ) : (
                            <>
                                <input 
                                    type="text" 
                                    value={formData.servico} 
                                    onChange={(e) => setFormData({...formData, servico: e.target.value, servicoNome: e.target.value, servicoId: undefined})}
                                    className="w-full border rounded p-2"
                                    placeholder="Nome do serviço"
                                    required
                                />
                                {servicos.length === 0 && (
                                    <div className="text-xs text-yellow-600 mt-1">
                                        Nenhum serviço cadastrado. <span className="italic">Cadastre em Produtos/Serviços para facilitar.</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {!formData.clienteId ? (
                            <div className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                Selecione o cliente primeiro para ver os planos.
                            </div>
                                        ) : planos.length === 0 ? (
                            <div className="text-sm text-gray-500 bg-gray-100 p-2 rounded">
                                Planos ainda não configurados.
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
                                    <select 
                                        value={formData.planoId || ''}
                                        onChange={(e) => setFormData({...formData, planoId: Number(e.target.value), servico: ''})}
                                        className="w-full border rounded p-2"
                                        required
                                    >
                                        <option value="">Selecione o plano...</option>
                                        {planos.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {formData.planoId && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Serviço do Plano</label>
                                        {planServices.length > 0 ? (
                                            <select 
                                                value={formData.servico}
                                                onChange={(e) => {
                                                    const selectedService = e.target.value;
                                                    const servicoEncontrado = servicos.find(s => s.nome === selectedService);
                                                    setFormData({
                                                        ...formData, 
                                                        servico: selectedService,
                                                        servicoId: servicoEncontrado ? servicoEncontrado.id : undefined
                                                    });
                                                }}
                                                className="w-full border rounded p-2"
                                                required
                                            >
                                                <option value="">Selecione o serviço...</option>
                                                {planServices.map((item, idx) => (
                                                    <option key={idx} value={item}>{item}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="text-sm text-gray-500 italic">
                                                Este plano não possui serviços específicos listados. Digite abaixo:
                                                <input 
                                                    type="text" 
                                                    value={formData.servico} 
                                                    onChange={(e) => setFormData({...formData, servico: e.target.value})}
                                                    className="w-full border rounded p-2 mt-1"
                                                    placeholder="Nome do serviço do plano"
                                                    required
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  value={formData.valor} 
                  onChange={(e) => setFormData({...formData, valor: Number(e.target.value)})}
                  className="w-full border rounded p-2"
                  disabled={formData.origemServico === 'PLANO'} // Usually 0 for plan items consumption
                />
                {formData.origemServico === 'PLANO' && <span className="text-xs text-gray-500">Item de plano geralmente não tem custo no agendamento.</span>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <textarea 
                  value={formData.observacao} 
                  onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                  className="w-full border rounded p-2"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 justify-end mt-6">
                {editingId && (
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded mr-auto"
                  >
                    Excluir
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT PANEL */}
      {showCheckoutPanel && editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white w-[95%] h-[95%] max-w-7xl rounded-xl shadow-2xl flex overflow-hidden relative">
                <button 
                    onClick={() => setShowCheckoutPanel(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* LEFT COL */}
                <div ref={checkoutLeftRef} className={`${panelMode === 'CHECKOUT' ? 'w-[65%]' : 'w-full'} flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-300 overflow-y-auto`}>
                    {/* Header */}
                    <div className="px-8 py-6 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {panelMode === 'EDIT' ? 'EDITAR ATENDIMENTO' : 'CHECKOUT DE ATENDIMENTO'}
                            </h2>
                            <div className="flex gap-2">
                                {panelMode === 'EDIT' ? (
                                    <button 
                                        onClick={() => setPanelMode('CHECKOUT')}
                                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium text-sm flex items-center gap-2 border border-green-200"
                                    >
                                        Ir para Checkout &rarr;
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setPanelMode('EDIT')}
                                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm flex items-center gap-2 border border-gray-200"
                                    >
                                        Editar Dados
                                    </button>
                                )}
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                    COMANDA
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="block text-gray-500 text-xs font-bold uppercase">Atendimento</span>
                                <span className="font-mono font-bold text-gray-900">#{editingId}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs font-bold uppercase">Cliente</span>
                                <span className="font-bold text-gray-900 truncate block">{clientes.find(c => c.id === formData.clienteId)?.nome || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs font-bold uppercase">Pet</span>
                                <span className="font-bold text-gray-900">{pets.find(p => p.id === formData.petId)?.nome || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 p-8 overflow-y-auto">
                        
                        {/* EDIT MODE CONTENT */}
                        {panelMode === 'EDIT' && (
                            <div className="space-y-6 max-w-3xl mx-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                                        <input 
                                            type="date" 
                                            value={formData.dataInicio?.split('T')[0]}
                                            onChange={(e) => setFormData({...formData, dataInicio: `${e.target.value}T${formData.dataInicio?.split('T')[1]}`})}
                                            className="w-full border rounded-lg p-2.5 bg-white"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                                            <input 
                                                type="time" 
                                                value={formData.dataInicio?.split('T')[1]?.substring(0, 5)}
                                                onChange={(e) => {
                                                    const date = formData.dataInicio?.split('T')[0];
                                                    setFormData({...formData, dataInicio: `${date}T${e.target.value}:00`});
                                                }}
                                                className="w-full border rounded-lg p-2.5 bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                                            <input 
                                                type="time" 
                                                value={formData.dataFim?.split('T')[1]?.substring(0, 5)}
                                                onChange={(e) => {
                                                    const date = formData.dataFim?.split('T')[0];
                                                    setFormData({...formData, dataFim: `${date}T${e.target.value}:00`});
                                                }}
                                                className="w-full border rounded-lg p-2.5 bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                        <select 
                                            value={formData.clienteId}
                                            onChange={(e) => setFormData({...formData, clienteId: Number(e.target.value)})}
                                            className="w-full border rounded-lg p-2.5 bg-white"
                                        >
                                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pet</label>
                                        <select 
                                            value={formData.petId}
                                            onChange={(e) => setFormData({...formData, petId: Number(e.target.value)})}
                                            className="w-full border rounded-lg p-2.5 bg-white"
                                        >
                                            {pets.filter(p => p.clienteId === formData.clienteId).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Serviço Principal</label>
                                    <select 
                                        value={formData.servicoId || ''}
                                        onChange={(e) => {
                                            const s = servicos.find(s => s.id === Number(e.target.value));
                                            if (s) {
                                                setFormData({
                                                    ...formData, 
                                                    servicoId: s.id, 
                                                    servico: s.nome, 
                                                    valor: s.preco
                                                });
                                            }
                                        }}
                                        className="w-full border rounded-lg p-2.5 bg-white"
                                    >
                                        <option value="">Selecione...</option>
                                        {servicos.map(s => (
                                            <option key={s.id} value={s.id}>{s.nome} - R$ {s.preco.toFixed(2)}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                                    <textarea 
                                        value={formData.observacao}
                                        onChange={(e) => setFormData({...formData, observacao: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 bg-white h-32"
                                        placeholder="Detalhes do atendimento..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* CHECKOUT MODE CONTENT */}
                        {panelMode === 'CHECKOUT' && (
                            <>
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase">Resumo da Venda</h3>
                                    <button 
                                        onClick={() => {
                                            setAddItemForm({ tipo: 'SERVICO', itemId: '', descricao: '', quantidade: 1, valorUnitario: 0, observacao: '' });
                                            setShowAddItemModal(true);
                                        }}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-bold hover:bg-indigo-100 flex items-center gap-2 text-xs"
                                    >
                                        <span>+</span> ADICIONAR ITEM
                                    </button>
                                </div>
                                
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-medium">Horário</th>
                                                <th className="px-6 py-3 text-left font-medium">Serviço / Produto</th>
                                                <th className="px-6 py-3 text-right font-medium">Total (R$)</th>
                                                <th className="w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {checkoutSession.itens.map(item => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 text-gray-600 font-mono">
                                                        {new Date(formData.dataInicio!).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{item.descricao}</div>
                                                        {item.observacao && <div className="text-xs text-gray-500">{item.observacao}</div>}
                                                        <div className="text-xs text-gray-400 mt-1">{item.tipo} • {item.quantidade}x R$ {item.valorUnitario.toFixed(2)}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-gray-900">
                                                        R$ {item.totalLinha.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                            &times;
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {checkoutSession.itens.length === 0 && (
                                                <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">Nenhum item adicionado</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>

                    {/* EDIT MODE FOOTER */}
                    {panelMode === 'EDIT' && (
                        <div className="p-6 bg-white border-t border-gray-200 flex justify-between">
                            <button 
                                onClick={() => setShowCheckoutPanel(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleCheckoutSave}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md"
                            >
                                Salvar e Fechar
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT COL (ONLY IN CHECKOUT MODE) */}
                {panelMode === 'CHECKOUT' && (
                    <div ref={checkoutRightRef} className="w-[35%] flex flex-col bg-white border-l border-gray-200 relative z-20 shadow-xl animate-slide-in-right overflow-y-auto">
                        <PaymentMethodSelector 
                            valorTotal={calculateTotals().saldo}
                            origem="agenda"
                            referencia_id={editingId?.toString() || ''}
                            onPaymentComplete={handlePaymentComplete}
                            onCancel={() => setShowCheckoutPanel(false)}
                        />
                    </div>
                )}
            </div>
        </div>
      )}
      {/* ADD ITEM MODAL */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div ref={addItemRef} className="bg-white p-6 rounded-lg shadow-xl w-[400px] max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Adicionar Item</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    checked={addItemForm.tipo === 'SERVICO'} 
                                    onChange={() => setAddItemForm(prev => ({ ...prev, tipo: 'SERVICO', itemId: '', descricao: '', valorUnitario: 0 }))}
                                    className="form-radio text-indigo-600"
                                />
                                <span className="ml-2 text-sm">Serviço</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input 
                                    type="radio" 
                                    checked={addItemForm.tipo === 'PRODUTO'} 
                                    onChange={() => setAddItemForm(prev => ({ ...prev, tipo: 'PRODUTO', itemId: '', descricao: '', valorUnitario: 0 }))}
                                    className="form-radio text-indigo-600"
                                />
                                <span className="ml-2 text-sm">Produto</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                        <select 
                            value={addItemForm.itemId}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                const item = produtos.find(p => p.id === id);
                                if (item) {
                                    setAddItemForm(prev => ({
                                        ...prev,
                                        itemId: e.target.value,
                                        descricao: item.nome,
                                        valorUnitario: item.preco
                                    }));
                                }
                            }}
                            className="w-full border rounded p-2"
                        >
                            <option value="">Selecione...</option>
                            {produtos
                                .filter(p => (addItemForm.tipo === 'SERVICO' ? p.tipo === 'Serviço' : p.tipo === 'Produto') && p.ativo)
                                .map(p => (
                                    <option key={p.id} value={p.id}>{p.nome}</option>
                                ))
                            }
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                            <input 
                                type="number" 
                                min="1"
                                value={addItemForm.quantidade}
                                onChange={(e) => setAddItemForm(prev => ({ ...prev, quantidade: Number(e.target.value) }))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unit. (R$)</label>
                            <input 
                                type="number" 
                                value={addItemForm.valorUnitario}
                                onChange={(e) => setAddItemForm(prev => ({ ...prev, valorUnitario: Number(e.target.value) }))}
                                className="w-full border rounded p-2"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                        <input 
                            type="text" 
                            value={addItemForm.observacao}
                            onChange={(e) => setAddItemForm(prev => ({ ...prev, observacao: e.target.value }))}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            onClick={() => setShowAddItemModal(false)}
                            className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 font-bold"
                            disabled={!addItemForm.itemId}
                        >
                            Adicionar
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
