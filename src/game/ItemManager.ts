/**
 * ItemManager - Centralized Inventory & Shop Registry System
 * Manages Character Costumes, Dynamic Hoverboards, Consumables & Upgrades
 */

import { ShopCharacter, ShopBoard, PlayerStats, CharacterSkin } from '../types';

export const CHARACTER_SKINS: CharacterSkin[] = [
  // Jake Skins
  {
    id: 'jake_default',
    characterId: 'Jake Hero',
    name: 'Jake Cổ Điển Red Jacket',
    price: 0,
    unlocked: true,
    color: 'from-red-500 to-amber-500',
    description: 'Áo khoác đỏ truyền thống & nón snapback đen.',
    perk: 'Mặc định',
    avatarIcon: '🧢',
    torsoColorHex: 0xef4444,
    pantsColorHex: 0x1e3a8a,
    hairColorHex: 0xf59e0b,
    hatColorHex: 0x111827,
  },
  {
    id: 'jake_brooklyn',
    characterId: 'Jake Hero',
    name: 'Jake Streetwear Brooklyn',
    price: 150,
    unlocked: false,
    color: 'from-blue-600 to-indigo-800',
    description: 'Áo khoác denim New York, nón snapback cam rực rỡ và balo đường phố.',
    perk: '+5% Tốc độ xuất phát',
    avatarIcon: '👟',
    torsoColorHex: 0x2563eb,
    pantsColorHex: 0x0f172a,
    hairColorHex: 0xf97316,
    hatColorHex: 0xeab308,
    accessoryType: 'backpack',
  },
  {
    id: 'jake_graffiti',
    characterId: 'Jake Hero',
    name: 'Jake Nghệ Sĩ Graffiti NYC',
    price: 300,
    unlocked: false,
    color: 'from-fuchsia-500 to-purple-700',
    description: 'Trang phục sơn phun graffiti rực rỡ New York kèm kính râm neon.',
    perk: '+10% Thời gian Nam châm',
    avatarIcon: '🎨',
    torsoColorHex: 0xd946ef,
    pantsColorHex: 0x3b0764,
    hairColorHex: 0x22c55e,
    hatColorHex: 0xa855f7,
    emissiveHex: 0xd946ef,
    emissiveIntensity: 0.4,
    accessoryType: 'glasses',
  },
  {
    id: 'jake_freight',
    characterId: 'Jake Hero',
    name: 'Jake Freight Yard Operator',
    price: 450,
    unlocked: false,
    color: 'from-amber-400 to-orange-600',
    description: 'Áo phản quang dải công-ten-nơ New York & mũ bảo hộ thép.',
    perk: 'Hào quang bảo hộ bãi công-ten-nơ',
    avatarIcon: '🏗️',
    torsoColorHex: 0xf97316,
    pantsColorHex: 0x1e293b,
    hairColorHex: 0xfac710,
    hatColorHex: 0xf59e0b,
    emissiveHex: 0xfbbf24,
    emissiveIntensity: 0.5,
    accessoryType: 'freight_helmet',
  },

  // Ninja Skins
  {
    id: 'ninja_default',
    characterId: 'Ninja',
    name: 'Ninja Shadow Black',
    price: 0,
    unlocked: true,
    color: 'from-slate-800 to-slate-950',
    description: 'Trang phục ninja bóng tối với khăn quàng đỏ.',
    perk: 'Giảm độ trễ lướt',
    avatarIcon: '🥷',
    torsoColorHex: 0x0f172a,
    pantsColorHex: 0x1e293b,
    hairColorHex: 0xef4444,
    hatColorHex: 0x020617,
    accessoryType: 'scarf',
  },
  {
    id: 'ninja_gold_mask',
    characterId: 'Ninja',
    name: 'Ninja Mặt Nạ Vàng 24K',
    price: 250,
    unlocked: false,
    color: 'from-amber-400 to-yellow-600',
    description: 'Mặt nạ vàng ròng 24K và giáp vai mạ kim sa.',
    perk: '+15% Tiền xu nhặt được',
    avatarIcon: '🎭',
    torsoColorHex: 0xd97706,
    pantsColorHex: 0x78350f,
    hairColorHex: 0xfef08a,
    hatColorHex: 0xf59e0b,
    emissiveHex: 0xfacc15,
    emissiveIntensity: 0.6,
    accessoryType: 'crown',
  },

  // Cyberpunk Skins
  {
    id: 'cyber_default',
    characterId: 'Cyberpunk',
    name: 'Cyber Cyan Energy',
    price: 0,
    unlocked: true,
    color: 'from-cyan-400 to-blue-600',
    description: 'Giáp năng lượng Cyan tương lai.',
    perk: 'Quét laser',
    avatarIcon: '🤖',
    torsoColorHex: 0x0284c7,
    pantsColorHex: 0x475569,
    hairColorHex: 0xf43f5e,
    hatColorHex: 0x06b6d4,
    emissiveHex: 0x06b6d4,
    emissiveIntensity: 0.5,
    accessoryType: 'glasses',
  },
  {
    id: 'cyber_gold',
    characterId: 'Cyberpunk',
    name: 'Cyber Armor Vàng Kim Sa',
    price: 350,
    unlocked: false,
    color: 'from-amber-300 to-orange-500',
    description: 'Bộ giáp Cyber phát sáng ánh kim rực rỡ.',
    perk: '+20% Thời gian Ván trượt',
    avatarIcon: '⚡',
    torsoColorHex: 0xf59e0b,
    pantsColorHex: 0xb45309,
    hairColorHex: 0xfef08a,
    hatColorHex: 0xfacc15,
    emissiveHex: 0xfacc15,
    emissiveIntensity: 0.8,
    accessoryType: 'headphones',
  },

  // Neon Runner Skins
  {
    id: 'neon_default',
    characterId: 'Neon Runner',
    name: 'Neon Lime Glow',
    price: 0,
    unlocked: true,
    color: 'from-lime-400 to-emerald-600',
    description: 'Trang phục phát quang xanh lá chói lọi.',
    perk: 'Hút vàng rộng',
    avatarIcon: '⚡',
    torsoColorHex: 0x10b981,
    pantsColorHex: 0x064e3b,
    hairColorHex: 0xa3e635,
    hatColorHex: 0x10b981,
    emissiveHex: 0xa3e635,
    emissiveIntensity: 0.8,
  },
  {
    id: 'neon_synth',
    characterId: 'Neon Runner',
    name: 'Neon Retro Synthwave',
    price: 300,
    unlocked: false,
    color: 'from-fuchsia-500 to-pink-600',
    description: 'Ánh sáng Synthwave tím hồng neon lộng lẫy.',
    perk: '+10% Điểm số',
    avatarIcon: '🌆',
    torsoColorHex: 0xd946ef,
    pantsColorHex: 0x701a75,
    hairColorHex: 0x38bdf8,
    hatColorHex: 0xec4899,
    emissiveHex: 0xf43f5e,
    emissiveIntensity: 0.9,
    accessoryType: 'headphones',
  },

  // Gold Runner Skins
  {
    id: 'gold_default',
    characterId: 'Gold Runner',
    name: 'Hoàng Tử Vàng 24K',
    price: 0,
    unlocked: true,
    color: 'from-amber-300 via-yellow-400 to-amber-600',
    description: 'Giáp vàng 24K quý phái.',
    perk: 'x2 Xu vàng',
    avatarIcon: '👑',
    torsoColorHex: 0xf59e0b,
    pantsColorHex: 0xd97706,
    hairColorHex: 0xfef08a,
    hatColorHex: 0xb45309,
    emissiveHex: 0xfacc15,
    emissiveIntensity: 0.6,
    accessoryType: 'crown',
  },

  // Tricky Skater Skins
  {
    id: 'tricky_default',
    characterId: 'Tricky Skater',
    name: 'Tricky Pink Ribbons',
    price: 0,
    unlocked: true,
    color: 'from-pink-500 to-purple-600',
    description: 'Nón len hồng nhún nhảy.',
    perk: 'Lướt ván siêu đẳng',
    avatarIcon: '🎀',
    torsoColorHex: 0xec4899,
    pantsColorHex: 0x475569,
    hairColorHex: 0x8b5cf6,
    hatColorHex: 0xec4899,
  },
  {
    id: 'tricky_street',
    characterId: 'Tricky Skater',
    name: 'Tricky NYC Denim Style',
    price: 200,
    unlocked: false,
    color: 'from-cyan-500 to-indigo-600',
    description: 'Nón lưỡi trai xanh denim New York và áo hoodie thể thao.',
    perk: '+15% Thời gian nhún nhảy',
    avatarIcon: '🧢',
    torsoColorHex: 0x0284c7,
    pantsColorHex: 0x1e1b4b,
    hairColorHex: 0xf43f5e,
    hatColorHex: 0x06b6d4,
    accessoryType: 'headphones',
  },

  // Yutani Tech Skins
  {
    id: 'yutani_default',
    characterId: 'Yutani Tech',
    name: 'Yutani Alien Green',
    price: 0,
    unlocked: true,
    color: 'from-emerald-400 to-teal-600',
    description: 'Giáp bảo hộ xanh ngọc ngoài hành tinh.',
    perk: 'Hút vàng',
    avatarIcon: '👽',
    torsoColorHex: 0x10b981,
    pantsColorHex: 0x065f46,
    hairColorHex: 0x06b6d4,
    hatColorHex: 0x0f766e,
  },
  {
    id: 'yutani_cosmic',
    characterId: 'Yutani Tech',
    name: 'Yutani Cosmic Deep Space',
    price: 250,
    unlocked: false,
    color: 'from-blue-600 to-purple-800',
    description: 'Giáp vũ trụ xanh thẫm dạ quang lấp lánh.',
    perk: '+20% Bán kính Nam châm',
    avatarIcon: '🌌',
    torsoColorHex: 0x2563eb,
    pantsColorHex: 0x1e1b4b,
    hairColorHex: 0xa855f7,
    hatColorHex: 0x4338ca,
    emissiveHex: 0x60a5fa,
    emissiveIntensity: 0.7,
    accessoryType: 'glasses',
  },
];

