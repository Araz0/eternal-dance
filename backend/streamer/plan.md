- take path of fully recorded video
- feed video to ffmpeg to get highlights
- check results of ffmpeg
- if we have enough highlights, we can stop and go to next step
- if we don't have enough highlights, we can try to get more highlights by getting more frames from the video.
  - if we only have 0 highlights, get sample from beginning of video and then mid of video and then end of video ( 3 samples )
  - if we have 1 highlight, get 2 samples from start/midend of video ( 2 samples )
  - if we have 2 highlights, get sample from end of video ( 1 sample )
  - if we have 3 highlights, we can stop and go to next step
- take samples and render them to video with audio
- result should be 30 seconds long including 3 samples/hhighlights
- generate thumbnail from 30 seconds video (maybe first frame as a start)
- upload 30 seconds video online and get link to it
- upload thumbnail online and get link to it
- return online link

write functions to get begning/mid/end of video
define varibales like how many highlights we need, how many samples we need to get from video, how long the video should be, etc.
generate thumbnail from video and upload it online
