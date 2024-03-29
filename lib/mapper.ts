import { Appointment, BooklyAppointment, ServicesNormalized } from "./types";

export const mapToResponse = (
  appointment: BooklyAppointment,
  services: ServicesNormalized
): Appointment => {
  const serviceId = appointment.service_id?.id;

  return {
    id: appointment.id,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    start_date: appointment.start_date,
    end_date: appointment.end_date,
    status: appointment.customer_appointment
      ? appointment.customer_appointment.status
      : "no-appointment",
    service: {
      id: services[serviceId]?.id,
      title: services[serviceId]?.title,
      price: services[serviceId]?.price,
    },
    payment_type: appointment.payment_details?.type,
    physician: {
      id: appointment.staff_id.id,
      email: appointment.staff_id.email,
      full_name: appointment.staff_id.full_name,
    },
    customer: {
      id: appointment.customer_appointment
        ? appointment.customer_appointment.customer_id
        : "no-customer",
    },
    discount: appointment.payment_details
      ? Number(services[serviceId].price) -
        Number(appointment.payment_details.total)
      : 0,
  };
};
