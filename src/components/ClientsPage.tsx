import type { EffectiveDataScope, PageAccess } from "@/types";
import { filterClientsByScope } from "@/lib/accessControl";
import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

type ClientsPageProps = {
  dataScope?: EffectiveDataScope;
  access?: PageAccess;
};

export default function ClientsPage({ dataScope, access }: ClientsPageProps) {
  return (
    <MasterDataEntityPage
      schema={masterDataSchemas.client}
      access={access}
      preFilter={dataScope ? (rows) => filterClientsByScope(rows as any, dataScope) as any : undefined}
    />
  );
}
