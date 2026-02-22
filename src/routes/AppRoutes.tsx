import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import Painel from '../pages/Painel';
import Atendimento from '../pages/Atendimento';
import Agenda from '../pages/Agenda';
import Clientes from '../pages/Clientes';
import Pets from '../pages/Pets';
import Produtos from '../pages/Produtos';
import Estoque from '../pages/Estoque';
import Financeiro from '../pages/Financeiro';
import Compras from '../pages/Compras';
import Marketing from '../pages/Marketing';
import Configuracoes from '../pages/Configuracoes';
import Login from '../pages/Login';
import Caixa from '../pages/Caixa';
import PlanosPage from '../pages/planos/PlanosPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { Cliente, Pet, Produto, Venda, MovimentoCaixa, ContaFinanceira, ContaReceber, ContaPagar, Usuario, Contrato, Agendamento, MovimentacaoEstoque, Fornecedor, EntradaMercadoria, Banco, ContaBancaria, CategoriaFinanceira, HistoricoPadrao, TituloFinanceiro, BaixaTitulo, MovimentoConta, OperadoraCartao, RecebivelCartao, RecebimentoOperadora, Empresa, Perfil, Profissional, CentroResultado } from '../App';

interface AppRoutesProps {
  clientes: Cliente[];
  setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
  pets: Pet[];
  setPets: React.Dispatch<React.SetStateAction<Pet[]>>;
  produtos: Produto[];
  setProdutos: React.Dispatch<React.SetStateAction<Produto[]>>;
  vendas: Venda[];
  setVendas: React.Dispatch<React.SetStateAction<Venda[]>>;
  caixaAberto: boolean;
  setCaixaAberto: React.Dispatch<React.SetStateAction<boolean>>;
  movimentosCaixa: MovimentoCaixa[];
  setMovimentosCaixa: React.Dispatch<React.SetStateAction<MovimentoCaixa[]>>;
  contasFinanceiras: ContaFinanceira[];
  setContasFinanceiras: React.Dispatch<React.SetStateAction<ContaFinanceira[]>>;
  contasReceber: ContaReceber[];
  setContasReceber: React.Dispatch<React.SetStateAction<ContaReceber[]>>;
  contasPagar: ContaPagar[];
  setContasPagar: React.Dispatch<React.SetStateAction<ContaPagar[]>>;
  contratos: Contrato[];
  setContratos: React.Dispatch<React.SetStateAction<Contrato[]>>;
  agendamentos: Agendamento[];
  setAgendamentos: React.Dispatch<React.SetStateAction<Agendamento[]>>;
  movimentacoesEstoque: MovimentacaoEstoque[];
  setMovimentacoesEstoque: React.Dispatch<React.SetStateAction<MovimentacaoEstoque[]>>;
  fornecedores: Fornecedor[];
  setFornecedores: React.Dispatch<React.SetStateAction<Fornecedor[]>>;
  entradasMercadoria: EntradaMercadoria[];
  setEntradasMercadoria: React.Dispatch<React.SetStateAction<EntradaMercadoria[]>>;
  bancos: Banco[];
  setBancos: React.Dispatch<React.SetStateAction<Banco[]>>;
  contasBancarias: ContaBancaria[];
  setContasBancarias: React.Dispatch<React.SetStateAction<ContaBancaria[]>>;
  categoriasFinanceiras: CategoriaFinanceira[];
  setCategoriasFinanceiras: React.Dispatch<React.SetStateAction<CategoriaFinanceira[]>>;
  historicosPadrao: HistoricoPadrao[];
  setHistoricosPadrao: React.Dispatch<React.SetStateAction<HistoricoPadrao[]>>;
  titulosFinanceiros: TituloFinanceiro[];
  setTitulosFinanceiros: React.Dispatch<React.SetStateAction<TituloFinanceiro[]>>;
  baixasTitulos: BaixaTitulo[];
  setBaixasTitulos: React.Dispatch<React.SetStateAction<BaixaTitulo[]>>;
  movimentosConta: MovimentoConta[];
  setMovimentosConta: React.Dispatch<React.SetStateAction<MovimentoConta[]>>;
  operadorasCartao: OperadoraCartao[];
  setOperadorasCartao: React.Dispatch<React.SetStateAction<OperadoraCartao[]>>;
  recebiveisCartao: RecebivelCartao[];
  setRecebiveisCartao: React.Dispatch<React.SetStateAction<RecebivelCartao[]>>;
  recebimentosOperadora: RecebimentoOperadora[];
  setRecebimentosOperadora: React.Dispatch<React.SetStateAction<RecebimentoOperadora[]>>;
  usuarios: Usuario[];
  setUsuarios: React.Dispatch<React.SetStateAction<Usuario[]>>;
  usuarioLogado: Usuario | null;
  setUsuarioLogado: React.Dispatch<React.SetStateAction<Usuario | null>>;
  temPermissao: (modulo: string) => boolean;
  onIntegrarAgenda: (agendamento: Agendamento, operadoraId?: number) => void;
  onIntegrarPDV: (venda: Venda, operadoraId?: number) => void;
  onIntegrarCompras: (entrada: EntradaMercadoria) => void;
  // New Props
  empresa: Empresa | null;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa | null>>;
  perfis: Perfil[];
  setPerfis: React.Dispatch<React.SetStateAction<Perfil[]>>;
  profissionais: Profissional[];
  setProfissionais: React.Dispatch<React.SetStateAction<Profissional[]>>;
  centrosResultados: CentroResultado[];
  setCentrosResultados: React.Dispatch<React.SetStateAction<CentroResultado[]>>;
}

