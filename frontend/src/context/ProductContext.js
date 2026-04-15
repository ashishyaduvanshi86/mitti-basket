import { createContext, useContext, useState, useEffect } from "react";
import {
  seasonHarvest as staticSeason,
  villagePantry as staticPantry,
  festiveCollection as staticFestive,
  secretGardenBox as staticGarden,
  featuredPantry as staticFeatured,
} from "@/data/products";

const ProductContext = createContext(null);

const API = process.env.REACT_APP_BACKEND_URL + "/api";

export function ProductProvider({ children }) {
  const [products, setProducts] = useState({
    seasonHarvest: [],
    villagePantry: [],
    festiveCollection: [],
    secretGardenBox: null,
    featuredPantry: [],
    loaded: false,
  });

  const fetchProducts = async () => {
  try {
    const res = await fetch(`${API}/products?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("API response not OK");
    }

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Received HTML instead of JSON");
    }

    const data = await res.json();

    console.log("PRODUCT API RESPONSE:", data);

    const notHidden = (arr) =>
      (arr || []).filter(
        (p) => p.availability_status !== "HIDDEN"
      );

    setProducts({
      seasonHarvest: notHidden(data.season_harvest),
      villagePantry: notHidden(data.village_pantry),
      festiveCollection: notHidden(data.festive),
      secretGardenBox:
        notHidden(data.secret_garden)[0] || null,
      featuredPantry:
        notHidden(data.village_pantry).slice(0, 4),
      loaded: true,
    });

  } catch (err) {
    console.warn("Skipping fallback — temporary fetch issue:", err);
  }
      // fallback ONLY if API completely fails
      setProducts({
        seasonHarvest: staticSeason,
        villagePantry: staticPantry,
        festiveCollection: staticFestive,
        secretGardenBox: staticGarden,
        featuredPantry: staticFeatured,
        loaded: true,
      });
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleFocus = () => fetchProducts();
    window.addEventListener("focus", handleFocus);

    const interval = setInterval(fetchProducts, 20000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  return (
    <ProductContext.Provider value={products}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);