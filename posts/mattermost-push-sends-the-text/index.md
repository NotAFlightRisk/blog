---
title: Self-hosted Mattermost sends your DMs via Google and Apple
description: Mattermost's docs say a new server keeps message text out of phone notifications. Any set up since mid-2020 sends the whole message, via Google or Apple.
date: 2026-11-11
tags: [privacy, self-hosting, security, opensource, mattermost]
---

Mattermost's [mobile FAQ](https://docs.mattermost.com/deployment-guide/mobile/mobile-faq.html) has a line for anyone who self-hosts it to keep their chat to themselves:

> Default server settings have message contents turned off.

Here's what a brand-new Mattermost 12.1 server sent when alice DMed bob, who has the Android app. (it's trimmed, but nothing's changed)

```json
{
  "message": "the spare key is under the blue plant pot, code 4417",
  "sender_name": "@alice",
  "channel_name": "@alice",
  "type": "message",
  "platform": "android_rn-v2",
  "device_id": "FAKE-FCM-TOKEN-0001"
}
```

That goes to `push-test.mattermost.com`, Mattermost's free Test Push Notification Service (TPNS), which passes it to Google's Firebase for Android phones or Apple's push service for iPhones, and they then put it on bob's lock screen. An @mention in a channel works the same way, as "@alice: @bob the wifi password is now otter-pancake-91".

I ran the server in Docker on a network with no way out. The only setting I touched was the relay's address, so the push came to a little listener of mine instead, and everything else was how the server came. The hop from the relay to Google or Apple is from the [relay's source](https://github.com/mattermost/mattermost-push-proxy), which copies `message` straight into what it sends them.

By default it does this for every DM and @mention, unless you're actually looking at that conversation at the time or you're on Do Not Disturb. If your server was set up since mid-2020 and nobody's changed Push Notification Contents, yours does it too. You can see it in the System Console, under Site Configuration, Notifications, or on the server if local mode's on (it is in the Docker image):

```sh
mmctl --local config get EmailSettings.PushNotificationContents
```

`"full"` means the message goes in the push.

## Generic, according to the docs

The [settings docs](https://docs.mattermost.com/administration-guide/configure/site-configuration-settings.html) mark "Generic description with sender and channel names" as the default, which only says who sent it and where. A few lines further down that FAQ, it also says push notifications are disabled by default. My new server had them on, pointed at the test relay.

The server's own default is `full`, and has been since a [pull request in May 2020](https://github.com/mattermost/mattermost/pull/14565) that made it full "to improve user experience in Mattermost for new installs". It's still there in 12.1:

```go title="server/public/model/config.go"
if s.PushNotificationContents == nil {
	s.PushNotificationContents = new(FullNotification)
}
```

That only fills in a setting the config file hasn't got. A server from before 5.24 already had `generic` written into its config, so it kept it, and anything newer got `full`. The Helm chart and Mattermost's own Docker setup don't change it, and the docs still say generic today.

To be fair, the System Console tells you if you go and look. Its help text says full content "is relayed through Apple's Push Notification Service (APNS) or Google's Firebase Cloud Messaging (FCM)". But you'd only go and look if you didn't believe the docs.

## Three companies in the middle

The connection to the relay is HTTPS, but the relay itself gets the message as plain JSON, and Mattermost's [terms](https://mattermost.com/hpns-terms/) say "messages sent via the TPNS will not be encrypted" and "You assume all risk". The relay's open source code doesn't log the message, but I can't see what push-test.mattermost.com actually runs. Mattermost's own docs say TPNS isn't recommended for production, which is a funny thing for every new server to point at.

Then Google or Apple, who get the text, who sent it and the channel name. In December 2023 [Senator Wyden said](https://www.reuters.com/technology/cybersecurity/governments-spying-apple-google-users-through-push-notifications-us-senator-2023-12-06/) foreign governments had been asking both of them for push notification data.

## The other messaging apps don't do this

Push always goes via Google or Apple, but what's in it is up to the server and the app. Here's what each one sends by default:

| Server                 | What's in the push                                         |
| ---------------------- | ---------------------------------------------------------- |
| Mattermost 12          | The message, who sent it and the channel                   |
| Rocket.Chat            | The message, who sent it and the room                      |
| Matrix, with Element X | An event ID, and the app fetches the message itself        |
| Prosody (XMPP)         | No message or sender, at most a placeholder "New Message!" |
| Zulip 12               | Only ciphertext the app can read, if the app's up to date  |

Only the Mattermost row is from my capture. The rest are from each project's source and docs, and Rocket.Chat's has been known for years. Its staff [said on its forum](https://forums.rocket.chat/t/push-notifications-and-gdpr/3802) in 2021 that the message would "STILL be in plain text" even through a European gateway.

Mattermost and Rocket.Chat can both do it the Element X way, where the push only carries an ID and the app fetches the rest, and both want a licence for it. Mattermost calls it "Full message content fetched from the server on receipt". I picked it on the free Team Edition anyway, and the server quietly sent the generic version instead.

## Switching it off

Set Push Notification Contents to "Generic description with sender and channel names", or "Generic description with only sender name". The setting lives under `EmailSettings`, for some reason, so with mmctl or Docker it's:

```sh
mmctl --local config set EmailSettings.PushNotificationContents generic
MM_EMAILSETTINGS_PUSHNOTIFICATIONCONTENTS=generic
```

Then bob's phone just says alice sent him a message, and he has to open the app to find out where the key is. Running your own relay is the other way, but only Mattermost's relay holds the Apple and Google keys for the store apps, so that means building your own apps too.

Mattermost's [admin onboarding checklist](https://docs.mattermost.com/administration-guide/upgrade/admin-onboarding-tasks.html) has a step for this setting as well. Number 4 is "Enable full content push notifications".
