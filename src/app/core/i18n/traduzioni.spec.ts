import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import fr from '../../../../public/i18n/fr.json';
import italiano from '../../../../public/i18n/it.json';

/** Elenca le chiavi foglia di un file di traduzioni, es. "tema.scuro". */
function chiavi(oggetto: object, prefisso = ''): string[] {
  return Object.entries(oggetto).flatMap(([chiave, valore]) =>
    typeof valore === 'object' ? chiavi(valore, `${prefisso}${chiave}.`) : [`${prefisso}${chiave}`],
  );
}

describe('File di traduzione', () => {
  const riferimento = chiavi(italiano).sort();

  it.each(Object.entries({ en, fr, de, es }))("%s ha le stesse chiavi dell'italiano", (_, file) => {
    expect(chiavi(file).sort()).toEqual(riferimento);
  });
});
