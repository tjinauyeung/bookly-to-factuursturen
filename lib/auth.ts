export const getAuthHeader = (username: string, password: string) => {
  const base64 = Buffer.from(username + ":" + password).toString("base64");
  const auth = "Basic " + base64;
  return auth;
};
