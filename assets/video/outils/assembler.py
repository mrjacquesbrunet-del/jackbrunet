# Assemble une vidéo à partir de morceaux (vidéo existante ou images rendues) + mixage final.
import subprocess, sys, imageio_ffmpeg
S = '/tmp/claude-0/-home-user-jackbrunet/3aff1d9a-a7b8-5cdc-bf03-d72eaebcb083/scratchpad/video'
FF = imageio_ffmpeg.get_ffmpeg_exe()
def assembler(morceaux, sortie):
    # morceaux : liste de (source, debut, fin) ; source .mp4 = numéros d'image absolus ; dossier = numéros relatifs
    entrees, idx, fil, noms = [], {}, [], []
    for src, a, b in morceaux:
        if src not in idx:
            idx[src] = len(idx)
            entrees += (['-i', src] if src.endswith('.mp4') else ['-framerate', '60', '-i', src + '/%05d.jpg'])
    compte = {}
    for src, a, b in morceaux: compte[src] = compte.get(src, 0) + 1
    vu = {}
    for src, n in compte.items():
        if n > 1: fil.append(f'[{idx[src]}:v]split={n}' + ''.join(f'[{idx[src]}s{k}]' for k in range(n)))
    for j, (src, a, b) in enumerate(morceaux):
        k = vu.get(src, 0); vu[src] = k + 1
        lab = f'[{idx[src]}s{k}]' if compte[src] > 1 else f'[{idx[src]}:v]'
        fil.append(f'{lab}trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[m{j}]')
        noms.append(f'[m{j}]')
    fil.append(''.join(noms) + f'concat=n={len(noms)}:v=1:a=0,format=yuv420p[v]')
    a_idx = len(idx)
    for q, crf, preset, ab in [('HD', 17, 'slow', '256k'), ('leger', 22, 'slower', '192k')]:
        cmd = [FF, '-y', '-loglevel', 'error'] + entrees + ['-i', S + '/mixage-final.wav', '-filter_complex', ';'.join(fil),
               '-map', '[v]', '-map', f'{a_idx}:a', '-c:v', 'libx264', '-preset', preset, '-crf', str(crf), '-tune', 'animation', '-r', '60',
               '-c:a', 'aac', '-b:a', ab, '-shortest', '-movflags', '+faststart', f'{S}/{sortie}-{q}.mp4']
        subprocess.run(cmd, check=True)
    print('assemblé', sortie)
R1, R2, N = (1611, 1977), (2454, 2880), 4062
job = sys.argv[1]
if job in ('FR16', 'FR9', 'EN16', 'PT16'):
    base = {'FR16': 'RHEMA-youtube-16x9-HD-ancien.mp4', 'FR9': 'RHEMA-vertical-9x16-HD-ancien.mp4',
            'EN16': 'RHEMA-youtube-16x9-EN-HD-ancien.mp4', 'PT16': 'RHEMA-youtube-16x9-PT-HD-ancien.mp4'}[job]
    B, r1, r2 = f'{S}/{base}', f'{S}/p-{job}-1', f'{S}/p-{job}-2'
    m = [(B, 0, R1[0]), (r1, 0, R1[1] - R1[0]), (B, R1[1], R2[0]), (r2, 0, R2[1] - R2[0])]
    if job.startswith('FR'):
        fin = f"{S}/fin-{'16x9' if job == 'FR16' else '9x16'}"
        m += [(B, R2[1], 3840), (fin, 0, N - 3840)]
    else:
        m += [(B, R2[1], N)]
    nom = {'FR16': 'RHEMA-youtube-16x9', 'FR9': 'RHEMA-vertical-9x16', 'EN16': 'RHEMA-youtube-16x9-EN', 'PT16': 'RHEMA-youtube-16x9-PT'}[job]
    assembler(m, nom)
else:  # EN9 / PT9 : début déjà rendu + suite
    L = job[:2]
    assembler([(f'{S}/fr-vertical-9x16-{L}', 0, 1300), (f'{S}/suite-9x16-{L}', 0, N - 1300)], f'RHEMA-vertical-9x16-{L}')
