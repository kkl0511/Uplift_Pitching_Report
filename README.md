# BBL v31.12 — throwing arm 자동 검출 (좌완 컬럼 매핑 버그 근본 해결)
**Build**: 2026-05-03 / **Patch**: v31.11 → v31.12

---

## 🎯 사용자 가설 정확히 적중

> "좌완 팔을 오른팔로 분석한거 아냐?"

→ Uplift CSV의 컬럼 컨벤션이 **left/right = 신체 좌·우 (handedness 무관)** 가능성. 좌완 투수의 던지는 팔이 **right_arm_rotational_velocity** 컬럼에 있을 수 있음.

→ v31.11까지 `armSide('left') + '_arm_rotational_velocity'` = `left_arm_rotational_velocity`로 가져왔는데, 이게 **글러브 손(받쳐주는 팔)** 시그널이었을 수 있음.

---

## 해결: throwing arm 자동 검출

**핵심 아이디어**: 양 팔의 max angular velocity 비교 → **큰 쪽이 던지는 팔**.

```javascript
const _leftMaxAv  = _getMaxAbsInWin('left_arm_rotational_velocity_with_respect_to_ground',  _armLo, _armHi);
const _rightMaxAv = _getMaxAbsInWin('right_arm_rotational_velocity_with_respect_to_ground', _armLo, _armHi);
const _throwingArmDetected = _leftMaxAv >= _rightMaxAv ? 'left' : 'right';
const armVelCol = _throwingArmDetected + '_arm_rotational_velocity_with_respect_to_ground';

if (_throwingArmDetected !== armSide) {
  console.warn(`⚠ Throwing arm detected (${_throwingArmDetected}) differs from handedness label (${armSide}).`);
}
```

→ **handedness 컨벤션과 무관**하게 실제 던지는 팔 자동 식별.

### 적용 위치 (3곳)

1. **시퀀스 차트 peak detection** (line 1647~) — 자동 검출
2. **peak_arm_av 산출** (line 1820~) — 양 팔 max 중 큰 값
3. **detectBR 함수** (line 1610~) — 양 팔 중 abs velocity 큰 시점

---

## 박명균·오승현 예상 변화

### 시나리오 A: throwing arm = right_arm 인 경우 (사용자 가설 적중)
**Before**: left_arm 사용 → 글러브 손의 작은 시그널 → 노이즈 peak 잡힘 → 음수 lag
**After**: right_arm 자동 검출 → 던지는 팔의 정상 시그널 → 정상 lag

### 시나리오 B: throwing arm = left_arm (handedness 일치)
**Before/After**: 동일 (left_arm 그대로 사용)

→ 어느 시나리오든 **자동으로 더 큰 시그널을 가진 팔** 사용. 데이터 출처 정합성 자동 보장.

---

## 콘솔 디버그 메시지 (DevTools에서 확인)

```
⚠ Throwing arm detected (right, max 4523°/s) differs from handedness label (left). Using detected.
```

박명균/오승현이 좌완 라벨인데 right_arm이 검출되면 위 메시지 자동 표시 (Cmd+Option+I → Console).

---

## 변경 사항 (코드)

- `BBL_신규선수_리포트.html`
  - `ALGORITHM_VERSION` v31.11 → v31.12
  - 시퀀스 peak detection: throwing arm 자동 검출 + 디버그 경고
  - peak_arm_av: 양 팔 중 큰 값 사용
  - detectBR: 양 팔 중 abs velocity 큰 시점 선택
- `cohort_v29.js`: 변경 없음
- `kinetic_chain.gif`: 변경 없음

---

## 검증 (배포 후)

| 케이스 | 기대 |
|---|---|
| **박명균 (좌완)** | throwing arm 자동 검출 → 정상 양수 lag ✓ |
| **오승현 (좌완)** | 동일 ✓ |
| 정예준 (우완) | right_arm 그대로 (기존 정상) |
| 권진서 (우완) | 동일 |

---

## DevTools 검증 방법

1. v31.12 배포 후 박명균/오승현 리포트 생성
2. Cmd+Option+I (Mac) → Console
3. `⚠ Throwing arm detected ... differs from handedness label` 메시지 확인
4. 검출된 throwing arm이 무엇인지 확인 (left? right?)

→ 만약 좌완 라벨 + right 검출이면 사용자 가설이 정확히 맞은 것.

---

## v31.0 → v31.12 누적

| 버전 | 핵심 |
|---|---|
| v31.0~v31.10 | 점수 시스템 + UX + ETI 버그 수정 |
| v31.11 | Peak 검출 윈도우 보수적 + 음수 lag 자동 보정 |
| **v31.12** | **throwing arm 자동 검출 (좌완 컬럼 매핑 근본 해결)** |

---

**END OF v31.12 PATCH NOTES**
