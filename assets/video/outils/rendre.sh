#!/bin/bash
# usage: rendre.sh <compo.html> <nom> <W> <H>
S=/tmp/claude-0/-home-user-jackbrunet/3aff1d9a-a7b8-5cdc-bf03-d72eaebcb083/scratchpad
F=$(python3 -c "import imageio_ffmpeg as f; print(f.get_ffmpeg_exe())")
M=/home/user/jackbrunet/assets/video/musique-presentation.mp3
D=$S/video/fr-$2
rm -rf $D
cd $S/pw && node video-rendu.js $1 $D full 60 $3 $4 || { echo "ECHEC rendu $2"; exit 1; }
$F -y -loglevel error -framerate 60 -i $D/%05d.jpg -i $S/video/mixage-final.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 17 -tune animation -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart $S/video/RHEMA-$2-HD.mp4 || { echo "ECHEC encodage $2"; exit 1; }
$F -y -loglevel error -framerate 60 -i $D/%05d.jpg -i $S/video/mixage-final.wav -map 0:v -map 1:a -c:v libx264 -preset slower -crf 22 -tune animation -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart $S/video/RHEMA-$2-leger.mp4 || { echo "ECHEC leger $2"; exit 1; }
echo "FINI $2"
