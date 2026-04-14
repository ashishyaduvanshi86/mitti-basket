"""Email helpers: Brevo API integration for transactional emails."""
import json
import logging
import requests as http_requests
from routes import BREVO_API_KEY, SENDER_EMAIL

logger = logging.getLogger("mitti_basket")


def send_brevo_email(to_email, subject, html):
    if not BREVO_API_KEY or not SENDER_EMAIL:
        logger.warning("Brevo not configured, skipping email")
        return
    try:
        resp = http_requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"accept": "application/json", "api-key": BREVO_API_KEY, "content-type": "application/json"},
            data=json.dumps({
                "sender": {"name": "Mitti Basket", "email": SENDER_EMAIL},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html,
            }),
            timeout=10,
        )
        if resp.status_code in (200, 201):
            logger.info(f"Email sent to {to_email}: {subject}")
        else:
            logger.error(f"Brevo error: {resp.status_code} {resp.text}")
    except Exception as e:
        logger.error(f"Email failed for {to_email}: {e}")
        
WHATSAPP_NUMBER = "919880392340"

def whatsapp_button(order_id, label="Contact us on WhatsApp", stage="general"):
    short_id = order_id[:8].upper()

    if stage == "confirmation":
        message = f"Hi Mitti Basket, I have a question about my order {short_id}"

    elif stage == "shipped":
        message = f"Hi Mitti Basket, I wanted help tracking my order {short_id}"

    elif stage == "delivered":
        message = f"Hi Mitti Basket, I just received my order {short_id} and wanted to share feedback"

    else:
        message = f"Hi Mitti Basket, I have a question about my order {short_id}"

    encoded_message = message.replace(" ", "%20")

    return f"""
    <div style="margin: 24px 0;">
        <a href="https://wa.me/{WHATSAPP_NUMBER}?text={encoded_message}"
           style="display:inline-block;padding:12px 22px;
           background:#25D366;color:white;text-decoration:none;
           font-size:14px;font-weight:bold;border-radius:6px;">
           {label}
        </a>
    </div>
    """

def send_order_confirmation_email(order_doc):
    email = order_doc.get("email")
    if not email:
        return
    items_html = ""
    for item in order_doc.get("items", []):
        items_html += f'<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#1A1A1A;">{item["quantity"]} {item["name"]}</td><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#1A1A1A;text-align:right;">Rs.{item["total_price"]:,}</td></tr>'

    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; font-family: 'Georgia', serif; margin-bottom: 4px;">Order Confirmed!</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">Thank you for your order, {order_doc['name']}. Here's your receipt.</p>
        <div style="background: #3A5A40; padding: 14px 20px; margin-bottom: 20px;">
            <p style="color: #DDB892; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Order ID</p>
            <p style="color: white; font-size: 20px; font-weight: bold; margin: 0; letter-spacing: 1px;">#{order_doc['id'][:8].upper()}</p>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <p style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Order Details</p>
            <table style="width: 100%; border-collapse: collapse;">{items_html}</table>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #3A5A40; display: flex; justify-content: space-between;">
                <span style="font-size: 14px; font-weight: bold; color: #3A5A40;">Total: Rs.{order_doc['subtotal']:,}</span>
            </div>
        </div>
       <div style="background: #F4F1EC; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #E8E4DE;">
    <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0;">Delivery To</p>
    <p style="color: #1A1A1A; font-size: 14px; margin: 0;">{order_doc['address']}, {order_doc.get('city', '')} - {order_doc['pincode']}</p>
        </div>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
    {whatsapp_button(order_doc["id"], "Have a question about your order? Chat with us", stage="confirmation")}

    <p style="font-size: 13px; color: #9CA3AF;">
</div>
    """
    send_brevo_email(email, f"Order Confirmed - Mitti Basket #{order_doc['id'][:8]}", html)

    # Notify admin
    send_admin_order_notification(order_doc, items_html)


def send_admin_order_notification(order_doc, items_html):
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #1A1A1A; padding: 40px 32px;">
        <h1 style="font-size: 24px; color: #DDB892; margin-bottom: 4px;">New Order Received</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <div style="background: #2A2A2A; padding: 20px; border: 1px solid #333; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 10px 0;">Customer</p>
            <p style="font-size: 15px; color: white; margin: 0 0 4px 0; font-weight: bold;">{order_doc['name']}</p>
            <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 2px 0;">{order_doc['email']}</p>
            <p style="font-size: 13px; color: #9CA3AF; margin: 0 0 2px 0;">{order_doc['phone']}</p>
            <p style="font-size: 13px; color: #9CA3AF; margin: 0;">{order_doc['address']}, {order_doc.get('city','')} - {order_doc['pincode']}</p>        
        </div>
        <div style="background: #2A2A2A; padding: 20px; border: 1px solid #333; margin-bottom: 16px;">
            <p style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Items Ordered</p>
            <table style="width: 100%; border-collapse: collapse; color: white;">{items_html}</table>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #DDB892;">
                <span style="font-size: 18px; font-weight: bold; color: #DDB892;">Total: Rs.{order_doc['subtotal']:,}</span>
            </div>
        </div>
        <p style="font-size: 11px; color: #555;">Order ID: {order_doc['id'][:8]} &bull; {order_doc.get('created_at', '')[:10]}</p>
    </div>
    """
    send_brevo_email(SENDER_EMAIL, f"New Order #{order_doc['id'][:8]} - Rs.{order_doc['subtotal']:,} from {order_doc['name']}", html)


