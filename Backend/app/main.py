"""
backend/app/main.py
FastAPI Main Application Entrypoint
"""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, stores, detection, tracking, streams, analytics, video_analysis, behavior, shelf, products, campaigns, restock_tasks
from .auth import require_role

app = FastAPI(title="Consumer Attention Mapping System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Application Routers
app.include_router(auth.router, tags=["Auth"])
app.include_router(stores.router, tags=["Stores"])
app.include_router(detection.router, tags=["Detection"])
app.include_router(tracking.router, tags=["Tracking"])
app.include_router(streams.router, tags=["Streams"])
app.include_router(analytics.router, tags=["Analytics"])
app.include_router(video_analysis.router, tags=["Video Analysis"])
app.include_router(behavior.router, tags=["Behaviour Intelligence"])
app.include_router(shelf.router, tags=["Shelf Planogram & Stock AI"])
app.include_router(products.router, tags=["Products & SKU Attractiveness"])
app.include_router(campaigns.router, tags=["Marketing Campaigns"])
app.include_router(restock_tasks.router, tags=["OOS Restock Tasks"])

from .create_tables import Base, engine
from .models import Role, User, Store, Zone, Shelf, Camera, ProductSKU, Campaign, RestockTask
from .database import SessionLocal
from .auth import hash_password

@app.on_event("startup")
def startup_db_init():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
        
        db = SessionLocal()
        roles_to_ensure = ["admin", "store_manager", "retail_analyst", "marketing_manager", "executive"]
        for r_name in roles_to_ensure:
            if not db.query(Role).filter(Role.name == r_name).first():
                db.add(Role(name=r_name))
        db.commit()

        demo_users = [
            ("Admin User", "kushalini.admin@corp.com", "admin123", "admin"),
            ("Store Manager", "kushalini.manager@corp.com", "manager123", "store_manager"),
            ("Retail Analyst", "kushalini.analyst@corp.com", "analyst123", "retail_analyst"),
            ("Executive", "kushalini.exec@corp.com", "exec123", "executive"),
            ("Marketing Manager", "kushalini.marketing@corp.com", "mktg123", "marketing_manager"),
        ]
        for name, email, pwd, r_name in demo_users:
            if not db.query(User).filter(User.email == email).first():
                role_obj = db.query(Role).filter(Role.name == r_name).first()
                db.add(User(
                    name=name,
                    email=email,
                    password_hash=hash_password(pwd),
                    role_id=role_obj.id if role_obj else None,
                    status="Active",
                    store="All Stores"
                ))

        if db.query(Store).count() == 0:
            s1 = Store(name="Downtown Flagship", location="Visakhapatnam")
            db.add(s1)
            db.commit()
            db.refresh(s1)
            z1 = Zone(store_id=s1.id, zone_name="Grocery & Snacks")
            z2 = Zone(store_id=s1.id, zone_name="Checkout")
            db.add_all([z1, z2])
            db.commit()

        db.commit()
        db.close()
        print("Database auto-seeded successfully!")
    except Exception as err:
        print(f"Startup DB init error: {err}")

@app.get("/")
def root_health_check():
    return {"status": "online", "system": "Consumer Attention Mapping System API", "version": "2.0.0"}


@app.get("/admin-only")
def admin_only(user = Depends(require_role("admin"))):
    return {"message": f"Welcome, {user.name}"}