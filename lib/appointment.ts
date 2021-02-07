import got from "got";
import { getAuthHeader } from "./auth";
import { ENDPOINTS } from "./endpoints";
import { mapToResponse } from "./mapper";
import { Appointment, BooklyAppointment, Customer, Service } from "./types";
import { normalize } from "./util";

export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    console.log("Start getting appointments...");

    const options = getOptions();
    const resp = await got(ENDPOINTS.appointments(), options as any);
    const appointments = (resp.body as unknown) as BooklyAppointment[];

    console.log("Enrich appointment data with services data");
    const services: Service[] = await got(
      ENDPOINTS.services(),
      options as any
    ).then((res: any) => res.body);

    const results = appointments.map((appointment: any) =>
      mapToResponse(appointment, normalize(services))
    );

    console.log("Finish getting latest appointments.");
    return results;
  } catch (err) {
    console.log("Failed to get appointments. Reason:", err);
    throw new Error(err);
  }
};

export const getAppointment = async (
  id: string
): Promise<Appointment | null> => {
  console.log(`Get appointment with id ${id}`);
  return got(ENDPOINTS.appointments(), getOptions() as any)
    .then((res) => res.body as any)
    .then((body) =>
      body && body.status === 404 ? null : (body as Appointment)
    )
    .catch((err) => {
      console.log(`Get appointment with id ${id} failed:`, err);
      throw new Error(err);
    });
};

export const getCustomer = (id: string): Promise<Customer> => {
  console.log(`Get customer data for id ${id}`);
  return got(ENDPOINTS.customer(id), getOptions() as any).then((res: any) => {
    console.log(`Get customer data for id ${id} complete.`);
    return res.body;
  });
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
