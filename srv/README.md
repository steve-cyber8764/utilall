# 회원 · 게시판 백엔드 설정 (Railway)

`server.js`에 회원가입(이메일 인증)/로그인/게시판 API가 추가되었습니다.
동작하려면 Railway에서 **PostgreSQL**과 **이메일(SMTP)** 을 연결해야 합니다.
아래 환경변수가 없어도 정적 사이트와 방문자 카운터는 정상 동작하며, 게시판 API만 비활성화됩니다.

## 1) PostgreSQL 연결
1. Railway 프로젝트에서 **New → Database → PostgreSQL** 추가
2. 서비스에 자동으로 `DATABASE_URL` 이 주입됩니다(내부 프라이빗 URL 권장 → SSL 불필요).
   - 외부/관리형 DB라 SSL이 필요하면 `PGSSL=require` 를 추가하세요.
3. 최초 부팅 시 필요한 테이블(users, sessions, email_tokens, posts)이 자동 생성됩니다.

## 2) 이메일(SMTP) 발송 — 인증 메일
아래 환경변수를 설정하세요(예: Gmail 앱 비밀번호, SendGrid, Mailgun SMTP 등):

| 변수 | 설명 | 예시 |
|------|------|------|
| `SMTP_HOST` | SMTP 서버 | `smtp.gmail.com` |
| `SMTP_PORT` | 포트(기본 587) | `587` |
| `SMTP_SECURE` | 465(TLS)면 `1` | `0` |
| `SMTP_USER` | 계정 | `you@gmail.com` |
| `SMTP_PASS` | 비밀번호/앱 비밀번호 | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | 발신 주소(기본 SMTP_USER) | `UtilAll <you@gmail.com>` |
| `PUBLIC_BASE_URL` | (선택) 인증 링크 도메인 | `https://utilall.net` |

> `PUBLIC_BASE_URL` 을 지정하지 않으면 요청 헤더에서 자동 추정합니다.
> Railway는 프록시 뒤이므로 `server.js` 에 `trust proxy` 가 이미 설정돼 있습니다.

## 로컬 개발 (DB 없이 전체 흐름 테스트)
```bash
USE_PGMEM=1 node server.js      # 인메모리 pg-mem 사용, SMTP 미설정 시 인증 링크를 콘솔에 출력
```
`USE_PGMEM=1` 이면 회원/게시판이 메모리에서 동작하고(재시작 시 초기화), 인증 메일 대신
콘솔·응답의 `devLink` 로 인증을 완료할 수 있습니다. 프로덕션에서는 절대 사용하지 마세요.

## 보안 메모
- 비밀번호는 Node 내장 `scrypt` + 임의 salt 로 해시 저장(평문 저장 안 함).
- 세션은 httpOnly·Secure·SameSite=Lax 쿠키 + 서버측 세션 토큰(30일).
- 모든 쿼리는 파라미터 바인딩으로 SQL 인젝션 방지, 게시글은 프론트에서 이스케이프 렌더(XSS 방지).
- 가입/로그인/재발송에 IP 기반 간이 레이트리밋 적용.
