import { DuvidasFrequentesItem } from '../types';

export const getCourseSchema = () => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Dieta Milenar - Protocolo Completo",
  "description": "Método ancestral baseado nas dietas do Antigo Egito para reativar o metabolismo e emagrecer com saúde.",
  "provider": {
    "@type": "Organization",
    "name": "Dieta Milenar",
    "sameAs": "https://dietasmilenares.com.br"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "8000"
  },
  "offers": {
    "@type": "Offer",
    "category": "Paid",
    "priceCurrency": "BRL",
    "price": "147.00"
  }
});

export const getFAQSchema = (items: DuvidasFrequentesItem[]) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": items.map(item => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer
    }
  }))
});
