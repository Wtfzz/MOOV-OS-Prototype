import type { Client, ClientStatus, ClientType } from "@/types";

export const CLIENT_TYPES: ClientType[] = ["Global", "Country"];
export const CLIENT_STATUSES: ClientStatus[] = ["Active", "Inactive", "Prospect", "On Hold"];
export const INVOICE_LEGAL_ENTITIES = ["NL", "US", "DE", "CN", "GB", "SG"];
export const INVOICE_CURRENCIES = ["EUR", "USD", "GBP", "CNY", "SGD"];
export const INVOICE_FORMATS = ["Summary", "Detail", "Summary with Comments"];
export const INDUSTRY_SECTORS = ["Retail", "Manufacturing", "Consumer Goods", "E-commerce", "Other"];
export const DISCOUNT_PROFILES = ["LIDL_GLOBAL_DISCOUNT", "STANDARD", "NONE"];
export const COUNTRY_CODES = ["BD", "CN", "DE", "GB", "HU", "NL", "PL", "SG", "US"];

const STATUS_TRANSITIONS: Record<ClientStatus, ClientStatus[]> = {
  Prospect: ["Prospect", "Active", "On Hold", "Inactive"],
  Active: ["Active", "On Hold", "Inactive"],
  "On Hold": ["On Hold", "Active", "Inactive"],
  Inactive: ["Inactive", "Prospect", "Active"],
};

export function normalizeClientCode(value: string): string {
  return value.trim().toUpperCase();
}

export function nextClientId(clients: Client[]): number {
  const maxId = clients.reduce((max, client) => Math.max(max, Number(client.clientId) || 0), 10000);
  return maxId + 1;
}

export function normalizeClient(client: Partial<Client>, fallbackId: number): Client {
  const clientCode = normalizeClientCode(client.clientCode || client.customerCode || "");
  const clientName = (client.clientName || client.customerName || "").trim();
  const now = new Date().toISOString();

  return {
    id: client.id || `client${fallbackId}`,
    clientId: Number(client.clientId) || fallbackId,
    clientName,
    clientCode,
    clientType: client.clientType || "Global",
    operationalCountry: client.operationalCountry || "",
    industrySector: client.industrySector || "",
    status: client.status || (client.active === false ? "Inactive" : "Active"),
    invoiceLegalEntity: client.invoiceLegalEntity || "NL",
    invoiceCurrency: client.invoiceCurrency || "EUR",
    paymentTerms: client.paymentTerms || "",
    taxRegistrationNumber: client.taxRegistrationNumber || "",
    billingAddress: client.billingAddress || "",
    invoiceFormat: client.invoiceFormat || "Summary",
    creditLimit: client.creditLimit,
    discountProfile: client.discountProfile || "",
    address: {
      addressLine1: client.address?.addressLine1 || "",
      addressLine2: client.address?.addressLine2 || "",
      city: client.address?.city || "",
      stateProvince: client.address?.stateProvince || "",
      postalCode: client.address?.postalCode || "",
      country: client.address?.country || "",
    },
    contactPerson: client.contactPerson || "",
    contactEmail: client.contactEmail || "",
    contactPhone: client.contactPhone || "",
    timezone: client.timezone || "",
    createdAt: client.createdAt || now,
    createdBy: client.createdBy || "admin",
    updatedAt: client.updatedAt || now,
    updatedBy: client.updatedBy || "admin",
    active: typeof client.active === "boolean" ? client.active : true,
    notes: client.notes || "",
    customerCode: clientCode,
    customerName: clientName,
  };
}

export function validateClient(values: Partial<Client>, clients: Client[], editingClient?: Client | null): string | null {
  const code = normalizeClientCode(values.clientCode || values.customerCode || "");
  const name = (values.clientName || values.customerName || "").trim();
  const email = values.contactEmail?.trim();
  const phone = values.contactPhone?.trim();
  const operationalCountry = values.operationalCountry?.trim().toUpperCase();
  const addressCountry = values.address?.country?.trim().toUpperCase();

  if (!name) return "Client Name is required.";
  if (name.length > 100) return "Client Name cannot exceed 100 characters.";
  if (!code) return "Client Code is required.";
  if (code.length > 20) return "Client Code cannot exceed 20 characters.";
  if (!/^[A-Z0-9-]+$/.test(code)) return "Client Code must be uppercase letters, numbers, or hyphens.";
  if (clients.some((client) => normalizeClientCode(client.clientCode || client.customerCode) === code && client.id !== editingClient?.id)) {
    return "Duplicate Client Code.";
  }
  if (!CLIENT_TYPES.includes(values.clientType as ClientType)) return "Client Type is required.";
  if (values.clientType === "Country" && !operationalCountry) return "Country (Operational) is required for Country-type clients.";
  if (operationalCountry && !COUNTRY_CODES.includes(operationalCountry)) return "Country (Operational) must use a valid 2-letter country code.";
  if (!CLIENT_STATUSES.includes(values.status as ClientStatus)) return "Status is required.";
  if (editingClient && values.status && !STATUS_TRANSITIONS[editingClient.status].includes(values.status as ClientStatus)) {
    return `Status cannot change from ${editingClient.status} to ${values.status}.`;
  }
  if (!values.invoiceLegalEntity || !INVOICE_LEGAL_ENTITIES.includes(values.invoiceLegalEntity)) {
    return "Invoice Legal Entity is required and must exist in Legal Entity Config.";
  }
  if (!values.invoiceCurrency || !INVOICE_CURRENCIES.includes(values.invoiceCurrency)) {
    return "Invoice Currency is required and must exist in Currency Config.";
  }
  if (values.industrySector && !INDUSTRY_SECTORS.includes(values.industrySector)) return "Industry / Sector must match the defined classification list.";
  if (values.invoiceFormat && !INVOICE_FORMATS.includes(values.invoiceFormat)) return "Invoice Format must match a predefined invoice format.";
  if (values.discountProfile && !DISCOUNT_PROFILES.includes(values.discountProfile)) return "Discount Profile must match Discount Profile master.";
  if (values.taxRegistrationNumber && values.taxRegistrationNumber.length > 50) return "Tax Registration Number cannot exceed 50 characters.";
  if (values.address?.addressLine1 && values.address.addressLine1.length > 255) return "Address Line 1 cannot exceed 255 characters.";
  if (values.address?.addressLine2 && values.address.addressLine2.length > 255) return "Address Line 2 cannot exceed 255 characters.";
  if (values.address?.city && values.address.city.length > 50) return "City cannot exceed 50 characters.";
  if (values.address?.stateProvince && values.address.stateProvince.length > 30) return "State / Province cannot exceed 30 characters.";
  if (values.address?.postalCode && values.address.postalCode.length > 20) return "Postal Code cannot exceed 20 characters.";
  if (addressCountry && !COUNTRY_CODES.includes(addressCountry)) return "Country (Address) must use a valid 2-letter country code.";
  if (values.contactPerson && values.contactPerson.length > 100) return "Contact Person cannot exceed 100 characters.";
  if (email && (email.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return "Contact Email must be a valid email address.";
  if (phone && (phone.length > 20 || !/^[+()\d\s-]+$/.test(phone))) return "Contact Phone must be a valid phone number.";
  if (values.timezone && !/^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/.test(values.timezone)) return "Timezone must use a valid timezone format.";
  if (values.creditLimit !== undefined && values.creditLimit !== null && Number(values.creditLimit) < 0) return "Credit Limit must be a positive number.";

  return null;
}
