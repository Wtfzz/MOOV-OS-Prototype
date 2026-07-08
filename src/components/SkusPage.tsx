import { useState } from "react";
import { Search, Plus, Download, Upload, Pencil, Trash2, MessageSquare } from "lucide-react";
import { loadState } from "@/lib/store";
import type { Product } from "@/types";
import { t, getCurrentLanguage } from "@/lib/i18n";

export default function SkusPage() {
  const [state] = useState(() => loadState());
  const [searchName, setSearchName] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const lang = getCurrentLanguage();

  // Use products data instead of old skus
  const products: Product[] = state.products || [];

  const filteredProducts = products.filter((product) => {
    const matchesName = !searchName || product.productDescription.toLowerCase().includes(searchName.toLowerCase());
    const matchesCode = !searchCode || product.productCode.toLowerCase().includes(searchCode.toLowerCase());
    return matchesName && matchesCode;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{t(lang, 'skuMaster')}</h2>
          <p className="text-sm text-muted-foreground">SKU/Product Management (Legacy View)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Product Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <input
          type="text"
          placeholder="Product Code"
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <button className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-brand px-2.5 text-xs font-medium text-white transition-colors hover:bg-brand-strong">
          <Search size={14} />
          Search
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Plus size={14} />
            Add
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-yellow-400 px-2.5 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-50">
            <Download size={14} />
            Export
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input px-2.5 text-xs font-medium transition-colors hover:bg-muted">
            <Upload size={14} />
            Import
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-muted">
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Product Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Product Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Commodity Code</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Hazardous</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Weight (kg)</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Dimensions</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No data
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-t border-border">
                  <td className="px-4 py-3 text-sm">{product.productDescription}</td>
                  <td className="px-4 py-3 text-sm">{product.productCode}</td>
                  <td className="px-4 py-3 text-sm">{product.commodityCode || "-"}</td>
                  <td className="px-4 py-3 text-sm">
                    {product.hazardousMaterialFlag ? (
                      <span className="inline-block px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Yes</span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">{product.defaultWeight || "-"}</td>
                  <td className="px-4 py-3 text-sm">{product.width && product.height && product.length ? `${product.width}x${product.height}x${product.length}` : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button className="text-brand hover:text-brand-strong text-sm flex items-center gap-1">
                        <Pencil size={14} />
                        Modify
                      </button>
                      <button className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1">
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total {filteredProducts.length}</span>
        <div className="flex items-center gap-2">
          <span>10/page</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-border rounded hover:bg-muted">&lt;</button>
            <button className="px-2 py-1 bg-brand text-white rounded">1</button>
            <button className="px-2 py-1 border border-border rounded hover:bg-muted">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  );
}
