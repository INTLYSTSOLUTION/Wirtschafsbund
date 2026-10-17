export const fields = [
  { id: 'name', label: 'Vor- und Nachname', max: 120, type: 'text', required: true, group: 'person' },
  { id: 'email', label: 'E-Mail-Adresse', max: 254, type: 'email', required: true, group: 'person' },
  { id: 'school', label: 'Schule', max: 240, type: 'text', required: false, group: 'person' },
  { id: 'year', label: 'Jahrgang / Stufe', max: 40, type: 'text', required: false, group: 'person' },
  { id: 'project', label: 'Woran arbeitest du bereits oder was möchtest du aufbauen?', max: 1200, type: 'textarea', required: true, group: 'introduction' },
  { id: 'skills', label: 'Welche Fähigkeiten möchtest du einbringen?', max: 1000, type: 'textarea', required: true, group: 'introduction' },
  { id: 'motivation', label: 'Warum möchtest du Teil des Wirtschaftsbundes werden?', max: 1000, type: 'textarea', required: true, group: 'introduction' },
  { id: 'link', label: 'Projekt-, Portfolio- oder Profillink', max: 600, type: 'url', required: false, group: 'optional' },
  { id: 'discovery', label: 'Wie bist du auf uns aufmerksam geworden?', max: 240, type: 'text', required: false, group: 'optional' },
];
export function validate(data, requireAll = true) {
  const errors = {};
  for (const field of fields) {
    const value = data[field.id] ?? '';
    if (requireAll && field.required && !value.trim()) errors[field.id] = 'Bitte fülle dieses Feld aus.';
    else if (value.length > field.max) errors[field.id] = `Bitte verwende höchstens ${field.max} Zeichen.`;
    else if (value && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errors[field.id] = 'Bitte gib eine vollständige E-Mail-Adresse an.';
    else if (value && field.type === 'url') {
      try { const url = new URL(value); if (!['https:', 'http:'].includes(url.protocol) || !url.hostname.includes('.')) throw Error(); }
      catch { errors[field.id] = 'Bitte gib einen vollständigen Link mit https:// an.'; }
    }
    if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)) errors[field.id] = 'Bitte entferne unsichtbare Steuerzeichen aus dieser Angabe.';
  }
  return errors;
}
