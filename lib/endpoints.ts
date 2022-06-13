import path from "path";
import { sub, format } from "date-fns";

const getInvoiceSentEndpoint = () => {
  const date = sub(new Date(), { weeks: 1 });
  const since = format(date, "yyyy-MM-dd");
  console.log(`/invoices?since=${since}&count=-1`);
  return `/invoices?since=${since}&count=-1`;
};

export const ENDPOINTS = {
  services: () => endpoint.bookly(`/wpo_bookly_services`),
  appointments: () => endpoint.bookly(`/wpo_bookly_appointments`),
  appointment: (id?: string) =>
    endpoint.bookly(`/wpo_bookly_appointments/${id}`),
  customer: (id: string) => endpoint.bookly(`/wpo_bookly_customers/${id}`),
  invoices: () => endpoint.fs(`/invoices`),
  invoicesSaved: () => endpoint.fs(`/invoices_saved?count=-1`),
  invoicesSavedById: (id?: string) => endpoint.fs(`/invoices_saved/${id}`),
  invoicesSent: () => endpoint.fs(getInvoiceSentEndpoint()),
  invoicesSentById: (id?: string) => endpoint.fs(`/invoices/${id}`),
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
