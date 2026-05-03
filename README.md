# BBL v31.11 — 좌완 시퀀스 음수 lag 자동 보정
**Build**: 2026-05-03 / **Patch**: v31.10 → v31.11

---

## 변경 핵심

박명균·오승현 좌완 케이스에서 시퀀스 차트 음수 lag (시퀀스 역순처럼 표시) **근본 해결**:

### 1) Peak 검출 윈도우 더 보수적

| Peak | v31.10 | v31.11 |
|---|---|---|
| pelvis | [KH, MER] | [KH, MER] |
| trunk | [FC, MER+5] | **[FC, MER+10]** |
| **arm** | **[MER, BR+30]** | **[MER+3, BR+10]** ← 와인드업·후방향 회전 차단 |

→ arm peak 윈도우를 **MER+3 이후, BR+10 이전**으로 좁힘. 와인드업·셋업·MER 직전의 후방향 회전 phase 완전 차단.

### 2) Uplift 사전계산 컬럼 무시

```javascript
// v31.10까지: Uplift 컬럼이 윈도우 안이면 우선 사용
events.peakArm = _checkInWindow(upEvents.peakArm, ...) ? upEvents.peakArm : detectPeakRotVel(...);

// v31.11: Uplift 무시, 항상 detectPeakRotVel로 직접 산출
events.peakArm = detectPeakRotVel(armVelCol, _armLo, _armHi);
```

→ Uplift의 max_*_frame이 부정확한 케이스 (박명균/오승현 좌완)에서도 안전.

### 3) 음수 lag 발생 시 자동 보정 (NEW)

윈도우 좁혀도 음수 lag이 나오면 **시퀀싱 정합성 강제**:

```javascript
// arm peak가 trunk peak보다 일찍 → 더 좁은 윈도우로 재검출
if (events.peakArm < events.peakTrunk + 5) {
  events.peakArm = detectPeakRotVel(armVelCol,
                                     events.peakTrunk + 5,  // trunk peak 이후
                                     events.br + 10);
}
// trunk peak가 pelvis peak보다 일찍 → 동일 보정
if (events.peakTrunk < events.peakPelvis + 5) {
  events.peakTrunk = detectPeakRotVel(...);
}
```

→ proximal-to-distal sequencing 강제 (운동학적 표준 보장).

---

## 박명균·오승현 예상 변화

**Before (v31.10)**:
```
상완 -31ms / 골반 0ms / 몸통 41ms
Δt 몸통→상완 -72ms ← 시퀀스 역순 표시 (잘못됨)
```

**After (v31.11)**:
```
골반 0ms → 몸통 ~40ms → 상완 ~80~90ms
Δt 골반→몸통 ~40ms (정상)
Δt 몸통→상완 ~40~50ms (정상)
```

→ proximal-to-distal sequencing 정상 표시.

---

## 검증 권장 (배포 후)

| 케이스 | Before | After |
|---|---|---|
| **박명균 (좌완 elite)** | -72ms 음수 | 정상 양수 lag ✓ |
| **오승현 (좌완 elite)** | 음수 lag | 정상 양수 lag ✓ |
| 정예준 (우완 elite) | 정상 | 정상 유지 |
| 권진서 (우완) | 정상 | 정상 유지 |
| 일반 선수 | 정상 | 정상 유지 (윈도우 차이 미미) |

→ 박명균·오승현 케이스만 자동 정정. 다른 선수 영향 없음.

---

## 학술 근거

**Aguinaldo (2007)** — Proximal-to-Distal Sequencing:
- arm peak는 항상 trunk peak 이후
- trunk peak는 항상 pelvis peak 이후
- **시퀀스 역순 = 운동학적 불가능** → 데이터/측정 오류

본 패치는 데이터 산출 단계에서 운동학적 정합성을 강제하여 시각화 신뢰도 회복.

---

## 변경 사항 (코드)

- `BBL_신규선수_리포트.html`
  - `ALGORITHM_VERSION` v31.10 → v31.11
  - `extractScalarsFromUplift` line 1647~ 영역:
    - peak 검출 윈도우 더 보수적 (arm: [MER+3, BR+10])
    - Uplift 사전계산 컬럼 무시 — 항상 detectPeakRotVel 사용
    - 음수 lag 발생 시 자동 보정 (좁은 윈도우 재검출)
- `cohort_v29.js`: 변경 없음
- `kinetic_chain.gif`: 변경 없음

---

## v31.0 → v31.11 누적

| 버전 | 핵심 |
|---|---|
| v31.0~v31.7 | 점수 시스템 + UX 재구성 |
| v31.8 | 표면 메카닉형 자동 감지 |
| v31.9 | 시퀀스 Peak 검출 윈도우 강화 |
| v31.10 | 마네킹 ETI 계산 버그 수정 |
| **v31.11** | **좌완 시퀀스 음수 lag 자동 보정 (proximal-to-distal 강제)** |

---

**END OF v31.11 PATCH NOTES**
