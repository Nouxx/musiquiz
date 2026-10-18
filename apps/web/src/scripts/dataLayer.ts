declare global {
  var dataLayer: unknown[] | undefined;
}

export function pushToDataLayer(entry: Record<string, unknown>) {
  // eslint-disable-next-line unicorn/no-global-object-property-assignment -- GTM reads this global by name
  globalThis.dataLayer ??= [];
  globalThis.dataLayer.push(entry);
}