export const CHARACTER_ITEMS: ShopCharacter[] = [
  {
    id: 'Jake Hero',
    name: 'Jake Cổ Điển',
    price: 0,
    unlocked: true,
    color: 'from-red-500 to-amber-500',
    description: 'Chàng trai đường phố huyền thoại của Subway Surfers.',
    perk: 'Tốc độ phản xạ tiêu chuẩn',
    avatarIcon: '🧢',
    effect_logic: 'Di chuyển cơ bản, áo khoác đỏ truyền thống',
  },
  {
    id: 'Ninja',
    name: 'Ninja Bóng Đêm',
    price: 180,
    unlocked: false,
    color: 'from-indigo-600 to-slate-900',
    description: 'Sát thủ đường ngầm ẩn mình trong màn đêm với khả năng lướt bóng ma.',
    perk: 'Hào quang bóng tối & giảm 10% độ trễ điều khiển',
    avatarIcon: '🥷',
    effect_logic: 'Vệt khói đen tím bí ẩn tỏa ra quanh thân thể khi chạy',
  },
  {
    id: 'Cyberpunk',
    name: 'Cyberpunk 2077',
    price: 280,
    unlocked: false,
    color: 'from-cyan-400 to-fuchsia-600',
    description: 'Chiến binh tương lai trang bị giáp năng lượng neon quét chướng ngại vật.',
    perk: 'Quét laser neon & +15% thời gian Ván trượt',
    avatarIcon: '🤖',
    effect_logic: 'Tia laser quét sáng rực dọc cơ thể và kính bảo hộ neon',
  },
  {
    id: 'Neon Runner',
    name: 'Vận Động Viên Neon',
    price: 350,
    unlocked: false,
    color: 'from-lime-400 to-emerald-600',
    description: 'Vận động viên phát quang neon xanh lá rực rỡ trong đêm tối.',
    perk: 'Phát quang chói lọi & +15% bán kính Nam châm',
    avatarIcon: '⚡',
    effect_logic: 'Xung ánh sáng neon xanh lá chói lọi nhấp nháy liên tục',
  },
  {
    id: 'Gold Runner',
    name: 'Hoàng Tử Vàng 24K',
    price: 600,
    unlocked: false,
    color: 'from-amber-300 via-yellow-400 to-amber-600',
    description: 'Bộ giáp vàng 24K kiêu hãnh dành cho bậc thầy Subway Runner đỉnh cao.',
    perk: 'Nhân đôi (+100%) toàn bộ xu vàng nhặt được',
    avatarIcon: '👑',
    effect_logic: 'Hào quang hạt kim sa vàng lấp lánh tỏa sáng hoàng gia',
  },
  {
    id: 'Tricky Skater',
    name: 'Tricky Skater',
    price: 50,
    unlocked: false,
    color: 'from-pink-500 to-purple-600',
    description: 'Nữ vận động viên trượt ván kỹ thuật siêu đẳng.',
    perk: '+10% Thời gian Ván Trượt',
    avatarIcon: '🎀',
    effect_logic: 'Mũ hồng nhún nhảy theo nhịp điệu',
  },
  {
    id: 'Yutani Tech',
    name: 'Yutani Tech',
    price: 120,
    unlocked: false,
    color: 'from-emerald-400 to-teal-600',
    description: 'Thiên tài công nghệ trang bị đồ bảo hộ ngoài hành tinh.',
    perk: '+20% Bán kính Nam châm',
    avatarIcon: '👽',
    effect_logic: 'Bộ trang phục bảo hộ xanh ngọc alien',
  },
];

