import path from "path";

export const ENDPOINTS = {
  services: () => endpoint.bookly(`/wpo_bookly_services`),
  appointments: () => endpoint.bookly("/wpo_bookly_appointments"),
  customer: (id: string) => endpoint.bookly(`/wpo_bookly_customers/${id}`),
  invoices: (id?: string) => endpoint.fs(`/invoices/${id}`),
  invoicesSaved: (id?: string) => endpoint.fs(`/invoices_saved/${id}`),
  clients: (id?: string) => endpoint.fs(`/clients/${id}`),
};

const endpoint = {
  bookly: (url: string) => {
    if (process.env.BOOKLY_API_URL) {
      return path.join(process.env.BOOKLY_API_URL, url);
    } else {
      throw new Error("Missing env variable: `BOOKLY_API_URL`");
    }
  },
  fs: (url: string) => {
    if (process.env.FACTUUR_STUREN_API_URL) {
      return path.join(process.env.FACTUUR_STUREN_API_URL, url);
    } else {
      throw new Error("Missing env variable: `FACTUUR_STUREN_API_URL`");
    }
  },
};
