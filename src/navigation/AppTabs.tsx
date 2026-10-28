import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';
import { CapturedScreen } from '../screens/CapturedScreen';
import { CatalogScreen } from '../screens/CatalogScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LogoutButton } from './LogoutButton';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof TabParamList, { active: IconName; inactive: IconName }> = {
  Catalog: { active: 'grid', inactive: 'grid-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
  Favorites: { active: 'heart', inactive: 'heart-outline' },
  Captured: { active: 'star', inactive: 'star-outline' },
};

/** Abas do app: Catálogo · Buscar · Favoritos · Capturados. */
export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerRight: () => <LogoutButton />,
        headerRightContainerStyle: { paddingRight: 8 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.divider },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? TAB_ICONS[route.name].active : TAB_ICONS[route.name].inactive}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catálogo' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Buscar' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Captured" component={CapturedScreen} options={{ title: 'Capturados' }} />
    </Tab.Navigator>
  );
}
