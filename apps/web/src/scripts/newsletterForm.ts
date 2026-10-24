import {
  postPayload,
  readMessages,
  refreshValidity,
  trackLead,
  type ValidationMessages,
} from "./formRuntime";

const RETRY_COOLDOWN_MS = 2000;

type State = "submit" | "pending" | "success" | "failure";

function showState({
  submit,
  nodes,
  state,
}: {
  submit: HTMLButtonElement;
  nodes: HTMLElement[];
  state: State;
}) {
  for (const node of nodes) {
    node.hidden = node.dataset.state !== state;
  }

  // the tones are `Button`'s own classes; both at once and the later rule wins
  submit.classList.toggle("red", state !== "failure");
  submit.classList.toggle("yellow", state === "failure");
}

class MusiquizNewsletterForm extends HTMLElement {
  connectedCallback() {
    const workerUrl = this.dataset.workerUrl;
    const venueSlug = this.dataset.venueSlug ?? "";
    const form = this.querySelector<HTMLFormElement>(
      "form[data-newsletter-form]",
    );
    const messages = readMessages<ValidationMessages>(this);
    if (!workerUrl || !form || !messages) return;

    const submit = form.querySelector<HTMLButtonElement>("[data-submit]");
    const fields = form.querySelector<HTMLFieldSetElement>("[data-fields]");
    if (!submit || !fields) return;

    const stateNodes = [
      ...submit.querySelectorAll<HTMLElement>("[data-state]"),
    ];

    const inputs = [...form.querySelectorAll<HTMLInputElement>("input[name]")];

    // the browser reads the message off the field, so it has to be in place
    // before the first submit and not only after a keystroke
    for (const input of inputs) {
      refreshValidity(input, messages);
    }

    // `invalid` does not bubble
    form.addEventListener(
      "invalid",
      (event) => {
        if (event.target instanceof HTMLInputElement) {
          event.target.setAttribute("aria-invalid", "true");
        }
      },
      { capture: true },
    );

    form.addEventListener("input", (event) => {
      if (!(event.target instanceof HTMLInputElement)) return;

      refreshValidity(event.target, messages);

      if (event.target.validity.valid) {
        event.target.removeAttribute("aria-invalid");
      }
    });

    // the browser blocks an invalid submit, so this only runs with the consent
    // ticked and a well-formed mail
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const data = new FormData(form);

      submit.disabled = true;
      showState({ submit, nodes: stateNodes, state: "pending" });

      const sent = await postPayload({
        workerUrl,
        payload: {
          venueSlug,
          mail: String(data.get("mail") ?? ""),
          rgpd: data.has("rgpd"),
        },
      });

      if (sent) {
        // a finished form should not be able to send a second copy
        fields.disabled = true;
        showState({ submit, nodes: stateNodes, state: "success" });
        trackLead({ formName: "newsletter", venue: venueSlug });
      } else {
        showState({ submit, nodes: stateNodes, state: "failure" });

        // a cooldown before the retry, so frustrated clicking cannot hammer the worker
        setTimeout(() => {
          submit.disabled = false;
        }, RETRY_COOLDOWN_MS);
      }
    });
  }
}

customElements.define("musiquiz-newsletter-form", MusiquizNewsletterForm);
