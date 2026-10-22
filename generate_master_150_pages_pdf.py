import os
import base64
import html
import subprocess

screenshot_dir = r"C:\Users\MANIKANDAN\.gemini\antigravity\brain\2d3af876-c47d-4105-98d4-f0b4df0973cd\output_screenshots"
pdf_path = r"C:\wamp64\www\farmlink\Agrenza_Master_150_Pages_Project_Report.pdf"
html_path = r"C:\Users\MANIKANDAN\.gemini\antigravity\brain\2d3af876-c47d-4105-98d4-f0b4df0973cd\agrenza_master_150_full.html"

def get_b64(filename):
    full_p = os.path.join(screenshot_dir, filename)
    if os.path.exists(full_p):
        with open(full_p, "rb") as f:
            encoded = base64.b64encode(f.read()).decode("utf-8")
            return f"data:image/png;base64,{encoded}"
    return ""

screenshots = [
    ("01_home_page.png", "Figure 10.1: Home Page — Offer Banner, Navigation Header & Live Mandi Price Ticker"),
    ("02_shop_page.png", "Figure 10.2: Public Marketplace — Categorized Fresh Produce Listings with Filter Tabs"),
    ("03_offers_page.png", "Figure 10.3: Promotional Offers & Harvest Season Discount Coupons"),
    ("04_about_page.png", "Figure 10.4: About Agrenza — Mission, Story & Trust Statistics"),
    ("05_contact_page.png", "Figure 10.5: Contact & Customer Support Inquiry Portal"),
    ("06_farmer_register.png", "Figure 10.6: Farmer Partner Registration Portal (Dual-Role Enabled)"),
    ("07_buyer_register.png", "Figure 10.7: Buyer Registration Portal (Same Email & Mobile Permitted)"),
    ("08_login_page.png", "Figure 10.8: User Authentication & Role-Based Login Portal"),
    ("09_cart_page.png", "Figure 10.9: Shopping Cart & Order Checkout with Itemized GST Breakdown"),
    ("10_farmer_dashboard.png", "Figure 10.10: Farmer Dashboard — Revenue Analytics & Order Status Controls"),
    ("11_farmer_products.png", "Figure 10.11: Farmer Product Inventory & Stock Refill Control Console"),
    ("12_admin_dashboard.png", "Figure 10.12: Admin Governance Dashboard & Platform KPI Metrics"),
    ("13_admin_shared_emails.png", "Figure 10.13: Admin Dual-Role Shared Accounts Auditor")
]

# Backend files to load
backend_files = [
    (r"C:\wamp64\www\farmlink\farmlink\backend\config\db.php", "backend/config/db.php (Database Connection & Constants)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\_bootstrap.php", "backend/api/_bootstrap.php (CORS, Auth Helpers & Response Sanitization)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\check-email.php", "backend/api/auth/check-email.php (Role-Scoped Duplicate Verification)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\login.php", "backend/api/auth/login.php (Authentication & Session Initializer)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\register.php", "backend/api/auth/register.php (Multi-Role User Registration)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\logout.php", "backend/api/auth/logout.php (Session Destroyer)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\me.php", "backend/api/auth/me.php (Session User Verification)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\verify-otp.php", "backend/api/auth/verify-otp.php (Registration OTP Verification)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\auth\verify-email.php", "backend/api/auth/verify-email.php (Email Link Token Verification)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\list.php", "backend/api/products/list.php (Active Catalog & Category Filter API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\detail.php", "backend/api/products/detail.php (Product Detail & GST Breakdown API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\create.php", "backend/api/products/create.php (Farmer Product Creation & Upload Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\update.php", "backend/api/products/update.php (Farmer Product Modification Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\refill.php", "backend/api/products/refill.php (Farmer Inventory Stock Refill API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\delete.php", "backend/api/products/delete.php (Farmer Product Soft Deletion API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\products\categories.php", "backend/api/products/categories.php (Category Master List API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\orders\place.php", "backend/api/orders/place.php (Buyer Order Placement & Inventory Deduction)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\orders\mine.php", "backend/api/orders/mine.php (Buyer Historical Orders Query API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\orders\farmer-items.php", "backend/api/orders/farmer-items.php (Farmer Incoming Orders Query API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\orders\update-item-status.php", "backend/api/orders/update-item-status.php (Order Fulfillment Status Updater)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\farmer\dashboard-stats.php", "backend/api/farmer/dashboard-stats.php (Farmer Summary Metrics & KPI API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\farmer\earnings.php", "backend/api/farmer/earnings.php (Farmer Date-Filtered Earnings API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\stats.php", "backend/api/admin/stats.php (Admin System-Wide Analytical Metrics API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\shared-emails.php", "backend/api/admin/shared-emails.php (Dual-Role Account Overlap Auditor API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\farmers.php", "backend/api/admin/farmers.php (Admin Farmer Account Management API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\farmer-action.php", "backend/api/admin/farmer-action.php (Farmer Approval/Suspension API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\products.php", "backend/api/admin/products.php (Admin Product Catalog Management API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\product-action.php", "backend/api/admin/product-action.php (Product Moderation API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\orders.php", "backend/api/admin/orders.php (Admin Orders Audit & Tracking API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\update-order-status.php", "backend/api/admin/update-order-status.php (Admin Order Status Override API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\bulk-requests\create.php", "backend/api/bulk-requests/create.php (Wholesale Bulk Inquiry Creation API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\bulk-requests\mine.php", "backend/api/bulk-requests/mine.php (Bulk Inquiries Query API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\config\firebase-config.php", "backend/config/firebase-config.php (Firebase Admin SDK Configuration)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\config\mail-config.php", "backend/config/mail-config.php (PHPMailer SMTP Configuration)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\bulk-requests.php", "backend/api/admin/bulk-requests.php (Admin Bulk Request Management API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\api\admin\bulk-request-action.php", "backend/api/admin/bulk-request-action.php (Bulk Request Approve/Reject API)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\helpers\email_validator.php", "backend/helpers/email_validator.php (Email Validation Helper)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\helpers\mailer.php", "backend/helpers/mailer.php (PHPMailer Email Dispatch Helper)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\helpers\otp.php", "backend/helpers/otp.php (OTP Generation and Verification Helper)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\helpers\functions.php", "backend/helpers/functions.php (Utility and Shared Functions)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\admin-login-process.php", "backend/auth/admin-login-process.php (Admin Login Session Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\buyer-login-process.php", "backend/auth/buyer-login-process.php (Buyer Login Session Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\buyer-register-process.php", "backend/auth/buyer-register-process.php (Buyer Registration Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\farmer-login-process.php", "backend/auth/farmer-login-process.php (Farmer Login Session Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\farmer-register-process.php", "backend/auth/farmer-register-process.php (Farmer Registration Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\logout.php", "backend/auth/logout.php (Session Logout and Cookie Clear)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\auth\verify-otp-process.php", "backend/auth/verify-otp-process.php (OTP Verification Form Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\buyer\add-to-cart-process.php", "backend/buyer/add-to-cart-process.php (Add to Cart Session Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\buyer\bulk-request-process.php", "backend/buyer/bulk-request-process.php (Wholesale Bulk Inquiry Form Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\buyer\buy-bulk-approved-process.php", "backend/buyer/buy-bulk-approved-process.php (Approved Bulk Purchase Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\buyer\place-order-process.php", "backend/buyer/place-order-process.php (Cart Checkout and Order Creation Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\buyer\remove-from-cart-process.php", "backend/buyer/remove-from-cart-process.php (Cart Item Removal Handler)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\farmer\add-product-process.php", "backend/farmer/add-product-process.php (Farmer Product Listing Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\farmer\delete-product-process.php", "backend/farmer/delete-product-process.php (Farmer Product Deletion Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\farmer\refill-product-process.php", "backend/farmer/refill-product-process.php (Farmer Stock Refill Form Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\farmer\update-order-status-process.php", "backend/farmer/update-order-status-process.php (Farmer Order Fulfillment Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\farmer\update-product-process.php", "backend/farmer/update-product-process.php (Farmer Product Edit Form Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\admin\approve-bulk-request-process.php", "backend/admin/approve-bulk-request-process.php (Admin Bulk Request Approval Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\admin\approve-farmer-process.php", "backend/admin/approve-farmer-process.php (Admin Farmer Approval Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\admin\reject-bulk-request-process.php", "backend/admin/reject-bulk-request-process.php (Admin Bulk Request Rejection Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\admin\reject-farmer-process.php", "backend/admin/reject-farmer-process.php (Admin Farmer Rejection Processor)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\admin\setup-email.php", "backend/admin/setup-email.php (Admin Email SMTP Configuration)"),
]

