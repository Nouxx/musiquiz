import {
  postPayload,
  readMessages,
  refreshValidity,
  trackLead,
  type ValidationMessages,
} from "./formRuntime";

type LabelName = "submit" | "pending" | "success" | "failure";

function showLabel(labels: HTMLElement[], name: LabelName) {
  for (const label of labels) {
    label.hidden = label.dataset.label !== name;
  }
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

    const labels = [...submit.querySelectorAll<HTMLElement>("[data-label]")];

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
      showLabel(labels, "pending");

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
        showLabel(labels, "success");
        trackLead({ formName: "newsletter", venue: venueSlug });
      } else {
        // the button stays live so a second click retries
        submit.disabled = false;
        showLabel(labels, "failure");
      }
    });
  }
}

customElements.define("musiquiz-newsletter-form", MusiquizNewsletterForm);