export const BOARD_ITEMS: ShopBoard[] = [
  {
    id: 'Star Board',
    name: 'Ván Sao Xanh',
    price: 0,
    unlocked: true,
    color: 'from-blue-500 to-cyan-500',
    description: 'Ván trượt cơ bản tốc độ lướt ổn định.',
    perk: 'Bảo vệ khỏi 1 va chạm',
    effect_logic: 'Hiệu ứng vệt sáng sao xanh cơ bản',
    trailType: 'standard',
  },
  {
    id: 'Flame Board',
    name: 'Ván Lửa Bão Tố',
    price: 150,
    unlocked: false,
    color: 'from-red-500 via-orange-500 to-yellow-500',
    description: 'Động cơ phản lực phun lửa bùng cháy bùng nổ đường đua.',
    perk: 'Phun vệt lửa cuồn cuộn & +10% Tốc độ chạy',
    effect_logic: 'Tạo vệt lửa (fire trail) & khói cuồn cuộn phía sau khi lướt',
    trailType: 'flame',
  },
  {
    id: 'Plasma Jet',
    name: 'Ván Sét Plasma',
    price: 260,
    unlocked: false,
    color: 'from-cyan-400 via-blue-500 to-purple-600',
    description: 'Phát các luồng tia điện plasma cao thế bao quanh ván trượt.',
    perk: 'Hiệu ứng plasma sét & Phá hủy chướng ngại nhẹ',
    effect_logic: 'Tia điện plasma cực mạnh phóng liên tục xung quanh ván',
    trailType: 'plasma',
  },
  {
    id: 'Hover Neon',
    name: 'Ván Glow Neon',
    price: 320,
    unlocked: false,
    color: 'from-purple-500 via-fuchsia-500 to-pink-500',
    description: 'Sóng xung kích Neon tím chói lọi phát sáng rực rỡ dưới chân.',
    perk: 'Vòng sáng Neon dưới chân & Hút xu xung quanh ván',
    effect_logic: 'Phát ánh sáng neon nhấp nháy sinh động dưới chân ván',
    trailType: 'neon',
  },
  {
    id: 'Rainbow Wave',
    name: 'Ván Cầu Vồng 7 Màu',
    price: 450,
    unlocked: false,
    color: 'from-red-500 via-green-500 to-purple-500',
    description: 'Để lại vệt lụa cầu vồng 7 màu rực rỡ lộng lẫy trên đường ray.',
    perk: 'Dải cầu vồng thần tiên & +5 giây thời gian ván',
    effect_logic: 'Để lại dải cầu vồng 7 màu trải dài trên mặt đường ray',
    trailType: 'rainbow',
  },
  {
    id: 'Flame Thruster',
    name: 'Ván Lửa Đỏ (Cổ điển)',
    price: 60,
    unlocked: false,
    color: 'from-red-500 to-orange-500',
    description: 'Ván trượt lửa cổ điển.',
    perk: 'Tăng 10% Tốc độ đường chạy',
    effect_logic: 'Tạo vệt lửa phía sau khi di chuyển',
    trailType: 'flame',
  },
  {
    id: 'Cyber Hover',
    name: 'Ván Mạng Cyber',
    price: 150,
    unlocked: false,
    color: 'from-emerald-500 to-teal-500',
    description: 'Ván trượt đệm từ trường chống va quệt.',
    perk: '+5 giây Thời gian bảo vệ',
    effect_logic: 'Tia điện plasma xung quanh ván',
    trailType: 'plasma',
  },
  {
    id: 'Neon Pulse',
    name: 'Ván Neon Tím',
    price: 300,
    unlocked: false,
    color: 'from-purple-600 to-fuchsia-600',
    description: 'Sóng xung kích Neon loại bỏ chướng ngại vật.',
    perk: 'Hút vàng xung quanh ván',
    effect_logic: 'Phát ánh sáng neon rực rỡ dưới chân ván',
    trailType: 'neon',
  },
];

