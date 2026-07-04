@echo off
chcp 65001 > nul
cd /d "%~dp0"

:: git 경로 탐색
set GIT="C:\Program Files\Git\cmd\git.exe"
if not exist %GIT% set GIT=git

:: git 동작 확인
%GIT% --version > nul 2>&1
if errorlevel 1 (
  echo [오류] git을 찾을 수 없습니다.
  pause & exit /b 1
)

echo [폴더] %CD%
echo.

:: 깨진 .git 감지 및 제거
if exist .git (
  %GIT% log --oneline -1 > nul 2>&1
  if errorlevel 1 (
    echo [초기화] 불완전한 .git 제거 중...
    rd /s /q .git
  )
)

:: .git 없으면 새로 초기화
if not exist .git (
  echo [초기화] git init...
  %GIT% init
  %GIT% config user.email "freeiam77@gmail.com"
  %GIT% config user.name "steve-cyber8764"
  %GIT% remote add origin https://github.com/steve-cyber8764/utilall.git
  echo [초기화] 완료
)

:: remote 없으면 추가
%GIT% remote get-url origin > nul 2>&1
if errorlevel 1 (
  %GIT% remote add origin https://github.com/steve-cyber8764/utilall.git
)

:: 스테이징
echo [스테이징] 전체 파일...
%GIT% add -A
echo.

:: 상태 출력
%GIT% status --short
echo.

:: 커밋
echo [커밋]
%GIT% commit -m "feat: MPA 전환 + 국제 넓이 단위 추가 + select 가시성 수정"
echo.

:: 강제 푸시 (HEAD를 master로)
echo [푸시] GitHub로 전송 중...
%GIT% push -f origin HEAD:master
echo.

if errorlevel 1 (
  echo [실패] 위 오류 메시지를 확인하세요
) else (
  echo === 완료! Railway가 자동으로 배포를 시작합니다 ===
)
pause
