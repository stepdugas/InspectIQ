'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'
import { Profile, Inspection, Room, InspectionItem } from '@/types'

const styles = StyleSheet.create({
  // ── Cover page ──────────────────────────────────────────────────────────────
  coverPage: {
    fontFamily: 'Helvetica',
    color: '#1e293b',
    padding: 0,
  },
  coverTop: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 56,
    paddingTop: 72,
    paddingBottom: 56,
  },
  coverBrand: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#60a5fa',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 48,
  },
  coverReportLabel: {
    fontSize: 10,
    color: '#94a3b8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  coverAddress: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    lineHeight: 1.2,
    marginBottom: 32,
  },
  coverDivider: {
    height: 3,
    backgroundColor: '#2563eb',
    width: 48,
    marginBottom: 32,
  },
  coverMetaRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 8,
  },
  coverMetaLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  coverMetaValue: {
    fontSize: 11,
    color: '#e2e8f0',
    fontFamily: 'Helvetica-Bold',
  },
  coverBottom: {
    paddingHorizontal: 56,
    paddingTop: 40,
    paddingBottom: 48,
    flex: 1,
    justifyContent: 'space-between',
  },
  coverSummaryTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  coverStatRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  coverStat: {
    flex: 1,
    borderRadius: 6,
    padding: 14,
    alignItems: 'center',
  },
  coverStatNum: {
    fontSize: 26,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  coverStatLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverFooterText: {
    fontSize: 8,
    color: '#94a3b8',
  },
  // ── Interior pages ───────────────────────────────────────────────────────────
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1e293b',
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
    marginBottom: 20,
  },
  pageHeaderCompany: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  },
  pageHeaderSub: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 2,
  },
  pageHeaderRight: {
    fontSize: 8,
    color: '#94a3b8',
    textAlign: 'right',
  },
  // ── Summary of Findings page ─────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 8,
    color: '#94a3b8',
    marginBottom: 16,
  },
  findingGroupLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 12,
  },
  findingGroupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  findingGroupText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  findingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 3,
    marginBottom: 3,
  },
  findingName: {
    fontSize: 9,
    color: '#1e293b',
    flex: 3,
  },
  findingRoom: {
    fontSize: 8,
    color: '#94a3b8',
    flex: 2,
  },
  findingBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  findingNote: {
    fontSize: 8,
    color: '#64748b',
    fontStyle: 'italic',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  // ── Room sections ────────────────────────────────────────────────────────────
  roomSection: {
    marginBottom: 20,
  },
  roomHeader: {
    backgroundColor: '#1e293b',
    padding: '6 10',
    borderRadius: 3,
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
  },
  itemRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  itemName: {
    flex: 3,
    fontSize: 9,
    color: '#334155',
  },
  conditionBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    textAlign: 'center',
  },
  itemNotes: {
    fontSize: 8,
    color: '#64748b',
    paddingHorizontal: 8,
    paddingBottom: 6,
    paddingTop: 2,
    fontStyle: 'italic',
  },
  narrativeBox: {
    backgroundColor: '#eff6ff',
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
    padding: 10,
    marginTop: 8,
    borderRadius: 2,
  },
  narrativeLabel: {
    fontSize: 7,
    color: '#3b82f6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: 'Helvetica-Bold',
  },
  narrativeText: {
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
  },
  // ── Photo grid ───────────────────────────────────────────────────────────────
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    paddingHorizontal: 8,
    paddingBottom: 6,
  },
  photoThumb: {
    width: 80,
    height: 60,
    borderRadius: 3,
    objectFit: 'cover',
  },
  // ── Footer ───────────────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#94a3b8',
  },
})

const conditionLabel = (c: string) => {
  switch (c) {
    case 'good': return 'Satisfactory'
    case 'fair': return 'Maintenance'
    case 'poor': return 'Critical'
    default: return 'N/A'
  }
}

const conditionColor = (c: string) => {
  switch (c) {
    case 'good': return '#16a34a'
    case 'fair': return '#d97706'
    case 'poor': return '#dc2626'
    default: return '#94a3b8'
  }
}

const conditionBg = (c: string) => {
  switch (c) {
    case 'good': return '#f0fdf4'
    case 'fair': return '#fffbeb'
    case 'poor': return '#fef2f2'
    default: return '#f8fafc'
  }
}

interface PDFReportProps {
  inspection: Inspection
  rooms: (Room & { items: InspectionItem[]; narrative?: string })[]
  profile: Profile
}

