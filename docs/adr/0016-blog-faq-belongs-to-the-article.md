# The blog FAQ belongs to the article, not the Venue

[ADR 0014](./0014-blog-article-page-closes-on-its-venue.md) put the article page's FAQ on the `venueBlog` document, so every article of a Venue closed on the same questions. That part is superseded: the FAQ is a `faq` field on `blogArticle`. Find Us stays on the `venueBlog`.

**The FAQ is the article's content.** An article about an EVG in Paris raises other questions than one about a children's birthday. The page emits `FAQPage` JSON-LD, and the same questions on eight pages of one site is duplicate structured data, which search engines discount.

**It is optional.** A playlist or an event recap raises no question worth answering, and an FAQ written to fill the slot is noise to readers and to search engines. An article without one shows no FAQ section and emits no `FAQPage`. When present it holds between 3 and 8 questions, the range the FAQ UI Component is drawn for, and its own title.

- _A `blogFaq` document referenced by articles_ was rejected: it brings back the sharing this decision removes.
- _Questions picked from a shared pool_ was rejected for the same reason, and it needs a custom Studio input.
- _Falling back to a Venue FAQ when the article has none_ was rejected: an editor could not tell which articles repeat the Venue's questions, and an article with nothing to answer would still carry an FAQ.

## Consequences

- `venueBlog` holds only `blogFindUs`. The build still fails when an article's Venue has no `venueBlog`.
- On migration, each article received a copy of its Venue's FAQ, to be rewritten per article in the Studio.
