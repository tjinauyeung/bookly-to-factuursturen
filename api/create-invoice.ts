import { getLatestAppointments } from "../lib/appointment";
import { createClient, createInvoice } from "../lib/invoice";
import { formatJSON } from "../lib/util";

require("dotenv").config();

module.exports = async (req: Request, res: any) => {
  try {
    const appointments = await getLatestAppointments();

    console.log(`latest appointments processed:`, formatJSON(appointments));

    const clients: string[] = [];
    const invoices: string[] = [];

    for (const appointment of appointments) {
      const clientId = await createClient(appointment);
      const invoiceId = await createInvoice(clientId, appointment);

      clients.push(clientId);
      invoices.push(invoiceId);
    }

    console.log(`invoices sent: ${invoices.join(", ")}.`);
    console.log(`clients created: ${clients.join(", ")}.`);

    res.json(appointments);
  } catch (err) {
    console.error("Failed to import appointments:", err);
  }
};
