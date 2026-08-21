import { ImageResponse } from "next/og";

export const alt = "Free EMI and SIP calculators from Finnri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ToolsOpenGraphImage() {
    return new ImageResponse(
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#FFF8F4", color: "#171717", padding: "72px", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 32, fontWeight: 800 }}><span style={{ display: "flex", width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 17, background: "#FF8865", color: "white" }}>F</span>Finnri Free Tools</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}><div style={{ display: "flex", flexDirection: "column", fontSize: 76, lineHeight: 1, fontWeight: 850, letterSpacing: "-3px" }}><span>EMI calculator</span><span>+ SIP calculator</span></div><div style={{ fontSize: 30, color: "#626262" }}>INR estimates, yearly projections, and amortization schedules. No login required.</div></div>
            <div style={{ display: "flex", gap: "16px", fontSize: 24, color: "#A94C32", fontWeight: 700 }}><span>Free</span><span>•</span><span>Built for India</span><span>•</span><span>Runs in your browser</span></div>
        </div>,
        size,
    );
}
