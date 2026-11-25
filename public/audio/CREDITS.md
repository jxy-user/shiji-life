# 音频来源与许可

本目录音频为治愈系环境音乐片段，全部来自 **Public Domain / CC0** 授权作品，允许自由使用、修改与再分发（含商业用途），无需署名亦无版权限制。此处仍保留来源以便追溯。

| 文件 | 曲目 | 作者 / 专辑 | 许可 |
|---|---|---|---|
| `millennium-ambient.*` | 千年之后（氛围版） | 用户提供音频 | 由项目方提供并自行承担授权 |
| `healing-lake.*` | The Healing Lake | Uplifting Pills · *Calm Pill 11* | [CC0 1.0](http://creativecommons.org/publicdomain/zero/1.0/) |
| `painting-twilight.*` | Painting Twilight | Uplifting Pills · *Calm Pill 15* | [CC0 1.0](http://creativecommons.org/publicdomain/zero/1.0/) |
| `slow-drifter.*` | Slow Drifter | Uplifting Pills · *Calm Pill 26* | [CC0 1.0](http://creativecommons.org/publicdomain/zero/1.0/) |

> `millennium-ambient` 由用户提供的 MP3 转码而来（约 2:14），字幕版权归原权利人，项目方需自行确认使用授权。

原作品：<https://archive.org/details/CalmPills>（Alaeddin Hallak 整理的 Calm Pills 环境音乐合集）。

## 处理说明

原始曲目为约 1 小时的混音长轨。为控制仓库与首屏体积，每首按时间轴截取 3 分钟片段，并做 2s 淡入 / 3s 淡出：

```bash
# 截取 180 秒片段并加淡入淡出
ffmpeg -ss 900 -t 180 -i <source>.mp3 -vn -ac 2 -ar 44100 \
  -af "afade=t=in:st=0:d=2,afade=t=out:st=177:d=3" raw.wav

# 输出 Ogg Vorbis（q1）与 MP3（80kbps），双格式兼容各浏览器
ffmpeg -i raw.wav -c:a libvorbis -q:a 1 out.ogg
ffmpeg -i raw.wav -c:a libmp3lame -b:a 80k out.mp3
```

替换或新增曲目时，把同名 `.ogg` / `.mp3` 放进本目录，并在 `src/features/player/tracks.ts` 登记即可。
