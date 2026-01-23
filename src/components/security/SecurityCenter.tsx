import { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  Key,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Globe,
  Monitor,
  Clock,
  LogOut,
  Fingerprint,
  Mail,
  Bell,
  ChevronRight,
  Download,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface SecuritySession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: Date;
  isCurrent: boolean;
}

interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'logout' | 'failed_attempt' | '2fa_enabled' | '2fa_disabled';
  description: string;
  timestamp: Date;
  ip: string;
  success: boolean;
}

interface SecurityCenterProps {
  onBack?: () => void;
  email?: string;
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastPasswordChange?: Date;
  onEnable2FA?: () => Promise<void>;
  onDisable2FA?: () => Promise<void>;
  onChangePassword?: () => void;
  onVerifyEmail?: () => Promise<void>;
  onVerifyPhone?: () => Promise<void>;
  onRevokeSession?: (sessionId: string) => Promise<void>;
  onRevokeAllSessions?: () => Promise<void>;
  onDownloadData?: () => Promise<void>;
  onDeleteAccount?: () => void;
}

export default function SecurityCenter({
  onBack,
  email = 'user@example.com',
  twoFactorEnabled: initialTwoFactorEnabled = false,
  emailVerified: initialEmailVerified = true,
  phoneVerified: initialPhoneVerified = false,
  lastPasswordChange = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  onEnable2FA = async () => {},
  onDisable2FA = async () => {},
  onChangePassword = () => {},
  onVerifyEmail = async () => {},
  onVerifyPhone = async () => {},
  onRevokeSession = async () => {},
  onRevokeAllSessions = async () => {},
  onDownloadData = async () => {},
  onDeleteAccount = () => {},
}: SecurityCenterProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'sessions' | 'activity' | 'privacy'>('overview');
  const [sessions, setSessions] = useState<SecuritySession[]>([]);
  const [activityLog, setActivityLog] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [securityScore, setSecurityScore] = useState(0);
  const [twoFactorEnabled] = useState(initialTwoFactorEnabled);
  const [emailVerified] = useState(initialEmailVerified);
  const [phoneVerified] = useState(initialPhoneVerified);

  // Calculate security score
  useEffect(() => {
    let score = 20; // Base score
    if (emailVerified) score += 20;
    if (phoneVerified) score += 20;
    if (twoFactorEnabled) score += 30;
    if (lastPasswordChange && new Date().getTime() - lastPasswordChange.getTime() < 90 * 24 * 60 * 60 * 1000) {
      score += 10; // Changed password in last 90 days
    }
    setSecurityScore(score);
  }, [emailVerified, phoneVerified, twoFactorEnabled, lastPasswordChange]);

  // Mock session data
  useEffect(() => {
    setSessions([
      {
        id: '1',
        device: 'Windows PC',
        browser: 'Chrome 120',
        location: 'New York, NY',
        ip: '192.168.1.xxx',
        lastActive: new Date(),
        isCurrent: true,
      },
      {
        id: '2',
        device: 'iPhone 15',
        browser: 'Safari 17',
        location: 'New York, NY',
        ip: '192.168.1.xxx',
        lastActive: new Date(Date.now() - 3600000),
        isCurrent: false,
      },
    ]);

    setActivityLog([
      {
        id: '1',
        type: 'login',
        description: 'Successful login from Chrome on Windows',
        timestamp: new Date(),
        ip: '192.168.1.xxx',
        success: true,
      },
      {
        id: '2',
        type: 'password_change',
        description: 'Password was changed successfully',
        timestamp: new Date(Date.now() - 86400000),
        ip: '192.168.1.xxx',
        success: true,
      },
      {
        id: '3',
        type: 'failed_attempt',
        description: 'Failed login attempt with incorrect password',
        timestamp: new Date(Date.now() - 172800000),
        ip: '10.0.0.xxx',
        success: false,
      },
    ]);
  }, []);

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-green-500';
    if (securityScore >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = () => {
    if (securityScore >= 80) return 'Excellent';
    if (securityScore >= 50) return 'Good';
    return 'Needs Improvement';
  };

  const getEventIcon = (type: SecurityEvent['type'], success: boolean) => {
    if (!success) return <XCircle className="w-5 h-5 text-red-500" />;
    switch (type) {
      case 'login':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'logout':
        return <LogOut className="w-5 h-5 text-gray-500" />;
      case 'password_change':
        return <Key className="w-5 h-5 text-blue-500" />;
      case '2fa_enabled':
        return <Shield className="w-5 h-5 text-green-500" />;
      case '2fa_disabled':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleToggle2FA = async () => {
    setLoading(true);
    try {
      if (twoFactorEnabled) {
        await onDisable2FA();
      } else {
        await onEnable2FA();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        {onBack && (
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 rotate-180" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Security Center</h1>
              <p className="text-gray-600">Manage your account security settings</p>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Security Score Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold mb-1">Security Score</h2>
                <p className="text-slate-400 text-sm">Your account protection level</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${getScoreColor()}`}>{securityScore}%</div>
                <div className={`text-sm ${getScoreColor()}`}>{getScoreLabel()}</div>
              </div>
            </div>

        {/* Progress Bar */}
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-6">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              securityScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
              securityScore >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-red-500 to-orange-400'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SecurityQuickAction
            icon={<Fingerprint className="w-5 h-5" />}
            label="2FA"
            status={twoFactorEnabled}
            onClick={handleToggle2FA}
          />
          <SecurityQuickAction
            icon={<Mail className="w-5 h-5" />}
            label="Email"
            status={emailVerified}
            onClick={onVerifyEmail}
          />
          <SecurityQuickAction
            icon={<Smartphone className="w-5 h-5" />}
            label="Phone"
            status={phoneVerified}
            onClick={onVerifyPhone}
          />
          <SecurityQuickAction
            icon={<Key className="w-5 h-5" />}
            label="Password"
            status={!!lastPasswordChange}
            onClick={onChangePassword}
          />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
        {[
          { id: 'overview', label: 'Overview', icon: Shield },
          { id: 'sessions', label: 'Sessions', icon: Monitor },
          { id: 'activity', label: 'Activity', icon: Clock },
          { id: 'privacy', label: 'Privacy', icon: Eye },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeSection === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeSection === 'overview' && (
        <div className="space-y-4">
          {/* Two-Factor Authentication */}
          <SecurityCard
            icon={<Fingerprint className="w-6 h-6" />}
            title="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            status={twoFactorEnabled ? 'enabled' : 'disabled'}
            action={
              <button
                onClick={handleToggle2FA}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  twoFactorEnabled
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                {loading ? 'Processing...' : twoFactorEnabled ? 'Disable' : 'Enable'}
              </button>
            }
          />

          {/* Password */}
          <SecurityCard
            icon={<Key className="w-6 h-6" />}
            title="Password"
            description={
              lastPasswordChange
                ? `Last changed ${formatTimeAgo(lastPasswordChange)}`
                : 'Set a strong password for your account'
            }
            status={lastPasswordChange ? 'enabled' : 'warning'}
            action={
              <button
                onClick={onChangePassword}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                Change Password
              </button>
            }
          />

          {/* Email Verification */}
          <SecurityCard
            icon={<Mail className="w-6 h-6" />}
            title="Email Verification"
            description={email}
            status={emailVerified ? 'enabled' : 'warning'}
            action={
              !emailVerified && (
                <button
                  onClick={onVerifyEmail}
                  className="px-4 py-2 rounded-lg font-medium text-sm bg-teal-500 text-white hover:bg-teal-600 transition-all"
                >
                  Verify Email
                </button>
              )
            }
          />

          {/* Phone Verification */}
          <SecurityCard
            icon={<Smartphone className="w-6 h-6" />}
            title="Phone Verification"
            description="Add your phone number for account recovery"
            status={phoneVerified ? 'enabled' : 'disabled'}
            action={
              <button
                onClick={onVerifyPhone}
                className="px-4 py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
              >
                {phoneVerified ? 'Update' : 'Add Phone'}
              </button>
            }
          />

          {/* Login Notifications */}
          <SecurityCard
            icon={<Bell className="w-6 h-6" />}
            title="Login Notifications"
            description="Get notified when your account is accessed from a new device"
            status="enabled"
            action={
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
              </label>
            }
          />
        </div>
      )}

      {activeSection === 'sessions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Active Sessions</h3>
            <button
              onClick={onRevokeAllSessions}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign out all other sessions
            </button>
          </div>

          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-xl border ${
                session.isCurrent ? 'border-teal-200 bg-teal-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${session.isCurrent ? 'bg-teal-100' : 'bg-gray-100'}`}>
                    <Monitor className={`w-5 h-5 ${session.isCurrent ? 'text-teal-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{session.device}</span>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {session.browser} • {session.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <Globe className="w-3 h-3" />
                      {session.ip} • Active {formatTimeAgo(session.lastActive)}
                    </div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => onRevokeSession(session.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'activity' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Recent Security Activity</h3>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {activityLog.map((event) => (
              <div key={event.id} className="p-4 flex items-start gap-3">
                {getEventIcon(event.type, event.success)}
                <div className="flex-1">
                  <p className="text-gray-900 text-sm">{event.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(event.timestamp)} • {event.ip}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full py-3 text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center justify-center gap-2">
            View Full Activity Log
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Privacy & Data</h3>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <button
              onClick={onDownloadData}
              className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900">Download Your Data</p>
                <p className="text-sm text-gray-500">Get a copy of all your data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={onDeleteAccount}
              className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Data Retention Policy</p>
                <p className="text-sm text-amber-700 mt-1">
                  Your data is retained for 30 days after account deletion. During this period,
                  you can recover your account by contacting support.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}

function SecurityQuickAction({
  icon,
  label,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  status: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-xl flex flex-col items-center gap-2 transition-all ${
        status
          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
      }`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
      <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-400' : 'bg-slate-500'}`} />
    </button>
  );
}

function SecurityCard({
  icon,
  title,
  description,
  status,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'enabled' | 'disabled' | 'warning';
  action?: React.ReactNode;
}) {
  const statusColors = {
    enabled: 'text-green-500',
    disabled: 'text-gray-400',
    warning: 'text-amber-500',
  };

  const statusIcons = {
    enabled: <CheckCircle2 className="w-5 h-5" />,
    disabled: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl bg-gray-100 ${statusColors[status]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-gray-900">{title}</h4>
              <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            </div>
            <div className={`flex items-center gap-2 ${statusColors[status]}`}>
              {statusIcons[status]}
            </div>
          </div>
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
