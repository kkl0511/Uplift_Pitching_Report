# BBL v32.1 — 악력(Grip Strength) F1_Strength 통합
**Build**: 2026-05-04 / **Patch**: v32.0 → v32.1 / **Type**: 변수 추가

---

## v32.1 변경 (악력 통합)

### 배경
v32.0 개정안의 Phase 2 항목으로 보류했던 `Grip Strength`를 **master_fitness.xlsx 268명 데이터 확보**로 즉시 통합. 분석 문서에서 Grip cross d=+1.18 (Large)로 IMTP/BM(d=+0.98)보다도 큰 효과.

### 변경 사항

**1. cohort_v29.js**:
- `var_distributions`에 `Grip Strength` 추가 (n=268, mean=51.33 kg, sd=7.48)
- `var_distributions`에 `Grip Strength / BM [kg/kg]` 추가 (mean=0.635, sd=0.093)
- `var_sorted_lookup`에 두 변수의 정렬 배열 추가 (각 268개)
- `category_vars.F1_Strength`에 `Grip Strength` 항목 추가

**2. BBL_신규선수_리포트.html**:
- `ALGORITHM_VERSION` v32.0 → **v32.1**
- `CATEGORY_WEIGHTS.F1_Strength` 신설 — IMTP/BM·Grip 둘 다 1.00 (Large effect)
- `FITNESS_KEYS_FROM_MASTER`에 `'Grip Strength'` 추가 (master_fitness.xlsx 자동 매칭)

### 효과 시뮬레이션 (분석 문서 §3 그룹 평균값)

| | 빠른 그룹 | 느린 그룹 | 차이 |
|---|---:|---:|---:|
| v32.0 (IMTP only) | 72점 | 40점 | **32점** |
| v32.1 (IMTP + Grip) | 74점 | 36점 | **38점** |

→ F1_Strength 변별력 +19% (Grip Strength이 빠른/느린 그룹을 IMTP보다 더 잘 구별).

### 검증
```
JS syntax: ✅ 두 파일 모두 통과
Grip percentile lookup:
  빠른 그룹 56.4 kg → 76th percentile
  느린 그룹 47.4 kg → 32nd percentile
  d 비례 변별력 확인
```

---

# BBL v32.0 — 134명 코호트 효과크기 기반 점수 개정 + IPS(향상 잠재력 점수) 도입
**Build**: 2026-05-04 / **Patch**: v31.24 → v32.0 / **Type**: 산식 개정

---

## 🎯 변경 요약

134명 BBL 고교 1년 투수 코호트(Spring 2025 = H1, Fall 2025 = H2)의 페어드 분석 결과를 점수 산정 방식에 반영.

### 핵심 발견 (분석 문서 §3 요약)
1. **단기 향상 동력 = 메카닉**, 특히 **C4 몸통 가속** (cross d=+1.25, 단일 최대)
2. **단일 최강 변수**: `trunk_flex_vel_max` (long d=+0.96, cross d=+0.89)
3. **C5 코킹은 차이 없음** (d=+0.09, MER ~190° 천장 효과)

### 반영 방향
- **현재 수행력 점수 (Cross-sectional)**: 카테고리 가중치 효과크기 비례화 + C4 내부 변수 가중치 강화
- **향상 잠재력 점수 (IPS)**: 신규 도입 — H1↔H2 비교 뷰 전용

---

## 변경 사항

### 1. 메카닉 종합 점수 — 카테고리 가중치 도입

**이전**: `Mechanics_Score = 단순 평균(C1~C5)`
**v32.0**: 효과크기 기반 가중 평균 (`MECHANICS_AREA_WEIGHTS`)

| 카테고리 | 이전 | v32.0 | 근거 |
|---|---:|---:|---|
| C1_LowerBodyDrive | 1.0 | **1.0** | cross d=+0.94 |
| C2_FrontLegBlock | 1.0 | **0.8** | cross d=+0.71 |
| C3_SeparationFormation | 1.0 | **1.0** | cross d=+0.83 |
| **C4_TrunkAcceleration** | 1.0 | **1.5** | ★ cross d=+1.25 (단일 최대) |
| **C5_UpperBodyTransfer** | 1.0 | **0.5** | d=+0.09 (MER 천장 효과) |

→ 합 4.8. C4 비중 31%, C5 비중 10%.

### 2. C4_TrunkAcceleration 내부 변수 가중치

| 변수 | 이전 | v32.0 | 근거 |
|---|---:|---:|---|
| **trunk_flex_vel_max** | 0.40 | **1.00** | ★ long d=+0.96 (단일 최강) |
| max_trunk_twist_vel_dps | 0.60 | **0.80** | cross d=+0.90 |
| pelvis_to_trunk_lag_ms | 0.80 | 0.80 | 유지 |
| max_pelvis_rot_vel_dps | 0.40 | 0.40 | 유지 |
| torso_side_bend_at_mer | 0.60 | **0.40** | 효과 미관찰 |

### 3. IPS — Improvement Potential Score (신규)

H1↔H2 두 시점이 모두 측정된 선수에게만 산출. 종단 효과크기 기반 가중 z-score 합.

