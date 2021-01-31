const got = require("got");
const { isAfter, sub } = require("date-fns");

const baseUri = "https://rijbewijskeuringholland.nl/wp-json/wp/v2";
const endpoints = {
  appointments: () => baseUri + "/wpo_bookly_appointments",
  customer: (id: string) => baseUri + `/wpo_bookly_customers/${id}`,
  services: () => baseUri + `/wpo_bookly_services`,
};

const CRONJOB_INTERVAL_IN_MINUTES = 5;

interface Appointment {
  id: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  service_id: any;
  customer_appointment: {
    customer_id: string;
  };
  staff_id: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface CustomersNormalized {
  [id: string]: Customer;
}

interface ServicesNormalized {
  [id: string]: Service;
}

interface Customer {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
}

interface Service {
  id: string;
  category_id: {
    id: string;
    name: string; // address
  };
  duration: string;
  type: string;
  title: string;
  price: string;
}

const fromYesterday = (appointment: Appointment) =>
  isAfter(new Date(appointment.created_at), sub(new Date(), { days: 3 }));

const getAuth = (username: string, password: string) => {
  const base64 = Buffer.from(username + ":" + password).toString("base64");
  const auth = "Basic " + base64;
  return auth;
};

const getLastAppointments = async () => {
  const opts = {
    headers: {
      Authorization: getAuth("tjinauyeung@gmail.com", "Kwispelen1!"),
    },
    responseType: "json",
  };

  const resp = await got(endpoints.appointments(), opts);
  const appointments = resp.body.filter(fromYesterday) as Appointment[];

  console.log(
    `appointments since yesterday:`,
    JSON.stringify(appointments, null, 2)
  );

  const customers: Customer[] = await Promise.all(
    appointments
      .map((appointment) => appointment.customer_appointment.customer_id)
      .map((id) =>
        got(endpoints.customer(id), opts).then((res: any) => res.body)
      )
  );

  const services = (await got(endpoints.services(), opts).then(
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

module.exports = async (req: Request, res: any) => {
  try {
    const appointments = await getLastAppointments();
    res.json(appointments);
  } catch (e) {
    console.error("Failed to import appointments from Bookly:", e);
  }
};

const mapToResponse = (
  appointment: Appointment,
  customers: CustomersNormalized,
  services: ServicesNormalized
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
