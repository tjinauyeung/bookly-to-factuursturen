export const normalize = (arr: any[]) =>
  arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const formatPrice = (value: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
}

export const formatJSON = (json: object) => JSON.stringify(json, null, 2);
