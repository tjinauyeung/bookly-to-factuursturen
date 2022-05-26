import express from "express";
import { getAppointments, getCustomer } from "./lib/appointment";
import {
  createClient,
  createInvoice,
  getSavedInvoices,
  getSentInvoices,
} from "./lib/invoice";
import { isInFS, isPaidByFS, shouldBeExcluded } from "./lib/validators";

require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get("/create-invoice", async (req: Request, res: any) => {
  try {
    console.log("-------------------------------------------------");
    console.log("Incoming request: start create-invoice service");
    console.log("-------------------------------------------------");

    res.json({ time: new Date(), message: "Job started: create-invoice. OK" });

    const appointments = await getAppointments();
    const sent_invoices = await getSentInvoices();

    const new_invoices = [];

    for (const appointment of appointments) {
      if (
        isPaidByFS(appointment) &&
        !shouldBeExcluded(appointment) &&
        !isInFS(appointment, sent_invoices) &&
        appointment.customer.id !== "no-customer"
      ) {
        const customer = await getCustomer(appointment.customer.id);
        try {
          const clientId = await createClient(customer);
          const invoiceName = await createInvoice(clientId, appointment);

          new_invoices.push(appointment.id);

          console.log("creating invoice for:", { customer, appointment });
        } catch (e) {
          console.log(`Failed to create invoice for client ${customer.id}`, {
            customer,
          });
        }
      }
    }

    console.log("------------------------------------------------");
    console.log("Finish request: create-invoice service complete.");
    console.log(`Invoices created: ${new_invoices.length}`);
    console.log("------------------------------------------------");
  } catch (err) {
    console.error("Failed to import appointments. Reason:", err);
  }
});

app.get("/", (req: Request, res: any) => res.send("OK"));

app.listen(port, () => {
  console.log(`Server started. Listening on port ${port}`);
});
