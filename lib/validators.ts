import { Appointment, Invoice, SavedInvoice } from "./types";

export const isPaidByFS = (appointment: Appointment) =>
  appointment.payment_type === "local";

export const isInFS = (appointment: Appointment, sent_invoices: Invoice[]) =>
  isSentByFS(appointment, sent_invoices);

export const isSavedInFS = (
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

export const isSentByFS = (
  appointment: Appointment,
  sent_invoices: Invoice[]
) => {
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

export const isInBookly = (
  appointments: Appointment[],
  saved_invoice: SavedInvoice
) =>
  appointments.some((appointment) =>
    saved_invoice.name.startsWith(appointment.id)
  );

export const isCancelled = (
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

export const isSentInBookly = (
  appointments: Appointment[],
  sent_invoice: Invoice
) =>
  appointments.some((appointment) =>
    sent_invoice.reference.line1.includes(appointment.id)
  );

export const shouldBeExcluded = (appointment: Appointment) =>
  Number(appointment.id) <= 513;
