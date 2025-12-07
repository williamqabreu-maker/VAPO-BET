import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { BetList } from './components/BetList';
import { AddBetForm } from './components/AddBetForm';
import { Toast } from './components/Toast';
import { BankrollSettingsModal } from './components/BankrollSettingsModal';
import { VisionBoard } from './components/VisionBoard';
import { TipFeed } from './components/TipFeed';
import { CommunityBoard } from './components/CommunityBoard';
import { AIAnalysis } from './components/AIAnalysis';
import { Logo } from './components/Logo';
import { LivePlayer } from './components/LivePlayer';
import { MoneyRain } from './components/MoneyRain';
import { Bet, BetResult, BankrollSettings, DreamItem, CommunityPost, UserProfile, ChatMessage, PostComment } from './types';
import { PlusCircle, Settings, Bell, BellRing, Users, UserCircle, Instagram, Youtube, Twitter, Send, LogOut, BrainCircuit, Shield, ArrowLeft, Crown, Zap } from 'lucide-react';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminUserList } from './components/AdminUserList';
import { AdminDashboard } from './components/AdminDashboard';
import { PricingModal } from './components/PricingModal';
import { useRealtimeBets } from './hooks/useSupabase';
import { BetsService } from './services/supabaseDataService';

const AuthenticatedApp: React.FC = () => {
  const { user, logout } = useAuth();
  
  // SUPABASE REALTIME HOOK
  // Substitui o estado local de bets e carrega do banco
  const { bets, loading: betsLoading, refresh: refreshBets } = useRealtimeBets(user?.id || '');
  
  const [dreamBoard, setDreamBoard] = useState<DreamItem[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisionBoardOpen, setIsVisionBoardOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'feed' | 'community' | 'ai' | 'admin'>('dashboard');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [showMoneyRain, setShowMoneyRain] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  
  const [bankrollSettings, setBankrollSettings] = useState<BankrollSettings>({
    startBankroll: 1000,
    unitDivisor: 30,
    profitGoal: 10
  });

  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: user?.name || 'VapoUser',
    avatarUrl: user?.avatarUrl || ''
  });

  // Legacy Keys for secondary data
  const SETTINGS_KEY = `vapobet_settings_${user?.id}`;
  const DREAMS_KEY = `vapobet_dreams_${user?.id}`;
  const PROFILE_KEY = `vapobet_profile_${user?.id}`;
  const COMMUNITY_KEY = `vapobet_community`;
  const CHAT_KEY = `vapobet_chat`;

  const getMockPosts = (): CommunityPost[] => [
      { id: 'c1', username: 'Trader_Elite', betSelection: 'Real Madrid -1.0', betMarket: 'Asian Handicap', odds: 1.95, profitUnits: 2.5, comment: 'Leitura perfeita!', likes: 42, timestamp: '2h atrás', isUserPost: false, replies: [] },
      { id: 'c2', username: 'BetNinja007', betSelection: 'Over 2.5 Gols', betMarket: 'Gols', odds: 1.70, profitUnits: 1.2, comment: 'Greenzaço!', likes: 18, timestamp: '5h atrás', isUserPost: false, replies: [] }
  ];

  useEffect(() => {
    if (!user) return;
    
    // Load secondary data from localStorage (Dreams, Settings, Chat)
    // Bets are loaded via useRealtimeBets hook now
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) { try { setBankrollSettings(JSON.parse(savedSettings)); } catch(e) {} }
    const savedDreams = localStorage.getItem(DREAMS_KEY);
    if (savedDreams) { try { setDreamBoard(JSON.parse(savedDreams)); } catch(e) {} }
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) { try { setUserProfile(JSON.parse(savedProfile)); } catch(e) {} }
    const savedPosts = localStorage.getItem(COMMUNITY_KEY);
    if (savedPosts) { try { setCommunityPosts(JSON.parse(savedPosts)); } catch(e) { setCommunityPosts(getMockPosts()); } } else { setCommunityPosts(getMockPosts()); }
    const savedChat = localStorage.getItem(CHAT_KEY);
    if (savedChat) { try { setChatMessages(JSON.parse(savedChat) || []); } catch(e) { setChatMessages([]); } }

    if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
      showToast("Notificações Ativadas! 🔔", "success");
    }
  };

  // Persist Local Data
  useEffect(() => { if (user) localStorage.setItem(SETTINGS_KEY, JSON.stringify(bankrollSettings)); }, [bankrollSettings, user]);
  useEffect(() => { if (user) localStorage.setItem(DREAMS_KEY, JSON.stringify(dreamBoard)); }, [dreamBoard, user]);
  useEffect(() => { if (user) localStorage.setItem(PROFILE_KEY, JSON.stringify(userProfile)); }, [userProfile, user]);
  useEffect(() => { localStorage.setItem(COMMUNITY_KEY, JSON.stringify(communityPosts)); }, [communityPosts]);
  useEffect(() => { if (chatMessages.length > 0) localStorage.setItem(CHAT_KEY, JSON.stringify(chatMessages)); }, [chatMessages]);

  const showToast = (message: string, type: 'success' | 'info') => setToast({ message, type });

  const handleSendMessage = (text: string) => {
      const newMessage: ChatMessage = {
          id: Date.now().toString(),
          userId: user!.id,
          username: userProfile.username,
          userAvatar: userProfile.avatarUrl,
          text,
          timestamp: new Date().toISOString(),
          role: user?.role
      };
      setChatMessages(prev => [...prev, newMessage]);
  };

  const handleAddBet = async (betData: any) => {
      if (!user) return;

      // Prepare payload for Supabase
      const payload = {
          user_id: user.id,
          date: betData.date,
          sport: betData.sport,
          market: betData.market,
          selection: betData.selection,
          odds: betData.odds,
          stake_units: betData.stakeUnits,
          result: betData.result,
          analysis: betData.analysis,
          link: betData.link,
          confidence: betData.confidence,
          sent_to_group: betData.sentToGroup || false,
          tip_type: betData.tipType || null,
          // Calculate profit on server or client? Doing client for now to match interface
          profit_units: betData.result === BetResult.WIN 
            ? (betData.stakeUnits * betData.odds) - betData.stakeUnits 
            : betData.result === BetResult.LOSS ? -betData.stakeUnits : 0
      };

      const { error } = await BetsService.createBet(payload);

      if (error) {
          showToast(`Erro ao salvar: ${error}`, 'info');
      } else {
          // Success! Realtime subscription will update the list automatically
          if (betData.result === BetResult.WIN) {
              const winAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
              winAudio.play().catch(e => console.log(e));
              setShowMoneyRain(true);
              setTimeout(() => setShowMoneyRain(false), 5000);
          }
          if (betData.sentToGroup) setActiveTab('feed');
      }
  };

  const handleUpdateBet = async (betId: string, updates: Partial<Bet>) => {
      // Map frontend Bet type to DB snake_case structure
      const dbUpdates: any = {};
      if (updates.result) dbUpdates.result = updates.result;
      if (updates.profitUnits !== undefined) dbUpdates.profit_units = updates.profitUnits;
      // Add other fields as needed

      const { error } = await BetsService.updateBet(betId, dbUpdates);

      if (error) {
          showToast('Erro ao atualizar aposta.', 'info');
      } else {
          if (updates.result === BetResult.WIN) {
              const winAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); 
              winAudio.play().catch(e => console.log(e));
              setShowMoneyRain(true);
              setTimeout(() => setShowMoneyRain(false), 5000);
          }
      }
  };

  const handleDeleteBet = async (id: string) => {
      const { error } = await BetsService.deleteBet(id);
      if (error) {
          showToast('Erro ao excluir aposta.', 'info');
      } else {
          showToast('Aposta excluída.', 'info');
      }
  };

  const handleClearHistory = () => {
      if(confirm("Deseja realmente apagar todas as apostas?")) {
          // In a real app with backend, use a bulk delete endpoint.
          // Iterating is slow but safe for now.
          bets.forEach(b => handleDeleteBet(b.id));
      }
  };

  // --- MISSING HANDLERS START ---
  const handleAddDream = (item: any) => {
    setDreamBoard(prev => [...prev, { ...item, id: Date.now().toString(), dateAdded: new Date().toISOString() }]);
    showToast('Sonho adicionado ao quadro!', 'success');
  };

  const handleRemoveDream = (id: string) => {
    setDreamBoard(prev => prev.filter(d => d.id !== id));
    showToast('Item removido.', 'info');
  };

  const handleAddPost = (post: any) => {
    const newPost: CommunityPost = { 
        ...post, 
        id: Date.now().toString(), 
        likes: 0, 
        timestamp: 'Agora', 
        isUserPost: true, 
        replies: [] 
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    showToast('Post publicado na comunidade!', 'success');
  };

  const handleLikePost = (id: string) => {
    setCommunityPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleCommentOnPost = (postId: string, text: string) => {
      const newComment: PostComment = { 
          id: Date.now().toString(), 
          username: userProfile.username, 
          avatarUrl: userProfile.avatarUrl, 
          text: text, 
          timestamp: 'Agora' 
      };
      setCommunityPosts(prevPosts => prevPosts.map(post => { 
          if (post.id === postId) { 
              return { ...post, replies: [newComment, ...(post.replies || [])] }; 
          } 
          return post; 
      }));
      showToast('Comentário enviado!', 'success');
  };
  // --- MISSING HANDLERS END ---

  // Recalculate Stats locally based on 'bets' array
  const stats = { 
      totalBets: bets.length, 
      winRate: bets.filter(b => b.result === BetResult.WIN).length / (bets.filter(b => b.result !== BetResult.PENDING).length || 1) * 100, 
      roi: 0, // Placeholder - implement proper ROI calc function
      totalProfitUnits: bets.reduce((acc, b) => acc + (b.profitUnits || 0), 0), 
      currentStreak: 0 // Placeholder
  }; 

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col relative">
      {/* MONEY RAIN EFFECT */}
      {showMoneyRain && <MoneyRain />}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3"><Logo className="w-10 h-10" /><h1 className="text-xl font-display font-bold hidden sm:block">VAPO<span className="text-cyan-400">BET</span></h1></div>
          <nav className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
             {['dashboard', 'history', 'feed', 'community', 'ai'].map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}>{tab === 'ai' ? 'IA Coach' : tab === 'feed' ? 'Live' : tab}</button>
             ))}
             {user?.role === 'admin' && (
                 <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all capitalize flex items-center gap-2 ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow' : 'text-indigo-400 hover:text-white'}`}>
                    <Shield size={14} /> Admin
                 </button>
             )}
          </nav>
          <div className="flex items-center gap-3">
              {/* Notification Permission Toggle */}
              {notificationPermission !== 'granted' && (
                  <button 
                    onClick={requestNotificationPermission}
                    className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors border border-transparent hover:border-yellow-500/30"
                    title="Ativar Notificações"
                  >
                      <BellRing size={20} className={notificationPermission === 'denied' ? 'opacity-50' : 'animate-pulse'} />
                  </button>
              )}

              {/* Plan Badge / Upgrade Trigger */}
              {user?.plan === 'free' && user?.role !== 'admin' ? (
                  <button onClick={() => setIsPricingOpen(true)} className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full text-xs font-bold text-black hover:scale-105 transition-transform shadow-lg shadow-yellow-500/20 animate-pulse">
                      <Crown size={12} /> <span className="hidden sm:inline">Assinar PRO</span><span className="sm:hidden">VIP</span>
                  </button>
              ) : (user?.plan === 'pro') && (
                  <div className="flex items-center px-3 py-1 bg-yellow-500/10 rounded-full border border-yellow-500/30 text-xs font-bold text-yellow-400 gap-1 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div> <span className="hidden sm:inline">PRO TRADER</span><span className="sm:hidden">PRO</span>
                  </div>
              )}

              <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-white rounded-lg"><Settings size={20} /></button>
              <button onClick={() => setIsProfileModalOpen(true)} className="p-1 rounded-full border border-slate-700 hover:border-cyan-500"><div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center">{userProfile.avatarUrl ? <img src={userProfile.avatarUrl} className="w-full h-full object-cover" /> : <UserCircle size={20} className="text-slate-400" />}</div></button>
              <button onClick={logout} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"><LogOut size={20} /></button>
              {user?.role === 'admin' && (
                 <button onClick={() => setIsModalOpen(true)} className="hidden md:flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 px-4 py-2 rounded-lg text-sm font-semibold uppercase hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"><PlusCircle size={18} /> Nova</button>
              )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="md:hidden flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-xl overflow-x-auto">
           {['dashboard', 'feed', 'community', 'history'].map(tab => (
               <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 min-w-[80px] py-2 text-sm font-medium rounded-lg capitalize ${activeTab === tab ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>{tab}</button>
           ))}
           {user?.role === 'admin' && (
               <button onClick={() => setActiveTab('admin')} className={`flex-1 min-w-[80px] py-2 text-sm font-bold rounded-lg capitalize ${activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'text-indigo-400'}`}>Admin</button>
           )}
        </div>

        <div className="space-y-8">
          <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}><Dashboard stats={stats} bets={bets} settings={bankrollSettings} onOpenSettings={() => setIsSettingsOpen(true)} dreamItems={dreamBoard} onNavigateToDreams={() => setIsVisionBoardOpen(true)} onNavigateToCommunity={() => setActiveTab('community')} /></div>
          
          <div className={activeTab === 'feed' ? 'block' : 'hidden'}>
             <LivePlayer user={user} />
             {/* Feed now filters based on Plan and User Role */}
             <TipFeed bets={bets} userPlan={user?.plan || 'free'} userRole={user?.role} />
          </div>
          
          <div className={activeTab === 'community' ? 'block' : 'hidden'}><CommunityBoard posts={communityPosts} userBets={bets} onPost={handleAddPost} onLike={handleLikePost} onComment={handleCommentOnPost} userProfile={userProfile} settings={bankrollSettings} chatMessages={chatMessages} onSendMessage={handleSendMessage} currentUser={user!} /></div>
          <div className={activeTab === 'history' ? 'block' : 'hidden'}>
              <BetList 
                bets={bets} 
                onDelete={handleDeleteBet} 
                onClear={handleClearHistory} 
                settings={bankrollSettings}
                onUpdateBet={handleUpdateBet} // PASS UPDATE FUNCTION
                userRole={user?.role}
              />
          </div>
          <div className={activeTab === 'ai' ? 'block' : 'hidden'}><AIAnalysis bets={bets} /></div>
          <div className={activeTab === 'admin' ? 'block' : 'hidden'}><AdminDashboard /></div>
        </div>
      </main>

      {isModalOpen && <AddBetForm onAdd={handleAddBet} onClose={() => setIsModalOpen(false)} onShowToast={showToast} userRole={user?.role} />}
      {isSettingsOpen && <BankrollSettingsModal settings={bankrollSettings} onSave={(s) => {setBankrollSettings(s); showToast("Salvo!", "success");}} onClose={() => setIsSettingsOpen(false)} />}
      {isVisionBoardOpen && <div className="fixed inset-0 z-50 bg-[#0f172a] overflow-y-auto"><div className="max-w-7xl mx-auto px-4 py-8"><button onClick={() => setIsVisionBoardOpen(false)} className="mb-6 text-slate-400 hover:text-white flex items-center gap-2"><ArrowLeft size={20} /> Voltar</button><VisionBoard items={dreamBoard} onAdd={handleAddDream} onRemove={handleRemoveDream} /></div></div>}
      {isProfileModalOpen && <UserProfileModal profile={userProfile} onSave={(p) => {setUserProfile(p); showToast("Perfil atualizado!", "success");}} onClose={() => setIsProfileModalOpen(false)} />}
      
      {/* PRICING MODAL */}
      {isPricingOpen && (
          <PricingModal 
            onClose={() => setIsPricingOpen(false)} 
            onSuccess={() => {
                showToast("Plano ativado com sucesso! Bem-vindo à elite.", "success");
                window.location.reload(); // Refresh to update context/UI
            }} 
          />
      )}
    </div>
  );
};

const App: React.FC = () => <AuthProvider><AuthWrapper /></AuthProvider>;
const AuthWrapper: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><Logo className="w-16 h-16 animate-bounce" /></div>;
  if (!user) return <LoginScreen />;
  return <AuthenticatedApp />;
};

export default App;