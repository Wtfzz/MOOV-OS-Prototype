import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

export default function ProductsPage() {
  return <MasterDataEntityPage schema={masterDataSchemas.sku} />;
}
