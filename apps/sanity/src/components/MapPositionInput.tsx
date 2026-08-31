import { venuesMap } from "@repo/ui/lib/maps";
import { Card, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { set, useClient, useFormValue, type ObjectInputProps } from "sanity";

type MapPosition = { x?: number; y?: number };

type Sibling = { title: string; x: number; y: number };

const SIBLINGS_QUERY = `*[
  _type == "venue"
  && !(_id in [$id, $draftId])
  && defined(mapPosition.x)
  && defined(mapPosition.y)
]{ title, "x": mapPosition.x, "y": mapPosition.y }`;

function publishedId(id: string) {
  return id.replace(/^drafts\./, "");
}

function round(value: number) {
  return Math.round(Math.min(100, Math.max(0, value)) * 100) / 100;
}

export function MapPositionInput(props: ObjectInputProps<MapPosition>) {
  const { value, onChange, readOnly } = props;

  const frameRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [siblings, setSiblings] = useState<Sibling[]>([]);

  const client = useClient({ apiVersion: "2024-10-01" });
  const documentId = useFormValue(["_id"]) as string | undefined;

  useEffect(() => {
    if (!documentId) return;

    const id = publishedId(documentId);
    let live = true;

    client
      .fetch<Sibling[]>(SIBLINGS_QUERY, { id, draftId: `drafts.${id}` })
      .then((result) => {
        if (live) setSiblings(result);
      });

    return () => {
      live = false;
    };
  }, [client, documentId]);

  const place = useCallback(
    (event: { clientX: number; clientY: number }) => {
      const frame = frameRef.current;
      if (!frame || readOnly) return;

      const rect = frame.getBoundingClientRect();

      onChange(
        set({
          x: round(((event.clientX - rect.left) / rect.width) * 100),
          y: round(((event.clientY - rect.top) / rect.height) * 100),
        }),
      );
    },
    [onChange, readOnly],
  );

  const x = value?.x;
  const y = value?.y;
  const placed = typeof x === "number" && typeof y === "number";

  return (
    <Stack space={3}>
      <Card
        padding={2}
        radius={2}
        shadow={1}
        tone="transparent"
        style={{ backgroundColor: "#241a4d" }}
      >
        <div
          ref={frameRef}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            setDragging(true);
            place(event);
          }}
          onPointerMove={(event) => {
            if (dragging) place(event);
          }}
          onPointerUp={() => setDragging(false)}
          style={{
            position: "relative",
            aspectRatio: "598 / 520",
            cursor: readOnly ? "default" : "crosshair",
            touchAction: "none",
          }}
        >
          <div
            style={{ inlineSize: "100%", blockSize: "100%" }}
            dangerouslySetInnerHTML={{ __html: venuesMap }}
          />

          {siblings.map((sibling) => (
            <Dot
              key={sibling.title}
              x={sibling.x}
              y={sibling.y}
              label={sibling.title}
              muted
            />
          ))}

          {placed && <Dot x={x} y={y} />}
        </div>
      </Card>

      <Flex gap={3}>
        <Text muted size={1}>
          {placed ? `x ${x} · y ${y}` : "Click the map to place this venue"}
        </Text>
      </Flex>
    </Stack>
  );
}

function Dot({
  x,
  y,
  label,
  muted,
}: {
  x: number;
  y: number;
  label?: string;
  muted?: boolean;
}) {
  return (
    <span
      title={label}
      style={{
        position: "absolute",
        insetInlineStart: `${x}%`,
        insetBlockStart: `${y}%`,
        inlineSize: muted ? 8 : 12,
        blockSize: muted ? 8 : 12,
        translate: "-50% -50%",
        borderRadius: "50%",
        backgroundColor: muted ? "rgb(247 243 240 / 40%)" : "#f7f3f0",
        boxShadow: muted ? "none" : "0 0 0 4px rgb(247 243 240 / 25%)",
        pointerEvents: "none",
      }}
    />
  );
}
