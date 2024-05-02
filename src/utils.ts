//
//
//  Utils
//
//

export function normalizeLocale(locale: string): string {
  return locale.toLowerCase().split("-")[0]
}
