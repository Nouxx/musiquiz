import { buildVenueEmail } from "./buildVenueEmail";
import { senderEmail, senderName } from "./config";

function buildUrl() {
  return new URL("https://api.zeptomail.eu/v1.1/email");
}

function buildHeaders({ token }: { token: string }) {
  return {
    Authorization: `Zoho-enczapikey ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function buildBody({
  venueSlug,
  firstName,
  mail,
  phone,
  message,
}: {
  venueSlug: string;
  firstName: string;
  mail: string;
  phone: string;
  message: string;
}) {
  return JSON.stringify({
    from: { address: senderEmail, name: senderName },
    to: [
      {
        email_address: {
          address: buildVenueEmail(venueSlug),
          name: `Musiquiz ${venueSlug}`,
        },
      },
    ],
    subject: `Test: ${firstName}`,
    htmlbody: `<p>
        <b>Name:</b> ${firstName}</p>
        <p><b>Email:</b> ${mail}</p>
        <p><b>Message:</b> ${message}</p>
        <p><b>Phone:</b> ${phone}</p>
    `,
  });
}

export async function sendEmail({
  venueSlug,
  firstName,
  mail,
  phone,
  message,
  token,
}: {
  venueSlug: string;
  firstName: string;
  mail: string;
  phone: string;
  message: string;
  token: string;
}) {
  const url = buildUrl();
  const headers = buildHeaders({ token });
  const body = buildBody({ firstName, mail, message, phone, venueSlug });

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  });

  console.log("DEBUG response", response);

  if (!response.ok) {
    return Response.json(
      { error: "Send failed" },
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return Response.json(
    { ok: true },
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
