import { getAgendamentos, createAgendamento } from './db';

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const agendamentos = await getAgendamentos();
      return res.status(200).json(agendamentos);
    }

    if (req.method === 'POST') {
      const { clienteId, petId, servico, dataInicio, dataFim } = req.body;
      if (!clienteId || !servico || !dataInicio || !dataFim) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      const novoAgendamento = await createAgendamento(req.body);
      return res.status(201).json(novoAgendamento);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in agendamentos handler:', error);
    return res.status(500).json({ error: error.message });
  }
}
