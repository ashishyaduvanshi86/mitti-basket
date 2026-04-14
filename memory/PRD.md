# Mitti Basket - PRD

## Original Problem Statement
Build a premium D2C seasonal farm-to-home food brand website for "Mitti Basket" with luxury heritage food aesthetics, farm storytelling, seasonal produce drops, and earthy minimal layout.

## Core Requirements
- Flamingo Estate-inspired UI with auto-scrolling banners, 2-stage hover product cards
- Dynamic pricing on product cards based on quantity selection
- Cart checkout with Razorpay payment (Live) and Google Sheets order sync
- Brevo transactional emails (order confirmation, admin alerts, contact auto-reply)
- Admin Panel for products, orders, customers, subscribers
- SEO/Open Graph meta tags

## Architecture
- Frontend: React + Tailwind + Shadcn UI
- Backend: FastAPI (modular routes)
- Database: MongoDB (Motor async)
- Payments: Razorpay (Live with Webhooks)
- Email: Brevo API
- Charts: Recharts (Admin)
- SEO: react-helmet-async

## What's Been Implemented

### Phase 1 - Core E-commerce (Complete)
- Full storefront with seasonal sections, hero banners, product grids
- Product cards with 2-stage hover (quantity selector + add-to-basket)
- Cart drawer with checkout flow
- Razorpay Live integration with webhook verification
- Google Sheets order sync
- Brevo emails (order confirm, admin alerts, contact auto-reply)
- WhatsApp integration in footer

### Phase 2 - Admin Panel (Complete)
- JWT authentication at /admin
- Dashboard with revenue charts (Recharts), order stats, CSV exports
- Product CRUD with image management
- Orders management with status updates
- Customer & subscriber management

### Phase 3 - SEO & Polish (Complete)
- react-helmet-async for page meta tags
- Open Graph previews
- 404 page
- Horizontal scroll fix on mobile
- Cart qty increment fix (qtyStep logic)

### Phase 4 - Operational Features (Complete - Apr 2026)
**Product Schema Extensions:**
- badge_type (SOLD_OUT, BEST_SELLER, COMING_SOON, LIMITED_HARVEST, SEASON_ENDING, CUSTOM)
- badge_text, badge_color for custom badge styling
- availability_status (AVAILABLE, SOLD_OUT, COMING_SOON, PREORDER, HIDDEN)
- stock_quantity, low_stock_threshold for inventory tracking
- Auto SOLD_OUT when stock hits 0

**Order Schema Extensions:**
- Full lifecycle: Placed, Processing, Packed, Shipped, Out for Delivery, Delivered, Cancelled, Failed
- payment_status: Pending, Paid, Failed
- Timestamp tracking: shipped_at, out_for_delivery_at, delivered_at

**Global Settings System:**
- MongoDB settings collection with admin CRUD
- Minimum order value toggle + configurable amount
- Default shipping message
- Broadcast sender name
- Public API for frontend cart validation

**Product Waitlist System:**
- Notify Me for SOLD_OUT/COMING_SOON products
- Email confirmation to user + admin notification
- Auto-notify when product becomes AVAILABLE
- Duplicate prevention

**Bulk Order Operations:**
- Multi-select orders in admin
- Bulk status update (Shipped, Out for Delivery, Delivered)
- Automatic email triggers on status change

**Email Automation (6 new templates):**
- Order shipped notification
- Out for delivery notification
- Waitlist signup confirmation
- Product availability alert
- Payment retry email
- Broadcast email template

**Admin Broadcast Email:**
- Send to all customers or selected recipients
- Custom subject + HTML body
- Async sending via BackgroundTasks

**Payment Retry Flow:**
- Creates new Razorpay order for failed payments
- Sends retry email to customer

**Admin UI Additions:**
- Settings page (min order toggle/value, shipping message, sender name)
- Broadcast page (compose + recipient selection)
- Products: badge_type dropdown, availability_status, stock, badge_color picker
- Orders: multi-select checkboxes + bulk action buttons (Shipped/OFD/Delivered)
- Sidebar: Settings + Broadcast nav items

**Customer Frontend:**
- Dynamic badge rendering from badge_type/badge_color
- "Notify Me" button + email form for SOLD_OUT/COMING_SOON
- PREORDER label on purchasable pre-order items
- HIDDEN products filtered from storefront
- Dynamic minimum order value from settings API
- Harvest window display (per-product, admin-togglable)

**WhatsApp Order Notifications (Admin-click):**
- Order Confirmation: pre-filled WhatsApp message with order details
- Shipped: pre-filled WhatsApp notification for customer
- Out for Delivery: pre-filled WhatsApp notification for customer
- All accessible from Admin Orders → Order Detail modal
- Opens WhatsApp Web with customer's number + formatted message

**Harvest Window System:**
- next_harvest_window (string) + show_harvest_window (bool) per product
- Admin can set harvest text (e.g. "Harvested between June 12–18 in Gir region")
- Admin can toggle visibility per product
- Renders as italic green text below product name on storefront

**Customizable Email Messages:**
- Default Shipping Message: configurable in Admin Settings, used in shipped emails
- Out for Delivery Message: configurable in Admin Settings, used in OFD emails

**SEO Schema Metadata (JSON-LD):**
- Organization schema on every page (name, logo, contact, social)
- Per-product Product schema on category pages (name, price, availability, brand, country)
- ItemList schema for product listing pages
- BreadcrumbList schema for navigation context
- Wired into: Village Pantry, Season Harvest, Festive Collection, Secret Garden pages

**Dashboard Metrics Upgrade:**
- Revenue Today (alongside total revenue)
- Repeat Customers count + retention % (customers with 2+ orders)
- Top Product card (name, units sold, revenue)
- 6-card stat grid layout

## Backlog
- P2: Blog/journal section for farm storytelling

## Key API Endpoints
- POST /api/payment/webhook - Razorpay webhook
- GET /api/products - Public product catalog (excludes HIDDEN)
- GET /api/settings/public - Public min order settings
- POST /api/products/waitlist - Notify me signup
- POST /api/orders/retry-payment - Payment retry
- GET /api/admin/settings - Admin settings
- PUT /api/admin/settings - Update settings
- POST /api/admin/orders/bulk-status - Bulk order update
- POST /api/admin/broadcast - Send broadcast email
- GET /api/admin/dashboard/charts - Admin analytics

## DB Collections
- products, orders, waitlist, settings, product_waitlist, admin_users, login_attempts
