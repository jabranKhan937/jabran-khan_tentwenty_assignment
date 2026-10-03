import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/constants/theme';

const tabs = {
  dashboard: { label: 'Dashboard', icon: 'grid' },
  index: { label: 'Watch', icon: 'play' },
  library: { label: 'Media Library', icon: 'albums' },
  more: { label: 'More', icon: 'menu' },
} as const;

type TabName = keyof typeof tabs;

function isTabName(name: string): name is TabName {
  return name in tabs;
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        if (!isTabName(route.name)) {
          return null;
        }

        const focused = state.index === index;
        const tab = tabs[route.name];
        const color = focused ? colors.tabActive : colors.tabInactive;

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
            <Ionicons name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 10,
  },
});
