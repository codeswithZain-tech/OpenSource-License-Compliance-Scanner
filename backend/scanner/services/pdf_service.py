"""
PDF SERVICE - License Scan Report Generator
"""

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.pdfgen import canvas
from datetime import datetime
import os

class PDFService:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Create custom styles for PDF"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1E3A5F'),
            spaceAfter=30,
            alignment=1  # Center
        ))
        
        self.styles.add(ParagraphStyle(
            name='CustomHeading',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#2563EB'),
            spaceBefore=20,
            spaceAfter=10
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskLow',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#10B981'),
            fontSize=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskHigh',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#EF4444'),
            fontSize=12
        ))
        
        self.styles.add(ParagraphStyle(
            name='RiskMedium',
            parent=self.styles['Normal'],
            textColor=colors.HexColor('#F59E0B'),
            fontSize=12
        ))
    
    def generate_report(self, scan_data, output_path=None):
        """
        Generate PDF report from scan data
        
        Args:
            scan_data: Dictionary containing scan results
            output_path: Path to save PDF (optional)
        
        Returns:
            Bytes of PDF file
        """
        if output_path is None:
            output_path = os.path.join('media', 'reports', f"license_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Story (content) list
        story = []
        
        # ========== HEADER / TITLE ==========
        title = Paragraph("License Compliance Report", self.styles['CustomTitle'])
        story.append(title)
        
        # Date and Time
        date_str = datetime.now().strftime("%B %d, %Y at %I:%M %p")
        date_para = Paragraph(f"Generated on: {date_str}", self.styles['Normal'])
        story.append(date_para)
        story.append(Spacer(1, 0.2 * inch))
        
        # ========== REPOSITORY INFO ==========
        story.append(Paragraph("📦 Repository Information", self.styles['CustomHeading']))
        
        repo_data = [
            ["Repository URL:", scan_data.get('repo_url', 'N/A')],
            ["Repository Name:", scan_data.get('repo_name', 'N/A')],
            ["Scan Date:", date_str]
        ]
        
        repo_table = Table(repo_data, colWidths=[1.5 * inch, 4 * inch])
        repo_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4B5563')),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(repo_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # ========== LICENSE INFORMATION ==========
        story.append(Paragraph("📜 License Information", self.styles['CustomHeading']))
        
        license_info = scan_data.get('license', {})
        
        # Risk level styling
        risk_level = license_info.get('risk', 'MEDIUM')
        if risk_level == 'LOW':
            risk_style = 'RiskLow'
            risk_icon = '🟢'
        elif risk_level == 'HIGH':
            risk_style = 'RiskHigh'
            risk_icon = '🔴'
        else:
            risk_style = 'RiskMedium'
            risk_icon = '🟡'
        
        license_table_data = [
            ["License Name:", license_info.get('name', 'Not Found')],
            ["SPDX ID:", license_info.get('key', 'N/A')],
            ["Category:", license_info.get('category', 'Unknown')],
            ["Risk Level:", f"{risk_icon} {risk_level}"],
            ["Description:", license_info.get('description', 'N/A')]
        ]
        
        license_table = Table(license_table_data, colWidths=[1.5 * inch, 4 * inch])
        license_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4B5563')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(license_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # ========== PERMISSIONS TABLE ==========
        story.append(Paragraph("🔓 Permissions & Requirements", self.styles['CustomHeading']))
        
        can_commercial = license_info.get('can_commercial', 'Unknown')
        can_modify = license_info.get('can_modify', 'Unknown')
        can_distribute = license_info.get('can_distribute', 'Unknown')
        requires_attribution = license_info.get('requires_attribution', 'Unknown')
        requires_open_source = license_info.get('requires_open_source', False)
        
        permissions_data = [
            ["Commercial Use:", "✅ Allowed" if can_commercial == True else "❌ Not Allowed" if can_commercial == False else "⚠️ Unknown"],
            ["Modification:", "✅ Allowed" if can_modify == True else "❌ Not Allowed" if can_modify == False else "⚠️ Unknown"],
            ["Distribution:", "✅ Allowed" if can_distribute == True else "❌ Not Allowed" if can_distribute == False else "⚠️ Unknown"],
            ["Attribution Required:", "✅ Yes" if requires_attribution == True else "❌ No" if requires_attribution == False else "⚠️ Unknown"],
            ["Open Source Required:", "✅ Yes" if requires_open_source == True else "❌ No" if requires_open_source == False else "⚠️ Unknown"]
        ]
        
        permissions_table = Table(permissions_data, colWidths=[2 * inch, 3.5 * inch])
        permissions_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#4B5563')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(permissions_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # ========== RECOMMENDATIONS ==========
        story.append(Paragraph("💡 Recommendations", self.styles['CustomHeading']))
        
        recommendation = scan_data.get('recommendation', 'No specific recommendations available.')
        rec_para = Paragraph(recommendation, self.styles['Normal'])
        story.append(rec_para)
        story.append(Spacer(1, 0.2 * inch))
        
        # ========== FOOTER ==========
        story.append(Spacer(1, 0.5 * inch))
        footer_text = Paragraph(
            "<i>This report was generated automatically by License Compliance Scanner. "
            "For legal advice, please consult with a qualified attorney.</i>",
            self.styles['Normal']
        )
        story.append(footer_text)
        
        # Build PDF
        doc.build(story)
        
        # Read and return PDF bytes
        with open(output_path, 'rb') as f:
            pdf_bytes = f.read()
        
        return pdf_bytes, output_path