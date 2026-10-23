# Newsletter provider per venue

The footer newsletter form posts `{ venueSlug, mail, rgpd }` to `/form/newsletter` on `musiquiz-worker`. Each Venue runs its own Brevo account, or none yet. A `venue` carries one choice, `newsletterProvider`:

- `brevo`: the sign-up is created as a Brevo contact in `brevoListId`, with `updateEnabled` so a repeat sign-up is not an error.
- `zeptomail`: the sign-up is mailed to `ownerMails` with the `newsletter` ZeptoMail template, merge labels `{ ville, mail }`. The owners add the contact by hand. This is the temporary path until every Venue has a Brevo account.

New Venues start on `zeptomail`.

**One Cloudflare Secret per Venue, named after its slug.** A Brevo API key is a secret, and the Sanity dataset is public, so the key cannot live on the `venue`. The client opens Venues without a code change, so the worker reads the key by name at request time: `BREVO_API_KEY_` followed by the slug in capitals, dashes as underscores (`saint-etienne` → `BREVO_API_KEY_SAINT_ETIENNE`). `@repo/services/form/buildBrevoApiKeyName` is the one place that derives it: the worker reads the secret by it, and the Studio shows each venue its own name with it. These secrets are absent from `Env` on purpose.

- _One JSON secret mapping slugs to keys_ was rejected: Cloudflare Secrets are write-only, so adding a Venue means retyping every key, and one typo breaks them all.
- _Cloudflare Secrets Store or KV_ was rejected: more setup than a handful of low-churn keys needs, and the client already knows the Secrets screen.
- _Choosing Brevo by the presence of the secret_ was rejected: the editor's intent would be split across two tools and invisible in the Studio.

**A Brevo sign-up never fails the request; it falls back to mailing the owners.** A Venue on `brevo` with no secret yet, a revoked key, or a Brevo outage all end in the `zeptomail` path, and the worker logs the Brevo error. The request fails only when the owner mail fails too.

**Single opt-in.** The required RGPD tick is the consent. Brevo's double opt-in needs a template and a redirect per account; not worth it yet.

## Consequences

- A misconfigured Brevo Venue is silent to the subscriber. It shows only in the worker logs, as `brevo sign-up failed, mailed the owners`.
- `brevoListId` is dropped in the query unless the provider is `brevo`, so switching back keeps the old value in the Studio without reading it.
- No mail goes to the subscriber on either path.
- The form has no captcha or rate limit, like the other forms.
