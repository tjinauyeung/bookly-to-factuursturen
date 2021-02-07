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
  getSavedInvoices,
} from "./lib/invoice";
import { Appointment, SavedInvoice } from "./lib/types";

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: any) => res.send("OK"));

const isSavedInFS = (
  saved_invoices: SavedInvoice[],
  appointment: Appointment
) => saved_invoices.some((invoice) => invoice.name.startsWith(appointment.id));

const isInBookly = (appointments: Appointment[], saved_invoice: SavedInvoice) =>
  appointments.some((appointment) =>
    saved_invoice.name.startsWith(appointment.id)
  );

app.get("/create-invoice", async (req: Request, res: any) => {
  try {
    console.log("-------------------------------------------------");
    console.log("Incoming request: start create-invoice service");
    console.log("-------------------------------------------------");

    const appointments = await getAppointments();
    const saved_invoices = await getSavedInvoices();

    for (const appointment of appointments) {
      if (!isSavedInFS(saved_invoices, appointment)) {
        const customer = await getCustomer(appointment.customer.id);
        const clientId = await createClient(customer);
        await createInvoice(clientId, appointment);
      }
    }

    for (const invoice of saved_invoices) {
      // if appointment is not in Bookly, but there is invoice;
      // then the appointment was cancelled.
      // So we need to clean up the data in FS
      if (!isInBookly(appointments, invoice)) {
        // double check per appointment if it really is not in Bookly
        const appointmentId = invoice.name.split("_")[0];
        const appointment = await getAppointment(appointmentId);
        if (appointment === null) {
          await deleteSavedInvoice(invoice.id);
          await deleteClient(invoice.clientnr);
        }
      }
    }

    res.json(appointments);

    console.log("------------------------------------------------");
    console.log("Finish request: create-invoice service complete.");
    console.log("------------------------------------------------");
  } catch (err) {
    console.error("Failed to import appointments:", err);
  }
});

app.listen(port, () => {
  console.log(`Server started. Listening on port ${port}`);
});