export class ItemManager {
  /**
   * Get all registered skins for a given character or all skins
   */
  public static getSkins(stats: PlayerStats, characterId?: string): CharacterSkin[] {
    const unlockedSkinSet = new Set(stats.unlockedSkins || [
      'jake_default',
      'ninja_default',
      'cyber_default',
      'neon_default',
      'gold_default',
      'tricky_default',
      'yutani_default',
    ]);

    const targetChar = characterId || stats.selectedCharacter;
    return CHARACTER_SKINS.filter((skin) => skin.characterId === targetChar).map((skin) => ({
      ...skin,
      unlocked: unlockedSkinSet.has(skin.id) || skin.price === 0,
    }));
  }

  /**
   * Get active selected skin object for a character
   */
  public static getSelectedSkinForCharacter(stats: PlayerStats, characterId: string): CharacterSkin {
    const selectedSkinId = stats.selectedSkins?.[characterId];
    const availableSkins = CHARACTER_SKINS.filter((s) => s.characterId === characterId);

    if (selectedSkinId) {
      const match = availableSkins.find((s) => s.id === selectedSkinId);
      if (match) return match;
    }
    return availableSkins[0] || CHARACTER_SKINS[0];
  }

  /**
   * Purchase a Character Skin with Coins
   */
  public static purchaseSkin(
    stats: PlayerStats,
    skinId: string
  ): { success: boolean; message: string; updatedStats?: PlayerStats } {
    const skin = CHARACTER_SKINS.find((s) => s.id === skinId);
    if (!skin) return { success: false, message: 'Skin trang phục không tồn tại!' };

    const unlockedSet = new Set(stats.unlockedSkins || [
      'jake_default',
      'ninja_default',
      'cyber_default',
      'neon_default',
      'gold_default',
      'tricky_default',
      'yutani_default',
    ]);

    if (unlockedSet.has(skinId) || skin.price === 0) {
      return { success: false, message: 'Bạn đã sở hữu skin trang phục này!' };
    }

    if (stats.coins < skin.price) {
      return { success: false, message: `Bạn cần thêm ${(skin.price - stats.coins).toLocaleString()} Xu để mua skin này!` };
    }

    const newUnlockedSkins = [...Array.from(unlockedSet), skinId];
    const newSelectedSkins = {
      ...(stats.selectedSkins || {}),
      [skin.characterId]: skinId,
    };

    const newStats: PlayerStats = {
      ...stats,
      coins: stats.coins - skin.price,
      unlockedSkins: newUnlockedSkins,
      selectedSkins: newSelectedSkins,
    };

    return {
      success: true,
      message: `Đã mua & trang bị thành công [${skin.name}]!`,
      updatedStats: newStats,
    };
  }

