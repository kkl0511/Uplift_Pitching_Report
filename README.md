# BBL v31.10 — 마네킹 ETI 계산 버그 수정 (사용자 지적)
**Build**: 2026-05-03 / **Patch**: v31.9 → v31.10 / **Type**: critical bug fix

---

## 🐛 발견된 핵심 버그 (사용자 지적)

박명균·오승현 같은 좌완 시퀀스 역순 케이스에서 **마네킹이 항상 정상 색상(파란색)**으로 표시되는 문제.

### 근본 원인

마네킹 ETI 계산이 **존재하지 않는 카테고리 이름**을 참조:
```javascript
// v31.9 이전 — 잘못된 코드
const etiPT = (cs.C2_HipDrive ... )      ← C2_HipDrive 없음 (실제: C2_FrontLegBlock)
const etiTA = (cs.C6_ArmCocking ... )    ← C6_ArmCocking 없음 (v31.7에서 제거됨)
```

→ `cs.C2_HipDrive = undefined` → ETI 항상 null → `taLeak = false` → **항상 정상 색상**.

음수 lag (시퀀스 역순) 케이스에서도 마네킹은 "정상 전달" 표시되던 버그.

---

## 수정 내용

### 1) ETI 계산을 lag 변수에서 직접 산출

```javascript
function lagToETI(lag) {
  if (lag == null) return null;
  if (lag < 0) return 0;          // ★ 음수 = 시퀀스 역순 = 전달 0
  if (lag < 20) return 0.5;       // 너무 짧음 (동시 발화)
  if (lag <= 70) return 1.0;      // 정상 lag (Aguinaldo 30~60ms 적정)
  if (lag <= 100) return 0.75;    // 약간 지연
  return 0.5;                     // 너무 지연 (>100ms)
}
const etiPT = lagToETI(inputs.pelvis_to_trunk_lag_ms);
const etiTA = lagToETI(inputs.trunk_to_arm_lag_ms);
```

### 2) 마네킹 라벨 — lag 값 직접 표시

**Before**: `ETI 0.85` (의미 모호)
**After**: `lag 41ms` + `정상 전달` / `⚠ 시퀀스 역순` / `⚠ 누수 · 어깨 부하↑`

### 3) 음수 lag 자동 빨간색 + "시퀀스 역순" 표시

박명균·오승현의 음수 lag (예: trunk → arm -72ms) 케이스에서 마네킹의 TRUNK→ARM 라벨이:
- **색상 빨간색** (#ef4444)
- **메시지: "⚠ 시퀀스 역순"**

→ 데이터 이상이 즉시 시각적으로 보임.

---

## 박명균/오승현 예상 변화

**Before (v31.9)**: 시퀀스 차트는 음수 lag 표시되지만 마네킹은 파란색 정상 표시 (불일치)

**After (v31.10)**: 시퀀스 차트 + 마네킹 둘 다 일관되게 음수 lag 경고 표시
```
PELVIS → TRUNK: lag 41ms · 정상 전달 (파란색)
TRUNK → ARM:    lag -72ms · ⚠ 시퀀스 역순 (빨간색)
```

---

## 좌완 시퀀스 추가 메모

오승현·박명균이 **좌완**에서 동일 패턴이 발생하는 이유는 v31.9에서 windowed peak detection으로 일부 해결됐지만, 여전히 음수 lag이 나오면:

1. **detectPeakRotVel가 좌완 시그널의 부호 처리 부정확** 가능성
2. **Uplift의 좌완 left_arm_rotational_velocity 컬럼 자체에 노이즈** 가능성
3. **좌완 미러링 후 max abs 시점이 와인드업 phase**

→ v31.10에서는 마네킹 시각화 정확화 (빨간색 자동 표시)에 우선 집중. 좌완 raw 데이터 분석은 별도.

---

## 변경 사항 (코드)

- `BBL_신규선수_리포트.html`
  - `ALGORITHM_VERSION` v31.9 → v31.10
  - `renderEnergyFlowSvg`: `etiPT/etiTA` 계산 로직 수정 (lag 변수 직접 사용)
  - `lagToETI(lag)` 함수 신규 추가 — 음수 lag 시 ETI=0 반환
  - 마네킹 라벨: `ETI X.XX` → `lag XXms` + 시퀀스 역순/누수/정상 자동 메시지
- `cohort_v29.js`: 변경 없음
- `kinetic_chain.gif`: 변경 없음

---

## 배포 절차

GitHub Pages에 다음 3개 파일 덮어쓰기:
1. `index.html`
2. `cohort_v29.js` (변경 없음)
3. `kinetic_chain.gif` (변경 없음)

→ Cmd+Shift+R → v31.10 확인

---

## 검증 권장 (배포 후)

| 케이스 | 시퀀스 차트 | 마네킹 |
|---|---|---|
| **박명균** (음수 lag) | -72ms 표시 | **빨간색 + ⚠ 시퀀스 역순** ✓ |
| **오승현** (음수 lag) | 음수 표시 | **빨간색 + ⚠ 시퀀스 역순** ✓ |
| 정예준 (정상 lag) | 양수 표시 | 파란색 + 정상 전달 |
| 권진서 | 표시 | 정상 색상 (영향 없음) |

---

## v31.0 → v31.10 누적

| 버전 | 핵심 |
|---|---|
| v31.0~v31.7 | 점수 시스템 + UX 재구성 |
| v31.8 | 표면 메카닉형 자동 감지 |
| v31.9 | 시퀀스 Peak 검출 윈도우 강화 |
| **v31.10** | **마네킹 ETI 계산 버그 수정 (옛 카테고리 참조 → lag 기반)** |

---

**END OF v31.10 PATCH NOTES**
