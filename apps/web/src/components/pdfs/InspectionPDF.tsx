"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import type { AppRouter } from "@/server/routers/_app";
import type { inferRouterOutputs } from "@trpc/server";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type PublicStatus = RouterOutputs["order"]["getPublicStatus"] & {
  vehiclePlate?: string | null;
};

interface InspectionPDFProps {
  data: PublicStatus;
  qrCodeUrl: string;
  trackingUrl: string;
  iconBase64?: string | null;
}

export const InspectionPDF = ({
  data,
  qrCodeUrl,
  trackingUrl,
  iconBase64,
}: InspectionPDFProps) => {
  const primaryColor = data.tenantContact.primaryColor || "#DC2626"; // Default Red
  const secondaryColor = data.tenantContact.secondaryColor || "#0F172A"; // Default Navy

  const styles = StyleSheet.create({
    page: {
      padding: 0,
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
    },
    // Top Accent
    topBar: {
      height: 4,
      backgroundColor: primaryColor,
      width: "100%",
    },
    // Main Container
    content: {
      paddingHorizontal: 40,
      paddingVertical: 30,
    },
    // Header Block
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 30,
    },
    logoContainer: {
      width: "60%",
    },
    logo: {
      width: 140,
      height: 50,
      objectFit: "contain",
    },
    qrContainer: {
      width: "80pt",
      alignItems: "center",
    },
    qrCode: {
      width: 60,
      height: 60,
      borderWidth: 1,
      borderColor: "#F1F5F9",
      padding: 2,
    },
    qrLabel: {
      fontSize: 7,
      color: "#64748B",
      marginTop: 4,
      textAlign: "center",
    },
    // Title Section
    titleBar: {
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 4,
      marginBottom: 25,
      borderLeftWidth: 3,
      borderLeftColor: primaryColor,
    },
    titleText: {
      fontSize: 14,
      fontWeight: "bold",
      color: secondaryColor,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    // Grid Info
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 10,
    },
    infoBlock: {
      width: "50%",
      marginBottom: 15,
      paddingRight: 10,
    },
    label: {
      fontSize: 8,
      color: "#94A3B8",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 3,
    },
    value: {
      fontSize: 11,
      color: "#1E293B",
      fontWeight: "bold",
    },
    // Divider
    divider: {
      height: 1,
      backgroundColor: "#F1F5F9",
      marginVertical: 15,
    },
    // Section Header
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 5,
    },
    sectionTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: secondaryColor,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    sectionLine: {
      flex: 1,
      height: 1,
      backgroundColor: "#F1F5F9",
      marginLeft: 10,
    },
    // Table
    table: {
      width: "100%",
      marginTop: 5,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#F8FAFC",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    tableHeaderText: {
      fontSize: 8,
      color: "#64748B",
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    tableRowEven: {
      backgroundColor: "#FAFBFC",
    },
    col1: { width: "70%" },
    col2: { width: "30%", textAlign: "right" },
    cellText: { fontSize: 10, color: "#334155" },
    cellTextBold: { fontSize: 10, color: "#1E293B", fontWeight: "bold" },
    // Avarias Grid
    damageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    damageCard: {
      width: "31%",
      padding: 8,
      backgroundColor: "#F8FAFC",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    damageTitle: {
      fontSize: 9,
      fontWeight: "bold",
      color: "#1E293B",
      marginBottom: 2,
    },
    damageDesc: {
      fontSize: 8,
      color: "#64748B",
    },
    // Total Section
    totalContainer: {
      marginTop: 20,
      flexDirection: "row",
      justifyContent: "flex-end",
    },
    totalBox: {
      width: "40%",
      backgroundColor: secondaryColor,
      padding: 15,
      borderRadius: 4,
      alignItems: "flex-end",
    },
    totalLabel: {
      fontSize: 9,
      color: "#CBD5E1",
      textTransform: "uppercase",
      marginBottom: 4,
    },
    totalValue: {
      fontSize: 18,
      color: "#FFFFFF",
      fontWeight: "bold",
    },
    // Footer
    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: 40,
      backgroundColor: "#F8FAFC",
      borderTopWidth: 1,
      borderTopColor: "#E2E8F0",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    footerBrandContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    footerIcon: {
      width: 60,
      height: 20,
      objectFit: "contain",
    },
    footerBrand: {
      fontSize: 10,
      fontWeight: "bold",
      color: secondaryColor,
      letterSpacing: 2,
    },
    footerInfo: {
      fontSize: 8,
      color: "#94A3B8",
    },
    // Image Gallery
    inspectionPage: {
      padding: 40,
      paddingTop: 30,
      backgroundColor: "#FFFFFF",
      fontFamily: "Helvetica",
    },
    inspectionPageHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    inspectionPageTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: secondaryColor,
    },
    inspectionPageSubtitle: {
      fontSize: 9,
      color: "#64748B",
    },
    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    imageCard: {
      width: "48%",
      marginBottom: 15,
    },
    inspectionImage: {
      width: "100%",
      height: 150,
      objectFit: "cover",
      borderRadius: 4,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    imageCaption: {
      fontSize: 8,
      color: "#64748B",
      marginTop: 4,
      textAlign: "center",
    },
    noImagesText: {
      fontSize: 10,
      color: "#94A3B8",
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 20,
    },
    // Signature Styles
    signatureSection: {
      marginTop: 30,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
    },
    signatureContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    signatureBlock: {
      width: "45%",
      alignItems: "center",
    },
    signatureImage: {
      width: 120,
      height: 40,
      objectFit: "contain",
      marginBottom: 5,
    },
    signatureLine: {
      width: "100%",
      height: 1,
      backgroundColor: "#94A3B8",
      marginBottom: 5,
    },
    signatureLabel: {
      fontSize: 8,
      color: "#64748B",
      textAlign: "center",
    },
    signatureDate: {
      fontSize: 7,
      color: "#94A3B8",
      marginTop: 2,
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const damageTypeLabels: Record<string, string> = {
    arranhao: "Arranhão",
    amassado: "Amassado",
    trinca: "Trinca",
    mancha: "Mancha",
    risco: "Risco",
    pintura: "Pintura",
    outro: "Outro",
  };

  const severityLabels: Record<string, string> = {
    leve: "Leve",
    moderado: "Moderado",
    grave: "Grave",
  };

  const entradaInspection = data.inspections?.find((i) => i.type === "entrada");
  const intermediariaInspection = data.inspections?.find(
    (i) => i.type === "intermediaria"
  );
  const saidaInspection = data.inspections?.find((i) => i.type === "final");

  const avarias =
    entradaInspection?.items?.filter((item) => item.status === "com_avaria") ||
    [];

  // Helpers for inspection images
  const inspectionTypeLabels: Record<string, string> = {
    entrada: "Vistoria de Entrada",
    intermediaria: "Vistoria Intermediária",
    final: "Vistoria de Saída",
  };

  const getInspectionImages = (inspection: typeof entradaInspection) => {
    if (!inspection || inspection.status !== "concluida") return [];

    const images: { url: string; label: string }[] = [];

    // Add item photos
    inspection.items?.forEach((item) => {
      if (item.photoUrl) {
        images.push({
          url: item.photoUrl,
          label: item.label || "Item",
        });
      }
    });

    // Add damage photos
    inspection.damages?.forEach((damage, index) => {
      if (damage.photoUrl) {
        images.push({
          url: damage.photoUrl,
          label: `Avaria ${index + 1}${
            damage.damageType
              ? ` - ${damageTypeLabels[damage.damageType] || damage.damageType}`
              : ""
          }`,
        });
      }
    });

    return images;
  };

  const completedInspections = [
    { type: "entrada", inspection: entradaInspection },
    { type: "intermediaria", inspection: intermediariaInspection },
    { type: "final", inspection: saidaInspection },
  ].filter(
    (i) =>
      i.inspection?.status === "concluida" &&
      getInspectionImages(i.inspection).length > 0
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topBar} />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              {data.tenantContact.logo ? (
                <Image
                  src={
                    data.tenantContact.logo.startsWith("/")
                      ? `${
                          typeof window !== "undefined"
                            ? window.location.origin
                            : ""
                        }${data.tenantContact.logo}`
                      : data.tenantContact.logo
                  }
                  style={styles.logo}
                />
              ) : (
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: secondaryColor,
                  }}
                >
                  {data.tenantContact.name || "EMPRESA"}
                </Text>
              )}
            </View>
            <Link src={trackingUrl} style={styles.qrContainer}>
              <Image src={qrCodeUrl} style={styles.qrCode} />
              <Text style={styles.qrLabel}>Vistoria On-line</Text>
            </Link>
          </View>

          <View style={styles.titleBar}>
            <Text style={styles.titleText}>
              Relatório de Vistoria Profissional
            </Text>
          </View>

          {/* Grid de Informações */}
          <View style={styles.infoGrid}>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Cliente</Text>
              <Text style={styles.value}>
                {String(data.customerName || "N/A")}
              </Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Veículo</Text>
              <Text style={styles.value}>
                {String(data.vehicleName || "N/A")}
              </Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Placa / Cor</Text>
              <Text style={styles.value}>
                {data.vehiclePlate ? String(data.vehiclePlate) : "---"} •{" "}
                {data.vehicleColor ? String(data.vehicleColor) : "---"}
              </Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Status Geral</Text>
              <Text style={[styles.value, { color: primaryColor }]}>
                {String(data.status || "N/A").toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Avarias */}
          {avarias.length > 0 && (
            <View style={{ marginTop: 10 }}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Vistoria de Entrada (Avarias)
                </Text>
                <View style={styles.sectionLine} />
              </View>
              <View style={styles.damageGrid}>
                {avarias.map((item) => (
                  <View key={item.id} style={styles.damageCard}>
                    <Text style={styles.damageTitle}>{String(item.label)}</Text>
                    <Text style={styles.damageDesc}>
                      {item.damageType
                        ? damageTypeLabels[item.damageType] || item.damageType
                        : "-"}
                      {item.severity
                        ? ` • ${severityLabels[item.severity] || item.severity}`
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Serviços */}
          <View style={{ marginTop: 25 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Resumo dos Serviços</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, styles.col1]}>
                  Descrição do Serviço
                </Text>
                <Text style={[styles.tableHeaderText, styles.col2]}>Valor</Text>
              </View>
              {data.services.map((service, index) => (
                <View
                  key={index}
                  style={[
                    styles.tableRow,
                    index % 2 === 1 ? styles.tableRowEven : {},
                  ]}
                >
                  <Text style={[styles.cellText, styles.col1]}>
                    {String(service.name)}
                  </Text>
                  <Text style={[styles.cellTextBold, styles.col2]}>
                    {formatCurrency(service.total)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>Valor Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(data.total)}
              </Text>
            </View>
          </View>

          {/* Assinatura */}
          {(saidaInspection?.signatureUrl ||
            entradaInspection?.signatureUrl) && (
            <View style={styles.signatureSection}>
              <View style={styles.signatureContainer}>
                {entradaInspection?.signatureUrl && (
                  <View style={styles.signatureBlock}>
                    <Image
                      src={entradaInspection.signatureUrl}
                      style={styles.signatureImage}
                    />
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>
                      Assinatura de Entrada
                    </Text>
                    <Text style={styles.signatureDate}>
                      {entradaInspection.signedAt
                        ? new Date(
                            entradaInspection.signedAt
                          ).toLocaleDateString("pt-BR")
                        : ""}
                    </Text>
                  </View>
                )}

                {saidaInspection?.signatureUrl && (
                  <View style={styles.signatureBlock}>
                    <Image
                      src={saidaInspection.signatureUrl}
                      style={styles.signatureImage}
                    />
                    <View style={styles.signatureLine} />
                    <Text style={styles.signatureLabel}>
                      Assinatura de Saída
                    </Text>
                    <Text style={styles.signatureDate}>
                      {saidaInspection.signedAt
                        ? new Date(saidaInspection.signedAt).toLocaleDateString(
                            "pt-BR"
                          )
                        : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.footerBrandContainer}>
            {iconBase64 && <Image src={iconBase64} style={styles.footerIcon} />}
          </View>
          <Text style={styles.footerInfo}>
            Relatório gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Page>

      {/* Páginas de Imagens das Vistorias */}
      {completedInspections.map(({ type, inspection }) => {
        const images = getInspectionImages(inspection);
        if (images.length === 0) return null;

        return (
          <Page key={type} size="A4" style={styles.inspectionPage}>
            <View style={styles.inspectionPageHeader}>
              <View>
                <Text style={styles.inspectionPageTitle}>
                  {inspectionTypeLabels[type] || type}
                </Text>
                <Text style={styles.inspectionPageSubtitle}>
                  {images.length} foto{images.length !== 1 ? "s" : ""}{" "}
                  registrada{images.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <Text style={{ fontSize: 9, color: "#94A3B8" }}>
                {inspection?.createdAt
                  ? new Date(inspection.createdAt).toLocaleDateString("pt-BR")
                  : ""}
              </Text>
            </View>

            <View style={styles.imageGrid}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.imageCard}>
                  <Image src={img.url} style={styles.inspectionImage} />
                  <Text style={styles.imageCaption}>{img.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.footer}>
              <View style={styles.footerBrandContainer}>
                {iconBase64 && (
                  <Image src={iconBase64} style={styles.footerIcon} />
                )}
              </View>
              <Text style={styles.footerInfo}>
                {inspectionTypeLabels[type]} • Página de Fotos
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
