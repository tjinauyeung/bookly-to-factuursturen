import express from "express";
import {
  getCustomer,
  getAppointments,
  getAppointment,
} from "./lib/appointment";
import {
  createClient,
  createInvoice,
  deleteClient,
  deleteSavedInvoice,
  deleteSentInvoices,
  getSavedInvoices,
  getSentInvoices,
} from "./lib/invoice";
import { Appointment, Invoice, SavedInvoice } from "./lib/types";

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

const isInFS = (
  appointment: Appointment,
  saved_invoices: SavedInvoice[],
  sent_invoices: Invoice[]
) =>
  isSavedInFS(appointment, saved_invoices) ||
  isSentByFS(appointment, sent_invoices);

const isSavedInFS = (
  appointment: Appointment,
  saved_invoices: SavedInvoice[]
) => {
  const isSaved =
    saved_invoices.some((invoice) => invoice.name.startsWith(appointment.id)) || // should be deprecated, check with reference line only
    saved_invoices.some((invoice) =>
      invoice.reference.line1.includes(appointment.id)
    );
  console.log(
    isSaved
      ? `Appointment ${appointment.id} is saved as concept invoice.`
      : `Appointment ${appointment.id} was not saved as concept invoice.`
  );
  return isSaved;
};

const isSentByFS = (appointment: Appointment, sent_invoices: Invoice[]) => {
  const isSent = sent_invoices.some((invoice) =>
    invoice.reference.line1.includes(appointment.id)
  );
  console.log(
    isSent
      ? `Appointment ${appointment.id} has been invoiced.`
      : `Appointment ${appointment.id} has not been invoiced.`
  );
  return isSent;
};

const isInBookly = (appointments: Appointment[], saved_invoice: SavedInvoice) =>
  appointments.some((appointment) =>
    saved_invoice.name.startsWith(appointment.id)
  );

const isCancelled = (
  appointments: Appointment[],
  invoice: SavedInvoice | Invoice
) => {
  const appointment = appointments.find((appointment) =>
    invoice.reference.line1.includes(appointment.id)
  );
  if (appointment && appointment.status === "cancelled") {
    console.log(
      `Appointment ID ${appointment.id} for invoice ID ${invoice.id} has status "cancelled"`
    );
    return true;
  }
  return false;
};

const isSentInBookly = (appointments: Appointment[], sent_invoice: Invoice) =>
  appointments.some((appointment) =>
    sent_invoice.reference.line1.includes(appointment.id)
  );

const shouldBeExcluded = (appointment: Appointment) =>
  Number(appointment.id) <= 513;

app.get("/create-invoice", async (req: Request, res: any) => {
  try {
    console.log("-------------------------------------------------");
    console.log("Incoming request: start create-invoice service");
    console.log("-------------------------------------------------");

    res.json({ time: new Date(), message: "Job started: create-invoice. OK" });

    const appointments = await getAppointments();
    const saved_invoices = await getSavedInvoices();
    const sent_invoices = await getSentInvoices();

    for (const appointment of appointments) {
      if (
        !shouldBeExcluded(appointment) &&
        !isInFS(appointment, saved_invoices, sent_invoices) &&
        appointment.customer.id !== 'no-customer'
      ) {
        const customer = await getCustomer(appointment.customer.id);
        try {
          const clientId = await createClient(customer);
          await createInvoice(clientId, appointment);
        } catch (e) {
          console.log(`Failed to create invoice for client ${customer.id}`, {
            customer,
          });
        }
      }
    }

    console.log("------------------------------------------------");
    console.log("Finish request: create-invoice service complete.");
    console.log("------------------------------------------------");
  } catch (err) {
    console.error("Failed to import appointments. Reason:", err);
  }
});

app.get("/", (req: Request, res: any) => res.send("OK"));

app.listen(port, () => {
  console.log(`Server started. Listening on port ${port}`);
});
