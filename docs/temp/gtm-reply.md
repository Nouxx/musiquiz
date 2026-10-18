# Réponse

Hello,

C'est en place sur la preview, voici ce qui est fait et ce qu'il me faut de votre côté.

**Ce qui est fait**

1. **GTM par centre** : un champ « Google Tag Manager ID » dans chaque centre sur Sanity (onglet Tracking). Rempli, le conteneur se charge uniquement sur les pages de ce centre (FR et EN). Vide, rien ne se charge. Le GTM de Lille et Paris est à saisir par vous ou votre agence. Ensuite, publication puis bouton Deploy.
2. **GTM global** : même principe dans Site Settings > Tracking, chargé sur tout le site. Il me faut son ID, ou vous le saisissez directement.
3. **GA4** : rien à coder, à brancher dans le GTM global comme prévu.
4. **DataLayer réservation** (norme GA4) sur les pages Réserver et Offrir : `add_to_cart`, `remove_from_cart`, `begin_checkout`, `add_payment_info`, `purchase` (avec `transaction_id` = identifiant unique de la commande 4escape, et anti-doublon en cas de rechargement).
5. **DataLayer formulaires** : `generate_lead` à chaque envoi réussi, avec le nom du formulaire (`quotation`, `contact`, `franchise`) et le centre concerné.

Chaque page pousse aussi le centre, le type de page et la langue, pour que le GA4 global puisse filtrer par centre. La fiche technique ci-jointe est à transmettre aux agences.

**À noter sur 4escape**

4escape ne remplit pas le dataLayer lui-même : il émet seulement une partie des événements, et ni `begin_checkout` ni `purchase`. J'ai donc fait le pont côté site. Ça fonctionne, mais ça dépend du fonctionnement interne de leur widget, qui peut changer sans prévenir. Pouvez-vous leur demander :

- s'ils prévoient d'envoyer eux-mêmes les événements GA4 dans le dataLayer (dans ce cas je retire mon pont) ;
- si un envoi « purchase » côté serveur (GA4) est activé sur vos comptes, pour éviter de compter deux fois ;
- de ne pas modifier l'URL de retour après paiement dans leur back-office (elle doit revenir sur notre page Réserver / Offrir).

**Bloquant avant la mise en ligne : le bandeau cookies**

En France, GTM, GA4 et les tags Ads ne peuvent pas déposer de cookies sans consentement (CNIL). Le site n'a pas encore de bandeau. Je l'ai préparé : tout est refusé par défaut (Consent Mode v2), donc rien n'est déposé tant qu'un bandeau ne donne pas l'accord. Il faut choisir un outil (Axeptio, Didomi, Cookiebot…), que votre agence branchera dans le GTM global. Sans ce bandeau, GA4 et Ads ne remonteront quasiment aucune donnée.

Belle journée,
Clément