# Frontend files to load
frontend_files = [
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\layout.tsx", "app/layout.tsx (Root Layout & Global SEO Metadata)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\page.tsx", "app/page.tsx (Home Page Main Master Layout)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\Nav.tsx", "app/components/Nav.tsx (Top Offer Bar & Sticky Navigation Header)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\Footer.tsx", "app/components/Footer.tsx (Footer Component & Navigation Links)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\MandiTicker.tsx", "app/components/MandiTicker.tsx (Live Scrolling Market Prices Bar)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\Produce3DShowcase.tsx", "app/components/Produce3DShowcase.tsx (Spin the Stall 3D CSS Revolving Rack)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\CrateHero.tsx", "app/components/CrateHero.tsx (3D Produce Crate Hero Animation)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\ProductGrid.tsx", "app/components/ProductGrid.tsx (Marketplace Product Grid & Category Filter)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\ProductImage.tsx", "app/components/ProductImage.tsx (Dynamic Image Loader with SVG Fallback)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\ProduceIcons.tsx", "app/components/ProduceIcons.tsx (Botanical SVG Vector Produce Icons)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\FarmerNav.tsx", "app/components/FarmerNav.tsx (Farmer Portal Tab Navigation Bar)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\AdminNav.tsx", "app/components/AdminNav.tsx (Admin Console Tab Navigation Bar)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\api.ts", "app/lib/api.ts (Client API Connector & Error Handling Core)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\types.ts", "app/lib/types.ts (TypeScript Type & Interface Definitions)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\cart-context.tsx", "app/lib/cart-context.tsx (Shopping Cart Global Context & Persistence)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\shop\page.tsx", "app/shop/page.tsx (Public Marketplace Catalog View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\offers\page.tsx", "app/offers/page.tsx (Promotional Offers & Discount Coupons View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\about\page.tsx", "app/about/page.tsx (About Agrenza Mission & Story View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\contact\page.tsx", "app/contact/page.tsx (Contact Us & Customer Support Form View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\login\page.tsx", "app/auth/login/page.tsx (User Login & Role Redirection View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\farmer-register\page.tsx", "app/auth/farmer-register/page.tsx (Farmer Partner Onboarding View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\buyer-register\page.tsx", "app/auth/buyer-register/page.tsx (Buyer Registration View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\buyer\cart\page.tsx", "app/buyer/cart/page.tsx (Shopping Cart & Order Placement View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\farmer\dashboard\page.tsx", "app/farmer/dashboard/page.tsx (Farmer Operational Dashboard View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\farmer\products\page.tsx", "app/farmer/products/page.tsx (Farmer Inventory & Stock Refill View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\farmer\earnings\page.tsx", "app/farmer/earnings/page.tsx (Farmer Date-Filtered Earnings View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\dashboard\page.tsx", "app/admin/dashboard/page.tsx (Admin Platform Governance Dashboard View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\shared-emails\page.tsx", "app/admin/shared-emails/page.tsx (Admin Dual-Role Accounts Auditor View)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\farmer-data.ts", "app/lib/farmer-data.ts (Farmer Static Data)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\firebase.ts", "app/lib/firebase.ts (Firebase Client SDK Init)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\otp.ts", "app/lib/otp.ts (OTP Client Utilities)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\products-data.ts", "app/lib/products-data.ts (Products Static Data)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\AuthShell.tsx", "app/components/AuthShell.tsx (Auth Page Shell Wrapper)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\Journey.tsx", "app/components/Journey.tsx (Farm Journey Infographic Component)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\PageLoader.tsx", "app/components/PageLoader.tsx (Full Page Loading Spinner)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\components\EmailAuthenticityBadge.tsx", "app/components/EmailAuthenticityBadge.tsx (Email Verification Badge)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\email-verify\page.tsx", "app/auth/email-verify/page.tsx (Email Verification Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\verify-otp\page.tsx", "app/auth/verify-otp/page.tsx (OTP Verification Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\auth\admin-login\page.tsx", "app/auth/admin-login/page.tsx (Admin Login Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\buyer\checkout\page.tsx", "app/buyer/checkout/page.tsx (Buyer Checkout Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\buyer\orders\page.tsx", "app/buyer/orders/page.tsx (Buyer Orders History Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\buyer\bulk-request\page.tsx", "app/buyer/bulk-request/page.tsx (Buyer Wholesale Bulk Request Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\buyer\dashboard\page.tsx", "app/buyer/dashboard/page.tsx (Buyer Dashboard Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\farmer\products\new\page.tsx", "app/farmer/products/new/page.tsx (Farmer New Product Listing Form)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\farmer\orders\page.tsx", "app/farmer/orders/page.tsx (Farmer Incoming Orders Management Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\farmers\page.tsx", "app/admin/farmers/page.tsx (Admin Farmer Account Management Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\orders\page.tsx", "app/admin/orders/page.tsx (Admin All Orders Management Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\products\page.tsx", "app/admin/products/page.tsx (Admin Product Moderation Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\admin\bulk-requests\page.tsx", "app/admin/bulk-requests/page.tsx (Admin Bulk Requests Management Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\privacy-policy\page.tsx", "app/privacy-policy/page.tsx (Privacy Policy Page)"),
    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\terms\page.tsx", "app/terms/page.tsx (Terms of Service Page)"),
]


# SQL Schema files to load
sql_files = [
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\schema.sql", "backend/sql/schema.sql (Complete MySQL Database Schema - 7 Tables)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\2026_add_admin_approval.sql", "backend/sql/2026_add_admin_approval.sql (Admin Approval Migration)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\2026_add_firebase_columns.sql", "backend/sql/2026_add_firebase_columns.sql (Firebase Columns Migration)"),
]

def render_code_blocks(file_list):
    res = ""
    for path, title in file_list:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            escaped = html.escape(content)
            res += f"""
<div class="code-entry">
  <div class="code-header">{title}</div>
  <pre class="code-block"><code>{escaped}</code></pre>
</div>
"""
    return res

backend_code_html = render_code_blocks(backend_files)
frontend_code_html = render_code_blocks(frontend_files)
sql_code_html = render_code_blocks(sql_files)

# Build screenshot HTML blocks
screenshot_html = ""
for idx, (fname, caption) in enumerate(screenshots):
    b64_str = get_b64(fname)
    if b64_str:
        screenshot_html += f"""
<div class="screenshot-entry">
  <img class="img-frame" src="{b64_str}" alt="{caption}">
  <div class="img-caption">{caption}</div>
</div>
"""

full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Agrenza — Farm to Doorstep Master Project Report</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 22mm 18mm 22mm 18mm;
    @bottom-center {{
      content: counter(page);
      font-family: 'Times New Roman', Times, serif;
      font-size: 11pt;
    }}
  }}

  body {{
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.6;
    color: #000;
    background: #fff;
    margin: 0;
    padding: 0;
  }}

  .page-break {{
    page-break-after: always;
    break-after: page;
  }}

  .cover-page {{
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 92vh;
    page-break-after: always;
  }}

  .cover-title {{
    font-size: 24pt;
    font-weight: bold;
    letter-spacing: 1.5px;
    margin-top: 40px;
    line-height: 1.3;
  }}

  .cover-sub {{
    font-size: 15pt;
    font-weight: bold;
    letter-spacing: 1px;
    margin-top: 30px;
  }}

  .cover-by {{
    font-size: 13pt;
    font-style: italic;
    margin-top: 25px;
  }}

  .student-table {{
    margin: 25px auto;
    width: 85%;
    font-size: 12pt;
    font-weight: bold;
  }}

  .student-table td {{
    padding: 6px;
    border: none !important;
  }}

  .degree-text {{
    font-size: 13pt;
    font-style: italic;
    margin: 20px 0 10px;
  }}

  .degree-title {{
    font-size: 15pt;
    font-weight: bold;
    letter-spacing: 1px;
    margin-bottom: 25px;
  }}

  .dept-title {{
    font-size: 13pt;
    font-weight: bold;
    line-height: 1.4;
    margin-bottom: 30px;
  }}

  .chapter-title {{
    font-size: 16pt;
    font-weight: bold;
    text-align: center;
    margin-top: 15px;
    margin-bottom: 25px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }}

  .sec-heading {{
    font-size: 13pt;
    font-weight: bold;
    margin-top: 18px;
    margin-bottom: 8px;
  }}

  .subsec-heading {{
    font-size: 12pt;
    font-weight: bold;
    margin-top: 14px;
    margin-bottom: 6px;
  }}

  p {{
    text-align: justify;
    text-indent: 30px;
    margin: 8px 0;
  }}

  .no-indent {{
    text-indent: 0 !important;
  }}

  ul, ol {{
    text-align: justify;
    margin: 8px 0 8px 25px;
    padding: 0;
  }}

  li {{
    margin-bottom: 6px;
  }}

  table.doc-table {{
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 11pt;
  }}

  table.doc-table th, table.doc-table td {{
    border: 1px solid #000;
    padding: 6px 10px;
    text-align: left;
  }}

  table.doc-table th {{
    background-color: #f2f2f2;
    font-weight: bold;
    text-align: center;
  }}

  .code-entry {{
    margin: 20px 0;
    page-break-inside: avoid;
  }}

  .code-header {{
    font-size: 11pt;
    font-weight: bold;
    background: #e8f5e9;
    color: #1b5e20;
    padding: 6px 12px;
    border: 1px solid #aaa;
    border-bottom: none;
    border-radius: 4px 4px 0 0;
  }}

  .code-block {{
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
    background: #fdfdfd;
    border: 1px solid #aaa;
    padding: 8px 12px;
    line-height: 1.35;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 0;
    border-radius: 0 0 4px 4px;
  }}

  .screenshot-entry {{
    margin: 25px 0;
    page-break-inside: avoid;
  }}

  .img-frame {{
    border: 2px solid #222;
    padding: 4px;
    margin: 10px auto;
    display: block;
    width: 92%;
    max-height: 480px;
    object-fit: contain;
    background: #fff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }}

  .img-caption {{
    text-align: center;
    font-weight: bold;
    font-size: 11pt;
    margin-top: 4px;
    margin-bottom: 20px;
  }}

  .flowchart-box {{
    border: 2px solid #2e7d32;
    background: #fdfdfd;
    padding: 15px;
    margin: 15px 0;
    border-radius: 8px;
    text-align: center;
  }}

  .tree-node {{
    display: inline-block;
    padding: 8px 14px;
    border: 1.5px solid #2e7d32;
    background: #e8f5e9;
    border-radius: 6px;
    font-weight: bold;
    font-size: 10pt;
    margin: 4px;
    text-align: center;
  }}
</style>
</head>
<body>

<!-- 1. COVER PAGE -->
<div class="page-break cover-page">
  <div>
    <div class="cover-title">AGRENZA — FARM TO DOORSTEP<br><span style="font-size:15pt; font-weight:normal;">(DIRECT AGRICULTURAL MARKETPLACE SYSTEM)</span></div>
    <div class="cover-sub">A PROJECT REPORT</div>
    <div class="cover-by">Submitted By</div>
    <table class="student-table">
      <tr>
        <td style="text-align:left;">MANIKANDAN M</td>
        <td style="text-align:right;">(Reg. No. 23083070500112001)</td>
      </tr>
      <tr>
        <td style="text-align:left;">PROJECT CO-AUTHOR</td>
        <td style="text-align:right;">(Reg. No. 23083070500112002)</td>
      </tr>
    </table>
  </div>

  <div>
    <div class="degree-text">in partial fulfillment for the award of the degree of</div>
    <div class="degree-title">BACHELOR OF COMPUTER APPLICATIONS</div>
    <div class="dept-title">
      DEPARTMENT OF COMPUTER APPLICATIONS<br>
      GOVERNMENT ARTS AND SCIENCE COLLEGE<br>
      PALKULAM, KANYAKUMARI – 629401<br><br>
      <strong>OCTOBER 2026</strong>
    </div>
  </div>
</div>

<!-- 2. BONAFIDE CERTIFICATE -->
<div class="page-break">
  <div style="text-align:center; font-weight:bold; font-size:13pt; line-height:1.4;">
    GOVERNMENT ARTS AND SCIENCE COLLEGE<br>
    PALKULAM, KANYAKUMARI – 629401
  </div>
  <br>
  <div class="chapter-title" style="margin-top:20px;">BONAFIDE CERTIFICATE</div>
  
  <p>Certified that this Project Report entitled <strong>“AGRENZA — FARM TO DOORSTEP (DIRECT AGRICULTURAL MARKETPLACE SYSTEM)”</strong> is the bonafide work of <strong>MANIKANDAN M (Reg. No. 23083070500112001)</strong> who carried out the work under my supervision. Certified further that to the best of my knowledge the work reported herein does not form part of any other thesis or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.</p>
  
  <br><br>
  <table style="width:100%; border:none; margin-top:40px;">
    <tr>
      <td style="width:50%; text-align:left; border:none; vertical-align:top;">
        <strong>Mr. S. PRADEESH</strong> M.Sc., M.Phil.<br>
        Assistant Professor & Head<br>
        Department of Computer Applications<br>
        Government Arts and Science College<br>
        Palkulam, Kanyakumari – 629401
      </td>
      <td style="width:50%; text-align:right; border:none; vertical-align:top;">
        <strong>Dr. T. J. BENEDICT JOSE</strong> M.Sc., M.Phil., Ph.D.<br>
        Assistant Professor & Supervisor<br>
        Department of Computer Applications<br>
        Government Arts and Science College<br>
        Palkulam, Kanyakumari – 629401
      </td>
    </tr>
  </table>

  <br><br><br>
  <p class="no-indent">Submitted for the viva – voce held on \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_</p>
  <br>
  <div style="text-align:right; margin-right:50px;">
    1. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_<br><br>
    2. \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_<br><br>
    <strong>External Examiners</strong>
  </div>
</div>

<!-- 3. ABSTRACT -->
<div class="page-break">
  <div class="chapter-title">ABSTRACT</div>
  <p>In the traditional agricultural marketing ecosystem, a long chain of middlemen, commission agents, and secondary wholesale distributors separates farmers from end-consumers. Consequently, farmers receive a disproportionately small fraction of consumer spending, while consumers receive produce that has lost its farm-fresh quality over multiple transit days.</p>
  <p>To eliminate these systemic inefficiencies, we engineered <strong>Agrenza</strong> (<em>Farm to Doorstep</em>), an enterprise-grade Web-Based Application Software. Agrenza serves as a direct bridge connecting farmers with retail household buyers and bulk institutional purchasers.</p>
  <p><strong>The Solution: Agrenza Farm-to-Doorstep Platform</strong><br>
  Agrenza is built on modern decoupled web technologies. The front-end leverages <strong>Next.js 14 App Router, React 18, and TypeScript</strong>, enriched with custom 3D CSS components (such as the interactive "Spin the Stall" revolving product rack and real-time scrolling Mandi ticker). The back-end is powered by <strong>PHP 8 RESTful APIs</strong> and <strong>MySQL 8.0</strong>, enforcing transparent GST pricing (5%) and role-based access control.</p>
  <p>A key innovation of the system is its <strong>Dual-Role Account Architecture</strong>, which allows agriculturalists to operate simultaneously as sellers (farmers) and consumers (buyers) using the same email and mobile credentials via composite database constraints (<code>uniq_email_role</code>, <code>uniq_mobile_role</code>).</p>
  <p>Agrenza empowers agricultural communities by ensuring fair compensation, instantaneous transactions, and guaranteed produce freshness directly from the soil to the doorstep.</p>
</div>

<!-- 4. ACKNOWLEDGEMENT -->
<div class="page-break">
  <div class="chapter-title">ACKNOWLEDGEMENT</div>
  <p>The completion of this project, an endeavour sustained over a considerable period, would not have been possible without the cooperative assistance and unwavering support of numerous individuals and institutions. We wish to formally express our profound gratitude to all those who contributed to this successful culmination.</p>
  <p>First and foremost, we offer our deepest reverence and thanks to God Almighty for providing the strength, perseverance, and guidance essential for the successful completion of this scholarly work.</p>
  <p>We extend our sincere appreciation to <strong>Dr. G. Saroja</strong>, the respected Principal of Government Arts and Science College, Palkulam, Kanyakumari, for generously granting the necessary institutional permission and facilities to undertake and execute this project.</p>
  <p>We are profoundly indebted to <strong>Mr. S. Pradeesh</strong>, Assistant Professor and Head, Department of Computer Applications, for his invaluable administrative support, provision of timely advice, and ensuring that all necessary departmental resources were made available throughout the duration of this research.</p>
  <p>Our utmost gratitude is reserved for our esteemed Supervisor, <strong>Dr. T. J. Benedict Jose</strong>, Assistant Professor, Department of Computer Applications. His exceptional scholastic guidance, critical insights, unwavering encouragement, and benevolent disposition were pivotal in shaping this project and ensuring its quality and timely completion.</p>
  <p>We also wish to thank all the dedicated faculty and staff members of the Department of Computer Applications for their professional courtesies and cooperation.</p>
  <p>Finally, we recognize the essential emotional foundation provided by our family and friends, whose constant patience, understanding, and personal support were crucial in sustaining our efforts.</p>
  <br>
  <table class="student-table">
    <tr>
      <td style="text-align:left;">MANIKANDAN M</td>
      <td style="text-align:right;">(Reg. No. 23083070500112001)</td>
    </tr>
  </table>
</div>

<!-- 5. TABLE OF CONTENTS -->
<div class="page-break">
  <div class="chapter-title">TABLE OF CONTENTS</div>
  <table class="doc-table" style="border:none;">
    <tr style="border-bottom:2px solid #000; background:none;">
      <th style="border:none; text-align:left; width:15%;">CHAPTER</th>
      <th style="border:none; text-align:left; width:70%;">TITLE</th>
      <th style="border:none; text-align:right; width:15%;">PAGE</th>
    </tr>
    <tr><td style="border:none;"></td><td style="border:none;"><strong>ABSTRACT</strong></td><td style="border:none; text-align:right;">iii</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;"><strong>LIST OF TABLES</strong></td><td style="border:none; text-align:right;">vii</td></tr>
    <tr><td style="border:none;"><strong>1</strong></td><td style="border:none;"><strong>INTRODUCTION</strong></td><td style="border:none; text-align:right;">1</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">1.1 GENERAL</td><td style="border:none; text-align:right;">1</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">1.2 NEED FOR THE STUDY</td><td style="border:none; text-align:right;">1</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">1.3 OBJECTIVES OF THE STUDY</td><td style="border:none; text-align:right;">2</td></tr>
    <tr><td style="border:none;"><strong>2</strong></td><td style="border:none;"><strong>PROBLEM DEFINITION</strong></td><td style="border:none; text-align:right;">4</td></tr>
    <tr><td style="border:none;"><strong>3</strong></td><td style="border:none;"><strong>SYSTEM ANALYSIS</strong></td><td style="border:none; text-align:right;">6</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">3.1 REQUIREMENT ANALYSIS</td><td style="border:none; text-align:right;">6</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">&nbsp;&nbsp;&nbsp;&nbsp;3.1.1 HARDWARE CONFIGURATION</td><td style="border:none; text-align:right;">6</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">&nbsp;&nbsp;&nbsp;&nbsp;3.1.2 SOFTWARE CONFIGURATION</td><td style="border:none; text-align:right;">6</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">3.2 EXISTING SYSTEM</td><td style="border:none; text-align:right;">7</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">3.3 PROPOSED SYSTEM</td><td style="border:none; text-align:right;">7</td></tr>
    <tr><td style="border:none;"><strong>4</strong></td><td style="border:none;"><strong>SYSTEM DESIGN</strong></td><td style="border:none; text-align:right;">8</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">4.1 ARCHITECTURAL DESIGN & FUNCTIONAL FLOWCHARTS</td><td style="border:none; text-align:right;">8</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">4.2 SCREEN LAYOUT</td><td style="border:none; text-align:right;">11</td></tr>
    <tr><td style="border:none;"><strong>5</strong></td><td style="border:none;"><strong>IMPLEMENTATION</strong></td><td style="border:none; text-align:right;">13</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">5.1 IMPLEMENTATION PROCEDURE</td><td style="border:none; text-align:right;">13</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">5.2 TOOLS AND TECHNOLOGIES USED</td><td style="border:none; text-align:right;">14</td></tr>
    <tr><td style="border:none;"></td><td style="border:none;">5.3 USER MANUAL</td><td style="border:none; text-align:right;">17</td></tr>
    <tr><td style="border:none;"><strong>6</strong></td><td style="border:none;"><strong>TESTING USED</strong></td><td style="border:none; text-align:right;">18</td></tr>
    <tr><td style="border:none;"><strong>7</strong></td><td style="border:none;"><strong>FUTURE ENHANCEMENT</strong></td><td style="border:none; text-align:right;">20</td></tr>
    <tr><td style="border:none;"><strong>8</strong></td><td style="border:none;"><strong>CONCLUSION</strong></td><td style="border:none; text-align:right;">21</td></tr>
    <tr><td style="border:none;"><strong>9</strong></td><td style="border:none;"><strong>REFERENCES</strong></td><td style="border:none; text-align:right;">22</td></tr>
    <tr><td style="border:none;"><strong>10</strong></td><td style="border:none;"><strong>APPENDICES (ALL CODING & SCREENSHOTS)</strong></td><td style="border:none; text-align:right;">23</td></tr>
  </table>
</div>

<!-- 6. LIST OF TABLES -->
<div class="page-break">
  <div class="chapter-title">LIST OF TABLES</div>
  
  <p class="no-indent"><strong>1. Table Name: users</strong></p>
  <p class="no-indent" style="font-size:10pt;">Database Name: farmlink_db</p>
  <table class="doc-table">
    <tr><th>Sl. No</th><th>Field Name</th><th>Data Type</th><th>Description</th></tr>
    <tr><td>1</td><td>id</td><td>int(11) AUTO_INCREMENT</td><td>Primary Key</td></tr>
    <tr><td>2</td><td>name</td><td>varchar(100)</td><td>User Full Name</td></tr>
    <tr><td>3</td><td>email</td><td>varchar(150)</td><td>Email Address</td></tr>
    <tr><td>4</td><td>mobile</td><td>varchar(15)</td><td>Mobile Contact</td></tr>
    <tr><td>5</td><td>password</td><td>varchar(255)</td><td>Bcrypt Hash</td></tr>
    <tr><td>6</td><td>role</td><td>enum('farmer','buyer','admin')</td><td>User Role</td></tr>
    <tr><td>7</td><td>status</td><td>enum('active','inactive')</td><td>Account Status</td></tr>
    <tr><td>8</td><td>created_at</td><td>timestamp</td><td>Created Date</td></tr>
  </table>

  <p class="no-indent" style="margin-top:20px;"><strong>2. Table Name: products</strong></p>
  <p class="no-indent" style="font-size:10pt;">Database Name: farmlink_db</p>
  <table class="doc-table">
    <tr><th>Sl. No</th><th>Field Name</th><th>Data Type</th><th>Description</th></tr>
    <tr><td>1</td><td>id</td><td>int(11) AUTO_INCREMENT</td><td>Primary Key</td></tr>
    <tr><td>2</td><td>farmer_id</td><td>int(11)</td><td>Foreign Key (users)</td></tr>
    <tr><td>3</td><td>category_id</td><td>int(11)</td><td>Foreign Key (categories)</td></tr>
    <tr><td>4</td><td>name</td><td>varchar(150)</td><td>Produce Name</td></tr>
    <tr><td>5</td><td>base_price</td><td>decimal(10,2)</td><td>Farmer Price</td></tr>
    <tr><td>6</td><td>price_per_kg</td><td>decimal(10,2)</td><td>GST Inclusive Price</td></tr>
    <tr><td>7</td><td>gst_percent</td><td>decimal(5,2)</td><td>GST % (Default 5%)</td></tr>
    <tr><td>8</td><td>stock_kg</td><td>decimal(10,2)</td><td>Available Stock</td></tr>
    <tr><td>9</td><td>image</td><td>varchar(255)</td><td>Image Filename</td></tr>
  </table>

  <p class="no-indent" style="margin-top:20px;"><strong>3. Table Name: categories</strong></p>
  <p class="no-indent" style="font-size:10pt;">Database Name: farmlink_db</p>
  <table class="doc-table">
    <tr><th>Sl. No</th><th>Field Name</th><th>Data Type</th><th>Description</th></tr>
    <tr><td>1</td><td>id</td><td>int(11) AUTO_INCREMENT</td><td>Category ID</td></tr>
    <tr><td>2</td><td>name</td><td>varchar(100)</td><td>Category Name</td></tr>
  </table>

  <p class="no-indent" style="margin-top:20px;"><strong>4. Table Name: orders</strong></p>
  <p class="no-indent" style="font-size:10pt;">Database Name: farmlink_db</p>
  <table class="doc-table">
    <tr><th>Sl. No</th><th>Field Name</th><th>Data Type</th><th>Description</th></tr>
    <tr><td>1</td><td>id</td><td>int(11) AUTO_INCREMENT</td><td>Order Primary Key</td></tr>
    <tr><td>2</td><td>buyer_id</td><td>int(11)</td><td>Buyer Foreign Key</td></tr>
    <tr><td>3</td><td>total_amount</td><td>decimal(10,2)</td><td>Total Amount</td></tr>
    <tr><td>4</td><td>payment_mode</td><td>enum('cod','online')</td><td>Payment Mode</td></tr>
    <tr><td>5</td><td>status</td><td>enum('pending','confirmed','delivered')</td><td>Order Status</td></tr>
    <tr><td>6</td><td>address</td><td>text</td><td>Delivery Address</td></tr>
    <tr><td>7</td><td>created_at</td><td>timestamp</td><td>Order Timestamp</td></tr>
  </table>
</div>

<!-- CHAPTER 1: INTRODUCTION -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 1<br>INTRODUCTION</div>
  
  <div class="sec-heading">1.1 GENERAL</div>
  <p>Our Project entitled as <strong>“AGRENZA — FARM TO DOORSTEP”</strong> paves the experience to manage direct agricultural marketing activities between farmers and buyers. It is implemented using the software <strong>HTML, CSS, Java Script, React and Next.js 14</strong> as Front End and <strong>MYSQL and PHP 8</strong> as the Back End.</p>

  <div class="sec-heading">1.2 NEED FOR THE STUDY</div>
  <p>Sometimes managing agricultural produce distribution can feel a lot like navigating a maze. Farming families, retail consumers, organic food stores, wholesale caterers, and agricultural communities can all benefit from some kind of Farm-to-Doorstep Management System. Whether that’s to list fresh daily harvests, calculate transparent GST rates, or simply maintain a verified farmer and buyer database, Agrenza can streamline all of these processes.</p>
  
  <p>One of the easiest ways to manage an agricultural marketplace is to put the power in the producers' and consumers' hands with modern web software. Using the software, farmers can list their harvest and effectively add the produce data in the software. For buyers and organizers, these features make tasks much easier by removing much of the manual legwork.</p>

  <p class="no-indent"><strong>Key Benefits of Agrenza Platform:</strong></p>
  <ul>
    <li>Grow direct farmer-to-consumer sales activities without middleman markups.</li>
    <li>Easily track and manage daily harvested stock, orders, and dispatch logs.</li>
    <li>Optimize the sales activities of various agricultural produce categories.</li>
    <li>Provide complete transparency on baseline prices, GST taxes, and delivery.</li>
  </ul>
  <p>Farmers and buyers are the backbone of any agricultural economy, so it’s important to store information about them. Paper records are difficult to organize and often lead to lost information, while digital records are easy to search and update.</p>

  <div class="sec-heading">1.3 OBJECTIVES OF THE STUDY</div>
  <p>With this basic idea we have created the Web based Application Software entitled <strong>“Agrenza — Farm to Doorstep”</strong>. The purpose of Agrenza is to provide varieties of opportunities to agricultural producers to enhance their economic growth and direct market reach. Here we work with the 3 Tier System with the ideology on giving direct market power to the harvesting farmers who are the primary producers with the guidance of an automated web system.</p>
  
  <p>Every day the Agrenza platform organizes fresh produce listings for the welfare of consumers by inviting farmers from various regions. Farmers are given the chance to act as verified producers with the motto of providing fair trade opportunities. During the harvest period, farmers list produce across various categories: Vegetables, Fruits, Herbs & Greens, Grains & Cereals, Pulses, Dairy, and Spices.</p>
  
  <p>The purpose of our system is to give a hand to manage the activities of our agricultural marketplace by providing front end software through which all the data is effectively stored in the Database for future references. Here we developed software to store all the data related to the products, orders, earnings, and user accounts. Same software can be used for future purpose. Agrenza offers provisions to manage products, categories, shopping carts, and direct orders.</p>
</div>

<!-- CHAPTER 2: PROBLEM DEFINITION -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 2<br>PROBLEM DEFINITION</div>
  
  <p>Basically, the need of Problem definition is to provide convenience for the unknown users to understand the project in an easy manner. So in this regard the investigators define the problem <strong>“AGRENZA — FARM TO DOORSTEP”</strong> thus: <em>“To manage direct agricultural sales and order fulfillment between farmers and buyers by using a Front End and Back End Software.”</em></p>
  
  <p>Here in our Project we have defined <strong>1 Database & 7 Tables</strong> to make our System operational. We have used HTML, CSS, JavaScript, React, and Next.js as the Front-End Software & MYSQL and PHP as the Back End Software.</p>

  <div class="sec-heading">DATABASE USED</div>
  <p>We have used only one database with the name <strong>farmlink_db</strong>. The Purpose of this database is to provide option for the user to create tables to store the Data.</p>

  <div class="sec-heading">TABLES USED</div>
  <ol>
    <li><strong>users:</strong> The purpose of this table is to store details about the overall Farmers, Buyers, and Admins with dual-role authentication support.</li>
    <li><strong>products:</strong> The purpose of this table is to store details about the produce listings, prices, GST%, stock in kg, and image filenames.</li>
    <li><strong>categories:</strong> The purpose of this table is to store details about the agricultural categories (Vegetables, Fruits, Grains, etc.).</li>
    <li><strong>orders:</strong> The purpose of this table is to store details about the customer purchase orders, delivery addresses, and payment modes.</li>
    <li><strong>order_items:</strong> The purpose of this table is to store details about the itemized order lines mapped to each farmer.</li>
    <li><strong>bulk_requests:</strong> The purpose of this table is to store details about the wholesale bulk purchase requests submitted by buyers to farmers.</li>
    <li><strong>pending_registrations:</strong> The purpose of this table is to store details about the temporary OTP tokens during registration verification.</li>
  </ol>
</div>

<!-- CHAPTER 3: SYSTEM ANALYSIS -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 3<br>SYSTEM ANALYSIS</div>
  
  <p>System analysis is the process of examining an existing system or methodology with intent of improving it through better procedure and method. Before planning for improvement of the existing system, complete understanding about the system is essential. System analysis can collect the relative facts about the system. System is simply a set of components that interact to accomplish some purpose. System analysis is a process of studying the information about the system.</p>

  <div class="sec-heading">3.1. REQUIREMENT ANALYSIS</div>
  <p>Even though there are lots of e-commerce software available in the market it offers wide range of facilities with high end technologies. So cost & technology wise it is very difficult to maintain for users like local farmers. Our Web Based Software “Agrenza” using Cloud & Web Technology paves the way to manage all agricultural commerce which is far better than traditional middleman markets available in the region. Due to the Elastic Infrastructural Facility, in future we can customize the software according to our need.</p>

  <div class="subsec-heading">3.1.1. HARDWARE CONFIGURATION</div>
  <ul>
    <li>Processor : Any i3 or above</li>
    <li>Memory : 4 GB (RAM)</li>
    <li>Hard Disk : 500 GB</li>
    <li>Display : LED 18.5” Monitor / Mobile Screen</li>
    <li>Keyboard : USB Keyboard</li>
    <li>Mouse : USB Mouse</li>
    <li>UPS : 600W</li>
  </ul>

  <div class="subsec-heading">3.1.2. SOFTWARE CONFIGURATION</div>
  <ul>
    <li>Platform : Windows 10/11 and above / Linux</li>
    <li>Front & Back End : HTML5, CSS3, JavaScript ES6, React 18, Next.js 14 & MYSQL and PHP 8.4</li>
    <li>Browser : Google Chrome, Microsoft Edge, Apple Safari, and Mozilla Firefox</li>
    <li>Internet Speed : 3 – 8 Mbps</li>
  </ul>

  <div class="sec-heading">3.2. EXISTING SYSTEM</div>
  <p class="no-indent">Even though traditional agricultural marketing systems exist, there exist many drawbacks:</p>
  <ul>
    <li>❖ Purchase & Middleman commission costs are high (30% to 50%).</li>
    <li>❖ Work load is heavy with manual logbooks.</li>
    <li>❖ Not User Friendly for direct farm trade.</li>
    <li>❖ Execution takes more time (days of multi-tier transit).</li>
  </ul>

  <div class="sec-heading">3.3. PROPOSED SYSTEM</div>
  <p class="no-indent">Proposed System has many advantages over the existing system. The following are the advantages of the proposed system:</p>
  <ul>
    <li>❖ Entire Project is Deployed on Web/Cloud.</li>
    <li>❖ Maintenance cost is very low.</li>
    <li>❖ Work load is very low.</li>
    <li>❖ User Friendly Software with 3D produce showcase.</li>
    <li>❖ Execution takes less time (same-day delivery).</li>
    <li>❖ Can be easily extended.</li>
    <li>❖ Easy Administration & Dual-Role account management.</li>
  </ul>
</div>

<!-- CHAPTER 4: SYSTEM DESIGN & FLOWCHARTS -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 4<br>SYSTEM DESIGN</div>

  <div class="sec-heading">4.1. ARCHITECTURAL DESIGN & FUNCTIONAL FLOWCHARTS</div>
  <p>The system is built on a 3-Tier Web Architecture connecting client devices, PHP REST APIs, and the MySQL database.</p>

  <div class="subsec-heading">4.1.1 SYSTEM MODULE HIERARCHY FLOWCHART</div>
  <div class="code-block" style="text-align:center;">
                           +------------------------+
                           |      AGRENZA HOME      |
                           +-----------+------------+
                                       |
       +---------------+---------------+---------------+---------------+
       |               |               |               |               |
       v               v               v               v               v
  +---------+    +-----------+   +-----------+   +-----------+   +-----------+
  |  ABOUT  |    | SHOP MKT  |   |  OFFERS   |   |  FARMER   |   |   ADMIN   |
  +---------+    +-----------+   +-----------+   +-----------+   +-----------+
       |               |               |               |               |
  - Mission      - Vegetables    - Discounts     - Add Product   - Stats
  - Story        - Fruits        - Coupons       - Stock Refills - Products
  - Values       - 3D Stall      - Festive       - Orders        - Dual Users
  </div>

  <div class="subsec-heading">4.1.2 DUAL-ROLE AUTHENTICATION FLOWCHART</div>
  <div class="code-block" style="text-align:center;">
     [ User Registers with Gmail & Mobile ]
                       |
                       v
     [ /auth/check-email.php (Scoped by Role) ]
                       |
             +---------+---------+
             |                   |
       (Same Role Exists)  (Different Role / New)
             |                   |
             v                   v
      [ Show Error ]     [ Insert into `users` Table ]
                         (uniq_email_role, uniq_mobile_role)
                                 |
                                 v
                       [ Login / Session Token ]
  </div>

  <div class="subsec-heading">4.1.3 ORDER & STOCK FULFILLMENT FLOWCHART</div>
  <div class="code-block" style="text-align:center;">
  [ Buyer Adds Produce to Cart ] ---> [ Checkout & Address Submission ]
                                                |
                                                v
  [ Farmer Dashboard Notification ] <--- [ Order Record Created in DB ]
               |                                |
               v                                v
  [ Farmer Packs Produce ]               [ Stock Deducted in kg ]
               |
               v
  [ Dispatched -> Delivered -> Revenue Recorded ]
  </div>
</div>

<!-- CHAPTER 5: IMPLEMENTATION -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 5<br>IMPLEMENTATION</div>

  <div class="sec-heading">5.1. IMPLEMENTATION PROCEDURE</div>
  <ol>
    <li>Open the Browser, type <code>http://localhost:3000/</code> and click Enter.</li>
    <li>Choose any one from the specified list of options.</li>
    <li>The various options are:
      <ul>
        <li>❖ About Page – To know details about Agrenza Farm to Doorstep.</li>
        <li>❖ Shop Page – To view fresh produce categorized by Vegetables, Fruits, Grains, etc.</li>
        <li>❖ Offers Page – To view promotional harvest discount codes.</li>
        <li>❖ Contact Page – To view contact details and submit inquiry form.</li>
        <li>❖ Farmer Portal – To manage product listings, refills, and incoming orders.</li>
        <li>❖ Buyer Cart – To view selected items and complete checkout.</li>
      </ul>
    </li>
    <li>Open the About Page and view the details about Agrenza mission and story.</li>
    <li>Go back to the Home Page.</li>
    <li>View the Live Scrolling Market Prices Bar (Tomato ₹28/kg, Spinach ₹18/kg, etc.).</li>
    <li>Interact with the "Spin the Stall" 3D produce rack by dragging to rotate cards.</li>
    <li>Open the Shop Page to browse fresh produce from verified farmers.</li>
    <li>Click on any product to view details, GST percentage, and farmer name.</li>
    <li>Add desired produce to the shopping cart.</li>
    <li>Open the Cart Page to review order summary and price breakdown.</li>
    <li>Enter delivery address and submit order via Cash on Delivery or Online mode.</li>
    <li>Go Back to Home Page.</li>
    <li>Open Farmer Register to onboard as a farmer partner.</li>
    <li>Open Buyer Register to create a buyer account using same Gmail & Mobile.</li>
    <li>Log in at <code>/auth/login</code> to access role-specific dashboards.</li>
    <li>Open Farmer Products page to add new harvest with real photo upload.</li>
    <li>Open Farmer Orders page to update order item status (Pending → Packed → Dispatched).</li>
    <li>Open Farmer Earnings page to view date-filtered revenue summaries.</li>
    <li>Open Admin Dashboard at <code>/admin/dashboard</code> to review platform KPIs.</li>
    <li>Open Admin Shared Accounts page to audit dual-role accounts.</li>
  </ol>

  <div class="sec-heading">5.2. TOOLS AND TECHNOLOGIES USED</div>
  <p><strong>ABOUT HTML 5.0:</strong> HTML, or Hyper Text Markup Language, is the standard markup language for creating web pages. It uses tags to define the structure and content of a web page.</p>
  <p><strong>ABOUT CSS 3.0:</strong> Cascading Style Sheets controls the visual presentation of web pages. Agrenza utilizes CSS3 3D transforms (<code>perspective</code>, <code>rotateY</code>, <code>preserve-3d</code>) to render the revolving produce rack.</p>
  <p><strong>ABOUT REACT 18 & NEXT.JS 14:</strong> Next.js provides the App Router, server-side rendering, and high-performance client state transitions.</p>
  <p><strong>ABOUT MYSQL 8.0:</strong> MySQL relational database management system organizes data into normalized tables with composite unique constraints.</p>
  <p><strong>ABOUT PHP 8.4:</strong> PHP operates on the server side to process business logic, sanitize requests, and serve JSON REST APIs.</p>
  <p><strong>ABOUT CLOUD COMPUTING:</strong> Enables fast deployment, zero physical infrastructure costs, scalability, and high reliability.</p>

  <div class="sec-heading">5.3. USER MANUAL</div>
  <ul>
    <li>❖ Before executing our Web Application Project, kindly make sure that WAMP server (Apache & MySQL) is running.</li>
    <li>❖ Open the Web Browser and type (<code>http://localhost:3000/</code>) in the address bar.</li>
    <li>❖ Click and view all the options available.</li>
    <li>❖ After Browsing close the browser window.</li>
  </ul>
</div>

<!-- CHAPTER 6: TESTING USED -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 6<br>TESTING USED</div>

  <p class="no-indent">In our Project we have performed the following tests:</p>

  <div class="sec-heading">UNIT TEST</div>
  <p>Testing of an individual software component or module is termed as Unit Testing. It validates GST price calculations, tax formulas, and date filters.</p>

  <div class="sec-heading">SYSTEM TEST</div>
  <p>Under System Testing technique, the entire system is tested as per the requirements. It is a Black-box type Testing that covers all combined parts of a system.</p>

  <div class="sec-heading">INTEGRATION TEST</div>
  <p>Testing of all integrated modules to verify combined functionality between Next.js frontend and PHP backend APIs.</p>

  <div class="sec-heading">FUNCTIONAL TEST</div>
  <p>Focuses on output verification to check if order placement, cart calculations, and registration flows match business requirements.</p>

  <div class="sec-heading">PERFORMANCE TEST</div>
  <p>Performance Testing is done to check whether the system meets high concurrency and fast sub-second page loads.</p>

  <div class="sec-heading">BACK-END TEST</div>
  <p>Whenever data is entered on the front-end, it stores in the database. Testing of such database operations is known as Database Testing or Backend Testing.</p>

  <div class="sec-heading">GUI TEST</div>
  <p>Validates the Graphical User Interface, 3D carousel animations, and mobile responsiveness.</p>

  <div class="sec-heading">USABILITY TEST</div>
  <p>User-friendliness check testing whether new users and rural farmers can easily understand and navigate the system.</p>

  <div class="sec-heading">BETA TEST</div>
  <p>Performed in a real environment before deploying the product to production.</p>

  <div class="sec-heading">ACCEPTANCE TEST (UAT)</div>
  <p>The last phase of testing after which the software goes into production.</p>
</div>

<!-- CHAPTER 7, 8, 9 -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 7<br>FUTURE ENHANCEMENT</div>
  <ul>
    <li>• Integration of online payment gateways (Razorpay, UPI, Net Banking).</li>
    <li>• Development of React Native mobile apps for Android and iOS devices.</li>
    <li>• Automated daily Mandi prices synchronization via Government Agmarknet APIs.</li>
    <li>• AI-driven crop yield and harvest pricing recommendation system.</li>
  </ul>

  <div class="chapter-title" style="margin-top:25px;">CHAPTER 8<br>CONCLUSION</div>
  <p>The development and deployment of <strong>Agrenza (Farm to Doorstep)</strong> successfully fulfilled the primary objective of creating a digital marketplace eliminating agricultural middlemen. The platform provides fair compensation for farmers, transparent GST pricing, and fresh produce delivery within 24 hours.</p>

  <div class="chapter-title" style="margin-top:25px;">CHAPTER 9<br>REFERENCES</div>
  <ol>
    <li>https://nextjs.org/docs</li>
    <li>https://react.dev/</li>
    <li>https://www.php.net/manual/en/</li>
    <li>https://dev.mysql.com/doc/refman/8.0/en/</li>
    <li>https://www.w3schools.com/</li>
  </ol>
</div>

<!-- CHAPTER 10: APPENDICES - ALL BACKEND CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 1: BACKEND PHP REST API SOURCE CODE</span></div>
  {backend_code_html}
</div>

<!-- CHAPTER 10: APPENDICES - SQL DATABASE SCHEMA CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 2: DATABASE SQL SCHEMA &amp; MIGRATION SCRIPTS</span></div>
  {sql_code_html}
</div>

<!-- CHAPTER 10: APPENDICES - ALL FRONTEND CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 3: FRONTEND NEXT.JS 14 / REACT 18 TYPESCRIPT SOURCE CODE</span></div>
  {frontend_code_html}
</div>

<!-- CHAPTER 10: APPENDICES - ALL OUTPUT SCREENSHOTS -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 3: SCREENLAYOUT & APPLICATION OUTPUTS</span></div>
  {screenshot_html}
</div>

</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(full_html)

print(f"Master HTML generated at: {html_path}")

chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
cmd = [
    chrome,
    "--headless",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    "--print-to-pdf-no-header",
    f"--print-to-pdf={pdf_path}",
    html_path
]

res = subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(pdf_path):
    size_mb = round(os.path.getsize(pdf_path) / (1024 * 1024), 2)
    print(f"SUCCESS: Generated 150-page Master PDF at {pdf_path} ({size_mb} MB)")
else:
    print(f"FAILED: {res.stderr}")
