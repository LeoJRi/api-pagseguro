const axios = require('axios');
require('dotenv').config();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { valor, descricao } = req.body;

  try {
    // 1. Criar a cobrança
    const chargeResponse = await axios.post(
      `${process.env.PAGSEGURO_BASE_URL}/charges`,
      {
        reference_id: "123456789",  // ID único para identificar a cobrança
        amount: {
          value: valor,  // Valor em centavos (ex: 1000 para R$ 10,00)
          currency: "BRL",
        },
        description: descricao,  // Descrição da cobrança
        payment_method: "PIX",   // Método de pagamento (PIX)
        redirect_url: "https://seusite.com/pagamento",  // URL para redirecionamento
        notification_url: "https://seusite.com/notificacao", // URL para notificações
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAGSEGURO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const chargeData = chargeResponse.data;

    // 2. Gerar o código PIX (QR Code)
    const qrResponse = await axios.post(
      `${process.env.PAGSEGURO_BASE_URL}/instant-payments/qrcodes`,
      {
        reference_id: chargeData.reference_id,  // Usar o reference_id retornado
        amount: {
          value: valor,
        },
        description: descricao,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAGSEGURO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 3. Retornar a resposta com o código PIX
    res.status(200).json(qrResponse.data);
  } catch (error) {
    console.error('Erro ao criar pagamento via PIX:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao criar pagamento via PIX' });
  }
};
