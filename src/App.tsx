import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';

export interface Empresa {
  id: number;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  logoUrl?: string;
  ativo: boolean;
}

export interface PermissaoModulo {
  id: string;
  modulo: string;
  podeVer: boolean;
  podeCriar: boolean;
  podeEditar: boolean;
  podeExcluir: boolean;
}

export interface Perfil {
  id: number;
  nome: string;
  permissoes: PermissaoModulo[];
  ativo: boolean;
}

export interface Profissional {
  id: number;
  nome: string;
  apelido?: string;
  telefone?: string;
  funcao: string;
  comissaoPercentual?: number;
  ativo: boolean;
}

export interface CentroResultado {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  cpf: string;
  dataCadastro: string;
  // Optional fields
  tipoPessoa?: "FISICA" | "JURIDICA";
  rg?: string;
  contribuinteICMS?: boolean;
  consumidorFinal?: boolean;
  dataNascimento?: string;
  sexo?: "M" | "F" | "OUTRO" | "";
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  proximidade?: string;
  tags?: string;
  comoNosConheceu?: string;
  limiteCredito?: number;
  perfilDesconto?: string;
  grupoCliente?: string;
  observacao?: string;
  // PJ Fields
  cnpj?: string;
  razaoSocial?: string;
  nomeFantasia?: string;
  inscricaoEstadual?: string;
  ramoAtividade?: string;
  responsavelNome?: string;
  responsavelCpf?: string;
  responsavelEmail?: string;
  responsavelTelefone?: string;
}

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
  porte: string;
  pelagem: string;
  clienteId: number;
  dataCadastro: string;
  // Optional fields
  genero?: string;
  dataNascimento?: string;
  idade?: string | number;
  chip?: string;
  pedigreeRg?: string;
  alimentacao?: string;
  tags?: string;
  alergias?: string;
  observacao?: string;
}

export interface Produto {
  id: number;
  tipo: 'Produto' | 'Serviço' | 'Plano';
  nome: string;
  descricao: string;
  categoria: string;
  preco: number;
  ativo: boolean;
  controlaEstoque: boolean;
  estoqueAtual: number;
  estoqueMinimo: number;
  dataCadastro: string;
  // Optional new fields
  finalidade?: string;
  centroResultado?: string;
  agrupamento?: string;
  perfilComissao?: string;
  curva?: string;
  detalhesProduto?: string;
  unidade?: string;
  ncm?: string;
  diasOportVenda?: string;
  cest?: string;
  marca?: string;
  codigoBarras?: string;
  sku?: string;
  custo?: string;
  custoMedio?: number;
  margemPercent?: string;
  margemValor?: string;
  perfilDesconto?: string;
  estoqueIdeal?: string;
  permiteEstoqueNegativo?: boolean;
  localizacao?: string;
  fatorCompra?: string;
  fornecedores?: string;
  observacao?: string;
  validade?: string;
  // Service specific fields
  duracao?: string;
  horas?: string;
  minutos?: string;
  situacaoTributaria?: string;
  impostoIss?: string;
  // Plan specific fields
  tipoPlano?: 'MENSALIDADE' | 'CONSUMO';
  textoContrato?: string;
  itensInclusos?: string[]; // List of services included in the plan
}

export interface MovimentacaoEstoque {
  id: number;
  produtoId: number;
  dataHora: string;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE' | 'INVENTARIO';
  quantidade: number;
  motivo?: string;
  observacao?: string;
  referencia?: string;
}

export interface Fornecedor {
  id: number;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  contato?: string;
  observacao?: string;
  ativo: boolean;
}

export interface ItemEntrada {
  produtoId: number;
  descricao?: string;
  quantidade: number;
  custoUnitario?: number;
}

export interface EntradaMercadoria {
  id: number;
  data: string;
  fornecedorId?: number;
  numeroDocumento?: string;
  observacao?: string;
  itens: ItemEntrada[];
}

export interface Banco {
  id: number;
  nome: string;
  codigo: string;
  ativo: boolean;
}

export interface ContaBancaria {
  id: number;
  descricao: string;
  bancoId?: number;
  agencia?: string;
  conta?: string;
  tipo: "CAIXA" | "CORRENTE" | "POUPANCA";
  saldoInicial: number;
  ativo: boolean;
}

export interface CategoriaFinanceira {
  id: number;
  nome: string;
  tipo: "RECEITA" | "DESPESA" | "TRANSFERENCIA" | "AJUSTE";
  ativo: boolean;
}

