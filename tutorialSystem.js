/**
 * Gods of Egypt MMORPG - Tutorial & Quest System
 * Adım adım öğretici ve otomatik ilerleyen görev sistemi
 */

(function(window) {
    'use strict';

    // Tutorial Steps - Yeni oyuncular için adım adım rehber
    const TUTORIAL_STEPS = [
        {
            id: 'welcome',
            title: 'Mısır Tanrıları Dünyasına Hoş Geldin!',
            description: 'Ölümlü Bek olarak Nil nehri kıyısında uyanıyorsun. Set\'in zalim yönetimine karşı duracak mısın?',
            action: 'next',
            position: 'center',
            icon: 'player'
        },
        {
            id: 'movement',
            title: 'Hareket Et',
            description: 'Ekranın sol altındaki joystick veya WASD tuşları ile karakterini hareket ettir. Nil nehri kıyısında dolaş!',
            action: 'move_character',
            position: 'bottom-left',
            icon: 'map'
        },
        {
            id: 'resources',
            title: 'Kaynak Topla',
            description: 'E tuşuna basarak Nil\'den buğday ve papirüs topla. Bu kaynaklar obelisk inşaatı ve craft için gerekli.',
            action: 'collect_resources',
            position: 'bottom-right',
            icon: 'wheat'
        },
        {
            id: 'hud',
            title: 'HUD\'ı Keşfet',
            description: 'Sağ üstte kaynakların, sol üstte canın ve enerjin görünür. Bunları izle!',
            action: 'explore_hud',
            position: 'top',
            icon: 'inventory'
        },
        {
            id: 'quests',
            title: 'Görevleri Gör',
            description: 'Sağ alttaki "Görevler" butonuna tıkla ve mevcut görevleri incele.',
            action: 'open_quests',
            position: 'bottom-right',
            icon: 'quests'
        },
        {
            id: 'realms',
            title: 'Diyarlara Geç',
            description: 'Üstteki "HARİTA" butonuna tıklayarak farklı diyarlara (Saray, Tapınak, Ra\'nın Gemisi) geçiş yap.',
            action: 'open_realm_menu',
            position: 'top',
            icon: 'map'
        },
        {
            id: 'combat',
            title: 'Savaş ve Avcılık',
            description: 'Diyarlarda vahşi hayvanları avla veya Tanrıların savaşlarına katıl. Altın Kan toplayarak efsanevi silahlar üret!',
            action: 'try_combat',
            position: 'center',
            icon: 'attack'
        },
        {
            id: 'ascend',
            title: 'Tanrıya Yüksel',
            description: 'Horustapınak\'tan Horus\'un Gözü\'nü çalarak veya 50 İlahi Lütuf toplayarak Tanrı formuna yüksel!',
            action: 'open_ascend',
            position: 'bottom-right',
            icon: 'ascend'
        },
        {
            id: 'complete',
            title: 'Tutorial Tamamlandı!',
            description: 'Artık Nil\'in kahramanı olarak Set\'e karşı savaşa hazırsın! İyi şanslar, Bek!',
            action: 'finish',
            position: 'center',
            icon: 'sparkle'
        }
    ];

    // Quest Definitions - Detaylı görevler
    const QUEST_DEFINITIONS = [
        {
            id: 'tutorial_1',
            title: 'İlk Adımlar',
            category: 'main',
            description: 'Nil nehri kıyısında 5 buğday topla ve 3 kez hareket et.',
            objectives: [
                { id: 'move', description: 'Karakterini hareket ettir (3 adım)', target: 3, current: 0, type: 'move' },
                { id: 'harvest', description: 'Buğday topla (5 adet)', target: 5, current: 0, type: 'harvest_wheat' }
            ],
            rewards: { gold: 50, exp: 25, divineFavor: 5 },
            autoProgress: true,
            onComplete: 'Open next quest: Mining Basics'
        },
        {
            id: 'tutorial_2',
            title: 'Maden Temelleri',
            category: 'main',
            description: 'Çöl madeninde 3 bakır ve 5 taş çıkar.',
            objectives: [
                { id: 'mine_copper', description: 'Bakır çıkar (3 adet)', target: 3, current: 0, type: 'mine_copper' },
                { id: 'mine_stone', description: 'Taş çıkar (5 adet)', target: 5, current: 0, type: 'mine_stone' }
            ],
            rewards: { gold: 75, exp: 40, divineFavor: 8 },
            autoProgress: true,
            onComplete: 'Open next quest: Obelisk Contribution'
        },
        {
            id: 'tutorial_3',
            title: 'Obelisk Katkısı',
            category: 'main',
            description: 'Tanrıların dikilitaşına 10 taş ve 5 odun bağışla.',
            objectives: [
                { id: 'donate_stone', description: 'Taş bağışla (10 adet)', target: 10, current: 0, type: 'donate_stone' },
                { id: 'donate_wood', description: 'Odun bağışla (5 adet)', target: 5, current: 0, type: 'donate_wood' }
            ],
            rewards: { gold: 100, exp: 60, divineFavor: 15 },
            autoProgress: true,
            onComplete: 'Tutorial complete! Main story unlocked.'
        },
        {
            id: 'main_1',
            title: 'Timsah Avcısı',
            category: 'main',
            description: 'Nil\'de vahşi timsah avla ve 3 timsah derisi topla.',
            objectives: [
                { id: 'hunt_croc', description: 'Timsah avla (3 adet)', target: 3, current: 0, type: 'hunt_croc' }
            ],
            rewards: { gold: 150, exp: 80, divineFavor: 20, item: 'Timsah Zırhı' },
            autoProgress: true,
            prerequisite: 'tutorial_3'
        },
        {
            id: 'main_2',
            title: 'Tapınak Casusu',
            category: 'main',
            description: 'Horustapınak\'a sız ve tuzaklardan geçerek Horus\'un Gözü\'nü çal.',
            objectives: [
                { id: 'enter_temple', description: 'Tapınağa gir', target: 1, current: 0, type: 'enter_realm_horustapinak' },
                { id: 'survive_traps', description: '5 tuzaktan sağ çık', target: 5, current: 0, type: 'survive_trap' },
                { id: 'steal_eye', description: 'Horus\'un Gözü\'nü çal', target: 1, current: 0, type: 'steal_eye' }
            ],
            rewards: { gold: 500, exp: 200, divineFavor: 50, special: 'Tanrıya Yükseliş Gücü' },
            autoProgress: true,
            prerequisite: 'main_1'
        },
        {
            id: 'side_1',
            title: 'Köylü Yardımı',
            category: 'side',
            description: 'Köylülere 20 buğday dağıt.',
            objectives: [
                { id: 'donate_wheat', description: 'Buğday dağıt (20 adet)', target: 20, current: 0, type: 'donate_wheat' }
            ],
            rewards: { gold: 80, exp: 50, divineFavor: 25 },
            autoProgress: true
        },
        {
            id: 'side_2',
            title: 'Altın Kan Avcısı',
            category: 'side',
            description: 'Savaş alanından 5 damla Altın Kan topla.',
            objectives: [
                { id: 'collect_blood', description: 'Altın Kan topla (5 damla)', target: 5, current: 0, type: 'collect_golden_blood' }
            ],
            rewards: { gold: 300, exp: 150, divineFavor: 30, item: 'Altın Kan Kristali' },
            autoProgress: true,
            prerequisite: 'main_1'
        }
    ];

    class TutorialSystem {
        constructor() {
            this.currentStep = 0;
            this.completedSteps = [];
            this.activeQuests = [];
            this.completedQuests = [];
            this.isVisible = false;
            this.init();
        }

        init() {
            // Load tutorial progress
            const saved = localStorage.getItem('gods_of_egypt_tutorial_v1');
            if (saved) {
                const data = JSON.parse(saved);
                this.currentStep = data.currentStep || 0;
                this.completedSteps = data.completedSteps || [];
                this.completedQuests = data.completedQuests || [];
            }

            // Start with first quest
            this.startQuest('tutorial_1');
        }

        saveProgress() {
            localStorage.setItem('gods_of_egypt_tutorial_v1', JSON.stringify({
                currentStep: this.currentStep,
                completedSteps: this.completedSteps,
                completedQuests: this.completedQuests
            }));
        }

        getCurrentTutorialStep() {
            return TUTORIAL_STEPS[this.currentStep];
        }

        nextTutorialStep() {
            if (this.currentStep < TUTORIAL_STEPS.length - 1) {
                this.completedSteps.push(this.currentStep);
                this.currentStep++;
                this.saveProgress();
                this.showTutorialStep();
                return true;
            }
            return false;
        }

        skipTutorial() {
            this.currentStep = TUTORIAL_STEPS.length - 1;
            this.completedSteps = TUTORIAL_STEPS.map((_, i) => i);
            this.saveProgress();
            this.hideTutorial();
        }

        showTutorialStep() {
            const step = this.getCurrentTutorialStep();
            if (!step) return;

            this.isVisible = true;
            this.renderTutorialOverlay(step);
        }

        hideTutorial() {
            this.isVisible = false;
            const overlay = document.getElementById('tutorial-overlay');
            if (overlay) overlay.remove();
        }

        renderTutorialOverlay(step) {
            // Remove existing overlay
            const existing = document.getElementById('tutorial-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'tutorial-overlay';
            overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm';
            
            const iconHtml = typeof getIcon === 'function' ? getIcon(step.icon, 'large') : '';
            
            overlay.innerHTML = `
                <div class="hud-glass-gold max-w-lg w-full mx-4 p-6 rounded-3xl shadow-2xl border-2 border-amber-400 animate-fade-in">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="text-4xl text-amber-300">${iconHtml}</div>
                        <div class="flex-1">
                            <h3 class="hud-font-title text-xl font-black text-amber-100 mb-2">${step.title}</h3>
                            <p class="text-sm text-amber-200/90 leading-relaxed">${step.description}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between gap-3 mt-6">
                        <button onclick="window.TutorialSystem.skipTutorial()" class="action-pill-btn px-4 py-2 rounded-xl text-xs font-bold">
                            Atla
                        </button>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-amber-400/60">Adım ${this.currentStep + 1} / ${TUTORIAL_STEPS.length}</span>
                            <button onclick="window.TutorialSystem.nextTutorialStep()" class="gold-btn px-6 py-2 rounded-xl text-sm font-black flex items-center gap-2">
                                ${typeof getIcon === 'function' ? getIcon('arrowRight', 'normal') : ''}
                                <span>Devam Et</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
        }

        // Quest System
        startQuest(questId) {
            const questDef = QUEST_DEFINITIONS.find(q => q.id === questId);
            if (!questDef) return false;

            // Check prerequisite
            if (questDef.prerequisite && !this.completedQuests.includes(questDef.prerequisite)) {
                return false;
            }

            // Check if already active or completed
            if (this.activeQuests.find(q => q.id === questId) || this.completedQuests.includes(questId)) {
                return false;
            }

            const quest = {
                ...questDef,
                objectives: questDef.objectives.map(obj => ({ ...obj })),
                startedAt: Date.now()
            };

            this.activeQuests.push(quest);
            this.saveProgress();
            
            if (window.GameHUD) {
                window.GameHUD.showToast(`Yeni Görev Başladı: ${quest.title}`, 'gold');
            }

            return true;
        }

        updateQuestProgress(type, amount = 1) {
            let updated = false;

            this.activeQuests.forEach(quest => {
                quest.objectives.forEach(obj => {
                    if (obj.type === type && obj.current < obj.target) {
                        obj.current = Math.min(obj.current + amount, obj.target);
                        updated = true;

                        // Check if objective complete
                        if (obj.current >= obj.target) {
                            if (window.GameHUD) {
                                window.GameHUD.showToast(`${obj.description} tamamlandı!`, 'system');
                            }
                        }
                    }
                });

                // Check if quest complete
                if (this.isQuestComplete(quest)) {
                    this.completeQuest(quest.id);
                }
            });

            if (updated) {
                this.saveProgress();
                this.updateQuestTracker();
            }
        }

        isQuestComplete(quest) {
            return quest.objectives.every(obj => obj.current >= obj.target);
        }

        completeQuest(questId) {
            const questIndex = this.activeQuests.findIndex(q => q.id === questId);
            if (questIndex === -1) return;

            const quest = this.activeQuests[questIndex];
            
            // Give rewards
            if (window.GameState) {
                if (quest.rewards.gold) window.GameState.addResource('gold', quest.rewards.gold);
                if (quest.rewards.exp) window.GameState.gainExp(quest.rewards.exp);
                if (quest.rewards.divineFavor) {
                    window.GameState.state.player.divineFavor += quest.rewards.divineFavor;
                }
            }

            // Move to completed
            this.activeQuests.splice(questIndex, 1);
            this.completedQuests.push(questId);
            this.saveProgress();

            // Show completion message
            if (window.GameHUD) {
                let rewardText = '';
                if (quest.rewards.gold) rewardText += `${quest.rewards.gold} Altın, `;
                if (quest.rewards.exp) rewardText += `${quest.rewards.exp} XP, `;
                if (quest.rewards.divineFavor) rewardText += `${quest.rewards.divineFavor} İlahi Lütuf`;
                if (quest.rewards.item) rewardText += `, ${quest.rewards.item}`;
                
                window.GameHUD.showToast(`✨ Görev Tamamlandı: ${quest.title}! Ödül: ${rewardText}`, 'gold');
            }

            // Auto-start next quest if autoProgress enabled
            if (quest.autoProgress) {
                const nextQuest = QUEST_DEFINITIONS.find(q => q.prerequisite === questId);
                if (nextQuest) {
                    setTimeout(() => this.startQuest(nextQuest.id), 2000);
                }
            }

            this.updateQuestTracker();
        }

        getActiveQuests() {
            return this.activeQuests;
        }

        getCompletedQuests() {
            return this.completedQuests.map(id => QUEST_DEFINITIONS.find(q => q.id === id)).filter(Boolean);
        }

        updateQuestTracker() {
            // Update HUD quest tracker if exists
            const tracker = document.getElementById('quest-tracker');
            if (!tracker) return;

            const activeQuests = this.getActiveQuests();
            if (activeQuests.length === 0) {
                tracker.innerHTML = '<p class="text-xs text-amber-400/60">Aktif görev yok</p>';
                return;
            }

            tracker.innerHTML = activeQuests.map(quest => {
                const progress = quest.objectives.reduce((sum, obj) => sum + (obj.current / obj.target), 0) / quest.objectives.length * 100;
                return `
                    <div class="hud-glass p-2.5 rounded-xl mb-2 border border-amber-500/30">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-bold text-amber-200">${quest.title}</span>
                            <span class="text-[10px] text-amber-400 font-extrabold">${Math.round(progress)}%</span>
                        </div>
                        <div class="w-full bg-black/50 rounded-full h-1.5 overflow-hidden mb-1.5">
                            <div class="h-full bg-gradient-to-r from-amber-600 to-yellow-300 transition-all duration-300" style="width: ${progress}%"></div>
                        </div>
                        ${quest.objectives.map(obj => `
                            <div class="text-[10px] text-amber-300/80 mt-1 flex items-center justify-between gap-1">
                                <div class="flex items-center gap-1 overflow-hidden">
                                    <span class="${obj.current >= obj.target ? 'text-emerald-400 font-bold' : 'text-amber-400'}">${obj.current >= obj.target ? '✓' : '○'}</span>
                                    <span class="truncate ${obj.current >= obj.target ? 'line-through opacity-50' : ''}">${obj.description} (${obj.current}/${obj.target})</span>
                                </div>
                                ${obj.current < obj.target ? `
                                    <button onclick="window.EgyptGatheringEngine && window.EgyptGatheringEngine.startAutoQuest('${quest.id}', '${obj.type}', ${obj.target - obj.current})" class="mmo-auto-quest-btn text-[9px] px-2 py-0.5 rounded-md flex-shrink-0" title="Karakter otomatik olarak bu hedefe gitsin ve toplasın!">
                                        ⚡ OTO-GİT
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }).join('');
        }

        renderQuestModal() {
            const container = document.getElementById('mmo-modal-content');
            if (!container) return;

            const activeQuests = this.getActiveQuests();
            const availableQuests = QUEST_DEFINITIONS.filter(q => 
                !this.activeQuests.find(aq => aq.id === q.id) && 
                !this.completedQuests.includes(q.id) &&
                (!q.prerequisite || this.completedQuests.includes(q.prerequisite))
            );

            container.innerHTML = `
                <div class="flex items-center justify-between mb-4">
                    <h2 class="hud-font-title text-2xl font-black text-amber-100">Görevler</h2>
                    <button onclick="window.GameHUD.closeModal()" class="action-pill-btn px-3 py-1.5 rounded-xl text-xs font-bold">
                        ${typeof getIcon === 'function' ? getIcon('close', 'normal') : ''} Kapat
                    </button>
                </div>

                <div class="flex gap-2 mb-4">
                    <button onclick="window.TutorialSystem.showQuestTab('active')" class="action-pill-btn px-3 py-1.5 rounded-xl text-xs font-bold ${activeQuests.length > 0 ? 'border-amber-400' : ''}">
                        Aktif (${activeQuests.length})
                    </button>
                    <button onclick="window.TutorialSystem.showQuestTab('available')" class="action-pill-btn px-3 py-1.5 rounded-xl text-xs font-bold">
                        Mevcut (${availableQuests.length})
                    </button>
                    <button onclick="window.TutorialSystem.showQuestTab('completed')" class="action-pill-btn px-3 py-1.5 rounded-xl text-xs font-bold">
                        Tamamlanan (${this.completedQuests.length})
                    </button>
                </div>

                <div id="quest-list-content" class="flex flex-col gap-3 max-h-96 overflow-y-auto mmo-scroll">
                    ${this.renderActiveQuests(activeQuests)}
                </div>
            `;
        }

        renderActiveQuests(quests) {
            if (quests.length === 0) {
                return '<p class="text-center text-sm text-amber-400/60 py-8">Aktif görev yok. Mevcut görevleri görmek için "Mevcut" sekmesine tıkla.</p>';
            }

            return quests.map(quest => {
                const progress = quest.objectives.reduce((sum, obj) => sum + (obj.current / obj.target), 0) / quest.objectives.length * 100;
                const rewardText = Object.entries(quest.rewards)
                    .map(([key, val]) => {
                        if (key === 'gold') return `${val} Altın`;
                        if (key === 'exp') return `${val} XP`;
                        if (key === 'divineFavor') return `${val} İlahi Lütuf`;
                        if (key === 'item') return val;
                        return '';
                    })
                    .filter(Boolean)
                    .join(', ');

                return `
                    <div class="hud-glass p-4 rounded-2xl border border-amber-500/30">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <h3 class="font-black text-sm text-amber-100 mb-1">${quest.title}</h3>
                                <p class="text-xs text-amber-300/80">${quest.description}</p>
                            </div>
                            <span class="text-xs font-bold px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                ${Math.round(progress)}%
                            </span>
                        </div>
                        
                        <div class="w-full bg-black/50 rounded-full h-2 mb-3 overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-amber-600 to-yellow-300 transition-all duration-300" style="width: ${progress}%"></div>
                        </div>

                        <div class="space-y-1 mb-3">
                            ${quest.objectives.map(obj => `
                                <div class="text-xs text-amber-300/70 flex items-center gap-2">
                                    <span class="${obj.current >= obj.target ? 'text-emerald-400 font-bold' : 'text-amber-400'}">
                                        ${obj.current >= obj.target ? (typeof getIcon === 'function' ? getIcon('check', 'normal') : '✓') : '○'}
                                    </span>
                                    <span class="${obj.current >= obj.target ? 'line-through opacity-50' : ''}">${obj.description}</span>
                                    <span class="text-amber-400/60">(${obj.current}/${obj.target})</span>
                                </div>
                            `).join('')}
                        </div>

                        <div class="flex items-center justify-between pt-2.5 border-t border-amber-500/20">
                            <span class="text-[10px] text-amber-400/80">Ödül: ${rewardText}</span>
                            <button onclick="window.GameHUD.closeModal(); window.EgyptGatheringEngine && window.EgyptGatheringEngine.startAutoQuest('${quest.id}', '${quest.objectives[0] ? quest.objectives[0].type : 'harvest_wheat'}', 5);" class="mmo-auto-quest-btn">
                                🤖 OTO-GİT & KAS ⚡
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        showQuestTab(tab) {
            const content = document.getElementById('quest-list-content');
            if (!content) return;

            if (tab === 'active') {
                content.innerHTML = this.renderActiveQuests(this.getActiveQuests());
            } else if (tab === 'available') {
                const available = QUEST_DEFINITIONS.filter(q => 
                    !this.activeQuests.find(aq => aq.id === q.id) && 
                    !this.completedQuests.includes(q.id) &&
                    (!q.prerequisite || this.completedQuests.includes(q.prerequisite))
                );
                content.innerHTML = available.map(quest => `
                    <div class="hud-glass p-4 rounded-2xl border border-amber-500/30">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h3 class="font-black text-sm text-amber-100 mb-1">${quest.title}</h3>
                                <p class="text-xs text-amber-300/80">${quest.description}</p>
                            </div>
                            <span class="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                ${quest.category === 'main' ? 'Ana' : 'Yan'}
                            </span>
                        </div>
                        <button onclick="window.TutorialSystem.startQuest('${quest.id}'); window.TutorialSystem.renderQuestModal();" class="gold-btn w-full py-2 rounded-xl text-xs font-black mt-3">
                            Görevi Başlat
                        </button>
                    </div>
                `).join('') || '<p class="text-center text-sm text-amber-400/60 py-8">Mevcut görev yok.</p>';
            } else if (tab === 'completed') {
                const completed = this.getCompletedQuests();
                content.innerHTML = completed.map(quest => `
                    <div class="hud-glass p-4 rounded-2xl border border-emerald-500/30 opacity-70">
                        <div class="flex items-start justify-between mb-2">
                            <div>
                                <h3 class="font-black text-sm text-emerald-300 mb-1">${quest.title}</h3>
                                <p class="text-xs text-amber-300/60">${quest.description}</p>
                            </div>
                            <span class="text-[10px] px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                ✓ Tamamlandı
                            </span>
                        </div>
                    </div>
                `).join('') || '<p class="text-center text-sm text-amber-400/60 py-8">Henüz tamamlanan görev yok.</p>';
            }
        }
    }

    // Initialize
    window.TutorialSystem = new TutorialSystem();

    // Hook into game actions for auto-progress
    const originalAddResource = window.GameState?.addResource;
    if (originalAddResource) {
        window.GameState.addResource = function(resource, amount) {
            originalAddResource.call(this, resource, amount);
            
            // Map resources to quest objectives
            const resourceMap = {
                'wheat': 'harvest_wheat',
                'copper': 'mine_copper',
                'stone': 'mine_stone',
                'wood': 'donate_wood',
                'golden_blood': 'collect_golden_blood',
                'croc_hide': 'hunt_croc'
            };
            
            if (resourceMap[resource]) {
                window.TutorialSystem.updateQuestProgress(resourceMap[resource], amount);
            }
        };
    }

})(window);
