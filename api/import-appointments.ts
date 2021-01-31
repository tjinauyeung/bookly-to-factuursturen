import { getLastAppointments } from "../lib/get-appointments";

module.exports = async (req: Request, res: any) => {
  try {
    const appointments = await getLastAppointments();
    res.json(appointments);
  } catch (err) {
    console.error("Failed to import appointments:", err);
  }
};
