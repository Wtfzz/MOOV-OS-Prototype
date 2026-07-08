export type MasterFieldLevel = "Main" | "Sub";

export type MasterFieldDefinition = {
  key: string;
  label: string;
  dataType: string;
  required: "Yes" | "No" | "Conditional" | string;
  primaryKey: boolean;
  addValidation: string;
  editValidation: string;
  sample: string;
  level: MasterFieldLevel;
};

export type MasterEntitySchema = {
  id: string;
  entityName: string;
  pageTitle: string;
  description: string;
  stateKey: string;
  idPrefix: string;
  fields: MasterFieldDefinition[];
};

export const masterDataSchemas = {
  businessPartner: {
    id: "businessPartner",
    entityName: "Business Partner",
    pageTitle: "Business Partner Master Data",
    description: "Manage business partner master records with main fields in the list and sub fields in expandable details.",
    stateKey: "organizations",
    idPrefix: "BP",
    fields: [
      {
        key: "bpID", label: `BP ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated or manually assigned; must be unique; cannot be duplicated`, editValidation: `Immutable`, sample: `10001`, level: "Main",
      },
      {
        key: "companyName", label: `Company Name`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters; must match legal registration`, editValidation: `Required; max 100 characters; rename allowed but may affect printed documents`, sample: `Vietnam Textile Factory Co., Ltd.`, level: "Main",
      },
      {
        key: "addressLine1", label: `Address Line 1`, dataType: `VARCHAR(255)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 255 characters; typically street and number`, editValidation: `Required; max 255 characters`, sample: `123 Hai Phong St`, level: "Sub",
      },
      {
        key: "addressLine2", label: `Address Line 2`, dataType: `VARCHAR(255)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 255 characters`, editValidation: `Optional; max 255 characters`, sample: `Floor 5, District 1`, level: "Sub",
      },
      {
        key: "addressLine3", label: `Address Line 3`, dataType: `VARCHAR(255)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 255 characters`, editValidation: `Optional; max 255 characters`, sample: ``, level: "Sub",
      },
      {
        key: "city", label: `City`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters`, editValidation: `Required; max 100 characters`, sample: `Hanoi`, level: "Sub",
      },
      {
        key: "stateProvince", label: `State / Province`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters; required by some countries`, editValidation: `Optional; max 100 characters`, sample: ``, level: "Sub",
      },
      {
        key: "postalCodeZipCode", label: `Postal Code / Zip Code`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 20 characters; required by some carriers`, editValidation: `Optional; max 20 characters`, sample: ``, level: "Sub",
      },
      {
        key: "country", label: `Country`, dataType: `CHAR(2)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must be a valid ISO 3166-1 alpha-2 code and exist in Location Master`, editValidation: `Required; must remain a valid ISO 3166-1 alpha-2 code`, sample: `VN`, level: "Main",
      },
      {
        key: "contactPerson", label: `Contact Person`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters`, editValidation: `Optional; max 100 characters`, sample: `Mr. Nguyen Van A`, level: "Sub",
      },
      {
        key: "contactEmail", label: `Contact Email`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be valid email format`, editValidation: `Optional; must be valid email format`, sample: `contact@vtf.com`, level: "Main",
      },
      {
        key: "contactPhone", label: `Contact Phone`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be valid phone format`, editValidation: `Optional; must be valid phone format`, sample: `+84 24 1234 5678`, level: "Main",
      },
      {
        key: "scac", label: `SCAC`, dataType: `CHAR(4)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Party Type / Role = Carrier (ocean/truck); must be exactly 4 uppercase characters`, editValidation: `Allowed; must remain exactly 4 uppercase characters if provided`, sample: `MSCU (Carrier example)`, level: "Sub",
      },
      {
        key: "iataCode", label: `IATA Code`, dataType: `CHAR(3)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Party Type / Role = Carrier and transport mode is Air; must be exactly 3 uppercase characters`, editValidation: `Allowed; must remain exactly 3 uppercase characters if provided`, sample: `N/A (ocean carrier example)`, level: "Sub",
      },
      {
        key: "roleID", label: `Role ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: false,
        addValidation: `System-generated or manually assigned; must be unique within Business Partner Role table`, editValidation: `Immutable`, sample: `30001`, level: "Main",
      },
      {
        key: "customerID", label: `Customer ID`, dataType: `BIGINT`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for client-specific roles (Shipper, Consignee, Notify, etc.); N/A for independent carriers; must reference existing Customer`, editValidation: `Allowed; must reference existing Customer; set to N/A only for non-client-specific roles`, sample: `10002`, level: "Main",
      },
      {
        key: "partyTypeRoleType", label: `Party Type / Role Type`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed values: Shipper, Consignee, Notify Party, Also Notify, Carrier, Invoice Payer, Forwarding Agent, Customs Broker, Beneficial Owner, Ultimate Consignee`, editValidation: `Allowed; must be from allowed values; changing role may affect linked shipments`, sample: `Shipper`, level: "Main",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete (do not hard-delete if referenced by shipments)`, sample: `TRUE`, level: "Main",
      },
      {
        key: "notes", label: `Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: `Supplier shipper for LIDL Vietnam`, level: "Sub",
      },
    ],
  },
  carrier: {
    id: "carrier",
    entityName: "Carrier",
    pageTitle: "Carrier Master Data",
    description: "Manage carrier master records with main fields in the list and sub fields in expandable details.",
    stateKey: "carriers",
    idPrefix: "CAR",
    fields: [
      {
        key: "carrierID", label: `Carrier ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `20001`, level: "Main",
      },
      {
        key: "carrierName", label: `Carrier Name`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters`, editValidation: `Required; max 100 characters`, sample: `Mediterranean Shipping Company`, level: "Main",
      },
      {
        key: "carrierCode", label: `Carrier Code`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 20 characters; uppercase`, editValidation: `Immutable (business key); if changed, must remain unique and update references`, sample: `MSC-GLOBAL`, level: "Main",
      },
      {
        key: "carrierType", label: `Carrier Type`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Ocean, Air, Rail, Trucking, Multimodal, Feeder, NVOCC`, editValidation: `Allowed; must match allowed values; changing may affect SCAC/IATA/ICAO requirements`, sample: `Ocean`, level: "Main",
      },
      {
        key: "scac", label: `SCAC`, dataType: `CHAR(4)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for Ocean, Rail, and Trucking carriers; max 4 characters; uppercase; unique`, editValidation: `Allowed; required for applicable carrier types; must remain unique`, sample: `MSCU`, level: "Sub",
      },
      {
        key: "iataCode", label: `IATA Code`, dataType: `CHAR(3)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for Air carriers; exactly 3 uppercase characters`, editValidation: `Allowed; required if Carrier Type = Air; must remain 3 uppercase characters`, sample: ``, level: "Sub",
      },
      {
        key: "icaoCode", label: `ICAO Code`, dataType: `CHAR(4)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for Air carriers; max 4 characters; uppercase`, editValidation: `Allowed; required if Carrier Type = Air; must remain valid format`, sample: ``, level: "Sub",
      },
      {
        key: "status", label: `Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Active, Inactive, Suspended, Under Review`, editValidation: `State-machine controlled; validate allowed transitions`, sample: `Active`, level: "Main",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete; warn if linked contracts/voyages exist`, sample: `TRUE`, level: "Main",
      },
      {
        key: "signingLegalEntityID", label: `Signing Legal Entity ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must reference an existing Legal Entity record`, editValidation: `Allowed; must reference existing Legal Entity; changes may require contract review`, sample: `NL (MOOV Netherlands)`, level: "Sub",
      },
      {
        key: "paymentCurrency", label: `Payment Currency`, dataType: `CHAR(3)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must exist in Currency Config`, editValidation: `Allowed; must exist in Currency Config; warn if open payables use old currency`, sample: `EUR`, level: "Sub",
      },
      {
        key: "paymentTerms", label: `Payment Terms`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., 30 days, 45 days, 60 days`, editValidation: `Optional; max 30 characters`, sample: `45 days`, level: "Sub",
      },
      {
        key: "taxRegistrationNumber", label: `Tax Registration Number`, dataType: `VARCHAR(50)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if invoicing enabled; validated per country format`, editValidation: `Allowed; required if invoicing enabled`, sample: `CH-876543210`, level: "Sub",
      },
      {
        key: "serviceType", label: `Service Type`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., Ocean Freight, Air Freight, Trucking, Warehousing`, editValidation: `Optional; max 30 characters`, sample: `Ocean Freight, Logistics`, level: "Sub",
      },
      {
        key: "capacityVolumeCommitment", label: `Capacity / Volume Commitment`, dataType: `NUMERIC(18,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0; used for allocation planning`, editValidation: `Optional; must be ≥ 0`, sample: ``, level: "Sub",
      },
      {
        key: "slaProfile", label: `SLA Profile`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., CARRIER_PREMIUM, CARRIER_STANDARD; must match SLA Config`, editValidation: `Optional; must match SLA Config`, sample: `CARRIER_PREMIUM`, level: "Sub",
      },
      {
        key: "contactPerson", label: `Contact Person`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters`, editValidation: `Optional; max 100 characters`, sample: ``, level: "Sub",
      },
      {
        key: "contactEmail", label: `Contact Email`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid email format`, editValidation: `Optional; valid email format`, sample: ``, level: "Sub",
      },
      {
        key: "contactPhone", label: `Contact Phone`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid phone format`, editValidation: `Optional; valid phone format`, sample: ``, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
    ],
  },
  client: {
    id: "client",
    entityName: "Client",
    pageTitle: "Client Master Data",
    description: "Manage client master records with main fields in the list and sub fields in expandable details.",
    stateKey: "clients",
    idPrefix: "CLI",
    fields: [
      {
        key: "clientID", label: `Client ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique; cannot be duplicated`, editValidation: `Immutable`, sample: `10001`, level: "Main",
      },
      {
        key: "clientName", label: `Client Name`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters`, editValidation: `Required; max 100 characters; rename allowed if no legal impact`, sample: `LIDL Global`, level: "Main",
      },
      {
        key: "clientCode", label: `Client Code`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 20 characters; uppercase`, editValidation: `Immutable (business key); if change is absolutely required, must be unique and update all references`, sample: `LIDL-GLOBAL`, level: "Main",
      },
      {
        key: "clientType", label: `Client Type`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed values: Global, Country`, editValidation: `Generally immutable; changing Global ↔ Country can break hierarchy and should be restricted`, sample: `Global`, level: "Main",
      },
      {
        key: "countryOperational", label: `Country (Operational)`, dataType: `CHAR(2)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Client Type = Country; must exist in Location Master`, editValidation: `Edit allowed; must remain consistent with Parent Client ID`, sample: `NULL (Global client)`, level: "Main",
      },
      {
        key: "industrySector", label: `Industry / Sector`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must match defined classification list if provided`, editValidation: `Optional; must match defined classification list if provided`, sample: `Retail`, level: "Sub",
      },
      {
        key: "status", label: `Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default Active; allowed: Active, Inactive, Prospect, On Hold`, editValidation: `State-machine controlled; validate allowed transitions (e.g., Prospect → Active)`, sample: `Active`, level: "Main",
      },
      {
        key: "invoiceLegalEntity", label: `Invoice Legal Entity`, dataType: `BIGINT`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must exist in Legal Entity Config`, editValidation: `Allowed; warn if open contracts exist under old entity`, sample: `NL (MOOV Netherlands)`, level: "Main",
      },
      {
        key: "invoiceCurrency", label: `Invoice Currency`, dataType: `CHAR(3)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must exist in Currency Config`, editValidation: `Allowed; does not retroactively change open invoices`, sample: `EUR`, level: "Main",
      },
      {
        key: "paymentTerms", label: `Payment Terms`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., 30 days, 60 days, Net 30`, editValidation: `Optional; does not retroactively change open invoices`, sample: `45 days`, level: "Sub",
      },
      {
        key: "taxRegistrationNumber", label: `Tax Registration Number`, dataType: `VARCHAR(50)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Invoicing is enabled; format validated per country`, editValidation: `Allowed; re-validate format per country`, sample: `NL123456789B01`, level: "Sub",
      },
      {
        key: "billingAddress", label: `Billing Address`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text or structured address`, editValidation: `Optional; free text or structured address`, sample: `LIDL Global HQ, Stationsplein, Amsterdam, NL`, level: "Sub",
      },
      {
        key: "invoiceFormat", label: `Invoice Format`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., Summary, Detail, Summary with Comments`, editValidation: `Optional; must match predefined invoice formats`, sample: `Summary`, level: "Sub",
      },
      {
        key: "creditLimit", label: `Credit Limit`, dataType: `NUMERIC(18,4)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be a positive number`, editValidation: `Allowed; must be positive; validate against outstanding AR if reducing limit`, sample: `500,000.00`, level: "Sub",
      },
      {
        key: "discountProfile", label: `Discount Profile`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must match Discount Profile master`, editValidation: `Optional; must match Discount Profile master`, sample: `LIDL_GLOBAL_DISCOUNT`, level: "Sub",
      },
      {
        key: "addressLine12", label: `Address Line 1 / 2`, dataType: `VARCHAR(255)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 255 characters`, editValidation: `Optional; max 255 characters`, sample: `Stationsplein 1`, level: "Sub",
      },
      {
        key: "city", label: `City`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 50 characters`, editValidation: `Optional; max 50 characters`, sample: `Amsterdam`, level: "Sub",
      },
      {
        key: "stateProvince", label: `State / Province`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 30 characters`, editValidation: `Optional; max 30 characters`, sample: `North Holland`, level: "Sub",
      },
      {
        key: "postalCode", label: `Postal Code`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 20 characters`, editValidation: `Optional; max 20 characters`, sample: `1012 AB`, level: "Sub",
      },
      {
        key: "countryAddress", label: `Country (Address)`, dataType: `CHAR(2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must exist in Config Center`, editValidation: `Optional; must exist in Config Center`, sample: `NL`, level: "Sub",
      },
      {
        key: "contactPerson", label: `Contact Person`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters`, editValidation: `Optional; max 100 characters`, sample: `John Smith`, level: "Sub",
      },
      {
        key: "contactEmail", label: `Contact Email`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be valid email format`, editValidation: `Optional; must be valid email format`, sample: `john.smith@lidl.com`, level: "Main",
      },
      {
        key: "contactPhone", label: `Contact Phone`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be valid phone format`, editValidation: `Optional; must be valid phone format`, sample: `+31 20 123 4567`, level: "Main",
      },
      {
        key: "timezone", label: `Timezone`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid timezone format`, editValidation: `Optional; valid timezone format`, sample: `Europe/Amsterdam`, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete (must not hard-delete)`, sample: `TRUE`, level: "Main",
      },
      {
        key: "notes", label: `Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: `Global parent client for all LIDL country subsidiaries`, level: "Sub",
      },
    ],
  },
  equipment: {
    id: "equipment",
    entityName: "Equipment",
    pageTitle: "Equipment Master Data",
    description: "Manage equipment master records with main fields in the list and sub fields in expandable details.",
    stateKey: "equipment",
    idPrefix: "EQ",
    fields: [
      {
        key: "equipmentID", label: `Equipment ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `50001`, level: "Main",
      },
      {
        key: "equipmentCode", label: `Equipment Code`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 20 characters; uppercase`, editValidation: `Immutable (business key); if changed, must remain unique and update references`, sample: `40GP`, level: "Main",
      },
      {
        key: "equipmentType", label: `Equipment Type`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Container, Trailer, Railcar, Aircraft Container, Vehicle, Flatbed, Tank, Other`, editValidation: `Allowed; must be from allowed values; changing may affect dependent category/spec validations`, sample: `Container`, level: "Main",
      },
      {
        key: "equipmentCategory", label: `Equipment Category`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must match allowed values for the selected Equipment Type (e.g., Container: Dry, Reefer, Open-Top, Flat Rack, Tank, Bulk)`, editValidation: `Allowed; must remain valid for the current Equipment Type`, sample: `Dry`, level: "Main",
      },
      {
        key: "equipmentStatus", label: `Equipment Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Available, In Use, Under Maintenance, Damaged, Scrapped, Lost`, editValidation: `State-machine controlled; validate allowed transitions (e.g., cannot set Scrapped back to Available)`, sample: `Available`, level: "Main",
      },
      {
        key: "ownerType", label: `Owner Type`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Owned, Leased, Rented, Customer Owned`, editValidation: `Allowed; must be from allowed values; changing may require lease/contract validation`, sample: `Owned`, level: "Main",
      },
      {
        key: "ownerCarrierProfile", label: `Owner / Carrier Profile`, dataType: `BIGINT`, required: `No`, primaryKey: false,
        addValidation: `Optional; must reference an existing Carrier record`, editValidation: `Optional; must reference an existing Carrier record`, sample: `20001 (MSC)`, level: "Sub",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete; warn if equipment is in use`, sample: `TRUE`, level: "Main",
      },
      {
        key: "lengthFt", label: `Length (ft)`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for space planning and route restrictions`, editValidation: `Optional; must be >= 0`, sample: `40.00`, level: "Sub",
      },
      {
        key: "widthFt", label: `Width (ft)`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for space planning`, editValidation: `Optional; must be >= 0`, sample: `8.00`, level: "Sub",
      },
      {
        key: "heightFt", label: `Height (ft)`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for height restrictions and bridge clearance`, editValidation: `Optional; must be >= 0`, sample: `8.50`, level: "Sub",
      },
      {
        key: "weightTare", label: `Weight (Tare)`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for payload calculation`, editValidation: `Optional; must be >= 0`, sample: `3750.00`, level: "Sub",
      },
      {
        key: "maxPayloadGrossWeight", label: `Max Payload / Gross Weight`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for weight limit enforcement`, editValidation: `Optional; must be >= 0`, sample: `28750.00`, level: "Sub",
      },
      {
        key: "teuCapacity", label: `TEU Capacity`, dataType: `NUMERIC(5,2)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Equipment Type = Container; must be > 0`, editValidation: `Allowed; required if Equipment Type = Container; must be > 0`, sample: `2.00`, level: "Sub",
      },
      {
        key: "volumeCapacityCBM", label: `Volume Capacity (CBM)`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be >= 0; used for cargo capacity planning`, editValidation: `Optional; must be >= 0`, sample: `67.70`, level: "Sub",
      },
      {
        key: "containerTypeUnitType", label: `Container Type (Unit Type)`, dataType: `VARCHAR(10)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Equipment Type = Container; allowed: FCL, LCL, Hazmat, Reefer`, editValidation: `Allowed; required if Equipment Type = Container; must match allowed values`, sample: `FCL`, level: "Sub",
      },
      {
        key: "isHazardousApproved", label: `Is Hazardous Approved`, dataType: `BOOLEAN`, required: `No`, primaryKey: false,
        addValidation: `Optional; default FALSE; if TRUE, IMDG Certification becomes required`, editValidation: `Allowed; if set TRUE, IMDG Certification must be provided`, sample: `TRUE`, level: "Sub",
      },
      {
        key: "notes", label: `Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: ``, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
    ],
  },
  location: {
    id: "location",
    entityName: "Location",
    pageTitle: "Location Master Data",
    description: "Manage location master records with main fields in the list and sub fields in expandable details.",
    stateKey: "locations",
    idPrefix: "LOC",
    fields: [
      {
        key: "locationID", label: `Location ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `30001`, level: "Main",
      },
      {
        key: "locationName", label: `Location Name`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters`, editValidation: `Required; max 100 characters`, sample: `Shanghai Port`, level: "Main",
      },
      {
        key: "locationCode", label: `Location Code`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 20 characters; uppercase`, editValidation: `Immutable (business key); if changed, must remain unique and update references`, sample: `CNSHA`, level: "Main",
      },
      {
        key: "locationType", label: `Location Type`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Port, Airport, Rail Terminal, Road Terminal, Warehouse, Distribution Center, City, Country, Region, Multimodal Facility, Fixed Transport Installation`, editValidation: `Allowed; must be from allowed values; changing may affect related code validations`, sample: `Port`, level: "Main",
      },
      {
        key: "unLOCODE", label: `UN/LOCODE`, dataType: `CHAR(5)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for all trade locations; 5-character format (2-letter country + 3-letter location); must be unique`, editValidation: `Allowed; must remain 5-character format and unique if provided`, sample: `CNSHA`, level: "Main",
      },
      {
        key: "iataCode", label: `IATA Code`, dataType: `CHAR(3)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Location Type = Airport; must be exactly 3 uppercase characters`, editValidation: `Allowed; must remain exactly 3 uppercase characters if provided`, sample: `SHA`, level: "Sub",
      },
      {
        key: "icaoCode", label: `ICAO Code`, dataType: `CHAR(4)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Location Type = Airport; must be exactly 4 uppercase characters`, editValidation: `Allowed; must remain exactly 4 uppercase characters if provided`, sample: `N/A (Airport example: EGLL)`, level: "Sub",
      },
      {
        key: "faaCode", label: `FAA Code`, dataType: `CHAR(4)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for US airports; must be exactly 4 uppercase characters`, editValidation: `Allowed; must remain exactly 4 uppercase characters if provided`, sample: `N/A (US airport example: JFK)`, level: "Sub",
      },
      {
        key: "parentLocationID", label: `Parent Location ID`, dataType: `BIGINT`, required: `No`, primaryKey: false,
        addValidation: `Optional; must reference an existing Location record; must not create circular reference`, editValidation: `Allowed; must reference existing Location and not create circular reference`, sample: ``, level: "Sub",
      },
      {
        key: "functionCode", label: `Function Code`, dataType: `CHAR(1)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: 1 (Port), 2 (Rail), 3 (Road), 4 (Airport), 5 (Postal), 6 (Multimodal), 7 (Fixed Transport), 8 (Inland Water)`, editValidation: `Allowed; must match allowed values`, sample: `1 (Port)`, level: "Main",
      },
      {
        key: "status", label: `Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Active, Inactive, Under Review`, editValidation: `State-machine controlled; validate allowed transitions`, sample: `Active`, level: "Main",
      },
      {
        key: "unLOCODEStatus", label: `UN/LOCODE Status`, dataType: `CHAR(2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: AA, AC, AI, RL`, editValidation: `Optional; allowed: AA, AC, AI, RL`, sample: `AA`, level: "Sub",
      },
      {
        key: "country", label: `Country`, dataType: `CHAR(2)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must exist in Country Config`, editValidation: `Allowed; must exist in Country Config`, sample: `CN`, level: "Main",
      },
      {
        key: "countryName", label: `Country Name`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 50 characters`, editValidation: `Optional; max 50 characters`, sample: `China`, level: "Sub",
      },
      {
        key: "subdivisionStateProvince", label: `Subdivision (State/Province)`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 30 characters`, editValidation: `Optional; max 30 characters`, sample: ``, level: "Sub",
      },
      {
        key: "city", label: `City`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 50 characters`, editValidation: `Optional; max 50 characters`, sample: `Shanghai`, level: "Main",
      },
      {
        key: "region", label: `Region`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must exist in Region Config if provided`, editValidation: `Optional; must exist in Region Config if provided`, sample: `Asia`, level: "Main",
      },
      {
        key: "timeZone", label: `Time Zone`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid timezone format (e.g., Asia/Shanghai)`, editValidation: `Optional; valid timezone format`, sample: `Asia/Shanghai`, level: "Sub",
      },
      {
        key: "latitude", label: `Latitude`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; format DDMMSS N/S or decimal degrees`, editValidation: `Optional; validate coordinate format`, sample: `3114N`, level: "Sub",
      },
      {
        key: "longitude", label: `Longitude`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; format DDDMMSS E/W or decimal degrees`, editValidation: `Optional; validate coordinate format`, sample: `12128E`, level: "Sub",
      },
      {
        key: "coordinateSystem", label: `Coordinate System`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: GEO, GK, UTM`, editValidation: `Optional; allowed: GEO, GK, UTM`, sample: `GEO`, level: "Sub",
      },
      {
        key: "addressLine12", label: `Address Line 1 / 2`, dataType: `VARCHAR(255)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 255 characters`, editValidation: `Optional; max 255 characters`, sample: `Yangshan Deep Water Port`, level: "Sub",
      },
      {
        key: "postalCode", label: `Postal Code`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 20 characters`, editValidation: `Optional; max 20 characters`, sample: ``, level: "Sub",
      },
      {
        key: "poBox", label: `PO Box`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 10 characters`, editValidation: `Optional; max 10 characters`, sample: ``, level: "Sub",
      },
      {
        key: "contactPerson", label: `Contact Person`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters`, editValidation: `Optional; max 100 characters`, sample: ``, level: "Sub",
      },
      {
        key: "contactEmail", label: `Contact Email`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid email format`, editValidation: `Optional; valid email format`, sample: ``, level: "Sub",
      },
      {
        key: "contactPhone", label: `Contact Phone`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid phone format`, editValidation: `Optional; valid phone format`, sample: ``, level: "Sub",
      },
      {
        key: "terminalName", label: `Terminal Name`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters; used for airports and ports`, editValidation: `Optional; max 100 characters`, sample: ``, level: "Sub",
      },
      {
        key: "terminalCode", label: `Terminal Code`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 10 characters`, editValidation: `Optional; max 10 characters`, sample: ``, level: "Sub",
      },
      {
        key: "subLocation", label: `Sub-Location`, dataType: `VARCHAR(100)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 100 characters`, editValidation: `Optional; max 100 characters`, sample: ``, level: "Sub",
      },
      {
        key: "locationCategory", label: `Location Category`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: PL, CU, SU, NO, SP`, editValidation: `Optional; allowed: PL, CU, SU, NO, SP`, sample: ``, level: "Sub",
      },
      {
        key: "locationUsage", label: `Location Usage`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: Storage, Production, Distribution, Transport Hub, Administrative`, editValidation: `Optional; allowed: Storage, Production, Distribution, Transport Hub, Administrative`, sample: `Transport Hub`, level: "Sub",
      },
      {
        key: "isActive", label: `Is Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete`, sample: `TRUE`, level: "Main",
      },
      {
        key: "notes", label: `Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: `Major container port in China`, level: "Sub",
      },
      {
        key: "internalNotes", label: `Internal Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: ``, level: "Sub",
      },
      {
        key: "externalSystemID", label: `External System ID`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., SAP location ID`, editValidation: `Optional; must remain unique if used as integration key`, sample: ``, level: "Sub",
      },
      {
        key: "alternativeIDs", label: `Alternative IDs`, dataType: `JSONB`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid JSON format`, editValidation: `Optional; valid JSON format`, sample: `{}`, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
    ],
  },
  sku: {
    id: "sku",
    entityName: "SKU",
    pageTitle: "SKU Master Data",
    description: "Manage sku master records with main fields in the list and sub fields in expandable details.",
    stateKey: "products",
    idPrefix: "SKU",
    fields: [
      {
        key: "skuID", label: `SKU ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `40001`, level: "Main",
      },
      {
        key: "skuCode", label: `SKU Code`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 50 characters; alphanumeric`, editValidation: `Immutable (business key); if changed, must remain unique and update references`, sample: `LIDL-TSHIRT-XL-RED`, level: "Main",
      },
      {
        key: "skuDescription", label: `SKU Description`, dataType: `VARCHAR(255)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 255 characters`, editValidation: `Required; max 255 characters`, sample: `Organic Cotton T-Shirt, Red, XL`, level: "Main",
      },
      {
        key: "productGroup", label: `Product Group`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., Electronics, Apparel, Machinery, Food`, editValidation: `Optional; must match defined product group list`, sample: `Apparel`, level: "Main",
      },
      {
        key: "productCategory", label: `Product Category`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., Laptops, T-Shirts, Paint`, editValidation: `Optional; must match defined product category list`, sample: `T-Shirts`, level: "Sub",
      },
      {
        key: "productType", label: `Product Type`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: Physical, Service, Kit, Component, Consumable`, editValidation: `Optional; allowed: Physical, Service, Kit, Component, Consumable`, sample: `Physical`, level: "Sub",
      },
      {
        key: "brandName", label: `Brand Name`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 50 characters`, editValidation: `Optional; max 50 characters`, sample: `MOOV Standard`, level: "Sub",
      },
      {
        key: "manufacturerSupplier", label: `Manufacturer / Supplier`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must exist in Business Partner Master if provided`, editValidation: `Optional; must exist in Business Partner Master if provided`, sample: `Vietnam Textile Factory Co., Ltd.`, level: "Sub",
      },
      {
        key: "productStatus", label: `Product Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Active, Inactive, Discontinued, Obsolete, Under Review`, editValidation: `State-machine controlled; validate allowed transitions`, sample: `Active`, level: "Main",
      },
      {
        key: "productClassClassID", label: `Product Class / Class ID`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; reference to Class Master`, editValidation: `Optional; reference to Class Master`, sample: ``, level: "Sub",
      },
      {
        key: "productStructureID", label: `Product Structure ID`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; reference to Structure Master`, editValidation: `Optional; reference to Structure Master`, sample: ``, level: "Sub",
      },
      {
        key: "baseUnitOfMeasure", label: `Base Unit of Measure`, dataType: `VARCHAR(10)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; e.g., EA, KG, M, BOX, CASE; must exist in UOM master`, editValidation: `Allowed; must exist in UOM master; warn if open inventory uses old UOM`, sample: `EA`, level: "Main",
      },
      {
        key: "uomConversions", label: `UOM Conversions`, dataType: `JSONB`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid JSON format; must include valid conversion factors`, editValidation: `Optional; valid JSON format`, sample: `{"CASE": {"to_base": 12, "description": "1 CASE = 12 EA"}}`, level: "Sub",
      },
      {
        key: "lengthCm", label: `Length (cm)`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; in cm; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `20.00`, level: "Sub",
      },
      {
        key: "widthCm", label: `Width (cm)`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; in cm; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `15.00`, level: "Sub",
      },
      {
        key: "heightCm", label: `Height (cm)`, dataType: `NUMERIC(10,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; in cm; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `5.00`, level: "Sub",
      },
      {
        key: "grossWeightKg", label: `Gross Weight (kg)`, dataType: `NUMERIC(10,3)`, required: `No`, primaryKey: false,
        addValidation: `Optional; in kg; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `0.250`, level: "Main",
      },
      {
        key: "netWeightKg", label: `Net Weight (kg)`, dataType: `NUMERIC(10,3)`, required: `No`, primaryKey: false,
        addValidation: `Optional; in kg; must be ≤ Gross Weight`, editValidation: `Optional; must be ≤ Gross Weight`, sample: `0.220`, level: "Sub",
      },
      {
        key: "volumeCBM", label: `Volume (CBM)`, dataType: `NUMERIC(10,4)`, required: `No`, primaryKey: false,
        addValidation: `Optional; calculated as L × W × H / 1,000,000; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `0.0015`, level: "Main",
      },
      {
        key: "isStackable", label: `Is Stackable`, dataType: `BOOLEAN`, required: `No`, primaryKey: false,
        addValidation: `Optional; default FALSE`, editValidation: `Optional`, sample: `TRUE`, level: "Sub",
      },
      {
        key: "minimumPackagingType", label: `Minimum Packaging Type`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., POLY_BAG, CARTON, PALLET, DRUM, BULK`, editValidation: `Optional; must match packaging type master`, sample: `CARTON`, level: "Sub",
      },
      {
        key: "packagingMaterial", label: `Packaging Material`, dataType: `VARCHAR(30)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., Plastic, Cardboard, Wood, Metal`, editValidation: `Optional; must match packaging material master`, sample: `Cardboard`, level: "Sub",
      },
      {
        key: "costingMethod", label: `Costing Method`, dataType: `VARCHAR(20)`, required: `No`, primaryKey: false,
        addValidation: `Optional; allowed: Moving Average, Standard, FIFO, LIFO, Actual`, editValidation: `Optional; allowed: Moving Average, Standard, FIFO, LIFO, Actual`, sample: `Moving Average`, level: "Sub",
      },
      {
        key: "standardCostUnitCost", label: `Standard Cost / Unit Cost`, dataType: `NUMERIC(18,4)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `8.5000`, level: "Sub",
      },
      {
        key: "basePriceListPrice", label: `Base Price (List Price)`, dataType: `NUMERIC(18,4)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `19.9900`, level: "Sub",
      },
      {
        key: "currency", label: `Currency`, dataType: `CHAR(3)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must exist in Currency Master if cost/price provided`, editValidation: `Optional; must exist in Currency Master`, sample: `EUR`, level: "Sub",
      },
      {
        key: "landedCostFactors", label: `Landed Cost Factors`, dataType: `JSONB`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid JSON format`, editValidation: `Optional; valid JSON format`, sample: `{"freight_%": 5.0, "duty_%": 2.5}`, level: "Sub",
      },
      {
        key: "commodityCodeHSCode", label: `Commodity Code (HS Code)`, dataType: `VARCHAR(20)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for international shipments; valid HS code format`, editValidation: `Allowed; validate HS code format`, sample: `6205.20.0000`, level: "Main",
      },
      {
        key: "countryOfOrigin", label: `Country of Origin`, dataType: `CHAR(2)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for customs; must exist in Country/Location Master`, editValidation: `Allowed; must exist in Country/Location Master`, sample: `VN`, level: "Main",
      },
      {
        key: "hazardousMaterialFlag", label: `Hazardous Material Flag`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default FALSE`, editValidation: `Allowed; if set TRUE, UN Number, DG Class, Packaging Group become required`, sample: `FALSE`, level: "Main",
      },
      {
        key: "unNumber", label: `UN Number`, dataType: `VARCHAR(10)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Hazardous Flag = TRUE; e.g., UN1263`, editValidation: `Allowed; required if Hazardous Flag = TRUE`, sample: `N/A (Paint example: UN1263)`, level: "Sub",
      },
      {
        key: "dangerousGoodsClass", label: `Dangerous Goods Class`, dataType: `VARCHAR(10)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Hazardous Flag = TRUE; e.g., 3, 4.2, 8`, editValidation: `Allowed; required if Hazardous Flag = TRUE`, sample: `N/A (Paint example: 3)`, level: "Sub",
      },
      {
        key: "packagingGroup", label: `Packaging Group`, dataType: `CHAR(1)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if Hazardous Flag = TRUE; allowed: I, II, III`, editValidation: `Allowed; required if Hazardous Flag = TRUE`, sample: `N/A (Paint example: III)`, level: "Sub",
      },
      {
        key: "temperatureRequirement", label: `Temperature Requirement`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; e.g., -18°C to -25°C`, editValidation: `Optional`, sample: ``, level: "Sub",
      },
      {
        key: "fefoLotTrackingEnabled", label: `FEFO / Lot Tracking Enabled`, dataType: `BOOLEAN`, required: `No`, primaryKey: false,
        addValidation: `Optional; default FALSE; if TRUE, Shelf Life becomes required`, editValidation: `Allowed; if set TRUE, Shelf Life must be provided`, sample: `FALSE`, level: "Sub",
      },
      {
        key: "shelfLifeDays", label: `Shelf Life (Days)`, dataType: `INTEGER`, required: `Conditional`, primaryKey: false,
        addValidation: `Required if FEFO/Lot Tracking = TRUE; must be > 0`, editValidation: `Allowed; required if FEFO/Lot Tracking = TRUE`, sample: ``, level: "Sub",
      },
      {
        key: "serialNumberProfile", label: `Serial Number Profile`, dataType: `VARCHAR(10)`, required: `No`, primaryKey: false,
        addValidation: `Optional; reference to Serial Master`, editValidation: `Optional; reference to Serial Master`, sample: ``, level: "Sub",
      },
      {
        key: "alternativeIDs", label: `Alternative IDs`, dataType: `JSONB`, required: `No`, primaryKey: false,
        addValidation: `Optional; valid JSON format`, editValidation: `Optional; valid JSON format`, sample: `{"LIDL_SPN": "XYZ-001", "EAN": "0765432101234"}`, level: "Sub",
      },
      {
        key: "externalReference", label: `External Reference`, dataType: `VARCHAR(255)`, required: `No`, primaryKey: false,
        addValidation: `Optional; max 255 characters`, editValidation: `Optional; max 255 characters`, sample: ``, level: "Sub",
      },
      {
        key: "notes", label: `Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: ``, level: "Sub",
      },
      {
        key: "internalNotes", label: `Internal Notes`, dataType: `TEXT`, required: `No`, primaryKey: false,
        addValidation: `Optional; free text`, editValidation: `Optional; free text`, sample: ``, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete`, sample: `TRUE`, level: "Main",
      },
    ],
  },
  vessel: {
    id: "vessel",
    entityName: "Vessel",
    pageTitle: "Vessel Master Data",
    description: "Manage vessel master records with main fields in the list and sub fields in expandable details.",
    stateKey: "vessels",
    idPrefix: "VES",
    fields: [
      {
        key: "vesselID", label: `Vessel ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `60001`, level: "Main",
      },
      {
        key: "vesselName", label: `Vessel Name`, dataType: `VARCHAR(100)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; max 100 characters`, editValidation: `Required; max 100 characters`, sample: `Emma Maersk`, level: "Main",
      },
      {
        key: "vesselCode", label: `Vessel Code`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique; max 20 characters; uppercase`, editValidation: `Immutable (business key); if changed, must remain unique and update references`, sample: `EMMA-MSK`, level: "Main",
      },
      {
        key: "vesselType", label: `Vessel Type`, dataType: `VARCHAR(30)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Container Ship, Bulk Carrier, Ro-Ro, Tanker, Feeder, Other`, editValidation: `Allowed; must be from allowed values; changing may affect spec validations`, sample: `Container Ship`, level: "Main",
      },
      {
        key: "imoNumber", label: `IMO Number`, dataType: `VARCHAR(10)`, required: `Conditional`, primaryKey: false,
        addValidation: `Required for ocean-going vessels; exactly 7 digits; must be unique`, editValidation: `Allowed; must remain exactly 7 digits and unique if provided`, sample: `9321483`, level: "Main",
      },
      {
        key: "flagState", label: `Flag State`, dataType: `VARCHAR(50)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must exist in Location Master (Country type)`, editValidation: `Optional; must exist in Location Master (Country type)`, sample: `DK (Denmark)`, level: "Sub",
      },
      {
        key: "ownerOperator", label: `Owner / Operator`, dataType: `BIGINT`, required: `No`, primaryKey: false,
        addValidation: `Optional; must reference an existing Business Partner record`, editValidation: `Optional; must reference an existing Business Partner record`, sample: `10002 (Maersk Line)`, level: "Sub",
      },
      {
        key: "vesselStatus", label: `Vessel Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Active, Idle, Under Maintenance, Retired, Scrapped`, editValidation: `State-machine controlled; validate allowed transitions`, sample: `Active`, level: "Main",
      },
      {
        key: "active", label: `Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE performs soft-delete; warn if linked to open voyages`, sample: `TRUE`, level: "Main",
      },
      {
        key: "teuCapacity", label: `TEU Capacity`, dataType: `INTEGER`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `15500`, level: "Sub",
      },
      {
        key: "lengthOverallLOA", label: `Length Overall (LOA)`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `397.70`, level: "Sub",
      },
      {
        key: "beam", label: `Beam`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `56.40`, level: "Sub",
      },
      {
        key: "draft", label: `Draft`, dataType: `NUMERIC(8,2)`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ 0`, editValidation: `Optional; must be ≥ 0`, sample: `16.00`, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
    ],
  },
  voyage: {
    id: "voyage",
    entityName: "Voyage",
    pageTitle: "Voyage Master Data",
    description: "Manage voyage master records with main fields in the list and sub fields in expandable details.",
    stateKey: "voyages",
    idPrefix: "VOY",
    fields: [
      {
        key: "voyageID", label: `Voyage ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: true,
        addValidation: `System-generated; must be unique`, editValidation: `Immutable`, sample: `70001`, level: "Main",
      },
      {
        key: "voyageNumber", label: `Voyage Number`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; unique per carrier; max 50 characters`, editValidation: `Allowed; must remain unique per carrier; update references if changed`, sample: `7W25`, level: "Main",
      },
      {
        key: "vesselID", label: `Vessel ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must reference an existing Vessel record`, editValidation: `Allowed; must reference an existing Vessel record; warn if vessel status conflicts`, sample: `60001 (Emma Maersk)`, level: "Main",
      },
      {
        key: "carrierID", label: `Carrier ID`, dataType: `BIGINT`, required: `Yes`, primaryKey: false,
        addValidation: `Required; must reference a valid Carrier ID`, editValidation: `Allowed; must reference a valid Carrier ID`, sample: `10002 (Maersk Line)`, level: "Main",
      },
      {
        key: "serviceID", label: `Service ID`, dataType: `BIGINT`, required: `No`, primaryKey: false,
        addValidation: `Optional; must reference an existing Service record`, editValidation: `Optional; must reference an existing Service record`, sample: `80001 (AE7 Service)`, level: "Sub",
      },
      {
        key: "voyageType", label: `Voyage Type`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Eastbound, Westbound, Northbound, Southbound, Regional, Feeder, Round Trip`, editValidation: `Allowed; must match allowed values`, sample: `Westbound`, level: "Main",
      },
      {
        key: "voyageStatus", label: `Voyage Status`, dataType: `VARCHAR(20)`, required: `Yes`, primaryKey: false,
        addValidation: `Required; allowed: Planned, Open, Confirmed, In Transit, Completed, Cancelled, Delayed`, editValidation: `State-machine controlled; validate allowed transitions (e.g., cannot reopen Completed)`, sample: `Confirmed`, level: "Main",
      },
      {
        key: "isActive", label: `Is Active`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE`, editValidation: `Allowed; setting FALSE prevents new bookings`, sample: `TRUE`, level: "Main",
      },
      {
        key: "isCurrent", label: `Is Current`, dataType: `BOOLEAN`, required: `Yes`, primaryKey: false,
        addValidation: `Required; default TRUE; only one version should be current per Voyage Number + Carrier`, editValidation: `Allowed; if set TRUE, clear Is Current on the previous version`, sample: `TRUE`, level: "Main",
      },
      {
        key: "effectiveFrom", label: `Effective From`, dataType: `DATE`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≤ Effective To if both provided`, editValidation: `Optional; must remain ≤ Effective To`, sample: `2026-07-01`, level: "Sub",
      },
      {
        key: "effectiveTo", label: `Effective To`, dataType: `DATE`, required: `No`, primaryKey: false,
        addValidation: `Optional; must be ≥ Effective From; NULL if currently active`, editValidation: `Optional; must be ≥ Effective From`, sample: `NULL`, level: "Sub",
      },
      {
        key: "publishedDate", label: `Published Date`, dataType: `DATE`, required: `No`, primaryKey: false,
        addValidation: `Optional; should be ≤ Effective From`, editValidation: `Optional; should remain ≤ Effective From`, sample: ``, level: "Sub",
      },
      {
        key: "createdAt", label: `Created At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "createdBy", label: `Created By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Immutable`, sample: `admin`, level: "Sub",
      },
      {
        key: "updatedAt", label: `Updated At`, dataType: `TIMESTAMP`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `2026-07-01 10:00:00`, level: "Sub",
      },
      {
        key: "updatedBy", label: `Updated By`, dataType: `VARCHAR(50)`, required: `Yes`, primaryKey: false,
        addValidation: `Auto-generated by system`, editValidation: `Auto-updated by system on each edit`, sample: `admin`, level: "Sub",
      },
    ],
  },
} as const satisfies Record<string, MasterEntitySchema>;

export type MasterSchemaKey = keyof typeof masterDataSchemas;
