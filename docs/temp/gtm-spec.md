# Mail

Hello !!

Comme je disais, on doit s’attaquer au sujet des GTM et Analytics.
Je vais envoyer le preview du site à notre agence qui gère le tracking de nos Ads pour faire la configuration. Pour ce tracking, on a plusieurs codes à intégrer (Google tag manager, google analytics).

Comme on a plusieurs agences/intervenants qui gèrent le tracking de centres différents (Lille, Paris, Lyon, Avignon, Toulon… ont leur prestataire), voici ce dont on aurait besoin :

1. GTM
   Pour chaque centre, la possibilité d’ajouter un GTM sur les pages de ce centre (pas obligatoire, on track uniquement les centres qui utilisent 4escape pour leur résa)

Dans Sanity : Ajouter un champ texte ID GTM (ex: GTM-XXXXXX)
Sur le site : Faire en sorte que le script GTM correspondant s'injecte dynamiquement selon la page/centre consulté (pour que l'agence d'Avignon ne reçoive que les données d'Avignon, etc.).

- un GTM Global : Prévois aussi un emplacement pour un GTM Global sur tout le site (pour nos outils communs). Il peut être coder en dur si c’est plus simple,.

2. Analytics (GA4)
   On aura un seul compte GA4 Global pour tout Musi'Quiz, qu'on branchera directement dans le GTM Global (pas besoin de code spécifique pour ça).

3. DataLayer (Tunnel de réservation)
   Il faudrait mettre en place un DataLayer (norme GA4) propre sur tout le tunnel de réservation. 4-escape injecte normalement toutes les données,

- add_to_cart (sélection de session / options)
- begin_checkout (arrivée sur le paiement/coordonnées)
- add_payment_info (choix du mode de paiement)
- purchase (réservation validée et payée)

Pour l'événement purchase, inclure le transaction_id (l'ID unique de la réservation) dans le DataLayer pour éviter les doublons.

4. DataLayer Formulaires (Leads)
   On souhaite aussi suivre les demandes de devis / formulaires de franchises
   Peux-tu pousser un événement dans le DataLayer lors d'un envoi de formulaire réussi (ex: generate_lead ou form_submit) avec le nom du formulaire et le centre concerné ?

Si besoin, voici le GTM de Lille et Paris :

Dans le Head :

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MPTRL2XB');</script>
<!-- End Google Tag Manager -->

Dans le Body :

<!-- Google Tag Manager (noscript) -->

<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MPTRL2XB"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

<!-- End Google Tag Manager (noscript) -->
