export function getMailto(mail: string) {
  return `mailto:${mail.replaceAll(" ", "")}`;
}
