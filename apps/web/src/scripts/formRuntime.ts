export type ValidationMessages = {
  required: string;
  invalidMail: string;
};

type Messages = ValidationMessages & {
  counter: string;
};

type Field = HTMLInputElement | HTMLTextAreaElement;

export type ValidatableField = Field | HTMLSelectElement;

type BuildPayload = (input: {
  form: HTMLFormElement;
  element: HTMLElement;
}) => unknown;

export function readMessages<T = Messages>(root: HTMLElement) {
  const node = root.querySelector("[data-messages]");
  if (!node?.textContent) return;

  return JSON.parse(node.textContent) as T;
}

function getFields(form: HTMLFormElement) {
  return [...form.querySelectorAll<Field>("input[name], textarea[name]")];
}

function toField(target: EventTarget | null) {
  if (target instanceof HTMLInputElement) return target;
  if (target instanceof HTMLTextAreaElement) return target;

  return;
}

export function refreshValidity(
  field: ValidatableField,
  messages: ValidationMessages,
) {
  // a custom validity string is sticky: without the clear, a field that failed
  // once stays invalid whatever it holds afterwards
  field.setCustomValidity("");

  if (field.validity.valueMissing) {
    field.setCustomValidity(messages.required);
  } else if (field.validity.typeMismatch) {
    field.setCustomValidity(messages.invalidMail);
  }
}

function refreshCounter(field: Field, counter: HTMLElement, template: string) {
  const used = field.value.length;
  const max = field.maxLength;

  // replacer functions: a plain string replacement would read `$&` etc
  counter.textContent = template
    .replaceAll("__USED__", () => String(used))
    .replaceAll("__MAX__", () => String(max));

  counter.toggleAttribute("data-near-cap", used >= max * 0.9);
}

export function setPending({
  submit,
  submitLabel,
  pendingLabel,
  pending,
}: {
  submit: HTMLButtonElement;
  submitLabel: HTMLElement;
  pendingLabel: HTMLElement;
  pending: boolean;
}) {
  submit.disabled = pending;
  submitLabel.hidden = pending;
  pendingLabel.hidden = !pending;
}

export function reveal(node: HTMLElement) {
  node.hidden = false;
  node.focus();
}

export async function postPayload({
  workerUrl,
  payload,
}: {
  workerUrl: string;
  payload: unknown;
}) {
  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) return true;

    // a rejection after the browser accepted the form is our bug, not the
    // visitor's, so it stays in the console rather than on the page
    console.error("form rejected", response.status, await response.text());

    return false;
  } catch (error) {
    console.error(error);

    return false;
  }
}

export function defineFormElement({
  tag,
  formSelector,
  buildPayload,
}: {
  tag: string;
  formSelector: string;
  buildPayload: BuildPayload;
}) {
  class MusiquizForm extends HTMLElement {
    connectedCallback() {
      const workerUrl = this.dataset.workerUrl;
      const form = this.querySelector<HTMLFormElement>(formSelector);
      const messages = readMessages(this);
      if (!workerUrl || !form || !messages) return;

      const submit = form.querySelector<HTMLButtonElement>("[data-submit]");
      const submitLabel = form.querySelector<HTMLElement>(
        "[data-submit-label]",
      );
      const pendingLabel = form.querySelector<HTMLElement>(
        "[data-pending-label]",
      );
      const failure = form.querySelector<HTMLElement>("[data-failure]");
      const success = form.querySelector<HTMLElement>("[data-success]");
      const fields = form.querySelector<HTMLFieldSetElement>("[data-fields]");
      const counter = form.querySelector<HTMLElement>("[data-counter]");
      const messageField = form.querySelector<HTMLTextAreaElement>(
        "textarea[name='message']",
      );
      if (
        !submit ||
        !submitLabel ||
        !pendingLabel ||
        !failure ||
        !success ||
        !fields ||
        !counter ||
        !messageField
      ) {
        return;
      }

      // the browser reads the message off the field, so it has to be in place
      // before the first submit and not only after a keystroke
      for (const field of getFields(form)) {
        refreshValidity(field, messages);
      }

      refreshCounter(messageField, counter, messages.counter);

      // `invalid` does not bubble
      form.addEventListener(
        "invalid",
        (event) => {
          toField(event.target)?.setAttribute("aria-invalid", "true");
        },
        { capture: true },
      );

      form.addEventListener("input", (event) => {
        const field = toField(event.target);
        if (!field) return;

        refreshValidity(field, messages);

        if (field.validity.valid) {
          field.removeAttribute("aria-invalid");
        }

        if (field === messageField) {
          refreshCounter(messageField, counter, messages.counter);
        }
      });

      // the browser blocks an invalid submit, so this only runs on a valid form
      form.addEventListener("submit", async (event) => {
        event.preventDefault();

        failure.hidden = true;
        setPending({ submit, submitLabel, pendingLabel, pending: true });

        const sent = await postPayload({
          workerUrl,
          payload: buildPayload({ form, element: this }),
        });

        setPending({ submit, submitLabel, pendingLabel, pending: false });

        if (sent) {
          // a finished form should not be able to send a second copy
          fields.disabled = true;
          submit.disabled = true;
          reveal(success);
        } else {
          reveal(failure);
        }
      });
    }
  }

  customElements.define(tag, MusiquizForm);
}
