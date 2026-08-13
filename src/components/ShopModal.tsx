import React, { useState } from 'react';
import { PlayerStats, ConsumableInventory, PermanentUpgrades, ShopCharacter, ShopBoard, CharacterSkin } from '../types';
import { ItemManager } from '../game/ItemManager';
import {
  Coins,
  User,
  Shield,
  Zap,
  Sparkles,
  Magnet,
  Rocket,
  Check,
  ArrowUpRight,
  ShoppingBag,
  Plus,
  Flame,
  CheckCircle2,
  AlertCircle,
  Package,
  Wand2,
  Palette,
  X,
  Shirt,
  Play,
  Award,
} from 'lucide-react';

interface ShopModalProps {
  stats: PlayerStats;
  onUpdateStats: (newStats: PlayerStats) => void;
  onClose: () => void;
}

// 1. Single-use Consumables List
const consumableItems = [
  {
    id: 'hoverboardCount' as keyof ConsumableInventory,
    name: 'Ván Trượt Bảo Vệ (Khiên Chắn)',
    price: 25,
    unitAmount: 1,
    description: 'Chống va quệt 1 lần khi đâm vào tàu hoặc rào chắn. Chạm 2 lần hoặc bấm nút Ván Trượt trong game để kích hoạt.',
    badgeText: 'Bảo vệ sinh mạng',
    color: 'from-blue-500 to-indigo-600',
    icon: Shield,
  },
  {
    id: 'headstartCount' as keyof ConsumableInventory,
    name: 'Tên Lửa Headstart Phóng Tốc',
    price: 50,
    unitAmount: 1,
    description: 'Bay trên không trung ở tốc độ cực cao ngay từ khi xuất phát trong 10 giây đầu tiên.',
    badgeText: 'Bắt đầu siêu tốc',
    color: 'from-emerald-500 to-teal-600',
    icon: Rocket,
  },
  {
    id: 'magnetBoostCount' as keyof ConsumableInventory,
    name: 'Nam Châm Khởi Đầu',
    price: 35,
    unitAmount: 1,
    description: 'Tự động kích hoạt Nam Châm Hút Xu ngay khi xuất phát giúp gom toàn bộ xu vàng.',
    badgeText: 'Thu hút xu vàng',
    color: 'from-red-500 to-rose-600',
    icon: Magnet,
  },
  {
    id: 'scoreBoosterCount' as keyof ConsumableInventory,
    name: 'Tăng Tốc Điểm Số (+5x Multiplier)',
    price: 40,
    unitAmount: 1,
    description: 'Thổi hệ số nhân điểm lên thêm +5x cho cả lượt chạy tiếp theo để lập kỷ lục đỉnh cao.',
    badgeText: 'Thưởng +5x điểm',
    color: 'from-amber-500 to-orange-600',
    icon: Sparkles,
  },
];

