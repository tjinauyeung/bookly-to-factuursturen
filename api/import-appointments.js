const got = require('got');
const { isAfter, sub } = require('date-fns');
import { isAfter, sub } from "date-fns";

// interface Appointment {
//   id: string;
//   created_at: string;
//   updated_at: string;
//   start_date: string;
//   end_date: string;
//   service_id: any;
//   customer_appointment: {
//     customer_id: string;
//   };
//   staff_id: {
//     id: string;
//     full_name: string;
//     email: string;
//   };
// }

// interface CustomersNormalized {
//   [id: string]: Customer;
// }

// interface ServicesNormalized {
//   [id: string]: Service;
// }

// interface Customer {
//   id: string;
//   full_name: string;
//   first_name: string;
//   last_name: string;
//   phone: string;
//   email: string;
//   created_at: string;
// }

// interface Service {
//   id: string;
//   category_id: {
//     id: string;
//     name: string; // address
//   };
//   duration: string;
//   type: string;
//   title: string;
//   price: string;
// }

const baseUri = "https://rijbewijskeuringholland.nl/wp-json/wp/v2";
const endpoints = {
  appointments: () => baseUri + "/wpo_bookly_appointments",
  customer: (id) => baseUri + `/wpo_bookly_customers/${id}`,
  services: () => baseUri + `/wpo_bookly_services`,
};

const CRONJOB_INTERVAL_IN_MINUTES = 60;

const fromYesterday = (appointment) =>
  isAfter(
    new Date(appointment.created_at),
    sub(new Date(), { days: 3 })
  );

const getAuth = (username, password) => {
  const base64 = Buffer.from(username + ":" + password).toString("base64");
  const auth = "Basic " + base64;
  return auth;
};

module.exports = (req, res) => {
  try {
    const opts = {
      headers: {
        Authorization: getAuth("tjinauyeung@gmail.com", "Kwispelen1!"),
      },
      responseType: "json",
    };

    const resp = await got(endpoints.appointments(), opts);
    const body = resp.body;
    const appointments = body.filter(fromYesterday);

    console.log(`appointments since yesterday:`, JSON.stringify(appointments));

    const customers = await Promise.all(
      appointments
        .map((appointment) => appointment.customer_appointment.customer_id)
        .map((id) =>
          got(endpoints.customer(id), opts).then((res) => res.body)
        )
    );

    const services = (await got(endpoints.services(), opts).then(
      (res) => res.body
    ));

    console.log(
      `customers belonging to appointments requested:`,
      JSON.stringify(customers)
    );

    const customersNormalized = customers.reduce((acc, customer) => {
      acc[customer.id] = customer;
      return acc;
    }, {});

    const servicesNormalized = services.reduce((acc, service) => {
      acc[service.id] = service;
      return acc;
    }, {});

    console.log(`normalized customers`, JSON.stringify(customersNormalized));
    console.log(`normalized services`, JSON.stringify(servicesNormalized));

    res.json(
      appointments.map((appointment) =>
        mapToResponse(appointment, customersNormalized, servicesNormalized)
      )
    );
  } catch (e) {
    next(e);
  }
};

const mapToResponse = (
  appointment,
  customers,
  services
) => {
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
