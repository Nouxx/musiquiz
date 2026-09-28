import { defineFormElement } from "./formRuntime";

defineFormElement({
  tag: "musiquiz-contact-form",
  formSelector: "[data-contact-form]",
  buildPayload({ form, element }) {
    const data = new FormData(form);

    return {
      venueSlug: element.dataset.venueSlug ?? "",
      firstName: String(data.get("firstName") ?? ""),
      mail: String(data.get("mail") ?? ""),
      phone: String(data.get("phone") ?? ""),
      message: String(data.get("message") ?? ""),
    };
  },
});
