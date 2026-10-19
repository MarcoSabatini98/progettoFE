/**
 * Fa scaricare un file arrivato dall'API (PDF, documenti): link temporaneo
 * sul Blob, clic, poi il link si libera.
 */
export function salvaFile(documento: Document, file: Blob, nome: string): void {
  const indirizzo = URL.createObjectURL(file);
  const link = documento.createElement('a');
  link.href = indirizzo;
  link.download = nome;
  link.click();
  URL.revokeObjectURL(indirizzo);
}
