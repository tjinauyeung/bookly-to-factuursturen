import {
  Appointment,
  BooklyAppointment,
  CustomersNormalized,
  ServicesNormalized,
} from "./types";

export const mapToResponse = (
  appointment: BooklyAppointment,
  customers: CustomersNormalized,
  services: ServicesNormalized
): Appointment => {
  const customerId = appointment.customer_appointment.customer_id;
  const serviceId = appointment.service_id.id;
  return {
    id: appointment.id,
    created_at: appointment.created_at,
    updated_at: appointment.updated_at,
    start_date: appointment.start_date,
    end_date: appointment.end_date,
    location: services[serviceId].category_id.name,
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
      id: customerId,
      full_name: customers[customerId].full_name,
      first_name: customers[customerId].first_name,
      last_name: customers[customerId].last_name,
      phone: customers[customerId].phone,
      email: customers[customerId].email,
      created_at: customers[customerId].created_at,
    },
  };
};