// 2. Permanent Upgrades List
const permanentUpgradesList = [
  {
    id: 'baseSpeedLevel' as keyof PermanentUpgrades,
    name: 'Tốc Độ Chạy Cơ Bản',
    basePrice: 80,
    maxLevel: 5,
    description: 'Tăng tốc độ xuất phát chạy tốc lực (22 m/s → 30 m/s), giúp tăng điểm nhanh hơn.',
    perLevelBonus: '+2 m/s Tốc độ xuất phát',
    color: 'from-cyan-500 to-blue-600',
    icon: Zap,
  },
  {
    id: 'baseMultiplierLevel' as keyof PermanentUpgrades,
    name: 'Hệ Số Nhân Điểm Vĩnh Viễn',
    basePrice: 100,
    maxLevel: 5,
    description: 'Tăng vĩnh viễn hệ số nhân điểm cơ bản ngay từ đầu mỗi lượt chạy.',
    perLevelBonus: '+1x Hệ số điểm cơ bản',
    color: 'from-amber-500 to-yellow-600',
    icon: Sparkles,
  },
  {
    id: 'magnetLevel' as keyof PermanentUpgrades,
    name: 'Thời Gian Nam Châm Hút Vàng',
    basePrice: 50,
    maxLevel: 5,
    description: 'Mở rộng bán kính và kéo dài thời gian hiệu lực của Nam Châm hút vàng.',
    perLevelBonus: '+2 Giây hiệu lực',
    color: 'from-red-500 to-rose-600',
    icon: Magnet,
  },
  {
    id: 'jetpackLevel' as keyof PermanentUpgrades,
    name: 'Thời Gian Tên Lửa Bay (Jetpack)',
    basePrice: 60,
    maxLevel: 5,
    description: 'Tăng lượng nhiên liệu tên lửa để bay lượn thu thập xu vàng lâu hơn.',
    perLevelBonus: '+2 Giây bay đường mây',
    color: 'from-emerald-500 to-teal-600',
    icon: Rocket,
  },
  {
    id: 'sneakersLevel' as keyof PermanentUpgrades,
    name: 'Thời Gian Giày Nhảy Cao (Super Sneakers)',
    basePrice: 45,
    maxLevel: 5,
    description: 'Duy trì trạng thái nhảy siêu cao bật vọt qua đỉnh xe tàu điện.',
    perLevelBonus: '+2 Giây nhún nhảy',
    color: 'from-purple-500 to-indigo-600',
    icon: Flame,
  },
  {
    id: 'hoverboardLevel' as keyof PermanentUpgrades,
    name: 'Thời Gian Ván Trượt Bảo Vệ',
    basePrice: 55,
    maxLevel: 5,
    description: 'Kéo dài thời lượng bảo vệ của Ván Trượt chống va quệt.',
    perLevelBonus: '+2 Giây chống va chạm',
    color: 'from-blue-500 to-indigo-600',
    icon: Shield,
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({ stats, onUpdateStats, onClose }) => {
  const [activeTab, setActiveTab] = useState<'consumables' | 'permanent' | 'characters' | 'skins' | 'boards'>('consumables');
  const [selectedSkinFilter, setSelectedSkinFilter] = useState<string>(stats.selectedCharacter || 'Jake Hero');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper to show transaction toast feedback
  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe getter for Consumables
  const consumables: ConsumableInventory = {
    hoverboardCount: 5,
    headstartCount: 2,
    magnetBoostCount: 2,
    scoreBoosterCount: 2,
    ...(stats.consumables || {}),
  };

  // Safe getter for Permanent Upgrades
  const permanentUpgrades: PermanentUpgrades = {
    baseSpeedLevel: 1,
    baseMultiplierLevel: 1,
    magnetLevel: stats.powerUpUpgrades?.magnetLevel || 1,
    hoverboardLevel: stats.powerUpUpgrades?.hoverboardLevel || 1,
    jetpackLevel: stats.powerUpUpgrades?.jetpackLevel || 1,
    multiplierLevel: stats.powerUpUpgrades?.multiplierLevel || 1,
    sneakersLevel: stats.powerUpUpgrades?.sneakersLevel || 1,
    ...(stats.permanentUpgrades || {}),
  };

  // Handle Free Test Coins Refill
  const handleRefillTestCoins = () => {
    const newCoins = stats.coins + 500;
    onUpdateStats({ ...stats, coins: newCoins });
    showToast('success', 'Đã nhận thành công +500 Xu Vàng thưởng thử nghiệm!');
  };

  // Handle Buy Single-use Consumables
  const handleBuyConsumable = (itemId: keyof ConsumableInventory, price: number, quantity: number) => {
    const totalPrice = price * quantity;

    if (stats.coins < totalPrice) {
      showToast('error', `Không đủ Xu! Cần thêm ${totalPrice - stats.coins} Xu để mua.`);
      return;
    }

    const currentQty = consumables[itemId] || 0;
    const newConsumables = {
      ...consumables,
      [itemId]: currentQty + quantity,
    };

    onUpdateStats({
      ...stats,
      coins: stats.coins - totalPrice,
      consumables: newConsumables,
    });

    const itemMeta = consumableItems.find((i) => i.id === itemId);
    showToast('success', `Đã mua thành công +${quantity} ${itemMeta?.name || 'Vật phẩm'}!`);
  };

  // Handle Buy Permanent Upgrades
  const handleUpgradePermanent = (item: (typeof permanentUpgradesList)[0]) => {
    const currentLevel = permanentUpgrades[item.id] || 1;

    if (currentLevel >= item.maxLevel) {
      showToast('error', 'Kỹ năng này đã đạt cấp tối đa (MAX)!');
      return;
    }

    const cost = item.basePrice * currentLevel;

    if (stats.coins < cost) {
      showToast('error', `Không đủ Xu! Cần thêm ${cost - stats.coins} Xu để nâng cấp.`);
      return;
    }

    const newUpgrades = {
      ...permanentUpgrades,
      [item.id]: currentLevel + 1,
    };

    const newPowerUpUpgrades = {
      ...stats.powerUpUpgrades,
      ...(item.id === 'magnetLevel' ? { magnetLevel: currentLevel + 1 } : {}),
      ...(item.id === 'hoverboardLevel' ? { hoverboardLevel: currentLevel + 1 } : {}),
      ...(item.id === 'jetpackLevel' ? { jetpackLevel: currentLevel + 1 } : {}),
      ...(item.id === 'multiplierLevel' ? { multiplierLevel: currentLevel + 1 } : {}),
      ...(item.id === 'sneakersLevel' ? { sneakersLevel: currentLevel + 1 } : {}),
    };

    onUpdateStats({
      ...stats,
      coins: stats.coins - cost,
      permanentUpgrades: newUpgrades,
      powerUpUpgrades: newPowerUpUpgrades,
    });

    showToast('success', `Đã nâng cấp [${item.name}] lên Level ${currentLevel + 1}!`);
  };

  // Handle character select/buy via ItemManager
  const handleSelectCharacter = (char: ShopCharacter) => {
    const isUnlocked = (stats.unlockedCharacters || ['Jake Hero']).includes(char.id) || char.price === 0;

    if (isUnlocked) {
      const res = ItemManager.selectItem(stats, 'character', char.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = ItemManager.purchaseItem(stats, 'character', char.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Handle board select/buy via ItemManager
  const handleSelectBoard = (board: ShopBoard) => {
    const isUnlocked = (stats.unlockedBoards || ['Star Board']).includes(board.id) || board.price === 0;

    if (isUnlocked) {
      const res = ItemManager.selectItem(stats, 'board', board.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = ItemManager.purchaseItem(stats, 'board', board.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Handle character skin select/buy via ItemManager
  const handleSelectSkin = (skin: CharacterSkin) => {
    const isUnlocked = (stats.unlockedSkins || ['jake_default']).includes(skin.id) || skin.price === 0;

    if (isUnlocked) {
      const res = ItemManager.selectSkin(stats, skin.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    } else {
      const res = ItemManager.purchaseSkin(stats, skin.id);
      if (res.success && res.updatedStats) {
        onUpdateStats(res.updatedStats);
        showToast('success', res.message);
      } else {
        showToast('error', res.message);
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl h-[84vh] max-h-[720px] flex flex-col shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl shadow-2xl border text-xs font-black flex items-center gap-2 animate-bounce ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500 text-emerald-300'
                : 'bg-rose-950/95 border-rose-500 text-rose-300'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Header Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-800/90 flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 bg-slate-950/80 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-slate-950 shadow-md">
                <ShoppingBag className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-amber-400 tracking-tight flex items-center gap-2">
                  CỬA HÀNG VẬT PHẨM
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 font-medium">Trang bị vật phẩm 1 lần & Nâng cấp chỉ số vĩnh viễn</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Balance Badge */}
            <div className="bg-amber-500/15 border border-amber-400/50 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-md">
              <Coins className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
              <span className="text-sm sm:text-base font-black font-mono text-amber-300">{stats.coins.toLocaleString()} Xu</span>
            </div>

            {/* Test Refill Button */}
            <button
              onClick={handleRefillTestCoins}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95 shadow-md cursor-pointer"
              title="Nhận thêm 500 xu thử nghiệm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+500 Xu</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-red-500/20 border border-slate-700 hover:border-red-400/60 text-slate-300 hover:text-red-300 font-black text-xs rounded-xl flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ĐÓNG</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div className="p-1.5 sm:p-2 border-b border-slate-800 bg-slate-950/50 shrink-0">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            <button
              onClick={() => setActiveTab('consumables')}
              className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'consumables'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>DÙNG 1 LẦN</span>
            </button>

            <button
              onClick={() => setActiveTab('permanent')}
              className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'permanent'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>NÂNG CẤP</span>
            </button>

            <button
              onClick={() => setActiveTab('characters')}
              className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'characters'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>NHÂN VẬT</span>
            </button>

            <button
              onClick={() => setActiveTab('skins')}
              className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'skins'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>SKIN TRANG PHỤC</span>
            </button>

            <button
              onClick={() => setActiveTab('boards')}
              className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'boards'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>VÁN TRƯỢT</span>
            </button>
          </div>
        </div>

        {/* Tab Body Scrollable Section */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {/* TAB 1: CONSUMABLE ITEMS */}
          {activeTab === 'consumables' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                  <strong>Vật phẩm hỗ trợ một lần:</strong> Mua trữ trong kho và sử dụng khi bắt đầu lượt chạy hoặc kích hoạt nhanh trong game!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {consumableItems.map((item) => {
                  const Icon = item.icon;
                  const currentQty = consumables[item.id] || 0;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-800 bg-slate-950/60 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md"
                    >
                      <div>
                        {/* Title & Avatar Icon */}
                        <div className="flex items-start justify-between gap-2.5 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-white text-sm sm:text-base">{item.name}</h3>
                              <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">
                                {item.badgeText}
                              </span>
                            </div>
                          </div>

                          <div className="bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-xl text-center shrink-0">
                            <span className="text-[10px] text-slate-400 block font-medium">Sở hữu</span>
                            <span className="text-xs font-black text-amber-300 font-mono">{currentQty} cái</span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-snug">{item.description}</p>
                      </div>

                      {/* Buy Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => handleBuyConsumable(item.id, item.price, 1)}
                          disabled={stats.coins < item.price}
                          className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            stats.coins >= item.price
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>x1 ({item.price} Xu)</span>
                        </button>

                        <button
                          onClick={() => handleBuyConsumable(item.id, Math.floor(item.price * 0.9), 5)}
                          disabled={stats.coins < Math.floor(item.price * 0.9) * 5}
                          className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            stats.coins >= Math.floor(item.price * 0.9) * 5
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                          title="Mua gói 5 cái tiết kiệm 10% xu"
                        >
                          <Coins className="w-3.5 h-3.5 fill-current shrink-0" />
                          <span>x5 ({Math.floor(item.price * 0.9) * 5} Xu)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: PERMANENT UPGRADES */}
          {activeTab === 'permanent' && (
            <div className="space-y-3">
              <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-300 flex items-center gap-2">
                <Zap className="w-4 h-4 flex-shrink-0 text-purple-400" />
                <span>
                  <strong>Nâng cấp vĩnh viễn:</strong> Các chỉ số sẽ được gia tăng vĩnh viễn cho tất cả các nhân vật!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {permanentUpgradesList.map((item) => {
                  const Icon = item.icon;
                  const currentLevel = permanentUpgrades[item.id] || 1;
                  const isMax = currentLevel >= item.maxLevel;
                  const upgradeCost = item.basePrice * currentLevel;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-800 bg-slate-950/60 hover:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-md shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-black text-white text-sm sm:text-base">{item.name}</h3>
                              <span className="text-[11px] text-emerald-400 font-bold uppercase">{item.perLevelBonus}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-snug">{item.description}</p>

                        {/* Level Progress Indicator */}
                        <div className="mt-3 bg-slate-900 border border-slate-800 p-2 rounded-xl">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-400">Cấp độ kỹ năng</span>
                            <span className="text-amber-400 font-mono font-bold">
                              Cấp {currentLevel} / {item.maxLevel} {isMax && '• MAX'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: item.maxLevel }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-2 flex-1 rounded-full transition-all ${
                                  idx < currentLevel
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 shadow-xs'
                                    : 'bg-slate-800 border border-slate-700/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Upgrade Action Button */}
                      <div className="mt-3">
                        {isMax ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-400 text-xs font-black cursor-not-allowed flex items-center justify-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>ĐÃ ĐẠT CẤP TỐI ĐA (MAX)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpgradePermanent(item)}
                            disabled={stats.coins < upgradeCost}
                            className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              stats.coins >= upgradeCost
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            <span>NÂNG CẤP LÊN CẤP {currentLevel + 1}: {upgradeCost} Xu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CHARACTERS */}
          {activeTab === 'characters' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ItemManager.getCharacters(stats).map((char) => {
                const isUnlocked = (stats.unlockedCharacters || ['Jake Hero']).includes(char.id) || char.price === 0;
                const isSelected = stats.selectedCharacter === char.id;

                return (
                  <div
                    key={char.id}
                    className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                            {char.avatarIcon}
                          </div>
                          <div>
                            <h3 className="font-black text-white text-sm sm:text-base">{char.name}</h3>
                            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                              <Award className="w-3.5 h-3.5" />
                              {char.perk}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" /> ĐANG DÙNG
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-snug mt-1.5">{char.description}</p>

                      {/* Visual Effect Badge */}
                      <div className="mt-2.5 bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center gap-2 text-xs text-cyan-300">
                        <Wand2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span><strong>Hiệu ứng 3D:</strong> {char.effect_logic}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      {isUnlocked ? (
                        <button
                          onClick={() => handleSelectCharacter(char)}
                          disabled={isSelected}
                          className={`w-full py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Chọn Nhân Vật'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectCharacter(char)}
                          disabled={stats.coins < char.price}
                          className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            stats.coins >= char.price
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4 fill-current shrink-0" />
                          <span>MUA KHÓA: {char.price} Xu</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: CHARACTER SKINS (CUSTOMIZATION) */}
          {activeTab === 'skins' && (
            <div className="space-y-3">
              {/* Character Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
                <span className="text-xs text-slate-400 font-bold shrink-0">Lọc Nhân Vật:</span>
                {ItemManager.getCharacters(stats).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedSkinFilter(c.id)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedSkinFilter === c.id
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.avatarIcon}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Skins Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ItemManager.getSkins(stats, selectedSkinFilter).map((skin) => {
                  const isUnlocked = (stats.unlockedSkins || ['jake_default']).includes(skin.id) || skin.price === 0;
                  const currentSelectedSkinForChar = ItemManager.getSelectedSkinForCharacter(stats, skin.characterId);
                  const isSelected = currentSelectedSkinForChar?.id === skin.id;

                  return (
                    <div
                      key={skin.id}
                      className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md ${
                        isSelected
                          ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                              {skin.avatarIcon}
                            </div>
                            <div>
                              <h3 className="font-black text-white text-sm sm:text-base">{skin.name}</h3>
                              <span className="text-[11px] text-amber-400 font-bold uppercase">{skin.characterId} Skin</span>
                            </div>
                          </div>

                          {isSelected && (
                            <span className="bg-amber-500 text-slate-950 text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                              <Check className="w-3.5 h-3.5" /> ĐANG TRANG BỊ
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 leading-snug mt-1.5">{skin.description}</p>

                        {/* Perk & Accessory Badge */}
                        <div className="mt-2.5 space-y-1.5">
                          <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-medium">Chỉ số đặc quyền:</span>
                            <span className="text-amber-400 font-bold">{skin.perk}</span>
                          </div>

                          {skin.accessoryType && (
                            <div className="bg-purple-950/50 border border-purple-800/50 p-2 rounded-xl flex items-center gap-2 text-xs text-purple-300">
                              <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                              <span><strong>Phụ kiện 3D:</strong> {skin.accessoryType.toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        {isUnlocked ? (
                          <button
                            onClick={() => handleSelectSkin(skin)}
                            disabled={isSelected}
                            className={`w-full py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 shadow-md'
                            }`}
                          >
                            {isSelected ? 'Đã trang bị' : 'Trang Bị Skin'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectSkin(skin)}
                            disabled={stats.coins < skin.price}
                            className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              stats.coins >= skin.price
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-4 h-4 fill-current shrink-0" />
                            <span>MUA SKIN: {skin.price} Xu</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: BOARDS */}
          {activeTab === 'boards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {ItemManager.getBoards(stats).map((board) => {
                const isUnlocked = (stats.unlockedBoards || ['Star Board']).includes(board.id) || board.price === 0;
                const isSelected = stats.selectedBoard === board.id;

                return (
                  <div
                    key={board.id}
                    className={`border rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md ${
                      isSelected
                        ? 'border-blue-400 bg-blue-500/10 shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shrink-0">
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-white text-sm sm:text-base">{board.name}</h3>
                            <span className="text-xs text-blue-400 font-bold">{board.perk}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="bg-blue-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0">
                            <Check className="w-3.5 h-3.5" /> ĐANG DÙNG
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-snug mt-1.5">{board.description}</p>

                      {/* Dynamic Visual Trail Effect Badge */}
                      <div className="mt-2.5 bg-slate-900/80 border border-slate-800 p-2 rounded-xl flex items-center gap-2 text-xs text-orange-300">
                        <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span><strong>Vệt 3D Effect:</strong> {board.effect_logic}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      {isUnlocked ? (
                        <button
                          onClick={() => handleSelectBoard(board)}
                          disabled={isSelected}
                          className={`w-full py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-blue-500 hover:bg-blue-400 text-white font-black active:scale-95 shadow-md'
                          }`}
                        >
                          {isSelected ? 'Đang chọn' : 'Trang Bị Ván'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSelectBoard(board)}
                          disabled={stats.coins < board.price}
                          className={`w-full py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            stats.coins >= board.price
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white shadow-md active:scale-95'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-4 h-4 fill-current shrink-0" />
                          <span>MUA KHÓA: {board.price} Xu</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Bottom Footer Bar with Prominent Close & Play Button */}
        <div className="p-3 sm:p-3.5 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-300 font-bold">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400 shrink-0" />
            <span>Số dư hiện tại: <strong className="text-white font-mono text-sm sm:text-base">{stats.coins.toLocaleString()} Xu</strong></span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 hover:from-amber-300 hover:to-red-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all transform hover:scale-102 active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-amber-300/60"
          >
            <span>ĐÓNG & TIẾP TỤC CHẠY</span>
            <Play className="w-4 h-4 fill-slate-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
