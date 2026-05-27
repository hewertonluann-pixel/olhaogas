import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();
const db = admin.firestore();

// Inicializa o Stripe com a chave secreta definida nas env das Functions:
// firebase functions:config:set stripe.secret="sk_live_..."
// firebase functions:config:set stripe.webhook_secret="whsec_..."
const stripe = new Stripe(functions.config().stripe.secret, {
  apiVersion: '2024-04-10',
});

// ---------------------------------------------------------------------------
// createPaymentIntent
// Chamada pelo frontend ao confirmar pedido.
// Recebe o sellerId, os Price IDs e as quantidades,
// busca os preços oficiais no Stripe e cria o PaymentIntent.
// ---------------------------------------------------------------------------
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  const {
    orderId,
    sellerId,
    gasQuantity,
    waterQuantity,
    gasPriceId,    // ex: 'price_1TAxTkJ2xBR0EGNTpAsGi9Sz'
    waterPriceId,  // ex: 'price_1Tbn8RJ2xBR0EGNTEBlZoa3l'
  } = data;

  if (!orderId || !sellerId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId e sellerId são obrigatórios.');
  }
  if ((gasQuantity ?? 0) + (waterQuantity ?? 0) === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Ao menos um produto deve ter quantidade > 0.');
  }

  let totalAmount = 0;

  // Busca preço do gás no Stripe (fonte de verdade)
  if (gasQuantity > 0 && gasPriceId) {
    const gasPrice = await stripe.prices.retrieve(gasPriceId);
    totalAmount += (gasPrice.unit_amount ?? 0) * gasQuantity;
  }

  // Busca preço da água no Stripe (fonte de verdade)
  if (waterQuantity > 0 && waterPriceId) {
    const waterPrice = await stripe.prices.retrieve(waterPriceId);
    totalAmount += (waterPrice.unit_amount ?? 0) * waterQuantity;
  }

  if (totalAmount === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Valor total não pôde ser calculado.');
  }

  // Cria o PaymentIntent no Stripe
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,      // valor em centavos
    currency: 'brl',
    payment_method_types: ['card'], // adicionar 'pix' quando habilitado na conta
    metadata: {
      orderId,
      sellerId,
      gasQuantity: String(gasQuantity ?? 0),
      waterQuantity: String(waterQuantity ?? 0),
    },
  });

  functions.logger.info(`PaymentIntent criado: ${paymentIntent.id} — R$ ${(totalAmount / 100).toFixed(2)}`, { orderId });

  return {
    clientSecret: paymentIntent.client_secret,
    totalAmount,  // em centavos — frontend pode exibir dividido por 100
  };
});

// ---------------------------------------------------------------------------
// stripeWebhook
// Endpoint HTTPS chamado pelo Stripe ao confirmar/falhar pagamentos.
// Configure no Stripe Dashboard: Developers → Webhooks → Add endpoint
// URL: https://<region>-<project>.cloudfunctions.net/stripeWebhook
// Eventos a escutar: payment_intent.succeeded, payment_intent.payment_failed
// ---------------------------------------------------------------------------
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      functions.config().stripe.webhook_secret
    );
  } catch (err: any) {
    functions.logger.error('Webhook signature inválida:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const pi = event.data.object as Stripe.PaymentIntent;
  const { orderId, sellerId } = pi.metadata ?? {};

  switch (event.type) {
    case 'payment_intent.succeeded': {
      functions.logger.info(`Pagamento confirmado: ${pi.id}`, { orderId, sellerId });

      if (orderId) {
        // Atualiza todos os pedidos com este orderId prefix no Firestore
        // (pode haver 2 pedidos: gás + água com IDs distintos mas mesmo prefixo)
        const snapshot = await db.collection('orders')
          .where('orderId', '==', orderId)
          .get();

        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.update(doc.ref, {
            paymentStatus: 'Pago',
            stripePaymentIntentId: pi.id,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      functions.logger.warn(`Pagamento falhou: ${pi.id}`, { orderId, sellerId });

      if (orderId) {
        const snapshot = await db.collection('orders')
          .where('orderId', '==', orderId)
          .get();

        const batch = db.batch();
        snapshot.forEach(doc => {
          batch.update(doc.ref, { paymentStatus: 'Falhou' });
        });
        await batch.commit();
      }
      break;
    }

    default:
      functions.logger.info(`Evento ignorado: ${event.type}`);
  }

  res.json({ received: true });
});
