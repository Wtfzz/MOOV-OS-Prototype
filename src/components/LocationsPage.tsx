import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

export default function LocationsPage() {
  return <MasterDataEntityPage schema={masterDataSchemas.location} />;
}
