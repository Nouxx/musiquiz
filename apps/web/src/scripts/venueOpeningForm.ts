import {
  postPayload,
  readMessages,
  refreshValidity,
  reveal,
  setPending,
  type ValidatableField,
  type ValidationMessages,
} from "./formRuntime";

// `unknown` rather than `Element`: this file is checked with the worker's DOM
// types in scope, where `Element` is HTMLRewriter's. `instanceof` narrows
// against the real constructors whatever the ambient declaration says.
function toField(target: unknown) {
  if (target instanceof HTMLInputElement) return target;
  if (target instanceof HTMLTextAreaElement) return target;
  if (target instanceof HTMLSelectElement) return target;

  return;
}

function getGroup(form: HTMLFormElement, field: ValidatableField) {
  if (!(field instanceof HTMLInputElement) || field.type !== "radio") {
    return [field];
  }

  return [
    ...form.querySelectorAll<HTMLInputElement>(
      `input[type="radio"][name="${CSS.escape(field.name)}"]`,
    ),
  ];
}

function getFields(root: HTMLElement) {
  return [...root.querySelectorAll("input[name], textarea[name], select[name]")]
    .map((node) => toField(node))
    .filter((field) => field !== undefined);
}

function buildPayload(form: HTMLFormElement) {
  const data = new FormData(form);

  function read(name: string) {
    return String(data.get(name) ?? "");
  }

  return {
    profile: read("profile"),
    intent: read("intent"),
    city: read("city"),
    population: read("population"),
    premises: read("premises"),
    horizon: read("horizon"),
    contribution: read("contribution"),
    experience: read("experience"),
    partners: read("partners"),
    firstName: read("firstName"),
    lastName: read("lastName"),
    mail: read("mail"),
    phone: read("phone"),
    source: read("source"),
    message: read("message"),
    rgpd: data.has("rgpd"),
  };
}

function setProgress(progress: HTMLElement, current: number, total: number) {
  const percent = Math.round((current / total) * 100);

  const bar = progress.querySelector<HTMLElement>("[data-progress-bar]");
  const fill = progress.querySelector<HTMLElement>("[data-progress-fill]");
  const label = progress.querySelector<HTMLElement>("[data-progress-label]");
  if (!bar || !fill || !label) return;

  bar.setAttribute("aria-valuenow", String(percent));
  fill.style.inlineSize = `${percent}%`;
  label.textContent = `${percent}%`;
}

function showStep({
  steps,
  progress,
  previous,
  next,
  submit,
  index,
  moveFocus,
}: {
  steps: HTMLElement[];
  progress: HTMLElement;
  previous: HTMLButtonElement;
  next: HTMLButtonElement;
  submit: HTMLButtonElement;
  index: number;
  moveFocus: boolean;
}) {
  for (const [position, step] of steps.entries()) {
    step.hidden = position !== index;
  }

  setProgress(progress, index + 1, steps.length);

  previous.hidden = index === 0;
  next.hidden = index === steps.length - 1;
  submit.hidden = index !== steps.length - 1;

  if (moveFocus) {
    steps[index]?.querySelector<HTMLElement>("[data-step-heading]")?.focus();
  }
}

class MusiquizVenueOpeningForm extends HTMLElement {
  connectedCallback() {
    const workerUrl = this.dataset.workerUrl;
    const form = this.querySelector<HTMLFormElement>(
      "form[data-venue-opening-form]",
    );
    const messages = readMessages<ValidationMessages>(this);
    if (!workerUrl || !form || !messages) return;

    const steps = [...form.querySelectorAll<HTMLElement>("[data-step]")];
    const progress = form.querySelector<HTMLElement>("[data-progress]");
    const previous = form.querySelector<HTMLButtonElement>("[data-previous]");
    const next = form.querySelector<HTMLButtonElement>("[data-next]");
    const submit = form.querySelector<HTMLButtonElement>("[data-submit]");
    const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
    const pendingLabel = form.querySelector<HTMLElement>(
      "[data-pending-label]",
    );
    const failure = form.querySelector<HTMLElement>("[data-failure]");
    const success = form.querySelector<HTMLElement>("[data-success]");
    const fields = form.querySelector<HTMLFieldSetElement>("[data-fields]");
    if (
      !progress ||
      !previous ||
      !next ||
      !submit ||
      !submitLabel ||
      !pendingLabel ||
      !failure ||
      !success ||
      !fields ||
      steps.length === 0
    ) {
      return;
    }

    let current = 0;

    for (const field of getFields(form)) {
      refreshValidity(field, messages);
    }

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

      for (const peer of getGroup(form, field)) {
        refreshValidity(peer, messages);

        if (peer.validity.valid) {
          peer.removeAttribute("aria-invalid");
        }
      }
    });

    next.addEventListener("click", () => {
      const step = steps[current];
      if (!step) return;

      // `every` stops at the first failure, so only that field reports
      const valid = getFields(step).every((field) => field.reportValidity());
      if (!valid) return;

      current += 1;
      showStep({
        steps,
        progress,
        previous,
        next,
        submit,
        index: current,
        moveFocus: true,
      });
    });

    previous.addEventListener("click", () => {
      current -= 1;
      showStep({
        steps,
        progress,
        previous,
        next,
        submit,
        index: current,
        moveFocus: true,
      });
    });

    // the browser blocks an invalid submit, so this only runs on a valid form
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      failure.hidden = true;
      setPending({ submit, submitLabel, pendingLabel, pending: true });

      const sent = await postPayload({
        workerUrl,
        payload: buildPayload(form),
      });

      setPending({ submit, submitLabel, pendingLabel, pending: false });

      if (sent) {
        // a finished form should not be able to send a second copy
        fields.disabled = true;
        previous.disabled = true;
        submit.disabled = true;
        reveal(success);
      } else {
        reveal(failure);
      }
    });

    progress.hidden = false;
    showStep({
      steps,
      progress,
      previous,
      next,
      submit,
      index: current,
      moveFocus: false,
    });
  }
}

customElements.define("musiquiz-venue-opening-form", MusiquizVenueOpeningForm);
