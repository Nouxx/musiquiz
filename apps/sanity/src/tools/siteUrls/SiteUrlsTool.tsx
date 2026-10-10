import { getBlogSiteUrls } from "@repo/services/cms/getBlogSiteUrls";
import { getGlobalSiteUrls } from "@repo/services/cms/getGlobalSiteUrls";
import { getVenueSiteUrls } from "@repo/services/cms/getVenueSiteUrls";
import type { SiteUrl, VenueUrls } from "@repo/services/routing/siteUrls";
import { PRODUCTION_SITE_URL } from "@repo/utils/productionSiteUrl";
import { CopyIcon } from "@sanity/icons/Copy";
import { SearchIcon } from "@sanity/icons/Search";
import {
  Box,
  Button,
  Card,
  Code,
  Container,
  Flex,
  Heading,
  Spinner,
  Stack,
  Text,
  TextInput,
  useToast,
} from "@sanity/ui";
import { useEffect, useState } from "react";
import { useClient } from "sanity";

import { dataset, projectId } from "../../environments";
import { routeLabels } from "./routeLabels";

// published only, like the build: a draft has no page yet
const config = { projectId, dataset, draft: false };

const LISTEN_QUERY = `*[_type in [
  "venue",
  "venueGame",
  "venueEvent",
  "gameFormat",
  "eventFormat",
  "blogArticle"
]]`;

type Load<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "error"; message: string };

type Row = { id: string; label: string; fr: string; en?: string };

type Section = { title: string; rows: Row[] };

function isPublishedId(id: string) {
  return !id.startsWith("drafts.") && !id.startsWith("versions.");
}

function useLoad<T>(load: () => Promise<T>, revision: number): Load<T> {
  const [state, setState] = useState<Load<T>>({ status: "loading" });

  useEffect(() => {
    let live = true;

    load()
      .then((data) => {
        if (live) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (live) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      });

    return () => {
      live = false;
    };
  }, [load, revision]);

  return state;
}

function loadGlobal() {
  return getGlobalSiteUrls({ config });
}

function loadVenues() {
  return getVenueSiteUrls({ config });
}

function loadBlog() {
  return getBlogSiteUrls({ config });
}

function toRow(url: SiteUrl): Row {
  const label = routeLabels[url.route];

  return {
    id: url.fr,
    label: url.slug ? `${label} · ${url.slug}` : label,
    fr: url.fr,
    en: url.en,
  };
}

function toVenueSection(venue: VenueUrls): Section {
  return {
    title: venue.name,
    rows: [
      ...venue.urls.map(toRow),
      ...venue.partnerLinks.map((link) => ({
        id: `${link.kind}-${link.url}`,
        label:
          link.kind === "booking"
            ? "Booking, on the partner site"
            : "Gifting, on the partner site",
        fr: link.url,
        en: link.url,
      })),
    ],
  };
}

function matches(row: Row, search: string) {
  return [row.label, row.fr, row.en].some((text) =>
    text?.toLowerCase().includes(search),
  );
}

function filterSection(section: Section, search: string): Section {
  if (!search || section.title.toLowerCase().includes(search)) return section;

  return {
    ...section,
    rows: section.rows.filter((row) => matches(row, search)),
  };
}

function CopyablePath({ path }: { path: string }) {
  const toast = useToast();

  function copy() {
    void navigator.clipboard.writeText(path).then(() => {
      toast.push({ status: "success", title: `Copied ${path}` });
    });
  }

  return (
    <Flex align="center" gap={1}>
      <Box flex={1} style={{ minWidth: 0, overflowWrap: "anywhere" }}>
        <Code size={1}>{path}</Code>
      </Box>
      <Button
        icon={CopyIcon}
        mode="bleed"
        fontSize={1}
        padding={2}
        title={`Copy ${path}`}
        onClick={copy}
      />
    </Flex>
  );
}

function UrlRow({ row }: { row: Row }) {
  return (
    <Card borderTop padding={3}>
      <Flex gap={3} align="center" wrap="wrap">
        <Box style={{ flex: "1 1 180px" }}>
          <Text size={1} weight="medium">
            {row.label}
          </Text>
        </Box>
        <Box style={{ flex: "2 1 220px", minWidth: 0 }}>
          <CopyablePath path={row.fr} />
        </Box>
        <Box style={{ flex: "2 1 220px", minWidth: 0 }}>
          {row.en ? (
            <CopyablePath path={row.en} />
          ) : (
            <Text size={1} muted>
              No English page
            </Text>
          )}
        </Box>
      </Flex>
    </Card>
  );
}

