/* mail.js — 인증 메일 발송 (nodemailer / SMTP)
 * SMTP_HOST 등 환경변수가 있으면 실제 발송, 없고 개발모드면 콘솔에 링크 출력.
 * 필요한 환경변수: SMTP_HOST, SMTP_PORT(기본 587), SMTP_USER, SMTP_PASS,
 *   SMTP_SECURE(465 TLS면 1), SMTP_FROM(발신주소, 기본 SMTP_USER)
 */
const nodemailer = require('nodemailer');

let transport = null;
const isDev = () => process.env.USE_PGMEM === '1' || process.env.MAIL_DEV === '1';
const configured = () => !!process.env.SMTP_HOST;

function getTransport() {
  if (!transport) {
    transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === '1',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transport;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function sendVerification(to, link, lang) {
  const en = lang === 'en';
  const subject = en ? 'Verify your UtilAll email' : '[UtilAll] 이메일 인증을 완료해 주세요';
  const cta = en ? 'Verify email' : '이메일 인증하기';
  const intro = en
    ? 'Thanks for signing up for UtilAll. Click the button below to verify your email and activate your account.'
    : 'UtilAll 회원가입을 환영합니다. 아래 버튼을 눌러 이메일 인증을 완료하면 계정이 활성화됩니다.';
  const foot = en
    ? 'If you did not request this, you can ignore this email. The link expires in 24 hours.'
    : '본인이 요청하지 않았다면 이 메일을 무시하세요. 링크는 24시간 후 만료됩니다.';
  const html = `<div style="font-family:Arial,'Malgun Gothic',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
    <h2 style="margin:0 0 8px">UtilAll</h2>
    <p style="line-height:1.6">${esc(intro)}</p>
    <p style="margin:24px 0"><a href="${esc(link)}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:700;display:inline-block">${cta}</a></p>
    <p style="font-size:13px;color:#64748b;word-break:break-all">${esc(link)}</p>
    <p style="font-size:12px;color:#94a3b8;margin-top:24px">${esc(foot)}</p>
  </div>`;

  if (!configured()) {
    if (isDev()) {
      console.log(`\n[mail:dev] → ${to}\n[mail:dev] 인증 링크: ${link}\n`);
      return { dev: true };
    }
    const e = new Error('mail_not_configured');
    e.code = 'mail_not_configured';
    throw e;
  }
  await getTransport().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to, subject, html,
  });
  return { sent: true };
}

module.exports = { sendVerification, configured, isDev };
