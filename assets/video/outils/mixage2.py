# Mixage final selon assets/video/sfx/reperes.json (fichiers sources intacts).
import json, subprocess, sys
import imageio_ffmpeg
S = sys.argv[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
R = '/home/user/jackbrunet/assets/video/'
rep = json.load(open(R + 'sfx/reperes.json'))
cues = [(c['son'][:-4], c['ms'] / 1000, c['gain_db']) for c in rep['reperes_fixes']]
# Coupes : whoosh rapide -16 dB, 0,3 s avant, en alternant
coupes = [4.9, 14.9, 20.9, 26.9] + [48.9 + j for j in range(1, 15)] + [63.9]
for i, t in enumerate(coupes):
    cues.append((f'03-whoosh-rapide-{i % 3 + 1}', round(t - .3, 3), -16))
# Textes, cartes, badges qui apparaissent : pop -18 dB
pops = [4.9, 5.9, 6.9, 7.9, 10.46, 10.97, 16.39, 16.88, 17.38, 17.87, 22.45, 22.95, 27.14, 34.34, 41.68, 42.92, 43.15, 44.94, 46.03]
for i, t in enumerate(pops):
    cues.append((f'05-pop-texte-{i % 2 + 1}', t, -18))
# Démo de l'app : défilements (swipe) et changements d'écran du montage (tap)
for t in [11.47, 13.08, 15.5, 23.65, 29.9, 38.32, 39.51]:
    cues.append(('07-swipe-ecran', t, -18))
for k in range(1, 30, 2):
    cues.append(('06-tap-ecran', round(48.9 + k * .5, 2), -18))
args = [FF, '-y', '-loglevel', 'error', '-i', R + 'musique-presentation.mp3']
fil = []
for i, (n, t, g) in enumerate(cues, start=1):
    ms = int(round(max(0, t) * 1000))
    args += ['-i', R + 'sfx/' + n + '.mp3']
    fil.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={g}dB,adelay={ms}|{ms}[s{i}]')
fil.append('[0:a]aformat=sample_rates=44100:channel_layouts=stereo[m];[m]' + ''.join(f'[s{i}]' for i in range(1, len(cues) + 1))
           + f'amix=inputs={len(cues) + 1}:normalize=0:duration=first[x];[x]alimiter=limit=0.95:level=disabled[out]')
args += ['-filter_complex', ';'.join(fil), '-map', '[out]', '-c:a', 'pcm_s16le', S + '/video/mixage-final.wav']
subprocess.run(args, check=True)
print(len(cues), 'sons placés')
