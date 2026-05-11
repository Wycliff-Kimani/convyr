from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
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

COLUMN_ALIASES = {
    "name":        ["name", "product_name", "product name", "item_name", "item name", "title"],
    "sku":         ["sku", "product_code", "product code", "code", "item_code", "item code", "barcode"],
    "price":       ["price", "cost_per_item", "cost per item", "unit_price", "unit price", "selling_price", "selling price", "amount"],
    "stock":       ["stock", "quantity", "qty", "stock_quantity", "available", "units"],
    "description": ["description", "subcategory", "sub_category", "sub category", "details", "notes"],
    "category":    ["category", "product_category", "product category", "type", "department"],
}


def resolve_columns(df_columns: list[str]) -> dict:
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
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    user=Depends(get_current_user),
):
    business_id = user.get("business_id")

    # Count query
    count_query = supabase.table("products").select("id", count="estimated").eq("business_id", business_id)
    if is_active is not None:
        count_query = count_query.eq("is_active", is_active)
    if category:
        count_query = count_query.eq("category", category)
    if search:
        count_query = count_query.or_(
            f"name.ilike.%{search}%,sku.ilike.%{search}%,description.ilike.%{search}%,category.ilike.%{search}%"
        )
    count_result = count_query.execute()
    total = count_result.count or 0

    # Data query with pagination
    offset = (page - 1) * page_size
    data_query = supabase.table("products").select("*").eq("business_id", business_id)
    if is_active is not None:
        data_query = data_query.eq("is_active", is_active)
    if category:
        data_query = data_query.eq("category", category)
    if search:
        data_query = data_query.or_(
            f"name.ilike.%{search}%,sku.ilike.%{search}%,description.ilike.%{search}%,category.ilike.%{search}%"
        )
    data_query = data_query.order("created_at", desc=True).range(offset, offset + page_size - 1)
    result = data_query.execute()
    products = result.data or []

    return {
        "products": products,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": max(1, -(-total // page_size)),  # ceiling division
    }


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
        raise HTTPException(status_code=400, detail="Only CSV and Excel files are supported.")

    try:
        contents = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))

        col_map = resolve_columns(list(df.columns))
        mapped_source_cols = set(col_map.values())
        extra_cols = [c for c in df.columns if c not in mapped_source_cols]

        df = df.where(pd.notnull(df), None)

        products_to_insert = []
        skipped = 0

        for _, row in df.iterrows():
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

            sku = None
            if "sku" in col_map:
                raw_sku = row.get(col_map["sku"])
                if raw_sku and str(raw_sku).strip() not in ("", "nan", "None"):
                    sku = str(raw_sku).strip()

            price = None
            if "price" in col_map:
                try:
                    val = row.get(col_map["price"])
                    if val is not None and str(val).strip() not in ("", "nan", "None"):
                        price = float(val)
                except (ValueError, TypeError):
                    price = None

            stock = 0
            if "stock" in col_map:
                try:
                    stock = int(float(row.get(col_map["stock"]) or 0))
                except (ValueError, TypeError):
                    stock = 0

            description = None
            if "description" in col_map:
                raw_desc = row.get(col_map["description"])
                if raw_desc and str(raw_desc).strip() not in ("", "nan", "None"):
                    description = str(raw_desc).strip()

            category = None
            if "category" in col_map:
                raw_cat = row.get(col_map["category"])
                if raw_cat and str(raw_cat).strip() not in ("", "nan", "None"):
                    category = str(raw_cat).strip()

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
            raise HTTPException(status_code=400, detail="No valid products found in the file.")

        # Bulk insert in batches of 100
        BATCH_SIZE = 100
        inserted = 0
        for i in range(0, len(products_to_insert), BATCH_SIZE):
            batch = products_to_insert[i:i + BATCH_SIZE]
            supabase.table("products").insert(batch).execute()
            inserted += len(batch)

        return {
            "message": f"Successfully imported {inserted} products.",
            "imported": inserted,
            "skipped": skipped,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV upload error for business {business_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")


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