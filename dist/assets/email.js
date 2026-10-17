import { siteConfig } from './config.js';
export function hasEmail(config = siteConfig) {
  return config.emailConfirmed === true && /^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(config.applicationEmail);
}
export function emailMessage(name = '') {
  return `Guten Tag,\nanbei übersende ich meine persönliche Vorstellung und Anfrage zur Aufnahme in den Wirtschaftsbund.\n\nMit freundlichen Grüßen${name ? `\n${name}` : ''}`;
}
export function mailtoFor(name, config = siteConfig) {
  if (!hasEmail(config)) return null;
  return `mailto:${encodeURIComponent(config.applicationEmail)}?subject=${encodeURIComponent(`Anfrage zur Aufnahme – ${name}`)}&body=${encodeURIComponent(emailMessage(name))}`;
}
