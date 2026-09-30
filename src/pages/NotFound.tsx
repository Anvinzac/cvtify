import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: 24,
        textAlign: "center",
        background: "#FAFAFA",
        color: "#1A1A2E",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <p style={{ fontSize: 56, fontWeight: 800, margin: 0, lineHeight: 1 }}>404</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Không tìm thấy trang</h1>
      <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
        Đường dẫn bạn truy cập không tồn tại.
      </p>
      <Link
        to="/"
        style={{
          marginTop: 8,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 20px",
          borderRadius: 12,
          background: "#2563EB",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        Về trang chủ
      </Link>
    </main>
  );
}
