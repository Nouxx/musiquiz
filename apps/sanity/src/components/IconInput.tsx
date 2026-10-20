import { Card, Grid, Stack, Text } from "@sanity/ui";
import { set, type StringInputProps } from "sanity";
import { contentIcons } from "../schemas/shared/pageComponents/contentIcons";

const files = import.meta.glob<string>(
  "../../../../packages/ui/src/icons/*.svg",
  { query: "?raw", import: "default", eager: true },
);

const svgs = new Map(
  Object.entries(files).map(([path, svg]) => [
    path.replace(/^.*\/|\.svg$/g, ""),
    svg.replace(
      "<svg ",
      '<svg width="100%" height="100%" fill="currentColor" ',
    ),
  ]),
);

for (const { value } of contentIcons) {
  if (!svgs.has(value)) {
    throw new Error(`contentIcons: no packages/ui/src/icons/${value}.svg`);
  }
}

function ContentIcon({ name, size }: { name: string; size: string }) {
  return (
    <span
      aria-hidden
      style={{ display: "inline-flex", width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svgs.get(name) ?? "" }}
    />
  );
}

export function iconMedia(name?: string) {
  return name ? <ContentIcon name={name} size="1.25rem" /> : undefined;
}

export function IconInput(props: StringInputProps) {
  const { value, onChange, readOnly } = props;

  return (
    <Grid columns={[3, 4, 6]} gap={2}>
      {contentIcons.map((icon) => (
        <Card
          key={icon.value}
          as="button"
          type="button"
          padding={3}
          radius={2}
          border
          tone={icon.value === value ? "primary" : "default"}
          selected={icon.value === value}
          disabled={readOnly}
          onClick={() => {
            if (icon.value !== value) onChange(set(icon.value));
          }}
        >
          <Stack space={2} style={{ justifyItems: "center" }}>
            <ContentIcon name={icon.value} size="1.75rem" />
            <Text size={1} align="center">
              {icon.title}
            </Text>
          </Stack>
        </Card>
      ))}
    </Grid>
  );
}
