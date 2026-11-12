---
title: Linux thinks Ireland is on daylight saving all winter
description: Irish law makes summer time the standard, so Linux calls an Irish winter daylight saving. And the usual Python UTC offset snippet gets Ireland wrong all year.
date: 2026-11-12
tags: [python, linux, timezones]
featured: true
---

Ireland's clocks do exactly what the UK's do: GMT in winter, an hour ahead in summer. Ask most computers, though, and Ireland's on daylight saving time right now, in November.

Which is why Robot Framework, the test automation tool, can't tell the time in UTC from Dublin. I asked it at 16:07 UTC this afternoon, with the clock set to Dublin and then to London:

```
$ TZ=Europe/Dublin robot clocks.robot
NOW 2026-11-12 16:07:44
UTC 2026-11-12 15:07:44
$ TZ=Europe/London robot clocks.robot
NOW 2026-11-12 16:07:45
UTC 2026-11-12 16:07:45
```

London's right. Dublin's an hour early, and from the end of March it'll be an hour late instead. It's been like that since 2018.

## Irish law makes winter the exception

In Ireland, summer time is the standard. The [Standard Time Act 1968](https://www.irishstatutebook.ie/eli/1968/act/23/enacted/en/print.html) put the clocks an hour ahead of GMT "throughout the year", and the [1971 amendment](https://www.irishstatutebook.ie/eli/1971/act/17/enacted/en/print.html) added a "period of winter time" when they're on GMT. So legally, the Irish clocks go back for winter rather than forward for summer.

The tz database, which nearly every computer gets its time zones from, took that literally in 2018 after Derick Rethans (who looks after PHP's dates) [pointed it out](https://github.com/eggert/tz/blob/main/NEWS). Dublin's winter is now daylight saving time of minus one hour. Some software couldn't cope with a negative one, so there's also a "rearguard" copy of the data, done the old way round.

The offsets and the names, GMT and IST, are the same either way. Only one flag changes, `tm_isdst`. Here's `zdump` on two Linux distros at the moment the clocks went back last month (trimmed):

```
debian:trixie  Oct 25 01:00 GMT isdst=1
rockylinux:9   Oct 25 01:00 GMT isdst=0
```

Rocky, like Red Hat, ships the rearguard copy. Debian, Ubuntu, Fedora, Arch and openSUSE all ship the main one. I asked Python, Go, Ruby, Perl, PHP, .NET, Rust and Postgres whether a winter's day in Dublin is daylight saving, and they all said yes. Java said no, as it turns the negative one back into an ordinary summer time when it builds its own copy of the data.

## Python's snippet mixes two answers

The top answer to "[Getting computer's UTC offset in Python](https://stackoverflow.com/questions/3168096/getting-computers-utc-offset-in-python)" on Stack Overflow, from 2010 and with 111 votes, is this:

```python
is_dst = time.daylight and time.localtime().tm_isdst > 0
utc_offset = - (time.altzone if is_dst else time.timezone)
```

`time.timezone` is meant to be your standard offset and `time.altzone` the daylight saving one, both in seconds west of UTC (hence the minus). On Linux, Python doesn't get those from the C library. It looks at the clocks in January and July and calls whichever is further ahead daylight saving, which is right nearly everywhere and backwards in Ireland.

So in Dublin, Python's `timezone` is 0 (GMT) and its `altzone` is -3600 (IST). But `tm_isdst` comes straight from the C library, which calls winter daylight saving. Mix the two and you get it backwards every day of the year:

| In Dublin | Real offset | `tm_isdst` | The snippet says |
| --------- | ----------- | ---------- | ---------------- |
| January   | +0          | 1          | +1               |
| July      | +1          | 0          | +0               |

`time.daylight` is 1 in Dublin, so the guard doesn't help. The same trick for the zone's name, `time.tzname[tm_isdst]`, says IST all winter and GMT all summer.

Python's [docs](https://docs.python.org/3/library/time.html#timezone-constants) do warn that those constants "may be incorrect for times in the past". In Dublin, the present too. They say to use `tm_gmtoff` and `tm_zone` instead, which come straight from the C library:

```python
lt = time.localtime()
lt.tm_gmtoff  # 0, in seconds
lt.tm_zone    # 'GMT'
```

Or this, if you'd rather have a `timedelta`:

```python
datetime.now().astimezone().utcoffset()
```

A [CPython PR](https://github.com/python/cpython/pull/161338) from Neil Schemenauer would make Python on Linux read the C library's values, and its tests expect that to put Dublin right. It's still waiting for a review.

## It's in llm, and a few hundred other places

GitHub's code search finds `time.altzone if time.localtime().tm_isdst` in about 270 Python files, and there are plenty more written other ways. Robot Framework's is the one above.

[llm](https://github.com/simonw/llm), Simon Willison's command line tool for language models, has a built-in [`llm_time` tool](https://github.com/simonw/llm/blob/c12fd50b9f/llm/tools.py) that a model can call to find out the time. It uses both tricks, so in Dublin today it tells the model this (trimmed):

```json
{
  "utc_time": "2026-11-12 16:07:51 UTC",
  "local_timezone": "IST",
  "local_time": "2026-11-12 16:07:51",
  "timezone_offset": "UTC+01:00",
  "is_dst": true
}
```

The local time and UTC match, then it says they're an hour apart, in the summer zone. Good luck to the model.

It's also in AWS's [date functions macro](https://github.com/aws-cloudformation/aws-cloudformation-templates/blob/d92ae9b9a5/CloudFormation/MacrosExamples/DateFunctions/handler.py) for CloudFormation, which gets away with it on Lambda, where the clock's UTC unless you change it. And in Stockfish's [fishtest worker](https://github.com/official-stockfish/fishtest/blob/036a55fc7b/worker/worker.py), which logs a local offset of +01:00 all through an Irish winter.

## Morocco's an hour out until January

Ireland's at least wrong the same way every year. Morocco moved to GMT for good on 20 September (it's in tz release 2026c). Python works its constants out from this January, when Morocco was on +1, so the same snippet has said +1 there ever since, against a real +0.

A Python started in 2027 looks at the new January and gets it right. Anything started before then stays an hour out until it's restarted.
