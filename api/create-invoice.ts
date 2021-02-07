import { getAppointments, getCustomer } from "../lib/appointment";
import { createClient, createInvoice } from "../lib/invoice";
import { formatJSON } from "../lib/util";

require("dotenv").config();

module.exports = async (req: Request, res: any) => {
  try {
    const appointments = await getAppointments();

    console.log(`latest appointments processed:`, formatJSON(appointments));

    for (const appointment of appointments) {
      const customer = await getCustomer(appointment.customer.id);
      const clientId = await createClient(customer);
      await createInvoice(clientId, appointment);
    }

    res.json(appointments);
  } catch (err) {
    console.error("Failed to import appointments:", err);
  }
};
