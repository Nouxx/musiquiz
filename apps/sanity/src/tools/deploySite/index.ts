import { RocketIcon } from "@sanity/icons/Rocket";
import type { Tool } from "sanity";

import { DeploySiteTool } from "./DeploySiteTool";

export const deploySiteTool: Tool = {
  name: "deploy-site",
  title: "Deploy",
  icon: RocketIcon,
  component: DeploySiteTool,
};
