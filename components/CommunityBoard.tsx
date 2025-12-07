

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bet, BetResult, CommunityPost, UserProfile, BankrollSettings, ChatMessage, User, Banner } from '../types';
import { dbService } from '../services/database';
import { Users, Trophy, ThumbsUp, MessageCircle, PartyPopper, Plus, X, Search, CheckCircle2, Crown, Sparkles, Share2, Quote, Loader2, TrendingUp, Send, User as UserIcon, Hash, Gift, ChevronDown, ChevronUp, Image as ImageIcon, Video, Link as LinkIcon, Trash2, Megaphone } from 'lucide-react';

interface CommunityBoardProps {
  posts: CommunityPost[];
  userBets?: Bet[];
  onPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'timestamp' | 'isUserPost'>) => void;
  onLike: (id: string) => void;
  onComment?: (postId: string, text: string) => void;
  userProfile?: UserProfile;
  settings: BankrollSettings;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUser: User;
}

const POSTS_PER_PAGE = 6;

export const CommunityBoard: React.FC<CommunityBoardProps> = ({ 
  posts = [], 
  userBets = [], 
  onPost, 
  onLike, 
  onComment,
  userProfile, 
  settings, 
  chatMessages = [], 
  onSendMessage, 
  currentUser 
}) => {
  // FIX: Default to 'feed' ensures the wall is visible immediately
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBetId, setSelectedBetId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showMembers, setShowMembers] = useState(true);
  
  // Banner State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isBannerManagerOpen, setIsBannerManagerOpen] = useState(false);
  const [newBanner, setNewBanner] = useState<{title: string, mediaUrl: string, linkUrl: string, type: 'image' | 'video'}>({
      title: '', mediaUrl: '', linkUrl: '', type: 'image'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Feed Comment System State
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});

  // Chat State
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Calculate Unit Value
  const unitValue = settings.startBankroll / settings.unitDivisor;
  const isAdmin = currentUser?.role === 'admin';

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const winningBets = userBets.filter(b => b.result === BetResult.WIN);
  
  // SAFEGUARD: Ensure posts is an array
  const safePosts = Array.isArray(posts) ? posts : [];
  const visiblePosts = safePosts.slice(0, visibleCount);
  const hasMore = visibleCount < safePosts.length;

  // Load Banners
  useEffect(() => {
      setBanners(dbService.getBanners());
  }, [isBannerManagerOpen]);

  // Banner Rotation
  useEffect(() => {
      if (banners.length <= 1) return;
      const interval = setInterval(() => {
          setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // 5 seconds
      return () => clearInterval(interval);
  }, [banners.length]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
        setVisibleCount(prev => prev + POSTS_PER_PAGE);
        setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    if (activeTab !== 'feed') return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [handleLoadMore, activeTab]);

  useEffect(() => {
      if (activeTab === 'chat' && chatEndRef.current) {
          chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, activeTab]);

  const handlePost = () => {
    if (!selectedBetId) return;
    const bet = userBets.find(b => b.id === selectedBetId);
    if (!bet) return;

    onPost({
        username: userProfile?.username || 'VapoBoss',
        userAvatar: userProfile?.avatarUrl,
        betSelection: bet.selection,
        betMarket: bet.market,
        odds: bet.odds,
        profitUnits: bet.profitUnits || 0,
        comment: comment || 'Mais um pra conta! VAPO! 🙅‍♂️'
    });

    setIsModalOpen(false);
    setSelectedBetId(null);
    setComment('');
  };

  const handleSendChat = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newMessage.trim()) return;
      
      onSendMessage(newMessage);
      setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSendChat();
      }
  };

  // Comment System Functions
  const toggleComments = (postId: string) => {
      const newSet = new Set(expandedComments);
      if (newSet.has(postId)) {
          newSet.delete(postId);
      } else {
          newSet.add(postId);
      }
      setExpandedComments(newSet);
  };

  const submitPostComment = (postId: string) => {
      const text = commentInputs[postId];
      if (onComment && text && text.trim()) {
          onComment(postId, text);
          setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
  };

  // BANNER MANAGER FUNCTIONS
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 3 * 1024 * 1024) {
          alert('Arquivo muito grande. Máximo 3MB.');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          setNewBanner(prev => ({ 
              ...prev, 
              mediaUrl: reader.result as string,
              type: file.type.startsWith('video') ? 'video' : 'image'
          }));
      };
      reader.readAsDataURL(file);
  };

  const handleAddBanner = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBanner.mediaUrl) return;

      const banner: Banner = {
          id: Date.now().toString(),
          title: newBanner.title || 'Comunicado',
          mediaUrl: newBanner.mediaUrl,
          mediaType: newBanner.type,
          linkUrl: newBanner.linkUrl,
          active: true,
          createdAt: new Date().toISOString()
      };

      dbService.saveBanner(banner);
      setBanners(dbService.getBanners());
      setNewBanner({ title: '', mediaUrl: '', linkUrl: '', type: 'image' });
  };

  const handleDeleteBanner = (id: string) => {
      if (confirm('Excluir este banner?')) {
          dbService.deleteBanner(id);
          setBanners(dbService.getBanners());
      }
  };

  return (
    <div className="animate-fade-in space-y-4 pb-10">
      <style>{`
        .chat-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .chat-scrollbar::-webkit-scrollbar-track { background-color: #2b2d31; border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb { background-color: #1a1b1e; border-radius: 4px; }
        .chat-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #111214; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.5); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.4); }
        @keyframes slideUpFadeStagger { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .stagger-enter { opacity: 0; animation: slideUpFadeStagger 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        /* Comment Fade In */
        @keyframes commentFadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-comment-entry { animation: commentFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>

      {/* --- BANNER CAROUSEL AREA --- */}
      <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-black border border-slate-800 group/banners">
          
          {/* Admin Edit Trigger */}
          {isAdmin && (
              <button 
                onClick={() => setIsBannerManagerOpen(true)}
                className="absolute top-4 right-4 z-30 bg-black/60 hover:bg-black/80 text-white p-2 rounded-lg backdrop-blur-sm border border-white/10 transition-colors opacity-0 group-hover/banners:opacity-100"
              >
                  <Megaphone size={16} />
              </button>
          )}

          {banners.length > 0 ? (
              <div className="relative aspect-[21/9] md:aspect-[32/9] max-h-[250px] w-full bg-slate-900">
                   {banners.map((banner, index) => (
                       <div 
                         key={banner.id}
                         className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                       >
                           {/* Media */}
                           {banner.mediaType === 'video' ? (
                               <video src={banner.mediaUrl} autoPlay loop muted className="w-full h-full object-cover" />
                           ) : (
                               <img src={banner.mediaUrl} alt={banner.title} className="w-full h-full object-cover" />
                           )}
                           
                           {/* Gradient Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90"></div>
                           
                           {/* Content */}
                           <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                               <h3 className="text-xl md:text-3xl font-display font-bold text-white mb-2 drop-shadow-md">{banner.title}</h3>
                               {banner.linkUrl && (
                                   <a 
                                     href={banner.linkUrl} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                                   >
                                       Saiba Mais <Share2 size={12} />
                                   </a>
                               )}
                           </div>
                       </div>
                   ))}

                   {/* Indicators */}
                   {banners.length > 1 && (
                       <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                           {banners.map((_, idx) => (
                               <button 
                                 key={idx}
                                 onClick={() => setCurrentBannerIndex(idx)}
                                 className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                               />
                           ))}
                       </div>
                   )}
              </div>
          ) : (
              // Empty State / Placeholder for Ads
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 p-8 text-center flex flex-col items-center justify-center min-h-[160px]">
                  <h3 className="text-xl font-display font-bold text-slate-500 mb-1">Espaço de Comunicação</h3>
                  <p className="text-sm text-slate-600">Novidades e avisos importantes aparecerão aqui.</p>
                  {isAdmin && (
                      <button onClick={() => setIsBannerManagerOpen(true)} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline">
                          Adicionar Primeiro Banner
                      </button>
                  )}
              </div>
          )}
      </div>

      {/* TABS - MOVED TO TOP */}
      <div className="flex justify-center sticky top-20 z-30 mb-6">
          <div className="bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 flex gap-2 shadow-2xl w-full max-w-md ring-1 ring-white/5">
              <button 
                onClick={() => setActiveTab('feed')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'feed' ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                  <Trophy size={16} /> Mural de Greens
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-[#5865f2] text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                  <MessageCircle size={16} /> Chat
              </button>
          </div>
      </div>

      {/* CHAT INTERFACE */}
      {activeTab === 'chat' && (
          <div className="bg-[#313338] border border-[#1e1f22] rounded-xl overflow-hidden flex h-[75vh] min-h-[500px] shadow-2xl relative animate-fade-in">
              <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
                  <div className="px-4 py-3 border-b border-[#26272d] bg-[#313338] flex justify-between items-center shadow-sm z-10 shrink-0">
                      <div className="flex items-center gap-2">
                          <Hash className="text-[#80848e]" size={24} />
                          <h3 className="font-bold text-white text-base">resenha-vapo</h3>
                          <div className="hidden sm:block h-6 w-px bg-[#3f4147] mx-2"></div>
                          <p className="hidden sm:block text-xs text-[#b5bac1] font-medium truncate max-w-xs">Onde os vencedores conversam.</p>
                      </div>
                      <div className="flex items-center gap-4 text-[#b5bac1]">
                          <Users size={20} className={`cursor-pointer transition-colors ${showMembers ? 'text-white' : 'hover:text-white'}`} onClick={() => setShowMembers(!showMembers)} />
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto chat-scrollbar flex flex-col p-4 bg-[#313338]">
                      <div className="mt-auto mb-6 px-4">
                          <div className="w-16 h-16 bg-[#41434a] rounded-full flex items-center justify-center mb-4"><Hash size={40} className="text-white" /></div>
                          <h2 className="text-3xl font-bold text-white mb-2">Bem-vindo a #resenha-vapo!</h2>
                          <p className="text-[#b5bac1]">Este é o começo do canal oficial.</p>
                      </div>

                      {chatMessages && chatMessages.length > 0 ? chatMessages.map((msg, index) => {
                          const isMe = currentUser ? msg.userId === currentUser.id : false;
                          const isAdminRole = msg.role === 'admin';
                          const prevMsg = chatMessages[index - 1];
                          const isGrouped = prevMsg && prevMsg.userId === msg.userId && (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 5 * 60 * 1000);

                          return (
                              <div key={msg.id} className={`group flex items-start gap-4 px-2 py-0.5 hover:bg-[#2e3035] -mx-2 transition-colors ${isGrouped ? 'mt-0.5' : 'mt-4'}`}>
                                  <div className="w-10 flex-shrink-0 cursor-pointer pt-0.5">
                                      {!isGrouped ? (
                                          <div className={`w-10 h-10 rounded-full overflow-hidden hover:opacity-80 active:translate-y-0.5 transition-all ${isAdminRole ? 'ring-2 ring-indigo-500' : ''}`}>
                                              {msg.userAvatar ? <img src={msg.userAvatar} className="w-full h-full object-cover" /> : <div className={`w-full h-full flex items-center justify-center ${isAdminRole ? 'bg-indigo-500' : 'bg-[#5865f2]'}`}><UserIcon size={20} className="text-white" /></div>}
                                          </div>
                                      ) : (
                                          <div className="text-[10px] text-[#949ba4] opacity-0 group-hover:opacity-100 text-right w-full pr-1 select-none pt-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                      )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      {!isGrouped && (
                                          <div className="flex items-center gap-2 mb-0.5">
                                              <span className={`font-medium hover:underline cursor-pointer ${isAdminRole ? 'text-indigo-400' : isMe ? 'text-[#f23f42]' : 'text-emerald-400'}`}>{msg.username}</span>
                                              {isAdminRole && <span className="bg-[#5865f2] text-white text-[10px] px-1 rounded-[3px] uppercase font-bold flex items-center gap-0.5 leading-none h-4"><CheckCircle2 size={8} /> STAFF</span>}
                                              <span className="text-xs text-[#949ba4] font-medium ml-1">{new Date(msg.timestamp).toLocaleDateString()} {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                          </div>
                                      )}
                                      <p className="text-[#dbdee1] whitespace-pre-wrap leading-[1.375rem] break-words">{msg.text}</p>
                                  </div>
                              </div>
                          );
                      }) : <div className="text-center text-[#949ba4] py-10">Nenhuma mensagem ainda.</div>}
                      <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendChat} className="px-4 pb-6 pt-2 bg-[#313338] shrink-0">
                      <div className="bg-[#383a40] rounded-lg px-4 py-2.5 flex items-center gap-3">
                          <button type="button" className="text-[#b5bac1] hover:text-[#dbdee1] bg-[#2b2d31] rounded-full p-1 transition-colors"><Plus size={16} /></button>
                          <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={`Conversar em #resenha-vapo`} className="flex-1 bg-transparent border-none text-[#dbdee1] placeholder-[#949ba4] focus:outline-none h-full text-sm font-medium" />
                          <div className="flex items-center gap-3 text-[#b5bac1]">
                              <Gift size={20} className="hover:text-[#dbdee1] cursor-pointer hidden sm:block" />
                              {newMessage.trim() && <button type="submit" className="text-[#5865f2] hover:text-white transition-colors"><Send size={20} /></button>}
                          </div>
                      </div>
                  </form>
              </div>

              {showMembers && (
                  <div className="w-60 bg-[#2b2d31] border-l border-[#1e1f22] hidden md:flex flex-col p-4 overflow-y-auto">
                      <h3 className="text-xs font-bold text-[#949ba4] mb-4 uppercase tracking-wide">Membros Online — 3</h3>
                      <div className="flex items-center gap-3 mb-3 opacity-100 hover:bg-[#35373c] p-1.5 rounded cursor-pointer transition-colors group">
                          <div className="relative"><div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center"><Hash size={16} className="text-white" /></div><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div></div>
                          <div className="overflow-hidden"><span className="text-white text-sm font-medium block">VapoBot</span><span className="text-[10px] text-[#b5bac1] uppercase font-bold flex items-center gap-1"><CheckCircle2 size={8} className="text-[#5865f2]" /> Bot</span></div>
                      </div>
                      <div className="flex items-center gap-3 mb-3 opacity-100 hover:bg-[#35373c] p-1.5 rounded cursor-pointer transition-colors group">
                          <div className="relative">{userProfile?.avatarUrl ? <img src={userProfile.avatarUrl} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center"><UserIcon size={16} className="text-white" /></div>}<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div></div>
                          <div className="overflow-hidden"><span className="text-white text-sm font-medium block truncate max-w-[120px]">{userProfile?.username || 'Você'}</span><p className="text-[10px] text-[#b5bac1] truncate">Apostando...</p></div>
                      </div>
                      <div className="flex items-center gap-3 mb-3 opacity-60 hover:opacity-100 hover:bg-[#35373c] p-1.5 rounded cursor-pointer transition-colors group">
                          <div className="relative"><div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center"><UserIcon size={16} className="text-white" /></div><div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2b2d31] rounded-full"></div></div>
                          <div className="overflow-hidden"><span className="text-[#949ba4] group-hover:text-gray-200 text-sm font-medium block">Trader_Elite</span></div>
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* FEED CONTENT */}
      {activeTab === 'feed' && (
        <>
            <div className="relative rounded-3xl overflow-hidden border border-emerald-500/20 group shadow-2xl shadow-emerald-900/10 mb-8 animate-fade-in">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop')] bg-cover bg-center opacity-10 group-hover:scale-105 transition-transform duration-1000"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-emerald-950/80"></div>
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]"><Crown size={14} /> Hall da Fama VAPO</div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white leading-none tracking-tight">Mural dos <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Vencedores</span></h2>
                        <p className="text-slate-400 max-w-lg text-sm md:text-base leading-relaxed font-light">Onde a elite se encontra. Celebre suas vitórias, inspire a comunidade e construa seu legado no mercado.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="flex-1 md:flex-none px-6 py-4 bg-slate-800/50 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/30 rounded-xl font-bold text-emerald-400 flex items-center justify-center gap-2 transition-all backdrop-blur-sm"><MessageCircle size={20} /> VIP WhatsApp</a>
                        <button onClick={() => setIsModalOpen(true)} className="flex-1 md:flex-none group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold text-white shadow-lg shadow-emerald-900/40 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-emerald-500/20">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <div className="relative flex items-center justify-center gap-3"><PartyPopper size={22} className="group-hover:rotate-12 transition-transform" /><span className="uppercase tracking-wide text-sm">Postar Green</span></div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visiblePosts.map((post, index) => (
                    <div key={post.id} className="stagger-enter group relative flex flex-col" style={{ animationDelay: `${(index % POSTS_PER_PAGE) * 0.1}s` }}>
                        <div className="relative h-full bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/60 overflow-hidden transition-all duration-300 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col">
                            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                            <div className="p-5 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`relative w-10 h-10 rounded-full p-[2px] ${post.isUserPost ? 'bg-gradient-to-tr from-emerald-400 to-cyan-400' : 'bg-slate-700'}`}>
                                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-900">{post.userAvatar ? <img src={post.userAvatar} alt="avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">{post.username.substring(0, 2).toUpperCase()}</div>}</div>
                                    </div>
                                    <div><h4 className={`font-bold text-sm leading-tight ${post.isUserPost ? 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300' : 'text-slate-200'}`}>{post.username}</h4><span className="text-[10px] text-slate-500 font-medium">{post.timestamp}</span></div>
                                </div>
                                {post.isUserPost && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5"><span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Você</span></div>}
                            </div>
                            <div className="px-5 pb-2 relative z-10 flex-1">
                                <Quote size={24} className="text-slate-700 mb-2 opacity-50" />
                                <p className="text-slate-300 text-sm italic leading-relaxed mb-6 font-light pl-2 border-l-2 border-slate-700">"{post.comment}"</p>
                                <div className="relative bg-black/40 rounded-xl border border-white/5 overflow-hidden group-hover:border-emerald-500/20 transition-colors">
                                    <div className="absolute top-0 right-0 p-2 opacity-20"><TrendingUp size={60} className="text-emerald-500" /></div>
                                    <div className="p-4 relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div><p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Seleção</p><h3 className="text-white font-display font-bold text-lg leading-tight group-hover:text-emerald-50 transition-colors">{post.betSelection}</h3><p className="text-xs text-cyan-400/80 font-medium mt-0.5">{post.betMarket}</p></div>
                                            <div className="text-right"><p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Odd</p><span className="font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-xs">@{post.odds.toFixed(2)}</span></div>
                                        </div>
                                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                            <div className="flex-1 bg-gradient-to-r from-emerald-950/50 to-emerald-900/20 rounded-lg p-2 border border-emerald-500/10 flex items-center justify-between">
                                                <span className="text-[10px] text-emerald-500/70 font-bold uppercase">Lucro</span>
                                                <div className="text-right"><span className="block font-mono text-lg font-bold text-emerald-400 leading-none">+{post.profitUnits.toFixed(2)}u</span><span className="text-[9px] font-mono text-emerald-600/80">{formatCurrency(post.profitUnits * unitValue)}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between relative z-10 mt-2">
                                <button onClick={() => onLike(post.id)} className={`flex items-center gap-2 text-xs font-bold transition-all ${post.likes > 0 ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}><ThumbsUp size={16} className={post.likes > 0 ? "fill-emerald-400" : ""} />{post.likes > 0 ? post.likes : 'Curtir'} </button>
                                
                                <button 
                                    onClick={() => toggleComments(post.id)}
                                    className={`flex items-center gap-2 text-xs font-bold transition-all ${expandedComments.has(post.id) ? 'text-cyan-400' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <MessageCircle size={16} />
                                    {(post.replies || []).length > 0 ? (post.replies || []).length : 'Comentar'}
                                    {expandedComments.has(post.id) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>

                                <button className="text-slate-500 hover:text-cyan-400 transition-colors"><Share2 size={16} /></button>
                            </div>

                            {/* COMMENT DRAWER */}
                            {expandedComments.has(post.id) && (
                                <div className="bg-[#0f1116] border-t border-slate-800 p-4 animate-comment-entry relative z-20 rounded-b-2xl origin-top">
                                    {/* Input */}
                                    <div className="flex gap-2 mb-4">
                                        <input 
                                            type="text" 
                                            value={commentInputs[post.id] || ''}
                                            onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                            placeholder="Escreva um comentário..."
                                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none placeholder:text-slate-600"
                                            onKeyDown={(e) => e.key === 'Enter' && submitPostComment(post.id)}
                                        />
                                        <button 
                                            onClick={() => submitPostComment(post.id)}
                                            disabled={!commentInputs[post.id]}
                                            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg px-3 transition-colors"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>

                                    {/* List */}
                                    <div className="space-y-4 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                        {(post.replies || []).length > 0 ? (
                                            (post.replies || []).map(reply => (
                                                <div key={reply.id} className="flex gap-3 text-sm group/comment">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden border border-slate-700 mt-0.5">
                                                        {reply.avatarUrl ? <img src={reply.avatarUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><UserIcon size={14} /></div>}
                                                    </div>
                                                    <div className="bg-slate-800/50 p-2.5 rounded-lg rounded-tl-none border border-slate-800 flex-1">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <span className="font-bold text-slate-200 text-xs hover:underline cursor-pointer">{reply.username}</span>
                                                            <span className="text-[10px] text-slate-500">{reply.timestamp}</span>
                                                        </div>
                                                        <p className="text-slate-300 text-xs leading-relaxed">{reply.text}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center text-xs text-slate-600 py-2">Seja o primeiro a comentar!</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div ref={observerTarget} className="flex justify-center py-8">{isLoadingMore && <Loader2 size={28} className="text-cyan-400 animate-spin" />}</div>
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.15)] animate-scale-up overflow-hidden relative">
                <div className="relative p-6 border-b border-white/5 bg-slate-900/50">
                    <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full"><X size={20} /></button>
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400"><Sparkles size={20} /></div><div><h3 className="text-lg font-display font-bold text-white">Compartilhar Green</h3><p className="text-xs text-slate-400">Inspire a comunidade com sua vitória.</p></div></div>
                </div>
                <div className="p-6 space-y-6">
                    {winningBets.length === 0 ? (
                        <div className="text-center py-10 px-4 bg-slate-950/50 rounded-2xl border border-dashed border-slate-800"><Trophy size={48} className="mx-auto mb-4 text-slate-700" /><p className="font-medium text-slate-300">Sem Greens recentes.</p></div>
                    ) : (
                        <>
                            <div className="space-y-3"><label className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1">Selecione a Vitória</label><div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar pr-1">{winningBets.map(bet => (
                                <div key={bet.id} onClick={() => setSelectedBetId(bet.id)} className={`group relative p-4 rounded-xl border cursor-pointer transition-all ${selectedBetId === bet.id ? 'bg-emerald-500/10 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}>
                                    <div className="flex justify-between items-center"><div><span className={`text-sm font-bold block ${selectedBetId === bet.id ? 'text-white' : 'text-slate-300'}`}>{bet.selection}</span><span className="text-[10px] text-slate-500 uppercase tracking-wider">{bet.market}</span></div><div className="text-right"><span className="block text-emerald-400 font-mono font-bold">+{bet.profitUnits?.toFixed(2)}u</span></div></div>
                                </div>
                            ))}</div></div>
                            <div className="space-y-2"><label className="text-xs text-slate-400 font-bold uppercase tracking-widest pl-1">Comentário</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Conte como foi essa leitura..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:border-emerald-500 focus:outline-none resize-none min-h-[100px]" /></div>
                            <button onClick={handlePost} disabled={!selectedBetId} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2"><PartyPopper size={18} /> Publicar no Mural</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- BANNER MANAGER MODAL (ADMIN) --- */}
      {isBannerManagerOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
              <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 rounded-t-2xl">
                      <h2 className="text-lg font-bold text-white flex items-center gap-2"><Megaphone className="text-indigo-500" /> Gestão de Banners</h2>
                      <button onClick={() => setIsBannerManagerOpen(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-8">
                      {/* ADD NEW */}
                      <div className="space-y-4">
                          <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">Novo Banner</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold">Título</label>
                                  <input 
                                    type="text" 
                                    value={newBanner.title} 
                                    onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="Ex: Promoção de Natal"
                                  />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] text-slate-500 uppercase font-bold">Link de Destino</label>
                                  <input 
                                    type="text" 
                                    value={newBanner.linkUrl} 
                                    onChange={(e) => setNewBanner({...newBanner, linkUrl: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="https://..."
                                  />
                              </div>
                          </div>

                          {/* Media Upload */}
                          <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-800/30 group"
                          >
                              <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*,video/*"
                                onChange={handleBannerUpload}
                              />
                              {newBanner.mediaUrl ? (
                                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-black">
                                      {newBanner.type === 'video' ? (
                                          <video src={newBanner.mediaUrl} className="w-full h-full object-cover" />
                                      ) : (
                                          <img src={newBanner.mediaUrl} className="w-full h-full object-cover" />
                                      )}
                                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <span className="text-white text-xs font-bold">Alterar Mídia</span>
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      <div className="p-3 bg-slate-800 rounded-full mb-2 group-hover:bg-indigo-500/20 transition-colors">
                                          <ImageIcon className="text-slate-400 group-hover:text-indigo-400" />
                                      </div>
                                      <p className="text-sm text-slate-300 font-medium">Clique para carregar imagem ou vídeo</p>
                                      <p className="text-[10px] text-slate-500">Max 3MB</p>
                                  </>
                              )}
                          </div>

                          <button 
                            onClick={handleAddBanner}
                            disabled={!newBanner.mediaUrl}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl transition-colors"
                          >
                              Adicionar Banner
                          </button>
                      </div>

                      {/* LIST */}
                      <div className="space-y-4 pt-4 border-t border-slate-800">
                           <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest">Banners Ativos ({banners.length})</h3>
                           {banners.length === 0 && <p className="text-sm text-slate-500">Nenhum banner ativo.</p>}
                           <div className="space-y-3">
                               {banners.map(banner => (
                                   <div key={banner.id} className="flex items-center gap-4 bg-slate-800 p-3 rounded-xl border border-slate-700">
                                       <div className="w-16 h-10 bg-black rounded-lg overflow-hidden shrink-0">
                                           {banner.mediaType === 'video' ? (
                                               <video src={banner.mediaUrl} className="w-full h-full object-cover" />
                                           ) : (
                                               <img src={banner.mediaUrl} className="w-full h-full object-cover" />
                                           )}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                           <h4 className="text-white font-bold text-sm truncate">{banner.title}</h4>
                                           <p className="text-xs text-slate-500 truncate">{banner.linkUrl || 'Sem link'}</p>
                                       </div>
                                       <button 
                                         onClick={() => handleDeleteBanner(banner.id)}
                                         className="p-2 hover:bg-rose-500/20 text-slate-500 hover:text-rose-500 rounded-lg transition-colors"
                                       >
                                           <Trash2 size={16} />
                                       </button>
                                   </div>
                               ))}
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
