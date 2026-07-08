import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

export default function CarriersPage() {
  return <MasterDataEntityPage schema={masterDataSchemas.carrier} />;
}
