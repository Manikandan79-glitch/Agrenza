import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def style_table_header(row, col_widths, titles):
    for i, cell in enumerate(row.cells):
        cell.width = col_widths[i]
        set_cell_background(cell, "1B3821")  # Dark forest green
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(titles[i])
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(255, 255, 255)

def add_table_data(table, data, col_widths):
    for r_idx, row_data in enumerate(data):
        row = table.add_row()
        bg_hex = "F8FAF8" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths[c_idx]
            set_cell_background(cell, bg_hex)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            if c_idx in [0, 2, 3]:
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            run = p.add_run(str(val))
            run.font.name = "Arial"
            run.font.size = Pt(8.5)
            if c_idx == 0:
                run.bold = True
                run.font.color.rgb = RGBColor(27, 56, 33)
            elif c_idx == 3 and val in ["PK", "FK", "UNI"]:
                run.bold = True
                run.font.color.rgb = RGBColor(180, 83, 9)

doc = docx.Document()

# Page Margins: 1 inch everywhere
for section in doc.sections:
    section.top_margin = Inches(0.8)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.8)
    section.right_margin = Inches(0.8)

# Title Header
p_title = doc.add_paragraph()
p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_title.paragraph_format.space_before = Pt(0)
p_title.paragraph_format.space_after = Pt(4)
r_title = p_title.add_run("AGRENZA — FARM TO DOORSTEP")
r_title.bold = True
r_title.font.name = "Arial"
r_title.font.size = Pt(18)
r_title.font.color.rgb = RGBColor(27, 56, 33)

p_sub = doc.add_paragraph()
p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_sub.paragraph_format.space_before = Pt(0)
p_sub.paragraph_format.space_after = Pt(2)
r_sub = p_sub.add_run("Direct Agricultural Marketplace System")
r_sub.font.name = "Arial"
r_sub.font.size = Pt(12)
r_sub.font.color.rgb = RGBColor(76, 122, 61)

p_doc = doc.add_paragraph()
p_doc.alignment = WD_ALIGN_PARAGRAPH.CENTER
p_doc.paragraph_format.space_before = Pt(2)
p_doc.paragraph_format.space_after = Pt(16)
r_doc = p_doc.add_run("DATABASE SCHEMA SPECIFICATION — ALL SEVEN TABLES")
r_doc.bold = True
r_doc.font.name = "Arial"
r_doc.font.size = Pt(13)
r_doc.font.color.rgb = RGBColor(30, 41, 59)

# Project Metadata Box
p_meta = doc.add_paragraph()
p_meta.paragraph_format.space_before = Pt(0)
p_meta.paragraph_format.space_after = Pt(14)
r_meta = p_meta.add_run(
    "Project: Agrenza (FarmLink)   |   Database Engine: MySQL 8.0+ / InnoDB   |   Charset: utf8mb4_unicode_ci\n"
    "Candidate: MANIKANDAN M (Reg. No. 23083070500112001)   |   Degree: Bachelor of Computer Applications\n"
    "College: Government Arts and Science College, Palkulam, Kanyakumari – 629401"
)
r_meta.font.name = "Arial"
r_meta.font.size = Pt(9)
r_meta.font.italic = True
r_meta.font.color.rgb = RGBColor(100, 116, 139)

# Section 1: Summary Table
h1 = doc.add_heading(level=1)
h1.paragraph_format.space_before = Pt(12)
h1.paragraph_format.space_after = Pt(6)
r_h1 = h1.add_run("1. Master Overview of Seven Project Tables")
r_h1.font.name = "Arial"
r_h1.font.size = Pt(13)
r_h1.font.color.rgb = RGBColor(27, 56, 33)

summary_headers = ["#", "Table Name", "Primary Key", "Foreign Keys", "Description & Purpose"]
summary_widths = [Inches(0.4), Inches(1.5), Inches(0.9), Inches(1.6), Inches(2.5)]

summary_data = [
    ["1", "users", "id", "None", "Core user accounts across Buyer, Farmer, and Admin roles with verification."],
    ["2", "pending_registrations", "id", "None", "Staging table for pending email/OTP verification before official account activation."],
    ["3", "categories", "id", "None", "Master classification for agricultural harvest (Vegetables, Fruits, Grains, etc.)."],
    ["4", "products", "id", "farmer_id, category_id", "Farmer produce catalog including GST, commission rates, and inventory stock."],
    ["5", "orders", "id", "buyer_id", "Master customer purchase orders with payment mode and delivery address."],
    ["6", "order_items", "id", "order_id, product_id, farmer_id", "Line-item breakdown per farmer with item status tracking."],
    ["7", "bulk_requests", "id", "buyer_id, product_id", "Wholesale volume inquiries submitted by institutional buyers."]
]

