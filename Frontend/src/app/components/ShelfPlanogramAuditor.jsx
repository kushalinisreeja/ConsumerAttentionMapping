"use client";
import React, { useState, useRef } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://cosumer-attention-mapping.onrender.com";

const TOKENS = {
  bg: "#0B0F17",
  cardBg: "#131A27",
  cardBorder: "#232C40",
  text: "#EDEFF3",
  muted: "#8A93A6",
  accent: "#E8A33D",
  success: "#5FAE86",
  danger: "#E8654F",
  info: "#5B8DEF",
  purple: "#A78BFA",
};

const cardStyle = {
  backgroundColor: TOKENS.cardBg,
  borderRadius: "12px",
  border: `1px solid ${TOKENS.cardBorder}`,
  padding: "20px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
};

const API_BASE = `${API_BASE_URL}`;

export default function ShelfPlanogramAuditor() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAuditResult(null);
      setErrorMsg(null);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`${API_BASE}/api/shelf/audit-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to run AI Shelf Audit. Ensure backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'" }}>
      
      {/* HEADER RIBBON */}
      <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", color: TOKENS.text }}>
            📸 AI Shelf Planogram & Stock Analyzer
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
            Upload shelf photos to automatically identify product facings, detect Out-of-Stock void gaps, calculate Golden Zone share, and receive smart repositioning directives.
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "11px", padding: "6px 12px", borderRadius: "20px", background: "rgba(95,174,134,0.15)", color: TOKENS.success, fontWeight: 700, border: "1px solid rgba(95,174,134,0.3)" }}>
            ⚡ YOLOv8 + Spatial Planogram AI
          </span>
        </div>
      </div>

      {/* UPLOAD & ACTION BAR */}
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "10px 18px",
              borderRadius: "8px",
              border: `1px solid ${TOKENS.cardBorder}`,
              backgroundColor: TOKENS.bg,
              color: TOKENS.text,
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            📁 Select Shelf Image
          </button>

          <span style={{ fontSize: "12px", color: TOKENS.muted }}>
            {selectedFile ? `Selected: ${selectedFile.name}` : "No image selected (supports JPG, PNG, JPEG)"}
          </span>

          <button
            onClick={handleUploadAndAnalyze}
            disabled={!selectedFile || isProcessing}
            style={{
              padding: "10px 22px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: !selectedFile || isProcessing ? "#333d4e" : TOKENS.accent,
              color: !selectedFile || isProcessing ? "#8A93A6" : "#1A1200",
              fontSize: "13px",
              fontWeight: 700,
              cursor: !selectedFile || isProcessing ? "not-allowed" : "pointer",
              marginLeft: "auto",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {isProcessing ? "⏳ Scanning Shelf Planogram..." : "🚀 Run AI Shelf Audit"}
          </button>
        </div>

        {errorMsg && (
          <div style={{ marginTop: "14px", padding: "10px 14px", borderRadius: "8px", background: "rgba(232,101,79,0.2)", border: `1px solid ${TOKENS.danger}`, color: TOKENS.danger, fontSize: "12px" }}>
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* RESULTS DISPLAY */}
      {auditResult && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          {/* KPI METRIC CARDS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                📦 Total Facings Detected
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.text }}>{auditResult.total_facings_detected} Facings</div>
              <div style={{ fontSize: "11px", color: TOKENS.success, marginTop: "2px" }}>Across {auditResult.shelf_tiers_detected || 3} Horizontal Tiers</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                ⚠️ Out-of-Stock Voids
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: auditResult.out_of_stock_gaps_count > 0 ? TOKENS.danger : TOKENS.success }}>
                {auditResult.out_of_stock_gaps_count} Gaps
              </div>
              <div style={{ fontSize: "11px", color: auditResult.out_of_stock_gaps_count > 0 ? TOKENS.danger : TOKENS.success, marginTop: "2px" }}>
                {auditResult.out_of_stock_gaps_count > 0 ? "🚨 Immediate Restock Needed" : "✅ 100% Shelf In-Stock"}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                ⭐ Eye-Level Golden Zone
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.accent }}>
                {auditResult.golden_zone_share_pct}%
              </div>
              <div style={{ fontSize: "11px", color: TOKENS.muted, marginTop: "2px" }}>{auditResult.golden_zone_facings} items at eye fixation height</div>
            </div>

            <div style={cardStyle}>
              <div style={{ fontSize: "11px", color: TOKENS.muted, textTransform: "uppercase", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                📊 Planogram Compliance
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, marginTop: "4px", color: TOKENS.info }}>
                {auditResult.planogram_compliance_score} <span style={{ fontSize: "14px", color: TOKENS.muted }}>/ 100</span>
              </div>
              <div style={{ fontSize: "11px", color: TOKENS.info, marginTop: "2px" }}>Visual Compliance Index</div>
            </div>
          </div>

          {/* SMART PRODUCT REPOSITIONING & MERCHANDISING DIRECTIVES */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: TOKENS.text }}>
                  💡 Smart Product Placement & Shelf Changing Recommendations
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: TOKENS.muted }}>
                  AI-driven placement directives to optimize product shelf positioning, maximize eye fixation, and eliminate revenue leakage.
                </p>
              </div>
              <span style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "8px", background: "rgba(232,163,61,0.15)", color: TOKENS.accent, fontWeight: 700 }}>
                {auditResult.smart_placement_recommendations?.length || 3} Actionable Directives
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
              {(auditResult.smart_placement_recommendations || []).map((rec, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: TOKENS.bg,
                    borderRadius: "10px",
                    border: `1px solid ${TOKENS.cardBorder}`,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: "12px"
                  }}
                >
                  <div>
                    {/* BADGE & PRIORITY */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: "6px",
                          backgroundColor: `${rec.badge_color || TOKENS.accent}20`,
                          color: rec.badge_color || TOKENS.accent,
                          border: `1px solid ${rec.badge_color || TOKENS.accent}50`,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        {rec.icon || "💡"} {rec.badge}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          color: rec.priority === "CRITICAL" ? TOKENS.danger : rec.priority === "HIGH" ? TOKENS.accent : TOKENS.info
                        }}
                      >
                        ● {rec.priority} PRIORITY
                      </span>
                    </div>

                    {/* TITLE & DIRECTIVE */}
                    <div style={{ fontSize: "14px", fontWeight: 700, color: TOKENS.text, marginBottom: "6px" }}>
                      {rec.title}
                    </div>
                    <div style={{ fontSize: "12px", color: TOKENS.muted, lineHeight: "1.4" }}>
                      {rec.action}
                    </div>
                  </div>

                  {/* VISUAL POSITION CHANGE: FROM -> TO */}
                  <div
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: "8px",
                      padding: "10px",
                      border: `1px solid ${TOKENS.cardBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      fontSize: "11px"
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: "9px", color: TOKENS.muted, textTransform: "uppercase" }}>Current Position</span>
                      <span style={{ fontWeight: 600, color: TOKENS.danger }}>{rec.source_tier}</span>
                    </div>

                    <div style={{ fontSize: "16px", color: TOKENS.accent, fontWeight: 800 }}>➔</div>

                    <div style={{ display: "flex", flexDirection: "column", textAlign: "right" }}>
                      <span style={{ fontSize: "9px", color: TOKENS.muted, textTransform: "uppercase" }}>Recommended Position</span>
                      <span style={{ fontWeight: 600, color: TOKENS.success }}>{rec.target_tier}</span>
                    </div>
                  </div>

                  {/* EXPECTED IMPACT & REASONING */}
                  <div>
                    <div style={{ fontSize: "11px", color: TOKENS.success, fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      📈 Expected Impact: {rec.expected_impact}
                    </div>
                    <div style={{ fontSize: "11px", color: TOKENS.muted, fontStyle: "italic" }}>
                      "{rec.rationale}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ANNOTATED IMAGE PREVIEW & SHARE OF SHELF */}
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px" }}>
            
            {/* ANNOTATED SHELF IMAGE */}
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: TOKENS.text }}>
                  🎯 AI Annotated Shelf Overlay
                </h3>
                <div style={{ display: "flex", gap: "6px", fontSize: "10px" }}>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(95,174,134,0.2)", color: TOKENS.success, border: `1px solid ${TOKENS.success}` }}>🟢 Golden Zone</span>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(91,141,239,0.2)", color: TOKENS.info, border: `1px solid ${TOKENS.info}` }}>🔵 Reach Tier</span>
                  <span style={{ padding: "2px 8px", borderRadius: "10px", background: "rgba(232,101,79,0.2)", color: TOKENS.danger, border: `1px solid ${TOKENS.danger}` }}>🔴 Void Gap</span>
                </div>
              </div>

              <div style={{ width: "100%", borderRadius: "8px", overflow: "hidden", background: "#000", border: `1px solid ${TOKENS.cardBorder}` }}>
                <img
                  src={auditResult.annotated_image_base64}
                  alt="Annotated Shelf Audit"
                  style={{ width: "100%", height: "auto", display: "block", maxHeight: "480px", objectFit: "contain" }}
                />
              </div>
            </div>

            {/* SHARE OF SHELF CARD */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: 700, color: TOKENS.text }}>
                📊 Share of Shelf Distribution
              </h3>
              <p style={{ fontSize: "12px", color: TOKENS.muted, margin: "0 0 14px 0" }}>
                Percentage of visible shelf space occupied by each product category.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {auditResult.share_of_shelf.map((item, idx) => (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                      <span style={{ color: TOKENS.text, fontWeight: 600 }}>{item.category}</span>
                      <span style={{ color: TOKENS.accent, fontWeight: 700 }}>{item.facings_count} facing(s) ({item.share_pct}%)</span>
                    </div>
                    <div style={{ height: "8px", background: TOKENS.bg, borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ width: `${item.share_pct}%`, height: "100%", background: idx === 0 ? TOKENS.accent : idx === 1 ? TOKENS.info : TOKENS.purple, borderRadius: "4px" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* QUICK TIP */}
              <div style={{ marginTop: "18px", padding: "12px", borderRadius: "8px", background: "rgba(91,141,239,0.1)", border: `1px solid rgba(91,141,239,0.3)`, fontSize: "12px", color: TOKENS.info, lineHeight: "1.4" }}>
                📌 <strong>Merchandising Rule:</strong> Eye-level rows capture over 60% of total product evaluations. Keep your highest margin, fastest turning SKUs centered on the middle tier.
              </div>
            </div>

          </div>

          {/* DETECTED ITEMS TABLE */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: TOKENS.text }}>
                📋 Detected SKU Inventory Manifest
              </h3>
              <span style={{ fontSize: "11px", color: TOKENS.muted }}>
                {auditResult.detected_items?.length || 0} Individual Facing Coordinates
              </span>
            </div>
            <div style={{ maxHeight: "260px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${TOKENS.cardBorder}`, color: TOKENS.muted }}>
                    <th style={{ padding: "10px" }}>Item ID</th>
                    <th style={{ padding: "10px" }}>Category / Class</th>
                    <th style={{ padding: "10px" }}>Assigned Shelf Tier</th>
                    <th style={{ padding: "10px" }}>Confidence</th>
                    <th style={{ padding: "10px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {auditResult.detected_items.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: `1px solid ${TOKENS.cardBorder}` }}>
                      <td style={{ padding: "10px", fontWeight: 700, color: TOKENS.accent }}>{item.item_id}</td>
                      <td style={{ padding: "10px", color: TOKENS.text }}>{item.name} ({item.detected_class})</td>
                      <td style={{ padding: "10px", color: item.shelf_tier.includes("Golden") ? TOKENS.success : item.shelf_tier.includes("Reach") ? TOKENS.info : TOKENS.muted, fontWeight: 600 }}>
                        {item.shelf_tier}
                      </td>
                      <td style={{ padding: "10px" }}>{item.confidence}%</td>
                      <td style={{ padding: "10px", color: TOKENS.success, fontWeight: 600 }}>✅ Stocked</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
