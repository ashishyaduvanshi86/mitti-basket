import { Helmet } from "react-helmet-async";

const BASE_URL = "https://mittibasket.com";
const DEFAULT_IMAGE = "https://customer-assets.emergentagent.com/job_village-harvest-28/artifacts/rtdugvp0_Gemini_Generated_Image_q9o288q9o288q9o2.png";

const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Mitti Basket",
  url: BASE_URL,
  logo: DEFAULT_IMAGE,
  description: "Premium farm-to-home seasonal food brand. Village-made pantry essentials, seasonal harvests, and heritage festive foods from India.",
  contactPoint: { "@type": "ContactPoint", telephone: "+91-98803-92340", contactType: "customer service" },
  sameAs: ["https://www.instagram.com/mittibasket"],
};

const AVAIL_MAP = {
  AVAILABLE: "https://schema.org/InStock",
  SOLD_OUT: "https://schema.org/OutOfStock",
  COMING_SOON: "https://schema.org/PreOrder",
  PREORDER: "https://schema.org/PreOrder",
};

function buildProductSchema(p) {
  const avail = p.availability_status || "AVAILABLE";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.tagline || p.name,
    image: p.image || DEFAULT_IMAGE,
    brand: { "@type": "Brand", name: "Mitti Basket" },
    offers: {
      "@type": "Offer",
      price: p.basePrice,
      priceCurrency: "INR",
      availability: AVAIL_MAP[avail] || "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Mitti Basket" },
    },
    ...(p.origin ? { countryOfOrigin: { "@type": "Country", name: "India" } } : {}),
  };
}

export default function SEO({ title, description, path = "", image, products, breadcrumbs }) {
  const fullTitle = title
    ? `${title} | Mitti Basket`
    : "Mitti Basket | From India's Mitti to Your Home";
  const desc = description || "Seasonal harvests, village-made pantry essentials, and heritage festive foods. Farm-fresh, handmade, delivered to your doorstep.";
  const url = `${BASE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;

  const schemas = [ORG_SCHEMA];

  // Per-product schemas for category pages
  if (products && products.length > 0) {
    products.forEach((p) => schemas.push(buildProductSchema(p)));
    schemas.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: title || "Products",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${url}#${(p.name || "").toLowerCase().replace(/\s+/g, "-")}`,
      })),
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: `${BASE_URL}${b.path}`,
      })),
    });
  }

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={img} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
}
