"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';
import {
  User,
  Clock,
  TrendingUp,
  Bell,
  Mail,
  Smartphone,
  Settings,
  BarChart3,
  History,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { usePageTitle } from '@/hooks/usePageTitle';

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const { user, isLoggedIn, isInitialized, userHistory, notificationSettings, updateNotificationSettings, logout, addToHistory } = useAuth();
  const router = useRouter();
  const hasVisitedRef = useRef(false);

  const [apiData, setApiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      router.push('/');
    } else if (!hasVisitedRef.current) {
      // Add dashboard visit to history only on first visit
      addToHistory('Dashboard Viewed', 'User accessed their dashboard', 'settings');
      hasVisitedRef.current = true;
    }
  }, [isLoggedIn, isInitialized, router, addToHistory]);

  useEffect(() => {
    if (isLoggedIn) {
      setIsLoading(true);
      const supabase = createClient();
      
      const fetchDashboardData = async () => {
        try {
          const [marketsRes, categoriesRes, vegetablesRes, pricesRes] = await Promise.all([
            supabase.from('markets').select('*', { count: 'exact', head: true }),
            supabase.from('categories').select('*', { count: 'exact', head: true }),
            supabase.from('vegetables').select('*', { count: 'exact', head: true }),
            supabase.from('price_entries').select(`
              id,
              price,
              date,
              market_id,
              vegetable_id,
              markets ( name ),
              vegetables ( name, emoji )
            `)
            .order('date', { ascending: false })
            .order('id', { ascending: false })
            .limit(10)
          ]);

          const total_markets = marketsRes.count || 0;
          const total_categories = categoriesRes.count || 0;
          const total_vegetables = vegetablesRes.count || 0;

          // Map prices to match the previous structure
          const latest_prices = (pricesRes.data || []).map((p: any) => ({
            id: p.id,
            date: p.date,
            price: p.price,
            market_name: p.markets?.name || '',
            vegetable_name: p.vegetables?.name || '',
            vegetable_emoji: p.vegetables?.emoji || ''
          }));

          setApiData({
            total_markets,
            total_categories,
            total_vegetables,
            latest_prices
          });
        } catch (err) {
          console.error("Failed to fetch dashboard data from Supabase", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [isLoggedIn]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isLoggedIn || !user) {
    return <></>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleNotificationChange = (key: keyof typeof notificationSettings, value: boolean) => {
    updateNotificationSettings({ [key]: value });
  };

  // Demo analytics data fallback if api fails
  const analyticsData = apiData ? {
    totalMarkets: apiData.total_markets || 0,
    totalCategories: apiData.total_categories || 0,
    totalVegetables: apiData.total_vegetables || 0,
    latestPricesCount: apiData.latest_prices?.length || 0
  } : {
    totalMarkets: 0,
    totalCategories: 0,
    totalVegetables: 0,
    latestPricesCount: 0
  };

  const displayHistory = apiData?.latest_prices?.length > 0 ? apiData.latest_prices.map((p: any) => ({
    id: p.id.toString(),
    date: p.date,
    action: `Price Update: ${p.vegetable_name}`,
    details: `${p.vegetable_emoji && p.vegetable_emoji.startsWith('/') ? '🥬' : p.vegetable_emoji} New price at ${p.market_name}: Rs. ${p.price}`,
    category: 'market' as const
  })) : [];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-emerald-100 text-emerald-700';
      case 'analyze': return 'bg-blue-100 text-blue-700';
      case 'settings': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60 && diffMins >= 0) return `${diffMins} minutes ago`;
    if (diffHours < 24 && diffHours >= 0) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f5edd6] to-[#ebe5d5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#f5edd6] to-[#ebe5d5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#1a1a1a] mb-2">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">Here's your activity overview and settings</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-red-600"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            icon={<TrendingUp className="text-emerald-600" />}
            title="Total Markets"
            value={analyticsData.totalMarkets.toString()}
            change="Active"
            positive
          />
          <StatCard
            icon={<BarChart3 className="text-blue-600" />}
            title="Total Categories"
            value={analyticsData.totalCategories.toString()}
            change="Active"
            positive
          />
          <StatCard
            icon={<Clock className="text-purple-600" />}
            title="Total Vegetables"
            value={analyticsData.totalVegetables.toString()}
            change="Active"
            positive
          />
          <StatCard
            icon={<User className="text-orange-600" />}
            title="Latest Entries"
            value={analyticsData.latestPricesCount.toString()}
            change="Recent"
            positive
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activity History */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2">
                <History size={24} className="text-emerald-600" />
                Activity History
              </h2>
              <span className="text-sm text-gray-500">{displayHistory.length} recent activities</span>
            </div>

            <div className="space-y-4">
              {displayHistory.map((item: any, index: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.05) }}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                    {item.category === 'market' && <TrendingUp size={20} />}
                    {item.category === 'analyze' && <BarChart3 size={20} />}
                    {item.category === 'settings' && <Settings size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#1a1a1a]">{item.action}</h3>
                      <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.details}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {displayHistory.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <History size={48} className="mx-auto mb-4 opacity-50" />
                <p>No activity history yet</p>
              </div>
            )}
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a] flex items-center gap-2 mb-6">
              <Bell size={24} className="text-emerald-600" />
              Notification Settings
            </h2>

            <div className="space-y-6">
              <NotificationToggle
                icon={<Mail size={20} className="text-blue-600" />}
                title="Email Notifications"
                description="Receive updates via email"
                enabled={notificationSettings.email}
                onToggle={(enabled) => handleNotificationChange('email', enabled)}
              />

              <NotificationToggle
                icon={<Smartphone size={20} className="text-purple-600" />}
                title="Mobile Notifications"
                description="Push notifications on mobile"
                enabled={notificationSettings.mobile}
                onToggle={(enabled) => handleNotificationChange('mobile', enabled)}
              />

              <NotificationToggle
                icon={<TrendingUp size={20} className="text-emerald-600" />}
                title="Marketing Updates"
                description="Promotional content and offers"
                enabled={notificationSettings.marketing}
                onToggle={(enabled) => handleNotificationChange('marketing', enabled)}
              />

              <NotificationToggle
                icon={<ShieldCheck size={20} className="text-orange-600" />}
                title="System Updates"
                description="Important system announcements"
                enabled={notificationSettings.updates}
                onToggle={(enabled) => handleNotificationChange('updates', enabled)}
              />
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-[#1a1a1a] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/markets/dambulla"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <TrendingUp size={20} className="text-emerald-600" />
                  <span>View Market Prices</span>
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                >
                  <BarChart3 size={20} className="text-blue-600" />
                  <span>Run Analysis</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, change, positive }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-gray-100 rounded-xl">{icon}</div>
        <span className={`text-sm font-semibold ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

function NotificationToggle({
  icon,
  title,
  description,
  enabled,
  onToggle
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-gray-100 rounded-lg">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-[#1a1a1a]">{title}</h3>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-emerald-600' : 'bg-gray-300'
            }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>
    </div>
  );
}