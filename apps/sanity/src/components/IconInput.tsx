import { Card, Grid, Stack, Text } from "@sanity/ui";
import { useRef, type FocusEvent, type KeyboardEvent } from "react";
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

const arrowSteps: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

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
  const { value, onChange, readOnly, elementProps } = props;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const focusIndex = Math.max(
    contentIcons.findIndex((icon) => icon.value === value),
    0,
  );

  function select(index: number) {
    const icon = contentIcons[index];
    if (icon.value !== value) onChange(set(icon.value));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>, index: number) {
    const step = arrowSteps[event.key];
    if (!step || readOnly) return;
    event.preventDefault();
    const next = (index + step + contentIcons.length) % contentIcons.length;
    select(next);
    buttons.current[next]?.focus();
  }

  // moving between icons stays inside the field, so it is not a focus change for Studio
  function handleFocus(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      elementProps.onFocus(event);
    }
  }

  function handleBlur(event: FocusEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      elementProps.onBlur(event);
    }
  }

  return (
    <Grid
      columns={[3, 4, 6]}
      gap={2}
      role="radiogroup"
      aria-describedby={elementProps["aria-describedby"]}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {contentIcons.map((icon, index) => (
        <Card
          key={icon.value}
          ref={(node: HTMLButtonElement | null) => {
            buttons.current[index] = node;
            if (index === focusIndex) elementProps.ref.current = node;
          }}
          id={index === focusIndex ? elementProps.id : undefined}
          as="button"
          type="button"
          role="radio"
          aria-checked={icon.value === value}
          tabIndex={index === focusIndex ? 0 : -1}
          padding={3}
          radius={2}
          border
          tone={icon.value === value ? "primary" : "default"}
          selected={icon.value === value}
          disabled={readOnly}
          onClick={() => select(index)}
          onKeyDown={(event: KeyboardEvent<HTMLElement>) =>
            handleKeyDown(event, index)
          }
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
