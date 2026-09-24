# The Blog Article page closes on its Venue

The article page ends the same way on every article: a Find Us block, an FAQ, the author, and up to three more articles about the same Venue. None of it is composed per article. Three things had to be decided to get there.

**The tail is fixed, not a Page Component array.** An editor writing an article chooses nothing below the body. A `pageComponents[]` on `blogArticle` would offer choices the design does not have, and would repeat the same Find Us and FAQ on every article of a Venue.

**What the tail says lives on a `venueBlog` document, one per Venue.** It holds a `blogFindUs` and a `blogFaq`, reached from the Studio under Blog → Venues with the id `venueBlog-<venueId>`, like a Venue Page. The Venue itself supplies the address, the map and the booking link, so the only authored text is the words around them. The build fails when an article's Venue has no `venueBlog`: an article without its closing sections is not publishable.

- _Fields on the `venue` document_ was rejected: the Venue holds facts about the place ([ADR 0010](./0010-page-content-lives-in-documents.md)), and the blog's content belongs in the Blog section of the Studio.
- _Reusing the Venue home page's own Find Us_ was rejected: it means a lookup for "the first `findUs` in an array", which breaks silently when an editor removes it or adds a second one.
- _Reusing the `findUs` and `faq` object types_ was rejected for the reason [ADR 0013](./0013-blog-is-french-only-and-static.md) gives: internationalized arrays filled in French only. `blogFindUs` and `blogFaq` are French-only twins with plain strings. The UI Components are the same ones; the services hand them the same shape.

**A Team Member is a document.** The author is a reference, and Sanity cannot reference an item inside a singleton's array. So `teamMember` became a document type, `siteSettings.teamMembers` became an ordered array of references (the contact page keeps its order), and the three existing members were copied into documents with stable ids. The `bio` shown under an article is plain French text, optional in the Studio and required by the article query: a member who signs an article needs one, the others do not.

- _Keeping the array and storing the member's `_key` on the article_ was rejected: no referential integrity, and a custom Studio input to pick from it.
- _A separate `blogAuthor` type_ was rejected: it duplicates the photo and the name of a person who already exists.

## Consequences

- The last consequence of ADR 0013, "the article page is not built", no longer holds. `/blog/[slug]` is generated from every article slug, and its route fetches for the same reason the listing's does.
- The page emits `BlogPosting`, `BreadcrumbList` and `FAQPage` JSON-LD. Its urls stay relative until `site` is set in `astro.config`.
- The Venue crumb links to the Venue home, not a per-Venue blog listing; see [ADR 0015](./0015-blog-venue-crumb-links-to-the-venue-home.md).
- Reading time is derived at build time from the summary and the body, at 200 words a minute.
