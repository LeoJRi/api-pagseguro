try {
  const response = await axios.post(
    'https://api.pagseguro.uol.com.br/instant-payments/qrcodes',
    payload,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAGSEGURO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }
  );
  console.log('Resposta do PagSeguro:', response.data);
} catch (error) {
  console.error('Erro ao criar pagamento via PIX:', error.response ? error.response.data : error.message);
}
require('dotenv').config();

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { valor, descricao, referenceId, customer, items, shipping, notificationUrls } = req.body;

  try {
    // URL da API do PagSeguro para criar o pagamento via PIX
    const apiUrl = `${process.env.PAGSEGURO_BASE_URL}/instant-payments/qrcodes`;

    const payload = {
      reference_id: referenceId,  // ID de referência
      customer: {
        name: customer.name,  // Nome do cliente
        email: customer.email,  // E-mail do cliente
        tax_id: customer.taxId,  // CPF ou CNPJ do cliente
        phones: customer.phones,  // Telefones do cliente
      },
      items: items,  // Lista de itens
      qr_codes: [
        {
          amount: {
            value: valor,  // Valor em centavos (ex: 500 para R$ 5,00)
          },
          expiration_date: "2021-08-29T20:15:59-03:00",  // Data de expiração do QR code
        },
      ],
      shipping: shipping,  // Informações de envio
      notification_urls: notificationUrls,  // URLs para notificações
    };

    // Enviando a requisição para a API do PagSeguro
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${process.env.PAGSEGURO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // Retornando a resposta da API, que pode incluir o QR code, link para o pagamento, etc.
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Erro ao criar pagamento via PIX:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao criar pagamento via PIX' });
  }
};