  /**
   * Select/Equip an unlocked Character Skin
   */
  public static selectSkin(
    stats: PlayerStats,
    skinId: string
  ): { success: boolean; message: string; updatedStats?: PlayerStats } {
    const skin = CHARACTER_SKINS.find((s) => s.id === skinId);
    if (!skin) return { success: false, message: 'Skin trang phục không tồn tại!' };

    const unlockedSet = new Set(stats.unlockedSkins || [
      'jake_default',
      'ninja_default',
      'cyber_default',
      'neon_default',
      'gold_default',
      'tricky_default',
      'yutani_default',
    ]);

    if (!unlockedSet.has(skinId) && skin.price > 0) {
      return { success: false, message: 'Bạn chưa mở khóa trang phục skin này!' };
    }

    const newSelectedSkins = {
      ...(stats.selectedSkins || {}),
      [skin.characterId]: skinId,
    };

    return {
      success: true,
      message: `Đã trang bị skin [${skin.name}]!`,
      updatedStats: {
        ...stats,
        selectedSkins: newSelectedSkins,
      },
    };
  }
  /**
   * Get all registered Character Costumes with updated unlock state
   */
  public static getCharacters(stats: PlayerStats): ShopCharacter[] {
    const unlockedSet = new Set(stats.unlockedCharacters || ['Jake Hero']);
    return CHARACTER_ITEMS.map((char) => ({
      ...char,
      unlocked: unlockedSet.has(char.id),
    }));
  }

