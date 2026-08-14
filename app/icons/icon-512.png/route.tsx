import { ImageResponse } from "next/og";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#cdeaff",
        }}
      >
        <svg width="340" height="340" viewBox="0 0 48 48">
          <g fill="none" stroke="#24365a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="24" cy="12" r="4" />
            <path d="M24 16 v20" />
            <path d="M13 24 h22" />
            <path d="M14 29 a10 10 0 0 0 20 0" />
          </g>
        </svg>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
