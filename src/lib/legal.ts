/**
 * Legal content for Mada Customer Software.
 * Company-specific facts are placeholders ("À compléter" / "To be completed")
 * and must be filled in by the site owner before going live.
 */

export const TBD_FR = "À compléter";
export const TBD_EN = "To be completed";

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  slug: string;
  title: string;
  description: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_UPDATED = "2026-08-05";

export type LegalKey = "legal" | "privacy" | "terms" | "sales" | "cookies";

const fr: Record<LegalKey, LegalDoc> = {
  legal: {
    slug: "/mentions-legales",
    title: "Mentions légales",
    description:
      "Mentions légales de Mada Customer Software : éditeur, hébergeur, directeur de publication et propriété intellectuelle.",
    updated: LEGAL_UPDATED,
    intro:
      "Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, voici les informations relatives à l'éditeur et à l'hébergeur du site.",
    sections: [
      {
        heading: "Éditeur du site",
        body: [
          `Raison sociale : ${TBD_FR}`,
          `Forme juridique : ${TBD_FR}`,
          `Capital social : ${TBD_FR}`,
          `Siège social : ${TBD_FR}`,
          `SIRET : ${TBD_FR}`,
          `RCS : ${TBD_FR}`,
          `Numéro de TVA intracommunautaire : ${TBD_FR}`,
          `Adresse e-mail de contact : ${TBD_FR}`,
          `Téléphone : ${TBD_FR}`,
        ],
      },
      {
        heading: "Directeur de la publication",
        body: [`Directeur de la publication : ${TBD_FR}`],
      },
      {
        heading: "Hébergement",
        body: [
          "Le site et l'application sont hébergés sur l'infrastructure Vercel (Vercel Inc.) et ses fournisseurs cloud, avec des serveurs de base de données situés dans l'Union européenne.",
          `Coordonnées complètes de l'hébergeur : ${TBD_FR}`,
        ],
      },
      {
        heading: "Propriété intellectuelle",
        body: [
          "L'ensemble des contenus du site (marque, logo, textes, interfaces, code, visuels) est protégé par le droit de la propriété intellectuelle et reste la propriété de l'éditeur, sauf mention contraire.",
          "Toute reproduction, représentation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.",
        ],
      },
      {
        heading: "Signalement et responsabilité",
        body: [
          "L'éditeur s'efforce d'assurer l'exactitude des informations publiées mais ne peut garantir l'absence d'erreur ou d'interruption de service.",
          "Pour tout signalement de contenu ou de dysfonctionnement, écrivez à l'adresse de contact indiquée ci-dessus.",
        ],
      },
    ],
  },
  privacy: {
    slug: "/confidentialite",
    title: "Politique de confidentialité",
    description:
      "Comment Mada Customer Software collecte, utilise, conserve et protège vos données personnelles, conformément au RGPD.",
    updated: LEGAL_UPDATED,
    intro:
      "Cette politique décrit le traitement des données personnelles réalisé dans le cadre de l'utilisation de Mada Customer Software, conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés.",
    sections: [
      {
        heading: "Responsable de traitement",
        body: [
          `Le responsable de traitement est ${TBD_FR}, joignable à l'adresse ${TBD_FR}.`,
          `Délégué à la protection des données (le cas échéant) : ${TBD_FR}.`,
        ],
      },
      {
        heading: "Données collectées",
        body: [
          "Données de compte : adresse e-mail, identifiant utilisateur, date de création du compte, données d'authentification (y compris via Google si vous choisissez cette méthode).",
          "Données saisies par vous dans l'application : fiches clients (raison sociale, secteur, SIRET, contacts, adresses, sites web et réseaux sociaux, dates d'entrée, interactions et paiements, prix de vente, coûts et charges).",
          "Données techniques strictement nécessaires : journaux de connexion, adresse IP, type de navigateur, horodatage, à des fins de sécurité.",
          "Données de facturation en cas d'abonnement payant : identifiants d'abonnement et de client de paiement. Les données de carte bancaire sont traitées exclusivement par notre prestataire de paiement et ne transitent pas par nos serveurs.",
        ],
      },
      {
        heading: "Finalités et bases légales",
        body: [
          "Fourniture du service et gestion du compte : exécution du contrat.",
          "Facturation et gestion des abonnements : exécution du contrat et obligations légales comptables.",
          "Sécurité, prévention des abus et journalisation : intérêt légitime.",
          "Mesure d'audience et communications marketing éventuelles : consentement, révocable à tout moment.",
        ],
      },
      {
        heading: "Rôle de l'utilisateur professionnel",
        body: [
          "Lorsque vous enregistrez des données concernant vos propres clients, vous agissez en qualité de responsable de traitement pour ces données ; l'éditeur intervient comme sous-traitant au sens de l'article 28 du RGPD.",
          `Un accord de sous-traitance (DPA) peut être conclu sur demande à ${TBD_FR}.`,
        ],
      },
      {
        heading: "Destinataires et sous-traitants",
        body: [
          "Les données sont accessibles au personnel habilité de l'éditeur et aux sous-traitants techniques suivants : hébergement et base de données (infrastructure Vercel / Supabase, UE), authentification, paiement (Stripe), et messagerie transactionnelle.",
          "Aucune donnée n'est vendue ni louée à des tiers.",
        ],
      },
      {
        heading: "Transferts hors UE",
        body: [
          "Les données sont hébergées dans l'Union européenne. Lorsqu'un sous-traitant implique un transfert hors UE, celui-ci est encadré par les clauses contractuelles types de la Commission européenne.",
        ],
      },
      {
        heading: "Durées de conservation",
        body: [
          "Données de compte et données clients : pendant toute la durée du compte, puis suppression au plus tard 12 mois après la clôture.",
          "Documents comptables et factures : 10 ans, conformément aux obligations légales.",
          "Journaux techniques : 12 mois maximum.",
        ],
      },
      {
        heading: "Sécurité",
        body: [
          "Chiffrement des échanges (HTTPS), cloisonnement des données par compte au niveau de la base de données, contrôle d'accès par rôle, authentification par mot de passe ou fournisseur d'identité, sauvegardes régulières.",
        ],
      },
      {
        heading: "Vos droits",
        body: [
          "Vous disposez des droits d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité, ainsi que du droit de définir des directives post-mortem.",
          `Pour les exercer : ${TBD_FR}. Une réponse est apportée dans un délai maximal d'un mois.`,
          "Vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "Le site utilise uniquement des cookies et stockages locaux nécessaires au fonctionnement (session, langue, thème) et, sous réserve de votre consentement, des cookies de mesure d'audience. Voir la page Cookies.",
        ],
      },
    ],
  },
  terms: {
    slug: "/cgu",
    title: "Conditions générales d'utilisation",
    description:
      "Règles d'accès et d'utilisation de l'application Mada Customer Software : compte, obligations, disponibilité et responsabilité.",
    updated: LEGAL_UPDATED,
    intro:
      "Les présentes conditions générales d'utilisation (CGU) régissent l'accès et l'usage de l'application Mada Customer Software. L'utilisation du service vaut acceptation des CGU.",
    sections: [
      {
        heading: "Objet du service",
        body: [
          "Mada Customer Software est une application en ligne de suivi de portefeuille clients : saisie de fiches clients, calcul de marge et d'un score de santé, tableaux de bord et exports.",
        ],
      },
      {
        heading: "Compte utilisateur",
        body: [
          "La création d'un compte est nécessaire. Vous garantissez l'exactitude des informations fournies et la confidentialité de vos identifiants.",
          "Le service est réservé aux professionnels majeurs. Toute activité réalisée depuis votre compte est réputée effectuée par vous.",
        ],
      },
      {
        heading: "Usage autorisé",
        body: [
          "Il est interdit de tenter d'accéder aux données d'autres comptes, de contourner les limites d'usage, de procéder à de la rétro-ingénierie, d'envoyer des contenus illicites ou de perturber le service.",
          "Vous êtes responsable de la licéité des données que vous importez, notamment du respect du RGPD vis-à-vis de vos propres clients.",
        ],
      },
      {
        heading: "Disponibilité et évolutions",
        body: [
          "Le service est fourni en l'état, accessible 24h/24 hors maintenance et incidents. L'éditeur peut faire évoluer les fonctionnalités et informera des changements substantiels.",
        ],
      },
      {
        heading: "Responsabilité",
        body: [
          "Les scores et indicateurs sont des aides à la décision et n'ont aucune valeur de conseil financier, juridique ou comptable.",
          "La responsabilité de l'éditeur ne saurait être engagée pour les dommages indirects ou pour les décisions prises sur la base des indicateurs affichés.",
        ],
      },
      {
        heading: "Suspension et résiliation",
        body: [
          "Vous pouvez supprimer votre compte à tout moment. L'éditeur peut suspendre un compte en cas de manquement grave aux présentes CGU, après information sauf urgence.",
        ],
      },
      {
        heading: "Droit applicable",
        body: [
          "Les CGU sont soumises au droit français. À défaut de résolution amiable, compétence est attribuée aux tribunaux du ressort du siège de l'éditeur.",
        ],
      },
    ],
  },
  sales: {
    slug: "/cgv",
    title: "Conditions générales de vente",
    description:
      "Conditions d'abonnement à Mada Pro : prix, paiement, durée, résiliation et droit de rétractation.",
    updated: LEGAL_UPDATED,
    intro:
      "Les présentes conditions générales de vente (CGV) encadrent la souscription aux offres payantes de Mada Customer Software.",
    sections: [
      {
        heading: "Offres et prix",
        body: [
          "Offre Gratuite : 0 €, limitée à 30 clients enregistrés, sans export ni personnalisation de la formule de score.",
          "Offre Pro : 10 € par mois, clients illimités, export CSV/Excel, formule de score personnalisable et support.",
          "Les prix sont indiqués en euros. Les mentions de TVA applicables sont précisées lors du paiement.",
        ],
      },
      {
        heading: "Commande et paiement",
        body: [
          "La souscription s'effectue en ligne via notre prestataire de paiement Stripe. Le paiement s'effectue par carte bancaire lors de la souscription puis à chaque échéance mensuelle.",
          "L'accès aux fonctionnalités Pro est activé dès confirmation du paiement.",
        ],
      },
      {
        heading: "Durée, reconduction et résiliation",
        body: [
          "L'abonnement est conclu pour un mois, reconduit tacitement chaque mois.",
          "Il peut être résilié à tout moment depuis l'espace de gestion de l'abonnement ; l'accès Pro reste actif jusqu'à la fin de la période en cours et aucun nouveau prélèvement n'est effectué.",
        ],
      },
      {
        heading: "Facturation",
        body: [
          "Une facture est émise à chaque échéance et mise à disposition dans l'espace de gestion de l'abonnement.",
        ],
      },
      {
        heading: "Droit de rétractation",
        body: [
          "Le service s'adresse à des professionnels agissant dans le cadre de leur activité ; le droit de rétractation prévu pour les consommateurs ne s'applique pas, sauf disposition légale contraire.",
          "L'offre gratuite jusqu'à 30 clients permet d'évaluer le service avant tout paiement.",
        ],
      },
      {
        heading: "Défaut de paiement",
        body: [
          "En cas d'échec de paiement, l'accès aux fonctionnalités Pro peut être suspendu après relance. Les données restent accessibles en lecture dans les limites de l'offre gratuite.",
        ],
      },
      {
        heading: "Réclamations",
        body: [
          `Toute réclamation peut être adressée à ${TBD_FR}. Médiation de la consommation, le cas échéant : ${TBD_FR}.`,
        ],
      },
    ],
  },
  cookies: {
    slug: "/cookies",
    title: "Politique de cookies",
    description:
      "Cookies et traceurs utilisés par Mada Customer Software : finalités, durées et gestion de votre consentement.",
    updated: LEGAL_UPDATED,
    intro:
      "Cette page détaille les cookies et technologies de stockage local utilisés sur le site et dans l'application.",
    sections: [
      {
        heading: "Cookies strictement nécessaires",
        body: [
          "Session d'authentification : maintien de votre connexion sécurisée. Durée : jusqu'à la déconnexion ou l'expiration du jeton.",
          "Préférences d'interface : langue et thème clair/sombre, stockés localement dans votre navigateur. Durée : jusqu'à effacement par vos soins.",
          "Consentement cookies : mémorisation de votre choix. Durée : 6 mois.",
          "Ces traceurs sont exemptés de consentement car indispensables au service.",
        ],
      },
      {
        heading: "Cookies de mesure d'audience",
        body: [
          "Ils ne sont déposés qu'après votre acceptation et servent à comprendre l'usage des pages de manière agrégée. Durée maximale : 13 mois.",
        ],
      },
      {
        heading: "Cookies de paiement",
        body: [
          "Lors du passage au paiement, notre prestataire Stripe peut déposer des cookies nécessaires à la sécurisation de la transaction et à la lutte contre la fraude.",
        ],
      },
      {
        heading: "Gérer votre choix",
        body: [
          "Vous pouvez modifier ou retirer votre consentement à tout moment via le bouton « Gérer les cookies » présent en bas de page, ou en configurant votre navigateur pour bloquer ou supprimer les cookies.",
        ],
      },
    ],
  },
};

