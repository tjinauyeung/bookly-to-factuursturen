export const normalize = (arr: any[]) =>
  arr.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

export const formatJSON = (json: object) => JSON.stringify(json, null, 2);
