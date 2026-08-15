import { createHmac, timingSafeEqual } from "crypto";

// 기획서 3.8/5.14: 카카오톡 공유 출항 인증은 serverCallbackArgs에 user/date/nonce를 실어
// 보내고, 웹훅에서 그 값을 검증한다. nonce 저장용 테이블이 스키마에 없으므로(4.19/4.34 참고)
// DB 조회 없이 HMAC 서명으로 위조를 막는 stateless 방식을 쓴다 — 공유 시점에 서명하고
// 웹훅에서 같은 비밀키로 재계산해 비교, date가 오늘(KST)이 아니면 거부해 재전송도 막는다.
function secret(): string {
  const s = process.env.ATTENDANCE_NONCE_SECRET;
  if (!s) throw new Error("ATTENDANCE_NONCE_SECRET not configured");
  return s;
}

export function signKakaoAttendanceNonce(userId: string, date: string): string {
  return createHmac("sha256", secret()).update(`${userId}:${date}`).digest("hex");
}

export function verifyKakaoAttendanceNonce(userId: string, date: string, nonce: string): boolean {
  const expected = signKakaoAttendanceNonce(userId, date);
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(nonce, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