function UrlSection({ section }: { section: Section }) {
  return (
    <Stack space={3}>
      <Heading as="h2" size={1}>
        {section.title}
      </Heading>
      <Card radius={2} border overflow="hidden">
        <Card padding={3} tone="transparent">
          <Flex gap={3} wrap="wrap">
            <Box style={{ flex: "1 1 180px" }}>
              <Text size={0} muted weight="semibold">
                PAGE
              </Text>
            </Box>
            <Box style={{ flex: "2 1 220px" }}>
              <Text size={0} muted weight="semibold">
                FRENCH
              </Text>
            </Box>
            <Box style={{ flex: "2 1 220px" }}>
              <Text size={0} muted weight="semibold">
                ENGLISH
              </Text>
            </Box>
          </Flex>
        </Card>
        {section.rows.map((row) => (
          <UrlRow key={row.id} row={row} />
        ))}
      </Card>
    </Stack>
  );
}

function LoadedSections<T>({
  name,
  load,
  toSections,
  search,
}: {
  name: string;
  load: Load<T>;
  toSections: (data: T) => Section[];
  search: string;
}) {
  if (load.status === "loading") {
    return (
      <Flex gap={2} align="center">
        <Spinner muted />
        <Text size={1} muted>
          Loading {name}…
        </Text>
      </Flex>
    );
  }

  if (load.status === "error") {
    return (
      <Card padding={4} radius={2} tone="critical" border>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            The {name} could not be listed: some content is incomplete.
          </Text>
          <Text size={1}>{load.message}</Text>
        </Stack>
      </Card>
    );
  }

  return toSections(load.data)
    .map((section) => filterSection(section, search))
    .filter((section) => section.rows.length > 0)
    .map((section) => <UrlSection key={section.title} section={section} />);
}

function Rules() {
  const domain = new URL(PRODUCTION_SITE_URL).host;

  return (
    <Card padding={4} radius={2} tone="primary" border>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Copy a URL from this list rather than typing one: a URL that is not
          listed here leads to a “page not found”.
        </Text>
        <Text size={1}>• Always end a path with /.</Text>
        <Text size={1}>
          • English paths start with /en/ and use the English words:
          /en/paris/book/, never /en/paris/reserver/.
        </Text>
        <Text size={1}>
          • The blog is French only: the English link of a button must point
          elsewhere.
        </Text>
        <Text size={1}>
          • A venue that books or sells vouchers on a partner site has no
          booking or gifting page: use the partner link listed under the venue.
        </Text>
        <Text size={1}>
          • In rich text, a link needs the full address: put https://{domain} in
          front of the path.
        </Text>
        <Text size={1}>
          • A page you just published goes live at the next site deploy.
        </Text>
      </Stack>
    </Card>
  );
}

export function SiteUrlsTool() {
  const client = useClient({ apiVersion: "2025-02-06" });

  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const subscription = client
      .listen(
        LISTEN_QUERY,
        {},
        { events: ["mutation"], includeResult: false, visibility: "query" },
      )
      .subscribe((event) => {
        if (event.type === "mutation" && isPublishedId(event.documentId)) {
          setRevision((current) => current + 1);
        }
      });

    return () => subscription.unsubscribe();
  }, [client]);

  const global = useLoad(loadGlobal, revision);
  const venues = useLoad(loadVenues, revision);
  const blog = useLoad(loadBlog, revision);

  const query = search.trim().toLowerCase();

  return (
    <Card height="fill" overflow="auto">
      <Container width={3} paddingX={4} paddingY={5}>
        <Stack space={5}>
          <Heading as="h1" size={3}>
            Site URLs
          </Heading>
          <Rules />
          <TextInput
            icon={SearchIcon}
            placeholder="Search a venue, a page, a path…"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
          />
          <LoadedSections
            name="global pages"
            load={global}
            search={query}
            toSections={(urls) => [
              { title: "Global pages", rows: urls.map(toRow) },
            ]}
          />
          <LoadedSections
            name="venue pages"
            load={venues}
            search={query}
            toSections={(data) => data.map(toVenueSection)}
          />
          <LoadedSections
            name="blog pages"
            load={blog}
            search={query}
            toSections={(urls) => [
              { title: "Blog, French only", rows: urls.map(toRow) },
            ]}
          />
        </Stack>
      </Container>
    </Card>
  );
}
