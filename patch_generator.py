import os

GEN = r"C:\wamp64\www\farmlink\generate_master_150_pages_pdf.py"

with open(GEN, "r", encoding="utf-8") as f:
    content = f.read()

# ── 1. Extra backend files to insert before the closing ] of backend_files ──
EXTRA_BACKEND = r"""    (r"C:\wamp64\www\farmlink\farmlink\backend\config\firebase-config.php", "backend/config/firebase-config.php (Firebase Admin SDK Configuration)"),
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
"""

# ── 2. Extra frontend files to insert before the closing ] of frontend_files ──
EXTRA_FRONTEND = r"""    (r"C:\wamp64\www\farmlink\farmlink-nextjs\app\lib\farmer-data.ts", "app/lib/farmer-data.ts (Farmer Static Data)"),
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
"""

# ── 3. SQL files section to insert before render_code_blocks ──
SQL_SECTION = r"""
# SQL Schema files to load
sql_files = [
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\schema.sql", "backend/sql/schema.sql (Complete MySQL Database Schema - 7 Tables)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\2026_add_admin_approval.sql", "backend/sql/2026_add_admin_approval.sql (Admin Approval Migration)"),
    (r"C:\wamp64\www\farmlink\farmlink\backend\sql\2026_add_firebase_columns.sql", "backend/sql/2026_add_firebase_columns.sql (Firebase Columns Migration)"),
]

"""

# ── Apply patch 1: insert extra backend before "]" that closes backend_files ──
# The closing bracket line is: "\n]\n\n# Frontend files to load"
OLD_BACKEND_CLOSE = "]\n\n# Frontend files to load"
NEW_BACKEND_CLOSE = EXTRA_BACKEND + "]\n\n# Frontend files to load"

if OLD_BACKEND_CLOSE in content:
    content = content.replace(OLD_BACKEND_CLOSE, NEW_BACKEND_CLOSE, 1)
    print("OK: backend_files extended")
else:
    print("ERROR: Could not find backend_files closing bracket")

# ── Apply patch 2: insert extra frontend before "]" that closes frontend_files ──
# The closing bracket: "]\n\ndef render_code_blocks"
OLD_FRONTEND_CLOSE = "]\n\ndef render_code_blocks"
NEW_FRONTEND_CLOSE = EXTRA_FRONTEND + "]\n\n" + SQL_SECTION + "def render_code_blocks"

if OLD_FRONTEND_CLOSE in content:
    content = content.replace(OLD_FRONTEND_CLOSE, NEW_FRONTEND_CLOSE, 1)
    print("OK: frontend_files extended + sql_files added")
else:
    print("ERROR: Could not find frontend_files closing bracket")

# ── Apply patch 3: add sql_code_html generation after frontend_code_html ──
OLD_RENDER = "backend_code_html = render_code_blocks(backend_files)\nfrontend_code_html = render_code_blocks(frontend_files)"
NEW_RENDER = "backend_code_html = render_code_blocks(backend_files)\nfrontend_code_html = render_code_blocks(frontend_files)\nsql_code_html = render_code_blocks(sql_files)"

if OLD_RENDER in content:
    content = content.replace(OLD_RENDER, NEW_RENDER, 1)
    print("OK: sql_code_html render call added")
else:
    print("ERROR: Could not find render calls")

# ── Apply patch 4: add SQL section in HTML between backend and frontend code chapters ──
OLD_SECTION = """<!-- CHAPTER 10: APPENDICES - ALL FRONTEND CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 2: FRONTEND NEXT.JS 14 / REACT 18 TYPESCRIPT SOURCE CODE</span></div>
  {frontend_code_html}
</div>"""

NEW_SECTION = """<!-- CHAPTER 10: APPENDICES - SQL DATABASE SCHEMA CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 2: DATABASE SQL SCHEMA &amp; MIGRATION SCRIPTS</span></div>
  {sql_code_html}
</div>

<!-- CHAPTER 10: APPENDICES - ALL FRONTEND CODE -->
<div class="page-break">
  <div class="chapter-title">CHAPTER 10: APPENDICES<br><span style="font-size:13pt;">SECTION 3: FRONTEND NEXT.JS 14 / REACT 18 TYPESCRIPT SOURCE CODE</span></div>
  {frontend_code_html}
</div>"""

if OLD_SECTION in content:
    content = content.replace(OLD_SECTION, NEW_SECTION, 1)
    print("OK: SQL HTML section inserted")
else:
    print("ERROR: Could not find frontend HTML section to insert SQL before it")
    # Try to find a nearby match
    idx = content.find("SECTION 2: FRONTEND NEXT.JS")
    print(f"  Searched for SECTION 2 at index: {idx}")

# ── Also fix the screenshot section number from SECTION 3 to SECTION 4 ──
content = content.replace(
    "SECTION 3: SCREENLAYOUT &amp; APPLICATION OUTPUTS",
    "SECTION 4: SCREENLAYOUT &amp; APPLICATION OUTPUTS"
)

with open(GEN, "w", encoding="utf-8") as f:
    f.write(content)

print("\nPatch complete. Generator rewritten.")
print(f"File size: {os.path.getsize(GEN)} bytes")