def send_contact_email(name, email, phone, message):
    # Email to admin
    admin_html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 24px; color: #3A5A40; margin-bottom: 8px;">New Contact Form Submission</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #1A1A1A;"><strong>Name:</strong> {name}</p>
            <p style="font-size: 14px; color: #1A1A1A;"><strong>Email:</strong> {email}</p>
            <p style="font-size: 14px; color: #1A1A1A;"><strong>Phone:</strong> {phone}</p>
            <p style="font-size: 14px; color: #1A1A1A;"><strong>Message:</strong><br>{message}</p>
        </div>
    </div>
    """
    send_brevo_email(SENDER_EMAIL, f"Contact Form: {name}", admin_html)

    # Acknowledgement email to user
    user_html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; font-family: 'Georgia', serif; margin-bottom: 4px;">Hello {name},</p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.8; margin-bottom: 20px;">
            Thank you for reaching out to us. We have received your message and our team is reviewing it.
            We will get back to you within <strong>24 to 48 hours</strong>.
        </p>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <p style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Your Message</p>
            <p style="font-size: 14px; color: #4B5563; line-height: 1.7; margin: 0;">{message}</p>
        </div>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.8;">
            In the meantime, feel free to reach us on WhatsApp at <strong>+91 98803 92340</strong> for anything urgent.
        </p>
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
    <a href="https://wa.me/919880392340"
   style="display:inline-block;padding:12px 22px;
   background:#25D366;color:white;text-decoration:none;
   font-size:14px;font-weight:bold;border-radius:6px;">
   Chat with us on WhatsApp
</a>
    <p style="font-size: 13px; color: #9CA3AF;">
        From India's soil to your home.<br>&mdash; Team Mitti Basket
    </p>
</div>
    </div>
    """
    send_brevo_email(email, "We've received your message - Mitti Basket", user_html)


def send_shipped_email(order_doc, shipping_message="Your order will be delivered in 3-5 business days."):
    email = order_doc.get("email")
    if not email:
        return
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 4px;">Your order has been shipped!</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">
            Hi {order_doc.get('name', 'there')}, your Mitti Basket order is on its way.
        </p>
        <div style="background: #3A5A40; padding: 14px 20px; margin-bottom: 20px;">
            <p style="color: #DDB892; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">Order ID</p>
            <p style="color: white; font-size: 20px; font-weight: bold; margin: 0;">#{order_doc['id'][:8].upper()}</p>
        </div>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
    <p style="font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">
        Shipping Info
    </p>

    <p style="font-size: 16px; color: #1A1A1A; font-weight: bold; margin: 0;">
        {shipping_message}
    </p>
</div>

<div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
    {whatsapp_button(order_doc["id"], "Need help tracking your order? Chat with us", stage="shipped")}

    <p style="font-size: 13px; color: #9CA3AF;">
        From India's soil to your home.<br>&mdash; Team Mitti Basket
    </p>
</div>
    """
    send_brevo_email(email, f"Your Mitti Basket order has been shipped - #{order_doc['id'][:8].upper()}", html)


def send_out_for_delivery_email(order_doc, ofd_message="Your farm basket is arriving today!"):
    email = order_doc.get("email")
    if not email:
        return
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 4px;">{ofd_message}</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">
            Hi {order_doc.get('name', 'there')}, your order <strong>#{order_doc['id'][:8].upper()}</strong> is out for delivery.
        </p>
        <div style="background: #3A5A40; padding: 14px 20px; margin-bottom: 20px;">
            <p style="color: white; font-size: 16px; font-weight: bold; margin: 0;">Arriving Today</p>
        </div>
        <div style="background: #F4F1EC; padding: 16px 20px; margin-bottom: 20px; border: 1px solid #E8E4DE;">
            <p style="color: #9CA3AF; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 6px 0;">Delivery To</p>
            <p style="color: #1A1A1A; font-size: 14px; margin: 0;">{order_doc['address']}, {order_doc.get('city', '')} - {order_doc['pincode']}</p>        
        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
{whatsapp_button(order_doc["id"], "Need help with delivery? Chat with us", stage="shipped")}    <p style="font-size: 13px; color: #9CA3AF;">
        From India's soil to your home.<br>&mdash; Team Mitti Basket
    </p>
</div>
        """
    send_brevo_email(email, f"Your order is out for delivery today - #{order_doc['id'][:8].upper()}", html)