  /**
   * Get all registered Hoverboards with updated unlock state
   */
  public static getBoards(stats: PlayerStats): ShopBoard[] {
    const unlockedSet = new Set(stats.unlockedBoards || ['Star Board']);
    return BOARD_ITEMS.map((board) => ({
      ...board,
      unlocked: unlockedSet.has(board.id),
    }));
  }

  /**
   * Find specific Character by ID
   */
  public static getCharacterById(id: string): ShopCharacter | undefined {
    return CHARACTER_ITEMS.find((c) => c.id === id);
  }

  /**
   * Find specific Board by ID
   */
  public static getBoardById(id: string): ShopBoard | undefined {
    return BOARD_ITEMS.find((b) => b.id === id);
  }

  /**
   * Execute Purchase Transaction
   */
  public static purchaseItem(
    stats: PlayerStats,
    type: 'character' | 'board',
    itemId: string
  ): { success: boolean; message: string; updatedStats?: PlayerStats } {
    if (type === 'character') {
      const char = this.getCharacterById(itemId);
      if (!char) return { success: false, message: 'Nhân vật không tồn tại!' };
      const unlocked = (stats.unlockedCharacters || ['Jake Hero']).includes(itemId);
      if (unlocked) return { success: false, message: 'Bạn đã sở hữu nhân vật này!' };
      if (stats.coins < char.price) {
        return { success: false, message: `Bạn cần thêm ${(char.price - stats.coins).toLocaleString()} Xu để mua!` };
      }

      const newStats: PlayerStats = {
        ...stats,
        coins: stats.coins - char.price,
        selectedCharacter: itemId,
        unlockedCharacters: [...(stats.unlockedCharacters || ['Jake Hero']), itemId],
      };
      return { success: true, message: `Đã mở khóa thành công ${char.name}!`, updatedStats: newStats };
    } else {
      const board = this.getBoardById(itemId);
      if (!board) return { success: false, message: 'Ván trượt không tồn tại!' };
      const unlocked = (stats.unlockedBoards || ['Star Board']).includes(itemId);
      if (unlocked) return { success: false, message: 'Bạn đã sở hữu ván trượt này!' };
      if (stats.coins < board.price) {
        return { success: false, message: `Bạn cần thêm ${(board.price - stats.coins).toLocaleString()} Xu để mua!` };
      }

      const newStats: PlayerStats = {
        ...stats,
        coins: stats.coins - board.price,
        selectedBoard: itemId,
        unlockedBoards: [...(stats.unlockedBoards || ['Star Board']), itemId],
      };
      return { success: true, message: `Đã mở khóa thành công ${board.name}!`, updatedStats: newStats };
    }
  }

  /**
   * Equip/Select an unlocked item
   */
  public static selectItem(
    stats: PlayerStats,
    type: 'character' | 'board',
    itemId: string
  ): { success: boolean; message: string; updatedStats?: PlayerStats } {
    if (type === 'character') {
      const unlocked = (stats.unlockedCharacters || ['Jake Hero']).includes(itemId);
      if (!unlocked) return { success: false, message: 'Bạn chưa mở khóa trang phục này!' };

      const char = this.getCharacterById(itemId);
      return {
        success: true,
        message: `Đã chọn trang phục ${char?.name || itemId}!`,
        updatedStats: { ...stats, selectedCharacter: itemId },
      };
    } else {
      const unlocked = (stats.unlockedBoards || ['Star Board']).includes(itemId);
      if (!unlocked) return { success: false, message: 'Bạn chưa mở khóa ván trượt này!' };

      const board = this.getBoardById(itemId);
      return {
        success: true,
        message: `Đã trang bị ${board?.name || itemId}!`,
        updatedStats: { ...stats, selectedBoard: itemId },
      };
    }
  }
}
