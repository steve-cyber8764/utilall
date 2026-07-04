@echo off
chcp 65001 > nul
cd /d "%~dp0"

set GIT=git
if exist "C:\Program Files\Git\cmd\git.exe" set GIT="C:\Program Files\Git\cmd\git.exe"

echo.
echo [현재 폴더] %CD%
echo.

:: 커밋 이력 확인으로 정상 저장소 여부 판단
%GIT% log --oneline -1 > nul 2>&1
if errorlevel 1 (
  echo [초기화] 정상적인 git 저장소 없음 - 새로 만듭니다

  :: 깨진 .git 제거
  if exist .git rd /s /q .git

  %GIT% init
  %GIT% branch -M master

  :: git 사용자 설정 (없으면 커밋 불가)
  %GIT% config user.email "freeiam77@gmail.com"
  %GIT% config user.name "steve-cyber8764"

  :: remote 추가
  %GIT% remote add origin https://github.com/steve-cyber8764/utilall.git
  echo [초기화] 완료
) else (
  echo [확인] 기존 git 저장소 사용
)

echo.
echo [스테이징] git add -A ...
%GIT% add -A

echo.
echo [상태]
%GIT% status --short

echo.
echo [커밋]
%GIT% commit -m "feat: MPA 전환 + 국제 넓이 단위 추가 + select 가시성 수정"

echo.
echo [푸시] GitHub 인증 창이 뜨면 로그인하세요
%GIT% push -u origin master

echo.
if errorlevel 1 (
  echo [오류] 푸시 실패 - 위 메시지를 확인하세요
) else (
  echo === 완료! Railway 자동 배포가 시작됩니다 ===
)
pause
