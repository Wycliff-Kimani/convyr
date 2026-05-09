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

    # Client-side search filter (trigram index handles DB-level search via agent)
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

    existing = supabase.table("products").select("id").eq("id", product_id).eq(
        "business_id", business_id
    ).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    updates = {k: v for k, v in data.model_dump().items() if v is not None}

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update.")

    result = supabase.table("products").update(updates).eq("id", product_id).eq(
        "business_id", business_id
    ).execute()

    return result.data[0]


@router.delete("/products/{product_id}")
async def delete_product(product_id: str, user=Depends(get_current_user)):
    business_id = user.get("business_id")

    existing = supabase.table("products").select("id").eq("id", product_id).eq(
        "business_id", business_id
    ).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Product not found.")

    supabase.table("products").delete().eq("id", product_id).eq(
        "business_id", business_id
    ).execute()

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

        df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]

        required_columns = {"name"}
        if not required_columns.issubset(set(df.columns)):
            raise HTTPException(
                status_code=400,
                detail="File must have at least a 'name' column."
            )

        df = df.where(pd.notnull(df), None)

        products_to_insert = []
        skipped = 0

        for _, row in df.iterrows():
            name = row.get("name")
            if not name or str(name).strip() == "":
                skipped += 1
                continue

            price = row.get("price")
            try:
                price = float(price) if price is not None else None
            except (ValueError, TypeError):
                price = None

            stock = row.get("stock")
            try:
                stock = int(stock) if stock is not None else 0
            except (ValueError, TypeError):
                stock = 0

            products_to_insert.append({
                "business_id": business_id,
                "sku": str(row.get("sku")).strip() if row.get("sku") else None,
                "name": str(name).strip(),
                "price": price,
                "stock": stock,
                "description": str(row.get("description")).strip() if row.get("description") else None,
                "category": str(row.get("category")).strip() if row.get("category") else None,
                "images": [],
                "metadata": {},
                "is_active": True,
            })

        if not products_to_insert:
            raise HTTPException(
                status_code=400,
                detail="No valid products found in the file."
            )

        # Upsert on SKU if present, otherwise plain insert
        inserted = 0
        for product in products_to_insert:
            if product["sku"]:
                supabase.table("products").upsert(
                    product,
                    on_conflict="sku,business_id"
                ).execute()
            else:
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