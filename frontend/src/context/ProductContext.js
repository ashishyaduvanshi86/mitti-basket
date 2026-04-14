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

      const data = await res.json();

      const notHidden = (arr) =>
        (arr || []).filter(
          (p) => p.availability_status !== "HIDDEN"
        );

      const season = notHidden(data.season_harvest);
      const pantry = notHidden(data.village_pantry);
      const festive = notHidden(data.festive);
      const gardenArr = notHidden(data.secret_garden);

      setProducts({
        seasonHarvest: season,
        villagePantry: pantry,
        festiveCollection: festive,
        secretGardenBox:
          gardenArr.length > 0 ? gardenArr[0] : null,
        featuredPantry: pantry.slice(0, 4),
        loaded: true,
      });

    } catch (err) {
      console.error("Product fetch failed:", err);

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