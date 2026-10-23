import matplotlib.pyplot as plt
import matplotlib.patches as patches

def create_architecture_diagram(output_path):
    fig, ax = plt.subplots(figsize=(10, 5.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Color Palette
    bg_green = '#e8f5e9'
    border_green = '#2e7d32'
    accent_gold = '#d97706'
    blue_box = '#e0f2fe'
    border_blue = '#0284c7'
    purple_box = '#f3e8ff'
    border_purple = '#9333ea'
    orange_box = '#ffedd5'
    border_orange = '#ea580c'

    # Title Banner
    fig.patch.set_facecolor('#ffffff')
    ax.text(50, 94, "AGRENZA — MULTI-TIER CLOUD ARCHITECTURE", fontsize=14, fontweight='bold', ha='center', color='#1b4332')
    ax.text(50, 90, "End-to-End Production System Data Flow & Communications", fontsize=9, ha='center', color='#4b5563')

    # Tier 1: Client Devices
    box1 = patches.FancyBboxPatch((4, 52), 18, 30, boxstyle="round,pad=1.5", facecolor='#f8fafc', edgecolor='#64748b', linewidth=1.5)
    ax.add_patch(box1)
    ax.text(13, 76, "CLIENT TIER", fontsize=10, fontweight='bold', ha='center', color='#1e293b')
    ax.text(13, 70, "Mobile Browser\n& Desktop Web", fontsize=8.5, ha='center', color='#334155')
    ax.text(13, 60, "HTTPS (SSL/TLS)\nResponsive PWA", fontsize=7.5, ha='center', color='#64748b', style='italic')

    # Tier 2: Vercel Frontend
    box2 = patches.FancyBboxPatch((28, 52), 20, 30, boxstyle="round,pad=1.5", facecolor=blue_box, edgecolor=border_blue, linewidth=1.5)
    ax.add_patch(box2)
    ax.text(38, 76, "FRONTEND TIER", fontsize=10, fontweight='bold', ha='center', color='#0369a1')
    ax.text(38, 71, "Vercel Edge Network", fontsize=9, fontweight='bold', ha='center', color='#0f172a')
    ax.text(38, 64, "Next.js 14 App Router\nReact 18 Server/Client\nHTTPS Mail Relay (/api)", fontsize=7.5, ha='center', color='#1e293b')
    ax.text(38, 55, "agrenza.vercel.app", fontsize=7.5, fontweight='bold', ha='center', color='#0284c7')

    # Tier 3: Render Backend
    box3 = patches.FancyBboxPatch((54, 52), 20, 30, boxstyle="round,pad=1.5", facecolor=purple_box, edgecolor=border_purple, linewidth=1.5)
    ax.add_patch(box3)
    ax.text(64, 76, "APPLICATION TIER", fontsize=10, fontweight='bold', ha='center', color='#7e22ce')
    ax.text(64, 71, "Render.com Cloud", fontsize=9, fontweight='bold', ha='center', color='#0f172a')
    ax.text(64, 64, "Dockerized Apache 2.4\nPHP 8.2 Runtime\nRESTful JSON APIs", fontsize=7.5, ha='center', color='#1e293b')
    ax.text(64, 55, "agrenza.onrender.com", fontsize=7.5, fontweight='bold', ha='center', color='#7e22ce')

    # Tier 4: TiDB Cloud Database
    box4 = patches.FancyBboxPatch((79, 52), 17, 30, boxstyle="round,pad=1.5", facecolor=bg_green, edgecolor=border_green, linewidth=1.5)
    ax.add_patch(box4)
    ax.text(87.5, 76, "DATABASE TIER", fontsize=10, fontweight='bold', ha='center', color='#166534')
    ax.text(87.5, 71, "TiDB Cloud Serverless", fontsize=8.5, fontweight='bold', ha='center', color='#0f172a')
    ax.text(87.5, 64, "Distributed MySQL 8.0\nAWS Tokyo Region\nSSL/TLS Port 4000", fontsize=7.5, ha='center', color='#1e293b')
    ax.text(87.5, 55, "agrenza-db Cluster", fontsize=7.5, fontweight='bold', ha='center', color='#166534')

    # Tier 5: External Services (Gmail SMTP)
    box5 = patches.FancyBboxPatch((35, 10), 32, 26, boxstyle="round,pad=1.5", facecolor=orange_box, edgecolor=border_orange, linewidth=1.5)
    ax.add_patch(box5)
    ax.text(51, 30, "MESSAGING & SECURITY TIER", fontsize=9.5, fontweight='bold', ha='center', color='#c2410c')
    ax.text(51, 24, "Google Gmail SMTP & App Passwords", fontsize=8.5, fontweight='bold', ha='center', color='#1e293b')
    ax.text(51, 17, "SSL Port 465 / Vercel HTTPS Relay\n6-Digit OTP & Credentials Attachment", fontsize=7.5, ha='center', color='#475569')

    # Flow Arrows
    arrow_props = dict(arrowstyle="<->", color="#0284c7", lw=1.8, mutation_scale=12)
    ax.annotate("", xy=(28, 67), xytext=(22, 67), arrowprops=arrow_props)
    ax.text(25, 69, "HTTPS", fontsize=6.5, ha='center', color='#0284c7', fontweight='bold')

    arrow_props2 = dict(arrowstyle="<->", color="#7e22ce", lw=1.8, mutation_scale=12)
    ax.annotate("", xy=(54, 67), xytext=(48, 67), arrowprops=arrow_props2)
    ax.text(51, 69, "JSON/CORS", fontsize=6.5, ha='center', color='#7e22ce', fontweight='bold')

    arrow_props3 = dict(arrowstyle="<->", color="#166534", lw=1.8, mutation_scale=12)
    ax.annotate("", xy=(79, 67), xytext=(74, 67), arrowprops=arrow_props3)
    ax.text(76.5, 69, "SSL 4000", fontsize=6.5, ha='center', color='#166534', fontweight='bold')

    # Email Relay Arrow
    arrow_mail1 = dict(arrowstyle="->", color="#ea580c", lw=1.5, ls='--', mutation_scale=10)
    ax.annotate("", xy=(46, 36), xytext=(40, 52), arrowprops=arrow_mail1)
    ax.text(39, 43, "Mail Relay", fontsize=6.5, ha='right', color='#ea580c', fontweight='bold')

    arrow_mail2 = dict(arrowstyle="->", color="#ea580c", lw=1.5, ls='--', mutation_scale=10)
    ax.annotate("", xy=(60, 36), xytext=(62, 52), arrowprops=arrow_mail2)
    ax.text(64, 43, "SMTP Trigger", fontsize=6.5, ha='left', color='#ea580c', fontweight='bold')

    arrow_mail3 = dict(arrowstyle="->", color="#ea580c", lw=1.5, ls=':', mutation_scale=10)
    ax.annotate("", xy=(16, 52), xytext=(35, 23), arrowprops=arrow_mail3)
    ax.text(22, 32, "Delivery to Inbox", fontsize=6.5, ha='center', color='#ea580c', fontweight='bold')

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def create_registration_flowchart(output_path):
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    fig.patch.set_facecolor('#ffffff')
    ax.text(50, 92, "AGRENZA — USER REGISTRATION & EMAIL VERIFICATION WORKFLOW", fontsize=12, fontweight='bold', ha='center', color='#1b4332')

    steps = [
        ("1. Input", "User Enters\nName, Mobile,\nGmail, Aadhaar", "#f8fafc", "#64748b"),
        ("2. Validation", "Format Check,\nMX Lookup,\nDuplicate Test", "#e0f2fe", "#0284c7"),
        ("3. Staging", "Saved in\npending_reg\nTable", "#f3e8ff", "#9333ea"),
        ("4. Security", "Auto-Generate\nPassword &\n6-Digit OTP", "#fef3c7", "#d97706"),
        ("5. Dispatch", "HTTPS Relay /\nGmail SMTP\nwith TXT file", "#ffedd5", "#ea580c"),
        ("6. Verify", "User enters OTP\nor clicks Link\n-> Activated!", "#dcfce7", "#16a34a"),
    ]

    start_x = 3
    box_w = 13.5
    gap = 2.8

    for i, (title, desc, bg, border) in enumerate(steps):
        x = start_x + i * (box_w + gap)
        box = patches.FancyBboxPatch((x, 22), box_w, 55, boxstyle="round,pad=1.2", facecolor=bg, edgecolor=border, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + box_w/2, 68, title, fontsize=9, fontweight='bold', ha='center', color=border)
        ax.text(x + box_w/2, 45, desc, fontsize=7.5, ha='center', color='#1e293b')

        if i < len(steps) - 1:
            arrow = patches.FancyArrowPatch((x + box_w + 0.3, 49), (x + box_w + gap - 0.3, 49),
                                           arrowstyle="->", color="#94a3b8", mutation_scale=10, lw=1.5)
            ax.add_patch(arrow)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def create_order_flowchart(output_path):
    fig, ax = plt.subplots(figsize=(10, 4.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    fig.patch.set_facecolor('#ffffff')
    ax.text(50, 92, "AGRENZA — ORDER LIFECYCLE & HYPERLOCAL DELIVERY WORKFLOW", fontsize=12, fontweight='bold', ha='center', color='#1b4332')

    steps = [
        ("1. Browse", "Explore Fresh\nProduce by\nCategory", "#f8fafc", "#64748b"),
        ("2. Add to Cart", "Select Qty,\nView GST & Total\nPrice", "#e0f2fe", "#0284c7"),
        ("3. Checkout", "Address Check:\nPincodes 629001\n& 629401 Only", "#fef3c7", "#d97706"),
        ("4. Placement", "Atomic Transaction:\norders +\norder_items", "#f3e8ff", "#9333ea"),
        ("5. Inventory", "Immediate Stock\nDeduction in\nTiDB Database", "#ffedd5", "#ea580c"),
        ("6. Fulfilled", "Farmer Notified\n& Doorstep Delivery\nInitiated", "#dcfce7", "#16a34a"),
    ]

    start_x = 3
    box_w = 13.5
    gap = 2.8

    for i, (title, desc, bg, border) in enumerate(steps):
        x = start_x + i * (box_w + gap)
        box = patches.FancyBboxPatch((x, 22), box_w, 55, boxstyle="round,pad=1.2", facecolor=bg, edgecolor=border, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + box_w/2, 68, title, fontsize=9, fontweight='bold', ha='center', color=border)
        ax.text(x + box_w/2, 45, desc, fontsize=7.5, ha='center', color='#1e293b')

        if i < len(steps) - 1:
            arrow = patches.FancyArrowPatch((x + box_w + 0.3, 49), (x + box_w + gap - 0.3, 49),
                                           arrowstyle="->", color="#94a3b8", mutation_scale=10, lw=1.5)
            ax.add_patch(arrow)

    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    create_architecture_diagram('c:/wamp64/www/farmlink/diagram_cloud_architecture.png')
    create_registration_flowchart('c:/wamp64/www/farmlink/diagram_registration_workflow.png')
    create_order_flowchart('c:/wamp64/www/farmlink/diagram_order_workflow.png')
    print("All 3 workflow diagrams successfully created!")
