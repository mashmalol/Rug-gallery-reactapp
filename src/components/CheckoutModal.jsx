import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { api } from '../lib/api.js';

const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

function CheckoutForm({ amount, onSuccess, onClose }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(confirmError.message);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="auth-error">{error}</div>}
      <PaymentElement />
      <button type="submit" className="auth-submit" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
      <button type="button" className="auth-switch" onClick={onClose}>Cancel</button>
    </form>
  );
}

export default function CheckoutModal({ rug, onClose, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (!stripePromise) {
      setError('Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY to .env');
      setLoading(false);
      return;
    }

    const numericPrice = parseFloat(rug.price.replace(/[^0-9.]/g, ''));

    api.createPaymentIntent({
      rugTitle: rug.title,
      rugImage: rug.image,
      amount: numericPrice,
    })
      .then((data) => setClientSecret(data.clientSecret))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [rug]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal checkout-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2>Checkout</h2>
        <div className="checkout-rug">
          <img src={rug.image} alt={rug.title} />
          <div>
            <strong>{rug.title}</strong>
            <span>{rug.price}</span>
          </div>
        </div>

        {loading && <p>Loading payment form...</p>}
        {error && <div className="auth-error">{error}</div>}

        {clientSecret && stripePromise && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              amount={parseFloat(rug.price.replace(/[^0-9.]/g, ''))}
              onSuccess={onSuccess}
              onClose={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
