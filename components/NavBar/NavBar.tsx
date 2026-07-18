import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { colors } from '../../theme';
import { navStyles as s } from './styles';

export type NavTab = 'home' | 'pantry' | 'journal' | 'profile';

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
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
      />
      <Path
        d="M1 13.5174L12.9996 1.51781C13.1637 1.35365 13.3585 1.22342 13.5728 1.13458C13.7873 1.04573 14.017 1 14.2492 1C14.4813 1 14.7111 1.04573 14.9254 1.13458C15.1399 1.22342 15.3347 1.35365 15.4987 1.51781L27.4983 13.5174"
        stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
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
      <Path d="M12.4749 9.93738C12.1063 9.93738 11.8086 10.2351 11.8086 10.6037V12.7112C11.8086 13.0797 12.1063 13.3774 12.4749 13.3774C12.8435 13.3774 13.1412 13.0797 13.1412 12.7112V10.6037C13.1412 10.2351 12.8435 9.93738 12.4749 9.93738Z" fill={color} />
      <Path d="M7.14469 9.93738C6.77611 9.93738 6.47842 10.2351 6.47842 10.6037V12.7112C6.47369 13.0797 6.77611 13.3774 7.14469 13.3774C7.51327 13.3774 7.81096 13.0797 7.81096 12.7112V10.6037C7.81096 10.2351 7.51327 9.93738 7.14469 9.93738Z" fill={color} />
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

// user glyph from the design kit (Downloads/User.svg), fills driven by the
// active tab color instead of the export's hardcoded #161616
function ProfileIcon({ color }: { color: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 2C8.49445 2 8.9778 2.14662 9.38893 2.42133C9.80005 2.69603 10.1205 3.08648 10.3097 3.54329C10.4989 4.00011 10.5484 4.50277 10.452 4.98773C10.3555 5.47268 10.1174 5.91814 9.76777 6.26777C9.41814 6.6174 8.97268 6.8555 8.48773 6.95196C8.00277 7.04843 7.50011 6.99892 7.04329 6.8097C6.58648 6.62048 6.19603 6.30005 5.92133 5.88893C5.64662 5.4778 5.5 4.99445 5.5 4.5C5.5 3.83696 5.76339 3.20107 6.23223 2.73223C6.70107 2.26339 7.33696 2 8 2ZM8 1C7.30777 1 6.63108 1.20527 6.0555 1.58986C5.47993 1.97444 5.03133 2.52107 4.76642 3.16061C4.50152 3.80015 4.4322 4.50388 4.56725 5.18282C4.7023 5.86175 5.03564 6.48539 5.52513 6.97487C6.01461 7.46436 6.63825 7.7977 7.31718 7.93275C7.99612 8.0678 8.69985 7.99849 9.33939 7.73358C9.97893 7.46867 10.5256 7.02007 10.9101 6.4445C11.2947 5.86892 11.5 5.19223 11.5 4.5C11.5 3.57174 11.1313 2.6815 10.4749 2.02513C9.8185 1.36875 8.92826 1 8 1Z"
        fill={color}
      />
      <Path
        d="M13 15H12V12.5C12 12.1717 11.9353 11.8466 11.8097 11.5433C11.6841 11.24 11.4999 10.9644 11.2678 10.7322C11.0356 10.5001 10.76 10.3159 10.4567 10.1903C10.1534 10.0647 9.8283 10 9.5 10H6.5C5.83696 10 5.20107 10.2634 4.73223 10.7322C4.26339 11.2011 4 11.837 4 12.5V15H3V12.5C3 11.5717 3.36875 10.6815 4.02513 10.0251C4.6815 9.36875 5.57174 9 6.5 9H9.5C10.4283 9 11.3185 9.36875 11.9749 10.0251C12.6313 10.6815 13 11.5717 13 12.5V15Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS: { id: NavTab; label: string; Icon: React.FC<{ color: string }> }[] = [
  { id: 'home',    label: 'HOME',    Icon: HomeIcon },
  { id: 'pantry',  label: 'PANTRY',  Icon: PantryIcon },
  { id: 'journal', label: 'JOURNAL', Icon: JournalIcon },
  { id: 'profile', label: 'PROFILE', Icon: ProfileIcon },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NavBar({ activeTab, onPress }: NavBarProps) {
  return (
    <View style={s.bar}>
      {TABS.map(({ id, label, Icon }) => {
        const color = activeTab === id ? colors['dark-100'] : colors['brand-text-200'];
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