export default function AppRoutes({ 
  clientes, setClientes, 
  pets, setPets, 
  produtos, setProdutos, 
  vendas, setVendas,
  caixaAberto, setCaixaAberto,
  movimentosCaixa, setMovimentosCaixa,
  contasFinanceiras, setContasFinanceiras,
  contasReceber, setContasReceber,
  contasPagar, setContasPagar,
  contratos, setContratos,
  agendamentos, setAgendamentos,
  movimentacoesEstoque, setMovimentacoesEstoque,
  fornecedores, setFornecedores,
  entradasMercadoria, setEntradasMercadoria,
  bancos, setBancos,
  contasBancarias, setContasBancarias,
  categoriasFinanceiras, setCategoriasFinanceiras,
  historicosPadrao, setHistoricosPadrao,
  titulosFinanceiros, setTitulosFinanceiros,
  baixasTitulos, setBaixasTitulos,
  movimentosConta, setMovimentosConta,
  operadorasCartao, setOperadorasCartao,
  recebiveisCartao, setRecebiveisCartao,
  recebimentosOperadora, setRecebimentosOperadora,
  usuarios, setUsuarios,
  usuarioLogado, setUsuarioLogado,
  temPermissao,
  onIntegrarAgenda,
  onIntegrarPDV,
  onIntegrarCompras,
  empresa, setEmpresa,
  perfis, setPerfis,
  profissionais, setProfissionais,
  centrosResultados, setCentrosResultados
}: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/login" element={<Login usuarios={usuarios} usuarioLogado={usuarioLogado} setUsuarioLogado={setUsuarioLogado} />} />
      
      <Route path="/" element={
        <ProtectedRoute usuarioLogado={usuarioLogado}>
          <MainLayout usuarioLogado={usuarioLogado} setUsuarioLogado={setUsuarioLogado} temPermissao={temPermissao} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/painel" replace />} />
        <Route path="painel" element={<Painel 
          vendas={vendas}
          contasReceber={contasReceber}
          contasPagar={contasPagar}
          contasFinanceiras={contasFinanceiras}
          produtos={produtos}
          caixaAberto={caixaAberto}
        />} />
        <Route path="atendimento" element={<Atendimento 
          clientes={clientes} 
          pets={pets} 
          produtos={produtos} 
          setProdutos={setProdutos}
          vendas={vendas} 
          setVendas={setVendas}
          caixaAberto={caixaAberto}
          setMovimentosCaixa={setMovimentosCaixa}
          setContasReceber={setContasReceber}
          contratos={contratos}
          setContratos={setContratos}
          operadorasCartao={operadorasCartao}
          onIntegrarFinanceiro={onIntegrarPDV}
        />} />
        <Route path="agenda" element={<Agenda 
          agendamentos={agendamentos} 
          setAgendamentos={setAgendamentos} 
          clientes={clientes} 
          pets={pets} 
          contratos={contratos}
          produtos={produtos}
          operadorasCartao={operadorasCartao}
          onIntegrarFinanceiro={onIntegrarAgenda}
        />} />
        <Route path="clientes" element={<Clientes clientes={clientes} setClientes={setClientes} pets={pets} setPets={setPets} />} />
        <Route path="pets" element={<Pets pets={pets} setPets={setPets} clientes={clientes} />} />
        <Route path="produtos" element={<Produtos produtos={produtos} setProdutos={setProdutos} />} />
        <Route path="estoque" element={<Estoque 
          produtos={produtos} 
          setProdutos={setProdutos}
          movimentacoesEstoque={movimentacoesEstoque}
          setMovimentacoesEstoque={setMovimentacoesEstoque}
        />} />
        <Route path="financeiro" element={<Financeiro 
          clientes={clientes}
          fornecedores={fornecedores}
          bancos={bancos}
          setBancos={setBancos}
          contasBancarias={contasBancarias}
          setContasBancarias={setContasBancarias}
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
        />} />
        <Route path="compras" element={<Compras 
          fornecedores={fornecedores}
          setFornecedores={setFornecedores}
          produtos={produtos}
          setProdutos={setProdutos}
          entradasMercadoria={entradasMercadoria}
          setEntradasMercadoria={setEntradasMercadoria}
          movimentacoesEstoque={movimentacoesEstoque}
          setMovimentacoesEstoque={setMovimentacoesEstoque}
          onIntegrarFinanceiro={onIntegrarCompras}
        />} />
        <Route path="caixa" element={<Caixa usuarioLogado={usuarioLogado} />} />
        <Route path="planos" element={<PlanosPage produtos={produtos} />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="configuracoes" element={<Configuracoes 
          empresa={empresa}
          setEmpresa={setEmpresa}
          usuarios={usuarios}
          setUsuarios={setUsuarios}
          perfis={perfis}
          setPerfis={setPerfis}
          profissionais={profissionais}
          setProfissionais={setProfissionais}
          centrosResultados={centrosResultados}
          setCentrosResultados={setCentrosResultados}
          categoriasFinanceiras={categoriasFinanceiras}
          setCategoriasFinanceiras={setCategoriasFinanceiras}
          produtos={produtos}
          setProdutos={setProdutos}
        />} />
      </Route>
    </Routes>
  );
}