t_sum = doc.add_table(rows=1, cols=5)
t_sum.alignment = WD_TABLE_ALIGNMENT.CENTER
style_table_header(t_sum.rows[0], summary_widths, summary_headers)
add_table_data(t_sum, summary_data, summary_widths)

doc.add_paragraph().paragraph_format.space_after = Pt(12)

# Section 2: Detailed Table Definitions
tables_detail = [
    {
        "num": "2.1",
        "name": "users",
        "desc": "Stores platform accounts for Buyers, Farmers, and Administrators with authentication and status attributes.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Unique user primary key ID"],
            ["name", "VARCHAR(100)", "NO", "-", "-", "Full legal / contact name"],
            ["mobile", "VARCHAR(10)", "NO", "UNI", "-", "10-digit primary mobile number"],
            ["email", "VARCHAR(150)", "YES", "UNI", "NULL", "User Gmail address (role-scoped)"],
            ["password", "VARCHAR(255)", "NO", "-", "-", "Bcrypt hashed login password"],
            ["firebase_uid", "VARCHAR(128)", "YES", "UNI", "NULL", "Firebase auth sync UID"],
            ["aadhaar", "VARCHAR(20)", "YES", "-", "NULL", "12-digit Aadhaar (farmers only)"],
            ["role", "ENUM('buyer','farmer','admin')", "NO", "-", "'buyer'", "User authorization role"],
            ["is_verified", "TINYINT(1)", "NO", "-", "0", "Account verification indicator"],
            ["email_verified", "TINYINT(1)", "NO", "-", "0", "Direct email confirmation status"],
            ["status", "ENUM('pending','approved','rejected')", "NO", "-", "'approved'", "Farmer approval status (Admin managed)"],
            ["admin_remark", "VARCHAR(255)", "YES", "-", "NULL", "Notes / reasons on account moderation"],
            ["created_at", "TIMESTAMP", "NO", "-", "CURRENT_TIME", "Timestamp of initial account registration"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    mobile          VARCHAR(10)     NOT NULL,
    email           VARCHAR(150)    NULL,
    password        VARCHAR(255)    NOT NULL,
    firebase_uid    VARCHAR(128)    NULL DEFAULT NULL,
    aadhaar         VARCHAR(20)     NULL,
    role            ENUM('buyer','farmer','admin') NOT NULL DEFAULT 'buyer',
    is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
    email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'approved',
    admin_remark    VARCHAR(255)    NULL DEFAULT NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uniq_mobile (mobile),
    UNIQUE KEY uniq_email (email),
    UNIQUE KEY uniq_firebase_uid (firebase_uid)
) ENGINE=InnoDB;"""
    },
    {
        "num": "2.2",
        "name": "pending_registrations",
        "desc": "Staging buffer holding registration submissions until email OTP/token confirmation completes.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Staging auto-increment ID"],
            ["name", "VARCHAR(100)", "NO", "-", "-", "Full applicant name"],
            ["mobile", "VARCHAR(10)", "NO", "IDX", "-", "Mobile number to be verified"],
            ["email", "VARCHAR(150)", "NO", "IDX", "-", "Email address for OTP delivery"],
            ["password_hash", "VARCHAR(255)", "NO", "-", "-", "Bcrypt hash of auto/chosen password"],
            ["auto_password", "VARCHAR(50)", "YES", "-", "NULL", "System-generated login password"],
            ["role", "ENUM('buyer','farmer')", "NO", "-", "-", "Target registration role"],
            ["aadhaar", "VARCHAR(20)", "YES", "-", "NULL", "Aadhaar number if registering as farmer"],
            ["token", "VARCHAR(64)", "NO", "UNI", "-", "48-hex email verification link token"],
            ["otp_code", "VARCHAR(6)", "NO", "IDX", "-", "6-digit numeric verification OTP"],
            ["status", "ENUM('pending','verified','expired')", "NO", "-", "'pending'", "Lifecycle state of pending record"],
            ["created_at", "TIMESTAMP", "NO", "-", "CURRENT_TIME", "Creation timestamp of verification request"],
            ["expires_at", "TIMESTAMP", "NO", "-", "-", "Expiration timestamp (24-hour validity)"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS pending_registrations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    mobile          VARCHAR(10)     NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    auto_password   VARCHAR(50)     NULL,
    role            ENUM('buyer','farmer') NOT NULL,
    aadhaar         VARCHAR(20)     NULL,
    token           VARCHAR(64)     NOT NULL UNIQUE,
    otp_code        VARCHAR(6)      NOT NULL,
    status          ENUM('pending','verified','expired') NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP       NOT NULL,
    INDEX (email), INDEX (mobile), INDEX (token), INDEX (otp_code)
) ENGINE=InnoDB;"""
    },
    {
        "num": "2.3",
        "name": "categories",
        "desc": "Master table defining produce classifications used for navigation, filtering, and catalog display.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Unique category primary key ID"],
            ["name", "VARCHAR(100)", "NO", "UNI", "-", "Category name (Vegetables, Fruits, Grains, etc.)"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS categories (
    id      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

INSERT INTO categories (name) VALUES
    ('Vegetables'), ('Fruits'), ('Grains'), ('Dairy'), ('Spices')
ON DUPLICATE KEY UPDATE name = VALUES(name);"""
    },
    {
        "num": "2.4",
        "name": "products",
        "desc": "Farmer harvest inventory listings with pricing breakdown, tax calculation, and admin moderation.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Unique product catalog ID"],
            ["farmer_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing users(id)"],
            ["category_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing categories(id)"],
            ["name", "VARCHAR(150)", "NO", "-", "-", "Produce name (e.g., Vine Tomatoes, Ooty Carrot)"],
            ["base_price", "DECIMAL(10,2)", "NO", "-", "0.00", "Base farmer payout price per kg"],
            ["price_per_kg", "DECIMAL(10,2)", "NO", "-", "-", "Final retail listing price per kg"],
            ["gst_percent", "DECIMAL(5,2)", "NO", "-", "5.00", "Applicable GST rate percentage"],
            ["gst_amount", "DECIMAL(10,2)", "NO", "-", "0.00", "Calculated GST component per kg"],
            ["commission_percent", "DECIMAL(5,2)", "NO", "-", "5.00", "Agrenza platform maintenance fee %"],
            ["commission_amount", "DECIMAL(10,2)", "NO", "-", "0.00", "Platform commission per kg"],
            ["stock_kg", "DECIMAL(10,2)", "NO", "-", "0.00", "Available stock balance in kilograms"],
            ["image", "VARCHAR(255)", "YES", "-", "NULL", "Stored image relative path / filename"],
            ["description", "TEXT", "YES", "-", "NULL", "Organic certification & harvest details"],
            ["status", "ENUM('active','inactive')", "NO", "-", "'active'", "Farmer active/inactive toggle"],
            ["approval_status", "ENUM('pending','approved','rejected')", "NO", "-", "'pending'", "Admin approval state"],
            ["admin_remark", "VARCHAR(255)", "YES", "-", "NULL", "Admin review observations"],
            ["created_at", "TIMESTAMP", "NO", "-", "CURRENT_TIME", "Product listing creation timestamp"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS products (
    id                 INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    farmer_id          INT UNSIGNED NOT NULL,
    category_id        INT UNSIGNED NOT NULL,
    name               VARCHAR(150) NOT NULL,
    base_price         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    price_per_kg       DECIMAL(10,2) NOT NULL,
    gst_percent        DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    gst_amount         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00,
    commission_amount  DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stock_kg           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    image              VARCHAR(255) NULL,
    description        TEXT NULL,
    status             ENUM('active','inactive') NOT NULL DEFAULT 'active',
    approval_status    ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    admin_remark       VARCHAR(255) NULL DEFAULT NULL,
    created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_farmer   FOREIGN KEY (farmer_id)   REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB;"""
    },
    {
        "num": "2.5",
        "name": "orders",
        "desc": "Master order transactions created by buyers, capturing recipient location and payment method.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Master purchase order ID"],
            ["buyer_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing users(id)"],
            ["total_amount", "DECIMAL(10,2)", "NO", "-", "0.00", "Total order gross invoice value"],
            ["payment_mode", "ENUM('cod','online')", "NO", "-", "'cod'", "Payment method (COD / Online / UPI)"],
            ["address", "TEXT", "NO", "-", "-", "Doorstep delivery address (PIN: 629001/629401)"],
            ["status", "VARCHAR(30)", "NO", "-", "'placed'", "Overall order processing status"],
            ["created_at", "TIMESTAMP", "NO", "-", "CURRENT_TIME", "Order timestamp"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS orders (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id        INT UNSIGNED NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_mode    ENUM('cod','online') NOT NULL DEFAULT 'cod',
    address         TEXT NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'placed',
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;"""
    },
    {
        "num": "2.6",
        "name": "order_items",
        "desc": "Individual line-items mapping each product to its respective farmer with independent fulfillment status.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Unique line-item primary ID"],
            ["order_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing orders(id)"],
            ["product_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing products(id)"],
            ["farmer_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing users(id)"],
            ["quantity_kg", "DECIMAL(10,2)", "NO", "-", "-", "Ordered quantity in kilograms"],
            ["price_per_kg", "DECIMAL(10,2)", "NO", "-", "-", "Agreed price per kg at purchase time"],
            ["subtotal", "DECIMAL(10,2)", "NO", "-", "-", "Line total (quantity_kg * price_per_kg)"],
            ["item_status", "ENUM('pending','confirmed','shipped','delivered','cancelled')", "NO", "-", "'pending'", "Farmer dispatch & delivery tracking"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS order_items (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        INT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED NOT NULL,
    farmer_id       INT UNSIGNED NOT NULL,
    quantity_kg     DECIMAL(10,2) NOT NULL,
    price_per_kg    DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL,
    item_status     ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',

    CONSTRAINT fk_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    CONSTRAINT fk_items_farmer  FOREIGN KEY (farmer_id)  REFERENCES users(id)    ON DELETE RESTRICT
) ENGINE=InnoDB;"""
    },
    {
        "num": "2.7",
        "name": "bulk_requests",
        "desc": "Wholesale quotation requests placed by commercial buyers with custom quantities and admin moderation.",
        "headers": ["Field", "Type", "Null", "Key", "Default", "Description"],
        "widths": [Inches(1.2), Inches(1.2), Inches(0.6), Inches(0.6), Inches(1.0), Inches(2.3)],
        "cols": [
            ["id", "INT UNSIGNED", "NO", "PK", "AUTO_INC", "Unique bulk request record ID"],
            ["buyer_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing users(id)"],
            ["product_id", "INT UNSIGNED", "NO", "FK", "-", "Foreign key referencing products(id)"],
            ["quantity_kg", "DECIMAL(10,2)", "NO", "-", "-", "Requested volume in kilograms"],
            ["reason", "TEXT", "NO", "-", "-", "Wholesale business justification"],
            ["status", "ENUM('pending','approved','rejected')", "NO", "-", "'pending'", "Administrative review status"],
            ["remark", "TEXT", "YES", "-", "NULL", "Pricing quotation or rejection feedback"],
            ["created_at", "TIMESTAMP", "NO", "-", "CURRENT_TIME", "Request submission timestamp"]
        ],
        "sql": """CREATE TABLE IF NOT EXISTS bulk_requests (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    buyer_id        INT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED NOT NULL,
    quantity_kg     DECIMAL(10,2) NOT NULL,
    reason          TEXT NOT NULL,
    status          ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    remark          TEXT NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bulk_buyer   FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_bulk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;"""
    }
]

for t in tables_detail:
    h2 = doc.add_heading(level=2)
    h2.paragraph_format.space_before = Pt(14)
    h2.paragraph_format.space_after = Pt(2)
    r_h2 = h2.add_run(f"Table {t['num']}: {t['name']}")
    r_h2.font.name = "Arial"
    r_h2.font.size = Pt(12)
    r_h2.font.color.rgb = RGBColor(27, 56, 33)

    p_desc = doc.add_paragraph()
    p_desc.paragraph_format.space_before = Pt(0)
    p_desc.paragraph_format.space_after = Pt(6)
    r_d = p_desc.add_run(f"Description: {t['desc']}")
    r_d.font.name = "Arial"
    r_d.font.size = Pt(9.5)
    r_d.font.italic = True
    r_d.font.color.rgb = RGBColor(71, 85, 105)

    table = doc.add_table(rows=1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    style_table_header(table.rows[0], t["widths"], t["headers"])
    add_table_data(table, t["cols"], t["widths"])

    p_sql_lbl = doc.add_paragraph()
    p_sql_lbl.paragraph_format.space_before = Pt(8)
    p_sql_lbl.paragraph_format.space_after = Pt(2)
    r_sl = p_sql_lbl.add_run("MySQL DDL Code:")
    r_sl.bold = True
    r_sl.font.name = "Arial"
    r_sl.font.size = Pt(9)
    r_sl.font.color.rgb = RGBColor(27, 56, 33)

    # SQL Box as a single-cell shaded table
    box = doc.add_table(rows=1, cols=1)
    box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = box.rows[0].cells[0]
    c.width = Inches(6.9)
    set_cell_background(c, "F1F5F9")
    set_cell_margins(c, top=80, bottom=80, left=120, right=120)
    p_code = c.paragraphs[0]
    p_code.paragraph_format.space_before = Pt(0)
    p_code.paragraph_format.space_after = Pt(0)
    r_code = p_code.add_run(t["sql"])
    r_code.font.name = "Consolas"
    r_code.font.size = Pt(8)
    r_code.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

out_path = r"C:\wamp64\www\farmlink\Agrenza_Database_Seven_Tables.docx"
doc.save(out_path)
print(f"SUCCESS: Document generated at {out_path}")
