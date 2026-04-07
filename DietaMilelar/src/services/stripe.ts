import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key
// For development, we can use a placeholder or environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

export default stripePromise;
