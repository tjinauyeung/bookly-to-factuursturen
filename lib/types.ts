export interface BooklyAppointment {
  id: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  service_id: any;
  customer_appointment: {
    customer_id: string;
    status: string;
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
  };
  status: string;
}

export interface SavedInvoice {
  id: string;
  name: string;
  reference: {
    line1: string;
    line2: string;
    line3: string;
  };
  lines: {
    line1: {
      amount: number;
      amount_desc: string;
      description: string;
      tax_rate: number;
      price: number
      discount_pct: number
      linetotal: number
    };
  };
  profile: string;
  profile_name: string;
  category: string;
  discounttype: string;
  discount: string;
  paymentcondition: string;
  paymentperiod: string;
  datesaved: string;
  totalintax: string;
  alreadypaid: string;
  alreadypaidmethod: string;
  clientnr: string;
  company: string;
  contact: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  tax_type: string;
  tax_shifted: string;
  sendmethod: string;
}

export interface Invoice {
  id: string;
  invoicenr_full: string;
  invoicenr: string;
  reference: {
    line1: string;
    line2: string;
    line3: string;
  };
  lines: {
    line1: {
      amount: number;
      amount_desc: string;
      description: string;
      tax_rate: number;
      price: number
      discount_pct: number
      linetotal: number
    };
  };
  profile: string;
  category: string;
  discounttype: string;
  discount: string;
  paymentcondition: string;
  paymentperiod: string;
  collection: string;
  tax: string;
  totalintax: string;
  clientnr: string;
  company: string;
  contact: string;
  address: string;
  zipcode: string;
  city: string;
  country: string;
  phone: string;
  mobile: string;
  email: string;
  taxnumber: string;
  invoicenote: string;
  sent: string;
  uncollectible: string;
  lastreminder: string;
  open: string;
  paiddate: string;
  taxes: {
    tax1: {
      rate: number;
      sum: string;
      sum_of: string;
    };
  };
  tax_type: string;
  language: string;
  tax_shifted: string;
  payment_url: string;
  duedate: string;
  history: {
    item1: {
      date: string;
      time: string;
      description: string;
    };
  };
}