export interface HistoricoPadrao {
  id: number;
  descricao: string;
  tipo: "RECEBIMENTO" | "PAGAMENTO" | "AJUSTE" | "TRANSFERENCIA";
  ativo: boolean;
}

export interface MovimentoConta {
  id: number;
  contaId: number;
  data: string;
  tipo: "ENTRADA" | "SAIDA" | "TRANSFERENCIA";
  valor: number;
  historico: string;
  categoriaId?: number;
  referenciaTipo?: "AR" | "AP" | "AGENDA" | "PDV" | "MANUAL" | "CARTAO_OPERADORA";
  referenciaId?: number;
  conciliado: boolean;
  observacao?: string;
}

export interface AdquirenteOperadora {
  id: string;
  nome: string;
  tipo: "ADQUIRENTE" | "SUBADQUIRENTE";
  ativo: boolean;
  credenciais?: { chave: string; valor: string }[];
  observacao?: string;
}

export interface OperadoraCartao {
  id: number;
  nome: string;
  taxaDebito?: number;
  taxaCreditoAvista?: number;
  taxaCreditoParcelado?: number;
  diasLiquidezDebito?: number;
  diasLiquidezCredito?: number;
  maxParcelas?: number;
  minParcelas?: number;
  permiteDebito?: boolean;
  permiteCredito?: boolean;
  ativo: boolean;
  adquirentes?: AdquirenteOperadora[];
}

export interface RecebivelCartao {
  id: number;
  dataVenda: string;
  origem: "PDV" | "AGENDA" | "MANUAL";
  origemId?: number;
  clienteId?: number;
  valorBruto: number;
  taxaPercentual?: number;
  valorTaxa?: number;
  valorLiquidoPrevisto: number;
  bandeira?: string;
  modalidade: "DEBITO" | "CREDITO_AVISTA" | "CREDITO_PARCELADO";
  parcelas?: number;
  parcelaNumero?: number;
  operadoraId: number;
  dataPrevistaRecebimento: string;
  status: "ABERTO" | "PARCIAL" | "RECEBIDO" | "CANCELADO";
  valorRecebidoAcumulado: number;
  conciliado: boolean;
  observacao?: string;
}

export interface RecebimentoOperadora {
  id: number;
  operadoraId: number;
  contaId: number;
  dataRecebimento: string;
  valorRecebido: number;
  taxaTotal?: number;
  observacao?: string;
  itensConciliados: { recebivelId: number; valorConciliado: number }[];
}

export interface TituloFinanceiro {
  id: number;
  tipo: "RECEBER" | "PAGAR";
  pessoaTipo: "CLIENTE" | "FORNECEDOR" | "OUTROS";
  pessoaId?: number;
  pessoaNome?: string;
  descricao: string;
  dataEmissao: string;
  dataVencimento: string;
  valorOriginal: number;
  desconto: number;
  juros: number;
  multa: number;
  valorLiquido: number;
  status: "ABERTO" | "PARCIAL" | "PAGO" | "CANCELADO";
  observacao?: string;
  origem?: "MANUAL" | "AGENDA" | "PDV" | "COMPRAS";
  origemId?: number;
}

export interface BaixaTitulo {
  id: number;
  tituloId: number;
  contaId: number;
  data: string;
  valor: number;
  formaPagamento: "DINHEIRO" | "PIX" | "DEBITO" | "CREDITO" | "TRANSFERENCIA" | "OUTRO";
  observacao?: string;
}

export interface Contrato {
  id: number;
  numero: string | number;
  clienteId: number;
  petId: number | null;
  planoId: number;
  ativo: boolean;
  levaETraz: "Sim" | "Não";
  recorrente: boolean;
  valor: number;
  valorTotal: number;
  prazoVencimentoDias: number;
  agendamento: "COM" | "SEM";
  diasUsoPlano: number[];
  dataInicioContrato: string;
  textoContratoSnapshot: string;
  observacao?: string;
}

export interface Agendamento {
  id: number;
  clienteId: number;
  petId: number;
  servico: string;
  dataInicio: string; // ISO string
  dataFim: string; // ISO string
  status: 'AGENDADO' | 'CHECKIN' | 'PRONTO' | 'CHECKOUT' | 'CANCELADO';
  observacao?: string;
  valor?: number;
  // Checkout fields
  formaPagamento?: string;
  desconto?: number;
  valorTotal?: number;
  observacoesFinanceiro?: string;
  // Plan fields
  origemServico?: 'AVULSO' | 'PLANO';
  planoId?: number;
  planoItemId?: number;
  servicoId?: number;
  servicoNome?: string;
  planoConsumoPendente?: boolean;
}

