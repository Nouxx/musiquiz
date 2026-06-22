import { defineCliConfig } from "sanity/cli";
import { appId, dataset, projectId } from "./src/environments";

export default defineCliConfig({
  api: {
    projectId: projectId,
    dataset: dataset,
  },
  deployment: {
    appId: appId,
    autoUpdates: true,
  },
  // no typegen? we don't need it as zod is used to parse sanity client response
});
