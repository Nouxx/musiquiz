import { defineFormElement } from "./formRuntime";

defineFormElement({
  tag: "musiquiz-quotation-form",
  formSelector: "[data-quotation-form]",
  buildPayload({ form, element }) {
    const data = new FormData(form);

    return {
      venueSlug: element.dataset.venueSlug ?? "",
      audience: element.dataset.audience ?? "",
      lastName: String(data.get("lastName") ?? ""),
      firstName: String(data.get("firstName") ?? ""),
      mail: String(data.get("mail") ?? ""),
      phone: String(data.get("phone") ?? ""),
      company: String(data.get("company") ?? ""),
      date: String(data.get("date") ?? ""),
      time: String(data.get("time") ?? ""),
      participants: String(data.get("participants") ?? ""),
      budget: String(data.get("budget") ?? ""),
      services: data.getAll("services").map(String),
      message: String(data.get("message") ?? ""),
    };
  },
});
