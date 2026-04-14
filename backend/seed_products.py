import uuid
from datetime import datetime, timezone

def get_seed_products():
    now = datetime.now(timezone.utc).isoformat()
    products = []

    # Season Harvest
    season = [
        {"name": "Dudhiya Malda Mango", "tagline": "Creamy white pulp, melt-in-mouth sweetness", "origin": "Malda, West Bengal", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Rare Find", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/u8tcjmmc_WEbeE7RD.jpeg"},
        {"name": "Langra Mango", "tagline": "The king of flavour from Varanasi", "origin": "Varanasi, UP", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Best Seller", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/agzvol5h_HFWnVBpX.jpeg"},
        {"name": "Bambai Mango", "tagline": "Bihar's prized heritage variety, intensely sweet", "origin": "Bhagalpur, Bihar", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Heritage", "image": "https://images.unsplash.com/photo-1664183238215-0848f923e3dc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwzfHxyaXBlJTIwbWFuZ29lcyUyMGNsb3NlJTIwdXAlMjB0cm9waWNhbCUyMGZydWl0fGVufDB8fHx8MTc3NTQ5NTc0MXww&ixlib=rb-4.1.0&q=85"},
        {"name": "Chausa Mango", "tagline": "The aromatic late-summer delight", "origin": "Hajipur, Bihar", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Aromatic", "image": "https://images.unsplash.com/photo-1650742031412-24fb827405a7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMG1hbmdvZXMlMjBnb2xkZW4lMjBiYXNrZXQlMjBwcmVtaXVtfGVufDB8fHx8MTc3NTQ4NzM5OXww&ixlib=rb-4.1.0&q=85"},
        {"name": "Dashehari Mango", "tagline": "Lucknow's finest, fibreless golden pulp", "origin": "Lucknow, UP", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Classic", "image": "https://images.pexels.com/photos/17482442/pexels-photo-17482442.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
        {"name": "Gulabkhas Mango", "tagline": "Rose-scented aroma, velvety smooth flesh", "origin": "Darbhanga, Bihar", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Limited Edition", "image": "https://images.unsplash.com/photo-1669207334420-66d0e3450283?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMG1hbmdvZXMlMjBnb2xkZW4lMjBiYXNrZXQlMjBwcmVtaXVtfGVufDB8fHx8MTc3NTQ4NzM5OXww&ixlib=rb-4.1.0&q=85"},
        {"name": "Kishen Bhog Mango", "tagline": "Bengal's grand mango, large and luscious", "origin": "Malda, West Bengal", "basePrice": 1799, "unit": "5 kg box", "minQty": 5, "qtyStep": 1, "qtyUnit": "kg", "badge": "Grand Size", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/rqigmsc3_41Ey87U8JvS.jpg"},
        {"name": "Shahi Litchi", "tagline": "Juicy, sweet, from Muzaffarpur", "origin": "Muzaffarpur, Bihar", "basePrice": 699, "unit": "2 kg box", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Seasonal", "image": "https://images.unsplash.com/photo-1552081586-854725ddbaa8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMGxpdGNoaSUyMGZydWl0JTIwYmFza2V0JTIwb3JnYW5pY3xlbnwwfHx8fDE3NzU0ODMyMTl8MA&ixlib=rb-4.1.0&q=85"},
    ]
    for s in season:
        products.append({**s, "id": str(uuid.uuid4()), "category": "season_harvest", "subscribable": False, "comingSoon": False, "inStock": True, "availability_status": "AVAILABLE", "stock_quantity": 100, "low_stock_threshold": 5, "badge_type": "", "badge_text": "", "badge_color": "", "created_at": now, "updated_at": now})

    # Village Pantry
    pantry = [
        {"name": "A2 Desi Ghee", "tagline": "Bilona method, slow-churned from A2 cow milk", "origin": "Village Kitchens, Bihar", "basePrice": 2270, "unit": "1 kg jar", "minQty": 1, "qtyStep": 1, "qtyUnit": "kg", "badge": "Best Seller", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/c0j5sz48_ChatGPT%20Image%20Apr%207%2C%202026%2C%2006_45_11%20PM.png"},
        {"name": "Premium Makhana", "tagline": "Hand-popped, nutrient-rich superfood", "origin": "Darbhanga, Bihar", "basePrice": 449, "unit": "250 gm pack", "minQty": 250, "qtyStep": 250, "qtyUnit": "gm", "badge": "Superfood", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/lnfjm7wm_Gemini_Generated_Image_xkokbqxkokbqxkok.png"},
        {"name": "Stone-ground Sattu", "tagline": "Bihar's original superfood, stone-milled", "origin": "Village Mills, Bihar", "basePrice": 799, "unit": "2 kg pack", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Heritage", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/j7kf4rdw_Gemini_Generated_Image_hqjbhahqjbhahqjb.png"},
        {"name": "Toor Dal", "tagline": "Farm-sourced, unpolished pigeon pea lentils", "origin": "Small Farms, Bihar", "basePrice": 400, "unit": "2 kg pack", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Farm Direct", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/6gb8wj8y_ChatGPT%20Image%20Apr%207%2C%202026%2C%2007_05_03%20PM.png"},
        {"name": "Moong Dal", "tagline": "Split green gram, naturally dried", "origin": "Small Farms, Eastern India", "basePrice": 349, "unit": "2 kg pack", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Farm Direct", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/5pd80lk5_Gemini_Generated_Image_wlu7w9wlu7w9wlu7.png"},
        {"name": "Masoor Dal", "tagline": "Red lentils, sun-dried and unpolished", "origin": "Small Farms, Bihar", "basePrice": 324, "unit": "2 kg pack", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Farm Direct", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/kbq249s2_Gemini_Generated_Image_ti8rwfti8rwfti8r.png"},
        {"name": "Chana Dal", "tagline": "Split chickpeas, rich and earthy", "origin": "Small Farms, Eastern India", "basePrice": 249, "unit": "2 kg pack", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Farm Direct", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/f129dgj8_ChatGPT%20Image%20Apr%207%2C%202026%2C%2007_01_12%20PM.png"},
        {"name": "Cold Pressed Mustard Oil", "tagline": "Traditional kachi ghani, pungent & pure", "origin": "Village Mills, Bihar", "basePrice": 999, "unit": "1 L bottle", "minQty": 1, "qtyStep": 1, "qtyUnit": "L", "badge": "New", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/k844vb29_Gemini_Generated_Image_w1v0s2w1v0s2w1v0.png"},
    ]
    for p in pantry:
        products.append({**p, "id": str(uuid.uuid4()), "category": "village_pantry", "subscribable": True, "comingSoon": False, "inStock": True, "created_at": now, "updated_at": now})

    # Festive
    festive = [
        {"name": "Thekua", "tagline": "Chhath Puja's sacred sweet", "origin": "Bihar Households", "basePrice": 499, "unit": "2 kg box", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Festive", "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/9h248u5o_Sudh-Ghee.png"},
        {"name": "Tilkut", "tagline": "Gaya's winter delicacy", "origin": "Gaya, Bihar", "basePrice": 599, "unit": "2 kg box", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Festive", "image": "https://images.unsplash.com/photo-1610529540465-84bd2d3fe3f7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwxfHxzZXNhbWUlMjBiYXIlMjBjYW5keSUyMHRyYWRpdGlvbmFsJTIwc25hY2t8ZW58MHx8fHwxNzc1NDkwMjAwfDA&ixlib=rb-4.1.0&q=85"},
        {"name": "Khajur Sweets", "tagline": "Date-palm jaggery confections", "origin": "Rural Bihar", "basePrice": 449, "unit": "2 kg box", "minQty": 2, "qtyStep": 1, "qtyUnit": "kg", "badge": "Festive", "image": "https://images.unsplash.com/photo-1745582763219-1a5259056ba3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBqYWdnZXJ5JTIwc3dlZXRzJTIwdHJhZGl0aW9uYWx8ZW58MHx8fHwxNzc1NDkwMTkwfDA&ixlib=rb-4.1.0&q=85"},
    ]
    for f in festive:
        products.append({**f, "id": str(uuid.uuid4()), "category": "festive", "subscribable": False, "comingSoon": True, "inStock": True, "availability_status": "COMING_SOON", "stock_quantity": 0, "low_stock_threshold": 5, "badge_type": "", "badge_text": "", "badge_color": "", "created_at": now, "updated_at": now})

    # Secret Garden Box
    products.append({
        "id": str(uuid.uuid4()),
        "name": "The Secret Garden Box",
        "tagline": "Seven treasures. One seasonal mystery.",
        "origin": "Mitti Basket Curation",
        "basePrice": 2599,
        "unit": "box",
        "minQty": 1,
        "qtyStep": 1,
        "qtyUnit": "box",
        "badge": "Exclusive",
        "subscribable": True,
        "image": "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/djkihpsx_Gemini_Generated_Image_re3u47re3u47re3u.png",
        "category": "secret_garden",
        "comingSoon": False,
        "inStock": True,
        "availability_status": "AVAILABLE",
        "stock_quantity": 100,
        "low_stock_threshold": 5,
        "badge_type": "",
        "badge_text": "",
        "badge_color": "",
        "created_at": now,
        "updated_at": now,
    })

    return products
