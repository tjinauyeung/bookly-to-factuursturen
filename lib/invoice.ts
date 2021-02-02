import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { Appointment } from "./types";
import { formatJSON } from "./util";

export const createClient = async (
  appointment: Appointment
): Promise<string> => {
  try {
    const options = getOptions() as any;
    const json = {
      contact: appointment.customer.full_name,
      phone: appointment.customer.phone,
      email: appointment.customer.email,
    };

    console.log(`Creating new client from`, formatJSON(json));

    const id = await got
      .post(ENDPOINTS.clients(), { ...options, json })
      .then((res) => res.body);

    console.log(`New client created with id:`, id);

    return id;
  } catch (err) {
    console.error(
      `Failed to create client for appointment ${appointment.id}:`,
      err
    );
    throw new Error(err);
  }
};

const INVOICE_ACTION = {
  SEND: "send",
  SAVE: "save",
};

export const createInvoice = async (
  clientId: string,
  appointment: Appointment
): Promise<string> => {
  try {
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
      action: INVOICE_ACTION.SAVE,
      savename: `invoice_to_${appointment.customer.email}_${appointment.id}`,
    };

    console.log(`Creating new invoice:`, formatJSON(json));

    const id = await got
      .post(ENDPOINTS.invoices(), { ...options, json })
      .then((res) => res.body);

    console.log(`Invoice sent with id:`, id);

    return id;
  } catch (err) {
    console.error(`Failed to create invoice for client ${clientId}:`, err);
    throw new Error(err);
  }
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
