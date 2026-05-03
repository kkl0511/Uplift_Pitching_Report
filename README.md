# BBL v31.4 — 카테고리 변수 정리 + MLB 평균 대비 점수 명시
**Build**: 2026-05-03 / **Patch**: v31.3 → v31.4 / **Type**: 변수 정리

---

## 변경 요약 (사용자 도메인 결정)

### 카테고리에서 제거된 변수 15개

**체력** (1개):
- SJ RSI-modified [m/s] (CMJ RSI와 정보 중복)

**메카닉** (14개):
| 카테고리 | 제거 변수 |
|---|---|
| C1 (하체 드라이브) | stride_norm_height, stride_time_ms, drive_hip_ext_vel_max |
| C2 (앞다리 블록) | lead_knee_ext_vel_max, com_decel_pct, lead_knee_amortization_ms, lead_hip_flex_at_fc, lead_hip_ext_vel_max |
| C3 (분리 형성) | peak_torso_counter_rot |
| C4 (트렁크 가속) | torso_side_bend_at_mer, trunk_flex_vel_max |
| C5 (상지 코킹·전달) | arm_trunk_speedup |
| C6 (릴리스 가속) | trunk_flex_vel_max(중복), peak_arm_av, torso_rotation_at_br |

### 카테고리별 변수 수 변화

| 카테고리 | Before | After |
|---|---|---|
| F1_Strength | 2 | 2 |
| F2_Power | 4 | 4 |
| F3_Reactivity | 3 | 2 |
| F4_Body | 3 | 3 |
| **체력 합계** | **12** | **11** |
| C1_LowerBodyDrive | 5 | 2 |
| C2_FrontLegBlock | 6 | 1 |
| C3_SeparationFormation | 6 | 5 |
| C4_TrunkAcceleration | 5 | 3 |
| C5_UpperBodyTransfer | 4 | 3 |
| C6_ReleaseAcceleration | 6 | 3 |
| **메카닉 합계** | **32** | **17** |

### 점수 라벨 명확화

**Before**: "MLB·문헌 표준 대비 발달도"
**After**: **"MLB 평균 대비 점수"**

각 위치별 변경:
- 헤더 메시지: "체력·메카닉 점수: MLB 평균 대비"
- 카테고리 차트 라벨: "MLB 평균 대비 점수"
- 카테고리 차트 안내: "100점 = MLB 평균 표준값. 80점+ = 한국 고1 elite. 50점 = 발달 평균."
- 종합 평가 percentile 행: "위 점수(MLB 평균 대비)는 장기 목표 지표..."
- 5단계 헤더: "장기 목표는 카테고리 차트의 MLB 평균 대비 점수"

---

## 변경 파일

- `cohort_v29.js`:
  - `category_vars`에서 15개 변수 제거
  - 다른 stats 블록 (var_distributions 등)은 그대로 유지 — 점수 산출에 영향 없음
- `BBL_신규선수_리포트.html`:
  - `ALGORITHM_VERSION` v31.3 → v31.4
  - 헤더 + 카테고리 차트 + 종합 평가 라벨에 "MLB 평균 대비" 명시
- `kinetic_chain.gif`: 변경 없음

---

## 정예준 케이스 예상 변화

**Before (v31.3)**: 메카닉 32개 변수 평균 (변수 다수가 결측)
**After (v31.4)**: 메카닉 17개 변수 평균 (핵심 변수만)

→ 메카닉 카테고리의 핵심 변수만 평가되어 결측 영향 감소 + 신뢰도 향상.

---

## 배포 절차

GitHub Pages에 다음 3개 파일 덮어쓰기:
1. `index.html`
2. `cohort_v29.js` (★ category_vars 변경됨)
3. `kinetic_chain.gif` (변경 없음)

→ Cmd+Shift+R → v31.4 확인

---

## 검증 권장 (배포 후)

- 카테고리 차트 라벨: "MLB 평균 대비 점수" 표시
- 메카닉 변수 17개로 축소된 후 점수 변화
- 결측 진단 카드 자동 갱신 (보류 카테고리 변화)

---

## v31.0 → v31.4 누적

| 버전 | 핵심 |
|---|---|
| v31.0 | MLB·문헌 표준 대비 점수 |
| v31.1 | 점수(MLB) + 코칭(코호트) 분리 |
| v31.2 | 결측 50% 초과 카테고리 점수 보류 |
| v31.3 | CMJ Impulse 제거 |
| **v31.4** | **메카닉 14개 + 체력 1개 정리 + 점수 라벨 명시** |

---

**END OF v31.4 PATCH NOTES**