export interface ItemVenda {
  produtoId: number;
  nome: string;
  preco: number;
  quantidade: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  clienteId: number;
  petId: number | null;
  itens: ItemVenda[];
  total: number;
  formaPagamento: string;
  dataVenda: string;
  // Optional fields for PDV
  subtotal?: number;
  desconto?: number;
  valorRecebido?: number;
  troco?: number;
  statusPagamento?: 'PAGO' | 'PENDENTE';
  observacao?: string;
}

export interface MovimentoCaixa {
  id: number;
  tipo: 'ABERTURA' | 'VENDA' | 'SANGRIA' | 'SUPRIMENTO' | 'FECHAMENTO';
  valor: number;
  descricao: string;
  data: string;
}

export interface ContaFinanceira {
  id: number;
  nome: string;
  tipo: 'CAIXA' | 'BANCO' | 'CARTAO';
  saldoInicial: number;
  saldoAtual: number;
  ativo: boolean;
}

export interface ContaReceber {
  id: number;
  descricao: string;
  clienteId: number;
  valor: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'RECEBIDO';
  contaFinanceiraId: number;
}

export interface ContaPagar {
  id: number;
  descricao: string;
  fornecedor: string;
  valor: number;
  dataVencimento: string;
  status: 'PENDENTE' | 'PAGO';
  contaFinanceiraId: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  perfil: 'ADMIN' | 'GERENTE' | 'ATENDENTE';
}

// --- CAIXA MODULE TYPES ---

export interface DailyCashRegister {
  id: string;
  data: string; // YYYY-MM-DD
  status: 'aberto' | 'fechado';
  saldo_inicial: number;
  saldo_final: number;
  usuario_abertura: string;
  usuario_fechamento?: string;
  dt_abertura: string;
  dt_fechamento?: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
}

export interface CashTransaction {
  id: string;
  caixa_id: string;
  tipo: 'dinheiro' | 'pix' | 'debito' | 'credito' | 'crediario';
  subtipo: string;
  descricao: string;
  valor: number;
  origem: 'vendas' | 'atendimento' | 'recebimento_cliente' | 'adiantamento' | 'suprimento' | 'entrada_troco' | 'sangria' | 'devolucao' | 'pagamento' | 'saida_troco';
  referencia_id?: string;
  referencia_tipo?: 'venda' | 'atendimento' | 'cliente';
  operadora_id?: string;
  status_conciliacao?: 'pendente' | 'conciliado';
  usuario_criacao: string;
  criado_em: string;
  atualizado_em: string;
  deletado_em?: string;
  notas?: string;
}

export interface CrediarioParcela {
  id: string;
  transacao_id: string;
  cliente_id: number;
  num_parcela: number;
  total_parcelas: number;
  valor_parcela: number;
  intervalo_dias: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'atrasado';
  criado_em: string;
  atualizado_em: string;
}

export interface CardOperator {
  id: string;
  nome: string;
  taxa_comissao: number;
  dias_repasse: number;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface PaymentAccount {
  id: string;
  tipo_pagamento: 'pix' | 'banco';
  chave_pix?: string;
  banco_titular?: string;
  agencia?: string;
  conta?: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

import { FinanceiroService } from './services/financeiro';
import { clientesService } from './services/clientesService';
import { produtosService } from './services/produtosService';
import { petsService } from './services/petsService';
import { agendamentosService } from './services/agendamentosService';
import { vendasService } from './services/vendasService';

export default function App() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);

