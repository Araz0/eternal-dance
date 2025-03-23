# Extracting Highlights from MP4 Recordings

To extract three 10-second highlights from your 3-minute MP4 recordings and merge them into a single 30-second video without using AI services, follow these steps:

---

## 1. Detect Audio Peaks

High audio levels often correspond to exciting moments. You can analyze the audio to find these peaks using FFmpeg's `astats` filter:

```bash
ffmpeg -i input.mp4 -af "astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=audio_levels.txt" -f null -
```

This command processes the input video and logs the RMS (Root Mean Square) levels, indicating audio intensity, to `audio_levels.txt`. By examining this file, you can identify timestamps with high audio intensity, which are potential highlight moments.

---

## 2. Detect Scene Changes

Visual transitions can also signify important events. To detect scene changes, use FFmpeg's `select` filter:

```bash
ffmpeg -i input.mp4 -vf "select='gt(scene,0.4)',showinfo" -f null - 2> scene_changes.txt
```

This command analyzes the video for frames where the scene change score exceeds `0.4` (on a scale from 0 to 1) and logs the details to `scene_changes.txt`. Adjust the threshold as needed to fine-tune sensitivity.

---

## 3. Identify Highlight Segments

By correlating the data from `audio_levels.txt` and `scene_changes.txt`, pinpoint overlapping timestamps where both audio peaks and scene changes occur. These overlaps are strong indicators of highlight-worthy moments.

---

## 4. Extract Highlight Clips

Once you've identified the start times of potential highlights, extract 10-second clips using FFmpeg:

```bash
ffmpeg -i input.mp4 -ss [start_time] -t 10 -c copy highlight_[index].mp4
```

- Replace `[start_time]` with the actual timestamp (e.g., `00:01:30` for 1 minute and 30 seconds).
- Replace `[index]` with a sequential number for each highlight.

---

## 5. Merge Highlight Clips

After extracting the clips, merge them into a single 30-second video.

### Create a Text File

First, create a text file `file_list.txt` listing the highlight clips:

```text
file 'highlight_1.mp4'
file 'highlight_2.mp4'
file 'highlight_3.mp4'
```

### Merge the Clips

Use FFmpeg's `concat` demuxer to merge the clips:

```bash
ffmpeg -f concat -safe 0 -i file_list.txt -c copy output_highlight.mp4
```

This command concatenates the listed video files into a single output file.

---

## Automation Considerations

1. **Scripting**: Automate the process using a scripting language like Python or Bash. Parse the `audio_levels.txt` and `scene_changes.txt` files to programmatically determine highlight segments.

2. **Threshold Adjustment**: Fine-tune the audio peak and scene change thresholds based on your specific content to improve accuracy.

3. **Batch Processing**: If dealing with multiple videos, implement batch processing to handle all files efficiently.

---

By following this approach, you can create an automated system to extract and compile 30-second highlights from your recordings without relying on AI services.
