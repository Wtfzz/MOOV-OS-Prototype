import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

export default function EquipmentPage() {
  return <MasterDataEntityPage schema={masterDataSchemas.equipment} />;
}
