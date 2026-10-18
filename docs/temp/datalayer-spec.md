# Musi'Quiz — fiche dataLayer

Pour les agences qui configurent un conteneur GTM sur le site Musi'Quiz.

## Conteneurs

- **Global** (Musi'Quiz) : chargé sur toutes les pages. GA4 y est branché.
- **Par centre** (votre agence) : chargé uniquement sur les pages du centre, `/<centre>/…` et `/en/<centre>/…`, à côté du global.
- Un seul `dataLayer` partagé : chaque conteneur voit tous les événements de la page.
- Actif sur la preview et la production. Filtrez par nom d'hôte (`Page Hostname`) pour séparer la preview de la production.

## Consentement

Consent Mode v2, posé avant tout conteneur :

```js
gtag("consent", "default", {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  wait_for_update: 500,
});
```

Le bandeau cookies (CMP), chargé par le conteneur global, envoie le `consent update`.

## Contexte de page

Premier élément du `dataLayer` sur chaque page, avant `gtm.js` :

| Clé | Valeurs |
| --- | --- |
| `venue` | slug du centre (`paris`, `lille`, `avignon`…). Absent hors pages centre. |
| `page_type` | `book` (Réserver), `gift` (Offrir), `content` (le reste) |
| `language` | `fr`, `en` |

## Tunnel de réservation (pages `book` et `gift`)

Événements e-commerce GA4. Chaque push est précédé de `{ ecommerce: null }`.

| Événement | Déclencheur |
| --- | --- |
| `add_to_cart` | ajout au panier (session, options, bon cadeau) |
| `remove_from_cart` | retrait du panier |
| `begin_checkout` | arrivée sur l'étape coordonnées / paiement |
| `add_payment_info` | choix du mode de paiement (`payment_type`) |
| `purchase` | paiement confirmé |

Format de `ecommerce`, fourni par 4escape (valeurs d’exemple) :

```js
{
  currency: "EUR",
  value: 120,
  items: [
    {
      item_id: "SALLE-REF",
      item_name: "Blind Test - Adulte",
      price: 30,
      quantity: 4,
      room_reference: "SALLE-REF",   // réservations seulement
      booking_start: "2026-11-02T20:00:00+01:00",
    },
  ],
}
```

Pour `purchase` en plus :

- `transaction_id` : identifiant unique de la commande 4escape. Envoyé une seule fois par commande et par navigateur.
- `payment_option` : `total` ou `deposit` (acompte). `value` reste le montant total de la commande.
- Rare : si les données du panier sont perdues (autre appareil, stockage bloqué), `purchase` part avec `transaction_id` seul.

## Formulaires

Après un envoi réussi :

```js
{ event: "generate_lead", form_name: "quotation", venue: "paris" }
```

| `form_name` | Formulaire | `venue` |
| --- | --- | --- |
| `quotation` | demande de devis | centre du formulaire |
| `contact` | contact centre | centre du formulaire |
| `franchise` | rejoindre le réseau | absent |

Aucune donnée personnelle dans le `dataLayer`.
