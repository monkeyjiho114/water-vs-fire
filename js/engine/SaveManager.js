const SAVE_KEY = 'waterdrop_save';

export class SaveManager {
    constructor() {
        this.data = this._load();
    }

    _load() {
        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return { coins: 0, ownedBodySkins: ['default'], ownedBulletSkins: ['default'], activeBodySkin: 'default', activeBulletSkin: 'default' };
    }

    _save() {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
        } catch (e) {}
    }

    get coins() { return this.data.coins; }

    addCoins(amount) {
        this.data.coins += amount;
        this._save();
    }

    spendCoins(amount) {
        if (this.data.coins < amount) return false;
        this.data.coins -= amount;
        this._save();
        return true;
    }

    ownsBodySkin(id) { return this.data.ownedBodySkins.includes(id); }
    ownsBulletSkin(id) { return this.data.ownedBulletSkins.includes(id); }

    buyBodySkin(id, price) {
        if (this.ownsBodySkin(id)) return false;
        if (!this.spendCoins(price)) return false;
        this.data.ownedBodySkins.push(id);
        this._save();
        return true;
    }

    buyBulletSkin(id, price) {
        if (this.ownsBulletSkin(id)) return false;
        if (!this.spendCoins(price)) return false;
        this.data.ownedBulletSkins.push(id);
        this._save();
        return true;
    }

    get activeBodySkin() { return this.data.activeBodySkin; }
    get activeBulletSkin() { return this.data.activeBulletSkin; }

    setActiveBodySkin(id) {
        if (!this.ownsBodySkin(id)) return;
        this.data.activeBodySkin = id;
        this._save();
    }

    setActiveBulletSkin(id) {
        if (!this.ownsBulletSkin(id)) return;
        this.data.activeBulletSkin = id;
        this._save();
    }
}
