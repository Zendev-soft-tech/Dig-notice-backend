from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import LongTable, Paragraph, SimpleDocTemplate, Spacer, TableStyle


def heading(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["Heading2"])


def subheading(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["Heading3"])


def bullet(text: str, styles) -> Paragraph:
    return Paragraph(f"- {text}", styles["BodyText"])


def paragraph(text: str, styles) -> Paragraph:
    return Paragraph(text, styles["BodyText"])


def table_cell(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def make_wrapped_table(data, col_widths, cell_style):
    wrapped_data = []
    for row in data:
        wrapped_row = [table_cell(str(cell), cell_style) for cell in row]
        wrapped_data.append(wrapped_row)
    return LongTable(
        wrapped_data,
        colWidths=col_widths,
        repeatRows=1,
        splitByRow=1,
    )


def build_manual(output_path: Path) -> None:
    styles = getSampleStyleSheet()
    styles["BodyText"].fontName = "Helvetica"
    styles["BodyText"].fontSize = 10
    styles["BodyText"].leading = 14

    styles["Heading1"].fontName = "Helvetica-Bold"
    styles["Heading1"].fontSize = 20
    styles["Heading1"].spaceAfter = 8

    styles["Heading2"].fontName = "Helvetica-Bold"
    styles["Heading2"].fontSize = 14
    styles["Heading2"].spaceBefore = 10
    styles["Heading2"].spaceAfter = 6

    styles["Heading3"].fontName = "Helvetica-Bold"
    styles["Heading3"].fontSize = 11
    styles["Heading3"].spaceBefore = 8
    styles["Heading3"].spaceAfter = 4

    small = ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#4B5563"),
    )
    table_text = ParagraphStyle(
        "TableText",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        wordWrap="CJK",
    )
    table_head = ParagraphStyle(
        "TableHead",
        parent=table_text,
        fontName="Helvetica-Bold",
    )

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=16 * mm,
        bottomMargin=16 * mm,
        title="DIG Notice System User Manual",
        author="System Generated (ReportLab)",
    )

    story = []
    generated_on = datetime.now().strftime("%Y-%m-%d %H:%M")

    story.append(Paragraph("DIG Notice Board System", styles["Heading1"]))
    story.append(Paragraph("Full Workflow User Manual", styles["Heading2"]))
    story.append(Paragraph(f"Generated with ReportLab on {generated_on}", small))
    story.append(Spacer(1, 8))

    story.append(heading("1. System Overview", styles))
    story.append(
        paragraph(
            "DIG Notice Board is a role-based notice management platform with a React frontend and an Express/TypeScript backend. "
            "Users authenticate first, then access dashboards and features based on their role (admin, staff, or student). "
            "The backend exposes API modules for authentication, users, and notices, while PostgreSQL stores persistent data.",
            styles,
        )
    )

    story.append(heading("2. Architecture at a Glance", styles))
    architecture_table_data = [
            [
                table_cell("Layer", table_head),
                table_cell("Technology", table_head),
                table_cell("Responsibilities", table_head),
            ],
            [
                "Frontend",
                "React + React Router + Axios + React Query",
                "Login flows, role-based navigation, notice/user screens, profile actions, API calls",
            ],
            [
                "Backend",
                "Node.js + Express + TypeScript",
                "Routing, authentication, authorization, use-case execution, controller responses",
            ],
            [
                "Domain/Application",
                "Use-case classes + repository contracts",
                "Core business logic for auth, users, and notices",
            ],
            [
                "Data Layer",
                "TypeORM + PostgreSQL",
                "Persist users/notices, query/filter records, enforce DB constraints",
            ],
            [
                "File Handling",
                "Multer + static /uploads",
                "Accept and serve notice PDF attachments",
            ],
            [
                "Notifications",
                "Nodemailer + OTP store",
                "Forgot-password OTP generation/verification via email",
            ],
        ]
    architecture_table = make_wrapped_table(
        architecture_table_data,
        col_widths=[34 * mm, 50 * mm, 88 * mm],
        cell_style=table_text,
    )
    architecture_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9CA3AF")),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(architecture_table)
    story.append(Spacer(1, 6))

    story.append(heading("3. Roles and Access Model", styles))
    story.append(subheading("Admin", styles))
    for item in [
        "Accesses admin dashboard, profile, users, and notices modules.",
        "Can create, edit, view, delete users and bulk-create users.",
        "Can create/update/delete notices, but update/delete is creator-bound per controller checks.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Staff", styles))
    for item in [
        "Accesses staff dashboard, profile, and notices views.",
        "Can create notices and manage only notices created by that staff user.",
        "Cannot access user-management endpoints.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Student", styles))
    for item in [
        "Accesses student dashboard (notice browsing) and profile.",
        "Can read notices, departments, and notice types after authentication.",
        "Cannot create or manage notices/users.",
    ]:
        story.append(bullet(item, styles))

    story.append(heading("4. End-to-End Workflow (Start to Finish)", styles))
    story.append(subheading("Step 1 - User opens application", styles))
    story.append(
        paragraph(
            "The frontend root route redirects users to login. No protected page is accessible without a valid authentication state.",
            styles,
        )
    )
    story.append(subheading("Step 2 - Login request", styles))
    for item in [
        "User submits credentials on the login page.",
        "Frontend sends POST /api/auth/login.",
        "Backend validates credentials, signs JWT, and returns user profile + token.",
        "Frontend stores token in localStorage as auth_token and navigates based on role.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Step 3 - Protected navigation and session use", styles))
    for item in [
        "Protected route checks isAuthenticated and role compatibility.",
        "Axios request interceptor injects Authorization: Bearer <token> into API requests.",
        "If role is not allowed for a page, user is redirected to their own role home.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Step 4 - Backend request lifecycle", styles))
    for item in [
        "Express receives request and routes to auth/users/notices modules.",
        "authMiddleware verifies JWT and attaches decoded user payload to req.user.",
        "roleMiddleware enforces route role constraints where required.",
        "Controller invokes use-case class, which calls repository implementation.",
        "Repository runs TypeORM operations against PostgreSQL entities.",
        "Response returns standardized JSON: success (ok=true) or failure (ok=false).",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Step 5 - Notice lifecycle", styles))
    for item in [
        "Browse notices: authenticated users call GET /api/notices with optional filters.",
        "Create notice: admin/staff submit form (with optional PDF) to POST /api/notices.",
        "Upload validation allows PDF only and saves file under /uploads.",
        "Update/delete notice: admin/staff must also be creator of that notice record.",
        "Students consume notices read-only through list/search/filter actions.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Step 6 - User management lifecycle (Admin)", styles))
    for item in [
        "Admin lists users and opens view/edit dialogs.",
        "Admin can create one user or perform bulk user creation.",
        "Admin can update user profile fields or remove users.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Step 7 - Password recovery workflow", styles))
    for item in [
        "User starts forgot-password by email.",
        "Backend generates OTP and sends it via email service.",
        "User verifies OTP, then submits new password.",
        "Backend updates password if OTP/session checks pass.",
    ]:
        story.append(bullet(item, styles))

    story.append(heading("5. Frontend Workflow by Module", styles))
    story.append(subheading("Authentication Screens", styles))
    for item in [
        "Login, forgot password, OTP verification, and update password are public pages.",
        "Successful login redirects to /admin, /staff, or /student based on backend user role.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Admin Module", styles))
    for item in [
        "Dashboard shows system-level metrics and quick overview components.",
        "Users section handles create/view/edit/delete and bulk operations.",
        "Notices section supports CRUD and attachment handling.",
        "Profile section enables account updates and password change.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Staff Module", styles))
    for item in [
        "Staff can review notices and maintain only self-created notice entries.",
        "Creation/edit actions enforce backend creator ownership checks.",
    ]:
        story.append(bullet(item, styles))
    story.append(subheading("Student Module", styles))
    for item in [
        "Students browse and search notices by available metadata.",
        "Students can open attached PDFs and manage their own profile/password.",
    ]:
        story.append(bullet(item, styles))

    story.append(heading("6. API Surface Used by Frontend", styles))
    api_table_data = [
            [
                table_cell("Module", table_head),
                table_cell("Representative Endpoints", table_head),
                table_cell("Purpose", table_head),
            ],
            ["Auth", "/auth/login, /auth/forgot-password, /auth/verify-otp, /auth/update-password, /auth/change-password", "Authentication and credential management"],
            ["Users", "/users, /users/:id, /users/bulk, /users/profile", "User administration and profile operations"],
            ["Notices", "/notices, /notices/my-notices, /notices/departments, /notices/types, /notices/:id", "Notice listing, filtering, and CRUD"],
        ]
    api_table = make_wrapped_table(
        api_table_data,
        col_widths=[24 * mm, 92 * mm, 56 * mm],
        cell_style=table_text,
    )
    api_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#9CA3AF")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(api_table)

    story.append(heading("7. Operational Notes and Known Caveats", styles))
    for item in [
        "OTP store is in-memory; OTP state is lost on restart and not shared across multiple instances.",
        "Validation is partially manual in controllers/forms; behavior may differ by screen/endpoint.",
        "Backend duplicate-key database errors are mapped to conflict responses; other unknown errors return generic server errors.",
        "The backend currently uses TypeORM synchronize mode, which is convenient in development but should be controlled for production migrations.",
        "Frontend includes both API-driven state and local context patterns; maintainers should align these for long-term consistency.",
    ]:
        story.append(bullet(item, styles))

    story.append(heading("8. Recommended Daily Operating Flow", styles))
    for item in [
        "Admin verifies active notices and user changes at start of day.",
        "Staff publish departmental/semester notices and attach PDFs where needed.",
        "Students log in, filter notices by department/semester/type, and open relevant attachments.",
        "All users update profile details and passwords through profile workflows.",
    ]:
        story.append(bullet(item, styles))

    story.append(Spacer(1, 8))
    story.append(Paragraph("End of manual.", small))

    doc.build(story)


if __name__ == "__main__":
    output_file = Path(__file__).resolve().parent / "DIG_Notice_Full_Workflow_User_Manual.pdf"
    build_manual(output_file)
    print(f"Generated: {output_file}")
