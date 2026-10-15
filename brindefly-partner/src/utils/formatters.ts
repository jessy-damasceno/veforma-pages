const wholeCurrencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('pt-BR')

const compactNumberFormatter = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
})

export const formatCurrencyFromCents = (cents: number): string =>
  cents % 100 === 0
    ? wholeCurrencyFormatter.format(cents / 100)
    : currencyFormatter.format(cents / 100)

/** `null` em limits significa ilimitado. */
export const formatLimit = (value: number | null): string =>
  value === null ? 'Ilimitado' : numberFormatter.format(value)

/** Versão curta para os selos dos planos: "10 mil", "1,5 mi". */
export const formatCompactLimit = (value: number | null): string =>
  value === null ? 'Ilimitado' : compactNumberFormatter.format(value)
