import React, { useState } from 'react';
import {
  X,
  Github,
  Key,
  UserCheck,
  RefreshCw,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  GitPullRequest
} from 'lucide-react';
import { GitHubAccount } from '../types/calendar';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  githubAccount: GitHubAccount | null;
  onConnectUsernameOrToken: (input: string, isToken: boolean) => Promise<void>;
  onConnectViaFirebase: () => Promise<void>;
  onDisconnect: () => void;
  onResync: () => Promise<void>;
  isSyncing: boolean;
}

export const GitHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  githubAccount,
  onConnectUsernameOrToken,
  onConnectViaFirebase,
  onDisconnect,
  onResync,
  isSyncing,
}) => {
  const [activeTab, setActiveTab] = useState<'token' | 'oauth'>('token');
  const [tokenOrUser, setTokenOrUser] = useState('');
  const [isToken, setIsToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleManualConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenOrUser.trim()) {
      setError('กรุณาระบุ GitHub Username หรือ Personal Access Token');
      return;
    }

    setError(null);
    try {
      await onConnectUsernameOrToken(tokenOrUser.trim(), isToken);
      setTokenOrUser('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เชื่อมต่อ GitHub ไม่สำเร็จ');
    }
  };

  const handleOAuthConnect = async () => {
    setError(null);
    try {
      await onConnectViaFirebase();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบ GitHub ไม่สำเร็จ');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center shadow-inner">
              <Github className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-1.5">
                เชื่อมต่อกับ GitHub
                <span className="text-[10px] bg-sky-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  Octocat
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                ดึงงาน Issues, PRs และกิจกรรมโค้ดลงปฏิทินของอ้วน ๆ
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {githubAccount ? (
            /* Connected State */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <img
                  src={githubAccount.avatarUrl}
                  alt={githubAccount.username}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-300 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-800 truncate">
                      {githubAccount.name}
                    </h4>
                    <span className="text-[10px] text-emerald-600 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                      เชื่อมต่อแล้ว
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    @{githubAccount.username}
                  </p>
                  <p className="text-[11px] text-sky-600 font-medium mt-0.5 flex items-center gap-1">
                    <GitPullRequest className="w-3 h-3" />
                    ซิงค์ข้อมูลแล้ว {githubAccount.syncedIssuesCount} รายการในปฏิทิน
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResync}
                  disabled={isSyncing}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-300/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'กำลังซิงค์...' : 'รีเฟรชข้อมูล GitHub ล่าสุด'}
                </button>

                <button
                  type="button"
                  onClick={onDisconnect}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="ตัดการเชื่อมต่อ GitHub"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  ยกเลิกเชื่อมต่อ
                </button>
              </div>
            </div>
          ) : (
            /* Not Connected State */
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => setActiveTab('token')}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'token'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Username / Token
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('oauth')}
                  className={`py-2 rounded-xl transition-all cursor-pointer ${
                    activeTab === 'oauth'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'hover:text-slate-900'
                  }`}
                >
                  เข้าสู่ระบบ GitHub
                </button>
              </div>

              {activeTab === 'token' ? (
                <form onSubmit={handleManualConnect} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        {isToken ? 'GitHub Personal Access Token (PAT)' : 'GitHub Username'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsToken(!isToken)}
                        className="text-[11px] text-sky-600 hover:text-sky-800 underline font-medium cursor-pointer"
                      >
                        {isToken ? 'สลับเป็นพิมพ์แค่ Username' : 'สลับเป็นใส่ Access Token'}
                      </button>
                    </div>

                    <input
                      type={isToken ? 'password' : 'text'}
                      value={tokenOrUser}
                      onChange={(e) => setTokenOrUser(e.target.value)}
                      placeholder={isToken ? 'ghp_xxxxxxxxxxxxxxxxxxxx' : 'เช่น bank-dev, octocat'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      {isToken
                        ? 'โทเคนจะช่วยดึง Issues และ Repositories ส่วนตัวได้ครบถ้วน'
                        : 'ใส่แค่ชื่อบัญชี GitHub ของคุณ เพื่อดึงกิจกรรมสาธารณะและกิจกรรมล่าสุด'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSyncing}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        กำลังเชื่อมต่อ...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        เชื่อมต่อและดึงงานลงปฏิทิน
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="py-4 text-center space-y-3">
                  <p className="text-xs text-slate-500">
                    เข้าสู่ระบบด้วย GitHub Popup เพื่ออนุญาตให้แอปพลิเคชันเข้าถึงกำหนดการและโปรเจกต์ของคุณ
                  </p>
                  <button
                    type="button"
                    onClick={handleOAuthConnect}
                    disabled={isSyncing}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Github className="w-4 h-4" />
                    <span>{isSyncing ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย GitHub'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
