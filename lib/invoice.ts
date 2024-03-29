import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { Customer, Appointment, SavedInvoice, Invoice } from "./types";
import { formatJSON, formatPrice } from "./util";
import { format } from "date-fns";

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
    const time = format(new Date(appointment.start_date), "dd-MM-yyyy HH:mm");
    const VATPercentage = 21;
    const json = {
      clientnr: String(clientId),
      reference: {
        line1: `Afspraak ID: ${appointment.id}`,
        line2: `Arts: ${appointment.physician.full_name}`,
      },
      lines: [
        {
          amount: 1,
          description: appointment.service.title,
          price: Number(
            (Number(appointment.service.price) / (100 + VATPercentage)) * 100
          ).toFixed(2),
          tax_rate: 21,
        },
      ],
      action: INVOICE_ACTION.SEND,
      sendmethod: "email",
    };

    if (appointment.discount) {
      console.log(
        `Discount found. ${JSON.stringify({
          appointmentId: appointment.id,
          discount: appointment.discount,
        })}`
      );
      json.lines.push({
        amount: 1,
        description: `Kortings coupon van ${formatPrice(appointment.discount)}`,
        price: (appointment.discount * -1).toFixed(2),
        tax_rate: 0,
      });
    }

    console.log(
      `Sent invoice for appointment ${
        appointment.id
      } as ${name} with data: ${JSON.stringify(json)}`
    );

    await got.post(ENDPOINTS.invoices(), {
      ...options,
      json,
      responseType: "text",
    });

    console.log(`Sent invoice for appointment ${appointment.id} as ${name}.`);

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
    .then((res) => res.body as unknown as SavedInvoice[])
    .catch((err) => {
      console.error(`Failed to get saved invoices:`, err);
      throw new Error(err);
    });
};

export const getSentInvoices = (): Promise<Invoice[]> => {
  console.log("Retrieving sent invoices...");
  return got
    .get(ENDPOINTS.invoicesSent(), getOptions() as any)
    .then((res) => res.body as unknown as Invoice[])
    .catch((err) => {
      console.error(`Failed to get sent invoices:`, err);
      throw new Error(err);
    });
};

export const deleteSentInvoices = (id: string): Promise<Invoice[]> => {
  console.log(`Deleting sent invoice with id: ${id}`);
  return got
    .delete(ENDPOINTS.invoicesSentById(id), {
      ...(getOptions() as any),
      responseType: "text",
    })
    .then((res) => res.body as unknown as Invoice[])
    .catch((err) => {
      console.error(
        `Failed to delete sent invoice with id ${id}. Reason:`,
        err
      );
      throw new Error(err);
    });
};

export const deleteSavedInvoice = (id: string) => {
  console.log(`Deleting saved invoice with id: ${id}`);
  return got
    .delete(ENDPOINTS.invoicesSavedById(id), {
      ...(getOptions() as any),
      responseType: "text",
    })
    .catch((err) => {
      console.error(
        `Failed to delete saved invoice with id ${id}. Reason:`,
        err
      );
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
