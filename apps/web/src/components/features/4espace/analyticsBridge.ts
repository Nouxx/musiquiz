import { pushToDataLayer } from "../../../scripts/dataLayer";

// every name below is a widget internal, read off its bundle: see ADR 0028
type Order = { lines?: unknown[] } | null;

type Route = {
  path: string;
  query: Record<string, string | undefined>;
};

declare global {
  var forescapeRouter:
    | {
        currentRoute: { value: Route };
        afterEach: (guard: (to: Route) => void) => void;
      }
    | undefined;
  var forescapeStoreOrder:
    | {
        uid: string | null;
        order: Order;
        _p?: { _s: Map<string, { paymentChoice?: string | null }> };
      }
    | undefined;
  var forescapeStoreAnalytics:
    | { triggerEvent: (name: string, order: Order) => void }
    | undefined;
}

type Ecommerce = Record<string, unknown>;

type Stash = {
  uid?: string;
  ecommerce: Ecommerce;
  paymentOption?: string;
};

const prefix = "analytics:";

// the widget emits the first three, begin_checkout is triggered from here, the
// rest are GA4 names it might add. Never purchase: that one is ours, see onRoute
const widgetEvents = [
  "add_to_cart",
  "remove_from_cart",
  "add_payment_info",
  "begin_checkout",
  "view_item",
  "view_item_list",
  "select_item",
  "view_cart",
  "add_shipping_info",
];
const stashKey = "musiquizCheckout";
const sentKey = "musiquizPurchases";
const routerTimeout = 30_000;

function push(event: string, ecommerce: Ecommerce) {
  // GA4 merges ecommerce objects across pushes unless it is cleared first
  // eslint-disable-next-line unicorn/no-null -- GA4 clears on null only
  pushToDataLayer({ ecommerce: null });
  pushToDataLayer({ event, ecommerce });
}

type StorageKind = "localStorage" | "sessionStorage";

// the storage getter itself throws when site data is blocked
function readJson<T>(kind: StorageKind, key: string) {
  try {
    const raw = globalThis[kind].getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // blocked or corrupted: same as nothing stored
  }

  return;
}

function writeJson(kind: StorageKind, key: string, value: unknown) {
  try {
    globalThis[kind].setItem(key, JSON.stringify(value));
  } catch {
    // private mode: the purchase then goes out without its value
  }
}

function readPaymentOption() {
  return (
    globalThis.forescapeStoreOrder?._p?._s.get("forescapePay")?.paymentChoice ??
    undefined
  );
}

function stashCheckout(ecommerce: Ecommerce) {
  writeJson("sessionStorage", stashKey, {
    uid: globalThis.forescapeStoreOrder?.uid ?? undefined,
    ecommerce,
    paymentOption: readPaymentOption(),
  } satisfies Stash);
}

function forwardWidgetEvent(event: Event) {
  if (!(event instanceof CustomEvent)) return;

  const name = event.type.slice(prefix.length);
  const ecommerce = (event.detail ?? {}) as Ecommerce;

  push(name, ecommerce);

  // the cart events only carry the lines they changed, these two the whole order
  if (name === "begin_checkout" || name === "add_payment_info") {
    stashCheckout(ecommerce);
  }
}

function listenToWidgetEvents() {
  for (const name of widgetEvents) {
    document.addEventListener(`${prefix}${name}`, forwardWidgetEvent);
  }
}

function beginCheckout() {
  try {
    const order = globalThis.forescapeStoreOrder?.order;
    if (!order) return;

    globalThis.forescapeStoreAnalytics?.triggerEvent("begin_checkout", order);
  } catch (error) {
    console.error(error);
  }
}

function purchase(orderUid: string) {
  const sent = readJson<string[]>("localStorage", sentKey) ?? [];
  if (sent.includes(orderUid)) return;

  const stash = readJson<Stash>("sessionStorage", stashKey);
  const matches = stash && (!stash.uid || stash.uid === orderUid);

  push(
    "purchase",
    matches
      ? {
          ...stash.ecommerce,
          transaction_id: orderUid,
          ...(stash.paymentOption && { payment_option: stash.paymentOption }),
        }
      : { transaction_id: orderUid },
  );

  writeJson("localStorage", sentKey, [...sent, orderUid]);
  try {
    sessionStorage.removeItem(stashKey);
  } catch {
    // blocked: there was no stash to clear
  }
}

function onRoute(route: Route) {
  if (route.path === "/checkout") {
    beginCheckout();
    return;
  }

  const { orderUid, paymentSuccess } = route.query;
  if (
    route.path === "/checkout-thankyou" &&
    orderUid &&
    paymentSuccess === "1"
  ) {
    purchase(orderUid);
  }
}

// hash history navigates with pushState, which fires no hashchange
function watchRouter(waited = 0) {
  const router = globalThis.forescapeRouter;

  if (router) {
    router.afterEach(onRoute);
    onRoute(router.currentRoute.value);
    return;
  }

  if (waited < routerTimeout) {
    setTimeout(() => watchRouter(waited + 200), 200);
  }
}

export function bridgeWidgetAnalytics() {
  listenToWidgetEvents();
  watchRouter();
}
