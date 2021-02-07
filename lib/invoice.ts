import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { Customer, Appointment, SavedInvoice } from "./types";
import { formatJSON } from "./util";

export const createClient = async (customer: Customer): Promise<string> => {
  try {
    const options = getOptions() as any;
    const json = {
      contact: customer.full_name,
      phone: customer.phone,
      email: customer.email,
    };

    console.log(`Creating new fs client from`, formatJSON(json));

    const id = await got
      .post(ENDPOINTS.clients(), { ...options, json })
      .then((res) => res.body);

    console.log(`New client created with id:`, id);

    return id;
  } catch (err) {
    console.error(
      `Failed to create new fs client for customer with id ${customer.id}:`,
      err
    );
    throw new Error(err);
  }
};

export const deleteClient = (id: string) => {
  console.log(`Removing client with id ${id} from factuursturen.nl`);
  return got
    .delete(ENDPOINTS.clients(id), {
      ...(getOptions() as any),
      responseType: "text",
    })
    .catch((err) =>
      console.log(`Removing client with id ${id} failed with reason`, err)
    );
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
    const name = `${appointment.id}_invoice_to_${clientId}`;
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
      savename: name,
    };

    const id = await got
      .post(ENDPOINTS.invoices(), { ...options, json })
      .then((res) => res.body);

    console.log(`Saved invoice with name:`, name);

    return name;
  } catch (err) {
    console.error(`Failed to create invoice for client ${clientId}:`, err);
    throw new Error(err);
  }
};

export const getSavedInvoices = (): Promise<SavedInvoice[]> => {
  console.log("Retrieving saved invoices...");
  return got
    .get(ENDPOINTS.invoicesSaved(), getOptions() as any)
    .then((res) => (res.body as unknown) as SavedInvoice[])
    .catch((err) => {
      console.error(`Failed to get saved invoices:`, err);
      throw new Error(err);
    });
};

export const deleteSavedInvoice = (id: string) => {
  console.log(`Deleting invoice with id: ${id}`);
  return got
    .delete(ENDPOINTS.invoicesSaved(id), {
      ...(getOptions() as any),
      responseType: "text",
    })
    .catch((err) => {
      console.error(`Failed to delete invoice with id ${id}. Reason:`, err);
      throw new Error(err);
    });
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
