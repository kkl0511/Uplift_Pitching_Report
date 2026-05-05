"""
batch_process_cohort.py — 23명 매칭 trial 일괄 처리 (multiprocessing)
extract_uplift_scalars.py 산출 → per_trial.csv + per_session.csv
"""

import os, sys, json, glob, time
from multiprocessing import Pool, cpu_count
from pathlib import Path
import pandas as pd

# 동일 디렉토리 모듈
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_uplift_scalars import extract_scalars

ROOT = "/sessions/laughing-dreamy-bell/mnt/uplift_pilot_zip"
OUT_DIR = "/sessions/laughing-dreamy-bell/mnt/BBL 피칭 리포트(개별선수 입력)"

# [v33.10] 134 코호트 전체 재처리 (분포 갱신용)
#   PROCESS_ALL=True: 1810 trial 전체 (cohort_v29.js 분포 갱신용)
#   PROCESS_ALL=False: 23명 매칭만 (Theia 비교용)
import os
PROCESS_ALL = os.environ.get('PROCESS_ALL', '1') == '1'

# Theia → BBL raw 폴더 매칭 (확정 23명, PROCESS_ALL=False일 때만 사용)
MATCHED_NAMES = [
    "chahyeonbin","kimtaehyeon","leesiyul","moonjunhyeok","baeminseong",
    "kimgangyeon","kimhyeonseo","kimonse","kwonhaebin","leejinseo",
    "parkgyehwan","parkmyeonggyun","shingangheun",
    "anhyeonseok","antaegeon","kimdongun","kimraehyeon","seoyeongwook",
    "jeongmyeongyoon","kwontaeung","namyehyeon","songyeongrok","yoonjiseop",
]

# Theia 영문명 ↔ BBL 영문명 (역매핑)
THEIA_TO_BBL = {
    "chahyeonbin":"chahyeonbin","kimtaehyeon":"kimtaehyeon","leesiyul":"leesiyul",
    "moonjunhyeok":"moonjunhyeok","baeminseong":"baeminseong","kimgangyeon":"kimgangyeon",
    "kimhyeonseo":"kimhyeonseo","kimonse":"kimonse","kwonhaebin":"kwonhaebin",
    "leejinseo":"leejinseo","parkgyehwan":"parkgyehwan","parkmyeonggyun":"parkmyeonggyun",
    "shingangheun":"shingangheun",
    "ahnhyeonseok":"anhyeonseok","ahntaegeon":"antaegeon","kimdongwoon":"kimdongun",
    "kimlaehyeon":"kimraehyeon","seoyoungwook":"seoyeongwook",
    "jeongmyeongyun":"jeongmyeongyoon","kwontaewoong":"kwontaeung",
    "namyehyun":"namyehyeon","songyungrok":"songyeongrok","yunjiseop":"yoonjiseop",
}


def collect_trials(matched_names=None):
    """raw 폴더에서 trial CSV 수집. matched_names=None이면 134 코호트 전체."""
    trials = []
    for part in sorted(os.listdir(ROOT)):
        pdir = os.path.join(ROOT, part)
        if not os.path.isdir(pdir):
            continue
        for sd in sorted(os.listdir(pdir)):
            if "_" not in sd or not os.path.isdir(os.path.join(pdir, sd)):
                continue
            if matched_names is not None:
                player = sd.rsplit("_", 1)[0]
                if player not in matched_names:
                    continue
            sd_path = os.path.join(pdir, sd)
            for csv_file in sorted(glob.glob(os.path.join(sd_path, "Trial_*.csv"))):
                trials.append(csv_file)
    return trials


def process_one(csv_path):
    try:
        result = extract_scalars(csv_path)
        result['_csv'] = csv_path
        result.pop('events', None)  # 직렬화 문제 방지
        return result
    except Exception as e:
        return {'_error': str(e), '_csv': csv_path}