const en: Record<LegalKey, LegalDoc> = {
  legal: {
    slug: "/mentions-legales",
    title: "Legal notice",
    description:
      "Legal notice for Mada Customer Software: publisher, hosting provider, publication director and intellectual property.",
    updated: LEGAL_UPDATED,
    intro:
      "This page identifies the publisher and the hosting provider of the website and application, as required by applicable law.",
    sections: [
      {
        heading: "Publisher",
        body: [
          `Company name: ${TBD_EN}`,
          `Legal form: ${TBD_EN}`,
          `Share capital: ${TBD_EN}`,
          `Registered office: ${TBD_EN}`,
          `Company registration number: ${TBD_EN}`,
          `VAT number: ${TBD_EN}`,
          `Contact email: ${TBD_EN}`,
          `Phone: ${TBD_EN}`,
        ],
      },
      { heading: "Publication director", body: [`Publication director: ${TBD_EN}`] },
      {
        heading: "Hosting",
        body: [
          "The website and application run on the Vercel infrastructure (Vercel Inc.) and its cloud providers, with database servers located in the European Union.",
          `Full hosting provider details: ${TBD_EN}`,
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "All content (brand, logo, texts, interfaces, code, visuals) is protected by intellectual property law and remains the property of the publisher unless stated otherwise.",
          "Any reproduction or use, in whole or in part, without prior written consent is prohibited.",
        ],
      },
      {
        heading: "Reporting and liability",
        body: [
          "The publisher takes care to keep published information accurate but cannot guarantee the absence of errors or service interruptions.",
          "To report content or a malfunction, use the contact address above.",
        ],
      },
    ],
  },
  privacy: {
    slug: "/confidentialite",
    title: "Privacy policy",
    description:
      "How Mada Customer Software collects, uses, stores and protects personal data, in line with the GDPR.",
    updated: LEGAL_UPDATED,
    intro:
      "This policy explains how personal data is processed when you use Mada Customer Software, in accordance with Regulation (EU) 2016/679 (GDPR).",
    sections: [
      {
        heading: "Data controller",
        body: [
          `The data controller is ${TBD_EN}, reachable at ${TBD_EN}.`,
          `Data protection officer (if appointed): ${TBD_EN}.`,
        ],
      },
      {
        heading: "Data we collect",
        body: [
          "Account data: email address, user ID, account creation date, authentication data (including Google sign-in if you use it).",
          "Data you enter in the app: client records (company name, industry, registration number, contacts, addresses, websites and social profiles, entry date, interactions and payments, sale price, cost price and charges).",
          "Strictly necessary technical data: connection logs, IP address, browser type and timestamps, for security purposes.",
          "Billing data for paid plans: subscription and customer identifiers. Card details are handled solely by our payment provider and never reach our servers.",
        ],
      },
      {
        heading: "Purposes and legal bases",
        body: [
          "Providing the service and managing your account: performance of the contract.",
          "Billing and subscription management: contract performance and legal accounting obligations.",
          "Security, abuse prevention and logging: legitimate interest.",
          "Audience measurement and any marketing communication: consent, withdrawable at any time.",
        ],
      },
      {
        heading: "Your role as a business user",
        body: [
          "When you store data about your own customers, you act as the data controller for that data and the publisher acts as a processor under Article 28 GDPR.",
          `A data processing agreement can be signed on request at ${TBD_EN}.`,
        ],
      },
      {
        heading: "Recipients and processors",
        body: [
          "Data is accessible to authorised staff and to the following technical processors: hosting and database (Vercel / Supabase infrastructure, EU), authentication, payment (Stripe) and transactional email.",
          "Data is never sold or rented to third parties.",
        ],
      },
      {
        heading: "Transfers outside the EU",
        body: [
          "Data is hosted in the European Union. Where a processor involves a transfer outside the EU, it is covered by the European Commission's standard contractual clauses.",
        ],
      },
      {
        heading: "Retention",
        body: [
          "Account and client data: for the lifetime of the account, then deleted no later than 12 months after closure.",
          "Accounting records and invoices: 10 years, as legally required.",
          "Technical logs: 12 months maximum.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Encrypted transport (HTTPS), per-account data isolation enforced at database level, role-based access control, password or identity-provider authentication, and regular backups.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You have the rights of access, rectification, erasure, restriction, objection and portability.",
          `To exercise them: ${TBD_EN}. We answer within one month at most.`,
          "You may lodge a complaint with your national data protection authority (in France, the CNIL).",
        ],
      },
      {
        heading: "Cookies",
        body: [
          "The site only uses cookies and local storage necessary for operation (session, language, theme) and, subject to your consent, audience-measurement cookies. See the Cookies page.",
        ],
      },
    ],
  },
  terms: {
    slug: "/cgu",
    title: "Terms of use",
    description:
      "Rules for accessing and using Mada Customer Software: account, obligations, availability and liability.",
    updated: LEGAL_UPDATED,
    intro:
      "These terms of use govern access to and use of the Mada Customer Software application. Using the service means accepting them.",
    sections: [
      {
        heading: "Purpose of the service",
        body: [
          "Mada Customer Software is an online client-portfolio tool: client records, margin and health-score computation, dashboards and exports.",
        ],
      },
      {
        heading: "User account",
        body: [
          "An account is required. You warrant the accuracy of the information provided and keep your credentials confidential.",
          "The service is reserved for adult business users. Any activity from your account is deemed to be yours.",
        ],
      },
      {
        heading: "Acceptable use",
        body: [
          "You must not attempt to access other accounts' data, bypass usage limits, reverse-engineer the service, upload unlawful content or disrupt the service.",
          "You are responsible for the lawfulness of the data you import, including GDPR compliance towards your own customers.",
        ],
      },
      {
        heading: "Availability and changes",
        body: [
          "The service is provided as is, available around the clock apart from maintenance and incidents. Features may evolve; material changes will be communicated.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "Scores and indicators are decision-support tools and do not constitute financial, legal or accounting advice.",
          "The publisher is not liable for indirect damages or for decisions taken on the basis of displayed indicators.",
        ],
      },
      {
        heading: "Suspension and termination",
        body: [
          "You may delete your account at any time. The publisher may suspend an account in the event of a serious breach of these terms, with prior notice except in emergencies.",
        ],
      },
      {
        heading: "Governing law",
        body: [
          "These terms are governed by French law. Failing an amicable settlement, the courts of the publisher's registered office have jurisdiction.",
        ],
      },
    ],
  },
  sales: {
    slug: "/cgv",
    title: "Terms of sale",
    description:
      "Mada Pro subscription terms: pricing, payment, duration, cancellation and withdrawal rights.",
    updated: LEGAL_UPDATED,
    intro:
      "These terms of sale govern subscriptions to the paid plans of Mada Customer Software.",
    sections: [
      {
        heading: "Plans and pricing",
        body: [
          "Free plan: €0, limited to 30 stored clients, without exports or score-formula customisation.",
          "Pro plan: €10 per month, unlimited clients, CSV/Excel export, customisable score formula and support.",
          "Prices are in euros. Applicable VAT is shown at checkout.",
        ],
      },
      {
        heading: "Order and payment",
        body: [
          "Subscriptions are taken out online through our payment provider Stripe. Payment is made by card at subscription and then monthly.",
          "Pro features are unlocked as soon as payment is confirmed.",
        ],
      },
      {
        heading: "Duration, renewal and cancellation",
        body: [
          "The subscription runs for one month and renews automatically each month.",
          "It can be cancelled at any time from the subscription management area; Pro access remains until the end of the current period and no further charge is made.",
        ],
      },
      {
        heading: "Invoicing",
        body: [
          "An invoice is issued at each renewal and made available in the subscription management area.",
        ],
      },
      {
        heading: "Right of withdrawal",
        body: [
          "The service targets business users acting in a professional capacity; the consumer right of withdrawal does not apply unless legally required.",
          "The free plan up to 30 clients allows you to evaluate the service before paying.",
        ],
      },
      {
        heading: "Payment failure",
        body: [
          "If a payment fails, Pro features may be suspended after a reminder. Data stays readable within the limits of the free plan.",
        ],
      },
      {
        heading: "Complaints",
        body: [`Complaints can be sent to ${TBD_EN}. Consumer mediation, if applicable: ${TBD_EN}.`],
      },
    ],
  },
  cookies: {
    slug: "/cookies",
    title: "Cookie policy",
    description:
      "Cookies and trackers used by Mada Customer Software: purposes, lifetimes and how to manage your consent.",
    updated: LEGAL_UPDATED,
    intro:
      "This page details the cookies and local-storage technologies used on the website and in the application.",
    sections: [
      {
        heading: "Strictly necessary cookies",
        body: [
          "Authentication session: keeps you securely signed in. Lifetime: until sign-out or token expiry.",
          "Interface preferences: language and light/dark theme, stored locally in your browser. Lifetime: until you clear them.",
          "Cookie consent: stores your choice. Lifetime: 6 months.",
          "These trackers are exempt from consent because they are essential to the service.",
        ],
      },
      {
        heading: "Audience-measurement cookies",
        body: [
          "They are only set after you accept and are used to understand page usage in aggregate. Maximum lifetime: 13 months.",
        ],
      },
      {
        heading: "Payment cookies",
        body: [
          "At checkout, our provider Stripe may set cookies required to secure the transaction and prevent fraud.",
        ],
      },
      {
        heading: "Managing your choice",
        body: [
          "You can change or withdraw your consent at any time using the “Manage cookies” button in the footer, or by configuring your browser to block or delete cookies.",
        ],
      },
    ],
  },
};

export function getLegalDoc(key: LegalKey, locale: string): LegalDoc {
  return locale === "fr" ? fr[key] : en[key];
}

export const LEGAL_SLUGS: Record<LegalKey, string> = {
  legal: "/mentions-legales",
  privacy: "/confidentialite",
  terms: "/cgu",
  sales: "/cgv",
  cookies: "/cookies",
};
