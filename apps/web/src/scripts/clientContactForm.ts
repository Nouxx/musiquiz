type Messages = {
  required: string;
  invalidMail: string;
};

type Field = HTMLInputElement | HTMLTextAreaElement;

function readMessages(root: HTMLElement) {
  const node = root.querySelector("[data-messages]");
  if (!node?.textContent) return;

  return JSON.parse(node.textContent) as Messages;
}

function getFields(form: HTMLFormElement) {
  return [...form.querySelectorAll<Field>("input[name], textarea[name]")];
}

function toField(target: EventTarget | null) {
  if (target instanceof HTMLInputElement) return target;
  if (target instanceof HTMLTextAreaElement) return target;

  return;
}

function refreshValidity(field: Field, messages: Messages) {
  // a custom validity string is sticky: without the clear, a field that failed
  // once stays invalid whatever it holds afterwards
  field.setCustomValidity("");

  if (field.validity.valueMissing) {
    field.setCustomValidity(messages.required);
  } else if (field.validity.typeMismatch) {
    field.setCustomValidity(messages.invalidMail);
  }
}

async function submitForm({
  form,
  workerUrl,
  venueSlug,
}: {
  form: HTMLFormElement;
  workerUrl: string;
  venueSlug: string;
}) {
  const data = new FormData(form);

  const payload = {
    venueSlug,
    firstName: String(data.get("firstName") ?? ""),
    mail: String(data.get("mail") ?? ""),
    phone: String(data.get("phone") ?? ""),
    message: String(data.get("message") ?? ""),
  };

  try {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    console.log(response.status, await response.text());
  } catch (error) {
    console.error(error);
  }
}

class MusiquizContactForm extends HTMLElement {
  connectedCallback() {
    const workerUrl = this.dataset.workerUrl;
    const venueSlug = this.dataset.venueSlug;
    const form = this.querySelector<HTMLFormElement>("[data-contact-form]");
    const messages = readMessages(this);
    if (!workerUrl || !venueSlug || !form || !messages) return;

    // the browser reads the message off the field, so it has to be in place
    // before the first submit and not only after a keystroke
    for (const field of getFields(form)) {
      refreshValidity(field, messages);
    }

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
    });

    // the browser blocks an invalid submit, so this only runs on a valid form
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      await submitForm({ form, workerUrl, venueSlug });
    });
  }
}

customElements.define("musiquiz-contact-form", MusiquizContactForm);
