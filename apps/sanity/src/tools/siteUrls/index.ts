import { LinkIcon } from "@sanity/icons/Link";
import type { Tool } from "sanity";

import { SiteUrlsTool } from "./SiteUrlsTool";

export const siteUrlsTool: Tool = {
  name: "site-urls",
  title: "Site URLs",
  icon: LinkIcon,
  component: SiteUrlsTool,
};
