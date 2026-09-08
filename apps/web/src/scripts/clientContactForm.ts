class MusiquizContactForm extends HTMLElement {
  connectedCallback() {
    const workerUrl = this.dataset.workerUrl;
    const venueSlug = this.dataset.venueSlug;
    const form = this.querySelector<HTMLFormElement>("[data-contact-form]");
    if (!workerUrl || !venueSlug || !form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

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
    });
  }
}

customElements.define("musiquiz-contact-form", MusiquizContactForm);
