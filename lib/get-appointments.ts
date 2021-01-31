import { isAfter, sub } from "date-fns";
import got from "got";
import { mapToResponse } from "./mapper";
import {
  Appointment,
  Customer,
  CustomersNormalized,
  Service,
  ServicesNormalized,
} from "./types";

require("dotenv").config();

const baseUri = "https://rijbewijskeuringholland.nl/wp-json/wp/v2";
const endpoints = {
  appointments: () => baseUri + "/wpo_bookly_appointments",
  customer: (id: string) => baseUri + `/wpo_bookly_customers/${id}`,
  services: () => baseUri + `/wpo_bookly_services`,
};

const fromYesterday = (appointment: Appointment) =>
  isAfter(new Date(appointment.created_at), sub(new Date(), { days: 3 }));

const getAuth = (username: string, password: string) => {
  const base64 = Buffer.from(username + ":" + password).toString("base64");
  const auth = "Basic " + base64;
  return auth;
};

export const getLastAppointments = async () => {
  const opts = {
    headers: {
      Authorization: getAuth(
        process.env.BOOKLY_USERNAME as string,
        process.env.BOOKLY_PASSWORD as string
      ),
    },
    responseType: "json",
  };

  const resp = await got(endpoints.appointments(), opts as any);
  const body = resp.body as any;
  const appointments = body.filter(fromYesterday) as Appointment[];

  console.log(
    `appointments since yesterday:`,
    JSON.stringify(appointments, null, 2)
  );

  const customers: Customer[] = await Promise.all(
    appointments
      .map((appointment) => appointment.customer_appointment.customer_id)
      .map((id) =>
        got(endpoints.customer(id), opts as any).then((res: any) => res.body)
      )
  );

  const services = (await got(endpoints.services(), opts as any).then(
    (res: any) => res.body
  )) as Service[];

  console.log(
    `customers belonging to appointments requested:`,
    JSON.stringify(customers, null, 2)
  );

  const customersNormalized = customers.reduce((acc, customer) => {
    acc[customer.id] = customer;
    return acc;
  }, {} as CustomersNormalized);

  const servicesNormalized = services.reduce((acc, service) => {
    acc[service.id] = service;
    return acc;
  }, {} as ServicesNormalized);

  return appointments.map((appointment: any) =>
    mapToResponse(appointment, customersNormalized, servicesNormalized)
  );
};
