import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors, spacing, fontSize, fonts } from '../theme';

export type NavTab = 'home' | 'pantry' | 'journal';

interface NavBarProps {
  activeTab: NavTab;
  onPress: (tab: NavTab) => void;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon({ color }: { color: string }) {
  return (
    <Svg width={29} height={26} viewBox="0 0 29 26" fill="none">
      <Path
        d="M4.5331 15.2839V25H11.5993V17.9338C11.5993 17.4652 11.7854 17.0159 12.1167 16.6846C12.448 16.3533 12.8974 16.1672 13.3659 16.1672H15.1324C15.6009 16.1672 16.0502 16.3533 16.3816 16.6846C16.7129 17.0159 16.899 17.4652 16.899 17.9338V25H23.9652V15.2839"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M1 13.5174L12.9996 1.51781C13.1637 1.35365 13.3585 1.22342 13.5728 1.13458C13.7873 1.04573 14.017 1 14.2492 1C14.4813 1 14.7111 1.04573 14.9254 1.13458C15.1399 1.22342 15.3347 1.35365 15.4987 1.51781L27.4983 13.5174"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PantryIcon({ color }: { color: string }) {
  return (
    <Svg width={20} height={24} viewBox="0 0 20 24" fill="none">
      <Path
        d="M18.9533 0H9.8098H0.666273C0.297697 0 0 0.297696 0 0.666273V22.6438C0 23.0124 0.297697 23.3101 0.666273 23.3101H2.58476V23.3337C2.58476 23.7023 2.88246 24 3.25103 24C3.61961 24 3.91731 23.7023 3.91731 23.3337V23.3101H9.8098H15.7023V23.3337C15.7023 23.7023 16 24 16.3686 24C16.7372 24 17.0348 23.7023 17.0348 23.3337V23.3101H18.9533C19.3219 23.3101 19.6196 23.0124 19.6196 22.6438V0.666273C19.6243 0.297696 19.3219 0 18.9533 0ZM9.14353 21.9776H1.33255V1.33255H9.14353V21.9776ZM18.2871 21.9776H10.4761V1.33255H18.2871V21.9776Z"
        fill={color}
      />
      <Path
        d="M12.4749 9.93738C12.1063 9.93738 11.8086 10.2351 11.8086 10.6037V12.7112C11.8086 13.0797 12.1063 13.3774 12.4749 13.3774C12.8435 13.3774 13.1412 13.0797 13.1412 12.7112V10.6037C13.1412 10.2351 12.8435 9.93738 12.4749 9.93738Z"
        fill={color}
      />
      <Path
        d="M7.14469 9.93738C6.77611 9.93738 6.47842 10.2351 6.47842 10.6037V12.7112C6.47369 13.0797 6.77611 13.3774 7.14469 13.3774C7.51327 13.3774 7.81096 13.0797 7.81096 12.7112V10.6037C7.81096 10.2351 7.51327 9.93738 7.14469 9.93738Z"
        fill={color}
      />
    </Svg>
  );
}

function JournalIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={24} viewBox="0 0 22 24" fill="none">
      <Rect x="3.09375" y="0.5" width={18} height={23} rx={1.5} stroke={color} />
      <Path d="M15.5849 5.06824L10.7143 5.06824" stroke={color} strokeLinecap="round" />
      <Path d="M16.7284 8.32941L9.52844 8.32941" stroke={color} strokeLinecap="round" />
      <Path d="M0.5 7H4.5" stroke={color} strokeLinecap="round" />
      <Path d="M0.5 13H4.5" stroke={color} strokeLinecap="round" />
      <Path d="M0.5 18H4.5" stroke={color} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────

const TABS: { id: NavTab; label: string; Icon: React.FC<{ color: string }> }[] = [
  { id: 'home',    label: 'HOME',    Icon: HomeIcon },
  { id: 'pantry',  label: 'PANTRY',  Icon: PantryIcon },
  { id: 'journal', label: 'JOURNAL', Icon: JournalIcon },
];

export default function NavBar({ activeTab, onPress }: NavBarProps) {
  return (
    <View style={s.bar}>
      {TABS.map(({ id, label, Icon }) => {
        const active = activeTab === id;
        const color = active ? colors['dark-100'] : colors['brand-text-200'];
        return (
          <TouchableOpacity
            key={id}
            style={s.tab}
            onPress={() => onPress(id)}
            activeOpacity={0.7}
          >
            <Icon color={color} />
            <Text style={[s.label, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection:   'row',
    justifyContent:  'space-between',
    alignItems:      'center',
    paddingHorizontal: spacing['4xl'],   // 64px
    paddingVertical:   spacing.md,       // 12px
    backgroundColor:   colors['light-100'],
    borderTopWidth:    1,
    borderTopColor:    colors['dark-100-o20'],
  },
  tab: {
    alignItems: 'center',
    gap:        spacing['stack-gap'],    // 12px
  },
  label: {
    fontFamily:    fonts.mono,
    fontSize:      fontSize.mono,        // 13px
    letterSpacing: 0.5,
  },
});