```
IPS = 50 + 20 × Σ(w_i × Z(Δx_i)) / Σ(w_i)

w_trunk_flex_vel_max     = 0.40   (long d=+0.96)
w_C4_TrunkAcceleration   = 0.30   (long d=+0.63)
w_Mechanics_Score        = 0.20   (long d=+0.57)
w_C1_LowerBodyDrive      = 0.10   (long d=+0.45)
```

**해석**: ≥70 급성장형 / 50~70 정상 발달 / 30~50 주의 / <30 정체 위험

**Phase 1 잠정값** (cohort_v29.js `delta_distributions`):
- trunk_flex_vel_max ΔH SD ≈ 60 °/s
- C4 점수 ΔH SD ≈ 12점
- Mechanics 종합 ΔH SD ≈ 11점, mean ≈ 5점
- C1 점수 ΔH SD ≈ 10점

→ Phase 2(134명 페어드 raw 분포)에서 정확값으로 갱신 예정.

### 4. 코드 변경 위치

- **`BBL_신규선수_리포트.html`**:
  - `ALGORITHM_VERSION` v31.24 → **v32.0**
  - `MECHANICS_AREA_WEIGHTS` 신규 상수 (4137 라인 부근)
  - `computeMechanicsScore()` 헬퍼 신규
  - `Mechanics_Score` 계산을 가중평균으로 교체
  - `CATEGORY_WEIGHTS.C4_TrunkAcceleration` 갱신
  - `IPS_WEIGHTS`, `_zOfDelta()`, `calculateIPS()` 신규
  - `renderIPSCard()` 신규 — H1↔H2 결과 상단 표시
  - `calculateScores()` 결과에 `_raw_inputs` 포함 (IPS용)
- **`cohort_v29.js`**:
  - `delta_distributions` 신규 섹션 (Phase 1 잠정값)

---

## 효과 시뮬레이션 (분석 문서 §3 평균값 기반)

### 횡단 — 빠른 vs 느린 그룹 메카닉 종합 점수

| | 이전 (단순 평균) | v32.0 (가중 평균) |
|---|---:|---:|
| 느린 그룹 | 44.2 | **41.1** |
| 빠른 그룹 | 59.4 | **59.2** |
| **차이** | **15.1점** | **18.1점** ↑ |

→ C4 약점이 약점으로 더 명확히 진단됨. 변별력 +20%.

### 종단 — 향상 vs 정체 그룹 IPS

| | trunk_flex Δ | C4 Δ | Mech Δ | C1 Δ | **IPS** | 라벨 |
|---|---:|---:|---:|---:|---:|---|
| 향상 그룹 | +41 | +6.1 | +10.7 | +5.2 | **61.6** | 정상 발달 |
| 정체 그룹 | −39 | −6.8 | +4.5 | −3.5 | **40.5** | 주의 |

→ 21점 차이로 명확히 구분.

---

## 변경하지 않은 것

- **C2 무릎 평가 임계** (메모리: 0 이상 만점, 음수만 감점)
- **C5 max_shoulder_ER_deg 변수 자체** (부상 모니터링용, 카테고리 가중치만 축소)
- **좌완 -3 km/h offset** (회귀 절편 구조)
- **시퀀싱 lag 발달 단계 컨텍스트** 관대 처리
- **카테고리 결측 50% 보류** 신뢰성 장치 (v31.2 도입)

---

## 검증

```
JS syntax check (node --check):
  BBL_신규선수_리포트.html script blocks: ✅ OK
  cohort_v29.js: ✅ OK

Synthetic input sanity check:
  ✅ 빠른/느린 그룹 변별력 +20% 확인
  ✅ 향상/정체 그룹 IPS 21점 차이 확인
```

배포 후 권장 검증:
1. 기존 저장된 H1·H2 페어 선수 1~2명 열어서 IPS 카드 정상 표시 확인
2. trunk_flex_vel_max 결측 선수에서 IPS "부분 측정" 안내 정상 표시 확인
3. Mechanics_Score가 이전 대비 약점 강조형으로 변동했는지 spot check

---

## Phase 2 별도 작업 (코호트 재학습 시)

- `Grip Strength` 분포 추가 → F1_Strength에 `Grip / BM` 변수 통합
- `delta_distributions` 134명 페어드 정확값으로 갱신
- IPS 가중치 다중회귀로 재학습
- `peak_x_factor`·`max_cog_velo` 결측 보강

---

## v31.12 → v32.1 누적

| 버전 | 핵심 |
|---|---|
| v31.12 | throwing arm 자동 검출 |
| v31.13~v31.24 | UX·임계 fine-tune |
| v32.0 | 134명 코호트 효과크기 기반 카테고리 가중치 + IPS 신설 |
| **v32.1** | **악력(Grip Strength) F1_Strength 통합 (cross d=+1.18 Large)** |

---

## 배포 절차

GitHub 레포(`kkl0511/BBL_Pitching_Report1`) 루트에 다음 3개 파일 덮어쓰기 업로드:
1. `BBL_신규선수_리포트.html`
2. `cohort_v29.js`
3. `README.md`

→ Cmd+Shift+R (캐시 무효화 새로고침) → 좌측 상단 **v32.0** 확인

---

**END OF v32.0 PATCH NOTES**