def main():
    if PROCESS_ALL:
        print("=== [v33.10] 134 코호트 전체 trial 재처리 (cohort_v29.js 분포 갱신용) ===")
        trials = collect_trials(None)
    else:
        print("=== 23명 매칭 BBL trial 일괄 처리 (Theia 비교용) ===")
        trials = collect_trials(set(MATCHED_NAMES))
    print(f"trial CSV: {len(trials)}개")

    t0 = time.time()
    with Pool(cpu_count()) as pool:
        results = pool.map(process_one, trials)
    print(f"처리 시간: {time.time()-t0:.1f}s")

    errors = [r for r in results if r.get('_error')]
    valid = [r for r in results if not r.get('_error')]
    print(f"성공: {len(valid)}, 에러: {len(errors)}")
    if errors[:3]:
        for e in errors[:3]:
            print(f"  ERR: {e['_csv']}: {e['_error']}")

    # per_trial.csv
    df_trial = pd.DataFrame(valid)
    df_trial['player'] = df_trial['session_folder'].str.rsplit('_', n=1).str[0]
    df_trial.to_csv(os.path.join(OUT_DIR, "bbl_per_trial.csv"), index=False)
    print(f"saved: bbl_per_trial.csv ({len(df_trial)} rows × {len(df_trial.columns)} cols)")

    # 변수 목록 (수치형 평균 대상)
    META = {'athlete_name','capture_time','fps','handedness','arm_side','throwing_arm_detected',
            'session_folder','_csv','_csv_path','_error','player'}
    SCALAR_VARS = [c for c in df_trial.columns if c not in META]

    # per_session.csv (session_folder별 평균)
    sess_rows = []
    for sf, g in df_trial.groupby('session_folder'):
        if pd.isna(sf):
            continue
        row = {
            'session_folder': sf,
            'player': g['player'].iloc[0],
            'n_trials': len(g),
            'capture_time': g['capture_time'].iloc[0],
            'handedness': g['handedness'].iloc[0],
            'arm_side': g['arm_side'].iloc[0],
            'fps': g['fps'].mean(),
        }
        for v in SCALAR_VARS:
            s = pd.to_numeric(g[v], errors='coerce').dropna()
            if len(s):
                row[f'{v}_mean'] = s.mean()
                if len(s) >= 2:
                    row[f'{v}_sd'] = s.std()
        sess_rows.append(row)
    df_sess = pd.DataFrame(sess_rows)
    df_sess.to_csv(os.path.join(OUT_DIR, "bbl_per_session.csv"), index=False)
    print(f"saved: bbl_per_session.csv ({len(df_sess)} sessions × {len(df_sess.columns)} cols)")

    # per_player.csv (선수별 모든 trial 평균 — Theia 비교 단위)
    player_rows = []
    for player, g in df_trial.groupby('player'):
        row = {
            'player': player,
            'n_sessions': g['session_folder'].nunique(),
            'n_trials': len(g),
            'handedness': g['handedness'].iloc[0],
            'arm_side': g['arm_side'].iloc[0],
            'fps_mean': g['fps'].mean(),
        }
        for v in SCALAR_VARS:
            s = pd.to_numeric(g[v], errors='coerce').dropna()
            if len(s):
                row[f'{v}'] = s.mean()
                if len(s) >= 2:
                    row[f'{v}_sd'] = s.std()
        player_rows.append(row)
    df_player = pd.DataFrame(player_rows)
    df_player.to_csv(os.path.join(OUT_DIR, "bbl_per_player.csv"), index=False)
    print(f"saved: bbl_per_player.csv ({len(df_player)} players × {len(df_player.columns)} cols)")
    print("\n=== 선수별 trial 수 ===")
    for _, r in df_player[['player','n_sessions','n_trials','arm_side']].iterrows():
        print(f"  {r['player']:<18} sessions={r['n_sessions']:<3} trials={r['n_trials']:<4} arm={r['arm_side']}")


if __name__ == '__main__':
    main()
