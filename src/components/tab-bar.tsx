import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';
import { useOrientation } from '@/hooks/use-orientation';

const tabs = {
  dashboard: { label: 'Dashboard', icon: DashboardIcon },
  index: { label: 'Watch', icon: WatchIcon },
  library: { label: 'Media Library', icon: LibraryIcon },
  more: { label: 'More', icon: MoreIcon },
} as const;

type TabName = keyof typeof tabs;

function isTabName(name: string): name is TabName {
  return name in tabs;
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useOrientation();

  return (
    <View style={styles.slot}>
      <View
        style={[
          styles.bar,
          {
            paddingTop: isLandscape ? 10 : 20,
            paddingBottom: Math.max(insets.bottom, isLandscape ? 8 : 18),
            paddingLeft: Math.max(insets.left, 8),
            paddingRight: Math.max(insets.right, 8),
          },
        ]}
      >
        {state.routes.map((route, index) => {
          if (!isTabName(route.name)) {
            return null;
          }

          const focused = state.index === index;
          const tab = tabs[route.name];
          const color = focused ? colors.tabActive : colors.tabInactive;
          const Icon = tab.icon;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={tab.label}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.item}
            >
              <Icon color={color} />
              <Text style={[styles.label, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function DashboardIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconBox}>
      <View style={styles.dots}>
        {[0, 1, 2, 3].map((dot) => (
          <View key={dot} style={[styles.dot, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  );
}

function WatchIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconBox}>
      <View style={[styles.playRing, { borderColor: color }]}>
        <View
          style={[
            styles.play,
            {
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

function LibraryIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconBox}>
      <View style={styles.library}>
        <View style={[styles.libraryBack, { borderColor: color }]} />
        <View style={[styles.libraryFront, { borderColor: color }]} />
      </View>
    </View>
  );
}

function MoreIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconBox}>
      <View style={styles.menu}>
        {[0, 1, 2].map((line) => (
          <View key={line} style={[styles.menuLine, { backgroundColor: color }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    backgroundColor: colors.background,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingHorizontal: 8,
    overflow: 'hidden',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
  iconBox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {
    width: 16,
    height: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  playRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  play: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderLeftWidth: 7,
  },
  library: {
    width: 20,
    height: 18,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  libraryBack: {
    position: 'absolute',
    top: 0,
    width: 14,
    height: 11,
    borderRadius: 2,
    borderWidth: 1.5,
  },
  libraryFront: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    backgroundColor: colors.tabBar,
  },
  menu: {
    width: 18,
    height: 12,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 1.5,
    borderRadius: 1,
  },
});
