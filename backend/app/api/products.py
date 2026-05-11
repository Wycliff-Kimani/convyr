from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
from supabase import create_client
from app.config import settings
from app.services.auth import decode_access_token
import logging
import pandas as pd
import io

logger = logging.getLogger(__name__)
router = APIRouter()
security = HTTPBearer()

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

# Column name aliases — maps various real-world CSV headers to our internal fields
COLUMN_ALIASES = {
    "name":             ["name", "product_name", "product name", "item_name", "item name", "title"],
    "sku":              ["sku", "product_code", "product code", "code", "item_code", "item code", "barcode"],
    "price":            ["price", "cost_per_item", "cost per item", "unit_price", "unit price", "selling_price", "selling price", "amount"],
    "stock":            ["stock", "quantity", "qty", "stock_quantity", "available", "units"],
    "description":      ["description", "subcategory", "sub_category", "sub category", "details", "notes"],
    "category":         ["category", "product_category", "product category", "type", "department"],
}

KNOWN_FIELDS = {"name", "sku", "price", "stock", "description", "category"}


def resolve_columns(df_columns: list[str]) -> dict:
    """Map DataFrame columns to internal field names using aliases."""
    col_lower = {c.lower().strip(): c for c in df_columns}
    mapping = {}
    for field, aliases in COLUMN_ALIASES.items():
        for alias in aliases:
            if alias in col_lower:
                mapping[field] = col_lower[alias]
                break
    return mapping


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return payload


class ProductInput(BaseModel):
    sku: Optional[str] = None
    name: str
    price: Optional[float] = None
    stock: Optional[int] = 0
    description: Optional[str] = None
    category: Optional[str] = None
    images: Optional[list[str]] = []
    metadata: Optional[dict] = {}
    is_active: Optional[bool] = True


class ProductUpdateInput(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    description: Optional[str] = None
    category: Optional[str] = None
    images: Optional[list[str]] = None
    metadata: Optional[dict] = None
    is_active: Optional[bool] = None


@router.get("/products")
async def get_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    user=Depends(get_current_user),
):
    business_id = user.get("business_id")
    query = supabase.table("products").select("*").eq("business_id", business_id)

    if is_active is not None:
        query = query.eq("is_active", is_active)
    if category:
        query = query.eq("category", category)

    result = query.order("created_at", desc=True).execute()
    products = result.data or []

    if search:
        search_lower = search.lower()
        products = [
            p for p in products
            if search_lower in (p.get("name") or "").lower()
            or search_lower in (p.get("sku") or "").lower()
            or search_lower in (p.get("description") or "").lower()
            or search_lower in (p.get("category") or "").lower()
        ]

    return {"products": products, "total": len(products)}


@router.post("/products")
async def create_product(data: ProductInput, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    result = supabase.table("products").insert({
        "business_id": business_id,
        "sku": data.sku,
        "name": data.name,
        "price": data.price,
        "stock": data.stock,
        "description": data.description,
        "category": data.category,
        "images": data.images,
        "metadata": data.metadata,
        "is_active": data.is_active,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create product.")

    return result.data[0]


@router.patch("/products/{product_id}")
async def update_product(
    product_id: str,
    data: ProductUpdateInput,
    user=Depends(get_current_user),
):
    business_id = user.get("business_id")

    existing = supabase.table("products").select("id").eq(
        "id", product_id
    ).eq("business_id", business_id).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = supabase.table("products").update(updates).eq(
        "id", product_id
    ).eq("business_id", business_id).execute()

    return result.data[0]


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    existing = supabase.table("products").select("id").eq(
        "id", product_id
    ).eq("business_id", business_id).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    supabase.table("products").delete().eq(
        "id", product_id
    ).eq("business_id", business_id).execute()

    return {"message": "Product deleted successfully."}


@router.post("/products/upload-csv")
async def upload_products_csv(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
):
    business_id = user.get("business_id")

    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(
            status_code=400,
            detail="Only CSV and Excel files are supported."
        )

    try:
        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        # Resolve column aliases
        col_map = resolve_columns(list(df.columns))

        # Identify extra columns not mapped to known fields
        mapped_source_cols = set(col_map.values())
        all_cols = set(df.columns)
        extra_cols = [c for c in df.columns if c not in mapped_source_cols]

        df = df.where(pd.notnull(df), None)

        products_to_insert = []
        skipped = 0

        for _, row in df.iterrows():
            # Resolve name — try mapped name, then product_name, then sku, then first column
            name = None
            if "name" in col_map:
                name = row.get(col_map["name"])
            if not name and "sku" in col_map:
                name = row.get(col_map["sku"])
            if not name:
                name = str(row.iloc[0]) if len(row) > 0 else None

            if not name or str(name).strip() in ("", "nan", "None"):
                skipped += 1
                continue

            name = str(name).strip()

            # Resolve SKU
            sku = None
            if "sku" in col_map:
                raw_sku = row.get(col_map["sku"])
                if raw_sku and str(raw_sku).strip() not in ("", "nan", "None"):
                    sku = str(raw_sku).strip()

            # Resolve price
            price = None
            if "price" in col_map:
                try:
                    price = float(row.get(col_map["price"]))
                except (ValueError, TypeError):
                    price = None

            # Resolve stock
            stock = 0
            if "stock" in col_map:
                try:
                    stock = int(float(row.get(col_map["stock"]) or 0))
                except (ValueError, TypeError):
                    stock = 0

            # Resolve description — combine subcategory info if available
            description = None
            if "description" in col_map:
                raw_desc = row.get(col_map["description"])
                if raw_desc and str(raw_desc).strip() not in ("", "nan", "None"):
                    description = str(raw_desc).strip()

            # Resolve category
            category = None
            if "category" in col_map:
                raw_cat = row.get(col_map["category"])
                if raw_cat and str(raw_cat).strip() not in ("", "nan", "None"):
                    category = str(raw_cat).strip()

            # Store all extra/unmapped columns in metadata
            metadata = {}
            for col in extra_cols:
                val = row.get(col)
                if val is not None and str(val).strip() not in ("", "nan", "None"):
                    metadata[col] = str(val).strip()

            products_to_insert.append({
                "business_id": business_id,
                "sku": sku,
                "name": name,
                "price": price,
                "stock": stock,
                "description": description,
                "category": category,
                "images": [],
                "metadata": metadata,
                "is_active": True,
            })

        if not products_to_insert:
            raise HTTPException(
                status_code=400,
                detail="No valid products found in the file."
            )

        inserted = 0
        for product in products_to_insert:
            supabase.table("products").insert(product).execute()
            inserted += 1

        return {
            "message": f"Successfully imported {inserted} products.",
            "imported": inserted,
            "skipped": skipped,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV upload error for business {business_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process file: {str(e)}"
        )


@router.get("/products/categories")
async def get_categories(user=Depends(get_current_user)):
    business_id = user.get("business_id")

    result = supabase.table("products").select("category").eq(
        "business_id", business_id
    ).eq("is_active", True).execute()

    categories = list(set(
        p["category"] for p in result.data
        if p.get("category")
    ))
    categories.sort()

    return {"categories": categories}