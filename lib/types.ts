export interface BooklyAppointment {
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

export interface CustomersNormalized {
  [id: string]: Customer;
}

export interface ServicesNormalized {
  [id: string]: Service;
}

export interface Customer {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface Service {
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

export interface Appointment {
  id: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  location: string;
  service: {
    id: string;
    title: string;
    price: string;
  };
  physician: {
    id: string;
    email: string;
    full_name: string;
  };
  customer: {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    created_at: string;
  };
}
