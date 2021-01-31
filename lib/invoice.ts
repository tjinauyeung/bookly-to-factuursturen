import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import {
  Appointment
} from "./types";
import { formatJSON } from "./util";

const INVOICE_METHOD = "email";

export const createClient = async (
  appointment: Appointment
): Promise<string> => {
  const options = getOptions() as any;
  const json = {
    contact: appointment.customer.full_name,
    phone: appointment.customer.phone,
    email: appointment.customer.email,
    send_method: INVOICE_METHOD,
  };

  console.log(`Creating new client from`, formatJSON(json));

  const id = await got
    .post(ENDPOINTS.clients(), { ...options, json })
    .then((res) => res.body);

  console.log(`New client created with id:`, id);

  return id;
};

export const createInvoice = async (
  clientId: string,
  appointment: Appointment
): Promise<string> => {
  const options = getOptions() as any;
  const json = {
    clientnr: clientId,
    lines: [
      {
        amount: 1,
        description: appointment.service.title,
        price: appointment.service.price,
      },
    ],
    action: "send",
    sendmethod: "email",
  };

  console.log(`Creating new invoice:`, formatJSON(json));

  const id = await got
    .post(ENDPOINTS.invoices(), { ...options, json })
    .then((res) => res.body);

  console.log(`Invoice sent with id:`, id);

  return id;
};

function getOptions() {
  return {
    headers: {
      Authorization: getAuthHeader(
        process.env.FACTUUR_STUREN_USERNAME as string,
        process.env.FACTUUR_STUREN_PASSWORD as string
      ),
    },
    responseType: "json",
  };
}
