"use client";

import { useEffect, useState, useRef } from "react";
import {
  Package,
  Plus,
  Trash2,
  Edit3,
  X,
  Search,
  Upload,
  ToggleLeft,
  ToggleRight,
  Save,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";

interface Product {
  id: string;
  business_id: string;
  sku: string | null;
  name: string;
  price: number | null;
  stock: number;
  description: string | null;
  category: string | null;
  images: string[];
  metadata: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductForm {
  sku: string;
  name: string;
  price: string;
  stock: string;
  description: string;
  category: string;
  is_active: boolean;
}

const emptyForm: ProductForm = {
  sku: "",
  name: "",
  price: "",
  stock: "0",
  description: "",
  category: "",
  is_active: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function downloadTemplateCSV() {
  const headers = ["name", "sku", "price", "stock", "description", "category"];
  const example = ["Velvet Pillow 45x45cm", "HOR122", "1500", "20", "Soft velvet pillow in cream color", "Pillows"];
  const csv = [headers.join(","), example.join(",")].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "convyr_products_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCsvGuide, setShowCsvGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    message: string;
    imported: number;
    skipped: number;
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts({
        search,
        category: selectedCategory,
        page,
        page_size: pageSize,
      });
      setProducts(res.products || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.getProductCategories();
      setCategories(res.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const lastSearch = useRef(search);
  const lastCategory = useRef(selectedCategory);

  useEffect(() => {
    const isFilterChange = search !== lastSearch.current || selectedCategory !== lastCategory.current;

    if (isFilterChange) {
      lastSearch.current = search;
      lastCategory.current = selectedCategory;
      setPage(1);
      return; // exit — the page state change will re-trigger this effect
    }

    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [page, pageSize, search, selectedCategory]);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        sku: form.sku.trim() || undefined,
        name: form.name.trim(),
        price: form.price ? parseFloat(form.price) : undefined,
        stock: parseInt(form.stock) || 0,
        description: form.description.trim() || undefined,
        category: form.category.trim() || undefined,
        is_active: form.is_active,
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      resetForm();
      await fetchProducts();
      await fetchCategories();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setForm({
      sku: product.sku || "",
      name: product.name,
      price: product.price != null ? String(product.price) : "",
      stock: String(product.stock ?? 0),
      description: product.description || "",
      category: product.category || "",
      is_active: product.is_active,
    });
    setEditingId(product.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggle = async (product: Product) => {
    try {
      await api.updateProduct(product.id, { is_active: !product.is_active });
      await fetchProducts();
    } catch (err) {
      console.error("Failed to toggle product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    try {
      await api.deleteProduct(id);
      await fetchProducts();
      await fetchCategories();
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const result = await api.uploadProductsCSV(file);
      setUploadResult(result);
      setPage(1);
      await fetchProducts();
      await fetchCategories();
    } catch (err: any) {
      setUploadResult({ message: err.message || "Upload failed.", imported: 0, skipped: 0 });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const formatPrice = (price: number | null) => {
    if (price == null) return "—";
    return `KES ${price.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
  };

  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1, 2];
    if (page > 4) pages.push("...");
    for (let p = Math.max(3, page - 1); p <= Math.min(totalPages - 2, page + 1); p++) pages.push(p);
    if (page < totalPages - 3) pages.push("...");
    pages.push(totalPages - 1, totalPages);
    return [...new Set(pages)] as (number | "...")[];
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A]">Products</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your product catalog. The AI agent uses this to answer customer inquiries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          <button
            onClick={() => setShowCsvGuide((v) => !v)}
            className="flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Info size={15} />
            <span className="hidden sm:inline">CSV Guide</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">{uploading ? "Uploading..." : "Import CSV"}</span>
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* CSV Guide */}
      {showCsvGuide && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
              <h3 className="text-sm font-bold text-blue-800">CSV / Excel Import Guide</h3>
            </div>
            <button onClick={() => setShowCsvGuide(false)} className="text-blue-400 hover:text-blue-600">
              <X size={16} />
            </button>
          </div>
          <div className="text-xs text-blue-700 flex flex-col gap-1.5 ml-6">
            <p>
              <span className="font-bold">Recognized columns:</span>{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">name</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">sku</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">price</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">stock</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">description</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">category</code>
            </p>
            <p>
              <span className="font-bold">Also recognized:</span>{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Product Name</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Product Code</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Cost Per Item</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">Quantity</code>,{" "}
              <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">SubCategory</code>
            </p>
            <p className="text-blue-600 mt-1">
              Any extra columns are preserved in metadata and accessible to the AI agent.
            </p>
          </div>
          <button
            onClick={downloadTemplateCSV}
            className="ml-6 self-start flex items-center gap-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download size={13} />
            Download Template CSV
          </button>
        </div>
      )}

      {/* Upload Result Banner */}
      {uploadResult && (
        <div className={`rounded-xl px-4 py-3 flex items-center justify-between text-sm ${
          uploadResult.imported > 0
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          <span>{uploadResult.message}</span>
          <button onClick={() => setUploadResult(null)}><X size={16} /></button>
        </div>
      )}

      {/* Product Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#25D366]/20 shadow-sm p-4 sm:p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[#0F172A]">
              {editingId ? "Edit Product" : "Add New Product"}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Velvet Pillow 45x45cm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">SKU / Product Code</label>
              <input
                type="text"
                placeholder="e.g. HOR122"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Category</label>
              <input
                type="text"
                placeholder="e.g. Pillows, Sofas, Curtains"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Price (KES)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 1500"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Stock</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
              <textarea
                placeholder="Describe the product — material, size, color, use case..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all resize-none"
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, is_active: !form.is_active })}
                className="transition-transform active:scale-95"
              >
                {form.is_active
                  ? <ToggleRight size={32} className="text-[#25D366]" />
                  : <ToggleLeft size={32} className="text-gray-300" />}
              </button>
              <span className="text-sm text-gray-500">
                {form.is_active ? "Product is active (visible to AI agent)" : "Product is inactive (hidden from AI agent)"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] disabled:opacity-60 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-[#25D366]/20 transition-all"
            >
              <Save size={15} />
              {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
            </button>
            <button onClick={resetForm} className="flex-1 sm:flex-none px-6 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all bg-white"
          />
        </div>
        {categories.length > 0 && (
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#25D366] focus:ring-4 focus:ring-[#25D366]/5 transition-all bg-white text-gray-600"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-[#25D366]" />
            <span className="text-sm font-bold text-[#0F172A] uppercase tracking-wide">
              {loading ? "Loading..." : `${total} Products`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              The AI agent can access all active products
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400">Show</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-[#25D366] bg-white text-gray-600"
              >
                {PAGE_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-[#25D366] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-sm text-gray-400">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="px-6 py-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package size={24} className="text-gray-300" />
            </div>
            <p className="text-base font-medium text-gray-600">No products yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Add products manually or import a CSV file. The AI agent will use these to answer customer questions.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button onClick={() => setShowForm(true)} className="text-[#25D366] font-bold text-sm hover:underline">
                + Add manually
              </button>
              <span className="text-gray-300">or</span>
              <button onClick={() => fileInputRef.current?.click()} className="text-[#25D366] font-bold text-sm hover:underline">
                Import CSV
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">SKU</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-gray-400">Category</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Price</th>
                    <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr key={product.id} className="group hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-[#0F172A]">{product.name}</p>
                          {product.description && (
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{product.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {product.sku
                          ? <span className="font-mono text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{product.sku}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        {product.category
                          ? <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">{product.category}</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-[#0F172A]">{formatPrice(product.price)}</td>
                      <td className="px-4 py-4 text-right text-gray-500">{product.stock}</td>
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => handleToggle(product)} className="transition-transform active:scale-95">
                          {product.is_active
                            ? <ToggleRight size={28} className="text-[#25D366] mx-auto" />
                            : <ToggleLeft size={28} className="text-gray-300 mx-auto" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all" title="Edit">
                            <Edit3 size={15} />
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {products.map((product) => (
                <div key={product.id} className="px-4 py-4 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-bold text-[#0F172A]">{product.name}</p>
                      {product.sku && (
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{product.sku}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-wrap mt-0.5">
                      <span className="font-semibold text-[#0F172A]">{formatPrice(product.price)}</span>
                      <span>•</span>
                      <span>Stock: {product.stock}</span>
                      {product.category && (
                        <>
                          <span>•</span>
                          <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{product.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
                      <button onClick={() => handleEdit(product)} className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-all">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <button onClick={() => handleToggle(product)}>
                      {product.is_active
                        ? <ToggleRight size={26} className="text-[#25D366]" />
                        : <ToggleLeft size={26} className="text-gray-300" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
          </>
        )}
      </div>

      <div className="flex items-center justify-between w-full mt-4 px-4 py-3 border-t border-gray-200">
        <span className="text-xs text-gray-400">
          {total === 0 ? "No results" : `Showing ${startRecord}–${endRecord} of ${total}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map((p, i) =>
            p === "..." ? (
              <span key={`ellipsis-${i}`} className="px-1 text-gray-300 text-xs">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p as number)}
                className={`min-w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                  page === p ? "bg-[#25D366] text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}