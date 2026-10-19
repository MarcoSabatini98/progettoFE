type ValoreCampo = string | number | Blob | readonly Blob[] | null | undefined;

/**
 * Payload → multipart. I valori assenti non partono;
 * le liste di file ripetono il campo, un file per voce.
 */
export function creaFormDati(dati: object): FormData {
  const form = new FormData();
  for (const [chiave, campo] of Object.entries(dati) as [string, ValoreCampo][]) {
    for (const valore of [campo].flat()) {
      if (valore != null) {
        form.append(chiave, valore instanceof Blob ? valore : String(valore));
      }
    }
  }
  return form;
}