  // Carregar dados do banco ao iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientesData, vendasData, agendamentosData, produtosData, petsData] = await Promise.all([
          clientesService.listar(),
          vendasService.listar(),
          agendamentosService.listar(),
          produtosService.listar(),
          petsService.listar()
        ]);
        
        if (clientesData && clientesData.length > 0) {
          setClientes(clientesData.map((c: Cliente) => ({ ...c, id: Number(c.id) })));
        }
        
        if (vendasData && vendasData.length > 0) {
          setVendas(vendasData);
        }

        if (agendamentosData && agendamentosData.length > 0) {
          setAgendamentos(agendamentosData);
        }

        if (produtosData && produtosData.length > 0) {
          setProdutos(produtosData);
        }

        if (petsData && petsData.length > 0) {
          setPets(petsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do banco:', error);
      }
    };
    
    loadData();
  }, []);

  const [caixaAberto, setCaixaAberto] = useState<boolean>(false);
  const [movimentosCaixa, setMovimentosCaixa] = useState<MovimentoCaixa[]>([]);
  
  const [contasFinanceiras, setContasFinanceiras] = useState<ContaFinanceira[]>([]);
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>([]);
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useState<MovimentacaoEstoque[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [entradasMercadoria, setEntradasMercadoria] = useState<EntradaMercadoria[]>([]);
  
  // Financeiro State
  const [bancos, setBancos] = useState<Banco[]>([
    { id: 1, nome: 'Banco do Brasil', codigo: '001', ativo: true },
    { id: 2, nome: 'Caixa Econômica', codigo: '104', ativo: true },
    { id: 3, nome: 'Nubank', codigo: '260', ativo: true }
  ]);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([
    { id: 1, descricao: 'Caixa Principal', tipo: 'CAIXA', saldoInicial: 0, ativo: true }
  ]);
  const [categoriasFinanceiras, setCategoriasFinanceiras] = useState<CategoriaFinanceira[]>([]);
  const [historicosPadrao, setHistoricosPadrao] = useState<HistoricoPadrao[]>([
    { id: 1, descricao: 'Recebimento de Cliente', tipo: 'RECEBIMENTO', ativo: true },
    { id: 2, descricao: 'Pagamento de Fornecedor', tipo: 'PAGAMENTO', ativo: true }
  ]);
  const [titulosFinanceiros, setTitulosFinanceiros] = useState<TituloFinanceiro[]>([]);
  const [baixasTitulos, setBaixasTitulos] = useState<BaixaTitulo[]>([]);
  const [movimentosConta, setMovimentosConta] = useState<MovimentoConta[]>([]);
  
  // Cartão State
  const [operadorasCartao, setOperadorasCartao] = useState<OperadoraCartao[]>([
    { id: 1, nome: 'Stone', taxaDebito: 1.99, taxaCreditoAvista: 3.49, taxaCreditoParcelado: 4.99, diasLiquidezDebito: 1, diasLiquidezCredito: 30, ativo: true }
  ]);
  const [recebiveisCartao, setRecebiveisCartao] = useState<RecebivelCartao[]>([]);
  const [recebimentosOperadora, setRecebimentosOperadora] = useState<RecebimentoOperadora[]>([]);

  // Configuracoes State
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [perfis, setPerfis] = useState<Perfil[]>([
    { 
      id: 1, 
      nome: 'Administrador', 
      ativo: true,
      permissoes: [] // Admin has full access by logic, but we can populate this
    },
    { 
      id: 2, 
      nome: 'Gerente', 
      ativo: true,
      permissoes: []
    },
    { 
      id: 3, 
      nome: 'Atendente', 
      ativo: true,
      permissoes: []
    }
  ]);
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [centrosResultados, setCentrosResultados] = useState<CentroResultado[]>([]);

  // Idempotency State
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  // --- INTEGRATION HANDLERS ---

  const handleIntegrarAgenda = (agendamento: Agendamento, operadoraId?: number) => {
    const key = `AGENDA:${agendamento.id}:CHECKOUT:v1`;
    if (processedIds.has(key)) return;

    const cliente = clientes.find(c => c.id === agendamento.clienteId);
    const result = FinanceiroService.gerarDadosCheckoutAgenda(
      agendamento, 
      cliente, 
      operadorasCartao, 
      contasBancarias,
      operadoraId
    );

    if (result.titulo) setTitulosFinanceiros(prev => [...prev, result.titulo!]);
    if (result.baixa) setBaixasTitulos(prev => [...prev, result.baixa!]);
    if (result.movimento) setMovimentosConta(prev => [...prev, result.movimento!]);
    if (result.recebivel) setRecebiveisCartao(prev => [...prev, result.recebivel!]);

    setProcessedIds(prev => new Set(prev).add(key));
  };

  const handleIntegrarPDV = (venda: Venda, operadoraId?: number) => {
    const key = `PDV:${venda.id}:FINALIZAR:v1`;
    if (processedIds.has(key)) return;

    const cliente = clientes.find(c => c.id === venda.clienteId);
    const result = FinanceiroService.gerarDadosVendaPDV(
      venda,
      cliente,
      operadorasCartao,
      contasBancarias,
      operadoraId
    );

    if (result.titulo) setTitulosFinanceiros(prev => [...prev, result.titulo!]);
    if (result.baixa) setBaixasTitulos(prev => [...prev, result.baixa!]);
    if (result.movimento) setMovimentosConta(prev => [...prev, result.movimento!]);
    if (result.recebivel) setRecebiveisCartao(prev => [...prev, result.recebivel!]);

    setProcessedIds(prev => new Set(prev).add(key));
  };

  const handleIntegrarCompras = (entrada: EntradaMercadoria) => {
    const key = `COMPRAS:${entrada.id}:GERAR_AP:v1`;
    if (processedIds.has(key)) return;

    const fornecedor = fornecedores.find(f => f.id === entrada.fornecedorId);
    const result = FinanceiroService.gerarDadosEntradaCompra(entrada, fornecedor);

    if (result.titulo) setTitulosFinanceiros(prev => [...prev, result.titulo!]);

    setProcessedIds(prev => new Set(prev).add(key));
  };

  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome: "Administrador",
      email: "admin",
      senha: "123",
      perfil: "ADMIN"
    }
  ]);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  const temPermissao = (modulo: string) => {
    if (!usuarioLogado) return false;

    if (usuarioLogado.perfil === "ADMIN") return true;

    if (usuarioLogado.perfil === "GERENTE") {
      if (modulo === "FINANCEIRO_EXCLUIR") return false;
      return true;
    }

    if (usuarioLogado.perfil === "ATENDENTE") {
      return ["PDV", "CLIENTES", "PETS"].includes(modulo);
    }

    return false;
  };

  return (
    <BrowserRouter>
      <AppRoutes 
        clientes={clientes} 
        setClientes={setClientes} 
        pets={pets} 
        setPets={setPets} 
        produtos={produtos}
        setProdutos={setProdutos}
        vendas={vendas}
        setVendas={setVendas}
        caixaAberto={caixaAberto}
        setCaixaAberto={setCaixaAberto}
        movimentosCaixa={movimentosCaixa}
        setMovimentosCaixa={setMovimentosCaixa}
        contasFinanceiras={contasFinanceiras}
        setContasFinanceiras={setContasFinanceiras}
        contasReceber={contasReceber}
        setContasReceber={setContasReceber}
        contasPagar={contasPagar}
        setContasPagar={setContasPagar}
        contratos={contratos}
        setContratos={setContratos}
        agendamentos={agendamentos}
        setAgendamentos={setAgendamentos}
        movimentacoesEstoque={movimentacoesEstoque}
        setMovimentacoesEstoque={setMovimentacoesEstoque}
        fornecedores={fornecedores}
        setFornecedores={setFornecedores}
        entradasMercadoria={entradasMercadoria}
        setEntradasMercadoria={setEntradasMercadoria}
        bancos={bancos}
        setBancos={setBancos}
        contasBancarias={contasBancarias}
        setContasBancarias={setContasBancarias}
        categoriasFinanceiras={categoriasFinanceiras}
        setCategoriasFinanceiras={setCategoriasFinanceiras}
        historicosPadrao={historicosPadrao}
        setHistoricosPadrao={setHistoricosPadrao}
        titulosFinanceiros={titulosFinanceiros}
        setTitulosFinanceiros={setTitulosFinanceiros}
        baixasTitulos={baixasTitulos}
        setBaixasTitulos={setBaixasTitulos}
        movimentosConta={movimentosConta}
        setMovimentosConta={setMovimentosConta}
        operadorasCartao={operadorasCartao}
        setOperadorasCartao={setOperadorasCartao}
        recebiveisCartao={recebiveisCartao}
        setRecebiveisCartao={setRecebiveisCartao}
        recebimentosOperadora={recebimentosOperadora}
        setRecebimentosOperadora={setRecebimentosOperadora}
        usuarios={usuarios}
        setUsuarios={setUsuarios}
        usuarioLogado={usuarioLogado}
        setUsuarioLogado={setUsuarioLogado}
        temPermissao={temPermissao}
        onIntegrarAgenda={handleIntegrarAgenda}
        onIntegrarPDV={handleIntegrarPDV}
        onIntegrarCompras={handleIntegrarCompras}
        empresa={empresa}
        setEmpresa={setEmpresa}
        perfis={perfis}
        setPerfis={setPerfis}
        profissionais={profissionais}
        setProfissionais={setProfissionais}
        centrosResultados={centrosResultados}
        setCentrosResultados={setCentrosResultados}
      />
    </BrowserRouter>
  );
}
