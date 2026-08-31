const ALIGN = { HORIZONTAL: "row", VERTICAL: "col" };

function channel(value) {
  return Math.round(value * 255)
    .toString(16)
    .padStart(2, "0");
}

function hex({ r, g, b, a = 1 }) {
  const rgb = `#${channel(r)}${channel(g)}${channel(b)}`.toUpperCase();
  return a < 1 ? `${rgb}/${Math.round(a * 100)}%` : rgb;
}

/* figma gives a gradient as three handle points, not an angle; the first two
   span the axis, and css measures from the top with y inverted */
function gradientAngle([start, end]) {
  const degrees =
    (Math.atan2(end.x - start.x, start.y - end.y) * 180) / Math.PI;
  return `${Math.round((degrees + 360) % 360)}deg`;
}

function paint(fill) {
  if (fill.visible === false) return null;
  const opacity =
    fill.opacity !== undefined && fill.opacity < 1
      ? `/${Math.round(fill.opacity * 100)}%`
      : "";
  if (fill.type === "SOLID")
    return hex({ ...fill.color, a: fill.color.a ?? 1 }) + opacity;
  if (fill.type.startsWith("GRADIENT")) {
    const stops = fill.gradientStops.map(
      (stop) => `${hex(stop.color)} ${Math.round(stop.position * 100)}%`,
    );
    const kind = fill.type.replace("GRADIENT_", "").toLowerCase();
    const angle =
      fill.type === "GRADIENT_LINEAR" && fill.gradientHandlePositions
        ? `${gradientAngle(fill.gradientHandlePositions)} `
        : "";
    return `${kind}-gradient(${angle}${stops.join(", ")})${opacity}`;
  }
  if (fill.type === "IMAGE")
    return `image(${fill.scaleMode?.toLowerCase() ?? "fill"})`;
  return fill.type.toLowerCase();
}

function paints(list) {
  return (list ?? []).map(paint).filter(Boolean).join(" + ");
}

function radius(node) {
  if (node.rectangleCornerRadii) {
    const [tl, tr, br, bl] = node.rectangleCornerRadii;
    return tl === tr && tr === br && br === bl
      ? tl
        ? `r${tl}`
        : null
      : `r${tl}/${tr}/${br}/${bl}`;
  }
  return node.cornerRadius ? `r${node.cornerRadius}` : null;
}

function padding(node) {
  const top = node.paddingTop ?? 0;
  const right = node.paddingRight ?? 0;
  const bottom = node.paddingBottom ?? 0;
  const left = node.paddingLeft ?? 0;
  if (!(top || right || bottom || left)) return null;
  if (top === bottom && left === right)
    return top === left ? `pad${top}` : `pad${top}/${right}`;
  return `pad${top}/${right}/${bottom}/${left}`;
}

function layout(node) {
  if (!node.layoutMode || node.layoutMode === "NONE") return [];
  const parts = [ALIGN[node.layoutMode]];
  if (node.layoutWrap === "WRAP") parts.push("wrap");
  if (node.itemSpacing) parts.push(`gap${node.itemSpacing}`);
  const pad = padding(node);
  if (pad) parts.push(pad);
  const main = node.primaryAxisAlignItems;
  const cross = node.counterAxisAlignItems;
  if (main && main !== "MIN") parts.push(`main:${main.toLowerCase()}`);
  if (cross && cross !== "MIN") parts.push(`cross:${cross.toLowerCase()}`);
  return parts;
}

function typography(node) {
  const style = node.style;
  if (!style) return [];
  const height = style.lineHeightPx
    ? `/${Math.round(style.lineHeightPx * 10) / 10}`
    : "";
  const parts = [
    `${style.fontFamily} ${style.fontSize}${height} w${style.fontWeight}`,
  ];
  if (style.letterSpacing)
    parts.push(`ls${Math.round(style.letterSpacing * 100) / 100}`);
  if (style.textAlignHorizontal && style.textAlignHorizontal !== "LEFT") {
    parts.push(style.textAlignHorizontal.toLowerCase());
  }
  if (style.textCase) parts.push(style.textCase.toLowerCase());
  if (style.textDecoration) parts.push(style.textDecoration.toLowerCase());
  return parts;
}

function effects(node) {
  return (node.effects ?? [])
    .filter((effect) => effect.visible !== false)
    .map((effect) => {
      if (effect.type.endsWith("SHADOW")) {
        const inner = effect.type === "INNER_SHADOW" ? "inset " : "";
        return `shadow(${inner}${effect.offset.x} ${effect.offset.y} ${effect.radius} ${hex(effect.color)})`;
      }
      return `${effect.type.toLowerCase()}(${effect.radius})`;
    });
}

/** variable bindings carry the design-system token name the designer actually picked */
function boundVariables(node, variableNames) {
  const bound = node.boundVariables;
  if (!bound || !variableNames) return [];
  const names = new Set();
  for (const value of Object.values(bound)) {
    for (const ref of Array.isArray(value) ? value : [value]) {
      const name = variableNames.get(ref?.id);
      if (name) names.add(name);
    }
  }
  return names.size ? [`var:${[...names].join(",")}`] : [];
}

function describe(node, options) {
  const box = node.absoluteBoundingBox;
  const parts = [];
  if (box) parts.push(`${Math.round(box.width)}x${Math.round(box.height)}`);
  parts.push(...layout(node));

  if (!options.structureOnly) {
    const fill = paints(node.fills);
    if (fill) parts.push(`fill:${fill}`);
    const stroke = paints(node.strokes);
    if (stroke)
      parts.push(
        `stroke:${stroke}${node.strokeWeight ? ` ${node.strokeWeight}` : ""}`,
      );
    const corner = radius(node);
    if (corner) parts.push(corner);
    if (node.opacity !== undefined && node.opacity < 1)
      parts.push(`opacity${node.opacity}`);
    parts.push(...typography(node));
    parts.push(...effects(node));
    parts.push(...boundVariables(node, options.variableNames));
    if (node.type === "INSTANCE" && node.componentProperties) {
      const props = Object.entries(node.componentProperties)
        .map(([key, prop]) => `${key.split("#")[0]}=${prop.value}`)
        .join(", ");
      if (props) parts.push(`{${props}}`);
    }
  }
  return parts.join(" ");
}

const VECTOR = new Set([
  "VECTOR",
  "BOOLEAN_OPERATION",
  "STAR",
  "LINE",
  "ELLIPSE",
  "REGULAR_POLYGON",
]);

export function render(node, options = {}, depth = 0) {
  const lines = [];
  const indent = "  ".repeat(depth);
  const text =
    node.type === "TEXT" ? ` ${JSON.stringify(node.characters)}` : "";
  // figma names a text layer after its own content until someone renames it
  const named = node.name && node.name !== node.characters;
  const name = named ? ` "${node.name}"` : "";
  const id = ` [${node.id}]`;
  lines.push(
    `${indent}${node.type}${name}${id}${text}  ${describe(node, options)}`.trimEnd(),
  );

  const children = node.children ?? [];
  // a vector's children are path geometry, never layout
  if (VECTOR.has(node.type)) return lines;
  if (options.maxDepth !== undefined && depth + 1 > options.maxDepth) {
    if (children.length) lines.push(`${indent}  … ${children.length} children`);
    return lines;
  }
  for (const child of children)
    lines.push(...render(child, options, depth + 1));
  return lines;
}
