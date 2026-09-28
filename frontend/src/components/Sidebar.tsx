import { ViewId } from '../types';

interface SidebarProps {
  activeView: ViewId;
  onSelectView: (view: ViewId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onBackToHome: () => void;
  onNewInvestigation: () => void;
  user: { uid: string; email?: string | null } | null;
  onSignOut: () => void;
}

export default function Sidebar({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  onBackToHome,
  onNewInvestigation,
  user,
  onSignOut,
}: SidebarProps) {
  const menuItems: Array<{ id: ViewId; label: string; icon: string }> = [
    { id: 'overview', label: 'Overview', icon: '⚡' },
    { id: 'investigations', label: 'Investigations', icon: '🔬' },
    { id: 'experiments', label: 'Experiments', icon: '🧪' },
    { id: 'insights', label: 'Insights', icon: '🧠' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'profile', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#0A0A0A] border-r border-white/10 flex flex-col justify-between transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Brand & Actions */}
      <div className="p-4 space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A1A1A] to-[#050505] border border-[#FF7A00]/40 flex items-center justify-center font-display font-bold text-white text-base shadow-[0_0_15px_rgba(255,122,0,0.2)] group-hover:border-[#FF7A00] transition-all">
              M
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-base tracking-[0.2em] text-[#F5F5F5] group-hover:text-white transition-colors">
                MORPHOS
              </span>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            className="text-[#8A8A8A] hover:text-white p-1 text-xs"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Start New Investigation Button */}
        <button
          onClick={onNewInvestigation}
          className={`w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF9D3D] text-[#050505] font-semibold text-xs py-2.5 transition-all duration-200 shadow-[0_0_20px_rgba(255,122,0,0.25)] hover:shadow-[0_0_30px_rgba(255,122,0,0.4)] ${
            collapsed ? 'px-0' : 'px-4'
          }`}
          title="New Investigation"
        >
          <span className="text-base font-bold leading-none">+</span>
          {!collapsed && <span className="uppercase tracking-wider">New Investigation</span>}
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5 pt-2">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF7A00]/10 text-white border border-[#FF7A00]/30 shadow-[0_0_15px_rgba(255,122,0,0.15)]'
                    : 'text-[#8A8A8A] hover:text-[#F5F5F5] hover:bg-white/[0.04]'
                } ${collapsed ? 'justify-center' : 'justify-start'}`}
                title={item.label}
              >
                <span className="text-sm">{item.icon}</span>
                {!collapsed && (
                  <span className="font-sans uppercase text-[11px] tracking-wider font-semibold">
                    {item.label}
                  </span>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_6px_#FF7A00]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Return to Home */}
      <div className="p-4 border-t border-white/[0.08] space-y-3">
        {/* Back to Home Link */}
        <button
          onClick={onBackToHome}
          className={`w-full flex items-center gap-2 text-[#8A8A8A] hover:text-white text-xs transition-colors py-1 ${
            collapsed ? 'justify-center' : 'justify-start'
          }`}
          title="Back to Landing Page"
        >
          <span>↖</span>
          {!collapsed && <span className="text-[11px] tracking-wider uppercase font-mono">Back to Home</span>}
        </button>

        {/* User Card */}
        <div className={`flex items-center gap-3 pt-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {(user?.email ?? 'M')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-xs font-medium text-white truncate max-w-[130px]">
                {user?.email ?? 'Local Operator'}
              </div>
              <div className="text-[10px] text-[#8A8A8A] truncate font-mono">
                {user ? 'Authenticated' : 'Offline / Demo'}
              </div>
            </div>
          )}
        </div>

        {user && !collapsed && (
          <button
            onClick={onSignOut}
            className="w-full text-left text-[11px] text-[#8A8A8A] hover:text-[#FF7A00] transition-colors py-1 font-mono uppercase"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}
