<?php
/**
 * Initial php scoring script from Wordpress, delete when properly implemented1
 */
add_action( 'elementor_pro/forms/new_record', function( $record, $handler ) {

    $form_name = $record->get_form_settings( 'form_name' );

    if ( 'Franchise Musiquiz' !== $form_name ) {
        return;
    }

    $raw_fields = $record->get( 'fields' );
    $f = array();
    foreach ( $raw_fields as $id => $field ) {
        $f[ $id ] = isset( $field['value'] ) ? $field['value'] : '';
    }

    // === BARÈMES PAR FAMILLE (TOTAL : 100 pts) ===

    // 1. Capacité financière (25 pts)
    $bareme_apport = array(
        "Plus de 80 000 €"        => 25,
        "50 000 € à 80 000 €"     => 20,
        "20 000 € à 50 000 €"     => 14,
        "10 000 € à 20 000 €"     => 8,
        "5 000 € à 10 000 €"      => 3,
        "Moins de 5 000 €"        => 0,
    );

    // 2. Maturité opérationnelle (25 pts) : profil + local avec anti-cumul
    $bareme_profil = array(
        "Gérant·e d'un centre de loisirs / multi-activités existant" => 15,
        "Entrepreneur·e déjà installé·e dans un autre secteur"       => 12,
        "Investisseur·euse"                                          => 10,
        "Porteur·se de projet, je veux créer mon activité"           => 7,
        "Autre"                                                      => 4,
    );
    $bareme_local = array(
        "J'ai déjà un local"                       => 10,
        "Je n'en ai pas besoin (centre existant)"  => 8,
        "J'ai identifié des pistes"                => 6,
        "Je dois encore en chercher un"            => 2,
    );

    // 3. Adéquation projet (20 pts) : intention + population
    // Le multi-activités est privilégié (modèle le plus aligné avec la stratégie réseau)
    $bareme_intention = array(
        "Ouvrir un centre multi-activités"                    => 12,
        "Intégrer Musi'Quiz dans un centre existant"          => 10,
        "Ouvrir un centre Musi'Quiz dédié (mono-activité)"    => 8,
        "Je découvre, je veux d'abord en savoir plus"         => 2,
    );
    $bareme_population = array(
        "Plus de 500 000 hab."        => 8,
        "150 000 à 500 000 hab."      => 6,
        "50 000 à 150 000 hab."       => 4,
        "Moins de 50 000 hab."        => 1,
    );

    // 4. Timing (15 pts)
    $bareme_horizon = array(
        "Dans les 6 prochains mois"  => 15,
        "Dans 6 à 12 mois"           => 12,
        "Dans 12 à 24 mois"          => 6,
        "Pas encore défini"          => 0,
    );

    // 5. Profil entrepreneurial (15 pts) : expérience + associés
    $bareme_experience = array(
        "Je travaille actuellement dans le secteur loisirs / restauration / événementiel" => 10,
        "J'ai déjà créé/géré une ou plusieurs entreprises"                                => 8,
        "Ce serait ma première création"                                                  => 3,
    );
    $bareme_associes = array(
        "En groupe (3+)"        => 5,
        "Avec 1 associé·e"      => 4,
        "Seul·e"                => 2,
        "Pas encore défini"     => 0,
    );

    // === RÉCUPÉRATION DES VALEURS ===
    $v_apport     = isset($f['apport'])     ? trim($f['apport'])     : '';
    $v_profil     = isset($f['profil'])     ? trim($f['profil'])     : '';
    $v_local      = isset($f['local'])      ? trim($f['local'])      : '';
    $v_intention  = isset($f['intention'])  ? trim($f['intention'])  : '';
    $v_population = isset($f['population']) ? trim($f['population']) : '';
    $v_horizon    = isset($f['horizon'])    ? trim($f['horizon'])    : '';
    $v_experience = isset($f['experience']) ? trim($f['experience']) : '';
    $v_associes   = isset($f['associes'])   ? trim($f['associes'])   : '';

    // === CALCUL PAR FAMILLE ===

    // Famille 1 : Capacité financière
    $score_finance = isset($bareme_apport[$v_apport]) ? $bareme_apport[$v_apport] : 0;

    // Famille 2 : Maturité opérationnelle (anti-cumul)
    $pts_profil = isset($bareme_profil[$v_profil]) ? $bareme_profil[$v_profil] : 0;
    $pts_local  = isset($bareme_local[$v_local])   ? $bareme_local[$v_local]   : 0;
    // Anti-cumul : si profil "Gérant centre" + local "Pas besoin", on déduit (redondance)
    if ( $v_profil === "Gérant·e d'un centre de loisirs / multi-activités existant"
         && $v_local === "Je n'en ai pas besoin (centre existant)" ) {
        $pts_local = 3; // au lieu de 8, pour éviter le double comptage
    }
    $score_maturite = $pts_profil + $pts_local;

    // Famille 3 : Adéquation projet
    $pts_intention  = isset($bareme_intention[$v_intention])   ? $bareme_intention[$v_intention]   : 0;
    $pts_population = isset($bareme_population[$v_population]) ? $bareme_population[$v_population] : 0;
    $score_adequation = $pts_intention + $pts_population;

    // Famille 4 : Timing
    $score_timing = isset($bareme_horizon[$v_horizon]) ? $bareme_horizon[$v_horizon] : 0;

    // Famille 5 : Profil entrepreneurial
    $pts_experience = isset($bareme_experience[$v_experience]) ? $bareme_experience[$v_experience] : 0;
    $pts_associes   = isset($bareme_associes[$v_associes])     ? $bareme_associes[$v_associes]     : 0;
    $score_entrepreneur = $pts_experience + $pts_associes;

    // === SCORE TOTAL (sur 100) ===
    $score_brut = $score_finance + $score_maturite + $score_adequation + $score_timing + $score_entrepreneur;

    // === KNOCKOUT CRITERIA ===
    $cap = 100; // pas de plafond par défaut

    // KO 1 : apport < 5k → plafond LOW PRIORITY (max 34)
    if ( $v_apport === "Moins de 5 000 €" ) {
        $cap = 34;
    }

    // KO 2 : apport < 10k + horizon indéfini + première création → plafond LOW PRIORITY
    if ( in_array( $v_apport, array( "Moins de 5 000 €", "5 000 € à 10 000 €" ) )
         && $v_horizon === "Pas encore défini"
         && $v_experience === "Ce serait ma première création" ) {
        $cap = 34;
    }

    // KO 3 : intention "Découvre" + horizon indéfini → plafond TIÈDE max
    if ( $v_intention === "Je découvre, je veux d'abord en savoir plus"
         && $v_horizon === "Pas encore défini" ) {
        $cap = min( $cap, 74 );
    }

    $score_capped = min( $score_brut, $cap );
    $ko_applied = ( $score_brut !== $score_capped );

    // === QUALIFICATION ===
    if ( $score_capped >= 75 ) {
        $qualif = '🔥 LEAD CHAUD';
    } elseif ( $score_capped >= 55 ) {
        $qualif = '🟡 LEAD TIÈDE';
    } elseif ( $score_capped >= 35 ) {
        $qualif = '🌱 NURTURING';
    } else {
        $qualif = '❄️ LOW PRIORITY';
    }

    $score_str = $score_capped . ' / 100 — ' . $qualif;

    // === HELPER ===
    $get = function( $id ) use ( $f ) {
        return isset( $f[ $id ] ) && $f[ $id ] !== '' ? $f[ $id ] : '—';
    };

    // === DESTINATAIRES ===
    $to = array( 'lioneltop@me.com' );
    
    // Bonus : les leads CHAUDS partent aussi à un commercial dédié (à activer si besoin)
    // if ( $score_capped >= 75 ) {
    //     $to[] = 'commercial@musiquizlejeu.fr';
    // }

    // === SUJET DE L'EMAIL ===
    $subject = '[FRANCHISE] ' . $qualif . ' (' . $score_capped . '/100) · ' . $get('prenom') . ' ' . $get('nom') . ' · ' . $get('ville');

    // === COULEURS DU BADGE SELON LA QUALIFICATION ===
    if ( $score_capped >= 75 ) {
        $badge_color = '#e74c3c'; $badge_bg = '#fdebe9';
    } elseif ( $score_capped >= 55 ) {
        $badge_color = '#f39c12'; $badge_bg = '#fdf4e3';
    } elseif ( $score_capped >= 35 ) {
        $badge_color = '#27ae60'; $badge_bg = '#e8f6ee';
    } else {
        $badge_color = '#5b8def'; $badge_bg = '#eaf0fb';
    }

    // === COMPOSITION DU MAIL HTML ===
    $body = '<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 700px; margin: auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">

      <!-- Logo Musi\'Quiz -->
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://musiquizlejeu.fr/wp-content/uploads/2025/05/texte-MusiQuiz-noir.png" alt="Musi\'Quiz" style="max-width: 250px; height: auto;">
      </div>

      <!-- Badge de qualification -->
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; padding: 8px 20px; background-color: ' . $badge_bg . '; color: ' . $badge_color . '; font-size: 14px; font-weight: bold; border-radius: 20px; letter-spacing: 0.5px;">
          ' . $qualif . ' &nbsp;·&nbsp; ' . $score_capped . ' / 100
        </span>
        ' . ( $ko_applied ? '<p style="font-size:12px; color:#999; margin-top:8px;">⚠️ Score plafonné (critère éliminatoire) — score brut : ' . $score_brut . '/100</p>' : '' ) . '
      </div>

      <h2 style="color: #3E3E3E;">🎯 Nouvelle demande de licence franchise</h2>
      <p style="font-size: 16px; color: #333;">
        Une nouvelle personne s\'intéresse à rejoindre le réseau Musi\'Quiz.<br>Voici les détails de sa demande :
      </p>

      <!-- Détail du score par famille -->
      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">📊 Détail du scoring</h3>
      <table style="width:100%; font-size:14px; color:#666; margin-top:10px; border-collapse:collapse;">
        <tr style="background:#f8f8f8;">
          <td style="padding:10px 12px;">💰 Capacité financière</td>
          <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#333;">' . $score_finance . ' / 25</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;">🏢 Maturité opérationnelle</td>
          <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#333;">' . $score_maturite . ' / 25</td>
        </tr>
        <tr style="background:#f8f8f8;">
          <td style="padding:10px 12px;">🎯 Adéquation projet</td>
          <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#333;">' . $score_adequation . ' / 20</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;">⏱️ Timing</td>
          <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#333;">' . $score_timing . ' / 15</td>
        </tr>
        <tr style="background:#f8f8f8;">
          <td style="padding:10px 12px;">🚀 Profil entrepreneurial</td>
          <td style="padding:10px 12px; text-align:right; font-weight:bold; color:#333;">' . $score_entrepreneur . ' / 15</td>
        </tr>
      </table>

      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">👤 Identité</h3>
      <table style="font-size: 16px; color: #333; margin-top: 10px; width: 100%;">
        <tr>
          <td style="padding: 6px 0; width: 200px;"><strong>Nom :</strong></td>
          <td style="padding: 6px 0;">' . $get('prenom') . ' ' . $get('nom') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Email :</strong></td>
          <td style="padding: 6px 0;"><a href="mailto:' . $get('email') . '" style="color: #3E3E3E;">' . $get('email') . '</a></td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Téléphone :</strong></td>
          <td style="padding: 6px 0;">' . $get('telephone') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Source :</strong></td>
          <td style="padding: 6px 0;">' . $get('source') . '</td>
        </tr>
      </table>

      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">🎯 Profil & projet</h3>
      <table style="font-size: 16px; color: #333; margin-top: 10px; width: 100%;">
        <tr>
          <td style="padding: 6px 0; width: 200px;"><strong>Profil :</strong></td>
          <td style="padding: 6px 0;">' . $get('profil') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Intention :</strong></td>
          <td style="padding: 6px 0;">' . $get('intention') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Expérience :</strong></td>
          <td style="padding: 6px 0;">' . $get('experience') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Associés :</strong></td>
          <td style="padding: 6px 0;">' . $get('associes') . '</td>
        </tr>
      </table>

      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">📍 Zone & timing</h3>
      <table style="font-size: 16px; color: #333; margin-top: 10px; width: 100%;">
        <tr>
          <td style="padding: 6px 0; width: 200px;"><strong>Ville envisagée :</strong></td>
          <td style="padding: 6px 0;">' . $get('ville') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Population :</strong></td>
          <td style="padding: 6px 0;">' . $get('population') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Local :</strong></td>
          <td style="padding: 6px 0;">' . $get('local') . '</td>
        </tr>
        <tr>
          <td style="padding: 6px 0;"><strong>Horizon :</strong></td>
          <td style="padding: 6px 0;">' . $get('horizon') . '</td>
        </tr>
      </table>

      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">💰 Volet financier</h3>
      <table style="font-size: 16px; color: #333; margin-top: 10px; width: 100%;">
        <tr>
          <td style="padding: 6px 0; width: 200px;"><strong>Apport personnel :</strong></td>
          <td style="padding: 6px 0;">' . $get('apport') . '</td>
        </tr>
      </table>

      <h3 style="color: #3E3E3E; font-size: 17px; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 8px;">🗨️ Message</h3>
      <div style="font-size: 16px; color: #333; background-color: #f1f1f1; padding: 15px; border-radius: 6px;">
        ' . nl2br( $get('message') ) . '
      </div>

      <p style="font-size: 14px; color: #999; text-align: center; margin-top: 40px;">
        Ce message est une notification automatique générée depuis le formulaire de licence franchise du site <a href="https://musiquizlejeu.fr" style="color: #999;">musiquizlejeu.fr</a>.
      </p>
    </div>
  </body>
</html>';

    // === ENVOI ===
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'Reply-To: ' . $get('prenom') . ' ' . $get('nom') . ' <' . $get('email') . '>',
    );

    wp_mail( $to, $subject, $body, $headers );

}, 10, 2 );

