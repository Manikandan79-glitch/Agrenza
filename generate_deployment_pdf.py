import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Suppress header/footer on cover
            return
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#4b5563"))
        
        # Running Header
        self.drawString(40, 805, "AGRENZA — Farm-to-Doorstep Marketplace | Cloud Deployment & Workflow Guide")
        self.setStrokeColor(colors.HexColor("#d1d5db"))
        self.setLineWidth(0.5)
        self.line(40, 798, 555, 798)
        
        # Running Footer
        self.line(40, 45, 555, 45)
        self.drawString(40, 32, "Confidential & Academic Reference | Dept. of Computer Applications (BCA)")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(555, 32, page_str)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=55,
        bottomMargin=55
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor("#1b4332")     # Deep Forest Green
    c_secondary = colors.HexColor("#2d6a4f")   # Forest Green
    c_gold = colors.HexColor("#d97706")        # Turmeric Gold
    c_dark = colors.HexColor("#111827")        # Dark slate text
    c_light_bg = colors.HexColor("#f8fafc")    # Light slate grey
    c_border = colors.HexColor("#e2e8f0")
    c_accent_bg = colors.HexColor("#ecfdf5")   # Very light mint
    c_code_bg = colors.HexColor("#1e293b")     # Dark slate for code
    
    # Custom Typography Styles
    title_style = ParagraphStyle(
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=30,
        textColor=c_primary,
        alignment=1, # Center
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=c_gold,
        alignment=1,
    )
    
    meta_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=c_dark,
        alignment=1,
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=c_secondary,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=13,
        textColor=c_dark,
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'BulletItem',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=c_dark,
        leftIndent=14,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=c_primary,
    )

    caption_style = ParagraphStyle(
        'CaptionText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
        alignment=1, # Center
        spaceAfter=8,
    )

    code_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor("#f8fafc"),
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=c_dark
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.2,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ==================== COVER PAGE ====================
    story.append(Spacer(1, 35))
    story.append(Paragraph("PROJECT AGRENZA (FARMLINK)", subtitle_style))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Complete Cloud Deployment Guide & Workflow Architecture", title_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="60%", thickness=2.5, color=c_gold, spaceAfter=18, spaceBefore=10))
    
    meta_text = """
    <b>Candidate:</b> MANIKANDAN M (Register No: 23083070500112001)<br/>
    <b>Degree:</b> Bachelor of Computer Applications (BCA) — Final Year Project<br/>
    <b>Institution:</b> Government Arts and Science College, Palkulam, Kanyakumari – 629401<br/>
    <b>Affiliated to:</b> Manonmaniam Sundaranar University, Tirunelveli<br/>
    <b>Publication Date:</b> October 2026 | Production Build Version 1.0.0
    """
    story.append(Paragraph(meta_text, meta_style))
    story.append(Spacer(1, 25))

    # Architecture Overview Summary Box on Cover
    summary_html = """
    <b>SYSTEM PRODUCTION ARCHITECTURE SUMMARY:</b><br/>
    • <b>Global Edge Frontend:</b> Next.js 14 App Router on Vercel CDN (<i>https://agrenza.vercel.app</i>)<br/>
    • <b>Containerized Backend:</b> Apache PHP 8.2 REST API on Render.com (<i>https://agrenza.onrender.com</i>)<br/>
    • <b>Distributed Database:</b> TiDB Cloud Serverless MySQL 8.0 Wire-Compatible Cluster<br/>
    • <b>Authentication & Mailer:</b> Dual SSL Gmail SMTP on Port 465 & HTTPS Mail Relay on Vercel<br/>
    • <b>Source Control & CI/CD:</b> GitHub Auto-Deployment Pipeline (<i>Manikandan79-glitch/Agrenza</i>)
    """
    summary_table = Table(
        [[Paragraph(summary_html, callout_style)]],
        colWidths=[515]
    )
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_accent_bg),
        ('BOX', (0,0), (-1,-1), 1.2, c_secondary),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    story.append(summary_table)

    story.append(Spacer(1, 25))

    # Quick Reference Table
    ref_data = [
        [Paragraph("Tier Component", table_header), Paragraph("Technology", table_header), Paragraph("Provider", table_header), Paragraph("Live Production Endpoint / Host", table_header)],
        [Paragraph("Frontend UI", table_cell), Paragraph("Next.js 14 (React 18 + TS)", table_cell), Paragraph("Vercel", table_cell), Paragraph("https://agrenza.vercel.app", table_cell)],
        [Paragraph("Backend REST API", table_cell), Paragraph("PHP 8.2 + Apache Docker", table_cell), Paragraph("Render.com", table_cell), Paragraph("https://agrenza.onrender.com", table_cell)],
        [Paragraph("Relational DB", table_cell), Paragraph("MySQL 8.0 Protocol", table_cell), Paragraph("TiDB Cloud", table_cell), Paragraph("gateway01.ap-northeast-1.prod.aws.tidbcloud.com:4000", table_cell)],
        [Paragraph("Code Repository", table_cell), Paragraph("Git Version Control", table_cell), Paragraph("GitHub", table_cell), Paragraph("github.com/Manikandan79-glitch/Agrenza", table_cell)],
        [Paragraph("Transactional Mail", table_cell), Paragraph("SMTP SSL 465 / HTTPS Relay", table_cell), Paragraph("Google Gmail", table_cell), Paragraph("smtp.gmail.com (ravananm913@gmail.com)", table_cell)],
    ]
    t_ref = Table(ref_data, colWidths=[95, 115, 75, 230])
    t_ref.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
    ]))
    story.append(t_ref)

    story.append(PageBreak())

    # ==================== SECTION 1 & SYSTEM ARCHITECTURE DIAGRAM ====================
    story.append(Paragraph("1. Executive Architecture & Multi-Tier Cloud Workflow", h1_style))
    story.append(Paragraph(
        "Agrenza adopts an enterprise-grade <b>Decoupled Headless Multi-Tier Cloud Architecture</b>. "
        "The diagram below illustrates the complete production communication flow across all tiers:",
        body_style
    ))
    
    arch_img_path = r"c:\wamp64\www\farmlink\diagram_cloud_architecture.png"
    if os.path.exists(arch_img_path):
        story.append(Image(arch_img_path, width=515, height=283))
        story.append(Paragraph("Figure 1.1: Production Cloud Architecture & Real-Time Data Flow", caption_style))

    story.append(Paragraph("Key Architectural Advantages:", h2_style))
    story.append(Paragraph("• <b>Headless Decoupling:</b> Frontend (Next.js 14) and Backend (PHP 8.2) scale independently with zero server affinity.", bullet_style))
    story.append(Paragraph("• <b>Serverless Cloud Database:</b> TiDB Cloud MySQL provides instant autoscaling, daily automated snapshots, and strict TLS encryption.", bullet_style))
    story.append(Paragraph("• <b>HTTPS Mail Relay:</b> Bypasses cloud SMTP port blocks (ports 25, 465, 587) via Vercel-hosted serverless email relay for 100% reliable mobile registration.", bullet_style))
    story.append(Paragraph("• <b>Zero-Cost Academic Infrastructure:</b> 100% free-tier deployment adhering to university evaluation standards.", bullet_style))

    story.append(PageBreak())

    # ==================== SECTION 2: DATABASE TIER ====================
    story.append(Paragraph("2. Tier 1: Cloud MySQL Database (TiDB Cloud Serverless)", h1_style))
    story.append(Paragraph(
        "Relational data persistence was migrated from a local WAMP MySQL engine to <b>TiDB Cloud Serverless</b>, "
        "an enterprise-grade distributed SQL database supporting native MySQL 8.0 wire compatibility and SSL/TLS encryption.",
        body_style
    ))

    db_info_data = [
        [Paragraph("Parameter", table_header), Paragraph("Production Value", table_header), Paragraph("Description", table_header)],
        [Paragraph("Host / Endpoint", table_cell), Paragraph("gateway01.ap-northeast-1.prod.aws.tidbcloud.com", table_cell), Paragraph("AWS Tokyo High-Availability Cluster Gateway", table_cell)],
        [Paragraph("Port", table_cell), Paragraph("4000", table_cell), Paragraph("Dedicated TiDB MySQL connection port", table_cell)],
        [Paragraph("Database Name", table_cell), Paragraph("farmlink", table_cell), Paragraph("Production database catalog", table_cell)],
        [Paragraph("User", table_cell), Paragraph("8nQ2NS6oZwxnCRL.root", table_cell), Paragraph("Cloud administrator username", table_cell)],
        [Paragraph("SSL Mode", table_cell), Paragraph("REQUIRED (MYSQLI_CLIENT_SSL)", table_cell), Paragraph("Mandatory TLS in-transit encryption", table_cell)],
        [Paragraph("Storage Quota", table_cell), Paragraph("5 GiB Row-Based Storage (Free)", table_cell), Paragraph("Permanent academic free tier allocation", table_cell)],
    ]
    t_db = Table(db_info_data, colWidths=[110, 205, 200])
    t_db.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_secondary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
    ]))
    story.append(t_db)

    story.append(Spacer(1, 8))
    story.append(Paragraph("The Seven Core Tables in the Schema:", h2_style))
    
    tables_desc = [
        [Paragraph("Table Name", table_header), Paragraph("Primary Key", table_header), Paragraph("Key Foreign Keys", table_header), Paragraph("Purpose / Business Logic", table_header)],
        [Paragraph("users", table_cell), Paragraph("id (INT)", table_cell), Paragraph("None", table_cell), Paragraph("Stores Admin, Farmers, and Buyers with roles, bcrypt passwords & status.", table_cell)],
        [Paragraph("categories", table_cell), Paragraph("id (INT)", table_cell), Paragraph("None", table_cell), Paragraph("Product categories (Vegetables, Fruits, Herbs, Spices, Dairy).", table_cell)],
        [Paragraph("products", table_cell), Paragraph("id (INT)", table_cell), Paragraph("farmer_id, category_id", table_cell), Paragraph("Item listings with base_price, GST, commission, stock_kg & approval.", table_cell)],
        [Paragraph("orders", table_cell), Paragraph("id (INT)", table_cell), Paragraph("buyer_id -> users(id)", table_cell), Paragraph("Customer orders, delivery address, payment mode, status & total.", table_cell)],
        [Paragraph("order_items", table_cell), Paragraph("id (INT)", table_cell), Paragraph("order_id, product_id, farmer_id", table_cell), Paragraph("Line-item breakdown tracking farmer payouts and platform cuts.", table_cell)],
        [Paragraph("bulk_requests", table_cell), Paragraph("id (INT)", table_cell), Paragraph("buyer_id, product_id", table_cell), Paragraph("Wholesale bulk purchase requests (15kg+) requiring admin review.", table_cell)],
        [Paragraph("pending_registrations", table_cell), Paragraph("id (INT)", table_cell), Paragraph("None", table_cell), Paragraph("Staging table holding unverified registrations until OTP validation.", table_cell)],
    ]
    t_schemas = Table(tables_desc, colWidths=[95, 60, 130, 230])
    t_schemas.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
    ]))
    story.append(t_schemas)

    story.append(PageBreak())

    # ==================== SECTION 3: BACKEND API & REGISTRATION WORKFLOW ====================
    story.append(Paragraph("3. Tier 2: Backend REST API & Authentication Workflow", h1_style))
    story.append(Paragraph(
        "The PHP API backend is packaged as an immutable Docker container deployed on <b>Render.com Web Services</b>. "
        "The workflow diagram below details the 6-step registration and email verification process:",
        body_style
    ))

    reg_img_path = r"c:\wamp64\www\farmlink\diagram_registration_workflow.png"
    if os.path.exists(reg_img_path):
        story.append(Image(reg_img_path, width=515, height=216))
        story.append(Paragraph("Figure 3.1: User Registration, OTP Generation & Email Verification Workflow", caption_style))

    story.append(Paragraph("Critical Architectural Fixes Applied in Backend:", h2_style))
    story.append(Paragraph("• <b>Cloud SSL Driver Integration:</b> <code>db.php</code> utilizes <code>mysqli_init()</code> and <code>mysqli_ssl_set()</code> to mandate TLS on port 4000.", bullet_style))
    story.append(Paragraph("• <b>CORS Configuration:</b> <code>_bootstrap.php</code> matches origin against <code>*.vercel.app</code> and responds with credentials support.", bullet_style))
    story.append(Paragraph("• <b>Dual Mail Dispatch Architecture:</b> Dispatches emails via Vercel HTTPS Relay (bypassing Render cloud port blocks) with direct Gmail SMTP port 465 fallback.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Domain Resolution:</b> Email verification links automatically generate with <code>https://agrenza.vercel.app</code> when accessed on mobile.", bullet_style))

    story.append(PageBreak())

    # ==================== SECTION 4: FRONTEND TIER & ORDER WORKFLOW ====================
    story.append(Paragraph("4. Tier 3: Frontend Deployment & Hyperlocal Order Workflow", h1_style))
    story.append(Paragraph(
        "The Next.js 14 client application is deployed onto <b>Vercel's Global Edge Network</b>. "
        "The workflow diagram below illustrates the order placement and inventory deduction pipeline:",
        body_style
    ))

    ord_img_path = r"c:\wamp64\www\farmlink\diagram_order_workflow.png"
    if os.path.exists(ord_img_path):
        story.append(Image(ord_img_path, width=515, height=216))
        story.append(Paragraph("Figure 4.1: Order Placement, Hyperlocal Verification & Fulfillment Workflow", caption_style))

    story.append(Paragraph("Deployment Configuration Steps:", h2_style))
    story.append(Paragraph("1. <b>GitHub Import:</b> Connected repository <code>Manikandan79-glitch/Agrenza</code> to Vercel with automatic CI/CD triggers on push.", bullet_style))
    story.append(Paragraph("2. <b>Root Directory Alignment:</b> Explicitly configured the project Root Directory to <code>farmlink-nextjs</code>.", bullet_style))
    story.append(Paragraph("3. <b>Build Pre-Verification:</b> Resolved strict TypeScript compilation constraints in <code>bulk-request/page.tsx</code> ensuring zero type errors.", bullet_style))
    story.append(Paragraph("4. <b>Hyperlocal Delivery Enforcement:</b> Checkout validates delivery addresses strictly to Kanyakumari district pincodes <b>629001</b> and <b>629401</b>.", bullet_style))

    story.append(PageBreak())

    # ==================== SECTION 5: LIVE FEATURES & ADMIN PORTAL ====================
    story.append(Paragraph("5. Live Production Features & Testing Guide", h1_style))
    story.append(Paragraph(
        "All features have been tested on both mobile smartphones and desktop browsers interacting with the live cloud database over HTTPS.",
        body_style
    ))

    features_data = [
        [Paragraph("Feature / Route", table_header), Paragraph("Target Role", table_header), Paragraph("Functionality in Production", table_header)],
        [Paragraph("/shop", table_cell), Paragraph("Public / Buyer", table_cell), Paragraph("Real-time vegetable & fruit catalogue with GST-inclusive pricing and stock count.", table_cell)],
        [Paragraph("/buyer/checkout", table_cell), Paragraph("Buyer", table_cell), Paragraph("Locked to Kanyakumari district; accepts only pincodes 629001 and 629401.", table_cell)],
        [Paragraph("/admin/farmers", table_cell), Paragraph("Admin", table_cell), Paragraph("Displays all approved and pending farmers, Aadhaar records, and total sales.", table_cell)],
        [Paragraph("/admin/buyers", table_cell), Paragraph("Admin", table_cell), Paragraph("NEW: Comprehensive customer table showing phone, email, orders count, and spent.", table_cell)],
        [Paragraph("/admin/orders", table_cell), Paragraph("Admin", table_cell), Paragraph("Order management workflow with real-time status transitions (Pending -> Delivered).", table_cell)],
        [Paragraph("/buyer/bulk-request", table_cell), Paragraph("Buyer", table_cell), Paragraph("Dynamic wholesale request form for quantities >= 15kg with live price calculator.", table_cell)],
    ]
    t_feat = Table(features_data, colWidths=[120, 80, 315])
    t_feat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), c_primary),
        ('GRID', (0,0), (-1,-1), 0.5, c_border),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, c_light_bg]),
    ]))
    story.append(t_feat)

    story.append(Spacer(1, 10))
    story.append(Paragraph("Live Production Credentials for Mobile Viva Demonstration:", h2_style))
    story.append(Paragraph("• <b>Super Administrator:</b> URL: <code>https://agrenza.vercel.app/admin/admin-login</code> | User: <code>admin@farmlink.com</code> | Password: <code>admin123</code>", bullet_style))
    story.append(Paragraph("• <b>Farmer Portal:</b> User: <code>sathishm250406@gmail.com</code> | Password: <code>FdXxs#43</code> | Access: <code>/farmer/dashboard</code>", bullet_style))
    story.append(Paragraph("• <b>Buyer Self-Registration:</b> Visit <code>/auth/buyer-register</code> on mobile to verify instant Gmail OTP delivery and auto-generated login credentials.", bullet_style))

    story.append(PageBreak())

    # ==================== SECTION 6: VIVA QUESTIONS & DECLARATION ====================
    story.append(Paragraph("6. Frequently Asked Viva Questions & Model Answers", h1_style))
    
    viva_q1 = """<b>Q1: Why did you decouple Next.js and PHP into separate cloud hosts instead of using a single server?</b><br/>
    <b>Answer:</b> Next.js performs optimal server-side rendering and static page generation on Vercel's global CDN edge nodes, resulting in sub-second page loads globally. Conversely, our existing backend leverages PHP PDO and Apache modules for MySQL interactions and mail dispatch. Decoupling allows each tier to operate on its specialized runtime without complex hybrid server configurations."""
    story.append(Paragraph(viva_q1, body_style))
    story.append(Spacer(1, 4))

    viva_q2 = """<b>Q2: How do you handle Cross-Origin Resource Sharing (CORS) and session persistence between Vercel and Render?</b><br/>
    <b>Answer:</b> The frontend (agrenza.vercel.app) and backend (agrenza.onrender.com) reside on distinct origins. In <code>_bootstrap.php</code>, we dynamically match the origin header against allowed patterns and respond with <code>Access-Control-Allow-Origin</code> and <code>Access-Control-Allow-Credentials: true</code>. Crucially, session cookies are configured with <code>SameSite=None; Secure</code> to ensure modern mobile browsers transmit authentication cookies across distinct domains."""
    story.append(Paragraph(viva_q2, body_style))
    story.append(Spacer(1, 4))

    viva_q3 = """<b>Q3: How does the system handle email delivery in cloud environments where SMTP ports are blocked?</b><br/>
    <b>Answer:</b> Render's free tier blocks outbound ports 25, 465, and 587. To solve this, Agrenza implements a dual-mode dispatch architecture: the PHP backend calls a secure HTTPS relay endpoint hosted on Vercel Serverless (<code>/api/send-mail</code>) over port 443 (which is never blocked), which then delivers the email using Google's SMTP servers over TLS."""
    story.append(Paragraph(viva_q3, body_style))
    story.append(Spacer(1, 4))

    viva_q4 = """<b>Q4: How does the system guarantee database security when connecting to TiDB Cloud over the public internet?</b><br/>
    <b>Answer:</b> Plaintext database traffic is strictly forbidden. The connection invokes <code>mysqli_ssl_set()</code> with the <code>MYSQLI_CLIENT_SSL</code> flag, enforcing TLS 1.3 encryption for all SQL queries and result sets in transit between Render.com and the AWS Tokyo cluster gateway."""
    story.append(Paragraph(viva_q4, body_style))

    story.append(Spacer(1, 15))
    story.append(HRFlowable(width="100%", thickness=1, color=c_gold, spaceAfter=12, spaceBefore=5))

    footer_note = """
    <b>DECLARATION:</b> This documentation reflects the true production architecture of the Agrenza Agricultural Marketplace system as implemented for the BCA degree evaluation at Government Arts and Science College, Palkulam. All services are currently live and verifiable via any web browser.
    """
    story.append(Paragraph(footer_note, meta_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF Successfully Generated: {filename}")

if __name__ == "__main__":
    out_path = r"c:\wamp64\www\farmlink\Agrenza_Cloud_Deployment_Guide.pdf"
    build_pdf(out_path)
