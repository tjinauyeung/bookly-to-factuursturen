import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { mapToResponse } from "./mapper";
import { Appointment, BooklyAppointment, Customer, Service } from "./types";
import { formatJSON, normalize } from "./util";
import moment from "moment";
import "moment-timezone";

moment.tz.setDefault("Europe/Amsterdam");

const sinceLastImport = (appointment: BooklyAppointment) => {
  const createdAt = moment(appointment.created_at);
  return createdAt.isAfter(moment().subtract(1, "hours"));
};

export const getLatestAppointments = async (): Promise<Appointment[]> => {
  const options = getOptions();
  const resp = await got(ENDPOINTS.appointments(), options as any);
  const body = resp.body as any;
  const appointments = body.filter(sinceLastImport) as BooklyAppointment[];

  console.log(`appointments imported:`, formatJSON(appointments));

  const services: Service[] = await got(
    ENDPOINTS.services(),
    options as any
  ).then((res: any) => res.body);

  console.log(`services requested:`, formatJSON(services));

  const customers: Customer[] = await Promise.all(
    appointments
      .map((appointment) => appointment.customer_appointment.customer_id)
      .map((id) =>
        got(ENDPOINTS.customer(id), options as any).then((res: any) => res.body)
      )
  );

  console.log(`customers requested:`, formatJSON(customers));

  const results = appointments.map((appointment: any) =>
    mapToResponse(appointment, normalize(customers), normalize(services))
  );

  return results;
};

function getOptions() {
  return {
    headers: {
      Authorization: getAuthHeader(
        process.env.BOOKLY_USERNAME as string,
        process.env.BOOKLY_PASSWORD as string
      ),
    },
    responseType: "json",
  };
}
