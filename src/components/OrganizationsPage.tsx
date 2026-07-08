import type { EffectiveDataScope, PageAccess } from "@/types";
import { filterOrganizationsByScope } from "@/lib/accessControl";
import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

type OrganizationsPageProps = {
  dataScope?: EffectiveDataScope;
  access?: PageAccess;
};

export default function OrganizationsPage({ dataScope, access }: OrganizationsPageProps) {
  return (
    <MasterDataEntityPage
      schema={masterDataSchemas.businessPartner}
      access={access}
      preFilter={dataScope ? (rows) => filterOrganizationsByScope(rows as any, dataScope) as any : undefined}
    />
  );
}