export default function PDFReport({ inspection, rooms, profile }: PDFReportProps) {
  const allItems = rooms.flatMap((r) => r.items.map((i) => ({ ...i, roomName: r.name })))
  const criticalItems = allItems.filter((i) => i.condition === 'poor')
  const maintenanceItems = allItems.filter((i) => i.condition === 'fair')
  const satisfactoryCount = allItems.filter((i) => i.condition === 'good').length
  const totalItems = allItems.filter((i) => i.condition !== 'na').length
  const hasSummary = criticalItems.length > 0 || maintenanceItems.length > 0

  const companyName = profile.company_name ?? profile.companyName ?? 'InspectIQ'
  const fullName = profile.full_name ?? profile.fullName ?? 'Inspector'
  const licenseNumber = profile.license_number ?? profile.licenseNumber
  const phone = profile.phone
  const email = profile.email
  const logoUrl = profile.logo_url ?? profile.logoUrl
  const signatureUrl = profile.signature_url ?? profile.signatureUrl
  const propertyAddress = inspection.property_address ?? inspection.propertyAddress ?? ''
  const clientName = inspection.client_name ?? inspection.clientName ?? ''
  const inspectionDate = inspection.inspection_date ?? inspection.inspectionDate ?? ''

  const formattedDate = (() => {
    try {
      return new Date(inspectionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch { return inspectionDate }
  })()

  const PageHeader = () => (
    <View style={styles.pageHeader} fixed>
      <View>
        <Text style={styles.pageHeaderCompany}>{companyName}</Text>
        <Text style={styles.pageHeaderSub}>{[fullName, licenseNumber ? `License #${licenseNumber}` : null].filter(Boolean).join('  ·  ')}</Text>
      </View>
      <View>
        <Text style={styles.pageHeaderRight}>{propertyAddress}</Text>
        <Text style={styles.pageHeaderRight}>{formattedDate}</Text>
      </View>
    </View>
  )

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{companyName} · {email ?? ''}</Text>
      <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )

  return (
    <Document>
      {/* ── Page 1: Cover ─────────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={styles.coverTop}>
          {logoUrl
            ? <Image src={logoUrl} style={{ width: 80, height: 32, objectFit: 'contain', marginBottom: 32 }} />
            : <Text style={styles.coverBrand}>{companyName}</Text>
          }
          <Text style={styles.coverReportLabel}>Home Inspection Report</Text>
          <Text style={styles.coverAddress}>{propertyAddress}</Text>
          <View style={styles.coverDivider} />
          <View style={styles.coverMetaRow}>
            <View>
              <Text style={styles.coverMetaLabel}>Prepared For</Text>
              <Text style={styles.coverMetaValue}>{clientName}</Text>
            </View>
            <View>
              <Text style={styles.coverMetaLabel}>Inspection Date</Text>
              <Text style={styles.coverMetaValue}>{formattedDate}</Text>
            </View>
            <View>
              <Text style={styles.coverMetaLabel}>Inspector</Text>
              <Text style={styles.coverMetaValue}>{fullName}</Text>
            </View>
            {licenseNumber && (
              <View>
                <Text style={styles.coverMetaLabel}>License No.</Text>
                <Text style={styles.coverMetaValue}>{licenseNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.coverBottom}>
          <View>
            <Text style={styles.coverSummaryTitle}>Inspection Overview</Text>
            <View style={styles.coverStatRow}>
              <View style={[styles.coverStat, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.coverStatNum, { color: '#16a34a' }]}>{satisfactoryCount}</Text>
                <Text style={[styles.coverStatLabel, { color: '#16a34a' }]}>Satisfactory</Text>
              </View>
              <View style={[styles.coverStat, { backgroundColor: '#fffbeb' }]}>
                <Text style={[styles.coverStatNum, { color: '#d97706' }]}>{maintenanceItems.length}</Text>
                <Text style={[styles.coverStatLabel, { color: '#d97706' }]}>Maintenance</Text>
              </View>
              <View style={[styles.coverStat, { backgroundColor: '#fef2f2' }]}>
                <Text style={[styles.coverStatNum, { color: '#dc2626' }]}>{criticalItems.length}</Text>
                <Text style={[styles.coverStatLabel, { color: '#dc2626' }]}>Critical</Text>
              </View>
              <View style={[styles.coverStat, { backgroundColor: '#f8fafc' }]}>
                <Text style={[styles.coverStatNum, { color: '#475569' }]}>{totalItems}</Text>
                <Text style={[styles.coverStatLabel, { color: '#475569' }]}>Total Items</Text>
              </View>
            </View>
          </View>

          <View style={styles.coverFooter}>
            <Text style={styles.coverFooterText}>
              {[fullName, licenseNumber ? `License #${licenseNumber}` : null, phone, email].filter(Boolean).join('  ·  ')}
            </Text>
            <Text style={styles.coverFooterText}>Generated by InspectIQ</Text>
          </View>
        </View>
      </Page>

      {/* ── Page 2: Summary of Findings (only if issues exist) ──────────────── */}
      {hasSummary && (
        <Page size="LETTER" style={styles.page}>
          <PageHeader />
          <Text style={styles.sectionTitle}>Summary of Findings</Text>
          <Text style={styles.sectionSub}>All items requiring attention, sorted by priority</Text>

          {criticalItems.length > 0 && (
            <View>
              <View style={styles.findingGroupLabel}>
                <View style={[styles.findingGroupDot, { backgroundColor: '#dc2626' }]} />
                <Text style={[styles.findingGroupText, { color: '#dc2626' }]}>Critical — Immediate Action Required</Text>
              </View>
              {criticalItems.map((item) => (
                <View key={item.id}>
                  <View style={[styles.findingRow, { backgroundColor: '#fef2f2' }]}>
                    <Text style={styles.findingName}>{item.name}</Text>
                    <Text style={styles.findingRoom}>{item.roomName}</Text>
                    <Text style={[styles.findingBadge, { backgroundColor: '#fee2e2', color: '#dc2626' }]}>Critical</Text>
                  </View>
                  {item.notes && <Text style={styles.findingNote}>{item.notes}</Text>}
                </View>
              ))}
            </View>
          )}

          {maintenanceItems.length > 0 && (
            <View>
              <View style={styles.findingGroupLabel}>
                <View style={[styles.findingGroupDot, { backgroundColor: '#d97706' }]} />
                <Text style={[styles.findingGroupText, { color: '#d97706' }]}>Maintenance Needed — Schedule &amp; Monitor</Text>
              </View>
              {maintenanceItems.map((item) => (
                <View key={item.id}>
                  <View style={[styles.findingRow, { backgroundColor: '#fffbeb' }]}>
                    <Text style={styles.findingName}>{item.name}</Text>
                    <Text style={styles.findingRoom}>{item.roomName}</Text>
                    <Text style={[styles.findingBadge, { backgroundColor: '#fef3c7', color: '#d97706' }]}>Maintenance</Text>
                  </View>
                  {item.notes && <Text style={styles.findingNote}>{item.notes}</Text>}
                </View>
              ))}
            </View>
          )}

          <Footer />
        </Page>
      )}

      {/* ── Page 3+: Room Detail ──────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        <PageHeader />
        <Text style={styles.sectionTitle}>Detailed Inspection Report</Text>
        <Text style={styles.sectionSub}>Room-by-room findings with AI-generated narratives</Text>

        {rooms.map((room) => {
          const narrative = room.narrative ?? room.items.find((i) => i.ai_narrative ?? i.aiNarrative)?.ai_narrative ?? room.items.find((i) => i.aiNarrative)?.aiNarrative
          const items = room.items.filter((i) => i.condition !== 'na')
          return (
            <View key={room.id} style={styles.roomSection} wrap={false}>
              <View style={styles.roomHeader}>
                <Text style={styles.roomTitle}>{room.name.toUpperCase()}</Text>
              </View>
              {items.map((item) => {
                const photos: string[] = (() => { try { return JSON.parse(item.photos ?? '[]') } catch { return [] } })()
                return (
                  <View key={item.id}>
                    <View style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={[styles.conditionBadge, { backgroundColor: conditionBg(item.condition ?? 'good'), color: conditionColor(item.condition ?? 'good') }]}>
                        {conditionLabel(item.condition ?? 'good')}
                      </Text>
                    </View>
                    {item.notes && <Text style={styles.itemNotes}>{item.notes}</Text>}
                    {photos.length > 0 && (
                      <View style={styles.photoGrid}>
                        {photos.map((url, idx) => (
                          <Image key={idx} src={url} style={styles.photoThumb} />
                        ))}
                      </View>
                    )}
                  </View>
                )
              })}
              {narrative && (
                <View style={styles.narrativeBox}>
                  <Text style={styles.narrativeLabel}>Inspector Summary</Text>
                  <Text style={styles.narrativeText}>{narrative}</Text>
                </View>
              )}
            </View>
          )
        })}

        {/* Signature block */}
        {signatureUrl && (
          <View style={{ marginTop: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0', paddingTop: 16 }}>
            <Text style={{ fontSize: 8, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Inspector Signature</Text>
            <Image src={signatureUrl} style={{ width: 120, height: 40, objectFit: 'contain' }} />
            <Text style={{ fontSize: 9, color: '#334155', marginTop: 4 }}>{fullName}{licenseNumber ? `  ·  License #${licenseNumber}` : ''}</Text>
          </View>
        )}

        <Footer />
      </Page>
    </Document>
  )
}
