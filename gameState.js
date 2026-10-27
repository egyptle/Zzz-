/**
 * Gods of Egypt MMORPG - Unified Shared Game State Engine
 * Canlı Sosyal Ekonomi, Tanrıya Yükseliş, Altın Kan, Tuzaklar ve Ahiret Sistemi
 */

(function(window) {
    'use strict';

    const STORAGE_KEY = 'gods_of_egypt_mmo_save_v1';

    const DEFAULT_DATA = {
        player: {
            name: 'Bek',
            role: 'mortal', // 'mortal', 'thief', 'god_horus', 'god_set'
            level: 1,
            exp: 0,
            maxExp: 100,
            hp: 100,
            maxHp: 100,
            energy: 100,
            maxEnergy: 100,
            divineFavor: 15,
            scaleMultiplier: 1.0,
            hasEyeOfHorus: false,
            hasSunCrystal: false
        },
        inventory: {
            gold: 120,
            golden_blood: 2,
            wheat: 15,
            papyrus: 10,
            copper: 8,
            stone: 25,
            wood: 20,
            croc_hide: 3,
            weapons: ['Bronz Hançer'],
            activeWeapon: 'Bronz Hançer'
        },
        obelisk: {
            progress: 38, // 0 - 100 %
            playerContributed: 30
        },
        worldEvent: {
            isNight: false,
            apophisHp: 8500,
            apophisMaxHp: 10000,
            raHp: 7200,
            raMaxHp: 8000,
            nextNightCountdown: 180, // saniye
            darkAgeActive: false
        },
        ahiretDebt: 0, // Ahiret madeninde kırılacak taş sayısı
        quests: [
            { id: 'harvest_crops', title: 'Nil Bereketi', desc: 'Nil kıyısından 10 Buğday ve 5 Papirüs topla.', done: false, progress: 5, target: 15, reward: '40 Altın, 20 XP' },
            { id: 'obelisk_build', title: 'Tanrıların Dikilitaşı', desc: 'Devasa obelisk inşasına taş ve odun bağışla.', done: false, progress: 1, target: 3, reward: '60 Altın, 35 XP, 10 İlahi Lütuf' },
            { id: 'steal_eye', title: 'Horus\'un Gözü Soygunu', desc: 'Tuzaklı tapınağa sızıp Set\'in sakladığı gözü çal!', done: false, progress: 0, target: 1, reward: 'Horus\'un Gözü, Tanrıya Yükseliş Gücü' },
            { id: 'collect_blood', title: 'Altın Kan Avı', desc: 'Savaş alanına düşen 3 damla Altın Kan topla.', done: false, progress: 1, target: 3, reward: 'Efsanevi Silah Üretim İzni' },
            { id: 'aid_ra', title: 'Kaos Yılanı Apophis', desc: 'Ra\'nın gemisinde güneş duası bağışla.', done: false, progress: 0, target: 1, reward: 'Ra\'nın Güneş Kristali, 100 Altın' }
        ],
        chatLog: [
            { sender: 'SİSTEM', text: 'Mısır Tanrıları Canlı Sosyal MMORPG dünyasına hoş geldin!', type: 'system', time: '10:00' },
            { sender: 'Set (Zalim Kral)', text: 'Bu toprakların tek efendisi benim! Vergilerini ödemeyenler Duat\'a sürgün edilecek!', type: 'god', time: '10:01' },
            { sender: 'Horus', text: 'Gözlerim olmadan zayıfım... Ölümlü Bek, tapınağımdaki tuzakları aşıp gözümü kurtar!', type: 'quest', time: '10:02' },
            { sender: 'Ölümlü_Thutmose', text: 'Nil kıyısında buğday hasadı yapıyorum, obelisk için taş taşıyan var mı?', type: 'player', time: '10:03' }
        ],
        activeRealm: 'misir'
    };

    class GameStateEngine {
        constructor() {
            this.state = this.loadState();
            this.listeners = [];
            this.startEventLoop();
        }

        loadState() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Merge with defaults in case new fields were added
                    return Object.assign({}, DEFAULT_DATA, parsed, {
                        player: Object.assign({}, DEFAULT_DATA.player, parsed.player || {}),
                        inventory: Object.assign({}, DEFAULT_DATA.inventory, parsed.inventory || {}),
                        obelisk: Object.assign({}, DEFAULT_DATA.obelisk, parsed.obelisk || {}),
                        worldEvent: Object.assign({}, DEFAULT_DATA.worldEvent, parsed.worldEvent || {})
                    });
                }
            } catch (e) {
                console.warn('Game state could not be loaded from localStorage, using default:', e);
            }
            return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }

        saveState() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
                this.notify();
            } catch (e) {
                console.error('Failed to save state to localStorage:', e);
            }
        }

        subscribe(callback) {
            this.listeners.push(callback);
            callback(this.state);
            return () => {
                this.listeners = this.listeners.filter(l => l !== callback);
            };
        }

        notify() {
            for (let i = 0; i < this.listeners.length; i++) {
                try {
                    this.listeners[i](this.state);
                } catch (e) {
                    console.error('State listener error:', e);
                }
            }
        }

        // ==========================================
        // OYUNCU VE KAYNAK MEKANİKLERİ
        // ==========================================
        addResource(item, amount) {
            if (this.state.inventory[item] !== undefined) {
                this.state.inventory[item] = Math.max(0, this.state.inventory[item] + amount);
            } else {
                this.state.inventory[item] = Math.max(0, amount);
            }
            this.saveState();
            if (window.GameAudio) {
                try {
                    window.GameAudio.playSfx(item === 'golden_blood' ? 'golden_blood' : 'harvest');
                } catch (e) {
                    console.warn('Audio play failed:', e);
                }
            }
            return this.state.inventory[item];
        }

        removeResource(item, amount) {
            if (this.state.inventory[item] !== undefined && this.state.inventory[item] >= amount) {
                this.state.inventory[item] -= amount;
                this.saveState();
                return true;
            }
            return false;
        }

        takeDamage(amount) {
            const p = this.state.player;
            p.hp = Math.max(0, p.hp - amount);
            
            // Eğer Tanrı formundaysa savaşta ALTIN KAN DÖKÜLÜR!
            if (p.role === 'god_horus' || p.role === 'god_set') {
                this.addChatMessage('SAVAŞ', `${p.name} hasar aldı! Yere parıldayan ALTIN KAN döküldü!`, 'blood');
                if (window.spawnGoldenBloodInScene) {
                    window.spawnGoldenBloodInScene();
                }
            }

            if (p.hp <= 0) {
                this.handleDeath();
            } else {
                if (window.GameAudio) window.GameAudio.playSfx('trap_damage');
            }
            this.saveState();
            return p.hp;
        }

        heal(amount) {
            const p = this.state.player;
            p.hp = Math.min(p.maxHp, p.hp + amount);
            this.saveState();
            return p.hp;
        }

        gainExp(amount) {
            const p = this.state.player;
            p.exp += amount;
            if (p.exp >= p.maxExp) {
                p.level += 1;
                p.exp -= p.maxExp;
                p.maxExp = Math.floor(p.maxExp * 1.5);
                p.maxHp += 20;
                p.hp = p.maxHp;
                if (window.GameAudio) window.GameAudio.playSfx('level_up');
                this.addChatMessage('SEVİYE', `Tebrikler! Seviye ${p.level} oldun! Maksimum canın arttı.`, 'system');
            }
            this.saveState();
        }

        // ==========================================
        // TANRIYA YÜKSELİŞ & ŞEKİL DEĞİŞTİRME (2.5x BOYUT)
        // karaktertanrilar.html'deki 5 Sınıfı Destekler
        // ==========================================
        canAscend() {
            const p = this.state.player;
            return p.hasEyeOfHorus || p.divineFavor >= 50 || p.role === 'god_horus' || p.role === 'god_set' || p.role === 'horus_god' || p.role === 'set_god';
        }

        setCharacterRole(role) {
            const p = this.state.player;
            if (role === 'horus_god' || role === 'god_horus' || role === 'horus') {
                p.role = 'god_horus';
                p.scaleMultiplier = 2.5;
                p.maxHp = 500;
                p.hp = 500;
                p.maxEnergy = 300;
                p.energy = 300;
                this.addChatMessage('İLÂHİ YÜKSELİŞ', `${p.name} 3.5m Altın Şahin Zırhında Tanrı HORUS formuna büründü! (Boyut 2.5x)`, 'god');
            } else if (role === 'set_god' || role === 'god_set' || role === 'set') {
                p.role = 'god_set';
                p.scaleMultiplier = 2.5;
                p.maxHp = 550;
                p.hp = 550;
                p.maxEnergy = 300;
                p.energy = 300;
                this.addChatMessage('İLÂHİ YÜKSELİŞ', `${p.name} 3.6m Çakal Zırhında Çöl Tanrısı SET formuna büründü! (Boyut 2.5x)`, 'god');
            } else if (role === 'horus_human') {
                p.role = 'horus_human';
                p.scaleMultiplier = 1.6;
                p.maxHp = 250;
                p.hp = Math.min(250, Math.max(p.hp, 200));
                p.maxEnergy = 150;
                this.addChatMessage('DÖNÜŞÜM', `${p.name} 2.8m İnsan Horus (Prens) formuna geçti.`, 'system');
            } else if (role === 'villager') {
                p.role = 'villager';
                p.scaleMultiplier = 0.98;
                p.maxHp = 80;
                p.hp = Math.min(80, p.hp);
                p.maxEnergy = 80;
                this.addChatMessage('DÖNÜŞÜM', `${p.name} sade Mısırlı Köylü kılığına büründü.`, 'system');
            } else {
                p.role = 'bek';
                p.scaleMultiplier = 1.05;
                p.maxHp = 100;
                p.hp = Math.min(100, p.hp);
                p.maxEnergy = 100;
                this.addChatMessage('DÖNÜŞÜM', `${p.name} Ölümlü Usta Hırsız Bek formuna geçti.`, 'system');
            }
            if (window.GameAudio) window.GameAudio.playSfx('god_ascend');
            this.saveState();
            if (window.updatePlayerModelScale) {
                window.updatePlayerModelScale();
            }
        }

        ascendToGod(godType) {
            this.setCharacterRole(godType);
        }

        dethroneGod() {
            const p = this.state.player;
            p.role = 'mortal';
            p.scaleMultiplier = 1.0;
            p.maxHp = 100;
            p.hp = 100;
            p.hasEyeOfHorus = false;
            this.addChatMessage('TAHTTAN İNDİRME', 'Horus\'un Gözü çalındı! Tanrının gücü elinden alındı ve ölümlü seviyesine düştü!', 'blood');
            this.saveState();
        }

        // ==========================================
        // OBELİSK (DEV DİKİLİTAŞ) İNŞAAT SİSTEMİ
        // ==========================================
        contributeToObelisk(stoneAmount = 5, woodAmount = 5) {
            const inv = this.state.inventory;
            if (inv.stone < stoneAmount || inv.wood < woodAmount) {
                return { success: false, msg: 'Yeterli taş veya odun yok! Nil kıyısından toplayın.' };
            }
            inv.stone -= stoneAmount;
            inv.wood -= woodAmount;
            
            this.state.obelisk.progress = Math.min(100, this.state.obelisk.progress + 2);
            this.state.obelisk.playerContributed += 1;
            this.state.player.divineFavor += 8;
            inv.gold += 35;
            this.gainExp(25);

            this.updateQuestProgress('obelisk_build', 1);
            this.addChatMessage('OBELİSK İNŞAATI', `Tanrıların dikilitaşına malzeme taşıdın! (%${this.state.obelisk.progress} tamamlandı). +35 Altın, +8 İlahi Lütuf kazandın!`, 'system');
            if (window.GameAudio) window.GameAudio.playSfx('mine');
            this.saveState();
            return { success: true, progress: this.state.obelisk.progress };
        }

        // ==========================================
        // ALTIN KAN EFSANEVİ CRAFTİNG SİSTEMİ
        // ==========================================
        craftLegendaryWeapon(recipeId) {
            const inv = this.state.inventory;
            const recipes = {
                'horus_spear': {
                    name: 'Horus\'un Altın Mızrağı',
                    cost: { golden_blood: 3, copper: 6, gold: 40 },
                    desc: 'İlahi ışık saçan efsanevi şahin mızrağı. +45 Saldırı Gücü.'
                },
                'set_khopesh': {
                    name: 'Set\'in Çöl Khopesh\'i',
                    cost: { golden_blood: 5, copper: 10, gold: 60 },
                    desc: 'Karanlık kum fırtınası biçen çakal kılıcı. +60 Saldırı Gücü.'
                },
                'ra_staff': {
                    name: 'Ra\'nın Güneş Asası',
                    cost: { golden_blood: 8, gold: 100 },
                    reqItem: 'hasSunCrystal',
                    desc: 'Kozmik güneş ışını fırlatan en güçlü asa. +120 Saldırı Gücü.'
                },
                'god_cuirass': {
                    name: 'Altın Tanrı Zırhı',
                    cost: { golden_blood: 6, copper: 12, gold: 80 },
                    desc: 'Tanrıların dövülmüş altın zırhı. +150 Maksimum Can.'
                },
                'nile_elixir': {
                    name: 'Nil Yaşam İksiri',
                    cost: { wheat: 6, papyrus: 4, gold: 10 },
                    desc: 'Canı anında 60 yenileyen kutsal iksir.'
                }
            };

            const rec = recipes[recipeId];
            if (!rec) return { success: false, msg: 'Bilinmeyen tarif!' };

            if (rec.reqItem && !this.state.player[rec.reqItem]) {
                return { success: false, msg: 'Bu tarif için özel kalıntı gerekli (Güneş Kristali)!' };
            }

            for (const mat in rec.cost) {
                if ((inv[mat] || 0) < rec.cost[mat]) {
                    return { success: false, msg: `Yetersiz malzeme: ${mat.replace('_', ' ')} (${inv[mat] || 0}/${rec.cost[mat]})` };
                }
            }

            // Harca
            for (const mat in rec.cost) {
                inv[mat] -= rec.cost[mat];
            }

            if (recipeId === 'nile_elixir') {
                this.heal(60);
            } else {
                if (!inv.weapons.includes(rec.name)) {
                    inv.weapons.push(rec.name);
                }
                inv.activeWeapon = rec.name;
                if (recipeId === 'god_cuirass') {
                    this.state.player.maxHp += 150;
                    this.state.player.hp = this.state.player.maxHp;
                }
            }

            this.gainExp(50);
            if (window.GameAudio) window.GameAudio.playSfx('golden_blood');
            this.addChatMessage('DEMİRHANE', `${rec.name} başarıyla üretildi ve kuşandı!`, 'system');
            this.saveState();
            return { success: true, item: rec.name };
        }

        // ==========================================
        // RA VS APOPHIS GÜNEŞ SAVAŞI MEKANİĞİ
        // ==========================================
        donatePrayerToRa(prayerAmount = 25) {
            const p = this.state.player;
            if (p.energy < prayerAmount) {
                return { success: false, msg: 'Yeterli ilahi enerjin kalmadı!' };
            }
            p.energy -= prayerAmount;

            const ev = this.state.worldEvent;
            const damage = 250 + (p.role.startsWith('god') ? 400 : 100);
            ev.apophisHp = Math.max(0, ev.apophisHp - damage);
            ev.raHp = Math.min(ev.raMaxHp, ev.raHp + 80);
            p.divineFavor += 12;
            this.state.inventory.gold += 20;

            this.updateQuestProgress('aid_ra', 1);

            if (window.GameAudio) window.GameAudio.playSfx('solar_beam');
            this.addChatMessage('GÜNEŞ DUASI', `${p.name} Ra\'nın Güneş Gemisine dua bağışladı! Apophis ${damage} ilahi hasar aldı!`, 'system');

            if (ev.apophisHp <= 0) {
                this.defeatApophis();
            }

            this.saveState();
            return { success: true, apophisHp: ev.apophisHp, raHp: ev.raHp };
        }

        defeatApophis() {
            const ev = this.state.worldEvent;
            ev.apophisHp = ev.apophisMaxHp;
            ev.darkAgeActive = false;
            ev.nextNightCountdown = 300;
            this.state.inventory.golden_blood += 3;
            this.state.inventory.gold += 150;
            this.state.player.hasSunCrystal = true;
            this.gainExp(120);

            if (window.GameAudio) window.GameAudio.playSfx('god_ascend');
            this.addChatMessage('ZAFER', 'APOPHIS YENİLDİ! Ra güneşi karanlıktan kurtardı! Tüm Mısır aydınlandı! +3 Altın Kan, +150 Altın ve Güneş Kristali kazandın!', 'god');
            this.saveState();
        }

        // ==========================================
        // ANUBIS VE AHİRET VERGİSİ (ÖLÜM SİSTEMİ)
        // ==========================================
        handleDeath() {
            const p = this.state.player;
            p.hp = 0;
            this.addChatMessage('ÖLÜM', `${p.name} hayatını kaybetti ve Duat\'a (Ahiret / Yeraltı Dünyası) gönderildi!`, 'system');
            
            // Ahiret sayfasına yönlendir veya Ahiret durumunu aç
            if (window.GameAudio) window.GameAudio.playSfx('anubis');
            
            // Eğer doğrudan ahiret.html'de değilsek, 1.2 saniye sonra ahiret.html'ye yönlendir
            const curPath = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
            if (!curPath.includes('ahiret')) {
                setTimeout(() => {
                    this.teleportTo('ahiret.html');
                }, 1200);
            }
        }

        payAhiretTax() {
            const inv = this.state.inventory;
            const tax = 50;
            if (inv.gold >= tax) {
                inv.gold -= tax;
                this.resurrectPlayer('Anubis Ahiret Vergini kabul etti. Eşyalarınla birlikte dirildin!');
                return { success: true };
            } else {
                this.state.ahiretDebt = 5; // 5 adet yeraltı taşı kırması gerek
                this.saveState();
                return { success: false, msg: 'Yeterli altının yok! Anubis borcun için yeraltı ocağında 5 taş kırmanı emretti!' };
            }
        }

        mineUnderworldRock() {
            if (this.state.ahiretDebt > 0) {
                this.state.ahiretDebt -= 1;
                if (window.GameAudio) window.GameAudio.playSfx('mine');
                if (this.state.ahiretDebt === 0) {
                    this.resurrectPlayer('Yeraltı cezanı taş kırarak tamamladın! Ruhun arındı ve dünyaya dirildin.');
                    return { finished: true };
                }
                this.saveState();
                return { finished: false, remaining: this.state.ahiretDebt };
            } else {
                this.resurrectPlayer('Ruhun serbest bırakıldı!');
                return { finished: true };
            }
        }

        resurrectPlayer(message) {
            const p = this.state.player;
            p.hp = p.maxHp;
            p.energy = p.maxEnergy;
            this.state.ahiretDebt = 0;
            this.addChatMessage('DİRİLİŞ', message, 'system');
            if (window.GameAudio) window.GameAudio.playSfx('god_ascend');
            this.saveState();
            setTimeout(() => {
                this.teleportTo('mısır.html');
            }, 1000);
        }

        // ==========================================
        // GÖREV VE CANLI SOHBET SİSTEMİ
        // ==========================================
        updateQuestProgress(questId, amount) {
            const q = this.state.quests.find(item => item.id === questId);
            if (q && !q.done) {
                q.progress = Math.min(q.target, q.progress + amount);
                if (q.progress >= q.target) {
                    q.done = true;
                    this.addChatMessage('GÖREV TAMAMLANDI', `"${q.title}" görevini bitirdin! Ödül: ${q.reward}`, 'system');
                    this.gainExp(60);
                    
                    // Also update TutorialSystem if available
                    if (window.TutorialSystem) {
                        try {
                            window.TutorialSystem.updateQuestProgress(questId, amount);
                        } catch (e) {
                            console.warn('TutorialSystem update failed:', e);
                        }
                    }
                }
                this.saveState();
            }
        }

        addChatMessage(sender, text, type = 'player') {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            this.state.chatLog.push({ sender, text, type, time: timeStr });
            if (this.state.chatLog.length > 50) {
                this.state.chatLog.shift();
            }
            this.saveState();
        }

        // ==========================================
        // DİYARLAR ARASI IŞINLANMA / TELEPORT
        // ==========================================
        teleportTo(realmFileName) {
            this.saveState();
            try {
                if (window.parent && window.parent !== window && window.parent.switchActiveRealm) {
                    window.parent.switchActiveRealm(realmFileName);
                } else {
                    window.location.href = realmFileName;
                }
            } catch (e) {
                console.error('Teleportation error:', e);
                window.location.href = realmFileName;
            }
        }

        startEventLoop() {
            // Can yenilenmesi ve Gece/Gündüz döngüsü simülasyonu
            setInterval(() => {
                const p = this.state.player;
                if (p.hp > 0 && p.energy < p.maxEnergy) {
                    p.energy = Math.min(p.maxEnergy, p.energy + 2);
                }
                
                const ev = this.state.worldEvent;
                if (ev.nextNightCountdown > 0) {
                    ev.nextNightCountdown -= 1;
                    if (ev.nextNightCountdown === 0) {
                        ev.isNight = true;
                        this.addChatMessage('GÜNEŞ TUTULMASI', 'GECE BAŞLADI! Kaos Yılanı Apophis, Ra\'nın Güneş Gemisine saldırıyor! Dua bağışlayın!', 'god');
                    }
                }
                this.notify();
            }, 1000);
        }
    }

    window.GameState = new GameStateEngine();
})(window);