def send_waitlist_confirmation_email(email, product_name):
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 4px;">You're on the waitlist!</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">
            We'll notify you as soon as <strong>{product_name}</strong> becomes available.
        </p>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #1A1A1A; margin: 0;">
                You've been added to the waitlist for <strong>{product_name}</strong>.
                We'll send you an email the moment it's back in stock.
            </p>
        </div>
        <p style="font-size: 13px; color: #9CA3AF;">From India's soil to your home.<br>&mdash; Team Mitti Basket</p>
    </div>
    """
    send_brevo_email(email, f"Waitlist Confirmed - {product_name} | Mitti Basket", html)


def send_product_available_email(email, product_name):
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 4px;">Great news! {product_name} is back!</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">
            The product you were waiting for is now available. Don't miss out &mdash; seasonal items go fast!
        </p>
        <div style="background: #3A5A40; padding: 14px 20px; margin-bottom: 20px; text-align: center;">
            <p style="color: white; font-size: 18px; font-weight: bold; margin: 0;">{product_name} is Available</p>
        </div>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 20px;">
            Visit <strong>mittibasket.com</strong> to place your order before it sells out again.
        </p>
        <p style="font-size: 13px; color: #9CA3AF;">From India's soil to your home.<br>&mdash; Team Mitti Basket</p>
    </div>
    """
    send_brevo_email(email, f"{product_name} is Now Available! | Mitti Basket", html)


def send_admin_waitlist_notification(customer_email, product_name):
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #1A1A1A; padding: 40px 32px;">
        <h1 style="font-size: 24px; color: #DDB892; margin-bottom: 4px;">Waitlist Signup</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <div style="background: #2A2A2A; padding: 20px; border: 1px solid #333;">
            <p style="font-size: 14px; color: white; margin: 0 0 8px 0;"><strong>Product:</strong> {product_name}</p>
            <p style="font-size: 14px; color: #9CA3AF; margin: 0;"><strong>Email:</strong> {customer_email}</p>
        </div>
    </div>
    """
    send_brevo_email(SENDER_EMAIL, f"Waitlist: {customer_email} wants {product_name}", html)


def send_payment_retry_email(order_doc):
    email = order_doc.get("email")
    if not email:
        return
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 4px;">Payment didn't go through</p>
        <p style="font-size: 14px; color: #4B5563; margin-bottom: 16px;">
            Hi {order_doc.get('name', 'there')}, it looks like the payment for your order
            <strong>#{order_doc['id'][:8].upper()}</strong> didn't complete.
        </p>
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #1A1A1A; margin: 0 0 8px 0;"><strong>Order Total:</strong> Rs.{order_doc.get('subtotal', 0):,}</p>
            <p style="font-size: 13px; color: #4B5563; margin: 0;">
                Don't worry &mdash; your order details are saved. You can retry the payment securely
                by visiting our website.
            </p>
        </div>
        <p style="font-size: 14px; color: #4B5563;">
            If you need help, reach us on WhatsApp at <strong>+91 98803 92340</strong>.
        </p>
        <p style="font-size: 13px; color: #9CA3AF;">From India's soil to your home.<br>&mdash; Team Mitti Basket</p>
    </div>
    """
    send_brevo_email(email, f"Complete your Mitti Basket payment - #{order_doc['id'][:8].upper()}", html)


def send_broadcast_email_message(to_email, subject, body_html, sender_name="Mitti Basket"):
    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">{sender_name}</h1>
        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>
        <div style="font-size: 14px; color: #1A1A1A; line-height: 1.8;">
            {body_html}
        </div>
        <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
            <p style="font-size: 13px; color: #9CA3AF;">From India's soil to your home.<br>&mdash; Team {sender_name}</p>
        </div>
    </div>
    """
    send_brevo_email(to_email, subject, html)
    
def send_delivered_email(order_doc):
    email = order_doc.get("email")
    if not email:
        return

    html = f"""
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; padding: 40px 32px;">
        <h1 style="font-size: 28px; color: #3A5A40; margin-bottom: 8px;">Mitti Basket</h1>

        <div style="width: 40px; height: 2px; background: #DDB892; margin-bottom: 24px;"></div>

        <p style="font-size: 18px; color: #1A1A1A; margin-bottom: 12px;">
            Your order has been delivered 🌿
        </p>

        <p style="font-size: 14px; color: #4B5563; margin-bottom: 20px;">
            We hope everything reached you fresh and just as expected.
        </p>

        <div style="background: #3A5A40; padding: 14px 20px; margin-bottom: 20px;">
            <p style="color: #DDB892; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px 0;">
                Order ID
            </p>
            <p style="color: white; font-size: 20px; font-weight: bold; margin: 0;">
                #{order_doc['id'][:8].upper()}
            </p>
        </div>

        <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #E8E4DE;">
{whatsapp_button(order_doc["id"], "Your basket has arrived 🌿 Share your feedback with us", stage="delivered")}            <p style="font-size: 13px; color: #9CA3AF;">
                From India's soil to your home.<br>&mdash; Team Mitti Basket
            </p>
        </div>
    </div>
    """

    send_brevo_email(
        email,
        f"Delivered - Mitti Basket #{order_doc['id'][:8]}",
        html,
    )
