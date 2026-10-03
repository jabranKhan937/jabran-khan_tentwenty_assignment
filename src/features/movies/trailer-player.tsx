import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { colors, fonts, spacing } from '@/constants/theme';

type TrailerPlayerProps = {
  videoId: string;
  onClose: () => void;
};

function safeVideoId(videoId: string): string | null {
  return /^[A-Za-z0-9_-]{6,}$/.test(videoId) ? videoId : null;
}

function playerHtml(videoId: string): string {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body, #player { margin: 0; height: 100%; background: #000; }
    </style>
  </head>
  <body>
    <div id="player"></div>
    <script src="https://www.youtube.com/iframe_api"></script>
    <script>
      function onYouTubeIframeAPIReady() {
        new YT.Player('player', {
          videoId: '${videoId}',
          playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
          events: {
            onReady: function (event) { event.target.playVideo(); },
            onStateChange: function (event) {
              if (event.data === 0) window.ReactNativeWebView.postMessage('ended');
            },
            onError: function () { window.ReactNativeWebView.postMessage('error'); }
          }
        });
      }
    </script>
  </body>
</html>`;
}

export function TrailerPlayer({ videoId, onClose }: TrailerPlayerProps) {
  const insets = useSafeAreaInsets();
  const [failed, setFailed] = useState(false);
  const id = safeVideoId(videoId);

  function onMessage(event: WebViewMessageEvent) {
    if (event.nativeEvent.data === 'ended') {
      onClose();
      return;
    }

    if (event.nativeEvent.data === 'error') {
      setFailed(true);
    }
  }

  return (
    <Modal animationType="fade" visible onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.screen}>
        {id && !failed ? (
          <WebView
            source={{ html: playerHtml(id) }}
            style={styles.player}
            allowsFullscreenVideo
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            onMessage={onMessage}
            onError={() => setFailed(true)}
          />
        ) : (
          <View style={styles.failed}>
            <Text style={styles.failedTitle}>This trailer couldn't play</Text>
            <Text style={styles.failedBody}>Close this and stay on the movie.</Text>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close trailer"
          onPress={onClose}
          style={[styles.close, { top: insets.top + spacing.sm }]}
        >
          <Ionicons name="close" size={22} color={colors.tabActive} />
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  player: {
    flex: 1,
    backgroundColor: '#000000',
  },
  close: {
    position: 'absolute',
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  failed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  failedTitle: {
    color: colors.tabActive,
    fontFamily: fonts.semibold,
    fontSize: 18,
    textAlign: 'center',
  },
  failedBody: {
    color: '#D0D0D0',
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: 'center',
  },
});
