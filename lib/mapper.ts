import { Appointment, BooklyAppointment, ServicesNormalized } from "./types";

interface Location {
  [id: string]: string;
}

const locations: Location = {
  "1": "Koppestokstraat 87, Haarlem",
  "2": "Overschiestraat 59, Amsterdam",
  "3": "Ouddiemerlaan 104, Diemen",
  "4": "Oosterkerkstraat 1, Leiden",
  "5": "Kanaalweg 33, Capelle aan den IJssel"
};

export const mapToResponse = (
  appointment: BooklyAppointment,
  services: ServicesNormalized
): Appointment => {
  const serviceId = appointment.service_id.id;
  return {
    id: appointment.id,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    start_date: appointment.start_date,
    end_date: appointment.end_date,
    location: locations[appointment.location_id] || "",
    status: appointment.customer_appointment.status,
    service: {
      id: services[serviceId].id,
      title: services[serviceId].title,
      price: services[serviceId].price,
    },
    physician: {
      id: appointment.staff_id.id,
      email: appointment.staff_id.email,
      full_name: appointment.staff_id.full_name,
    },
    customer: {
      id: appointment.customer_appointment.customer_id,
    },
    discount: appointment.payment_details
      ? Number(services[serviceId].price) - Number(appointment.payment_details.total)
      : 0,
  };
};
