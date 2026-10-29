import { SANITY_API_VERSION } from "@repo/utils/sanityConfig";
import { RocketIcon } from "@sanity/icons/Rocket";
import { Button, Card, Container, Heading, Stack, Text } from "@sanity/ui";
import { useState } from "react";
import { useClient } from "sanity";

import { workerUrl } from "../../environments";

// the build minutes usage sits on this overview, it has no page of its own
const BUILD_USAGE_URL =
  "https://dash.cloudflare.com/a98829785d9ad4b7960ca91370b92848/workers-and-pages";

type DeployState =
  | { status: "idle" }
  | { status: "deploying" }
  | { status: "started"; alreadyQueued: boolean }
  | { status: "error"; message: string };

type DeployResponse = {
  error?: string;
  alreadyQueued?: boolean;
};

async function requestDeploy(token: string | undefined): Promise<DeployState> {
  if (!token) {
    return {
      status: "error",
      message: "Your session has no token. Sign out and sign in again.",
    };
  }

  const response = await fetch(`${workerUrl}/deploy/site`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = (await response.json()) as DeployResponse;

  if (response.ok) {
    return { status: "started", alreadyQueued: body.alreadyQueued ?? false };
  }

  return {
    status: "error",
    message: body.error ?? `The deploy failed (HTTP ${response.status}).`,
  };
}

function DeployStatus({ state }: { state: DeployState }) {
  if (state.status === "started") {
    return (
      <Card padding={4} radius={2} tone="positive" border>
        <Text size={1}>
          {state.alreadyQueued
            ? "A deploy was already waiting to start. It will include your changes."
            : "Deploy started. The site is live with your changes in a few minutes."}
        </Text>
      </Card>
    );
  }

  if (state.status === "error") {
    return (
      <Card padding={4} radius={2} tone="critical" border>
        <Text size={1}>{state.message}</Text>
      </Card>
    );
  }
}

export function DeploySiteTool() {
  const client = useClient({ apiVersion: SANITY_API_VERSION });
  const [state, setState] = useState<DeployState>({ status: "idle" });

  async function deploy() {
    setState({ status: "deploying" });

    try {
      setState(await requestDeploy(client.config().token));
    } catch (error) {
      setState({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <Card height="fill" overflow="auto">
      <Container width={1} paddingX={4} paddingY={5}>
        <Stack gap={5}>
          <Heading as="h1" size={3}>
            Deploy the site
          </Heading>
          <Card padding={4} radius={2} tone="primary" border>
            <Stack gap={3}>
              <Text size={1}>
                Publishing a document does not update the site. Publish all your
                changes first, then deploy once.
              </Text>
              <Text size={1}>
                A deploy rebuilds every page and takes a few minutes. Clicking
                again while one runs queues a single extra deploy, which picks
                up what you published in the meantime.
              </Text>
            </Stack>
          </Card>
          <Button
            icon={RocketIcon}
            text="Deploy the site"
            tone="primary"
            loading={state.status === "deploying"}
            onClick={deploy}
          />
          <DeployStatus state={state} />
          <Text size={1} muted>
            Builds share a monthly quota of 3,000 minutes.{" "}
            <a href={BUILD_USAGE_URL} target="_blank" rel="noreferrer">
              See what is left on Cloudflare
            </a>{" "}
            (needs a Cloudflare account).
          </Text>
        </Stack>
      </Container>
    </Card>
  );
}
